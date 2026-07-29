/**
 * ReferenceCheck.js
 * ─────────────────────────────────────────────────────────────
 * Vergleicht eine gescannte Menge mit oeffentlichen Referenzwerten
 * fuer die gewaehlte Lebensphase.
 *
 * ABGRENZUNG — das hier ist der Kern der Produktentscheidung:
 * Die App sagt NICHT "nimm 300 mg Magnesium". Sie sagt "dieses Produkt
 * enthaelt 400 mg; der Referenzwert fuer Frauen liegt bei 300 mg, die
 * Obergrenze fuer Praeparate bei 250 mg". Das ist Datenabgleich mit
 * nachpruefbaren Quellen, keine gesundheitliche Beratung.
 *
 * Deshalb sind auch Kinder, Schwangerschaft und Menopause abbildbar,
 * ohne in den Bereich Medizinprodukt/Health Claims zu geraten.
 */

import { convertAmount } from './SubstanceMatcher';
import { AMOUNT_BASIS, resolveAmountBasis } from './DoseNormalizer';
import { getAdvisories } from './data/lifeStageAdvisories';
import { getReferenceValue } from './data/referenceValues';
import { normalizeSources } from './data/substances';

export const REFERENCE_STATUS = {
  BELOW: 'below',
  WITHIN: 'within',
  ABOVE_REFERENCE: 'above_reference',
  ABOVE_LIMIT: 'above_limit',
  SAFE_LEVEL: 'safe_level',
  UNKNOWN: 'unknown',
};

const STATUS_META = {
  [REFERENCE_STATUS.BELOW]: {
    label: 'Unter Referenzwert',
    tone: 'neutral',
    hex: '#64748b',
  },
  [REFERENCE_STATUS.WITHIN]: {
    label: 'Im Bereich des Referenzwerts',
    tone: 'ok',
    hex: '#0f766e',
  },
  [REFERENCE_STATUS.ABOVE_REFERENCE]: {
    label: 'Über Referenzwert',
    tone: 'notice',
    hex: '#b45309',
  },
  [REFERENCE_STATUS.ABOVE_LIMIT]: {
    label: 'Über Obergrenze',
    tone: 'warn',
    hex: '#dc2626',
  },
  [REFERENCE_STATUS.SAFE_LEVEL]: {
    label: 'Innerhalb sicherer Menge',
    tone: 'ok',
    hex: '#0f766e',
  },
  [REFERENCE_STATUS.UNKNOWN]: {
    label: 'Kein Referenzwert hinterlegt',
    tone: 'muted',
    hex: '#94a3b8',
  },
};

export function getStatusMeta(status) {
  return STATUS_META[status] ?? STATUS_META[REFERENCE_STATUS.UNKNOWN];
}

// Toleranz nach unten: 80 % des Referenzwerts gelten noch als "im Bereich".
// Referenzwerte sind Populationsschaetzwerte, keine scharfen Schwellen —
// eine harte Kante bei 100 % wuerde eine Genauigkeit suggerieren, die es
// nicht gibt.
const WITHIN_TOLERANCE = 0.8;

function formatNumber(value) {
  if (!Number.isFinite(value)) return '';
  if (Number.isInteger(value)) return String(value);
  if (value < 1) return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return value.toFixed(1).replace(/\.0$/, '');
}

/**
 * checkAgainstReference(match, lifeStageId)
 * match: Ergebnis aus SubstanceMatcher.matchIngredient()
 * Rueckgabe: Vergleichsobjekt oder null, wenn kein Abgleich moeglich ist.
 */
export function checkAgainstReference(match, lifeStageId) {
  if (!match?.matched || !lifeStageId) return null;

  const reference = getReferenceValue(match.substanceId, lifeStageId);
  if (!reference) return null;

  // Ohne Menge kein Vergleich — aber die Referenz trotzdem anzeigen,
  // damit die Nutzerin den Wert vom Etikett selbst einordnen kann.
  if (!Number.isFinite(match.amount) || !match.unit) {
    return {
      status: REFERENCE_STATUS.UNKNOWN,
      substanceId: match.substanceId,
      substanceName: match.substance.name,
      lifeStageId,
      unit: reference.unit,
      amount: null,
      reference: reference.reference,
      upperLimit: reference.upperLimit,
      upperLimitNote: reference.upperLimitNote,
      percentOfReference: null,
      summary: `Ohne erkannte Mengenangabe ist kein Abgleich möglich. Referenzwert: ${formatNumber(reference.reference)} ${reference.unit} pro Tag.`,
    };
  }

  // Verbindung oder Element? Referenzwerte sind immer elementar, deshalb
  // muss "Magnesiumcitrat 500 mg" auf den Magnesium-Anteil heruntergerechnet
  // werden, bevor verglichen wird (siehe DoseNormalizer.js).
  const dose = resolveAmountBasis(match);

  if (dose.basis === AMOUNT_BASIS.COMPOUND_UNKNOWN) {
    // Verbindung erkannt, Elementanteil aber nicht belastbar hinterlegt.
    // Ein Vergleich waere hier eine Scheingenauigkeit.
    return {
      status: REFERENCE_STATUS.UNKNOWN,
      substanceId: match.substanceId,
      substanceName: match.substance.name,
      lifeStageId,
      unit: reference.unit,
      amount: null,
      reference: reference.reference,
      upperLimit: reference.upperLimit,
      upperLimitNote: reference.upperLimitNote,
      percentOfReference: null,
      amountBasis: dose.basis,
      summary: `Die Angabe bezieht sich auf ${dose.formName}, nicht auf elementares ${match.substance.name}. Für diese Verbindung ist kein gesicherter Elementanteil hinterlegt, deshalb ist kein Abgleich mit dem Referenzwert von ${formatNumber(reference.reference)} ${reference.unit} möglich. Die elementare Menge steht in der Nährwerttabelle des Produkts.`,
    };
  }

  const basisAmount =
    dose.basis === AMOUNT_BASIS.COMPOUND ? dose.elementalAmount : match.amount;

  const amount = convertAmount(
    basisAmount,
    match.unit,
    reference.unit,
    match.substance
  );

  if (amount === null) {
    return {
      status: REFERENCE_STATUS.UNKNOWN,
      substanceId: match.substanceId,
      substanceName: match.substance.name,
      lifeStageId,
      unit: reference.unit,
      amount: null,
      reference: reference.reference,
      upperLimit: reference.upperLimit,
      upperLimitNote: reference.upperLimitNote,
      percentOfReference: null,
      summary: `Die Einheit "${match.unit}" lässt sich nicht sicher in ${reference.unit} umrechnen. Bitte vom Etikett übernehmen.`,
    };
  }

  const { reference: refValue, upperLimit } = reference;
  const hasReference = Number.isFinite(refValue) && refValue > 0;
  const percentOfReference = hasReference
    ? Math.round((amount / refValue) * 100)
    : null;

  let status;
  if (upperLimit !== null && amount > upperLimit) {
    status = REFERENCE_STATUS.ABOVE_LIMIT;
  } else if (!hasReference && upperLimit !== null) {
    // Kein Referenzwert vorhanden, weil kein essenzieller Naehrstoff --
    // nur eine EFSA/BfR-Sicherheitsobergrenze. "Unter dem Referenzwert"
    // waere hier irrefuehrend, es gibt keinen anzustrebenden Zielwert.
    status = REFERENCE_STATUS.SAFE_LEVEL;
  } else if (hasReference && amount > refValue) {
    status = REFERENCE_STATUS.ABOVE_REFERENCE;
  } else if (hasReference && amount >= refValue * WITHIN_TOLERANCE) {
    status = REFERENCE_STATUS.WITHIN;
  } else {
    status = REFERENCE_STATUS.BELOW;
  }

  const amountText = `${formatNumber(amount)} ${reference.unit}`;
  const refText = hasReference ? `${formatNumber(refValue)} ${reference.unit}` : '';

  let summary;
  switch (status) {
    case REFERENCE_STATUS.ABOVE_LIMIT:
      summary = `${amountText} liegen über der tolerierbaren Gesamtzufuhr von ${formatNumber(upperLimit)} ${reference.unit} pro Tag. Diese Grenze bezieht sich auf alle Quellen zusammen, also auch auf Lebensmittel und weitere Präparate.`;
      break;
    case REFERENCE_STATUS.SAFE_LEVEL:
      summary = `${amountText} liegen innerhalb der von EFSA/BfR als sicher bewerteten Tagesmenge von ${formatNumber(upperLimit)} ${reference.unit}. Für diesen Stoff existiert kein eigener Tages-Referenzwert, da er kein essenzieller Nährstoff ist.`;
      break;
    case REFERENCE_STATUS.ABOVE_REFERENCE:
      summary = `${amountText} liegen über dem Referenzwert von ${refText} pro Tag${
        upperLimit !== null
          ? `, aber unter der Obergrenze von ${formatNumber(upperLimit)} ${reference.unit}`
          : ''
      }.`;
      break;
    case REFERENCE_STATUS.WITHIN:
      summary = `${amountText} entsprechen etwa dem Referenzwert von ${refText} pro Tag.`;
      break;
    default:
      summary = `${amountText} decken rund ${percentOfReference} % des Referenzwerts von ${refText} pro Tag ab. Die restliche Menge stammt üblicherweise aus der Ernährung.`;
  }

  // Wurde von der Verbindung auf das Element heruntergerechnet, muss die
  // Rechnung sichtbar sein — sonst wundert sich die Nutzerin, warum aus
  // 500 mg auf dem Etikett plötzlich 81 mg werden.
  if (dose.basis === AMOUNT_BASIS.COMPOUND) {
    // Auf ganze Prozent runden: der Anteil schwankt je nach Hydratform,
    // eine Nachkommastelle wuerde eine Genauigkeit vortaeuschen, die es
    // bei Handelsware nicht gibt.
    const percentOfCompound = Math.round(dose.fraction * 100);
    // Das Etikettenwort nehmen ("Magnesiumcitrat"), nicht den internen
    // Formnamen ("Citrat") — sonst liest sich der Satz wie ein Tippfehler.
    const compoundLabel = match.label || dose.formName;
    summary += ` Grundlage der Rechnung: ${formatNumber(dose.originalAmount)} ${match.unit} ${compoundLabel} enthalten rund ${percentOfCompound} % elementares ${match.substance.name}. Referenzwerte beziehen sich immer auf die elementare Menge.`;

    if (dose.varies) {
      summary += ' Der Anteil schwankt je nach Handelsform — maßgeblich ist die Nährwerttabelle des Produkts.';
    }
  }

  return {
    status,
    substanceId: match.substanceId,
    substanceName: match.substance.name,
    lifeStageId,
    unit: reference.unit,
    amount,
    reference: refValue,
    upperLimit,
    upperLimitNote: reference.upperLimitNote,
    percentOfReference,
    summary,
    // Herkunft der verglichenen Zahl — die UI kann damit kennzeichnen,
    // ob der Wert vom Etikett stammt oder umgerechnet wurde.
    amountBasis: dose.basis,
    originalAmount: dose.originalAmount,
    formName: dose.formName,
    elementalFraction: dose.fraction,
    elementalFractionVaries: dose.varies,
    // Stoechiometrie-Herkunft (Summenformel, Hydratzustand) fuer die
    // Detailansicht — bewusst nicht im Fliesstext, das ist Beleg, nicht Satz.
    elementalFractionNote: dose.fractionNote,
  };
}

/**
 * buildSubstanceProfile(match, lifeStageId)
 * Fasst alles zusammen, was die UI ueber einen erkannten Wirkstoff zeigt:
 * Was ist es, wofuer wird es eingesetzt, welche Form, wie verhaelt sich
 * die Menge zum Referenzwert.
 */
export function buildSubstanceProfile(match, lifeStageId) {
  if (!match?.matched) {
    return {
      matched: false,
      label: match?.label ?? '',
      note: 'Dieser Eintrag ist in der Wirkstoff-Datenbank noch nicht hinterlegt. Angaben bitte direkt vom Etikett übernehmen.',
    };
  }

  const { substance, form } = match;

  return {
    matched: true,
    substanceId: substance.id,
    name: substance.name,
    category: substance.category,
    what: substance.what,
    useCases: substance.useCases ?? [],
    form: form
      ? {
          name: form.name,
          bioavailability: form.bioavailability,
          note: form.note,
        }
      : null,
    // Alle Formen mitgeben: Vergleich ist der eigentliche Mehrwert
    allForms: substance.forms ?? [],
    fatSoluble: Boolean(substance.fatSoluble),
    cautionNote: substance.cautionNote ?? '',
    sources: normalizeSources(substance.sources ?? []),
    referenceCheck: checkAgainstReference(match, lifeStageId),
    // Was in DIESER Lebensphase besonders gilt (Phase 3)
    advisories: getAdvisories(substance.id, lifeStageId),
  };
}
