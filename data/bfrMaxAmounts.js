/**
 * data/bfrMaxAmounts.js
 * ─────────────────────────────────────────────────────────────
 * BfR-Höchstmengenvorschläge für Nahrungsergänzungsmittel, je
 * Tagesverzehrempfehlung EINES Produkts. Dritte Referenz-Ebene neben
 * D-A-CH-Referenzwert und EFSA-UL (data/referenceValues.js):
 * Der UL beschreibt die tolerierbare GESAMTzufuhr aus allen Quellen,
 * die BfR-Höchstmenge den vorgeschlagenen Rahmen für ein einzelnes
 * Präparat (Personen ab 15 Jahren, sofern nicht anders vermerkt).
 *
 * Quelle: BfR-Stellungnahme 006/2024 (Aktualisierte Höchstmengen-
 * vorschläge) und die dort verlinkten Einzeldokumente je Nährstoff;
 * jede Substanz trägt ihr Einzeldokument zusätzlich in den sources
 * von data/substances.js. Werte 2026-09-02 gegen die Dokumenttexte
 * geprüft, inklusive der Absenkungen aus den EFSA-Aktualisierungen
 * (Vitamin B6 auf 0,9 mg, Selen auf 40 µg).
 *
 * Felder:
 *   amount  Zahl ODER null (null = keine Mengen-Höchstmenge, siehe note)
 *   unit    Einheit zur Zahl ('mg' | 'µg'), null wenn amount null
 *   note    Zusatz aus dem BfR-Dokument: Warnhinweis-Empfehlungen,
 *           Sonderfälle, Formabhängigkeit. Deskriptiv formuliert.
 *   year    Jahr des zugrunde liegenden BfR-Dokuments
 *
 * FORMULIERUNGSREGEL: Die App gibt die BfR-Vorschläge wieder, sie
 * empfiehlt nicht selbst ("Das BfR schlägt vor", nie "nimm höchstens").
 */

export const BFR_MAX_AMOUNTS = {
  'vitamin-a': {
    amount: 0.2, unit: 'mg', year: 2021,
    note: 'Hinweis-Empfehlung des BfR: Vitamin A in der Schwangerschaft nur nach ärztlicher Rücksprache.',
  },
  'vitamin-d3': { amount: 20, unit: 'µg', year: 2023, note: null },
  'vitamin-e': {
    amount: 30, unit: 'mg', year: 2021,
    note: 'Das BfR sieht für Männer ab 55 besonderen Informationsbedarf: Unkontrollierte Supplementierung kann das Prostatakrebs-Risiko erhöhen.',
  },
  'vitamin-k2': {
    amount: 25, unit: 'µg', year: 2021,
    note: 'Gilt für Vitamin K2; für Vitamin K1 nennt das BfR 80 µg. Warnhinweis-Empfehlung: Wer gerinnungshemmende Medikamente nimmt, holt vor Vitamin-K-Präparaten ärztlichen Rat ein.',
  },
  thiamin: {
    amount: null, unit: null, year: 2021,
    note: 'Keine Höchstmenge vorgeschlagen: geringe Toxizität, kein UL abgeleitet.',
  },
  riboflavin: {
    amount: null, unit: null, year: 2021,
    note: 'Keine Höchstmenge vorgeschlagen: keine belegten unerwünschten Wirkungen, kein UL abgeleitet.',
  },
  pantothensaeure: {
    amount: null, unit: null, year: 2021,
    note: 'Keine Höchstmenge vorgeschlagen: geringe Toxizität, kein UL abgeleitet.',
  },
  niacin: {
    amount: 160, unit: 'mg', year: 2021,
    note: 'Gilt für Nicotinamid; ab 16 mg je Tagesdosis empfiehlt das BfR einen Hinweis, dass Schwangere auf solche Produkte verzichten sollten. Für Nicotinsäure nennt das BfR 4 mg, für Inosithexanicotinat 4,4 mg.',
  },
  'vitamin-b6': {
    amount: 0.9, unit: 'mg', year: 2024,
    note: 'Abgesenkt 2024, nachdem die EFSA den UL von 25 auf 12 mg pro Tag reduziert hat.',
  },
  folate: {
    amount: 200, unit: 'µg', year: 2024,
    note: 'Für Frauen im gebärfähigen Alter und Schwangere im ersten Trimester nennt das BfR 400 µg Folsäure pro Tag als am besten geeignete Maßnahme zur Senkung des Neuralrohrdefekt-Risikos.',
  },
  'vitamin-b12': { amount: 25, unit: 'µg', year: 2021, note: null },
  biotin: {
    amount: null, unit: null, year: 2021,
    note: 'Keine Höchstmenge vorgeschlagen. Hinweis-Empfehlung: Wer sich einem Labortest unterzieht, informiert Arztpraxis oder Laborpersonal über die Biotin-Einnahme (Störung von Immunoassays).',
  },
  'vitamin-c': { amount: 250, unit: 'mg', year: 2021, note: null },
  sodium: {
    amount: null, unit: null, year: 2021,
    note: 'Kein Zusatz zu ernährungsphysiologischen Zwecken vorgesehen; Ausnahme sind spezielle Getränke zum Ausgleich erhöhter Natriumverluste.',
  },
  chloride: {
    amount: null, unit: null, year: 2021,
    note: 'Kein Zusatz zu ernährungsphysiologischen Zwecken vorgesehen; Chlorid kommt als Begleition anderer Zusätze vor.',
  },
  potassium: { amount: 500, unit: 'mg', year: 2021, note: null },
  calcium: {
    amount: 500, unit: 'mg', year: 2021,
    note: 'Ab 250 mg je Tagesdosis empfiehlt das BfR einen Hinweis, auf den Verzehr weiterer calciumhaltiger Präparate zu verzichten.',
  },
  phosphorus: {
    amount: null, unit: null, year: 2021,
    note: 'Kein Zusatz vorgesehen: Das BfR sieht keine Gründe für einen gezielten Phosphor-Zusatz zu Nahrungsergänzungsmitteln.',
  },
  magnesium: {
    amount: 250, unit: 'mg', year: 2021,
    note: 'Verteilt auf zwei oder mehr Portionen pro Tag.',
  },
  iron: {
    amount: 6, unit: 'mg', year: 2021,
    note: 'Warnhinweis-Empfehlung des BfR: Männer, postmenopausale Frauen und Schwangere nehmen Eisen nur nach ärztlicher Rücksprache ein.',
  },
  iodine: {
    amount: 100, unit: 'µg', year: 2021,
    note: 'Für Schwangere und Stillende nennt das BfR wegen des erhöhten Bedarfs 150 µg.',
  },
  zinc: {
    amount: 6.5, unit: 'mg', year: 2021,
    note: 'Ab 3,5 mg je Tagesdosis empfiehlt das BfR einen Hinweis, auf den Verzehr weiterer zinkhaltiger Präparate zu verzichten.',
  },
  selenium: {
    amount: 40, unit: 'µg', year: 2024,
    note: 'Abgesenkt nach der EFSA-Aktualisierung des UL auf 255 µg pro Tag.',
  },
  copper: {
    amount: 1, unit: 'mg', year: 2021,
    note: 'Nur für Produkte mit Zielgruppe Erwachsene und mit Kennzeichnung, dass das Produkt nicht für Kinder und Jugendliche geeignet ist; für Produkte, die auch für Jugendliche ab 15 vorgesehen sind, nennt das BfR null.',
  },
  manganese: { amount: 0.5, unit: 'mg', year: 2021, note: null },
  chromium: { amount: 60, unit: 'µg', year: 2021, note: null },
  molybdenum: { amount: 80, unit: 'µg', year: 2021, note: null },
  boron: {
    amount: 0.5, unit: 'mg', year: 2021,
    note: 'Hinweis-Empfehlung des BfR: nicht für Kinder und Jugendliche, deren Gesamtaufnahme aus allen Quellen die Obergrenze bereits erreichen kann.',
  },
  silicium: {
    amount: null, unit: null, year: 2021,
    note: 'Formabhängig: 350 mg Silizium als Siliziumdioxid, 100 mg als Kieselsäure (Silicagel), je 10 mg für organische Formen (Monomethylsilantriol, Cholin-stabilisierte Orthokieselsäure).',
  },
};

/**
 * getBfrMaxAmount(substanceId) => Eintrag oder null.
 */
export function getBfrMaxAmount(substanceId) {
  return BFR_MAX_AMOUNTS[substanceId] ?? null;
}
