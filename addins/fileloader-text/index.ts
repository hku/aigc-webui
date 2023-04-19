import { MessageMetadata } from "@/types/chat";
import { tokenUtil } from "@/utils/app/tokenUtil";


export const metadata = {
    name: "fileloader-text",
    description: "loader of text file",
    fileTypes: ["txt", "tex"]
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


function latexToText(latex: string): string {
  // Remove comments
  const noComments = latex.replace(/%.*$/gm, '');

  // Remove commands
  const noCommands = noComments.replace(/\\[A-Za-z]+/g, '');

  // Remove environments
  const noEnvironments = noCommands.replace(/\\begin\{[A-Za-z]+\}[\s\S]*?\\end\{[A-Za-z]+\}/g, '');

  // Remove curly braces and spaces
  const plainText = noEnvironments.replace(/[{}]+/g, '').replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim();

  return plainText;
}



async function handleFileUpload(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target) {
        reject(new Error('FileReader event target not found.'));
        return;
      }

      let text = event.target.result as string;

      if(file.name && file.name.split(".").slice(-1)[0] === "tex") {
        text = latexToText(text);

      }
      resolve(text);
    };

    reader.onerror = () => {
      reject(new Error('Error occurred while reading the file.'));
    };

    reader.readAsText(file);
  });
}