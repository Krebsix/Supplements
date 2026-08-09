/**
 * data/medicationClasses.js
 * ─────────────────────────────────────────────────────────────
 * Verknuepfung zwischen Medikamentengruppen und Wirkstoffen.
 *
 * WAS DAS HIER IST — UND WAS NICHT:
 * Das ist KEINE Interaktionsdatenbank. Kein einziger Eintrag hier wurde
 * neu recherchiert oder aus Modellwissen ergaenzt. Jede Zeile verweist auf
 * einen Satz, der bereits in data/substances.js oder
 * data/lifeStageAdvisories.js steht und dort mit Quelle belegt ist.
 *
 * Der Grund ist regulatorisch und fachlich: Medikamenten-Wechselwirkungen
 * gehoeren in eine kuratierte oder lizenzierte Fachdatenbank. Ein
 * Sprachmodell ist dafuer keine zulaessige Quelle. Was diese Datei leistet,
 * ist deshalb bewusst enger: Sie macht vorhandene, belegte Hinweise
 * auffindbar, wenn jemand angibt, ein Medikament dieser Gruppe zu nehmen.
 *
 * Das `quote`-Feld traegt den Originalsatz. Die App zeigt ihn woertlich an
 * — nicht paraphrasiert — damit die Aussage gegen die Quelle pruefbar
 * bleibt. Wer den Hinweis anzweifelt, kann ihn nachlesen.
 *
 * KEINE BEWERTUNG DER PERSON:
 * Ein Treffer bedeutet "zu diesem Stoff ist ein Hinweis auf diese
 * Medikamentengruppe hinterlegt", nicht "das ist fuer dich gefaehrlich".
 * Die App kennt weder Dosis noch Praeparat noch Befund. Die Formulierung
 * in der Oberflaeche muss das offenhalten.
 *
 * severity (wie in data/lifeStageAdvisories.js):
 *   contraindicated  Quelle nennt die Kombination ausdruecklich kontraindiziert
 *   medical          Quelle verweist auf aerztliche Abklaerung
 *   attention        Quelle beschreibt eine moegliche Beeinflussung
 */

export const MEDICATION_CLASSES = [
  {
    id: 'anticoagulants',
    label: 'Gerinnungshemmer / Blutverdünner',
    examples: 'z. B. Marcumar, Phenprocoumon, Warfarin, ASS, DOAK',
  },
  {
    id: 'antidepressants',
    label: 'Antidepressiva',
    examples: 'SSRI, SNRI, MAO-Hemmer',
  },
  {
    id: 'thyroid',
    label: 'Schilddrüsenhormone',
    examples: 'z. B. L-Thyroxin, Levothyroxin',
  },
  {
    id: 'immunosuppressants',
    label: 'Immunsuppressiva',
    examples: 'z. B. Ciclosporin, Tacrolimus, etwa nach Transplantation',
  },
  {
    id: 'antidiabetics',
    label: 'Diabetes-Medikamente',
    examples: 'z. B. Metformin, Insulin',
  },
  {
    id: 'antihypertensives',
    label: 'Blutdruckmittel',
    examples: 'z. B. ACE-Hemmer, Sartane, Diuretika, Calciumkanalblocker',
  },
  {
    id: 'statins',
    label: 'Statine / Cholesterinsenker',
    examples: 'z. B. Simvastatin, Atorvastatin',
  },
  {
    id: 'antibiotics',
    label: 'Antibiotika',
    examples: 'z. B. Tetracycline, Gyrasehemmer',
  },
  {
    id: 'chemotherapy',
    label: 'Zytostatika / Chemotherapie',
    examples: 'z. B. Irinotecan, Imatinib',
  },
  {
    id: 'protease-inhibitors',
    label: 'Protease-Inhibitoren',
    examples: 'HIV-Therapie, z. B. Indinavir',
  },
  {
    id: 'contraceptives',
    label: 'Hormonelle Verhütung',
    examples: 'Pille, Hormonpflaster, Hormonspirale',
  },
  {
    id: 'cyp3a4',
    label: 'Arzneimittel mit CYP3A4-Abhängigkeit',
    examples: 'viele Wirkstoffe, im Zweifel in der Packungsbeilage nachsehen',
  },
  {
    id: 'sedatives',
    label: 'Beruhigungs- und Schlafmittel',
    examples: 'z. B. Benzodiazepine, Sedativa',
  },
  {
    id: 'gastric-acid',
    label: 'Magensäurehemmer',
    examples: 'Protonenpumpenhemmer, z. B. Pantoprazol, Omeprazol',
  },
  {
    id: 'dopaminergic',
    label: 'Dopaminwirksame Medikamente',
    examples: 'z. B. Prolaktinhemmer, Parkinson-Medikamente',
  },
];

export function getMedicationClass(id) {
  return MEDICATION_CLASSES.find((entry) => entry.id === id) ?? null;
}

/**
 * Belegte Bezuege zwischen Wirkstoff und Medikamentengruppe.
 * `quote` ist woertlich aus dem angegebenen Feld uebernommen — beim
 * Aendern eines cautionNote in substances.js gehoert das Zitat hier
 * mitgepflegt. Ein Test prueft, dass jedes Zitat noch im Quelltext steht.
 */
export const medicationInteractions = [
  // ── Gerinnungshemmer ────────────────────────────────────────
  { substanceId: 'bromelain', medicationClassId: 'anticoagulants', severity: 'attention', sourceField: 'cautionNote',
    quote: 'Als proteinspaltendes Enzym wird eine mögliche Wechselwirkung mit gerinnungshemmenden Wirkstoffen diskutiert.' },
  { substanceId: 'chaga', medicationClassId: 'anticoagulants', severity: 'attention', sourceField: 'cautionNote',
    quote: 'Zusätzlich erhöhtes Blutungsrisiko mit Antikoagulanzien/Thrombozytenaggregationshemmern und additive blutzuckersenkende Effekte mit Antidiabetika.' },
  { substanceId: 'chondroitin', medicationClassId: 'anticoagulants', severity: 'attention', sourceField: 'cautionNote',
    quote: 'Wie Glucosamin mit einem beschriebenen erhöhten Blutungsrisiko unter Warfarin assoziiert.' },
  { substanceId: 'cordyceps', medicationClassId: 'anticoagulants', severity: 'attention', sourceField: 'cautionNote',
    quote: 'Ein Fall verstärkter Blutung nach Zahnextraktion ist dokumentiert, dazu theoretisch erhöhtes Blutungsrisiko durch Hemmung der Thrombozytenaggregation (relevant in Kombination mit Antikoagulanzien) und additive Effekte mit Antidiabetika/Insulin.' },
  { substanceId: 'cranberry-extract', medicationClassId: 'anticoagulants', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Die EMA-Monographie nennt als Kontraindikation die gleichzeitige Einnahme von Tacrolimus und Warfarin' },
  { substanceId: 'flaxseed-oil', medicationClassId: 'anticoagulants', severity: 'attention', sourceField: 'cautionNote',
    quote: 'NCCIH nennt theoretische Wechselwirkungen mit gerinnungshemmenden Medikamenten (Antikoagulantien/Thrombozytenaggregationshemmer).' },
  { substanceId: 'glucosamine', medicationClassId: 'anticoagulants', severity: 'attention', sourceField: 'cautionNote',
    quote: 'in Kombination mit dem Gerinnungshemmer Warfarin wird ein erhöhtes Blutungsrisiko beschrieben.' },
  { substanceId: 'maitake', medicationClassId: 'anticoagulants', severity: 'attention', sourceField: 'cautionNote',
    quote: 'Ein Fallbericht mit INR-Anstieg unter Maitake-Extrakt in Kombination mit Warfarin ist dokumentiert' },
  { substanceId: 'nattokinase', medicationClassId: 'anticoagulants', severity: 'attention', sourceField: 'cautionNote',
    quote: 'Kann die Wirkung von Antikoagulanzien/Thrombozytenaggregationshemmern' },
  { substanceId: 'phosphatidylserine', medicationClassId: 'anticoagulants', severity: 'attention', sourceField: 'cautionNote',
    quote: 'In Sekundärquellen wird eine theoretische Wechselwirkung mit gerinnungshemmenden Medikamenten diskutiert' },
  { substanceId: 'reishi', medicationClassId: 'anticoagulants', severity: 'attention', sourceField: 'cautionNote',
    quote: 'erhöhtes Blutungsrisiko in Kombination mit Antikoagulanzien/Thrombozytenaggregationshemmern' },
  { substanceId: 'st-johns-wort', medicationClassId: 'anticoagulants', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Die gleichzeitige Einnahme mit Cumarin-Antikoagulanzien, Ciclosporin, Tacrolimus, Sirolimus, Everolimus, Proteaseinhibitoren und bestimmten Zytostatika (u. a. Irinotecan, Imatinib) ist laut Monographie kontraindiziert.' },
  { substanceId: 'vitamin-e', medicationClassId: 'anticoagulants', severity: 'attention', sourceField: 'advisory',
    quote: 'Höhere Dosen können die Blutungsneigung erhöhen: relevant bei Gerinnungshemmern und vor Operationen.' },
  { substanceId: 'vitamin-k2', medicationClassId: 'anticoagulants', severity: 'medical', sourceField: 'advisory',
    quote: 'Bei Einnahme von Vitamin-K-Antagonisten (Cumarine wie Marcumar/Warfarin) beeinflusst Vitamin K direkt die Wirkung des Medikaments. Nur nach ärztlicher Absprache.' },
  { substanceId: 'omega-3', medicationClassId: 'anticoagulants', severity: 'medical', sourceField: 'advisory',
    quote: 'Bei Einnahme von Gerinnungshemmern und vor geplanten Operationen ist die Dosierung ärztlich abzuklären.' },
  { substanceId: 'ginkgo-biloba', medicationClassId: 'anticoagulants', severity: 'medical', sourceField: 'cautionNote',
    quote: 'Kann die Blutgerinnung beeinflussen' },

  // ── Antidepressiva ──────────────────────────────────────────
  { substanceId: '5-htp', medicationClassId: 'antidepressants', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Nicht mit serotonerg wirkenden Medikamenten' },
  { substanceId: 'l-tryptophan', medicationClassId: 'antidepressants', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Nicht mit serotonerg wirkenden Medikamenten' },
  { substanceId: 'methylene-blue', medicationClassId: 'antidepressants', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Methylenblau wirkt als potenter MAO-A-Hemmer' },
  { substanceId: 'st-johns-wort', medicationClassId: 'antidepressants', severity: 'attention', sourceField: 'cautionNote',
    quote: 'In Kombination mit Serotonin-Wiederaufnahmehemmern wurde in sehr seltenen Fällen ein Serotonin-Syndrom beobachtet.' },

  // ── Schilddruesenhormone ────────────────────────────────────
  { substanceId: 'l-tyrosine', medicationClassId: 'thyroid', severity: 'medical', sourceField: 'advisory',
    quote: 'Bei Schilddrüsenüberfunktion und bei Einnahme von Schilddrüsenhormonen oder MAO-Hemmern ärztlich abklären.' },
  { substanceId: 'ashwagandha', medicationClassId: 'thyroid', severity: 'medical', sourceField: 'advisory',
    quote: 'Bei Schilddrüsenerkrankungen und bei Einnahme von Schilddrüsen- oder Beruhigungsmedikamenten ist eine ärztliche Abklärung üblich.' },
  { substanceId: 'colloidal-silver', medicationClassId: 'thyroid', severity: 'attention', sourceField: 'cautionNote',
    quote: 'Silber kann zudem die Aufnahme bestimmter Medikamente hemmen (u. a. Antibiotika, L-Thyroxin).' },

  // ── Immunsuppressiva ────────────────────────────────────────
  { substanceId: 'black-seed-oil', medicationClassId: 'immunosuppressants', severity: 'attention', sourceField: 'cautionNote',
    quote: 'Wechselwirkungen mit Blutverdünnern (erhöhtes Blutungsrisiko), Blutdruckmedikamenten, Diabetesmedikamenten und Immunsuppressiva werden in Sekundärquellen beschrieben' },
  { substanceId: 'cranberry-extract', medicationClassId: 'immunosuppressants', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Die EMA-Monographie nennt als Kontraindikation die gleichzeitige Einnahme von Tacrolimus und Warfarin' },
  { substanceId: 'echinacea', medicationClassId: 'immunosuppressants', severity: 'attention', sourceField: 'cautionNote',
    quote: 'NCCIH weist ergänzend auf theoretische, nicht abschließend geklärte Wechselwirkungsbedenken bei Immunsuppressiva hin.' },
  { substanceId: 'grapefruit-seed-extract', medicationClassId: 'immunosuppressants', severity: 'medical', sourceField: 'advisory',
    quote: 'Bei Einnahme CYP3A4-abhängiger Medikamente (z. B. Immunsuppressiva, bestimmte Statine/Calciumkanalblocker) vor Anwendung ärztliche Rücksprache wegen möglicher Wechselwirkung.' },
  { substanceId: 'reishi', medicationClassId: 'immunosuppressants', severity: 'attention', sourceField: 'cautionNote',
    quote: 'mögliche Verstärkung von Immunsuppressiva-Wirkung' },
  { substanceId: 'st-johns-wort', medicationClassId: 'immunosuppressants', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Die gleichzeitige Einnahme mit Cumarin-Antikoagulanzien, Ciclosporin, Tacrolimus, Sirolimus, Everolimus, Proteaseinhibitoren und bestimmten Zytostatika (u. a. Irinotecan, Imatinib) ist laut Monographie kontraindiziert.' },

  // ── Diabetes-Medikamente ────────────────────────────────────
  { substanceId: 'alpha-lipoic-acid', medicationClassId: 'antidiabetics', severity: 'attention', sourceField: 'cautionNote',
    quote: 'Kann die blutzuckersenkende Wirkung von Insulin/Antidiabetika verstärken' },
  { substanceId: 'berberine', medicationClassId: 'antidiabetics', severity: 'medical', sourceField: 'cautionNote',
    quote: 'Wechselwirkungen mit Statinen, Metformin/Antidiabetika und Blutdrucksenkern werden in der Literatur beschrieben.' },
  { substanceId: 'black-seed-oil', medicationClassId: 'antidiabetics', severity: 'attention', sourceField: 'cautionNote',
    quote: 'Wechselwirkungen mit Blutverdünnern (erhöhtes Blutungsrisiko), Blutdruckmedikamenten, Diabetesmedikamenten und Immunsuppressiva werden in Sekundärquellen beschrieben' },
  { substanceId: 'chaga', medicationClassId: 'antidiabetics', severity: 'attention', sourceField: 'cautionNote',
    quote: 'additive blutzuckersenkende Effekte mit Antidiabetika' },
  { substanceId: 'cordyceps', medicationClassId: 'antidiabetics', severity: 'attention', sourceField: 'cautionNote',
    quote: 'additive Effekte mit Antidiabetika/Insulin' },
  { substanceId: 'maitake', medicationClassId: 'antidiabetics', severity: 'attention', sourceField: 'cautionNote',
    quote: 'additive blutzuckersenkende Effekte mit Antidiabetika' },

  // ── Blutdruckmittel ─────────────────────────────────────────
  { substanceId: 'potassium', medicationClassId: 'antihypertensives', severity: 'medical', sourceField: 'advisory',
    quote: 'bestimmten Blutdruckmedikamenten' },
  { substanceId: 'berberine', medicationClassId: 'antihypertensives', severity: 'medical', sourceField: 'cautionNote',
    quote: 'Wechselwirkungen mit Statinen, Metformin/Antidiabetika und Blutdrucksenkern werden in der Literatur beschrieben.' },
  { substanceId: 'black-seed-oil', medicationClassId: 'antihypertensives', severity: 'attention', sourceField: 'cautionNote',
    quote: 'Wechselwirkungen mit Blutverdünnern (erhöhtes Blutungsrisiko), Blutdruckmedikamenten, Diabetesmedikamenten und Immunsuppressiva werden in Sekundärquellen beschrieben' },

  // ── Statine ─────────────────────────────────────────────────
  { substanceId: 'coq10', medicationClassId: 'statins', severity: 'attention', sourceField: 'advisory',
    quote: 'Häufiges Anwendungsgebiet ist die Begleitung einer Statin-Therapie.' },
  { substanceId: 'berberine', medicationClassId: 'statins', severity: 'medical', sourceField: 'cautionNote',
    quote: 'Wechselwirkungen mit Statinen, Metformin/Antidiabetika und Blutdrucksenkern werden in der Literatur beschrieben.' },
  { substanceId: 'grapefruit-seed-extract', medicationClassId: 'statins', severity: 'medical', sourceField: 'advisory',
    quote: 'Bei Einnahme CYP3A4-abhängiger Medikamente (z. B. Immunsuppressiva, bestimmte Statine/Calciumkanalblocker) vor Anwendung ärztliche Rücksprache wegen möglicher Wechselwirkung.' },

  // ── Antibiotika ─────────────────────────────────────────────
  { substanceId: 'colloidal-silver', medicationClassId: 'antibiotics', severity: 'attention', sourceField: 'cautionNote',
    quote: 'Silber kann zudem die Aufnahme bestimmter Medikamente hemmen (u. a. Antibiotika, L-Thyroxin).' },

  // ── Zytostatika ─────────────────────────────────────────────
  { substanceId: 'st-johns-wort', medicationClassId: 'chemotherapy', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Die gleichzeitige Einnahme mit Cumarin-Antikoagulanzien, Ciclosporin, Tacrolimus, Sirolimus, Everolimus, Proteaseinhibitoren und bestimmten Zytostatika (u. a. Irinotecan, Imatinib) ist laut Monographie kontraindiziert.' },

  // ── Protease-Inhibitoren ────────────────────────────────────
  { substanceId: 'st-johns-wort', medicationClassId: 'protease-inhibitors', severity: 'contraindicated', sourceField: 'cautionNote',
    quote: 'Die gleichzeitige Einnahme mit Cumarin-Antikoagulanzien, Ciclosporin, Tacrolimus, Sirolimus, Everolimus, Proteaseinhibitoren und bestimmten Zytostatika (u. a. Irinotecan, Imatinib) ist laut Monographie kontraindiziert.' },

  // ── Hormonelle Verhuetung ───────────────────────────────────
  { substanceId: 'chasteberry', medicationClassId: 'contraceptives', severity: 'attention', sourceField: 'cautionNote',
    quote: 'Die dopaminerge Wirkung kann mit hormonellen Kontrazeptiva und dopaminwirksamen Medikamenten interagieren.' },
  { substanceId: 'st-johns-wort', medicationClassId: 'contraceptives', severity: 'attention', sourceField: 'cautionNote',
    quote: 'Die Reduktion der Plasmakonzentration hormoneller Kontrazeptiva kann zu vermehrten Zwischenblutungen und verminderter Verhütungssicherheit führen.' },

  // ── CYP3A4 ──────────────────────────────────────────────────
  { substanceId: 'agaricus-blazei', medicationClassId: 'cyp3a4', severity: 'attention', sourceField: 'cautionNote',
    quote: 'Kann CYP3A4 hemmen und so den Abbau anderer Medikamente beeinflussen.' },
  { substanceId: 'grapefruit-seed-extract', medicationClassId: 'cyp3a4', severity: 'medical', sourceField: 'advisory',
    quote: 'Bei Einnahme CYP3A4-abhängiger Medikamente (z. B. Immunsuppressiva, bestimmte Statine/Calciumkanalblocker) vor Anwendung ärztliche Rücksprache wegen möglicher Wechselwirkung.' },
  { substanceId: 'st-johns-wort', medicationClassId: 'cyp3a4', severity: 'attention', sourceField: 'cautionNote',
    quote: 'induzieren Johanniskraut-Zubereitungen nachweislich CYP3A4, CYP2B6, CYP2C9, CYP2C19 und P-Glykoprotein' },

  // ── Beruhigungs- und Schlafmittel ───────────────────────────
  { substanceId: 'ashwagandha', medicationClassId: 'sedatives', severity: 'medical', sourceField: 'advisory',
    quote: 'Bei Schilddrüsenerkrankungen und bei Einnahme von Schilddrüsen- oder Beruhigungsmedikamenten ist eine ärztliche Abklärung üblich.' },

  // ── Magensaeurehemmer ───────────────────────────────────────
  { substanceId: 'vitamin-b12', medicationClassId: 'gastric-acid', severity: 'attention', sourceField: 'useCase',
    quote: 'Dauereinnahme kann die B12-Aufnahme reduzieren' },

  // ── Dopaminwirksame Medikamente ─────────────────────────────
  { substanceId: 'chasteberry', medicationClassId: 'dopaminergic', severity: 'attention', sourceField: 'cautionNote',
    quote: 'Die dopaminerge Wirkung kann mit hormonellen Kontrazeptiva und dopaminwirksamen Medikamenten interagieren.' },
];

/**
 * getInteractionsForClasses(classIds)
 * Alle belegten Bezuege zu den angegebenen Medikamentengruppen.
 */
export function getInteractionsForClasses(classIds = []) {
  if (!Array.isArray(classIds) || classIds.length === 0) return [];
  return medicationInteractions.filter((entry) =>
    classIds.includes(entry.medicationClassId)
  );
}
