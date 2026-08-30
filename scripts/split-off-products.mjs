/**
 * scripts/split-off-products.mjs
 * Trennt Open-Food-Facts-Eintraege (source unter world.openfoodfacts.org)
 * aus dem redaktionell gepflegten Katalog (data/seedProducts.json) heraus
 * in eine eigene, lizenzrechtlich gekennzeichnete Datei
 * (data/offProducts.json). Grund: seedProducts.json ist der kuratierte
 * Herstellerkatalog, OFF-Daten stehen unter der Open Database License
 * (ODbL) und muessen attribuiert und getrennt gefuehrt werden.
 *
 * Idempotent: ein zweiter Lauf ohne zwischenzeitliche Aenderungen an
 * seedProducts.json (z. B. weil die OFF-Eintraege bereits verschoben
 * sind) schreibt beide Dateien byteidentisch wieder heraus.
 *
 * Aufruf: npm run split:off
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const seedPath = path.join(repoRoot, 'data', 'seedProducts.json');
const offPath = path.join(repoRoot, 'data', 'offProducts.json');

const ATTRIBUTION_TEXT =
  'Open Food Facts, world.openfoodfacts.org, Open Database License (ODbL)';

function isOffEntry(entry) {
  return typeof entry.source === 'string' && entry.source.includes('world.openfoodfacts.org');
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

const seedProducts = JSON.parse(readFileSync(seedPath, 'utf8'));

const movingEntries = seedProducts.filter(isOffEntry);
const remainingEntries = seedProducts.filter((entry) => !isOffEntry(entry));

const existingOff = existsSync(offPath) ? JSON.parse(readFileSync(offPath, 'utf8')) : null;
const existingProducts = existingOff?.products ?? [];

// Zusammenfuehren nach EAN: bestehende Eintraege bleiben an ihrem Platz
// (Reihenfolge stabil), neu verschobene Eintraege werden angehaengt bzw.
// ersetzen einen bestehenden Eintrag mit gleicher EAN -- seedProducts.json
// ist dabei die aktuellere Quelle und gewinnt bei einem Konflikt.
const merged = new Map();
for (const entry of existingProducts) merged.set(entry.ean, entry);
for (const entry of movingEntries) merged.set(entry.ean, entry);
const mergedProducts = [...merged.values()];

// generatedAt nur erneuern, wenn sich die Produktliste inhaltlich
// veraendert hat. Sonst waere ein zweiter Lauf ohne neue OFF-Eintraege in
// seedProducts.json nicht idempotent, weil sich nur der Zeitstempel
// aendern wuerde.
const productsUnchanged =
  existingOff !== null && JSON.stringify(existingProducts) === JSON.stringify(mergedProducts);
const generatedAt = productsUnchanged ? existingOff.generatedAt : new Date().toISOString();

writeJson(offPath, {
  license: 'ODbL-1.0',
  attribution: ATTRIBUTION_TEXT,
  generatedAt,
  products: mergedProducts,
});
writeJson(seedPath, remainingEntries);

console.log(`${movingEntries.length} Eintraege aus seedProducts.json verschoben.`);
console.log(`data/seedProducts.json: ${remainingEntries.length} Eintraege verbleibend.`);
console.log(`data/offProducts.json: ${mergedProducts.length} Eintraege gesamt.`);
