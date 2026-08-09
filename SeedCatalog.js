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

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * searchSeedCatalog(query)
 * Tokenbasierte Suche ueber Marke + Produktname. Alle Suchwoerter
 * muessen vorkommen; sortiert nach Treffguete (kuerzere Namen mit
 * gleichem Match zuerst). Liefert bis zu 5 Kandidaten im selben Format
 * wie searchProductsByName, plus origin/entry fuer die Uebernahme.
 */
export function searchSeedCatalog(query, limit = 5) {
  const tokens = clean(query)
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length >= 2);
  if (tokens.length === 0) return [];

  const hits = [];
  for (const entry of seedProducts) {
    const haystack = `${entry.brand ?? ''} ${entry.name ?? ''}`.toLowerCase();
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
    warnings: [
      'Eintrag aus dem kuratierten DACH-Produktkatalog (Herstellerangaben). Dosierung und Wirkstoffmengen bitte direkt vom Etikett abgleichen.',
    ],
    uncertaintyNote:
      'Katalog-Treffer aus der Produktrecherche. Vor der Uebernahme mit dem Etikett abgleichen.',
    analysisMode: 'seed-catalog',
    barcode: clean(entry.ean) || null,
    analyzedAt: new Date().toISOString(),
  };
}
