export type Language = 'en' | 'am';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  sources?: string[]; // Names of documents referenced
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  content: string;
  tokens: number; // Estimated token count
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface AppState {
  documents: UploadedDocument[];
  messages: Message[];
  isLoading: boolean;
  language: Language;
  modelConfig: {
    temperature: number;
    maxOutputTokens: number;
  };
}