import { GoogleGenerativeAI } from '@google/generative-ai';

export async function extractTextFromPdf(base64Content: string): Promise<string> {
  console.log('Client-side PDF processing: using Gemini API for direct PDF analysis');
  
  try {
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
  } catch (error) {
    console.error('Error extracting text from PDF via Gemini:', error);
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
