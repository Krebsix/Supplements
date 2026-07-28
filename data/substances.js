/**
 * data/substances.js
 * ─────────────────────────────────────────────────────────────
 * Kanonische Wirkstoff-Datenbank (Katalogwissen).
 *
 * Bewusst getrennt von inventory.json: Dort steht, was die Nutzerin
 * besitzt — hier steht, was ein Wirkstoff IST.
 *
 * Grundsaetze:
 *   - `useCases` beschreibt Anwendungsgebiete DESKRIPTIV
 *     ("wird eingesetzt bei"), niemals als Empfehlung.
 *   - `forms` unterscheidet chemische Formen, weil Bioverfuegbarkeit
 *     und Verträglichkeit sich deutlich unterscheiden.
 *   - `synonyms` deckt Handels- und Etikettenschreibweisen ab, damit
 *     der Scanner Treffer erzielt.
 *   - Keine Herstellernamen. Qualitaet wird ueber Zertifizierungen
 *     abgebildet (siehe data/certifications.js), nicht ueber Marken.
 *
 * Feldreferenz:
 *   id           stabiler Slug (nie aendern — Referenz aus anderen Modulen)
 *   name         Anzeigename
 *   category     Gruppierung fuer die UI
 *   synonyms     alternative Schreibweisen, inkl. EN und Etikettenkuerzel
 *   unit         uebliche Einheit der Mengenangabe
 *   what         ein Satz: was ist das
 *   useCases     Anwendungsgebiete (deskriptiv, je Eintrag ein Stichwort + Erklaerung)
 *   forms        chemische Formen mit Unterschieden
 *   fatSoluble   fettloeslich → Einnahme mit Mahlzeit relevant
 *   sources      Quellenhinweise fuer Nachvollziehbarkeit
 */

export const SOURCE_LABELS = {
  'nih-ods': 'NIH Office of Dietary Supplements, Fact Sheets',
  'efsa-drv': 'EFSA, Dietary Reference Values',
  'efsa-ul': 'EFSA, Tolerable Upper Intake Levels',
  'dach': 'D-A-CH Referenzwerte (DGE/ÖGE/SGE)',
  'bfr': 'Bundesinstitut für Risikobewertung (BfR), Höchstmengen-Empfehlungen',
};

export const substances = [
  // ── Mineralien ─────────────────────────────────────────────
  {
    id: 'magnesium',
    name: 'Magnesium',
    category: 'Mineralien',
    // Kein 'mg' als Synonym — das ist die Einheit und wuerde falsch matchen
    synonyms: ['magnesium', 'magnesiumcitrat', 'magnesiumbisglycinat',
      'magnesiumglycinat', 'magnesiumoxid', 'magnesiummalat', 'magnesiumthreonat',
      'magnesium-l-threonat', 'magnesiumcarbonat', 'trimagnesiumdicitrat'],
    unit: 'mg',
    what: 'Mineralstoff, an über 300 enzymatischen Reaktionen im Körper beteiligt, u. a. im Energie- und Muskelstoffwechsel.',
    useCases: [
      { topic: 'Muskelkrämpfe', note: 'Häufigstes Anwendungsgebiet; wird bei nächtlichen Wadenkrämpfen und Krämpfen nach Sport eingesetzt.' },
      { topic: 'Schlaf und Entspannung', note: 'Wird abends eingesetzt, um Ein- und Durchschlafen zu unterstützen.' },
      { topic: 'Nerven und Stressbelastung', note: 'Bei erhöhter körperlicher oder mentaler Belastung steigt der Bedarf.' },
      { topic: 'Migräne', note: 'Wird prophylaktisch eingesetzt; Studienlage vorhanden, aber heterogen.' },
      { topic: 'Verstopfung', note: 'Osmotisch wirksame Formen (Citrat, Oxid) werden auch abführend eingesetzt.' },
    ],
    forms: [
      { name: 'Bisglycinat', aka: ['Glycinat', 'Magnesium Glycinate'], bioavailability: 'hoch', note: 'Sehr gut verträglich, kaum abführend. Bevorzugte Form für abendliche Einnahme und Schlaf.' },
      { name: 'Citrat', aka: ['Trimagnesiumdicitrat'], bioavailability: 'hoch', note: 'Gut verfügbar, wirkt in höheren Dosen abführend. Häufig bei akuten Krämpfen.' },
      { name: 'Malat', bioavailability: 'mittel bis hoch', note: 'Wird im Zusammenhang mit Energiestoffwechsel und Müdigkeit eingesetzt.' },
      { name: 'L-Threonat', aka: ['Magnesium-L-Threonat'], bioavailability: 'hoch', note: 'Wird speziell für kognitive Anwendungen beworben; Datenlage beim Menschen noch begrenzt.' },
      { name: 'Oxid', bioavailability: 'niedrig', note: 'Hoher Magnesiumanteil pro Gramm, aber geringe Resorptionsquote. Deutlich abführend.' },
      { name: 'Carbonat', bioavailability: 'niedrig bis mittel', note: 'Wirkt zusätzlich säurebindend im Magen.' },
    ],
    fatSoluble: false,
    sources: ['nih-ods', 'dach'],
  },
  {
    id: 'calcium',
    name: 'Calcium',
    category: 'Mineralien',
    synonyms: ['calcium', 'kalzium', 'calciumcarbonat', 'calciumcitrat',
      'calciumgluconat', 'kalziumcarbonat'],
    unit: 'mg',
    what: 'Mengenelement und Hauptbestandteil von Knochen und Zähnen; außerdem an Muskelkontraktion und Nervenreizleitung beteiligt.',
    useCases: [
      { topic: 'Knochengesundheit', note: 'Zentrales Anwendungsgebiet, insbesondere bei erhöhtem Bedarf im Alter und nach der Menopause.' },
      { topic: 'Wachstum', note: 'Erhöhter Bedarf in Kindheit und Jugend während des Knochenaufbaus.' },
      { topic: 'Geringe Milchproduktaufnahme', note: 'Wird bei milchfreier oder veganer Ernährung ergänzt.' },
    ],
    forms: [
      { name: 'Citrat', bioavailability: 'hoch', note: 'Auch bei geringer Magensäure gut verfügbar, unabhängig von Mahlzeiten.' },
      { name: 'Carbonat', bioavailability: 'mittel', note: 'Hoher Calciumanteil, benötigt aber Magensäure — mit dem Essen einnehmen.' },
      { name: 'Gluconat', bioavailability: 'mittel', note: 'Niedriger Calciumanteil pro Gramm, entsprechend größere Mengen nötig.' },
    ],
    fatSoluble: false,
    sources: ['nih-ods', 'dach', 'efsa-ul'],
  },
  {
    id: 'iron',
    name: 'Eisen',
    category: 'Mineralien',
    synonyms: ['eisen', 'iron', 'fe', 'eisenbisglycinat', 'eisengluconat',
      'eisensulfat', 'eisenfumarat', 'ferrofumarat', 'eisen(ii)'],
    unit: 'mg',
    what: 'Spurenelement, Bestandteil von Hämoglobin und damit zentral für den Sauerstofftransport im Blut.',
    useCases: [
      { topic: 'Eisenmangel und Mangelanämie', note: 'Hauptanwendungsgebiet. Sollte über Blutwerte (Ferritin, Hämoglobin) abgeklärt werden.' },
      { topic: 'Starke Menstruationsblutungen', note: 'Erhöhter Verlust ist ein häufiger Grund für erniedrigte Speicher.' },
      { topic: 'Schwangerschaft', note: 'Deutlich erhöhter Bedarf; ärztliche Begleitung üblich.' },
      { topic: 'Vegetarische und vegane Ernährung', note: 'Pflanzliches Eisen wird schlechter resorbiert als Häm-Eisen aus Fleisch.' },
    ],
    forms: [
      { name: 'Bisglycinat', aka: ['Ferrochel', 'Eisen-Chelat'], bioavailability: 'hoch', note: 'Deutlich magenfreundlicher als Sulfat, geringere Nebenwirkungsrate.' },
      { name: 'Sulfat', bioavailability: 'hoch', note: 'Standardform in Arzneimitteln, häufig Magen-Darm-Beschwerden.' },
      { name: 'Fumarat', bioavailability: 'hoch', note: 'Hoher Eisenanteil pro Gramm.' },
      { name: 'Gluconat', bioavailability: 'mittel', note: 'Besser verträglich, geringerer Eisenanteil.' },
    ],
    fatSoluble: false,
    cautionNote: 'Eisen sollte nicht ohne festgestellten Mangel ergänzt werden — überschüssiges Eisen wird gespeichert und ist nicht einfach ausscheidbar.',
    sources: ['nih-ods', 'dach'],
  },
  {
    id: 'zinc',
    name: 'Zink',
    category: 'Mineralien',
    synonyms: ['zink', 'zinc', 'zn', 'zinkbisglycinat', 'zinkgluconat',
      'zinkpicolinat', 'zinkcitrat', 'zinkoxid', 'zinkorotat'],
    unit: 'mg',
    what: 'Spurenelement, Cofaktor in über 300 Enzymen; beteiligt an Immunfunktion, Wundheilung, Haut und Hormonstoffwechsel.',
    useCases: [
      { topic: 'Immunfunktion', note: 'Wird häufig bei Infektanfälligkeit und begleitend zu Erkältungen eingesetzt.' },
      { topic: 'Haut und Akne', note: 'Klassisches Anwendungsgebiet bei entzündlichen Hautbildern.' },
      { topic: 'Haare und Nägel', note: 'Wird bei Haarausfall und brüchigen Nägeln eingesetzt.' },
      { topic: 'Wundheilung', note: 'Erhöhter Bedarf bei Heilungsprozessen.' },
    ],
    forms: [
      { name: 'Bisglycinat', bioavailability: 'hoch', note: 'Gut verträglich, auch auf leeren Magen.' },
      { name: 'Picolinat', bioavailability: 'hoch', note: 'Gut resorbierbar, häufig in Nahrungsergänzungen.' },
      { name: 'Citrat', bioavailability: 'hoch', note: 'Gut verfügbar, neutraler Geschmack.' },
      { name: 'Gluconat', bioavailability: 'mittel bis hoch', note: 'Übliche Form in Lutschtabletten.' },
      { name: 'Oxid', bioavailability: 'niedrig', note: 'Benötigt Magensäure, schlechter resorbierbar.' },
    ],
    fatSoluble: false,
    cautionNote: 'Dauerhaft hohe Zinkzufuhr kann die Kupferaufnahme beeinträchtigen.',
    sources: ['nih-ods', 'efsa-ul', 'dach'],
  },
  {
    id: 'selenium',
    name: 'Selen',
    category: 'Mineralien',
    synonyms: ['selen', 'selenium', 'se', 'natriumselenit', 'selenmethionin',
      'l-selenomethionin', 'selenhefe'],
    unit: 'µg',
    what: 'Spurenelement, Bestandteil antioxidativer Enzyme (Glutathionperoxidasen) und wichtig für den Schilddrüsenhormon-Stoffwechsel.',
    useCases: [
      { topic: 'Schilddrüse', note: 'Wird bei Hashimoto-Thyreoiditis und Schilddrüsenfunktionsstörungen eingesetzt.' },
      { topic: 'Oxidativer Stress', note: 'Beteiligt am zellulären Schutz vor freien Radikalen.' },
      { topic: 'Immunfunktion', note: 'Selenmangel ist mit verminderter Immunantwort assoziiert.' },
    ],
    forms: [
      { name: 'L-Selenomethionin', bioavailability: 'hoch', note: 'Organische Form, gut resorbierbar und speicherbar.' },
      { name: 'Natriumselenit', bioavailability: 'mittel bis hoch', note: 'Anorganische Form; wird nicht in Proteine eingebaut.' },
    ],
    fatSoluble: false,
    cautionNote: 'Der Abstand zwischen Bedarf und Obergrenze ist bei Selen gering — Mengenangaben genau beachten.',
    sources: ['nih-ods', 'efsa-ul'],
  },
  {
    id: 'iodine',
    name: 'Jod',
    category: 'Mineralien',
    synonyms: ['jod', 'iod', 'iodine', 'kaliumiodid', 'kaliumjodid'],
    unit: 'µg',
    what: 'Spurenelement und unverzichtbarer Baustein der Schilddrüsenhormone T3 und T4.',
    useCases: [
      { topic: 'Schilddrüsenfunktion', note: 'Zentrale Rolle bei der Hormonbildung; Deutschland gilt als Gebiet mit milder Jodunterversorgung.' },
      { topic: 'Schwangerschaft und Stillzeit', note: 'Deutlich erhöhter Bedarf für die kindliche Entwicklung.' },
    ],
    forms: [
      { name: 'Kaliumiodid', bioavailability: 'hoch', note: 'Standardform in Ergänzungen und Jodsalz.' },
      { name: 'Algenpulver (z. B. Kelp)', bioavailability: 'variabel', note: 'Jodgehalt schwankt stark und kann sehr hoch sein — Mengenangabe genau prüfen.' },
    ],
    fatSoluble: false,
    cautionNote: 'Bei Schilddrüsenerkrankungen ist die Jodzufuhr ärztlich abzuklären.',
    sources: ['nih-ods', 'dach', 'efsa-ul'],
  },
  {
    id: 'potassium',
    name: 'Kalium',
    category: 'Mineralien',
    synonyms: ['kalium', 'potassium', 'kaliumcitrat', 'kaliumchlorid'],
    unit: 'mg',
    what: 'Mengenelement, zentral für Zellinnendruck, Nervenreizleitung und Herzrhythmus.',
    useCases: [
      { topic: 'Blutdruck', note: 'Eine ausreichende Kaliumzufuhr ist mit günstigeren Blutdruckwerten assoziiert.' },
      { topic: 'Muskelfunktion und Krämpfe', note: 'Wird neben Magnesium bei Krämpfen betrachtet.' },
      { topic: 'Erhöhte Verluste', note: 'Bei starkem Schwitzen oder entwässernder Medikation.' },
    ],
    forms: [
      { name: 'Citrat', bioavailability: 'hoch', note: 'Gut verträglich, basisch wirkend.' },
      { name: 'Chlorid', bioavailability: 'hoch', note: 'Übliche Form zum Ausgleich von Verlusten.' },
    ],
    fatSoluble: false,
    cautionNote: 'Bei eingeschränkter Nierenfunktion oder blutdrucksenkender Medikation ist Kalium ärztlich abzuklären.',
    sources: ['nih-ods', 'dach'],
  },

  // ── Vitamine ───────────────────────────────────────────────
  {
    id: 'vitamin-d3',
    name: 'Vitamin D3',
    category: 'Vitamine',
    synonyms: ['vitamin d', 'vitamin d3', 'vitamin-d', 'cholecalciferol',
      'colecalciferol', 'd3', 'vit d', 'vitamin d 3'],
    unit: 'IE',
    what: 'Fettlösliches Vitamin und Hormonvorstufe; wird bei Sonnenlicht in der Haut gebildet und steuert unter anderem die Calciumaufnahme.',
    useCases: [
      { topic: 'Knochenstoffwechsel', note: 'Ermöglicht die Calciumaufnahme aus dem Darm; Mangel führt zu Knochenschwäche.' },
      { topic: 'Immunfunktion', note: 'Häufigstes Anwendungsgebiet in den Wintermonaten.' },
      { topic: 'Geringe Sonnenexposition', note: 'In DACH-Breiten ist die Eigenbildung von Oktober bis März kaum möglich.' },
      { topic: 'Muskelfunktion und Sturzprophylaxe', note: 'Wird bei älteren Menschen in diesem Zusammenhang eingesetzt.' },
    ],
    forms: [
      { name: 'D3 (Cholecalciferol)', bioavailability: 'hoch', note: 'Tierischen oder Flechten-Ursprungs; hebt den Blutspiegel effektiver als D2.' },
      { name: 'D2 (Ergocalciferol)', bioavailability: 'mittel', note: 'Pflanzlich (Hefe/Pilze), kürzere Wirkdauer.' },
    ],
    fatSoluble: true,
    unitConversion: { note: '1 µg Vitamin D entspricht 40 IE.', factorToIE: 40 },
    cautionNote: 'Fettlöslich und speicherbar — dauerhaft hohe Dosen ohne Blutwertkontrolle sind nicht sinnvoll.',
    sources: ['nih-ods', 'dach', 'efsa-ul'],
  },
  {
    id: 'vitamin-k2',
    name: 'Vitamin K2',
    category: 'Vitamine',
    synonyms: ['vitamin k', 'vitamin k2', 'k2', 'menachinon', 'menaquinon',
      'mk-7', 'mk7', 'mk-4', 'menachinon-7'],
    unit: 'µg',
    what: 'Fettlösliches Vitamin, aktiviert Proteine für Blutgerinnung und für den Einbau von Calcium in den Knochen.',
    useCases: [
      { topic: 'Knochenstoffwechsel', note: 'Aktiviert Osteocalcin und wird häufig gemeinsam mit Vitamin D eingesetzt.' },
      { topic: 'Gefäßgesundheit', note: 'Aktiviert Matrix-Gla-Protein, das Calciumeinlagerungen in Gefäßwänden entgegenwirkt.' },
    ],
    forms: [
      { name: 'MK-7 (all-trans)', bioavailability: 'hoch', note: 'Lange Halbwertszeit, einmal täglich ausreichend. Auf "all-trans" achten.' },
      { name: 'MK-4', bioavailability: 'mittel', note: 'Kurze Halbwertszeit, benötigt mehrfach tägliche Gabe.' },
      { name: 'K1 (Phyllochinon)', bioavailability: 'hoch', note: 'Primär für die Blutgerinnung; aus grünem Blattgemüse.' },
    ],
    fatSoluble: true,
    cautionNote: 'Bei Einnahme von Gerinnungshemmern (Cumarine/Vitamin-K-Antagonisten) nur nach ärztlicher Absprache.',
    sources: ['nih-ods', 'efsa-drv'],
  },
  {
    id: 'vitamin-c',
    name: 'Vitamin C',
    category: 'Vitamine',
    synonyms: ['vitamin c', 'ascorbinsaeure', 'ascorbinsäure', 'ascorbic acid',
      'ester-c', 'calciumascorbat', 'natriumascorbat', 'l-ascorbinsäure', 'vit c'],
    unit: 'mg',
    what: 'Wasserlösliches Vitamin, antioxidativ wirksam und notwendig für die Kollagenbildung.',
    useCases: [
      { topic: 'Immunfunktion', note: 'Häufigstes Anwendungsgebiet, besonders in der Erkältungszeit.' },
      { topic: 'Kollagen, Haut und Bindegewebe', note: 'Unverzichtbar für die Kollagensynthese und damit für Haut, Gefäße und Wundheilung.' },
      { topic: 'Eisenaufnahme', note: 'Verbessert die Resorption pflanzlichen Eisens deutlich — gemeinsame Einnahme ist gängig.' },
      { topic: 'Oxidativer Stress', note: 'Wird bei Rauchen und erhöhter Belastung ergänzt.' },
    ],
    forms: [
      { name: 'Ascorbinsäure', bioavailability: 'hoch', note: 'Standardform, sauer — kann bei empfindlichem Magen stören.' },
      { name: 'Calciumascorbat (Ester-C)', bioavailability: 'hoch', note: 'Gepuffert und magenfreundlicher, enthält zusätzlich Calcium.' },
      { name: 'Natriumascorbat', bioavailability: 'hoch', note: 'Gepuffert, enthält Natrium.' },
      { name: 'Liposomal', bioavailability: 'hoch', note: 'Beworben mit höherer Aufnahme; Datenlage begrenzt, deutlich teurer.' },
    ],
    fatSoluble: false,
    cautionNote: 'Sehr hohe Einzeldosen werden überwiegend ausgeschieden und können Durchfall auslösen. Auf mehrere Portionen verteilen.',
    sources: ['nih-ods', 'dach'],
  },
  {
    id: 'vitamin-b12',
    name: 'Vitamin B12',
    category: 'Vitamine',
    synonyms: ['vitamin b12', 'b12', 'cobalamin', 'methylcobalamin',
      'cyanocobalamin', 'adenosylcobalamin', 'hydroxocobalamin', 'vit b12'],
    unit: 'µg',
    what: 'Wasserlösliches Vitamin, notwendig für Blutbildung, Nervenfunktion und den Homocystein-Abbau.',
    useCases: [
      { topic: 'Vegane und vegetarische Ernährung', note: 'Wichtigstes Anwendungsgebiet — B12 kommt praktisch nur in tierischen Lebensmitteln vor. Bei veganer Ernährung ist eine Ergänzung notwendig.' },
      { topic: 'Nervenfunktion', note: 'Mangel kann neurologische Beschwerden verursachen, die teils irreversibel sind.' },
      { topic: 'Höheres Alter', note: 'Die Aufnahmefähigkeit im Magen nimmt mit dem Alter ab.' },
      { topic: 'Magensäurehemmer und Metformin', note: 'Dauereinnahme kann die B12-Aufnahme reduzieren.' },
    ],
    forms: [
      { name: 'Methylcobalamin', bioavailability: 'hoch', note: 'Direkt aktive Form, gut speicherbar.' },
      { name: 'Adenosylcobalamin', bioavailability: 'hoch', note: 'Zweite aktive Form, wirkt mitochondrial.' },
      { name: 'Hydroxocobalamin', bioavailability: 'hoch', note: 'Sehr stabil, gute Depotwirkung.' },
      { name: 'Cyanocobalamin', bioavailability: 'hoch', note: 'Stabilste und günstigste Form, muss im Körper umgewandelt werden.' },
    ],
    fatSoluble: false,
    sources: ['nih-ods', 'dach'],
  },
  {
    id: 'folate',
    name: 'Folat (Vitamin B9)',
    category: 'Vitamine',
    synonyms: ['folat', 'folate', 'folsaeure', 'folsäure', 'folic acid',
      'vitamin b9', 'b9', 'methylfolat', '5-mthf', 'l-methylfolat', 'quatrefolic'],
    unit: 'µg',
    what: 'Wasserlösliches B-Vitamin, notwendig für Zellteilung, Blutbildung und die Entwicklung des Neuralrohrs.',
    useCases: [
      { topic: 'Kinderwunsch und Schwangerschaft', note: 'Wichtigstes Anwendungsgebiet: Eine ausreichende Zufuhr vor und in der Frühschwangerschaft senkt das Risiko für Neuralrohrdefekte.' },
      { topic: 'Blutbildung', note: 'Mangel führt zu einer megaloblastären Anämie.' },
      { topic: 'Homocystein', note: 'Wirkt gemeinsam mit B12 und B6 am Homocystein-Abbau.' },
    ],
    forms: [
      { name: '5-MTHF (Methylfolat)', bioavailability: 'hoch', note: 'Direkt aktive Form, unabhängig von der MTHFR-Enzymaktivität nutzbar.' },
      { name: 'Folsäure', bioavailability: 'hoch', note: 'Synthetische Form, muss enzymatisch umgewandelt werden; Datenbasis der Studien.' },
    ],
    fatSoluble: false,
    cautionNote: 'Hohe Folatzufuhr kann einen Vitamin-B12-Mangel maskieren — beides gemeinsam betrachten.',
    sources: ['nih-ods', 'dach', 'efsa-ul'],
  },
  {
    id: 'vitamin-b6',
    name: 'Vitamin B6',
    category: 'Vitamine',
    synonyms: ['vitamin b6', 'b6', 'pyridoxin', 'pyridoxinhydrochlorid',
      'pyridoxal-5-phosphat', 'p-5-p', 'p5p'],
    unit: 'mg',
    what: 'Wasserlösliches B-Vitamin, Cofaktor im Aminosäure- und Neurotransmitterstoffwechsel.',
    useCases: [
      { topic: 'Nerven- und Neurotransmitterstoffwechsel', note: 'Notwendig für die Bildung von Serotonin, Dopamin und GABA.' },
      { topic: 'Prämenstruelle Beschwerden', note: 'Klassisches Anwendungsgebiet bei PMS.' },
      { topic: 'Schwangerschaftsübelkeit', note: 'Wird in diesem Zusammenhang eingesetzt, üblicherweise ärztlich begleitet.' },
    ],
    forms: [
      { name: 'Pyridoxal-5-Phosphat (P-5-P)', bioavailability: 'hoch', note: 'Direkt aktive Form, keine Umwandlung in der Leber nötig.' },
      { name: 'Pyridoxin-HCl', bioavailability: 'hoch', note: 'Standardform, muss aktiviert werden.' },
    ],
    fatSoluble: false,
    cautionNote: 'Dauerhaft hohe Dosen können Nervenschädigungen verursachen — bei B6 ist die Obergrenze besonders relevant.',
    sources: ['nih-ods', 'efsa-ul'],
  },
  {
    id: 'vitamin-a',
    name: 'Vitamin A',
    category: 'Vitamine',
    synonyms: ['vitamin a', 'retinol', 'retinylacetat', 'retinylpalmitat',
      'beta-carotin', 'betacarotin', 'provitamin a'],
    unit: 'µg',
    what: 'Fettlösliches Vitamin, wichtig für Sehvorgang, Haut, Schleimhäute und Immunfunktion.',
    useCases: [
      { topic: 'Sehvorgang', note: 'Bestandteil des Sehpigments; Mangel führt zu Nachtblindheit.' },
      { topic: 'Haut und Schleimhäute', note: 'Beteiligt an Zellerneuerung und Barrierefunktion.' },
    ],
    forms: [
      { name: 'Retinol / Retinylester', bioavailability: 'hoch', note: 'Vorgeformtes Vitamin A, direkt wirksam und speicherbar.' },
      { name: 'Beta-Carotin', bioavailability: 'variabel', note: 'Provitamin, wird bedarfsabhängig umgewandelt — deutlich geringeres Überdosierungsrisiko.' },
    ],
    fatSoluble: true,
    cautionNote: 'In der Schwangerschaft ist vorgeformtes Vitamin A (Retinol) in höheren Dosen zu vermeiden. Beta-Carotin ist in dieser Hinsicht unkritischer.',
    sources: ['nih-ods', 'efsa-ul', 'dach'],
  },
  {
    id: 'vitamin-e',
    name: 'Vitamin E',
    category: 'Vitamine',
    synonyms: ['vitamin e', 'tocopherol', 'alpha-tocopherol',
      'd-alpha-tocopherol', 'dl-alpha-tocopherol', 'tocotrienol'],
    unit: 'mg',
    what: 'Fettlösliches Vitamin mit antioxidativer Wirkung, schützt Zellmembranen vor Fettoxidation.',
    useCases: [
      { topic: 'Zellschutz', note: 'Schützt mehrfach ungesättigte Fettsäuren in Membranen vor Oxidation.' },
      { topic: 'Haut', note: 'Wird bei trockener Haut und in Kombination mit Vitamin C eingesetzt.' },
    ],
    forms: [
      { name: 'd-alpha-Tocopherol', bioavailability: 'hoch', note: 'Natürliche Form, etwa doppelt so wirksam wie die synthetische.' },
      { name: 'dl-alpha-Tocopherol', bioavailability: 'mittel', note: 'Synthetisch, Mischung aus acht Stereoisomeren.' },
      { name: 'Gemischte Tocopherole', bioavailability: 'hoch', note: 'Näher am natürlichen Vorkommen in Lebensmitteln.' },
    ],
    fatSoluble: true,
    cautionNote: 'Hohe Dosen können die Blutungsneigung erhöhen — relevant bei Gerinnungshemmern und vor Operationen.',
    sources: ['nih-ods', 'efsa-ul'],
  },

  // ── Fettsäuren ─────────────────────────────────────────────
  {
    id: 'omega-3',
    name: 'Omega-3 (EPA/DHA)',
    category: 'Fettsäuren',
    synonyms: ['omega 3', 'omega-3', 'omega3', 'fischoel', 'fischöl', 'fish oil',
      'epa', 'dha', 'eicosapentaensaeure', 'docosahexaensaeure', 'algenoel',
      'algenöl', 'krillöl', 'krilloel'],
    unit: 'mg',
    what: 'Langkettige mehrfach ungesättigte Fettsäuren; Bausteine von Zellmembranen und Ausgangsstoffe entzündungsregulierender Botenstoffe.',
    useCases: [
      { topic: 'Herz-Kreislauf-System', note: 'Am besten untersuchtes Anwendungsgebiet; betrifft unter anderem Triglyzeridwerte.' },
      { topic: 'Entzündliche Prozesse', note: 'EPA ist Ausgangsstoff entzündungsauflösender Mediatoren.' },
      { topic: 'Gehirn und Sehkraft', note: 'DHA ist Strukturbestandteil von Gehirn und Netzhaut — auch in Schwangerschaft und Stillzeit relevant.' },
      { topic: 'Trockene Augen', note: 'Häufiges Anwendungsgebiet.' },
    ],
    forms: [
      { name: 'Triglycerid (rTG/TG)', bioavailability: 'hoch', note: 'Natürliche bzw. rückgeführte Form, gut resorbierbar.' },
      { name: 'Ethylester (EE)', bioavailability: 'mittel', note: 'Günstiger; Aufnahme profitiert deutlich von einer fettreichen Mahlzeit.' },
      { name: 'Phospholipid (Krill)', bioavailability: 'hoch', note: 'Gute Aufnahme, meist geringere EPA/DHA-Menge pro Kapsel.' },
      { name: 'Algenöl', bioavailability: 'hoch', note: 'Vegane Quelle für EPA und DHA.' },
    ],
    fatSoluble: true,
    cautionNote: 'Entscheidend ist der EPA/DHA-Gehalt, nicht die Gesamtmenge Öl pro Kapsel. Hohe Dosen können die Blutungsneigung erhöhen.',
    sources: ['nih-ods', 'efsa-drv'],
  },

  // ── Aminosäuren und Neurotransmitter-Vorstufen ────────────
  {
    id: 'l-tryptophan',
    name: 'L-Tryptophan',
    category: 'Aminosäuren',
    synonyms: ['l-tryptophan', 'tryptophan', 'trp'],
    unit: 'mg',
    what: 'Essenzielle Aminosäure und Vorstufe von Serotonin und Melatonin.',
    useCases: [
      { topic: 'Schlaf', note: 'Wird abends als Vorstufe der Melatoninbildung eingesetzt.' },
      { topic: 'Stimmung', note: 'Ausgangsstoff für Serotonin.' },
    ],
    forms: [
      { name: 'L-Tryptophan', bioavailability: 'hoch', note: 'Aufnahme ins Gehirn wird durch andere Aminosäuren gehemmt — daher nüchtern oder mit Kohlenhydraten.' },
    ],
    fatSoluble: false,
    cautionNote: 'Nicht mit serotonerg wirkenden Medikamenten (SSRI, MAO-Hemmer) kombinieren — Risiko eines Serotonin-Syndroms.',
    sources: ['nih-ods'],
  },
  {
    id: '5-htp',
    name: '5-HTP',
    category: 'Neurotransmitter',
    synonyms: ['5-htp', '5 htp', '5-hydroxytryptophan', 'griffonia'],
    unit: 'mg',
    what: 'Direkte Zwischenstufe zwischen Tryptophan und Serotonin; wird aus Griffonia-simplicifolia-Samen gewonnen.',
    useCases: [
      { topic: 'Stimmung', note: 'Wirkt näher am Serotonin als Tryptophan.' },
      { topic: 'Schlaf', note: 'Wird abends eingesetzt.' },
    ],
    forms: [
      { name: '5-HTP', bioavailability: 'hoch', note: 'Passiert die Blut-Hirn-Schranke ohne Transporterkonkurrenz.' },
    ],
    fatSoluble: false,
    cautionNote: 'Nicht mit serotonerg wirkenden Medikamenten (SSRI, MAO-Hemmer, Methylenblau) kombinieren — Risiko eines Serotonin-Syndroms.',
    sources: ['nih-ods'],
  },
  {
    id: 'l-tyrosine',
    name: 'L-Tyrosin',
    category: 'Aminosäuren',
    synonyms: ['l-tyrosin', 'tyrosin', 'tyrosine', 'n-acetyl-l-tyrosin', 'nalt'],
    unit: 'mg',
    what: 'Aminosäure und Vorstufe von Dopamin, Noradrenalin und Adrenalin sowie der Schilddrüsenhormone.',
    useCases: [
      { topic: 'Fokus und Belastung', note: 'Wird bei Stress, Schlafmangel und geistiger Beanspruchung eingesetzt.' },
      { topic: 'Schilddrüse', note: 'Baustein von T3 und T4, gemeinsam mit Jod.' },
    ],
    forms: [
      { name: 'L-Tyrosin', bioavailability: 'hoch', note: 'Nüchtern einnehmen; konkurriert mit anderen großen Aminosäuren um den Transport ins Gehirn.' },
    ],
    fatSoluble: false,
    sources: ['nih-ods'],
  },
  {
    id: 'l-lysine',
    name: 'L-Lysin',
    category: 'Aminosäuren',
    synonyms: ['l-lysin', 'lysin', 'lysine', 'lysinhydrochlorid'],
    unit: 'mg',
    what: 'Essenzielle Aminosäure, beteiligt an Kollagenbildung und Calciumverwertung.',
    useCases: [
      { topic: 'Lippenherpes', note: 'Häufigstes Anwendungsgebiet; wird prophylaktisch und bei Ausbrüchen eingesetzt.' },
      { topic: 'Kollagen und Bindegewebe', note: 'Baustein der Kollagen-Quervernetzung.' },
    ],
    forms: [
      { name: 'L-Lysin (HCl)', bioavailability: 'hoch', note: 'Konkurriert mit L-Arginin um dieselben Transporter — zeitlich trennen.' },
    ],
    fatSoluble: false,
    sources: ['nih-ods'],
  },
  {
    id: 'l-arginine',
    name: 'L-Arginin',
    category: 'Aminosäuren',
    synonyms: ['l-arginin', 'arginin', 'arginine', 'arginin-hcl',
      'l-citrullin', 'citrullin', 'citrullin-malat'],
    unit: 'g',
    what: 'Semi-essenzielle Aminosäure und Ausgangsstoff für Stickstoffmonoxid, das Blutgefäße weitstellt.',
    useCases: [
      { topic: 'Durchblutung', note: 'Wird im Sportbereich und bei Gefäßfunktion eingesetzt.' },
      { topic: 'Sportliche Leistung', note: 'Häufiger Bestandteil von Pre-Workout-Produkten.' },
    ],
    forms: [
      { name: 'L-Arginin', bioavailability: 'mittel', note: 'Wird im Darm teilweise abgebaut.' },
      { name: 'L-Citrullin', bioavailability: 'hoch', note: 'Wird in der Niere zu Arginin umgewandelt und hebt den Argininspiegel effektiver.' },
    ],
    fatSoluble: false,
    cautionNote: 'Bei bestehender Herpes-Neigung kann Arginin ungünstig sein (Gegenspieler von Lysin).',
    sources: ['nih-ods'],
  },

  // ── Weitere Wirkstoffe ────────────────────────────────────
  {
    id: 'coq10',
    name: 'Coenzym Q10',
    category: 'Zellenergie',
    synonyms: ['coenzym q10', 'coq10', 'q10', 'ubiquinon', 'ubichinon',
      'ubiquinol', 'ubichinol'],
    unit: 'mg',
    what: 'Fettlösliche Substanz in den Mitochondrien, zentral für die zelluläre Energiegewinnung und antioxidativ wirksam.',
    useCases: [
      { topic: 'Energie und Müdigkeit', note: 'Körpereigene Produktion nimmt mit dem Alter ab.' },
      { topic: 'Statin-Einnahme', note: 'Statine senken die körpereigene Q10-Bildung — häufiges Anwendungsgebiet.' },
      { topic: 'Herzfunktion', note: 'Herzmuskelzellen haben einen besonders hohen Energiebedarf.' },
    ],
    forms: [
      { name: 'Ubiquinol', bioavailability: 'hoch', note: 'Reduzierte, direkt verwertbare Form; besonders ab mittlerem Alter bevorzugt.' },
      { name: 'Ubiquinon', bioavailability: 'mittel', note: 'Oxidierte Form, muss umgewandelt werden; günstiger und stabiler.' },
    ],
    fatSoluble: true,
    sources: ['nih-ods'],
  },
  {
    id: 'creatine',
    name: 'Creatin',
    category: 'Sport',
    synonyms: ['creatin', 'kreatin', 'creatine', 'creatin monohydrat',
      'creatine monohydrate', 'kreatinmonohydrat'],
    unit: 'g',
    what: 'Körpereigene Substanz, die in Muskel und Gehirn kurzfristig Energie (ATP) bereitstellt. Eines der am besten untersuchten Supplemente überhaupt.',
    useCases: [
      { topic: 'Kraft und Muskelaufbau', note: 'Sehr gut belegtes Anwendungsgebiet bei kurzen, intensiven Belastungen.' },
      { topic: 'Kognition', note: 'Wird bei Schlafmangel und geistiger Belastung untersucht; auch vegetarische Ernährung ist relevant, da Creatin vor allem in Fleisch vorkommt.' },
      { topic: 'Muskelerhalt im Alter', note: 'Wird in Kombination mit Krafttraining eingesetzt.' },
    ],
    forms: [
      { name: 'Monohydrat', bioavailability: 'hoch', note: 'Die untersuchte Standardform. Teurere Varianten bringen keinen belegten Vorteil.' },
    ],
    fatSoluble: false,
    sources: ['nih-ods'],
  },
  {
    id: 'psyllium',
    name: 'Flohsamenschalen',
    category: 'Ballaststoffe',
    synonyms: ['flohsamen', 'flohsamenschalen', 'psyllium', 'psyllium husk',
      'plantago ovata', 'indische flohsamenschalen'],
    unit: 'g',
    what: 'Löslicher Ballaststoff, der im Darm ein Gel bildet und Wasser bindet.',
    useCases: [
      { topic: 'Verdauung', note: 'Wird sowohl bei Verstopfung als auch bei Durchfall eingesetzt, weil es das Stuhlvolumen reguliert.' },
      { topic: 'Cholesterin', note: 'Bindet Gallensäuren; für lösliche Ballaststoffe gut untersucht.' },
      { topic: 'Sättigung', note: 'Wird im Zusammenhang mit Gewichtsmanagement eingesetzt.' },
    ],
    forms: [
      { name: 'Schalen (ganz oder gemahlen)', bioavailability: 'nicht resorbiert', note: 'Wirkt physikalisch im Darm. Immer mit viel Flüssigkeit einnehmen.' },
    ],
    fatSoluble: false,
    isAbsorptionBlocker: true,
    cautionNote: 'Blockiert die Aufnahme anderer Wirkstoffe und Medikamente — mindestens 2 Stunden Abstand einhalten. Unbedingt mit reichlich Wasser einnehmen.',
    sources: ['nih-ods'],
  },
  {
    id: 'probiotics',
    name: 'Probiotika',
    category: 'Darm',
    synonyms: ['probiotika', 'probiotic', 'probiotics', 'lactobacillus',
      'bifidobacterium', 'laktobazillen', 'milchsaeurebakterien',
      'milchsäurebakterien', 'kulturen'],
    unit: 'KBE',
    what: 'Lebende Mikroorganismen, die die Zusammensetzung der Darmflora beeinflussen. Wirkung ist stammspezifisch.',
    useCases: [
      { topic: 'Nach Antibiotika', note: 'Häufigstes Anwendungsgebiet zur Wiederbesiedlung der Darmflora.' },
      { topic: 'Reizdarm', note: 'Bestimmte Stämme sind hier untersucht.' },
      { topic: 'Reisedurchfall', note: 'Wird prophylaktisch eingesetzt.' },
    ],
    forms: [
      { name: 'Mehrstammpräparat', bioavailability: 'variabel', note: 'Entscheidend ist der exakt benannte Stamm (z. B. "Lactobacillus rhamnosus GG"), nicht nur die Gattung.' },
      { name: 'Magensaftresistente Kapsel', bioavailability: 'höher', note: 'Schützt die Kulturen vor der Magensäure.' },
    ],
    fatSoluble: false,
    cautionNote: 'Angaben in KBE (koloniebildende Einheiten) beziehen sich idealerweise auf das Haltbarkeitsdatum, nicht auf den Herstellzeitpunkt.',
    sources: ['nih-ods'],
  },
  {
    id: 'curcumin',
    name: 'Curcumin (Kurkuma)',
    category: 'Pflanzenstoffe',
    synonyms: ['curcumin', 'kurkuma', 'turmeric', 'curcuma longa',
      'curcuminoide', 'kurkumaextrakt'],
    unit: 'mg',
    what: 'Sekundärer Pflanzenstoff aus der Kurkumawurzel, untersucht wegen entzündungsmodulierender Eigenschaften.',
    useCases: [
      { topic: 'Gelenke', note: 'Häufigstes Anwendungsgebiet bei Gelenkbeschwerden.' },
      { topic: 'Entzündliche Prozesse', note: 'Gegenstand zahlreicher Studien.' },
    ],
    forms: [
      { name: 'Standardextrakt (95 % Curcuminoide)', bioavailability: 'sehr niedrig', note: 'Ohne Aufnahmeverstärker kaum resorbierbar.' },
      { name: 'Mit Piperin', bioavailability: 'erhöht', note: 'Schwarzpfefferextrakt steigert die Aufnahme deutlich — kann aber auch die Aufnahme von Medikamenten beeinflussen.' },
      { name: 'Mizellar / Phytosom', bioavailability: 'hoch', note: 'Technologisch verbesserte Aufnahme ohne Piperin.' },
    ],
    fatSoluble: true,
    cautionNote: 'Kann die Blutungsneigung erhöhen und die Wirkung von Medikamenten beeinflussen. Bei Gallensteinen zurückhaltend.',
    sources: ['nih-ods'],
  },
  {
    id: 'ashwagandha',
    name: 'Ashwagandha',
    category: 'Pflanzenstoffe',
    synonyms: ['ashwagandha', 'withania somnifera', 'schlafbeere',
      'ksm-66', 'sensoril', 'withanolide'],
    unit: 'mg',
    what: 'Heilpflanze aus der ayurvedischen Tradition, in Studien vor allem im Zusammenhang mit Stressbelastung untersucht.',
    useCases: [
      { topic: 'Stress und Cortisol', note: 'Am häufigsten untersuchtes Anwendungsgebiet.' },
      { topic: 'Schlafqualität', note: 'Wird abends eingesetzt.' },
    ],
    forms: [
      { name: 'Wurzelextrakt (standardisiert)', bioavailability: 'hoch', note: 'Auf den Withanolid-Gehalt achten; Wurzelextrakte sind besser untersucht als Blattextrakte.' },
    ],
    fatSoluble: false,
    cautionNote: 'Nicht in Schwangerschaft und Stillzeit. Bei Schilddrüsen- und Autoimmunerkrankungen ärztlich abklären. Kein Wirkstoff für Kinder.',
    sources: ['nih-ods'],
  },
];

// Schneller Zugriff per ID
export const substanceById = new Map(substances.map((s) => [s.id, s]));

export function getSubstance(id) {
  return substanceById.get(id) ?? null;
}
