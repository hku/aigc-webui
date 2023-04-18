import { MessageMetadata } from "@/types/chat";
import pdf2text from "@/utils/app/pdf2text";
import { tokenUtil } from "@/utils/app/tokenUtil";

export const metadata = {
    name: "fileloader-pdf",
    description: "loader of pdf file",
    fileTypes: ["pdf"]
}

export const load_content = async (file: File) => {

        let content = (await pdf2text(file)).trim();
    
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

