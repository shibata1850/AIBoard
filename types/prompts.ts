export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}

export interface PromptCategory {
  id: string;
  name: string;
}
