/**
 * data/healthConditions.js
 * ─────────────────────────────────────────────────────────────
 * Verknuepfung zwischen Erkrankungen und Wirkstoffen — nach exakt dem
 * Muster von data/medicationClasses.js.
 *
 * WAS DAS HIER IST — UND WAS NICHT:
 * KEINE eigene Kontraindikations-Datenbank. Kein Eintrag wurde neu
 * recherchiert oder aus Modellwissen ergaenzt. Jede Zeile verweist mit
 * WOERTLICHEM Zitat auf einen Satz, der bereits im cautionNote der
 * jeweiligen Substanz in data/substances.js steht und dort mit Quelle
 * belegt ist. Ein Test (tests/health-conditions.test.mjs) prueft die
 * Substring-Integritaet: Wer einen cautionNote aendert, pflegt das
 * Zitat hier mit.
 *
 * KEINE BEWERTUNG DER PERSON: Ein Treffer heisst "zu diesem Stoff ist
 * ein Hinweis zu dieser Erkrankung hinterlegt", nicht "das ist fuer
 * dich gefaehrlich". Formulierung in der Oberflaeche entsprechend.
 *
 * severity wie in medicationClasses/lifeStageAdvisories:
 *   contraindicated  Quelle sagt "nicht anwenden bei ..."
 *   medical          Quelle verweist auf aerztliche Abklaerung
 *   attention        Quelle beschreibt eine moegliche Belastung
 */

export const HEALTH_CONDITIONS = [
  { id: 'hypertension', label: 'Bluthochdruck' },
  { id: 'heart-disease', label: 'Herzerkrankung' },
  { id: 'kidney-disease', label: 'Nierenerkrankung' },
  { id: 'liver-disease', label: 'Lebererkrankung' },
  { id: 'gallbladder-disease', label: 'Gallenerkrankung / Gallensteine' },
  { id: 'salicylate-intolerance', label: 'Salicylat-Unverträglichkeit / ASS-Allergie' },
  { id: 'asthma-analgesics', label: 'Asthma (durch Schmerzmittel ausgelöst)' },
  { id: 'stomach-ulcer', label: 'Magen-Darm-Geschwüre' },
];

export function getHealthCondition(id) {
  return HEALTH_CONDITIONS.find((condition) => condition.id === id) ?? null;
}

// Jedes quote ist WOERTLICH aus dem cautionNote der Substanz uebernommen
// (programmatisch extrahiert am 2026-08-09, nie von Hand getippt).
export const conditionInteractions = [
  { substanceId: 'licorice-root', conditionId: 'hypertension', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Nicht bei Bluthochdruck, Nieren- oder Lebererkrankungen und nicht in der Schwangerschaft.' },
  { substanceId: 'sodium', conditionId: 'hypertension', severity: 'medical', sourceField: 'cautionNote',
    quote: 'Wer wegen Bluthochdruck, Herz- oder Nierenerkrankung Natrium einschränken soll, bespricht Elektrolyt-Präparate ärztlich.' },
  { substanceId: 'licorice-root', conditionId: 'kidney-disease', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Nicht bei Bluthochdruck, Nieren- oder Lebererkrankungen und nicht in der Schwangerschaft.' },
  { substanceId: 'sodium', conditionId: 'kidney-disease', severity: 'medical', sourceField: 'cautionNote',
    quote: 'Wer wegen Bluthochdruck, Herz- oder Nierenerkrankung Natrium einschränken soll, bespricht Elektrolyt-Präparate ärztlich.' },
  { substanceId: 'goldenrod', conditionId: 'kidney-disease', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Nicht anwenden, wenn wegen einer Herz- oder Nierenerkrankung die Flüssigkeitszufuhr eingeschränkt ist.' },
  { substanceId: 'birch-leaf', conditionId: 'kidney-disease', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Nicht anwenden, wenn wegen einer Herz- oder Nierenerkrankung die Flüssigkeitszufuhr eingeschränkt ist.' },
  { substanceId: 'horsetail', conditionId: 'kidney-disease', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Zur Durchspülung ausreichend trinken; nicht bei eingeschränkter Flüssigkeitszufuhr wegen Herz- oder Nierenerkrankung.' },
  { substanceId: 'lovage-root', conditionId: 'kidney-disease', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Zur Durchspülung ausreichend trinken; nicht bei eingeschränkter Flüssigkeitszufuhr wegen Herz- oder Nierenerkrankung.' },
  { substanceId: 'nettle-leaf', conditionId: 'kidney-disease', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Zur Durchspülung ausreichend trinken; nicht bei eingeschränkter Flüssigkeitszufuhr wegen Herz- oder Nierenerkrankung.' },
  { substanceId: 'horse-chestnut', conditionId: 'kidney-disease', severity: 'medical', sourceField: 'cautionNote',
    quote: 'Für Schwangerschaft und Stillzeit sowie bei Nieren- oder Lebererkrankungen ärztlich abklären.' },
  { substanceId: 'licorice-root', conditionId: 'liver-disease', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Nicht bei Bluthochdruck, Nieren- oder Lebererkrankungen und nicht in der Schwangerschaft.' },
  { substanceId: 'peppermint-oil', conditionId: 'liver-disease', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Nicht bei Verschluss der Gallenwege, Gallenblasenentzündung oder schweren Leberschäden.' },
  { substanceId: 'cinnamon', conditionId: 'liver-disease', severity: 'attention', sourceField: 'cautionNote',
    quote: 'Cassia-Zimt enthält Cumarin, das in hohen regelmäßigen Mengen die Leber belasten kann (BfR-Bewertung); für die regelmäßige Einnahme Ceylon-Zimt bevorzugen.' },
  { substanceId: 'horse-chestnut', conditionId: 'liver-disease', severity: 'medical', sourceField: 'cautionNote',
    quote: 'Für Schwangerschaft und Stillzeit sowie bei Nieren- oder Lebererkrankungen ärztlich abklären.' },
  { substanceId: 'hawthorn', conditionId: 'heart-disease', severity: 'medical', sourceField: 'cautionNote',
    quote: 'Herzbeschwerden gehören grundsätzlich in ärztliche Abklärung; Weißdorn ersetzt keine Herzmedikation.' },
  { substanceId: 'motherwort', conditionId: 'heart-disease', severity: 'medical', sourceField: 'cautionNote',
    quote: 'Herzbeschwerden gehören grundsätzlich in ärztliche Abklärung.' },
  { substanceId: 'sodium', conditionId: 'heart-disease', severity: 'medical', sourceField: 'cautionNote',
    quote: 'Wer wegen Bluthochdruck, Herz- oder Nierenerkrankung Natrium einschränken soll, bespricht Elektrolyt-Präparate ärztlich.' },
  { substanceId: 'willow-bark', conditionId: 'salicylate-intolerance', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Nicht bei Salicylat-Unverträglichkeit oder Asthma durch Schmerzmittel (ASS).' },
  { substanceId: 'meadowsweet', conditionId: 'salicylate-intolerance', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Enthält Salicylate: nicht bei Salicylat-Unverträglichkeit oder ASS-Allergie, nicht für Kinder und Jugendliche mit fieberhaften Infekten.' },
  { substanceId: 'ginger', conditionId: 'gallbladder-disease', severity: 'medical', sourceField: 'cautionNote',
    quote: 'Bei Gallensteinen vor der Einnahme ärztlich abklären.' },
  { substanceId: 'artichoke', conditionId: 'gallbladder-disease', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Nicht bei Verschluss der Gallenwege; bei Gallensteinen nur nach ärztlicher Rücksprache.' },
  { substanceId: 'peppermint-oil', conditionId: 'gallbladder-disease', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Nicht bei Verschluss der Gallenwege, Gallenblasenentzündung oder schweren Leberschäden.' },
  { substanceId: 'dandelion', conditionId: 'gallbladder-disease', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Nicht bei Verschluss der Gallenwege oder aktiven Gallensteinen; bei Gallenerkrankungen ärztlich abklären.' },
  { substanceId: 'wormwood', conditionId: 'gallbladder-disease', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Nicht bei Gallenwegsverschluss oder Magen-Darm-Geschwüren.' },
  { substanceId: 'willow-bark', conditionId: 'asthma-analgesics', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Nicht bei Salicylat-Unverträglichkeit oder Asthma durch Schmerzmittel (ASS).' },
  { substanceId: 'wormwood', conditionId: 'stomach-ulcer', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Nicht bei Gallenwegsverschluss oder Magen-Darm-Geschwüren.' },
];

export function getInteractionsForConditions(conditionIds = []) {
  const wanted = new Set(conditionIds);
  return conditionInteractions.filter((entry) => wanted.has(entry.conditionId));
}
