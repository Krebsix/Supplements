/**
 * SupplementResearchLogic.js
 * ─────────────────────────────────────────────────────────────
 * Lokale Wissensdatenbank für Supplement-Recherche.
 * Kein API-Call nötig – funktioniert vollständig offline.
 *
 * Struktur pro Eintrag:
 *   slot         → primärer Einnahme-Slot (TimingEngine-ID)
 *   slotAlt      → alternativer Slot (optional)
 *   withFood     → true = immer mit Mahlzeit
 *   instruction  → kurze Anleitung (max. 80 Zeichen)
 *   blocker      → was die Aufnahme hemmt
 *   synergy      → was die Wirkung verstärkt
 *   category     → Supplement-Kategorie
 *   childSafe    → ob für Kinder geeignet
 *   cureHint     → Kur-Empfehlung (oder null)
 *   unit         → Standard-Einheit
 *   defaultDose  → typische Dosis
 */

// ─────────────────────────────────────────────────────────────
// WISSENSDATENBANK
// key = lowercase Suchbegriff (oder Teilstring)
// ─────────────────────────────────────────────────────────────
export const SUPPLEMENT_DB = {

  // ── VITAMINE (fettlöslich) ───────────────────────────────
  'vitamin d': {
    slot: 'morning', slotAlt: 'midday', withFood: true,
    instruction: 'Mit fetthaltiger Mahlzeit – steigert Aufnahme um bis zu 50%',
    blocker:  ['Statine (reduzieren Aktivierung)', 'Magnesiummangel blockiert Umwandlung'],
    synergy:  ['Vitamin K2 (Calcium-Routing)', 'Magnesium (Aktivierung)', 'Vitamin A (Balance)'],
    category: 'Vitamine (fettlöslich)', childSafe: true,
    cureHint: null, unit: 'µg', defaultDose: '25-50',
  },
  'vitamin k': {
    slot: 'morning', withFood: true,
    instruction: 'Immer mit Vitamin D3 – dirigiert Calcium in die Knochen',
    blocker:  ['Blutverdünner (Wechselwirkung – Arzt fragen!)', 'Antibiotika'],
    synergy:  ['Vitamin D3', 'Calcium', 'Magnesium'],
    category: 'Vitamine (fettlöslich)', childSafe: true,
    cureHint: null, unit: 'µg', defaultDose: '100-200',
  },
  'vitamin a': {
    slot: 'morning', withFood: true,
    instruction: 'Mit Fett – Cave: Überdosierung toxisch (max. 3000 µg/Tag)',
    blocker:  ['Zinc-Mangel blockiert Transport'],
    synergy:  ['Zink', 'Vitamin D3'],
    category: 'Vitamine (fettlöslich)', childSafe: false,
    cureHint: null, unit: 'µg', defaultDose: '700-1500',
  },
  'vitamin e': {
    slot: 'morning', withFood: true,
    instruction: 'Mit Fett – natürliches Tocotrienol bevorzugen',
    blocker:  ['Hohe Eisen-Dosen (oxidiert Vit. E)'],
    synergy:  ['Vitamin C (regeneriert Vit. E)', 'Selen'],
    category: 'Vitamine (fettlöslich)', childSafe: true,
    cureHint: null, unit: 'mg', defaultDose: '100-400',
  },
  'coq10': {
    slot: 'morning', withFood: true,
    instruction: 'Mit fetthaltiger Mahlzeit – Ubiquinol-Form bevorzugen ab 40',
    blocker:  ['Statine (halbieren CoQ10-Spiegel!)'],
    synergy:  ['PQQ', 'Omega-3', 'L-Carnitin'],
    category: 'Longevity / Mitochondrien', childSafe: false,
    cureHint: null, unit: 'mg', defaultDose: '100-300',
  },
  'omega': {
    slot: 'morning', slotAlt: 'midday', withFood: true,
    instruction: 'Mit fetthaltiger Mahlzeit – im Kühlschrank lagern',
    blocker:  ['Direkte Hitze (oxidiert Öl)', 'Blutverdünner (additive Wirkung)'],
    synergy:  ['Vitamin D3', 'CoQ10', 'Astaxanthin (Schutz vor Oxidation)'],
    category: 'Fettsäuren', childSafe: true,
    cureHint: null, unit: 'g', defaultDose: '1-3',
  },
  'astaxanthin': {
    slot: 'morning', withFood: true,
    instruction: 'Mit Fett – eines der stärksten fettlöslichen Antioxidantien',
    blocker:  [],
    synergy:  ['Omega-3', 'Vitamin E', 'Vitamin C'],
    category: 'Antioxidantien', childSafe: true,
    cureHint: null, unit: 'mg', defaultDose: '4-12',
  },

  // ── VITAMINE (wasserlöslich) ─────────────────────────────
  'vitamin c': {
    slot: 'morning', slotAlt: 'midday', withFood: false,
    instruction: 'Über den Tag verteilen (max. 500mg pro Dosis)',
    blocker:  ['Hohe Selen-Dosen (Interaktion)', 'Kupfer (reduziert Aufnahme)'],
    synergy:  ['Eisen (verdoppelt Aufnahme)', 'Kollagen', 'Bioflavonoide'],
    category: 'Vitamine (wasserlöslich)', childSafe: true,
    cureHint: null, unit: 'mg', defaultDose: '500-1000',
  },
  'ester-c': {
    slot: 'morning', withFood: false,
    instruction: 'Magenschonende Vitamin-C-Form – auch nüchtern verträglich',
    blocker:  ['Selen (bei Hochdosis)'],
    synergy:  ['Eisen', 'Zink', 'Bioflavonoide'],
    category: 'Vitamine (wasserlöslich)', childSafe: true,
    cureHint: null, unit: 'mg', defaultDose: '500-1000',
  },
  'vitamin b': {
    slot: 'morning', withFood: false,
    instruction: 'Morgens – B-Vitamine aktivieren Energie-Stoffwechsel',
    blocker:  ['Alkohol', 'Kaffee (erhöht Ausscheidung)', 'Antibiotika'],
    synergy:  ['Magnesium (B6-Aktivierung)', 'Zink'],
    category: 'Vitamine (wasserlöslich)', childSafe: true,
    cureHint: null, unit: 'mg', defaultDose: '25-100',
  },
  'b12': {
    slot: 'morning', withFood: false,
    instruction: 'Sublingual oder morgens – Methylcobalamin bevorzugen',
    blocker:  ['Metformin', 'Säureblocker (PPI)', 'Alkohol'],
    synergy:  ['Folsäure (B9)', 'B6', 'Intrinsic Factor'],
    category: 'Vitamine (wasserlöslich)', childSafe: true,
    cureHint: null, unit: 'µg', defaultDose: '500-1000',
  },
  'folsäure': {
    slot: 'morning', withFood: false,
    instruction: 'Methylfolat-Form bevorzugen (MTHFR-Mutation beachten)',
    blocker:  ['Alkohol', 'Antiepileptika', 'Methotrexat'],
    synergy:  ['B12', 'B6', 'Zink'],
    category: 'Vitamine (wasserlöslich)', childSafe: true,
    cureHint: null, unit: 'µg', defaultDose: '400-800',
  },
  'biotin': {
    slot: 'morning', withFood: false,
    instruction: 'Morgens – bei Haar/Nagel-Kur mind. 3 Monate durchhalten',
    blocker:  ['Rohes Eiweiß (Avidin bindet Biotin!)', 'Antiepileptika'],
    synergy:  ['Zink', 'Vitamin B5', 'MSM'],
    category: 'Vitamine (wasserlöslich)', childSafe: true,
    cureHint: '3 Monate ON', unit: 'µg', defaultDose: '1000-5000',
  },

  // ── MINERALIEN ───────────────────────────────────────────
  'magnesium': {
    slot: 'evening', withFood: false,
    instruction: 'Abends – fördert Schlaf & Muskelentspannung',
    blocker:  ['Eisen (gegenseitige Hemmung!)', 'Calcium in großer Menge', 'Koffein'],
    synergy:  ['Vitamin D3 (Aktivierung)', 'Vitamin B6', 'Taurin'],
    category: 'Mineralien', childSafe: true,
    cureHint: null, unit: 'mg', defaultDose: '200-400',
  },
  'calcium': {
    slot: 'morning', slotAlt: 'midday', withFood: true,
    instruction: 'Getrennt von Eisen & Zink (min. 2h Abstand)',
    blocker:  ['Eisen', 'Zink', 'Phytate (Vollkorn)', 'Oxalsäure (Spinat)'],
    synergy:  ['Vitamin D3', 'Vitamin K2', 'Magnesium'],
    category: 'Mineralien', childSafe: true,
    cureHint: null, unit: 'mg', defaultDose: '500-1000',
  },
  'zink': {
    slot: 'evening', withFood: false,
    instruction: 'Abends nüchtern – nicht mit Calcium oder Eisen',
    blocker:  ['Calcium', 'Eisen', 'Phytate', 'Kaffee'],
    synergy:  ['Vitamin A', 'Kupfer (1:8 Ratio beachten)', 'B6'],
    category: 'Mineralien', childSafe: true,
    cureHint: null, unit: 'mg', defaultDose: '15-25',
  },
  'eisen': {
    slot: 'fasted', withFood: false,
    instruction: 'Nüchtern + Vitamin C für maximale Aufnahme',
    blocker:  ['Calcium', 'Magnesium', 'Zink', 'Kaffee', 'Tee', 'Milch', 'Phytate'],
    synergy:  ['Vitamin C (verdoppelt Aufnahme!)', 'Kupfer'],
    category: 'Mineralien', childSafe: false,
    cureHint: null, unit: 'mg', defaultDose: '20-40',
  },
  'selen': {
    slot: 'morning', withFood: false,
    instruction: 'Morgens – Schilddrüse braucht Selen für T4→T3',
    blocker:  ['Hohe Vitamin-C-Dosen', 'Schwermetalle'],
    synergy:  ['Jod (Schilddrüse)', 'Vitamin E', 'Glutathion'],
    category: 'Mineralien', childSafe: true,
    cureHint: null, unit: 'µg', defaultDose: '100-200',
  },
  'jod': {
    slot: 'morning', withFood: false,
    instruction: 'Morgens – nie überdosieren (Schilddrüse sensitiv)',
    blocker:  ['Fluorid', 'Chlor', 'Brom'],
    synergy:  ['Selen (immer zusammen!)', 'Vitamin D3'],
    category: 'Mineralien', childSafe: true,
    cureHint: null, unit: 'µg', defaultDose: '150-500',
  },
  'kupfer': {
    slot: 'morning', withFood: false,
    instruction: 'Zink:Kupfer-Ratio 8:1 beachten – nicht überdosieren',
    blocker:  ['Hohe Zink-Dosen', 'Vitamin C in Megadosen'],
    synergy:  ['Zink (Balance!)', 'Eisen'],
    category: 'Mineralien', childSafe: false,
    cureHint: null, unit: 'mg', defaultDose: '1-2',
  },
  'bor': {
    slot: 'morning', withFood: true,
    instruction: 'Unterstützt Vitamin D & Testosteron-Haushalt',
    blocker:  [],
    synergy:  ['Vitamin D3', 'Magnesium', 'Vitamin K2'],
    category: 'Spurenelemente', childSafe: false,
    cureHint: null, unit: 'mg', defaultDose: '3-6',
  },

  // ── AMINOSÄUREN ──────────────────────────────────────────
  'l-arginin': {
    slot: 'fasted', slotAlt: 'pre_sport', withFood: false,
    instruction: 'Nüchtern oder vor Sport – NO-Synthese braucht leeren Magen',
    blocker:  ['L-Lysin (gleiche Transporter!)', 'Hohe Protein-Mahlzeiten'],
    synergy:  ['L-Citrullin (verlängert Wirkung)', 'Vitamin C', 'Zink'],
    category: 'Aminosäuren', childSafe: false,
    cureHint: null, unit: 'g', defaultDose: '3-5',
  },
  'l-citrullin': {
    slot: 'pre_sport', withFood: false,
    instruction: '60 Min. vor Training – effektiver als L-Arginin',
    blocker:  ['Hohe Protein-Mahlzeiten'],
    synergy:  ['L-Arginin', 'Agmatinsulfat', 'Nitrate (Rote Beete)'],
    category: 'Aminosäuren', childSafe: false,
    cureHint: null, unit: 'g', defaultDose: '6-8',
  },
  'l-lysin': {
    slot: 'morning', slotAlt: 'midday', withFood: false,
    instruction: 'Zwischen Mahlzeiten – hemmt Herpes-Viren (Arginin-Antagonist)',
    blocker:  ['L-Arginin (Transporter-Konkurrenz)', 'Hohe Protein-Mahlzeiten'],
    synergy:  ['Vitamin C (Kollagen-Synthese)', 'Zink'],
    category: 'Aminosäuren', childSafe: true,
    cureHint: null, unit: 'g', defaultDose: '1-3',
  },
  'l-glutamin': {
    slot: 'post_sport', slotAlt: 'evening', withFood: false,
    instruction: 'Nach Sport oder vor dem Schlafen – Darm & Muskelregeneration',
    blocker:  ['Hohe Temperaturen (zerstört Struktur) – kalt lösen!'],
    synergy:  ['Zink', 'Vitamin B6', 'Probiotika'],
    category: 'Aminosäuren', childSafe: true,
    cureHint: null, unit: 'g', defaultDose: '5-10',
  },
  'l-tyrosin': {
    slot: 'fasted', withFood: false,
    instruction: 'Nüchtern morgens – Dopamin-Vorstufe, nicht abends!',
    blocker:  ['L-Tryptophan (gleiche Transporter!)', 'MAO-Hemmer'],
    synergy:  ['Vitamin B6', 'Folsäure', 'Kupfer'],
    category: 'Aminosäuren / Nootropika', childSafe: false,
    cureHint: null, unit: 'mg', defaultDose: '500-1000',
  },
  'l-tryptophan': {
    slot: 'evening', withFood: false,
    instruction: 'Abends nüchtern – Serotonin/Melatonin-Vorstufe',
    blocker:  ['L-Tyrosin', 'Methylenblau (KRITISCH!)', 'SSRI'],
    synergy:  ['Vitamin B6', 'Magnesium', '5-HTP'],
    category: 'Aminosäuren', childSafe: false,
    cureHint: null, unit: 'mg', defaultDose: '500-1000',
  },
  'l-theanin': {
    slot: 'morning', withFood: false,
    instruction: 'Morgens mit Koffein – synergistisch für ruhigen Fokus',
    blocker:  [],
    synergy:  ['Koffein (1:2 Ratio)', 'Ashwagandha', 'GABA'],
    category: 'Aminosäuren / Nootropika', childSafe: true,
    cureHint: null, unit: 'mg', defaultDose: '100-200',
  },
  'taurin': {
    slot: 'pre_sport', slotAlt: 'morning', withFood: false,
    instruction: 'Vor Sport oder morgens – Herzmuskel, Augen, Mitochondrien',
    blocker:  [],
    synergy:  ['Magnesium', 'CoQ10', 'Zink'],
    category: 'Aminosäuren', childSafe: true,
    cureHint: null, unit: 'g', defaultDose: '1-3',
  },
  'glycin': {
    slot: 'evening', withFood: false,
    instruction: 'Abends – verbessert Schlafqualität und Kollagen-Synthese',
    blocker:  [],
    synergy:  ['Magnesium', 'Vitamin C', 'Prolin'],
    category: 'Aminosäuren', childSafe: true,
    cureHint: null, unit: 'g', defaultDose: '2-5',
  },
  'creatin': {
    slot: 'post_sport', slotAlt: 'morning', withFood: true,
    instruction: 'Nach Sport mit Kohlenhydraten – Monohydrat reicht völlig',
    blocker:  ['Koffein (in Megadosen, Studie unklar)', 'Alkohol'],
    synergy:  ['Beta-Alanin', 'Kohlenhydrate (Insulin-Spike)'],
    category: 'Sport / Aminosäuren', childSafe: false,
    cureHint: 'Loading-Phase optional (5×20g) dann 3-5g/Tag dauerhaft',
    unit: 'g', defaultDose: '3-5',
  },
  'beta-alanin': {
    slot: 'pre_sport', withFood: false,
    instruction: 'Vor Training – Kribbeln (Parästhesie) ist normal',
    blocker:  [],
    synergy:  ['Creatin', 'L-Citrullin', 'Koffein'],
    category: 'Sport', childSafe: false,
    cureHint: null, unit: 'g', defaultDose: '2-5',
  },

  // ── ADAPTOGENE & PILZE ───────────────────────────────────
  'ashwagandha': {
    slot: 'evening', slotAlt: 'morning', withFood: true,
    instruction: 'Abends mit Mahlzeit – KSM-66 oder Sensoril-Extrakt bevorzugen',
    blocker:  ['Schilddrüsen-Medikamente (Interaktion)', 'Sedativa'],
    synergy:  ['Magnesium', 'L-Theanin', 'Vitamin D3'],
    category: 'Adaptogene', childSafe: false,
    cureHint: '8-12 Wochen ON / 4 Wochen OFF', unit: 'mg', defaultDose: '300-600',
  },
  'rhodiola': {
    slot: 'morning', withFood: false,
    instruction: 'Morgens nüchtern – nicht abends (stimulierend)',
    blocker:  ['MAO-Hemmer', 'Antidepressiva'],
    synergy:  ['Ashwagandha (Stack)', 'B-Vitamine', 'CoQ10'],
    category: 'Adaptogene', childSafe: false,
    cureHint: '6-8 Wochen ON / 2-4 Wochen OFF', unit: 'mg', defaultDose: '300-600',
  },
  'lions mane': {
    slot: 'morning', withFood: false,
    instruction: 'Sublingual oder morgens – NGF-Stimulation braucht Zeit',
    blocker:  [],
    synergy:  ['Vitamin D3', 'Omega-3', 'Bacopa'],
    category: 'Pilze / Nootropika', childSafe: false,
    cureHint: '21 Tage ON / 7 Tage OFF', unit: 'mg', defaultDose: '500-1000',
  },
  'reishi': {
    slot: 'evening', withFood: true,
    instruction: 'Abends – adaptogen + schlaffördernd',
    blocker:  ['Blutverdünner'],
    synergy:  ['Chaga', 'Vitamin D3', 'Zink'],
    category: 'Pilze', childSafe: false,
    cureHint: '12 Wochen ON / 4 Wochen OFF', unit: 'mg', defaultDose: '500-1500',
  },
  'chaga': {
    slot: 'morning', withFood: true,
    instruction: 'Morgens als Tee oder Extrakt – stark antioxidativ',
    blocker:  ['Blutverdünner', 'Insulin (Blutzucker-Effekt)'],
    synergy:  ['Reishi', 'Vitamin C', 'Zink'],
    category: 'Pilze', childSafe: false,
    cureHint: '8 Wochen ON / 2 Wochen OFF', unit: 'mg', defaultDose: '500-1000',
  },
  'cordyceps': {
    slot: 'pre_sport', withFood: false,
    instruction: 'Vor Sport – steigert ATP-Produktion und VO2max',
    blocker:  [],
    synergy:  ['CoQ10', 'Creatin', 'Rhodiola'],
    category: 'Pilze / Sport', childSafe: false,
    cureHint: '8 Wochen ON / 4 Wochen OFF', unit: 'mg', defaultDose: '1000-3000',
  },
  'maca': {
    slot: 'morning', withFood: true,
    instruction: 'Morgens mit Mahlzeit – schwarze Maca für Männer, rote für Frauen',
    blocker:  ['Schilddrüsen-Medikamente'],
    synergy:  ['Ashwagandha', 'Zink', 'Vitamin B6'],
    category: 'Adaptogene', childSafe: false,
    cureHint: '3 Monate ON / 1 Monat OFF', unit: 'g', defaultDose: '3-5',
  },

  // ── NOOTROPIKA ───────────────────────────────────────────
  'methylenblau': {
    slot: 'morning', withFood: false,
    instruction: 'Morgens – KRITISCH: niemals mit 5-HTP, Tryptophan oder SSRI!',
    blocker:  ['5-HTP (Serotonin-Syndrom!)', 'L-Tryptophan (KRITISCH)', 'SSRI'],
    synergy:  ['Vitamin C', 'CoQ10', 'Lichttherapie'],
    category: 'Nootropika', childSafe: false,
    cureHint: '5 Tage ON / 2 Tage OFF', unit: 'Tropfen', defaultDose: '5-10',
  },
  '5-htp': {
    slot: 'evening', withFood: false,
    instruction: 'Abends – nie mit Methylenblau oder SSRI kombinieren!',
    blocker:  ['Methylenblau (Serotonin-Syndrom!)', 'SSRI', 'MAO-Hemmer'],
    synergy:  ['Vitamin B6', 'Magnesium', 'Vitamin C'],
    category: 'Nootropika / Neurotransmitter', childSafe: false,
    cureHint: 'Max. 8 Wochen am Stück', unit: 'mg', defaultDose: '50-100',
  },
  'alpha-gpc': {
    slot: 'morning', withFood: false,
    instruction: 'Morgens nüchtern – beste Cholin-Quelle fürs Gehirn',
    blocker:  ['Anticholinergika'],
    synergy:  ['Bacopa Monnieri', 'Omega-3', 'Vitamin B5'],
    category: 'Nootropika', childSafe: false,
    cureHint: null, unit: 'mg', defaultDose: '300-600',
  },
  'bacopa': {
    slot: 'morning', withFood: true,
    instruction: 'Mit Fett – Wirkung nach 4-6 Wochen (Geduld!)',
    blocker:  ['Schilddrüsen-Medikamente'],
    synergy:  ['Lions Mane', 'Omega-3', 'Alpha-GPC'],
    category: 'Nootropika / Adaptogene', childSafe: false,
    cureHint: '3 Monate ON / 1 Monat OFF', unit: 'mg', defaultDose: '300-600',
  },
  'ginkgo': {
    slot: 'morning', withFood: false,
    instruction: 'Morgens – EGb761-Extrakt (24% Flavonol-Glykoside)',
    blocker:  ['Blutverdünner', 'Aspirin'],
    synergy:  ['Ginseng', 'Omega-3', 'Vitamin E'],
    category: 'Nootropika', childSafe: false,
    cureHint: '3 Monate ON / 1 Monat OFF', unit: 'mg', defaultDose: '120-240',
  },

  // ── LONGEVITY ────────────────────────────────────────────
  'nmn': {
    slot: 'fasted', withFood: false,
    instruction: 'Nüchtern morgens – erhöht NAD+ für DNA-Reparatur',
    blocker:  ['Alkohol (verbraucht NAD+)', 'Hohe Niacin-Dosen'],
    synergy:  ['Resveratrol', 'TMG (Methylgruppen-Donor)', 'Quercetin'],
    category: 'Longevity', childSafe: false,
    cureHint: null, unit: 'mg', defaultDose: '250-500',
  },
  'resveratrol': {
    slot: 'morning', withFood: true,
    instruction: 'Mit Fett und NMN – aktiviert Sirtuine',
    blocker:  ['Blutverdünner'],
    synergy:  ['NMN', 'Quercetin', 'Fisetin'],
    category: 'Longevity', childSafe: false,
    cureHint: null, unit: 'mg', defaultDose: '250-500',
  },
  'quercetin': {
    slot: 'morning', withFood: true,
    instruction: 'Mit Fett und Bromelain für bessere Aufnahme',
    blocker:  ['Quinolone-Antibiotika'],
    synergy:  ['Bromelain', 'Vitamin C', 'Zink'],
    category: 'Longevity / Antioxidantien', childSafe: true,
    cureHint: null, unit: 'mg', defaultDose: '500-1000',
  },
  'berberin': {
    slot: 'midday', withFood: true,
    instruction: 'Zu den Mahlzeiten – AMPK-Aktivator (wie Metformin)',
    blocker:  ['Metformin (additive Wirkung – Arzt fragen)', 'CYP3A4-Substrate'],
    synergy:  ['Quercetin', 'Chrom', 'Alpha-Liponsäure'],
    category: 'Longevity / Metabolismus', childSafe: false,
    cureHint: '3 Monate ON / 1 Monat OFF', unit: 'mg', defaultDose: '500-1500',
  },

  // ── ENZYME ───────────────────────────────────────────────
  'nattokinase': {
    slot: 'evening', withFood: false,
    instruction: 'Abends nüchtern – baut Fibrin ab über Nacht',
    blocker:  ['Blutverdünner (additive Wirkung!)', 'Vitamin K (Gegenspieler)'],
    synergy:  ['Serrapeptase', 'Omega-3', 'Vitamin E'],
    category: 'Enzyme', childSafe: false,
    cureHint: null, unit: 'FU', defaultDose: '2000',
  },
  'serrapeptase': {
    slot: 'fasted', withFood: false,
    instruction: 'Nüchtern (mind. 30 Min. vor Essen) – entzündungshemmend',
    blocker:  ['Mahlzeiten (Protein inaktiviert Enzym)', 'Blutverdünner'],
    synergy:  ['Nattokinase', 'Bromelain', 'Omega-3'],
    category: 'Enzyme', childSafe: false,
    cureHint: null, unit: 'SPU', defaultDose: '40000-120000',
  },
  'bromelain': {
    slot: 'fasted', withFood: false,
    instruction: 'Nüchtern für Entzündungshemmung – mit Mahlzeit für Verdauung',
    blocker:  ['Mahlzeiten (bei anti-entzündlicher Nutzung)'],
    synergy:  ['Quercetin', 'Curcumin', 'Serrapeptase'],
    category: 'Enzyme', childSafe: true,
    cureHint: null, unit: 'mg', defaultDose: '400-1000',
  },

  // ── DARM / MIKROBIOM ─────────────────────────────────────
  'probiotika': {
    slot: 'morning', withFood: false,
    instruction: '30 Min. vor dem Frühstück oder direkt beim Frühstück',
    blocker:  ['Antibiotika (mind. 2h Abstand!)', 'Chlor (Leitungswasser)'],
    synergy:  ['Präbiotika (FOS/Inulin)', 'Vitamin D3', 'Zink'],
    category: 'Darm / Mikrobiom', childSafe: true,
    cureHint: null, unit: 'KBE', defaultDose: '10-50 Mrd.',
  },
  'flohsamen': {
    slot: 'morning', withFood: false,
    instruction: 'MIT VIEL WASSER (300ml) – 2h Abstand zu ALLEN Supplements!',
    blocker:  ['ALLE Supplements blockiert 2h!', 'Medikamente (Abstand halten)'],
    synergy:  ['Viel Wasser', 'Probiotika (zeitversetzt)'],
    category: 'Ballaststoffe', childSafe: true,
    cureHint: null, unit: 'TL', defaultDose: '1',
  },
  'inulin': {
    slot: 'morning', withFood: true,
    instruction: 'Mit Mahlzeit – langsam einschleichen (Blähungen möglich)',
    blocker:  [],
    synergy:  ['Probiotika', 'Magnesium', 'Vitamin D3'],
    category: 'Präbiotika', childSafe: true,
    cureHint: null, unit: 'g', defaultDose: '5-15',
  },

  // ── SCHLAF ───────────────────────────────────────────────
  'melatonin': {
    slot: 'evening', withFood: false,
    instruction: '30-60 Min. vor Schlaf – niedrig dosiert (0.3-1mg) wirkt besser',
    blocker:  ['Blaues Licht', 'Koffein', 'Alkohol'],
    synergy:  ['Magnesium', 'L-Theanin', 'Vitamin B6'],
    category: 'Schlaf', childSafe: false,
    cureHint: 'Nicht dauerhaft – max. 4 Wochen am Stück',
    unit: 'mg', defaultDose: '0.5-3',
  },
  'gaba': {
    slot: 'evening', withFood: false,
    instruction: 'Abends – überquert Blut-Hirn-Schranke nur bedingt',
    blocker:  [],
    synergy:  ['L-Theanin', 'Magnesium', 'Glycin'],
    category: 'Schlaf / Neurotransmitter', childSafe: false,
    cureHint: null, unit: 'mg', defaultDose: '500-750',
  },

  // ── SPORT / LEISTUNG ─────────────────────────────────────
  'koffein': {
    slot: 'morning', slotAlt: 'pre_sport', withFood: false,
    instruction: 'Morgens oder vor Sport – kein Koffein nach 14 Uhr',
    blocker:  ['Adenosin (Gegenspieler)', 'Schlaf'],
    synergy:  ['L-Theanin (2:1 Ratio für Fokus)', 'B-Vitamine'],
    category: 'Stimulantien', childSafe: false,
    cureHint: null, unit: 'mg', defaultDose: '100-200',
  },
  'glutathion': {
    slot: 'fasted', withFood: false,
    instruction: 'Nüchtern – liposomale Form oder NAC als Vorstufe',
    blocker:  ['Alkohol', 'Paracetamol'],
    synergy:  ['Vitamin C', 'Selen', 'Alpha-Liponsäure'],
    category: 'Antioxidantien', childSafe: false,
    cureHint: null, unit: 'mg', defaultDose: '250-500',
  },
  'alpha-liponsäure': {
    slot: 'fasted', withFood: false,
    instruction: 'Nüchtern – R-Form 2x so wirksam wie S-Form',
    blocker:  ['Biotin (hemmt gegenseitig bei Hochdosis)'],
    synergy:  ['Glutathion', 'Vitamin C', 'CoQ10'],
    category: 'Antioxidantien', childSafe: false,
    cureHint: null, unit: 'mg', defaultDose: '300-600',
  },
  'curcumin': {
    slot: 'morning', slotAlt: 'midday', withFood: true,
    instruction: 'Mit schwarzem Pfeffer (Piperin) und Fett – steigert Aufnahme 2000%',
    blocker:  ['Eisenaufnahme (2h Abstand)'],
    synergy:  ['Piperin (Pfeffer!)', 'Fett', 'Bromelain'],
    category: 'Antioxidantien / Entzündung', childSafe: true,
    cureHint: null, unit: 'mg', defaultDose: '500-1500',
  },
};

// ─────────────────────────────────────────────────────────────
// LOOKUP-FUNKTION
// ─────────────────────────────────────────────────────────────

/**
 * lookupSupplement(query)
 *
 * Gibt das passende DB-Objekt zurück oder null.
 * Sucht zunächst exact match, dann partial match.
 *
 * @param  {string} query  – Benutzereingabe
 * @returns {{ key, ...dbEntry } | null}
 */
export function lookupSupplement(query) {
  if (!query || query.trim().length < 2) return null;

  const lower = query.toLowerCase().trim();

  // 1. Exact match
  if (SUPPLEMENT_DB[lower]) {
    return { key: lower, ...SUPPLEMENT_DB[lower] };
  }

  // 2. Starts-with match (höchste Priorität bei Teilstrings)
  const startsWith = Object.entries(SUPPLEMENT_DB).find(([k]) =>
    lower.startsWith(k) || k.startsWith(lower)
  );
  if (startsWith) return { key: startsWith[0], ...startsWith[1] };

  // 3. Includes match
  const includes = Object.entries(SUPPLEMENT_DB).find(([k]) =>
    lower.includes(k) || k.includes(lower)
  );
  if (includes) return { key: includes[0], ...includes[1] };

  return null;
}

/**
 * searchSupplements(query)
 *
 * Gibt alle Treffer als Array zurück (für Autocomplete-Listen).
 * Max. 5 Ergebnisse.
 *
 * @param  {string} query
 * @returns {Array<{ key, name, ...dbEntry }>}
 */
export function searchSupplements(query) {
  if (!query || query.trim().length < 2) return [];

  const lower = query.toLowerCase().trim();

  return Object.entries(SUPPLEMENT_DB)
    .filter(([k]) => k.includes(lower) || lower.includes(k))
    .map(([k, v]) => ({ key: k, name: _capitalize(k), ...v }))
    .slice(0, 5);
}

/**
 * getSlotLabel(slotId)
 * Gibt lesbares Label zurück.
 */
export function getSlotLabel(slotId) {
  const labels = {
    fasted:     '🌅 Nüchtern (06:00–07:00)',
    morning:    '☀️ Morgen (07:00–09:00)',
    midday:     '🌤️ Mittag (12:00–13:00)',
    pre_sport:  '💪 Vor Sport',
    post_sport: '🏁 Nach Sport',
    evening:    '🌙 Abend (19:00–21:00)',
  };
  return labels[slotId] ?? slotId;
}

// ─────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────
function _capitalize(str) {
  return str
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
