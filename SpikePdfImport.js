/**
 * SpikePdfImport.js
 * ─────────────────────────────────────────────────────────────
 * TEMPORAER — gehoert zum Machbarkeitstest aus
 * docs/superpowers/plans/2026-08-12-laborbefund-einlesen.md (Task 1).
 * Wird nach dem Test entweder geloescht oder zu LabReportText.js.
 *
 * Beantwortet die eine Frage, die sich nur auf einem echten Geraet klaeren
 * laesst: Laeuft pdfjs in der Hermes-Engine, oder scheitert es an fehlenden
 * Browser-Funktionen?
 *
 * In Node lief die Extraktion bereits, auch ohne DOMMatrix, Path2D und
 * Promise.withResolvers — die braucht nur das Rendering, nicht das Lesen.
 * Das Bundling klappt seit babel.config.js mit unstable_transformImportMeta.
 */

import * as FileSystem from 'expo-file-system/legacy';

const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Base64 zu Uint8Array, ohne sich auf atob zu verlassen: Ob das global
 * verfuegbar ist, unterscheidet sich zwischen RN-Versionen, und ein Spike
 * soll an der Frage scheitern, die er klaeren will, nicht an einer anderen.
 */
function base64ToBytes(base64) {
  const clean = String(base64).replace(/[^A-Za-z0-9+/]/g, '');
  const bytes = new Uint8Array((clean.length * 3) / 4 | 0);
  let byteIndex = 0;
  let buffer = 0;
  let bitsCollected = 0;

  for (const char of clean) {
    const value = BASE64_ALPHABET.indexOf(char);
    if (value < 0) continue;
    buffer = (buffer << 6) | value;
    bitsCollected += 6;
    if (bitsCollected >= 8) {
      bitsCollected -= 8;
      bytes[byteIndex++] = (buffer >> bitsCollected) & 0xff;
    }
  }
  return bytes.subarray(0, byteIndex);
}

/**
 * Zeilen aus den Positionsdaten rekonstruieren.
 *
 * DER ENTSCHEIDENDE PUNKT: getTextContent() liefert Textstuecke ohne jede
 * Zeilenstruktur. Wer sie einfach aneinanderhaengt, bekommt den ganzen
 * Befund als eine Zeile — und ein zeilenweise arbeitender Parser findet
 * darin nichts. Die y-Koordinate aus transform[5] stellt die Zeilen wieder
 * her, die x-Koordinate die Reihenfolge innerhalb einer Zeile.
 */
function itemsToLines(items) {
  const byLine = new Map();

  for (const item of items) {
    if (!item?.str?.trim()) continue;
    const y = Math.round(item.transform[5]);
    if (!byLine.has(y)) byLine.set(y, []);
    byLine.get(y).push({ x: item.transform[4], str: item.str });
  }

  return [...byLine.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, parts]) =>
      parts
        .sort((a, b) => a.x - b.x)
        .map((part) => part.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .join('\n');
}

export async function extractPdfText(uri) {
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
  const data = base64ToBytes(base64);

  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdf = await getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
    disableFontFace: true,
  }).promise;

  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const content = await (await pdf.getPage(pageNumber)).getTextContent();
    pages.push(itemsToLines(content.items));
  }
  return pages.join('\n');
}
