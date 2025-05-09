import { DocumentAnalysis } from './documents';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  attachments?: Attachment[];
  analysis?: DocumentAnalysis;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  uri: string;
  size: number;
  content?: string; // For text-based documents
}

export interface ChatContext {
  messages: Message[];
  contextId: string;
  title?: string;
  lastUpdated: number;
  businessContext?: {
    documentIds: string[];
    analysisIds: string[];
  };
}

export interface ChatHistory {
  contexts: ChatContext[];
}
