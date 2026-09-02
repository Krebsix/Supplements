/**
 * scripts/enrich-off-servings.mjs
 * Baustein 3 (docs/datenbank-ausbau-programm.md): Portionsmengen fuer
 * die importierten OFF-Produkte nachladen.
 *
 * Regeln (Programm, unverhandelbar):
 *   - NUR echte Portionswerte: nutrition_data_per === 'serving' →
 *     naehrstoff_value/_unit sind je Portion deklariert (amountBasis
 *     'per-serving').
 *   - Umrechnung 100g→Portion NUR bei eindeutiger Gramm-Portionsangabe
 *     (serving_size wie "3 g" oder "1,5g"); dann value_100g * g / 100,
 *     Rechenweg am Datensatz (amountBasis 'converted-from-100g',
 *     conversionNote mit den Zahlen). Sonst LUECKE, keine Schaetzung.
 *   - Nur leere keyIngredients werden gefuellt; bestehende Eintraege
 *     bleiben unangetastet.
 *
 * Aufruf: node scripts/enrich-off-servings.mjs
 * Abrufweg: OFF-Search-API mit Barcode-Liste, bis zu 100 Produkte je
 * Anfrage (statt 2.455 Einzelabrufe). Politeness: eine Anfrage alle
 * 6,5 Sekunden, unter dem OFF-Limit von 10 Suchanfragen/Minute;
 * eigener User-Agent, Platten-Cache je EAN unter ../.off-product-cache
 * (Wiederholungslaeufe ziehen nur Luecken).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const offPath = path.join(repoRoot, 'data', 'offProducts.json');
const CACHE_DIR = path.join(repoRoot, '..', '.off-product-cache');
mkdirSync(CACHE_DIR, { recursive: true });

const UA = 'MySuplea-Import/0.1 (n.krebsi@googlemail.com)';
const SEARCH_PAUSE_MS = 6500;
const CHUNK_SIZE = 100;
const FIELDS = 'code,nutrition_data_per,serving_size,nutriments';

// OFF-Naehrstoffschluessel → Etikettenname, den der SubstanceMatcher kennt.
const NUTRIENT_NAME = {
  'vitamin-a': 'Vitamin A',
  'vitamin-d': 'Vitamin D',
  'vitamin-e': 'Vitamin E',
  'vitamin-k': 'Vitamin K',
  'vitamin-c': 'Vitamin C',
  'vitamin-b1': 'Vitamin B1',
  'vitamin-b2': 'Vitamin B2',
  'vitamin-pp': 'Niacin',
  'vitamin-b6': 'Vitamin B6',
  'vitamin-b9': 'Folsäure',
  folates: 'Folsäure',
  'vitamin-b12': 'Vitamin B12',
  biotin: 'Biotin',
  'pantothenic-acid': 'Pantothensäure',
  magnesium: 'Magnesium',
  calcium: 'Calcium',
  iron: 'Eisen',
  zinc: 'Zink',
  potassium: 'Kalium',
  iodine: 'Jod',
  selenium: 'Selen',
  copper: 'Kupfer',
  manganese: 'Mangan',
  phosphorus: 'Phosphor',
  chromium: 'Chrom',
  molybdenum: 'Molybdän',
  'omega-3-fat': 'Omega-3',
  proteins: 'Protein',
};
const UNIT_MAP = { IU: 'IE', mcg: 'µg', ug: 'µg' };

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function cachePathFor(ean) {
  return path.join(CACHE_DIR, `${ean}.json`);
}

function readCachedProduct(ean) {
  const file = cachePathFor(ean);
  if (!existsSync(file)) return null;
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    return data?.product ?? null;
  } catch {
    return null;
  }
}

/**
 * Holt einen Block EANs ueber die Search-API. Liefert eine Map
 * EAN → Produktobjekt; nicht gelieferte Codes bleiben Luecke.
 * Bei 429 (Limit) und 503 (Server ueberlastet) wartet der Abruf mit
 * wachsendem Backoff und versucht es erneut (max. 5 Anlaeufe).
 */
async function fetchChunk(eans) {
  const url =
    `https://world.openfoodfacts.org/api/v2/search?code=${eans.join(',')}` +
    `&fields=${FIELDS}&page_size=${CHUNK_SIZE}`;
  let lastStatus = 0;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.status === 429 || res.status === 503) {
      lastStatus = res.status;
      await sleep(10_000 * attempt);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const byCode = new Map();
    for (const product of data?.products ?? []) {
      if (product?.code) byCode.set(String(product.code), product);
    }
    return byCode;
  }
  throw new Error(`HTTP ${lastStatus} (fuenf Anlaeufe)`);
}

// "3 g", "1,5g", "2.4 g" → Gramm als Zahl; alles andere → null.
function parseServingGrams(servingSize) {
  const m = String(servingSize ?? '').trim().match(/^(\d+(?:[.,]\d+)?)\s*g$/i);
  return m ? Number(m[1].replace(',', '.')) : null;
}

function round3(value) {
  return Math.round(value * 1000) / 1000;
}

function extractIngredients(product) {
  const n = product?.nutriments ?? {};
  const perServing = product?.nutrition_data_per === 'serving';
  const servingGrams = parseServingGrams(product?.serving_size);

  const out = [];
  for (const [key, name] of Object.entries(NUTRIENT_NAME)) {
    const unitRaw = n[`${key}_unit`];
    const unit = UNIT_MAP[unitRaw] ?? unitRaw;
    if (!unit) continue;

    if (perServing && Number.isFinite(n[`${key}_value`])) {
      out.push({ name, amount: String(round3(n[`${key}_value`])), unit });
      continue;
    }
    // Umrechnung nur bei eindeutiger Gramm-Portion; _value ist bei
    // nutrition_data_per '100g' der deklarierte Wert je 100 g.
    if (!perServing && servingGrams && Number.isFinite(n[`${key}_value`])) {
      out.push({
        name,
        amount: String(round3((n[`${key}_value`] * servingGrams) / 100)),
        unit,
        converted: true,
      });
    }
  }
  return { out, perServing, servingGrams };
}

function applyProduct(entry, product, counters) {
  const { out, perServing, servingGrams } = extractIngredients(product);
  if (out.length === 0) return;

  const hasConverted = out.some((item) => item.converted);
  entry.keyIngredients = out.map(({ name, amount, unit }) => ({ name, amount, unit }));
  entry.amountBasis = perServing ? 'per-serving' : 'converted-from-100g';
  if (hasConverted) {
    // Transparente Umrechnung (Programm-Regel 3): Rechenweg am Datensatz.
    entry.conversionNote = `Werte je 100 g laut OFF, umgerechnet auf die Portionsgröße ${servingGrams} g: Wert × ${servingGrams} / 100.`;
    counters.converted += 1;
  }
  counters.enriched += 1;
}

const off = JSON.parse(readFileSync(offPath, 'utf8'));
const counters = { enriched: 0, converted: 0, failed: 0 };

const pending = off.products.filter(
  (entry) => entry.off && (entry.keyIngredients ?? []).length === 0
);

// Erst den Platten-Cache leeren Herzens abarbeiten, dann nur die
// echten Luecken in 100er-Bloecken ueber die Search-API ziehen.
const uncached = [];
for (const entry of pending) {
  const cached = readCachedProduct(entry.ean);
  if (cached) {
    applyProduct(entry, cached, counters);
  } else {
    uncached.push(entry);
  }
}
console.log(
  `Ohne keyIngredients: ${pending.length}, davon aus Cache bedient: ${pending.length - uncached.length}`
);

for (let i = 0; i < uncached.length; i += CHUNK_SIZE) {
  const chunk = uncached.slice(i, i + CHUNK_SIZE);
  let byCode;
  try {
    byCode = await fetchChunk(chunk.map((entry) => entry.ean));
  } catch (error) {
    counters.failed += chunk.length;
    console.log(`Block ab ${i} fehlgeschlagen: ${error.message}`);
    await sleep(SEARCH_PAUSE_MS);
    continue;
  }
  for (const entry of chunk) {
    const product = byCode.get(String(entry.ean));
    // Cache je EAN im Format des Produkt-Endpunkts ({ product }), damit
    // Wiederholungslaeufe und der alte Einzelabruf-Weg ihn lesen koennen.
    writeFileSync(
      cachePathFor(entry.ean),
      JSON.stringify(product ? { product } : {})
    );
    if (product) applyProduct(entry, product, counters);
  }
  console.log(
    `Block ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(uncached.length / CHUNK_SIZE)}: ` +
      `${byCode.size} Treffer, angereichert bisher ${counters.enriched}`
  );
  await sleep(SEARCH_PAUSE_MS);
}

off.generatedAt = new Date().toISOString();
writeFileSync(offPath, `${JSON.stringify(off, null, 2)}\n`);
console.log(`Geprüft (ohne keyIngredients): ${pending.length}`);
console.log(
  `Angereichert: ${counters.enriched} (davon umgerechnet: ${counters.converted}), Abruf-Fehler: ${counters.failed}`
);
