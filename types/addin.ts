export interface AddinModifier {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface FileLoader {
  id: string;
  name: string;
  description: string;
  fileTypes: string[];
}



export type AddinModifierID = string;