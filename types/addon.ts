import {metadata} from "../addons/gpt3-5/model"

export interface AddonModel {
  id: string;
  name: string;
  description: string;
  [key: string]: any
}


export type AddonModelID = string;


// in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
export const fallbackModelID = 'gpt3-5';

export const AndonModels: Record<AddonModelID, AddonModel> = {
 'gpt3-5': {
  id: 'gpt3-5',
  ...metadata,  
 }
};