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

  // ── Erweiterung Juli 2026 ──────────────────────────────────
  biotin: {
    unit: 'µg',
    values: {
      'child-4-10': { reference: 25, upperLimit: null },
      'teen-11-17': { reference: 35, upperLimit: null },
      'adult-woman': { reference: 40, upperLimit: null },
      'adult-man': { reference: 40, upperLimit: null },
      pregnancy: { reference: 40, upperLimit: null },
      breastfeeding: { reference: 45, upperLimit: null },
      menopause: { reference: 40, upperLimit: null },
      senior: { reference: 40, upperLimit: null },
    },
    upperLimitNote:
      'Keine Obergrenze abgeleitet (SCF 2001, bestätigt BfR 2024). Ab ca. 150 µg/Tag sind Verfälschungen bestimmter Labor-Bluttests dokumentiert — vor Bluttests relevant, unabhängig von einer Obergrenze.',
  },
  niacin: {
    unit: 'mg',
    values: {
      'child-4-10': { reference: 10, upperLimit: null },
      'teen-11-17': { reference: 13, upperLimit: null },
      'adult-woman': { reference: 13, upperLimit: null },
      'adult-man': { reference: 16, upperLimit: null },
      pregnancy: { reference: 16, upperLimit: null },
      breastfeeding: { reference: 16, upperLimit: null },
      menopause: { reference: 13, upperLimit: null },
      senior: { reference: 13, upperLimit: null },
    },
    upperLimitNote:
      'Obergrenze bewusst weggelassen: Sie unterscheidet sich um mehr als das 200-Fache zwischen den chemischen Formen (Nicotinsäure ca. 10 mg/Tag, Nicotinamid ca. 900 mg/Tag) — eine einzelne Zahl würde eine der beiden Formen falsch bewerten. Details siehe "Formen im Vergleich".',
  },
  riboflavin: {
    unit: 'mg',
    values: {
      'child-4-10': { reference: 0.9, upperLimit: null },
      'teen-11-17': { reference: 1.3, upperLimit: null },
      'adult-woman': { reference: 1.1, upperLimit: null },
      'adult-man': { reference: 1.4, upperLimit: null },
      pregnancy: { reference: 1.4, upperLimit: null },
      breastfeeding: { reference: 1.4, upperLimit: null },
      menopause: { reference: 1.1, upperLimit: null },
      senior: { reference: 1.1, upperLimit: null },
    },
    upperLimitNote: 'Keine Obergrenze abgeleitet (SCF 2000, bestätigt BfR 2024).',
  },
  thiamin: {
    unit: 'mg',
    values: {
      'child-4-10': { reference: 0.8, upperLimit: null },
      'teen-11-17': { reference: 1.2, upperLimit: null },
      'adult-woman': { reference: 1.0, upperLimit: null },
      'adult-man': { reference: 1.2, upperLimit: null },
      pregnancy: { reference: 1.3, upperLimit: null },
      breastfeeding: { reference: 1.3, upperLimit: null },
      menopause: { reference: 1.0, upperLimit: null },
      senior: { reference: 1.0, upperLimit: null },
    },
    upperLimitNote: 'Keine Obergrenze abgeleitet (SCF 2001, bestätigt BfR 2024).',
  },
  pantothensaeure: {
    unit: 'mg',
    values: {
      'child-4-10': { reference: 4, upperLimit: null },
      'teen-11-17': { reference: 5, upperLimit: null },
      'adult-woman': { reference: 6, upperLimit: null },
      'adult-man': { reference: 6, upperLimit: null },
      pregnancy: { reference: 6, upperLimit: null },
      breastfeeding: { reference: 6, upperLimit: null },
      menopause: { reference: 6, upperLimit: null },
      senior: { reference: 6, upperLimit: null },
    },
    upperLimitNote: 'Keine Obergrenze abgeleitet (SCF 2002, bestätigt BfR 2024).',
  },
  choline: {
    unit: 'mg',
    values: {
      'child-4-10': { reference: 240, upperLimit: null },
      'teen-11-17': { reference: 340, upperLimit: null },
      'adult-woman': { reference: 400, upperLimit: null },
      'adult-man': { reference: 400, upperLimit: null },
      pregnancy: { reference: 480, upperLimit: null },
      breastfeeding: { reference: 520, upperLimit: null },
      menopause: { reference: 400, upperLimit: null },
      senior: { reference: 400, upperLimit: null },
    },
    upperLimitNote:
      'Referenzwert von EFSA (2016), da die DGE keinen eigenen D-A-CH-Wert für Cholin veröffentlicht hat. EFSA hat keine Obergrenze abgeleitet (Datenlage laut EFSA unzureichend).',
  },
  manganese: {
    unit: 'mg',
    values: {
      'adult-woman': { reference: 3, upperLimit: 8 },
      'adult-man': { reference: 3, upperLimit: 8 },
      pregnancy: { reference: 3, upperLimit: 8 },
      breastfeeding: { reference: 3, upperLimit: 8 },
      menopause: { reference: 3, upperLimit: 8 },
      senior: { reference: 3, upperLimit: 8 },
    },
    upperLimitNote:
      'Werte von EFSA (Adequate Intake 3 mg/Tag, sichere Gesamtzufuhr 8 mg/Tag, 2023) — präziser als die DGE-Schätzspanne (2–5 mg/Tag). Für Kinder und Jugendliche liegt kein eigener EFSA-Wert vor, deshalb hier ohne Eintrag statt geraten.',
  },
  copper: {
    unit: 'mg',
    values: {
      'adult-woman': { reference: 1.3, upperLimit: 5 },
      'adult-man': { reference: 1.6, upperLimit: 5 },
      pregnancy: { reference: 1.3, upperLimit: 5 },
      breastfeeding: { reference: 1.3, upperLimit: 5 },
      menopause: { reference: 1.3, upperLimit: 5 },
      senior: { reference: 1.3, upperLimit: 5 },
    },
    upperLimitNote:
      'Werte von EFSA (2015). Die Obergrenze von 5 mg/Tag gilt laut BfR ausdrücklich nicht für Kinder und Jugendliche, deren übliche Ernährung bereits vergleichsweise viel Kupfer liefert — für diese Gruppen deshalb kein Eintrag statt eines falsch übertragenen Erwachsenenwerts.',
  },
  phosphorus: {
    unit: 'mg',
    values: {
      'child-4-10': { reference: 500, upperLimit: null },
      'teen-11-17': { reference: 660, upperLimit: null },
      'adult-woman': { reference: 550, upperLimit: null },
      'adult-man': { reference: 550, upperLimit: null },
      pregnancy: { reference: 550, upperLimit: null },
      breastfeeding: { reference: 550, upperLimit: null },
      menopause: { reference: 550, upperLimit: null },
      senior: { reference: 550, upperLimit: null },
    },
    upperLimitNote:
      'DGE-Referenzwerte (2022er Neuableitung). Weder DGE noch EFSA haben eine Obergrenze abgeleitet. Das BfR rät von gezielter Phosphor-Zugabe in Nahrungsergänzungsmitteln grundsätzlich ab — eigenständige Phosphor-Präparate sind entsprechend unüblich.',
  },
  // Substanzen ohne echten Referenzwert (nicht essenziell), aber mit einer
  // EFSA-Sicherheitsobergrenze: reference bewusst null, damit die App nicht
  // "unter Referenzwert" anzeigt, wo es gar keinen anzustrebenden Zielwert
  // gibt (siehe REFERENCE_STATUS.SAFE_LEVEL in ReferenceCheck.js).
  betaine: {
    unit: 'mg',
    values: {
      'adult-woman': { reference: null, upperLimit: 400 },
      'adult-man': { reference: null, upperLimit: 400 },
      pregnancy: { reference: null, upperLimit: 400 },
      breastfeeding: { reference: null, upperLimit: 400 },
      menopause: { reference: null, upperLimit: 400 },
      senior: { reference: null, upperLimit: 400 },
    },
    upperLimitNote:
      'EFSA-Sicherheitsbewertung (2017): 6 mg/kg Körpergewicht/Tag zusätzlich zur Ernährung, hier für ca. 65 kg Körpergewicht auf 400 mg gerundet. Für Sporttreibende ab 10 Jahren wurde eine höhere Menge (bis 2,5 g/Tag) bewertet — individuelles Körpergewicht und Sportkontext bitte gegen die Originalquelle prüfen.',
  },
  astaxanthin: {
    unit: 'mg',
    values: {
      'adult-woman': { reference: null, upperLimit: 8 },
      'adult-man': { reference: null, upperLimit: 8 },
      pregnancy: { reference: null, upperLimit: 8 },
      breastfeeding: { reference: null, upperLimit: 8 },
      menopause: { reference: null, upperLimit: 8 },
      senior: { reference: null, upperLimit: 8 },
    },
    upperLimitNote:
      'EFSA-Sicherheitsbewertung (2020): 8 mg/Tag als Gesamtaufnahme inklusive Hintergrundernährung aus Fisch/Krustentieren, nicht nur aus dem Präparat.',
  },
  resveratrol: {
    unit: 'mg',
    values: {
      'adult-woman': { reference: null, upperLimit: 150 },
      'adult-man': { reference: null, upperLimit: 150 },
    },
    upperLimitNote:
      'EU-Novel-Food-Zulassungsgrenze (2016): 150 mg/Tag, ausdrücklich nur für Erwachsene. Für Schwangerschaft, Stillzeit, Kinder und Jugendliche liegt keine Zulassung vor, deshalb hier ohne Eintrag statt eines falsch übertragenen Werts.',
  },

  // ── Erweiterung Juli 2026, zweite Runde ───────────────────
  boron: {
    unit: 'mg',
    values: {
      'child-4-10': { reference: null, upperLimit: 5 },
      'teen-11-17': { reference: null, upperLimit: 9 },
      'adult-woman': { reference: null, upperLimit: 10 },
      'adult-man': { reference: null, upperLimit: 10 },
      pregnancy: { reference: null, upperLimit: 10 },
      breastfeeding: { reference: null, upperLimit: 10 },
      menopause: { reference: null, upperLimit: 10 },
      senior: { reference: null, upperLimit: 10 },
    },
    upperLimitNote:
      'EFSA-Obergrenze (2004), kein essenzieller Nährstoff, daher kein Referenzwert. Kinderwerte gerundet aus der Altersspanne 4–6/7–10 Jahre (4/5 mg) bzw. 11–14/15–17 Jahre (7/9 mg). Das BfR empfiehlt für Nahrungsergänzungsmittel eine deutlich niedrigere Höchstmenge von 0,5 mg/Tag, da Kinder ihre Hintergrundzufuhr aus normaler Ernährung bereits ausschöpfen können — bei Kindern/Jugendlichen ist die BfR-Empfehlung praktisch relevanter als der EFSA-UL.',
  },
  pqq: {
    unit: 'mg',
    values: {
      'adult-woman': { reference: null, upperLimit: 20 },
      'adult-man': { reference: null, upperLimit: 20 },
    },
    upperLimitNote:
      'EU-Novel-Food-Zulassungsgrenze (Durchführungsverordnung (EU) 2018/1122): 20 mg/Tag, ausdrücklich nur für Erwachsene. Für Schwangerschaft, Stillzeit, Kinder und Jugendliche liegt keine Zulassung vor.',
  },
  spermidine: {
    unit: 'mg',
    values: {
      'adult-woman': { reference: null, upperLimit: 6 },
      'adult-man': { reference: null, upperLimit: 6 },
    },
    upperLimitNote:
      'EU-Novel-Food-Zulassungsgrenze (Durchführungsverordnung (EU) 2020/443) speziell für spermidinreichen Weizenkeimextrakt: 6 mg/Tag, ausdrücklich nur für Erwachsene. Gilt nicht für synthetische Spermidin-Salze, die von dieser Zulassung nicht abgedeckt sind.',
  },
  'green-tea-extract-egcg': {
    unit: 'mg',
    values: {
      'adult-woman': { reference: null, upperLimit: 800 },
      'adult-man': { reference: null, upperLimit: 800 },
    },
    upperLimitNote:
      'EFSA-Bewertung (2018): Ab 800 mg EGCG/Tag aus Nahrungsergänzungsmitteln ist mit ersten Anzeichen einer Leberschädigung zu rechnen. Aufgegossener Grüntee (kein Extrakt) gilt separat als unbedenklich. Für Schwangerschaft, Stillzeit, Kinder und Jugendliche liegen keine ausreichenden Sicherheitsdaten vor, deshalb hier ohne Eintrag.',
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
