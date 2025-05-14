import { PDFDocument } from 'pdf-lib';

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
    
    return `PDF文書が正常に読み込まれました。ページ数: ${pageCount}\n\n` +
           `注: PDFからのテキスト抽出は現在制限されています。` +
           `財務諸表の分析のために、テキスト形式のデータを提供していただくか、` +
           `画像として含まれているテキストを手動で入力してください。`;
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
