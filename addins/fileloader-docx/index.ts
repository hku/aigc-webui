import { MessageMetadata } from "@/types/chat";
import { tokenUtil } from "@/utils/app/tokenUtil";

import * as mammoth from 'mammoth';

export const metadata = {
    name: "fileloader-docx",
    description: "loader of docx file",
    fileTypes: ["doc", "docx"]
}

export const load_content = async (file: File) => {

        let content = await handleFileUpload(file);

        if (!content) {
          return {content: '', metadata: {tokenCount: 0, fromFile: file.name}}
        }
  
        const metadata: MessageMetadata = {}
        if(tokenUtil.encoding) {
          const tokens = tokenUtil.encoding.encode(content)
          let tokenCount = tokens.length;
          metadata.tokenCount = tokenCount
          metadata.fromFile = file.name
        }
  
        content = `## ${file.name}\n\n${content}`

        return {content, metadata}
}


function htmlToText(html: string): string {
  const element = new DOMParser().parseFromString(html, 'text/html');
  return element.documentElement.textContent || '';
}

async function handleFileUpload(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      if (!event.target) {
        reject(new Error('FileReader event target not found.'));
        return;
      }

      const arrayBuffer = event.target.result as ArrayBuffer;
      try {
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const text = htmlToText(result.value);
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error occurred while reading the file.'));
    };

    reader.readAsArrayBuffer(file);
  });
}