import { extractTextFromPdf, isPdfFile, hasFinancialContent } from '../../utils/pdfUtils';

jest.mock('pdf-lib', () => ({
  PDFDocument: {
    load: jest.fn().mockImplementation(() => Promise.resolve({
      getPageCount: jest.fn().mockReturnValue(5),
    })),
  },
}));

jest.mock('pdf-parse', () => 
  jest.fn().mockImplementation(() => Promise.resolve({
    text: 'Sample PDF content with 売上高, 利益, 資産 financial terms',
  }))
);

describe('PDF Utilities', () => {
  describe('isPdfFile', () => {
    it('correctly identifies PDF files', () => {
      expect(isPdfFile('application/pdf')).toBe(true);
      expect(isPdfFile('image/jpeg')).toBe(false);
      expect(isPdfFile('text/plain')).toBe(false);
    });
  });
  
  describe('extractTextFromPdf', () => {
    it('extracts text from PDF content', async () => {
      const base64Content = 'JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmls';
      const result = await extractTextFromPdf(base64Content);
      
      expect(result).toContain('Sample PDF content');
      expect(result).toContain('financial terms');
    });
    
    it('handles PDF extraction errors', async () => {
      require('pdf-parse').mockImplementationOnce(() => {
        throw new Error('PDF parsing failed');
      });
      
      await expect(extractTextFromPdf('invalid-content')).rejects.toThrow();
    });
  });
  
  describe('hasFinancialContent', () => {
    it('identifies text with financial content', () => {
      const financialText = '資産合計は1,000万円で、売上高は500万円、営業利益は100万円です。';
      expect(hasFinancialContent(financialText)).toBe(true);
    });
    
    it('rejects text without financial content', () => {
      const nonFinancialText = 'こんにちは、これはテストです。特に財務情報は含まれていません。';
      expect(hasFinancialContent(nonFinancialText)).toBe(false);
    });
    
    it('rejects empty or short text', () => {
      expect(hasFinancialContent('')).toBe(false);
      expect(hasFinancialContent('短いテキスト')).toBe(false);
    });
  });
});
