
export enum AppMode {
  VISION = 'VISION',
  AION = 'AION'
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface GeminiResponse {
  text: string;
  error?: string;
}
