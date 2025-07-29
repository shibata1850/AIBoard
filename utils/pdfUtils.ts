import { GoogleGenerativeAI } from '@google/generative-ai';
import { FinancialDataConverter } from './financialDataConverter';
import { ExtractedFinancialData } from '../types/financialStatements';
import { UnifiedFinancialExtractor, ExtractionResult } from './extractionService';

export async function extractTextFromPdf(base64Content: string): Promise<string> {
  console.log('Enhanced PDF processing: using table extraction + Gemini API for structured analysis');
  
  try {
    const structuredData = await extractStructuredFinancialData(base64Content);
    
    if (structuredData.extractionMetadata.confidence === 'high') {
      console.log('High-confidence structured data extraction successful');
      return JSON.stringify(structuredData, null, 2);
    } else {
      console.log('Medium/low confidence structured data, attempting UnifiedFinancialExtractor enhancement');
      const enhancedData = await enhanceWithUnifiedFinancialExtractor(base64Content);
      if (enhancedData) {
        console.log('UnifiedFinancialExtractor enhancement successful');
        return JSON.stringify(enhancedData, null, 2);
      } else {
        console.log('Falling back to Gemini text extraction');
        return await fallbackToGeminiExtraction(base64Content);
      }
    }
  } catch (error) {
    console.warn('Structured extraction failed, falling back to Gemini:', error);
    return await fallbackToGeminiExtraction(base64Content);
  }
}

export async function extractStructuredFinancialData(base64Content: string): Promise<ExtractedFinancialData> {
  console.log('Extracting structured financial data from PDF');
  
  try {
    const baseUrl = process.env.EXPO_PUBLIC_CHAT_API_BASE_URL || '';
    const apiUrl = baseUrl ? `${baseUrl}/api/extract-pdf-tables` : '/api/extract-pdf-tables';
    
    const response = await fetch(apiUrl, {
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
 * Extract specific financial items using the unified extractor
 * @param base64Content PDF content as base64 string
 * @param itemType Type of financial item to extract
 * @returns Promise<ExtractionResult>
 */
export async function extractSpecificFinancialItem(base64Content: string, itemType: string): Promise<ExtractionResult> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const extractor = new UnifiedFinancialExtractor(apiKey);
  
  switch (itemType) {
    case 'segment_profit_loss':
      return await extractor.extractSegmentProfitLoss(base64Content);
    case 'total_liabilities':
      return await extractor.extractTotalLiabilities(base64Content);
    case 'current_liabilities':
      return await extractor.extractCurrentLiabilities(base64Content);
    case 'ordinary_expenses':
      return await extractor.extractOrdinaryExpenses(base64Content);
    default:
      throw new Error(`Invalid itemType: ${itemType}`);
  }
}

/**
 * Check if a file is a PDF based on its MIME type
 * @param mimeType File MIME type
 * @returns Boolean indicating if the file is a PDF
 */
async function enhanceWithUnifiedFinancialExtractor(base64Content: string): Promise<ExtractedFinancialData | null> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Gemini API key not available for UnifiedFinancialExtractor');
      return null;
    }

    const extractor = new UnifiedFinancialExtractor(apiKey);
    console.log('Using UnifiedFinancialExtractor for PDF enhancement...');
    
    const [segmentResult, liabilitiesResult, currentLiabilitiesResult, expensesResult] = await Promise.allSettled([
      extractor.extractSegmentProfitLoss(base64Content),
      extractor.extractTotalLiabilities(base64Content),
      extractor.extractCurrentLiabilities(base64Content),
      extractor.extractOrdinaryExpenses(base64Content)
    ]);

    const statements = {
      貸借対照表: {
        資産の部: { 資産合計: 0, 流動資産: { 流動資産合計: 0 }, 固定資産: { 固定資産合計: 0 } },
        負債の部: { 
          負債合計: liabilitiesResult.status === 'fulfilled' ? liabilitiesResult.value.numericValue || 0 : 0,
          流動負債: { 流動負債合計: currentLiabilitiesResult.status === 'fulfilled' ? currentLiabilitiesResult.value.numericValue || 0 : 0 },
          固定負債: { 固定負債合計: 0 }
        },
        純資産の部: { 純資産合計: 0 }
      },
      損益計算書: {
        経常収益: { 経常収益合計: 0 },
        経常費用: { 経常費用合計: expensesResult.status === 'fulfilled' ? expensesResult.value.numericValue || 0 : 0 },
        経常利益: 0
      },
      キャッシュフロー計算書: {
        営業活動によるキャッシュフロー: { 営業活動によるキャッシュフロー合計: 0 },
        投資活動によるキャッシュフロー: { 投資活動によるキャッシュフロー合計: 0 },
        財務活動によるキャッシュフロー: { 財務活動によるキャッシュフロー合計: 0 },
        現金及び現金同等物の増減額: 0
      },
      セグメント情報: segmentResult.status === 'fulfilled' && segmentResult.value.success ? {
        附属病院: { 業務損益: segmentResult.value.numericValue }
      } : undefined
    };

    const ratios = {
      負債比率: 0,
      流動比率: 0,
      固定比率: 0,
      自己資本比率: 0
    };

    return {
      statements: statements as any,
      ratios,
      extractionMetadata: {
        extractedAt: new Date().toISOString(),
        tablesFound: 0,
        confidence: 'medium',
        warnings: ['Enhanced with UnifiedFinancialExtractor']
      }
    };
  } catch (error) {
    console.error('UnifiedFinancialExtractor enhancement failed:', error);
    return null;
  }
}

export function isPdfFile(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}
