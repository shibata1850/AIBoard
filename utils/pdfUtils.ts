import { PDFDocument } from 'pdf-lib';

/**
 * Prepare PDF content for Gemini 2.5 Pro analysis
 * @param base64Content Base64 encoded PDF content
 * @returns Object with PDF data and metadata
 */
export async function preparePdfForAnalysis(base64Content: string): Promise<{
  base64Data: string;
  pageCount: number;
  isPrepared: boolean;
}> {
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
    
    const formattedBase64 = pdfData.startsWith('data:application/pdf;base64,')
      ? pdfData
      : `data:application/pdf;base64,${pdfData}`;
    
    return {
      base64Data: formattedBase64,
      pageCount,
      isPrepared: true
    };
  } catch (error) {
    console.error('Error preparing PDF for analysis:', error);
    throw new Error('PDFの準備中にエラーが発生しました。別のファイルを試してください。');
  }
}

/**
 * Legacy function for backward compatibility
 * @param base64Content Base64 encoded PDF content
 * @returns Promise with extracted text
 */
export async function extractTextFromPdf(base64Content: string): Promise<string> {
  try {
    const { pageCount } = await preparePdfForAnalysis(base64Content);
    
    return `PDF文書が正常に読み込まれました。ページ数: ${pageCount}\n\n` +
           `PDFの内容を分析しています。Gemini 2.5 Proモデルを使用して財務データを抽出します。`;
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
