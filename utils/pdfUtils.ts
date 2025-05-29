import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getBestAvailableModel, getModelCapabilities, GeminiModel } from './modelCompatibility';
import { encodingFixes } from './encodingFixes';

const FILE_API_THRESHOLD_BYTES = 1 * 1024 * 1024;
const MAX_CONTENT_LENGTH = 100000; // Limit content length to avoid API limits

/**
 * Fix Japanese encoding issues in text
 * @param text Text with potential encoding issues
 * @returns Fixed text
 */
export function fixJapaneseEncoding(text: string): string {
  if (!text) return text;
  
  let fixedText = text;
  
  // Use imported encodingFixes object
  for (const [garbled, correct] of Object.entries(encodingFixes)) {
    const regex = new RegExp(escapeRegExp(garbled), 'g');
    fixedText = fixedText.replace(regex, correct);
  }
  
  // Additional character-level replacements for common encoding issues
  const charReplacements: Record<string, string> = {
    'ï¼š': '：',
    'ï¼‰': '）',
    'ï¼ˆ': '（',
    'ï¼Ž': '.',
    'ï¼›': ';',
    'ï¼»': '[',
    'ï¼½': ']',
    'ï¼＂': '"',
    'ï¼‚': '、',
    'ï¼＇': "'",
    'ï¼Œ': '，',
    'ï¼ƒ': '#',
    'ï¼＆': '&',
    'ï¼Ÿ': '?',
    'ï¼�': '@',
    'ï¼¥': '%',
    'ï¼¢': '+',
    'ï¼＝': '=',
    'ï¼＜': '<',
    'ï¼＞': '>',
    'ï¼¿': '_',
    'ï½€': '`',
    'ï½Š': '|',
    'ï½ž': '~',
    'ã€€': ' ', // Full-width space to normal space
  };
  
  for (const [garbled, correct] of Object.entries(charReplacements)) {
    const regex = new RegExp(escapeRegExp(garbled), 'g');
    fixedText = fixedText.replace(regex, correct);
  }
  
  return fixedText;
}

// Helper function to escape special characters in regex
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract text from PDF content
 * @param base64Content Base64 encoded PDF content
 * @returns Extracted text
 */
export async function extractTextFromPdf(base64Content: string): Promise<string> {
  try {
    // Convert base64 to buffer
    const pdfData = Buffer.from(base64Content, 'base64');
    
    // Check if the PDF is valid
    try {
      const pdfDoc = await PDFDocument.load(pdfData);
      const pageCount = pdfDoc.getPageCount();
      console.log(`PDF has ${pageCount} pages`);
    } catch (error) {
      console.error('Error loading PDF document:', error);
      throw new Error('無効なPDFファイルです。別のファイルを試してください。');
    }
    
    // Extract text using pdf-parse
    try {
      const data = await pdfParse(pdfData);
      
      // Fix Japanese encoding issues
      let extractedText = fixJapaneseEncoding(data.text);
      
      // Limit text length to avoid API limits
      if (extractedText.length > MAX_CONTENT_LENGTH) {
        console.log(`Truncating extracted text from ${extractedText.length} to ${MAX_CONTENT_LENGTH} characters`);
        extractedText = extractedText.substring(0, MAX_CONTENT_LENGTH);
      }
      
      return extractedText;
    } catch (error) {
      console.error('Error parsing PDF content:', error);
      
      // Try extracting text page by page as a fallback
      try {
        console.log('Attempting page-by-page extraction as fallback...');
        const pdfDoc = await PDFDocument.load(pdfData);
        const pageCount = pdfDoc.getPageCount();
        
        let allText = '';
        for (let i = 0; i < Math.min(pageCount, 10); i++) { // Limit to first 10 pages
          try {
            const pageData = await pdfParse(pdfData, { max: 1, pagerender: i });
            allText += pageData.text + '\n\n';
          } catch (pageError) {
            console.error(`Error extracting text from page ${i}:`, pageError);
          }
        }
        
        if (allText.trim().length === 0) {
          throw new Error('PDFからテキストを抽出できませんでした。');
        }
        
        // Fix Japanese encoding issues
        let extractedText = fixJapaneseEncoding(allText);
        
        // Limit text length to avoid API limits
        if (extractedText.length > MAX_CONTENT_LENGTH) {
          extractedText = extractedText.substring(0, MAX_CONTENT_LENGTH);
        }
        
        return extractedText;
      } catch (fallbackError) {
        console.error('Fallback extraction failed:', fallbackError);
        throw new Error('PDFからテキストを抽出できませんでした。別のファイルを試してください。');
      }
    }
  } catch (error) {
    console.error('Error in extractTextFromPdf:', error);
    throw error;
  }
}

/**
 * Check if a file is a PDF based on its MIME type
 */
export function isPdfFile(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

/**
 * Check if text contains financial content
 * @param text Text to check
 * @returns True if text contains financial content
 */
export function hasFinancialContent(text: string): boolean {
  if (!text || text.length < 50) return false;
  
  // Common financial terms in Japanese
  const financialTerms = [
    '売上', '利益', '資産', '負債', '純資産', '営業利益', '経常利益',
    '当期純利益', '貸借対照表', '損益計算書', '資本金', '利益剰余金',
    '自己資本比率', '流動比率', '売上高営業利益率'
  ];
  
  // Check if any financial term is present in the text
  for (const term of financialTerms) {
    if (text.includes(term)) {
      return true;
    }
  }
  
  // Check for numbers with currency symbols or percentage
  const hasFinancialNumbers = /(\d{1,3}(,\d{3})+|\d+)(円|%|％)/.test(text);
  
  return hasFinancialNumbers;
}

/**
 * Process PDF content with Gemini API
 * @param base64Content Base64 encoded PDF content
 * @param customPrompt Optional custom prompt to use instead of default
 * @returns Analysis result
 */
export async function processPdfWithGemini(
  base64Content: string,
  customPrompt?: string
): Promise<{ text: string; model: string }> {
  try {
    console.log('Processing PDF with Gemini API...');
    
    // Extract text from PDF
    const extractedText = await extractTextFromPdf(base64Content);
    console.log(`Extracted ${extractedText.length} characters from PDF`);
    
    // Limit text length for API
    const limitedText = extractedText.substring(0, MAX_CONTENT_LENGTH);
    
    // Create enhanced prompt for financial analysis
    const enhancedPrompt = customPrompt || `
あなたは財務アドバイザーAIです。以下の文書を分析し、財務状況を詳細に解説してください。

分析すべき点:
1. 主要な財務指標（売上高、営業利益、経常利益、当期純利益など）
2. 資産・負債・純資産の状況
3. 収益性（売上高営業利益率、ROA、ROEなど）
4. 安全性（流動比率、自己資本比率など）
5. 成長性（前年比増減など）

特に注目すべき点や改善点があれば指摘し、経営改善のためのアドバイスを提供してください。
数値データは表形式でまとめ、トレンドや比率も計算して示してください。

文書:
${limitedText}
`;
    
    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY || 
                  process.env.EXPO_PUBLIC_GEMINI_API_KEY || 
                  process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      throw new Error('APIキーが設定されていません。システム管理者にお問い合わせください。');
    }
    
    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to get the best available model for PDF processing
    try {
      console.log('Getting best available model for PDF processing...');
      const bestModelName = await getBestAvailableModel(true);
      console.log(`Using model: ${bestModelName}`);
      
      const model = genAI.getGenerativeModel({ 
        model: bestModelName,
        generationConfig: {
          temperature: 0.2,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      });
      
      console.log('Generating content with Gemini API...');
      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();
      
      return { text, model: bestModelName };
    } catch (error) {
      console.error('Error using best model:', error);
      console.log('Falling back to gemini-1.5-flash...');
      
      // Fallback to gemini-1.5-flash
      try {
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: {
            temperature: 0.2,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        });
        
        // Try alternative models if the first one fails
        const alternativeModels = [
          'gemini-1.5-flash',
          'gemini-1.0-pro',
          'gemini-pro'
        ];
        
        for (const modelName of alternativeModels) {
          try {
            if (await isModelAvailable(genAI, modelName)) {
              console.log(`Trying alternative model: ${modelName}`);
              const fallbackModel = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: {
                  temperature: 0.2,
                  topK: 32,
                  topP: 0.95,
                  maxOutputTokens: 4096,
                }
              });
              
              const result = await fallbackModel.generateContent(enhancedPrompt);
              const response = await result.response;
              const text = response.text();
              
              return { text, model: modelName };
            }
          } catch (modelError) {
            console.error(`Error with model ${modelName}:`, modelError);
          }
        }
        
        // Last resort: try with gemini-pro with simplified prompt
        console.log('Trying last resort with gemini-pro and simplified prompt...');
        const fallbackModel = genAI.getGenerativeModel({ 
          model: 'gemini-pro',
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          }
        });
        
        const simplifiedPrompt = `以下の文書を分析し、要点をまとめてください：\n\n${limitedText.substring(0, 10000)}`;
        
        const result = await fallbackModel.generateContent(simplifiedPrompt);
        const response = await result.response;
        const text = response.text();
        
        return { text, model: 'gemini-pro (simplified)' };
      } catch (fallbackError) {
        console.error('All fallback attempts failed:', fallbackError);
        throw new Error('PDFの分析中にエラーが発生しました。しばらく経ってからもう一度お試しください。');
      }
    }
  } catch (error) {
    console.error('Error in processPdfWithGemini:', error);
    throw error;
  }
}

/**
 * Check if a model is available
 * @param genAI GoogleGenerativeAI instance
 * @param modelName Model name to check
 * @returns True if model is available
 */
async function isModelAvailable(genAI: GoogleGenerativeAI, modelName: string): Promise<boolean> {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    await model.generateContent('test');
    return true;
  } catch (error) {
    console.error(`Model ${modelName} is not available:`, error);
    return false;
  }
}
