/**
 * scripts/import-dsld.mjs
 * Import aus der NIH Dietary Supplement Label Database (DSLD) in den
 * geteilten Produkt-Cache (public.product_cache) — als Seed-Migration.
 *
 * Warum DSLD: Etikettendaten des US-Markts MIT Wirkstoffmengen je
 * Portion, als Werk der US-Bundesbehoerden public domain (Baustein 4,
 * docs/datenbank-ausbau-programm.md). DACH-Nutzerinnen kaufen diese
 * Produkte online (iHerb, Amazon); der Barcode-Scan findet sie damit
 * sofort, statt eine kostenpflichtige Foto-Analyse zu brauchen.
 *
 * Regeln:
 *   - Nur On-Market-Produkte (offMarket=0) kuratierter Top-Marken.
 *   - Nur Labels mit gueltigem UPC und mindestens einer Zutat mit
 *     Menge+Einheit je Portion. Keine erfundenen Werte: Was das Label
 *     nicht traegt, bleibt leer.
 *   - Mengen sind "je Portion (Serving)" — der Hinweis steht in jedem
 *     Eintrag in den uncertainties, sichtbar im Pruef-Screen.
 *   - Je Produkt zwei Cache-Zeilen (de, en): die Edge Function filtert
 *     exakt nach Sprache.
 *   - Barcode-Normalisierung exakt wie BarcodeLookup.extractProductCode:
 *     Ziffern extrahieren, fuehrende Nullen bis auf 8 Stellen entfernen.
 *
 * Aufruf: node scripts/import-dsld.mjs
 * Ergebnis: supabase/migrations/<ts>_seed_product_cache_dsld_w1.sql
 * Danach: supabase db push --linked
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.ods.od.nih.gov/dsld/v9';
const UA = 'MySuplea-Import/0.1 (n.krebsi@googlemail.com)';
const PAUSE_MS = 400;
const MAX_PRODUCTS = 2500;
// Label-Zwischenspeicher: Wiederholungslaeufe ziehen nur, was fehlt.
// Lehre aus Lauf 2 (2026-09-02): Rate-Limits liessen 682 von 855
// Label-Abrufen still scheitern, der catch zaehlte sie als "verworfen".
const CACHE_DIR = process.env.DSLD_CACHE_DIR
  ?? path.join(repoRoot, '..', '.dsld-label-cache');
mkdirSync(CACHE_DIR, { recursive: true });

// DACH-online-relevante US-Marken (iHerb/Amazon-Sortiment).
const BRANDS = [
  'NOW Foods', 'Solgar', "Doctor's Best", 'Life Extension',
  'Jarrow Formulas', 'Thorne', 'Pure Encapsulations', 'Garden of Life',
  'Natrol', "Nature's Way", 'Swanson', 'Solaray',
  'California Gold Nutrition', 'Nordic Naturals', 'Optimum Nutrition',
  'Carlson', 'Bluebonnet', 'Source Naturals', 'Sports Research',
  'Country Life',
];

const UNIT_DE = {
  'Capsule(s)': 'Kapsel', 'Vegetarian Capsule(s)': 'Kapsel', 'Softgel(s)': 'Kapsel',
  'Tablet(s)': 'Tablette', 'Gummy(ies)': 'Gummi', 'Scoop(s)': 'Messlöffel',
  'mL': 'ml', 'Drop(s)': 'Tropfen', 'Lozenge(s)': 'Lutschtablette',
  'Packet(s)': 'Beutel', 'Gram(s)': 'g', 'Teaspoon(s)': 'Teelöffel',
};

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function getJson(url) {
  // Bis zu 4 Versuche mit wachsendem Backoff; 429/5xx sind bei der
  // DSLD-API nach laengeren Laeufen normal.
  let lastError;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (attempt > 0) await sleep(3000 * attempt);
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status}: ${url}`);
        continue;
      }
      return res.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

// Label mit Platten-Cache: einmal geholt, nie wieder gezogen.
async function getLabel(id) {
  const cachePath = path.join(CACHE_DIR, `${id}.json`);
  if (existsSync(cachePath)) {
    return JSON.parse(readFileSync(cachePath, 'utf8'));
  }
  const label = await getJson(`${API}/label/${id}`);
  writeFileSync(cachePath, JSON.stringify(label));
  return label;
}

// Exakt die App-Normalisierung (BarcodeLookup.extractProductCode).
function normalizeUpc(raw) {
  let code = String(raw ?? '').replace(/[^0-9]/g, '');
  if (code.length < 6 || code.length > 14) return '';
  while (code.length > 8 && code.startsWith('0')) code = code.slice(1);
  return code;
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

// Makro-/Naehrwertzeilen, die keine Supplement-Wirkstoffe sind: raus,
// sie wuerden den Pruef-Screen nur zumuellen und matchen nie.
const EXCLUDED_ROWS = new Set([
  'calories', 'total calories', 'calories from fat',
  'total carbohydrates', 'total carbohydrate', 'carbohydrates',
  'sugar', 'sugars', 'total sugars', 'added sugars',
  'total fat', 'saturated fat', 'trans fat', 'cholesterol',
  'dietary fiber',
]);

// DSLD-Einheiten auf die Formate mappen, die SubstanceMatcher/
// parseAmount kennen. Unbekannte Einheiten bleiben unveraendert
// (ehrlich statt geraten).
const INGREDIENT_UNIT = {
  'Gram(s)': 'g',
  'Milligram(s)': 'mg',
  'Microgram(s)': 'µg',
  'mcg': 'µg',
  'IU': 'IE',
  'Milliliter(s)': 'ml',
  'NE': 'mg NE',
  'DFE': 'µg DFE',
  'RAE': 'µg RAE',
  'Billion CFU': 'Mrd. KBE',
  'Million CFU': 'Mio. KBE',
};

// Zutatenzeilen: nur Top-Level-Rows mit Menge+Einheit der ersten
// Portionsgroesse. Blend-Unterzeilen (nestedRows) bewusst nicht — deren
// Mengen sind oft nicht deklariert.
function mapIngredients(label) {
  const rows = Array.isArray(label.ingredientRows) ? label.ingredientRows : [];
  const out = [];
  for (const row of rows) {
    const name = String(row.name ?? '').trim();
    if (!name || EXCLUDED_ROWS.has(name.toLowerCase())) continue;
    const q = Array.isArray(row.quantity)
      ? row.quantity.find((entry) => entry.servingSizeOrder === 1) ?? row.quantity[0]
      : null;
    if (!q || typeof q.quantity !== 'number' || !q.unit) continue;
    const rawUnit = String(q.unit).trim();
    const form = Array.isArray(row.forms) && row.forms.length > 0
      ? row.forms.map((f) => f.name).filter(Boolean).join(', ') || null
      : null;
    out.push({
      name,
      form,
      amount: String(q.quantity),
      unit: INGREDIENT_UNIT[rawUnit] ?? rawUnit,
    });
  }
  return out;
}

function buildResult(label, ingredients, language) {
  const serving = Array.isArray(label.servingSizes) ? label.servingSizes[0] : null;
  const servingUnit = serving ? (UNIT_DE[serving.unit] ?? String(serving.unit ?? '').trim()) : null;
  const uncertainty = language === 'de'
    ? 'Aus der NIH Dietary Supplement Label Database (DSLD, public domain, US-Etikett). Mengen gelten je Portion (Serving). Nicht vom Etikett gelesen; Angaben vor Übernahme prüfen.'
    : 'From the NIH Dietary Supplement Label Database (DSLD, public domain, US label). Amounts are per serving. Not read from the label; check the values before adopting them.';
  return {
    productName: String(label.fullName ?? '').trim(),
    brand: String(label.brandName ?? '').trim(),
    confidence: 0,
    ingredients,
    dosage: serving && typeof serving.minQuantity === 'number'
      ? { amount: String(serving.minQuantity), unit: servingUnit }
      : { amount: null, unit: null },
    intakeInstruction: null,
    warnings: [],
    uncertainties: [uncertainty],
    certifications: [],
    dsldId: String(label.id ?? ''),
  };
}

// 1) Kandidaten-IDs je Marke ueber die Suche einsammeln.
const ids = new Map(); // id -> brand
for (const brand of BRANDS) {
  let from = 0;
  let total = Infinity;
  let kept = 0;
  while (from < total && from < 3000) {
    const data = await getJson(
      `${API}/search-filter?q=${encodeURIComponent(`"${brand}"`)}&size=100&from=${from}`
    );
    total = data?.total?.value ?? 0;
    const hits = data?.hits ?? [];
    if (hits.length === 0) break;
    for (const hit of hits) {
      const src = hit._source ?? {};
      if (src.offMarket !== 0) continue;
      const name = String(src.brandName ?? '').toLowerCase();
      if (name !== brand.toLowerCase()) continue;
      if (!ids.has(hit._id)) { ids.set(hit._id, brand); kept += 1; }
    }
    from += 100;
    await sleep(PAUSE_MS);
  }
  console.log(`${brand}: ${kept} On-Market-Kandidaten`);
}
console.log(`Kandidaten gesamt: ${ids.size}`);

// 2) Label-Details holen, filtern, Zeilen bauen.
const rows = [];
let fetched = 0;
let skippedQuality = 0;
let failed = 0;
for (const [id] of ids) {
  if (rows.length >= MAX_PRODUCTS) break;
  let label;
  try {
    label = await getLabel(id);
  } catch (error) {
    failed += 1;
    console.error(`Label ${id} endgueltig fehlgeschlagen: ${error.message}`);
    continue;
  } finally {
    fetched += 1;
    if (fetched % 100 === 0) {
      console.log(`Labels: ${fetched}/${ids.size}, uebernommen: ${rows.length}, fehlgeschlagen: ${failed}`);
    }
    await sleep(PAUSE_MS);
  }
  if (label.offMarket) { skippedQuality += 1; continue; }
  const barcode = normalizeUpc(label.upcSku);
  if (!barcode) { skippedQuality += 1; continue; }
  const ingredients = mapIngredients(label);
  if (ingredients.length === 0) { skippedQuality += 1; continue; }
  rows.push({ barcode, label, ingredients });
}
console.log(
  `Labels gesamt: ${fetched}, uebernommen: ${rows.length}, Qualitaet verworfen: ${skippedQuality}, Abruf fehlgeschlagen: ${failed}`
);
if (failed > 0) {
  console.error(`WARNUNG: ${failed} Labels nicht abrufbar. Erneuter Lauf ergaenzt sie (Platten-Cache).`);
}

// Duplikate nach Barcode (verschiedene Label-Versionen desselben UPC).
const byBarcode = new Map();
for (const row of rows) {
  if (!byBarcode.has(row.barcode)) byBarcode.set(row.barcode, row);
}

// 3) Seed-Migration schreiben (chunked, on conflict do nothing).
// Wellen-Logik: Barcodes aus frueheren dsld-Migrationen werden
// uebersprungen, damit jede Welle nur ihr Delta traegt (die alten
// Migrationen sind bereits deployt und duerfen sich nicht aendern).
import('node:fs').then(() => {});
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations');
const { readdirSync } = await import('node:fs');
const alreadySeeded = new Set();
for (const file of readdirSync(migrationsDir)) {
  if (!/_seed_product_cache_dsld_w\d+\.sql$/.test(file)) continue;
  const sql = readFileSync(path.join(migrationsDir, file), 'utf8');
  for (const m of sql.matchAll(/^\('(\d+)', 'de'/gm)) alreadySeeded.add(m[1]);
}
const wave = process.env.DSLD_WAVE ?? 'w1';
const stamp = process.env.DSLD_STAMP ?? '20260902090000';
const outPath = path.join(migrationsDir, `${stamp}_seed_product_cache_dsld_${wave}.sql`);
const newProducts = [...byBarcode.values()].filter(({ barcode }) => !alreadySeeded.has(barcode));
console.log(`Bereits deployt: ${alreadySeeded.size}, neu in dieser Welle: ${newProducts.length}`);
if (newProducts.length === 0) {
  console.log('Nichts Neues; keine Migration geschrieben.');
  process.exit(0);
}
const values = [];
for (const { barcode, label, ingredients } of newProducts) {
  for (const language of ['de', 'en']) {
    const json = JSON.stringify(buildResult(label, ingredients, language));
    values.push(`(${sqlString(barcode)}, ${sqlString(language)}, ${sqlString(json)}::jsonb, 'dsld-2026-09-02', true)`);
  }
}
const chunks = [];
for (let i = 0; i < values.length; i += 200) {
  chunks.push(
    `insert into public.product_cache (barcode, language, result, model, verified)\nvalues\n${values
      .slice(i, i + 200)
      .join(',\n')}\non conflict (barcode, language) do nothing;`
  );
}
const header = `-- Seed DSLD Welle 1 (Baustein 4, docs/datenbank-ausbau-programm.md):
-- Etikettendaten aus der NIH Dietary Supplement Label Database (DSLD,
-- https://dsld.od.nih.gov/, public domain) fuer kuratierte US-Marken,
-- nur On-Market-Labels mit UPC und Mengen je Portion. Je Produkt zwei
-- Zeilen (de/en), verified=true (behoerdliche Etikettendatenbank),
-- niemals Ueberschreiben (on conflict do nothing).
-- Erzeugt von scripts/import-dsld.mjs am 2026-09-02.

`;
writeFileSync(outPath, header + chunks.join('\n\n') + '\n');
console.log(`Geschrieben: ${outPath}`);
console.log(`Produkte in dieser Welle: ${newProducts.length}, Zeilen: ${values.length}`);
