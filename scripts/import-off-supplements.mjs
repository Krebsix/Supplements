/**
 * scripts/import-off-supplements.mjs
 * Massenimport von Nahrungsergaenzungsmitteln aus Open Food Facts
 * (Kategorie en:dietary-supplements, Laender DE/AT/CH) in
 * data/offProducts.json.
 *
 * Rechtsgrundlage und Pflichten: launch/odbl-recherche.md (ODbL 1.0,
 * getrennte Datei mit Attribution, keine Fotos). Die Eintraege sind
 * IDENTITAETSDATEN (Marke, Name, EAN, Kategorie) OHNE Wirkstoffmengen:
 * OFF-Naehrwertangaben sind bei Supplements oft je 100 g statt je
 * Tagesdosis, eine Uebernahme wuerde erfundene Werte erzeugen
 * (harte Projektregel). Mengen kommen weiterhin aus Scan, Barcode-
 * Live-Abruf oder Nutzereingabe.
 *
 * Qualitaetstor je Eintrag: gueltige EAN (8-14 Ziffern), Produktname,
 * Marke. Bestehende Eintraege (offProducts + seedProducts) gewinnen
 * bei EAN-Konflikt und werden nie ueberschrieben.
 *
 * Aufruf: node scripts/import-off-supplements.mjs
 * Politeness: sequenzielle Abfragen mit Pause, eigener User-Agent.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const offPath = path.join(repoRoot, 'data', 'offProducts.json');
const seedPath = path.join(repoRoot, 'data', 'seedProducts.json');

const ENDPOINT = 'https://search.openfoodfacts.org/search';
const USER_AGENT = 'MySuplea-Import/0.1 (n.krebsi@googlemail.com)';
const QUERY =
  'categories_tags:"en:dietary-supplements" AND countries_tags:("en:germany" OR "en:austria" OR "en:switzerland")';
const FIELDS = 'code,product_name,product_name_de,brands,categories_tags,countries_tags';
const PAGE_SIZE = 100;
const PAUSE_MS = 400;

const ATTRIBUTION_TEXT =
  'Open Food Facts, world.openfoodfacts.org, Open Database License (ODbL)';

// Grobe Kategorie aus den OFF-Tags; Reihenfolge = Prioritaet.
// Fallback ist bewusst generisch statt geraten.
const CATEGORY_BY_TAG = [
  ['en:vitamin-d', 'Vitamin D'],
  ['en:vitamin-c', 'Vitamin C'],
  ['en:vitamin-b12', 'Vitamin B12'],
  ['en:vitamins', 'Vitamine'],
  ['en:magnesium', 'Magnesium'],
  ['en:calcium', 'Calcium'],
  ['en:iron', 'Eisen'],
  ['en:zinc', 'Zink'],
  ['en:omega-3', 'Omega-3'],
  ['en:fish-oils', 'Omega-3'],
  ['en:probiotics', 'Probiotika'],
  ['en:protein-powders', 'Protein'],
  ['en:bodybuilding-supplements', 'Sport'],
  ['en:meal-replacements', 'Mahlzeitenersatz'],
  ['en:spirulina', 'Spirulina'],
  ['en:melatonin', 'Melatonin'],
  ['en:collagen', 'Kollagen'],
  ['en:creatine', 'Kreatin'],
];

function categoryFor(tags = []) {
  for (const [tag, label] of CATEGORY_BY_TAG) {
    if (tags.includes(tag)) return label;
  }
  return 'Nahrungsergänzung';
}

function countryFor(tags = []) {
  if (tags.includes('en:germany')) return 'DE';
  if (tags.includes('en:austria')) return 'AT';
  if (tags.includes('en:switzerland')) return 'CH';
  return null;
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toEntry(hit) {
  const ean = clean(hit.code);
  if (!/^[0-9]{8,14}$/.test(ean)) return null;

  const name = clean(hit.product_name_de) || clean(hit.product_name);
  const brand = Array.isArray(hit.brands) ? clean(hit.brands[0]) : '';
  const country = countryFor(hit.countries_tags);
  if (!name || !brand || !country) return null;

  return {
    brand,
    name,
    ean,
    category: categoryFor(hit.categories_tags),
    keyIngredients: [],
    off: true,
    source: `https://world.openfoodfacts.org/api/v2/product/${ean}.json`,
    country,
    channel: '',
    productClass: 'nem',
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(page) {
  const url = `${ENDPOINT}?q=${encodeURIComponent(QUERY)}&page_size=${PAGE_SIZE}&page=${page}&fields=${FIELDS}`;
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`Seite ${page}: HTTP ${response.status}`);
  return response.json();
}

const existingOff = JSON.parse(readFileSync(offPath, 'utf8'));
const seedProducts = JSON.parse(readFileSync(seedPath, 'utf8'));

const knownEans = new Set(
  [...existingOff.products, ...seedProducts]
    .map((entry) => String(entry.ean ?? ''))
    .filter(Boolean)
);

const imported = new Map();
let scanned = 0;
let skippedQuality = 0;

const first = await fetchPage(1);
const pageCount = Math.ceil((first.count ?? 0) / PAGE_SIZE);
console.log(`OFF meldet ${first.count} Treffer, ${pageCount} Seiten.`);

let pages = [first];
for (let page = 2; page <= pageCount; page += 1) {
  await sleep(PAUSE_MS);
  try {
    pages.push(await fetchPage(page));
    process.stdout.write(`\rSeite ${page}/${pageCount}`);
  } catch (error) {
    console.error(`\nAbbruch bei Seite ${page}: ${error.message}`);
    break;
  }
}
console.log('');

for (const data of pages) {
  for (const hit of data.hits ?? []) {
    scanned += 1;
    const entry = toEntry(hit);
    if (!entry) {
      skippedQuality += 1;
      continue;
    }
    if (knownEans.has(entry.ean) || imported.has(entry.ean)) continue;
    imported.set(entry.ean, entry);
  }
}

const mergedProducts = [...existingOff.products, ...imported.values()];

writeFileSync(
  offPath,
  `${JSON.stringify(
    {
      license: 'ODbL-1.0',
      attribution: ATTRIBUTION_TEXT,
      generatedAt: new Date().toISOString(),
      products: mergedProducts,
    },
    null,
    2
  )}\n`
);

console.log(`Gesichtet: ${scanned}`);
console.log(`Qualitaetstor nicht bestanden (EAN/Name/Marke/Land): ${skippedQuality}`);
console.log(`Neu importiert: ${imported.size}`);
console.log(`data/offProducts.json: ${mergedProducts.length} Eintraege gesamt.`);
