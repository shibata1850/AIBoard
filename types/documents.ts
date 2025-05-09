export interface BusinessDocument {
  id: string;
  title: string;
  content: string;
  fileType: string;
  createdAt: number;
  userId: string;
}

export interface DocumentAnalysis {
  id: string;
  documentId: string;
  analysisType: 'financial' | 'business' | 'strategy';
  content: string;
  createdAt: number;
  summary: string;
}
