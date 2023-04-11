import { AddonModel } from './addon';

export interface Prompt {
  id: string;
  name: string;
  description: string;
  content: string;
  model: AddonModel;
  folderId: string | null;
}
