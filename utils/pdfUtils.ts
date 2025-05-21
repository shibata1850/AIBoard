import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    
    const binaryString = atob(pdfData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const pdfDoc = await PDFDocument.load(bytes);
    const pageCount = pdfDoc.getPageCount();
    
    const data = await pdfParse(Buffer.from(bytes));
    const extractedText = data.text;
    
    if (!extractedText || extractedText.trim().length === 0) {
      return `PDF文書が正常に読み込まれました。ページ数: ${pageCount}\n\n` +
             `注: このPDFからテキストを抽出できませんでした。` +
             `このPDFは画像ベースのスキャン文書である可能性があります。` +
             `財務諸表の分析のために、テキスト形式のデータを提供してください。`;
    }
    
    return extractedText;
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
    console.log(`Processing PDF with Gemini 2.0 Flash (content length: ${base64Content.length} chars)`);
    
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
        ? '以下の財務文書を分析し、財務状況、問題点、改善策を詳細に説明してください。特に重要な財務指標や傾向に注目してください：\n\n'
        : '以下の文書を分析し、主要なポイントと重要な情報を要約してください：\n\n';
      
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4';
      const genAI = new GoogleGenerativeAI(apiKey);
      
      try {
        console.log('Using text-based analysis with Gemini 2.0 Flash');
        
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.0-flash',
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
        
        console.log(`Successfully analyzed PDF text with gemini-2.0-flash (response length: ${text.length} chars)`);
        return text;
      } catch (error: any) {
        console.error('Error processing extracted text with Gemini 2.0 Flash:', error);
      }
    }
    
    const estimatedSizeBytes = base64Content.length * 0.75; // Base64 encoding increases size by ~33%
    const useFileApi = estimatedSizeBytes > FILE_API_THRESHOLD_BYTES;
    
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4';
    const genAI = new GoogleGenerativeAI(apiKey);
    
    try {
      console.log(`Using ${useFileApi ? 'File API' : 'direct processing'} for PDF analysis`);
      
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
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
      
      console.log(`Successfully analyzed PDF with gemini-2.0-flash (response length: ${text.length} chars)`);
      return text;
    } catch (error: any) {
      console.error('Error processing PDF with Gemini 2.0 Flash:', error);
      
      try {
        console.log('Falling back to gemini-1.5-flash model...');
        const fallbackModel = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: {
            temperature: 0.4,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 8192,
          },
        });
        
        const fallbackResult = await fallbackModel.generateContent([prompt, base64Content]);
        const fallbackResponse = await fallbackResult.response;
        const fallbackText = fallbackResponse.text();
        
        console.log(`Successfully analyzed PDF with gemini-1.5-flash (response length: ${fallbackText.length} chars)`);
        return fallbackText;
      } catch (fallbackError: any) {
        console.error('Error with fallback model:', fallbackError);
        
        if (extractedText && extractedText.length >= 50) {
          console.log('Using extracted text with regular analysis API...');
          const { analyzeDocument } = require('../utils/gemini');
          const analysisResult = await analyzeDocument(extractedText);
          return analysisResult;
        }
        
        throw new Error('すべての処理方法が失敗しました。別のPDFファイルを試してください。');
      }
    }
  } catch (error: any) {
    console.error('Error in processPdfWithGemini:', error);
    throw new Error(`PDF処理エラー: ${error.message}`);
  }
}
