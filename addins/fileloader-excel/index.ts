import { MessageMetadata } from "@/types/chat";
import { tokenUtil } from "@/utils/app/tokenUtil";

import * as XLSX from 'xlsx';

export const metadata = {
    name: "fileloader-excel",
    description: "loader of excel file",
    fileTypes: ["xls", "xlsx"]
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


function sheetToMarkdown(sheet: XLSX.WorkSheet): string {
  const headers: string[] = [];
  const data: string[][] = [];


  const range = sheet['!ref'];
  if (!range) return '';

  const [start, end] = range.split(':');
  
  const startCol = start.replace(/\d+/g, '');
  const endCol = end.replace(/\d+/g, '');
  const startRow = parseInt(start.replace(/\D+/g, ''));
  const endRow = parseInt(end.replace(/\D+/g, ''));

  const startCode = startCol.charCodeAt(0);
  const endCode = endCol.charCodeAt(0);
  
  for (let row = startRow; row <= endRow; row++) {
    const rowData: string[] = [];

    for (let colCode = startCode; colCode <= endCode; colCode++) {
      const col = String.fromCharCode(colCode)
      const cell = sheet[col + row];
      if (!cell) continue;

      if (row === startRow) {
        headers.push(cell.v);
      } else {
        rowData.push(cell.v);
      }
    }

    if (row !== startRow) data.push(rowData);
  }

  const headerMarkdown = '|' + headers.map((header) => ` ${header} `).join('|') + '|';
  const separator = '|' + headers.map(() => '----').join('|') + '|';

  const rowsMarkdown = data
    .map((row) =>
    '|' + row.map((cell) => `${cell} `).join('|') + '|'
    )
    .join('\n');




  const result = `${headerMarkdown}\n${separator}\n${rowsMarkdown}`;
  return result
}


async function handleFileUpload(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target) {
        reject(new Error('FileReader event target not found.'));
        return;
      }

      const data = new Uint8Array(event.target.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });

      const firstSheetName = workbook.SheetNames[0];
      const firstSheet = workbook.Sheets[firstSheetName];

      const markdown = sheetToMarkdown(firstSheet);
      resolve(markdown);
    };

    reader.onerror = () => {
      reject(new Error('Error occurred while reading the file.'));
    };

    reader.readAsArrayBuffer(file);
  });
}
