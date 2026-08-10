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
import { tr } from './i18n/runtime';

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
  for (const entry of seedProducts) {
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
    productClass: productClass || null,
    barcode: clean(entry.ean) || null,
    analyzedAt: new Date().toISOString(),
  };
}
