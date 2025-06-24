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
  userId: string;
}

export interface AnalysisHistoryItem {
  id: string;
  documentId: string;
  documentTitle: string;
  analysisType: string;
  content: string;
  summary: string;
  createdAt: number;
  userId: string;
}
