/**
 * SubstanceMatcher.js
 * ─────────────────────────────────────────────────────────────
 * Verbindet erkannte Etikettentexte mit der Wirkstoff-Datenbank.
 *
 * Aufgabe: Aus "Magnesiumbisglycinat 200 mg" wird ein Treffer auf die
 * Substanz `magnesium` mit der Form "Bisglycinat" und dem Wert 200 mg.
 *
 * Kein Treffer bedeutet kein Treffer — es wird nichts geraten. Ein
 * nicht zugeordneter Wirkstoff wird als `unmatched` zurueckgegeben und
 * in der UI als solcher gekennzeichnet.
 *
 * Logik NIEMALS in UI-Komponenten (siehe ConflictLogic.js).
 */

import { substances } from './data/substances';

// Einheiten-Schreibweisen vom Etikett auf eine kanonische Form bringen
const UNIT_ALIASES = {
  mg: 'mg',
  milligramm: 'mg',
  g: 'g',
  gramm: 'g',
  'µg': 'µg',
  ug: 'µg',
  mcg: 'µg',
  mikrogramm: 'µg',
  ie: 'IE',
  iu: 'IE',
  'i.e.': 'IE',
  'i.u.': 'IE',
  kbe: 'KBE',
  cfu: 'KBE',
  ml: 'ml',
};

// Umrechnungsfaktoren auf die Basiseinheit der Substanz
const MASS_TO_MG = { g: 1000, mg: 1, 'µg': 0.001 };

function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9µ]+/g, ' ')
    .trim();
}

export function normalizeUnit(unit) {
  const key = String(unit ?? '').toLowerCase().trim();
  return UNIT_ALIASES[key] ?? (key ? String(unit).trim() : '');
}

// Vorberechneter Suchindex: normalisiertes Synonym → Substanz
const synonymIndex = (() => {
  const index = [];
  for (const substance of substances) {
    const terms = new Set([substance.name, ...(substance.synonyms ?? [])]);
    for (const term of terms) {
      const normalized = normalizeText(term);
      if (normalized) index.push({ term: normalized, substance });
    }
  }
  // Laengere Begriffe zuerst: "magnesiumbisglycinat" schlaegt "magnesium"
  return index.sort((a, b) => b.term.length - a.term.length);
})();

// Einheiten als Token entfernen, sonst wuerde "Zink 10 mg" ueber das
// Token "mg" auf Magnesium matchen.
const UNIT_TOKENS = new Set([
  'mg', 'g', 'µg', 'ug', 'mcg', 'ie', 'iu', 'kbe', 'cfu', 'ml', 'l',
  'gramm', 'milligramm', 'mikrogramm', 'pro', 'tag', 'taeglich',
  'kapsel', 'kapseln', 'tablette', 'tabletten', 'portion', 'stueck',
]);

function tokenize(normalizedText) {
  return normalizedText
    .split(' ')
    .filter((token) => token && !UNIT_TOKENS.has(token) && !/^\d+$/.test(token));
}

/**
 * Ein Synonym gilt als Treffer, wenn es
 *   - ein vollstaendiges Token ist ("zink"), oder
 *   - ab 4 Zeichen der Anfang eines Tokens ist ("magnesium" in
 *     "magnesiumbisglycinat"), oder
 *   - ab 4 Zeichen als Wortgruppe vorkommt ("vitamin d 3").
 *
 * Kurze Elementsymbole ("fe", "zn", "b6") muessen exakte Token sein —
 * sonst wuerde jedes zufaellige Vorkommen der Buchstabenfolge treffen.
 */
function synonymMatches(term, tokens, normalizedText) {
  if (tokens.includes(term)) return true;
  if (term.length < 4) return false;
  if (tokens.some((token) => token.startsWith(term))) return true;
  return term.includes(' ') && normalizedText.includes(term);
}

/**
 * Erkennt die chemische Form aus dem Etikettentext.
 * "Magnesiumbisglycinat" → Form "Bisglycinat" der Substanz Magnesium.
 */
function detectForm(substance, normalizedText, explicitForm) {
  const haystack = normalizeText(`${normalizedText} ${explicitForm ?? ''}`);

  for (const form of substance.forms ?? []) {
    const candidates = [form.name, ...(form.aka ?? [])];
    for (const candidate of candidates) {
      // Klammerzusaetze wie "(Bisglycinat)" oder "MK-7 (all-trans)" entfernen
      const normalizedCandidate = normalizeText(
        candidate.replace(/\(.*?\)/g, '')
      );
      if (normalizedCandidate && haystack.includes(normalizedCandidate)) {
        return form;
      }
    }
  }
  return null;
}

/**
 * Menge und Einheit aus einem Freitext ziehen ("… – 200 mg" → 200 / mg).
 * Noetig, weil Barcode-Treffer und aeltere Scans nur Textlisten liefern.
 */
function parseAmountFromText(text) {
  const match = String(text ?? '').match(
    /(\d+(?:[.,]\d+)?)\s*(µg|ug|mcg|mg|g|IE|IU|KBE|CFU|ml)\b/i
  );
  if (!match) return { amount: null, unit: '' };

  return {
    amount: Number(match[1].replace(',', '.')),
    unit: normalizeUnit(match[2]),
  };
}

/**
 * matchIngredient(ingredient)
 * ingredient: String ("Magnesium (Bisglycinat) – 200 mg") oder das
 *             strukturierte Objekt aus ScanAnalyzer ({name, form, amount, unit}).
 */
export function matchIngredient(ingredient) {
  const isObject = ingredient && typeof ingredient === 'object';
  const rawLabel = isObject
    ? [ingredient.name, ingredient.form].filter(Boolean).join(' ')
    : String(ingredient ?? '');

  const displayLabel = isObject
    ? String(ingredient.name ?? '').trim()
    : String(ingredient ?? '').trim();

  const normalized = normalizeText(rawLabel);
  if (!normalized) return null;

  const tokens = tokenize(normalized);
  const hit = synonymIndex.find((entry) =>
    synonymMatches(entry.term, tokens, normalized)
  );

  // Strukturierte Angabe bevorzugen, sonst aus dem Freitext parsen
  const parsed = isObject
    ? {
        amount: Number(String(ingredient.amount ?? '').replace(',', '.')),
        unit: normalizeUnit(ingredient.unit),
      }
    : parseAmountFromText(ingredient);

  const amount = parsed.amount;
  const unit = parsed.unit;

  if (!hit) {
    return {
      matched: false,
      label: displayLabel || rawLabel.trim(),
      amount: Number.isFinite(amount) ? amount : null,
      unit,
    };
  }

  const substance = hit.substance;

  return {
    matched: true,
    substanceId: substance.id,
    substance,
    label: displayLabel || substance.name,
    form: detectForm(substance, normalized, isObject ? ingredient.form : ''),
    amount: Number.isFinite(amount) ? amount : null,
    unit,
  };
}

/**
 * matchIngredients(list) — verarbeitet die Zutatenliste eines Scans.
 * Nimmt bevorzugt `ingredientDetails` (strukturiert), sonst `detectedIngredients`.
 */
export function matchIngredients(list = []) {
  if (!Array.isArray(list)) return [];
  return list.map(matchIngredient).filter(Boolean);
}

/**
 * convertAmount(amount, fromUnit, toUnit, substance)
 * Rechnet zwischen Masseeinheiten um und beherrscht den Sonderfall
 * Vitamin D (µg ↔ IE). Gibt null zurueck, wenn keine sichere
 * Umrechnung moeglich ist — lieber nichts anzeigen als falsch rechnen.
 */
export function convertAmount(amount, fromUnit, toUnit, substance = null) {
  if (!Number.isFinite(amount)) return null;

  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);
  if (!from || !to) return null;
  if (from === to) return amount;

  // Sonderfall Vitamin D: 1 µg = 40 IE
  const factorToIE = substance?.unitConversion?.factorToIE;
  if (factorToIE) {
    if (from === 'µg' && to === 'IE') return amount * factorToIE;
    if (from === 'IE' && to === 'µg') return amount / factorToIE;
    if (from === 'mg' && to === 'IE') return amount * 1000 * factorToIE;
  }

  if (MASS_TO_MG[from] && MASS_TO_MG[to]) {
    return (amount * MASS_TO_MG[from]) / MASS_TO_MG[to];
  }

  return null;
}
