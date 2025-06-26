import { GoogleGenerativeAI } from '@google/generative-ai';
import { FinancialDataConverter } from './financialDataConverter';
import { ExtractedFinancialData } from '../types/financialStatements';

export async function extractTextFromPdf(base64Content: string): Promise<string> {
  console.log('Enhanced PDF processing: using table extraction + Gemini API for structured analysis');
  
  try {
    const structuredData = await extractStructuredFinancialData(base64Content);
    
    if (structuredData.extractionMetadata.confidence === 'high') {
      console.log('High-confidence structured data extraction successful');
      return JSON.stringify(structuredData, null, 2);
    } else {
      console.log('Falling back to Gemini text extraction due to low confidence');
      return await fallbackToGeminiExtraction(base64Content);
    }
  } catch (error) {
    console.warn('Structured extraction failed, falling back to Gemini:', error);
    return await fallbackToGeminiExtraction(base64Content);
  }
}

export async function extractStructuredFinancialData(base64Content: string): Promise<ExtractedFinancialData> {
  console.log('Extracting structured financial data from PDF');
  
  try {
    const response = await fetch('/api/extract-pdf-tables', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Content })
    });

    if (!response.ok) {
      throw new Error(`Table extraction API failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.tables || result.tables.length === 0) {
      throw new Error('No tables extracted from PDF');
    }

    const tables = result.tables.map((tableResult: any) => tableResult.tables);
    const converter = new FinancialDataConverter(tables);
    const structuredData = converter.convertToStructuredData();

    console.log(`Structured data extraction successful: ${structuredData.extractionMetadata.tablesFound} tables processed`);
    return structuredData;
  } catch (error) {
    console.error('Error in structured financial data extraction:', error);
    throw error;
  }
}

async function fallbackToGeminiExtraction(base64Content: string): Promise<string> {
  const pdfData = base64Content.startsWith('data:application/pdf;base64,')
    ? base64Content.substring('data:application/pdf;base64,'.length)
    : base64Content;

  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `このPDFファイルからテキストを抽出してください。財務諸表、貸借対照表、損益計算書、キャッシュフロー計算書などの財務データが含まれている場合は、数値や項目名を正確に抽出してください。テキストのみを返してください。`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: pdfData,
        mimeType: "application/pdf"
      }
    }
  ]);

  const extractedText = result.response.text();
  console.log(`PDF text extraction via Gemini successful: ${extractedText.length} characters extracted`);

  if (!extractedText || extractedText.trim().length === 0) {
    throw new Error('PDFからテキストを抽出できませんでした。画像のみのPDFの可能性があります。');
  }

  return extractedText;
}

/**
 * Check if a file is a PDF based on its MIME type
 * @param mimeType File MIME type
 * @returns Boolean indicating if the file is a PDF
 */
export function isPdfFile(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}
