import { OpenAIModel } from './openai';

export interface Message {
  role: Role;
  content: string;
}

export type Role = 'assistant' | 'user';

export interface ChatBody {
  model: OpenAIModel; //TODO: change to string or enum to represent addon keys
  key: string; //TODO: delete it
  messages: Message[];
  prompt: string;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  model: OpenAIModel;
  prompt: string;
  folderId: string | null;
}
