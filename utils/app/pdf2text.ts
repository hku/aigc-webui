// pdfToText.ts
const pdfjs = require('pdfjs-dist/build/pdf');

const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import { getDocument } from 'pdfjs-dist';


function readFileSyncAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const buffer = event.target?.result as ArrayBuffer;
        resolve(buffer);
      };
  
      reader.onerror = (event: ProgressEvent<FileReader>) => {
        reject(reader.error);
      };
  
      reader.readAsArrayBuffer(file);
    });
  }



async function pdf2text(file: File): Promise<string> {
    const buffer = await readFileSyncAsArrayBuffer(file);
    const pdf = await getDocument(buffer).promise;

    const numPages = pdf.numPages;
    const texts: string[] = [];

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map(item => (item as {[key:string]: any}).str).join(' ');
        texts.push(text);
    }

    const  result = texts.join('\n\n')
    console.log(result)
    return result
}

export default pdf2text