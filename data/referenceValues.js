/**
 * data/referenceValues.js
 * ─────────────────────────────────────────────────────────────
 * Referenzwerte je Lebensphase — der Ersatz fuer Empfehlungen.
 *
 * Die App EMPFIEHLT nichts. Sie zeigt an, wie sich eine gescannte
 * Menge zu oeffentlichen Referenzwerten verhaelt. Das ist Datenabgleich,
 * keine Beratung, und deshalb auch fuer Kinder, Schwangerschaft und
 * Menopause zulaessig darstellbar.
 *
 * Zwei Werte pro Substanz und Gruppe:
 *   reference  Zufuhrempfehlung / Schaetzwert (D-A-CH bzw. EFSA)
 *   upperLimit Tolerierbare Gesamtzufuhr UL (EFSA/BfR), sofern definiert
 *              → Diese Grenze bezieht sich auf die GESAMTE Tageszufuhr
 *                inklusive Lebensmitteln, nicht nur auf das Praeparat.
 *
 * null bedeutet: kein Wert abgeleitet/veroeffentlicht — dann wird nichts
 * angezeigt statt geraten (Regel: keine erfundenen Werte).
 */

export const LIFE_STAGES = [
  {
    id: 'child-4-10',
    label: 'Kind (4–10 Jahre)',
    short: 'Kind 4–10',
    note: 'Bei Kindern gelten deutlich niedrigere Obergrenzen als bei Erwachsenen. Ergänzungen für Kinder gehören grundsätzlich ärztlich abgeklärt.',
  },
  {
    id: 'teen-11-17',
    label: 'Jugendliche (11–17 Jahre)',
    short: 'Jugend',
    note: 'Erhöhter Bedarf in der Wachstumsphase, besonders bei Calcium und Eisen.',
  },
  {
    id: 'adult-woman',
    label: 'Frau (18–50 Jahre)',
    short: 'Frau',
    note: 'Durch die Menstruation liegt der Eisenbedarf deutlich höher als bei Männern.',
  },
  {
    id: 'adult-man',
    label: 'Mann (18–65 Jahre)',
    short: 'Mann',
    note: 'Ohne nachgewiesenen Mangel ist eine Eisenergänzung bei Männern unüblich.',
  },
  {
    id: 'pregnancy',
    label: 'Schwangerschaft',
    short: 'Schwangerschaft',
    note: 'Mehrere Werte weichen deutlich ab. Vitamin A (Retinol) ist hier besonders kritisch. Ergänzungen gehören ärztlich begleitet.',
  },
  {
    id: 'breastfeeding',
    label: 'Stillzeit',
    short: 'Stillzeit',
    note: 'Erhöhter Bedarf bei Jod, Vitamin A, Zink und Vitamin C.',
  },
  {
    id: 'menopause',
    label: 'Menopause / Frau ab 51',
    short: 'Menopause',
    note: 'Nach der Menopause sinkt der Eisenbedarf auf das Niveau von Männern, während Calcium und Vitamin D für den Knochenerhalt an Bedeutung gewinnen.',
  },
  {
    id: 'senior',
    label: 'Ab 65 Jahren',
    short: '65+',
    note: 'Die Aufnahmefähigkeit für Vitamin B12 nimmt ab, die Eigenbildung von Vitamin D sinkt.',
  },
];

export const LIFE_STAGE_IDS = LIFE_STAGES.map((stage) => stage.id);

/**
 * referenceValues[substanceId][lifeStageId] = { reference, upperLimit, unit }
 * Einheiten entsprechen dem `unit`-Feld der Substanz.
 */
export const referenceValues = {
  magnesium: {
    unit: 'mg',
    values: {
      'child-4-10': { reference: 170, upperLimit: 150 },
      'teen-11-17': { reference: 310, upperLimit: 250 },
      'adult-woman': { reference: 300, upperLimit: 250 },
      'adult-man': { reference: 350, upperLimit: 250 },
      pregnancy: { reference: 310, upperLimit: 250 },
      breastfeeding: { reference: 390, upperLimit: 250 },
      menopause: { reference: 300, upperLimit: 250 },
      senior: { reference: 300, upperLimit: 250 },
    },
    upperLimitNote:
      'Die Obergrenze gilt nur für zusätzlich zugeführtes Magnesium aus Präparaten, nicht für Magnesium aus Lebensmitteln. Überschreitungen wirken vor allem abführend.',
  },
  calcium: {
    unit: 'mg',
    values: {
      'child-4-10': { reference: 900, upperLimit: 2500 },
      'teen-11-17': { reference: 1200, upperLimit: 2500 },
      'adult-woman': { reference: 1000, upperLimit: 2500 },
      'adult-man': { reference: 1000, upperLimit: 2500 },
      pregnancy: { reference: 1000, upperLimit: 2500 },
      breastfeeding: { reference: 1000, upperLimit: 2500 },
      menopause: { reference: 1000, upperLimit: 2500 },
      senior: { reference: 1000, upperLimit: 2500 },
    },
  },
  iron: {
    unit: 'mg',
    values: {
      'child-4-10': { reference: 10, upperLimit: null },
      'teen-11-17': { reference: 15, upperLimit: null },
      'adult-woman': { reference: 15, upperLimit: null },
      'adult-man': { reference: 10, upperLimit: null },
      pregnancy: { reference: 30, upperLimit: null },
      breastfeeding: { reference: 20, upperLimit: null },
      menopause: { reference: 10, upperLimit: null },
      senior: { reference: 10, upperLimit: null },
    },
    upperLimitNote:
      'Für Eisen ist keine allgemeine Obergrenze abgeleitet. Das BfR empfiehlt in Nahrungsergänzungsmitteln maximal 6 mg pro Tag ohne ärztlich festgestellten Mangel.',
  },
  zinc: {
    unit: 'mg',
    values: {
      'child-4-10': { reference: 6, upperLimit: 10 },
      'teen-11-17': { reference: 11, upperLimit: 18 },
      'adult-woman': { reference: 8, upperLimit: 25 },
      'adult-man': { reference: 11, upperLimit: 25 },
      pregnancy: { reference: 11, upperLimit: 25 },
      breastfeeding: { reference: 13, upperLimit: 25 },
      menopause: { reference: 8, upperLimit: 25 },
      senior: { reference: 9, upperLimit: 25 },
    },
  },
  selenium: {
    unit: 'µg',
    values: {
      'child-4-10': { reference: 45, upperLimit: 130 },
      'teen-11-17': { reference: 65, upperLimit: 250 },
      'adult-woman': { reference: 60, upperLimit: 255 },
      'adult-man': { reference: 70, upperLimit: 255 },
      pregnancy: { reference: 60, upperLimit: 255 },
      breastfeeding: { reference: 75, upperLimit: 255 },
      menopause: { reference: 60, upperLimit: 255 },
      senior: { reference: 65, upperLimit: 255 },
    },
    upperLimitNote:
      'Bei Selen liegen Bedarf und Obergrenze vergleichsweise nah beieinander.',
  },
  iodine: {
    unit: 'µg',
    values: {
      'child-4-10': { reference: 120, upperLimit: 300 },
      'teen-11-17': { reference: 180, upperLimit: 500 },
      'adult-woman': { reference: 200, upperLimit: 600 },
      'adult-man': { reference: 200, upperLimit: 600 },
      pregnancy: { reference: 230, upperLimit: 600 },
      breastfeeding: { reference: 260, upperLimit: 600 },
      menopause: { reference: 180, upperLimit: 600 },
      senior: { reference: 180, upperLimit: 600 },
    },
  },
  potassium: {
    unit: 'mg',
    values: {
      'child-4-10': { reference: 2000, upperLimit: null },
      'teen-11-17': { reference: 3500, upperLimit: null },
      'adult-woman': { reference: 3500, upperLimit: null },
      'adult-man': { reference: 3500, upperLimit: null },
      pregnancy: { reference: 3500, upperLimit: null },
      breastfeeding: { reference: 4000, upperLimit: null },
      menopause: { reference: 3500, upperLimit: null },
      senior: { reference: 3500, upperLimit: null },
    },
  },
  'vitamin-d3': {
    unit: 'IE',
    values: {
      'child-4-10': { reference: 800, upperLimit: 2000 },
      'teen-11-17': { reference: 800, upperLimit: 4000 },
      'adult-woman': { reference: 800, upperLimit: 4000 },
      'adult-man': { reference: 800, upperLimit: 4000 },
      pregnancy: { reference: 800, upperLimit: 4000 },
      breastfeeding: { reference: 800, upperLimit: 4000 },
      menopause: { reference: 800, upperLimit: 4000 },
      senior: { reference: 800, upperLimit: 4000 },
    },
    upperLimitNote:
      'Der Schätzwert von 800 IE gilt bei fehlender Eigenbildung über die Haut. Höhere Dosen werden bei nachgewiesenem Mangel ärztlich verordnet.',
  },
  'vitamin-k2': {
    unit: 'µg',
    values: {
      'child-4-10': { reference: 30, upperLimit: null },
      'teen-11-17': { reference: 60, upperLimit: null },
      'adult-woman': { reference: 60, upperLimit: null },
      'adult-man': { reference: 70, upperLimit: null },
      pregnancy: { reference: 60, upperLimit: null },
      breastfeeding: { reference: 60, upperLimit: null },
      menopause: { reference: 65, upperLimit: null },
      senior: { reference: 80, upperLimit: null },
    },
    upperLimitNote:
      'Für Vitamin K ist keine Obergrenze abgeleitet. Relevant ist stattdessen die Wechselwirkung mit Gerinnungshemmern.',
  },
  'vitamin-c': {
    unit: 'mg',
    values: {
      'child-4-10': { reference: 65, upperLimit: null },
      'teen-11-17': { reference: 100, upperLimit: null },
      'adult-woman': { reference: 95, upperLimit: null },
      'adult-man': { reference: 110, upperLimit: null },
      pregnancy: { reference: 105, upperLimit: null },
      breastfeeding: { reference: 125, upperLimit: null },
      menopause: { reference: 95, upperLimit: null },
      senior: { reference: 95, upperLimit: null },
    },
    upperLimitNote:
      'Keine formale Obergrenze abgeleitet. Ab etwa 1000 mg pro Einzeldosis treten häufig Magen-Darm-Beschwerden auf.',
  },
  'vitamin-b12': {
    unit: 'µg',
    values: {
      'child-4-10': { reference: 1.5, upperLimit: null },
      'teen-11-17': { reference: 4, upperLimit: null },
      'adult-woman': { reference: 4, upperLimit: null },
      'adult-man': { reference: 4, upperLimit: null },
      pregnancy: { reference: 4.5, upperLimit: null },
      breastfeeding: { reference: 5.5, upperLimit: null },
      menopause: { reference: 4, upperLimit: null },
      senior: { reference: 4, upperLimit: null },
    },
    upperLimitNote:
      'Keine Obergrenze abgeleitet; überschüssiges B12 wird ausgeschieden. Präparate enthalten oft ein Vielfaches des Referenzwerts, weil die Aufnahme im Darm begrenzt ist.',
  },
  folate: {
    unit: 'µg',
    values: {
      'child-4-10': { reference: 180, upperLimit: 400 },
      'teen-11-17': { reference: 300, upperLimit: 800 },
      'adult-woman': { reference: 300, upperLimit: 1000 },
      'adult-man': { reference: 300, upperLimit: 1000 },
      pregnancy: { reference: 550, upperLimit: 1000 },
      breastfeeding: { reference: 450, upperLimit: 1000 },
      menopause: { reference: 300, upperLimit: 1000 },
      senior: { reference: 300, upperLimit: 1000 },
    },
    upperLimitNote:
      'Die Obergrenze bezieht sich auf synthetische Folsäure aus Präparaten und angereicherten Lebensmitteln, nicht auf natürliches Folat.',
  },
  'vitamin-b6': {
    unit: 'mg',
    values: {
      'child-4-10': { reference: 0.7, upperLimit: 7 },
      'teen-11-17': { reference: 1.4, upperLimit: 20 },
      'adult-woman': { reference: 1.4, upperLimit: 12 },
      'adult-man': { reference: 1.6, upperLimit: 12 },
      pregnancy: { reference: 1.8, upperLimit: 12 },
      breastfeeding: { reference: 1.9, upperLimit: 12 },
      menopause: { reference: 1.4, upperLimit: 12 },
      senior: { reference: 1.4, upperLimit: 12 },
    },
    upperLimitNote:
      'Die EFSA hat die Obergrenze 2023 auf 12 mg pro Tag gesenkt. Dauerhaft höhere Zufuhr kann Nervenschäden verursachen.',
  },
  'vitamin-a': {
    unit: 'µg',
    values: {
      'child-4-10': { reference: 500, upperLimit: 1100 },
      'teen-11-17': { reference: 900, upperLimit: 2600 },
      'adult-woman': { reference: 700, upperLimit: 3000 },
      'adult-man': { reference: 850, upperLimit: 3000 },
      pregnancy: { reference: 800, upperLimit: 3000 },
      breastfeeding: { reference: 1300, upperLimit: 3000 },
      menopause: { reference: 700, upperLimit: 3000 },
      senior: { reference: 700, upperLimit: 3000 },
    },
    upperLimitNote:
      'Werte in µg Retinol-Äquivalent. In der Schwangerschaft ist vorgeformtes Vitamin A besonders kritisch — hier gelten deutlich strengere praktische Empfehlungen als die formale Obergrenze.',
  },
  'vitamin-e': {
    unit: 'mg',
    values: {
      'child-4-10': { reference: 10, upperLimit: 160 },
      'teen-11-17': { reference: 13, upperLimit: 260 },
      'adult-woman': { reference: 12, upperLimit: 300 },
      'adult-man': { reference: 14, upperLimit: 300 },
      pregnancy: { reference: 13, upperLimit: 300 },
      breastfeeding: { reference: 17, upperLimit: 300 },
      menopause: { reference: 12, upperLimit: 300 },
      senior: { reference: 12, upperLimit: 300 },
    },
  },
  'omega-3': {
    unit: 'mg',
    values: {
      'child-4-10': { reference: 250, upperLimit: null },
      'teen-11-17': { reference: 250, upperLimit: null },
      'adult-woman': { reference: 250, upperLimit: 5000 },
      'adult-man': { reference: 250, upperLimit: 5000 },
      pregnancy: { reference: 450, upperLimit: 5000 },
      breastfeeding: { reference: 450, upperLimit: 5000 },
      menopause: { reference: 250, upperLimit: 5000 },
      senior: { reference: 250, upperLimit: 5000 },
    },
    upperLimitNote:
      'Werte beziehen sich auf EPA + DHA zusammen, nicht auf die Gesamtmenge Öl. In Schwangerschaft und Stillzeit wird zusätzlich DHA berücksichtigt.',
  },
};

export function getLifeStage(id) {
  return LIFE_STAGES.find((stage) => stage.id === id) ?? null;
}

export function getReferenceValue(substanceId, lifeStageId) {
  const entry = referenceValues[substanceId];
  if (!entry) return null;

  const value = entry.values?.[lifeStageId];
  if (!value) return null;

  return {
    substanceId,
    lifeStageId,
    unit: entry.unit,
    reference: value.reference ?? null,
    upperLimit: value.upperLimit ?? null,
    upperLimitNote: entry.upperLimitNote ?? '',
  };
}
