import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFileSync } from 'node:fs';

const data = new Uint8Array(readFileSync('befund.pdf'));
const pdf = await getDocument({ data, useWorkerFetch: false, isEvalSupported: false }).promise;
const page = await pdf.getPage(1);
const content = await page.getTextContent();

console.log('--- Rohdaten der ersten Items ---');
for (const item of content.items.slice(0, 6)) {
  console.log(JSON.stringify({ str: item.str, y: item.transform[5], x: item.transform[4] }));
}

// Zeilen ueber die y-Koordinate rekonstruieren
const zeilen = new Map();
for (const item of content.items) {
  if (!item.str.trim()) continue;
  const y = Math.round(item.transform[5]);
  if (!zeilen.has(y)) zeilen.set(y, []);
  zeilen.get(y).push({ x: item.transform[4], str: item.str });
}
const text = [...zeilen.entries()]
  .sort((a, b) => b[0] - a[0])
  .map(([, items]) => items.sort((a, b) => a.x - b.x).map((i) => i.str).join(' ').replace(/\s+/g, ' ').trim())
  .join('\n');

console.log('\n--- rekonstruiert ---');
console.log(text);
