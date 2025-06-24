

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  attachments?: Attachment[];
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
