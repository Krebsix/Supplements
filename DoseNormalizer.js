/**
 * DoseNormalizer.js
 * ─────────────────────────────────────────────────────────────
 * Beantwortet eine einzige, aber folgenreiche Frage:
 * Bezieht sich eine Mengenangabe auf die VERBINDUNG oder auf das ELEMENT?
 *
 * "Magnesiumcitrat 500 mg"  → Verbindung, davon rund 81 mg Magnesium
 * "Magnesium 300 mg"        → Element, direkt mit Referenzwerten vergleichbar
 *
 * Referenzwerte und Obergrenzen in data/referenceValues.js sind IMMER
 * elementar. Wird eine Verbindungsmenge ungeprueft dagegen gehalten, warnt
 * die App falsch — bei Magnesiumcitrat um mehr als das Sechsfache.
 *
 * WARUM NICHT EINFACH IMMER UMRECHNEN:
 * Nach Richtlinie 2002/46/EG und LMIV muss die Naehrwerttabelle die
 * elementare Menge nennen. Ein korrekt gelesenes Etikett ist also bereits
 * elementar — pauschales Umrechnen wuerde die Menge faelschlich kleinrechnen
 * und eine echte Ueberdosierung verschleiern. Das waere der gefaehrlichere
 * Fehler, weil er entwarnt statt zu warnen.
 *
 * Deshalb die Regel: Umgerechnet wird nur, wenn die Menge erkennbar an der
 * Verbindung haengt. Im Zweifel bleibt der Originalwert stehen und die
 * Angabe wird als klaerungsbeduerftig ausgewiesen — nie stillschweigend
 * gerechnet (Regel aus CLAUDE.md: keine erfundenen Werte).
 *
 * Diese Datei liefert bewusst NUR Zahlen und Codes, keine fertigen Saetze.
 * Die Formulierung passiert in ReferenceCheck.js, damit die Texte an einer
 * einzigen Stelle uebersetzt werden koennen.
 */

import {
  getElementalFraction,
  elementTerms,
  hasElementalData,
} from './data/elementalFractions';

export const AMOUNT_BASIS = {
  /** Menge meint das Element — direkt vergleichbar (Regelfall laut LMIV). */
  ELEMENTAL: 'elemental',
  /** Menge meint die Verbindung — umgerechnet, Elementanteil bekannt. */
  COMPOUND: 'compound',
  /** Verbindung erkannt, aber ohne belastbaren Elementanteil — nicht gerechnet. */
  COMPOUND_UNKNOWN: 'compound_unknown',
  /** Substanz ohne Verbindungs-/Element-Unterscheidung (Vitamine, Pflanzenstoffe). */
  NOT_APPLICABLE: 'not_applicable',
};

/**
 * Traegt ein Wort den Namen einer chemischen Form?
 * "magnesiumcitrat" traegt "citrat", "magnesium" nicht.
 */
function tokenCarriesForm(token, formName) {
  if (!token || !formName) return false;
  // Klammerzusaetze entfernen ("MK-7 (all-trans)" → "mk-7") und normalisieren,
  // damit der Vergleich zur Token-Schreibweise passt.
  const needle = String(formName)
    .replace(/\(.*?\)/g, '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '');

  if (needle.length < 3) return false;
  // Kein Laengenvergleich: Formnamen wie "Molybdaenglycinat" oder
  // "Kupfergluconat" tragen den Elementnamen bereits in sich, dort ist das
  // Token identisch mit dem Formnamen. Der Fall "Magnesium 300 mg (als
  // Citrat)" ist bereits vorher abgefangen — dort steht der Elementname als
  // eigenes Wort und die Angabe gilt deshalb als elementar.
  return token.includes(needle);
}

/**
 * resolveAmountBasis(match)
 * match: Ergebnis aus SubstanceMatcher.matchIngredient()
 *
 * Rueckgabe:
 *   basis            einer der AMOUNT_BASIS-Werte
 *   elementalAmount  Menge in elementarer Form (oder null)
 *   originalAmount   Menge wie erkannt
 *   fraction         verwendeter Massenanteil (oder null)
 *   fractionNote     worauf sich der Anteil bezieht (Hydratzustand o. ae.)
 *   varies           true, wenn der Anteil je nach Handelsware schwankt
 *   formName         erkannte chemische Form (oder null)
 */
export function resolveAmountBasis(match) {
  const empty = {
    basis: AMOUNT_BASIS.NOT_APPLICABLE,
    elementalAmount: null,
    originalAmount: null,
    fraction: null,
    fractionNote: '',
    varies: false,
    formName: null,
  };

  if (!match?.matched) return empty;

  const amount = Number.isFinite(match.amount) ? match.amount : null;
  const base = { ...empty, originalAmount: amount };

  // Vitamine, Aminosaeuren, Pflanzenstoffe: keine Element/Verbindung-Frage.
  if (!hasElementalData(match.substanceId)) return base;

  const tokens = Array.isArray(match.tokens) ? match.tokens : [];
  const terms = elementTerms[match.substanceId] ?? [];

  // Steht der Elementname als eigenstaendiges Wort im Text, ist die Angabe
  // elementar — auch bei "Magnesium 300 mg (aus Magnesiumcitrat)", wo die
  // Verbindung nur als Quelle genannt wird.
  const mentionsElement = tokens.some((token) =>
    terms.some((term) => token === term)
  );

  const formName = match.form?.name ?? null;

  if (mentionsElement || !formName) {
    return { ...base, basis: AMOUNT_BASIS.ELEMENTAL, formName };
  }

  // Ab hier: Form erkannt, Element nicht separat genannt. Nur wenn ein Wort
  // die Verbindung tatsaechlich traegt ("magnesiumcitrat"), wird gerechnet.
  const carriesCompound = tokens.some((token) =>
    tokenCarriesForm(token, formName)
  );

  if (!carriesCompound) {
    return { ...base, basis: AMOUNT_BASIS.ELEMENTAL, formName };
  }

  const fractionData = getElementalFraction(match.substanceId, formName);

  if (!fractionData) {
    // Verbindung erkannt, aber kein belastbarer Anteil hinterlegt —
    // etwa bei proprietaeren Chelaten. Lieber kennzeichnen als schaetzen.
    return { ...base, basis: AMOUNT_BASIS.COMPOUND_UNKNOWN, formName };
  }

  return {
    basis: AMOUNT_BASIS.COMPOUND,
    originalAmount: amount,
    elementalAmount:
      amount === null ? null : roundSensibly(amount * fractionData.fraction),
    fraction: fractionData.fraction,
    fractionNote: fractionData.note,
    varies: fractionData.varies,
    formName,
  };
}

/**
 * Rundet auf eine Genauigkeit, die zur Ausgangsangabe passt.
 * 500 mg × 0,162 = 81,0 mg — nicht 81,00000000000001.
 */
function roundSensibly(value) {
  if (!Number.isFinite(value)) return null;
  if (value >= 100) return Math.round(value);
  if (value >= 10) return Math.round(value * 10) / 10;
  return Math.round(value * 100) / 100;
}

/**
 * getComparableAmount(match)
 * Die Menge, die gegen Referenzwerte gehalten werden darf — oder null,
 * wenn ein Vergleich nicht zulaessig ist (unbekannter Elementanteil).
 */
export function getComparableAmount(match) {
  const resolved = resolveAmountBasis(match);

  if (resolved.basis === AMOUNT_BASIS.COMPOUND) {
    return resolved.elementalAmount;
  }
  if (resolved.basis === AMOUNT_BASIS.COMPOUND_UNKNOWN) {
    return null;
  }
  return resolved.originalAmount;
}
