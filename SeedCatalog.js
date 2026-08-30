/**
 * SeedCatalog.js
 * Namenssuche gegen den kuratierten DACH-Produktkatalog
 * (data/seedProducts.json, Rechercheergebnis der Seed-Wellen 1-3).
 *
 * Ergaenzt die Open-Food-Facts-Suche: Der Katalog kennt vor allem die
 * Produkte, die OFF NICHT hat (BIOGENA, Dr. Boehm, Apotheken- und
 * D2C-Marken), viele davon ohne EAN. Jede Zeile traegt ihre Quelle.
 *
 * Kein Netzwerkzugriff: reine Suche ueber das gebuendelte JSON.
 */

import seedProducts from './data/seedProducts.json';
import offProducts from './data/offProducts.json';
import { matchIngredient } from './SubstanceMatcher';
import { tr } from './i18n/runtime';

// Einzige Katalogquelle des Moduls: redaktionell gepflegter Herstellerkatalog
// (seedProducts.json) plus die Open-Food-Facts-Eintraege (offProducts.json,
// getrennt gefuehrt wegen ODbL, siehe scripts/split-off-products.mjs). Jeder
// OFF-Eintrag traegt `license: 'ODbL'`, damit Suche und Markenliste ihn
// kennzeichnen koennen -- die uebrigen Funktionen dieses Moduls kennen nur
// CATALOG und muessen die Herkunft nicht unterscheiden.
const CATALOG = [
  ...seedProducts,
  ...offProducts.products.map((entry) => ({ ...entry, license: 'ODbL' })),
];

/**
 * catalogCounts()
 * Zaehlt den Katalog nach Herkunft: redaktionell gepflegte Eintraege
 * (Herstellerkatalog), Open-Food-Facts-Eintraege (ODbL) und die Summe.
 * Fuer Tests und die Datenintegritaets-Pruefung des Splits (Task 6).
 */
export function catalogCounts() {
  return {
    manufacturer: seedProducts.length,
    off: offProducts.products.length,
    total: CATALOG.length,
  };
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * normalizeCatalogText(text)
 * Vergleichsform fuer die Suche: Kleinschreibung, Tausenderpunkte in
 * Zahlen entfernt ("2.000 I.E." findet auch "2000"), Satzzeichen zu
 * Leerraum. Exportiert fuer Tests.
 */
export function normalizeCatalogText(text) {
  return clean(text)
    .toLowerCase()
    .replace(/(\d)[.,](?=\d)/g, '$1')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/**
 * searchSeedCatalog(query)
 * Tokenbasierte Suche ueber Marke + Produktname. Alle Suchwoerter
 * muessen vorkommen; sortiert nach Treffguete (kuerzere Namen mit
 * gleichem Match zuerst). Liefert bis zu 5 Kandidaten im selben Format
 * wie searchProductsByName, plus origin/entry fuer die Uebernahme.
 */
export function searchSeedCatalog(query, limit = 5) {
  const tokens = normalizeCatalogText(query)
    .split(/\s+/)
    .filter((token) => token.length >= 2);
  if (tokens.length === 0) return [];

  const hits = [];
  for (const entry of CATALOG) {
    const haystack = normalizeCatalogText(`${entry.brand ?? ''} ${entry.name ?? ''}`);
    if (!tokens.every((token) => haystack.includes(token))) continue;
    hits.push({ entry, score: haystack.length });
  }

  hits.sort((a, b) => a.score - b.score);
  return hits.slice(0, limit).map(({ entry }) => ({
    code: clean(entry.ean),
    productName: clean(entry.name),
    brand: clean(entry.brand),
    origin: 'seed',
    entry,
  }));
}

// Kanal-Reihenfolge des Marken-Registers. 'extra' buendelt Marken, deren
// Produkte komplett zur Extrasparte gehoeren (Homoeopathie, Bachblueten):
// sie stehen sichtbar getrennt von den Naehrstoff-Marken.
const BRAND_SECTION_ORDER = [
  'drogerie',
  'apotheke',
  'discounter',
  'online',
  'sport',
  'direct',
  'extra',
];
const EXTRA_CLASSES = new Set(['homoeopathikum', 'bachblueten']);

/**
 * listCatalogBrandSections()
 * Marken-Register aus dem gebuendelten Katalog: je Vertriebskanal die
 * Marken alphabetisch, mit Produktzahl und Markeninhaber. Bewusst ohne
 * jede Wertung — sortiert wird nach Alphabet, nie nach Rang.
 */
export function listCatalogBrandSections() {
  const brands = new Map();
  for (const entry of CATALOG) {
    const name = clean(entry.brand);
    if (!name) continue;
    let bucket = brands.get(name);
    if (!bucket) {
      bucket = {
        brand: name,
        brandOwner: null,
        productCount: 0,
        channels: new Set(),
        extraOnly: true,
      };
      brands.set(name, bucket);
    }
    bucket.productCount += 1;
    if (clean(entry.channel)) bucket.channels.add(clean(entry.channel));
    if (!bucket.brandOwner && clean(entry.brandOwner)) {
      bucket.brandOwner = clean(entry.brandOwner);
    }
    if (!EXTRA_CLASSES.has(clean(entry.productClass))) {
      bucket.extraOnly = false;
    }
  }

  const sections = new Map();
  for (const bucket of brands.values()) {
    const sectionId = bucket.extraOnly
      ? 'extra'
      : BRAND_SECTION_ORDER.find((channel) => bucket.channels.has(channel)) ??
        'online';
    if (!sections.has(sectionId)) sections.set(sectionId, []);
    sections.get(sectionId).push({
      brand: bucket.brand,
      brandOwner: bucket.brandOwner,
      productCount: bucket.productCount,
    });
  }

  return BRAND_SECTION_ORDER.filter((id) => sections.has(id)).map((id) => ({
    id,
    brands: sections
      .get(id)
      .sort((a, b) => a.brand.localeCompare(b.brand, 'de')),
  }));
}

/**
 * productsForBrand(brand)
 * Alle Katalog-Eintraege einer Marke, alphabetisch nach Produktname.
 */
export function productsForBrand(brand) {
  const needle = clean(brand);
  if (!needle) return [];
  return CATALOG
    .filter((entry) => clean(entry.brand) === needle)
    .sort((a, b) => clean(a.name).localeCompare(clean(b.name), 'de'));
}

/**
 * seedEntryToScanDraft(entry)
 * Katalog-Eintrag → Scan-Ergebnis im App-Format (wie der OFF-Pfad),
 * klar gekennzeichnet als 'seed-catalog'. Mengen stammen aus der
 * dokumentierten Quelle des Eintrags, nie vom Etikett — der Hinweis
 * macht das sichtbar.
 */
export function seedEntryToScanDraft(entry) {
  const ingredients = Array.isArray(entry.keyIngredients)
    ? entry.keyIngredients.map((item) => ({
        name: clean(item.name),
        form: null,
        amount: item.amount === null || item.amount === undefined ? '' : String(item.amount),
        unit: clean(item.unit),
      }))
    : [];

  // Produktklassen-Hinweis: Arzneimittel und Homoeopathika sind dokumentierbare
  // Einnahmen, aber keine Nahrungsergaenzungsmittel. Der Hinweis verweist auf die
  // Packungsbeilage und bleibt bewusst deskriptiv (keine Anwendungs-Empfehlung,
  // siehe launch/apple-review-leitfaden.md).
  const classWarnings = [];
  const productClass = clean(entry.productClass);
  if (productClass === 'arznei') {
    classWarnings.push(tr('seedCatalog.class.arznei'));
  } else if (productClass === 'homoeopathikum') {
    classWarnings.push(tr('seedCatalog.class.homoeopathikum'));
  } else if (productClass === 'bachblueten') {
    classWarnings.push(tr('seedCatalog.class.bachblueten'));
  }

  return {
    productName: clean(entry.name),
    brand: clean(entry.brand),
    confidence: 0,
    detectedIngredients: ingredients
      .map((item) =>
        [item.name, item.amount && item.unit ? `${item.amount} ${item.unit}` : item.amount]
          .filter(Boolean)
          .join(' ')
      )
      .filter(Boolean),
    ingredientDetails: ingredients,
    dosage: { amount: '', unit: '' },
    timingSuggestion: '',
    warnings: [...classWarnings, tr('seedCatalog.warning.catalog')],
    uncertaintyNote: tr('seedCatalog.uncertaintyNote'),
    analysisMode: 'seed-catalog',
    // Belegte Siegel-Referenzen des Katalogeintrags (id, level, sourceUrl,
    // checkedAt) — wandern in den Entwurf, damit Aufnehmen-Screen und
    // Suche sie zeigen koennen. Keine Eigenaussagen ohne Quelle.
    certifications: Array.isArray(entry.certifications) ? entry.certifications : [],
    productClass: productClass || null,
    barcode: clean(entry.ean) || null,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * parseCatalogAmount(raw)
 * Katalog-Mengenangabe (Zahl oder String, teils leer) in eine Zahl oder
 * null. Leer bleibt null statt einer erfundenen 0 (Regel „Keine
 * erfundenen Werte“, siehe CLAUDE.md) -- `Number('')` waere sonst 0 und
 * saehe wie eine erkannte Menge aus. Ein einzelnes Dezimalkomma wird zu
 * einem Punkt ("1,1" -> 1.1); alles, was danach nicht eindeutig eine Zahl
 * ist (Spannen wie "250-500", Text), liefert ebenfalls null statt zu
 * raten.
 */
export function parseCatalogAmount(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return null;
  const value = Number(text.replace(',', '.'));
  return Number.isFinite(value) ? value : null;
}

// Index Substanz → Katalog-Treffer. Einmalig (lazy) aufgebaut: 411
// Eintraege mit je bis zu mehreren keyIngredients waeren bei jeder
// Suche neu durchlaufen sonst spuerbar. Kein Modul-Top-Level-Aufbau,
// damit ein Test, der nur searchSeedCatalog braucht, matchIngredient
// gar nicht erst antriggert.
let substanceIndex = null;

function getSubstanceIndex() {
  if (substanceIndex) return substanceIndex;

  const index = new Map();
  for (const entry of CATALOG) {
    // Je Eintrag zaehlt nur der erste passende Wirkstoff-Treffer pro
    // Substanz: ein Produkt mit "Magnesium (Bisglycinat/Citrat)" soll in
    // der Magnesium-Liste einmal erscheinen, nicht zweimal.
    const seenSubstances = new Set();
    for (const item of entry.keyIngredients ?? []) {
      const match = matchIngredient(item.name);
      if (!match?.matched) continue;
      if (seenSubstances.has(match.substanceId)) continue;
      seenSubstances.add(match.substanceId);

      const hit = {
        entry,
        amount: parseCatalogAmount(item.amount),
        unit: item.unit ?? '',
        form: match.form?.name ?? null,
        brand: entry.brand,
        name: entry.name,
        country: entry.country ?? '',
      };
      if (!index.has(match.substanceId)) index.set(match.substanceId, []);
      index.get(match.substanceId).push(hit);
    }
  }

  substanceIndex = index;
  return substanceIndex;
}

/**
 * sortProducts(list, sortBy)
 * 'brand' (Standard): alphabetisch nach Marke, deutsche Sortierordnung.
 * 'amount': absteigend, Eintraege ohne Menge zuletzt.
 * 'form': alphabetisch nach chemischer Form, Eintraege ohne Form zuletzt.
 */
export function sortProducts(list, sortBy = 'brand') {
  const copy = [...list];
  if (sortBy === 'amount') {
    return copy.sort((a, b) => {
      if (a.amount === null && b.amount === null) return 0;
      if (a.amount === null) return 1;
      if (b.amount === null) return -1;
      return b.amount - a.amount;
    });
  }
  if (sortBy === 'form') {
    return copy.sort((a, b) => {
      if (!a.form && !b.form) return 0;
      if (!a.form) return 1;
      if (!b.form) return -1;
      return a.form.localeCompare(b.form, 'de');
    });
  }
  return copy.sort((a, b) => a.brand.localeCompare(b.brand, 'de'));
}

/**
 * findProductsBySubstance(substanceId)
 * Alle Katalog-Produkte, die ueber SubstanceMatcher auf diese Substanz
 * treffen, Standardsortierung nach Marke. Unbekannte Substanz-ID liefert
 * eine leere Liste, kein Fehler.
 */
export function findProductsBySubstance(substanceId) {
  const hits = getSubstanceIndex().get(substanceId) ?? [];
  return sortProducts(hits, 'brand');
}
