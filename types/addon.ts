export interface AddonModel {
  id: string;
  name: string;
  description: string;
}


export type AddonModelID = string;


// in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
export const fallbackModelID = 'gpt3-5';

export const AndonModels: Record<AddonModelID, AddonModel> = {
 'gpt3-5': {
  id: 'gpt3-5',
  name: 'gpt3.5-turbo',
  description: 'this is the model agent of openai gpt3.5-turbo'
 }
};