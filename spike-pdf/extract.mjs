import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFileSync } from 'node:fs';

const data = new Uint8Array(readFileSync('befund.pdf'));
const pdf = await getDocument({ data, useWorkerFetch: false, isEvalSupported: false }).promise;
let out = '';
for (let p = 1; p <= pdf.numPages; p++) {
  const content = await (await pdf.getPage(p)).getTextContent();
  out += content.items.map((i) => i.str).join(' ') + '\n';
}
console.log(JSON.stringify(out));
console.log('---lesbar---');
console.log(out);
