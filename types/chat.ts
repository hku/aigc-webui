import { AddinModifierID } from './addin';
import { AddonModel } from './addon';

export interface Message {
  role: Role;
  content: string;
}

export type Role = 'assistant' | 'user';

export interface ChatBody {
  addinId: AddinModifierID | null;
  model: AddonModel; //TODO: change to string or enum to represent addon keys
  messages: Message[];
  prompt: string;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  model: AddonModel;
  prompt: string;
  folderId: string | null;
}
