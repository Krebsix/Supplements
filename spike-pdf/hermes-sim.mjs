// Simuliert grob die Hermes-Umgebung: Browser-Globals wegnehmen und sehen,
// woran pdfjs bei REINER Textextraktion tatsaechlich scheitert.
// (Rendering braucht Canvas — Textextraktion vielleicht nicht.)
const entfernt = [];
for (const g of ['DOMMatrix', 'Path2D', 'OffscreenCanvas', 'ImageData', 'createImageBitmap']) {
  if (g in globalThis) { delete globalThis[g]; entfernt.push(g); }
}
// Hermes kennt Promise.withResolvers (ES2024) nicht
const hatteWithResolvers = typeof Promise.withResolvers === 'function';
delete Promise.withResolvers;

console.log('entfernt:', entfernt.join(', ') || '(keine vorhanden)');
console.log('Promise.withResolvers war vorhanden:', hatteWithResolvers, '-> jetzt entfernt');

try {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { readFileSync } = await import('node:fs');
  const data = new Uint8Array(readFileSync('befund.pdf'));
  const pdf = await getDocument({ data, useWorkerFetch: false, isEvalSupported: false }).promise;
  const content = await (await pdf.getPage(1)).getTextContent();
  console.log('\nERGEBNIS: Textextraktion lief durch.');
  console.log('Items:', content.items.length);
} catch (e) {
  console.log('\nERGEBNIS: gescheitert');
  console.log('Fehler:', e.message);
}
