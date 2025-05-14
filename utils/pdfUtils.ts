import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

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
    
    const loadingTask = pdfjsLib.getDocument({ data: bytes.buffer });
    const pdf = await loadingTask.promise;
    
    let extractedText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      extractedText += pageText + '\n';
    }
    
    return extractedText || '';
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
