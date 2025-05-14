import pdfParse from 'pdf-parse';

/**
 * Extract text from a PDF file
 * @param base64Content Base64 encoded PDF content
 * @returns Promise with extracted text
 */
export async function extractTextFromPdf(base64Content: string): Promise<string> {
  try {
    const buffer = Buffer.from(base64Content, 'base64');
    
    const data = await pdfParse(buffer);
    
    return data.text || '';
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('PDFからテキストを抽出できませんでした。別のファイルを試してください。');
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
