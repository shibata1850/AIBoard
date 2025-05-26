#!/bin/bash

cat > utils/pdfUtils.ts << 'EOL'
import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getBestAvailableModel, isModelAvailable, GeminiModel } from './modelCompatibility';

const FILE_API_THRESHOLD_BYTES = 1 * 1024 * 1024;
const MAX_CONTENT_LENGTH = 100000; // Limit content length to avoid API limits

/**
 * Extract text from a PDF file
 * @param base64Content Base64 encoded PDF content
 * @returns Promise with extracted text
 */
export async function extractTextFromPdf(base64Content: string): Promise<string> {
  try {
    const pdfData = base64Content.startsWith('data:application/pdf;base64,')
      ? base64Content.substring('data:application/pdf;base64,'.length)
      : base64Content;
    
    let bytes;
    try {
      const binaryString = atob(pdfData);
      bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
    } catch (error) {
      console.warn('Error in base64 decoding, trying Buffer method:', error);
      bytes = Buffer.from(pdfData, 'base64');
    }
    
    const pdfDoc = await PDFDocument.load(bytes);
    const pageCount = pdfDoc.getPageCount();
    
    try {
      const data = await pdfParse(Buffer.from(bytes), {
        max: 0, // 制限なし
        pagerender: undefined, // デフォルトのレンダラーを使用
      });
      
      let extractedText = data.text;
      
      extractedText = extractedText.replace(/\s+/g, ' ').trim();
      
      try {
        if (extractedText.includes('å') || extractedText.includes('ä‚') || extractedText.includes('ç')) {
          console.log('Detected encoding issues, attempting to fix...');
          
          const encodingFixes = {
            'å£†ä‚Ø«': '売上高',
            'å©ç': '利益',
            'è³‡ç£': '資産',
            'ä‚å': '万円',
            'å†…éƒ¨': '内部',
            'å¤–éƒ¨': '外部',
            'ç·å£²ä¸Š': '総売上',
            'ç²åˆ©': '粗利',
            'å–¶æ¥­åˆ©ç›Š': '営業利益',
            'ç´"åˆ©ç›Š': '純利益'
          };
          
          Object.entries(encodingFixes).forEach(([broken, fixed]) => {
            extractedText = extractedText.replace(new RegExp(broken, 'g'), fixed);
          });
          
          try {
            const decoded = decodeURIComponent(escape(extractedText));
            if (decoded.includes('売') || decoded.includes('利') || decoded.includes('資')) {
              console.log('Successfully decoded using UTF-8');
              extractedText = decoded;
            }
          } catch (decodeError) {
            console.warn('UTF-8 decoding failed:', decodeError);
          }
        }
      } catch (encodingError) {
        console.warn('Error fixing encoding:', encodingError);
      }
      
      extractedText = extractedText
        .replace(/å£†ä‚Ø«/g, '売上高')
        .replace(/å©ç/g, '利益')
        .replace(/è³‡ç£/g, '資産')
        .replace(/ä‚å/g, '万円');

      
      if (extractedText && extractedText.trim().length > 0) {
        console.log(`Successfully extracted ${extractedText.length} characters from PDF using standard method`);
        return extractedText;
      }
      
      console.warn('Standard PDF text extraction returned empty or very short text');
    } catch (parseError) {
      console.warn('Standard PDF parsing failed:', parseError);
    }
    
    console.log(`Attempting page-by-page extraction for ${pageCount} pages...`);
    let combinedText = '';
    
    for (let i = 0; i < pageCount; i++) {
      try {
        const pageBytes = await pdfDoc.save(); // 現在のページを含むPDFを保存
        const pageData = await pdfParse(Buffer.from(pageBytes), {
          max: 1,
          pagerender: undefined,
        });
        
        if (pageData.text && pageData.text.trim().length > 0) {
          let pageText = pageData.text.replace(/\s+/g, ' ').trim();
          
          try {
            if (pageText.includes('å') || pageText.includes('ä‚') || pageText.includes('ç')) {
              console.log('Detected encoding issues in page text, attempting to fix...');
              
              const encodingFixes = {
                'å£†ä‚Ø«': '売上高',
                'å©ç': '利益',
                'è³‡ç£': '資産',
                'ä‚å': '万円',
                'å†…éƒ¨': '内部',
                'å¤–éƒ¨': '外部',
                'ç·å£²ä¸Š': '総売上',
                'ç²åˆ©': '粗利',
                'å–¶æ¥­åˆ©ç›Š': '営業利益',
                'ç´"åˆ©ç›Š': '純利益'
              };
              
              Object.entries(encodingFixes).forEach(([broken, fixed]) => {
                pageText = pageText.replace(new RegExp(broken, 'g'), fixed);
              });
              
              try {
                const decoded = decodeURIComponent(escape(pageText));
                if (decoded.includes('売') || decoded.includes('利') || decoded.includes('資')) {
                  console.log('Successfully decoded page text using UTF-8');
                  pageText = decoded;
                }
              } catch (decodeError) {
                console.warn('UTF-8 decoding failed for page text:', decodeError);
              }
            }
          } catch (encodingError) {
            console.warn('Error fixing page text encoding:', encodingError);
          }
            
          combinedText += pageText + '\n\n';
          console.log(`Extracted ${pageData.text.length} characters from page ${i + 1}`);
        }
      } catch (pageError) {
        console.warn(`Error extracting text from page ${i + 1}:`, pageError);
      }
    }
    
    if (combinedText.trim().length > 0) {
      console.log(`Successfully extracted ${combinedText.length} characters using page-by-page method`);
      return combinedText;
    }
    
    return `PDF文書が正常に読み込まれました。ページ数: ${pageCount}\n\n` +
           `注: このPDFからテキストを抽出できませんでした。` +
           `このPDFは画像ベースのスキャン文書である可能性があります。` +
           `財務諸表の分析のために、テキスト形式のデータを提供してください。`;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('PDFの処理中にエラーが発生しました。別のファイルを試してください。');
  }
}

/**
 * Check if a file is a PDF based on its MIME type
 * @param mimeType File MIME type
 * @returns Boolean indicating if the file is a PDF
 */
export function isPdfFile(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

/**
 * Check if the extracted text contains valid financial content
 * @param text Extracted text from PDF
 * @returns Boolean indicating if the text contains financial content
 */
export function hasFinancialContent(text: string): boolean {
  if (!text || text.trim().length < 50) {
    return false;
  }
  
  const financialTerms = [
    '売上高', '利益', '営業利益', '経常利益', '当期純利益', 
    '資産', '負債', '純資産', '株主資本', '現金',
    '売掛金', '買掛金', '棚卸資産', '固定資産', '流動資産',
    '固定負債', '流動負債', '資本金', '利益剰余金', '配当',
    '財務諸表', '貸借対照表', '損益計算書', 'キャッシュフロー', '株式',
    '収益', '費用', '支出', '減価償却', '税金',
    '総資産', '自己資本比率', 'ROA', 'ROE', '売上高営業利益率'
  ];
  
  let foundTerms = 0;
  for (const term of financialTerms) {
    if (text.includes(term)) {
      foundTerms++;
      if (foundTerms >= 3) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Process PDF directly with Gemini 2.0 Flash
 * @param base64Content Base64 encoded PDF content
 * @param prompt Optional custom prompt to use with the PDF
 * @returns Promise with analysis text
 */
export async function processPdfWithGemini(
  base64Content: string, 
  prompt: string = '財務分析の専門家として、このPDFドキュメントを詳細に分析してください。財務状況、問題点、改善策を説明してください。'
): Promise<string> {
  try {
    console.log(`Processing PDF with Gemini API (content length: ${base64Content.length} chars)`);
    
    console.log('Extracting text from PDF first...');
    const extractedText = await extractTextFromPdf(base64Content);
    
    if (!extractedText || extractedText.length < 50) {
      console.warn('Failed to extract meaningful text from PDF');
      console.log('Falling back to direct PDF processing...');
    } else {
      console.log(`Successfully extracted text from PDF (${extractedText.length} chars)`);
      
      // Check if the extracted text contains financial content
      const isFinancial = hasFinancialContent(extractedText);
      console.log(`PDF contains financial content: ${isFinancial}`);
      
      const limitedText = extractedText.length > MAX_CONTENT_LENGTH 
        ? extractedText.substring(0, MAX_CONTENT_LENGTH) + '...(content truncated)'
        : extractedText;
      
      const enhancedPrompt = isFinancial 
        ? `
あなたは財務分析の専門家です。以下の財務文書を詳細に分析し、具体的な財務状況、問題点、改善策を説明してください。

分析すべき重要な点：
1. 売上高と利益率の推移
2. 財務健全性（負債比率、流動比率など）
3. 資金繰り状況
4. 経営効率（ROA、ROEなど）
5. キャッシュフローの状況

分析結果は以下の形式で出力してください：

[具体的な財務状況の説明]

[具体的な数値と説明]

[具体的な問題点の説明]

[具体的な改善策の提案]

[今後の見通しについての説明]
`
        : `
あなたは文書分析の専門家です。以下の文書を分析し、主要なポイントと重要な情報を要約してください。
文書の種類を特定し、その内容に応じた適切な分析を行ってください。

分析結果は以下の形式で出力してください：

[文書の種類の説明]

[主要なポイントの説明]

[重要な情報の説明]

[分析と考察の説明]
`;
      
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4';
      const genAI = new GoogleGenerativeAI(apiKey);
      
      try {
        console.log('Using text-based analysis with best available Gemini model');
        
        const textModelName = await getBestAvailableModel(apiKey, false);
        console.log(`Selected model for text analysis: ${textModelName}`);
        
        const model = genAI.getGenerativeModel({ 
          model: textModelName,
          generationConfig: {
            temperature: 0.4,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 8192,
          },
        });
        
        const result = await model.generateContent([enhancedPrompt, limitedText]);
        const response = await result.response;
        const text = response.text();
        
        console.log(`Successfully analyzed PDF text with ${textModelName} (response length: ${text.length} chars)`);
        return text;
      } catch (error: any) {
        console.error(`Error processing extracted text with Gemini API: ${error.message}`);
      }
    }
    
    const estimatedSizeBytes = base64Content.length * 0.75; // Base64 encoding increases size by ~33%
    const useFileApi = estimatedSizeBytes > FILE_API_THRESHOLD_BYTES;
    
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4';
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Initialize with a default model in case getBestAvailableModel fails
    let bestModelName: string = GeminiModel.GEMINI_1_5_FLASH;
    
    try {
      console.log(`Using ${useFileApi ? 'File API' : 'direct processing'} for PDF analysis`);
      
      bestModelName = await getBestAvailableModel(apiKey, true);
      console.log(`Selected model for PDF analysis: ${bestModelName}`);
      
      const model = genAI.getGenerativeModel({ 
        model: bestModelName,
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });
      
      let result;
      
      if (useFileApi) {
        console.warn('File API not supported in current version, falling back to direct processing');
        result = await model.generateContent([prompt, base64Content]);
      } else {
        result = await model.generateContent([prompt, base64Content]);
      }
      
      const response = await result.response;
      const text = response.text();
      
      console.log(`Successfully analyzed PDF with ${bestModelName} (response length: ${text.length} chars)`);
      return text;
    } catch (error: any) {
      console.error(`Error processing PDF with ${bestModelName}:`, error);
      
      try {
        console.log('Primary model failed, trying alternative models...');
        
        const alternativeModels = [
          GeminiModel.GEMINI_1_5_FLASH,
          GeminiModel.GEMINI_1_5_PRO,
          GeminiModel.GEMINI_2_FLASH
        ].filter(m => m !== bestModelName);
        
        console.log(`Trying alternative models: ${alternativeModels.join(', ')}`);
        
        let fallbackModel = null;
        let fallbackModelName = null;
        
        for (const altModel of alternativeModels) {
          try {
            console.log(`Trying alternative model: ${altModel}`);
            const isAvailable = await isModelAvailable(apiKey, altModel);
            
            if (isAvailable) {
              fallbackModelName = altModel;
              fallbackModel = genAI.getGenerativeModel({ 
                model: fallbackModelName,
                generationConfig: {
                  temperature: 0.4,
                  topP: 0.8,
                  topK: 40,
                  maxOutputTokens: 8192,
                },
              });
              console.log(`Using alternative model: ${fallbackModelName}`);
              break;
            }
          } catch (altModelError) {
            console.warn(`Error with alternative model ${altModel}:`, altModelError);
          }
        }
        
        if (!fallbackModel) {
          console.warn('No alternative models available, using gemini-1.5-flash as last resort');
          fallbackModelName = GeminiModel.GEMINI_1_5_FLASH;
          fallbackModel = genAI.getGenerativeModel({ 
            model: fallbackModelName,
            generationConfig: {
              temperature: 0.4,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 8192,
            },
          });
        }
        
        const fallbackResult = await fallbackModel.generateContent([prompt, base64Content]);
        const fallbackResponse = await fallbackResult.response;
        const fallbackText = fallbackResponse.text();
        
        console.log(`Successfully analyzed PDF with ${fallbackModelName} (response length: ${fallbackText.length} chars)`);
        return fallbackText;
      } catch (fallbackError: any) {
        console.error('Error with fallback model:', fallbackError);
        
        console.log('Using extracted text with regular analysis API...');
        const { analyzeDocument } = require('../utils/gemini');
        const analysisResult = await analyzeDocument(extractedText);
        return analysisResult;
      }
    }
  } catch (error: any) {
    console.error('Error in processPdfWithGemini:', error);
    throw new Error(`PDF処理エラー: ${error.message}`);
  }
}
EOL

echo "Fixed model integration in pdfUtils.ts"
