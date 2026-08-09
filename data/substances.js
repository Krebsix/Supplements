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
 *   sources      Quellenverweise fuer Nachvollziehbarkeit. Zwei Formen:
 *                  - String-Key (Legacy, erste 27 Substanzen): verweist
 *                    auf eine allgemeine Uebersichtsseite der Organisation
 *                    (siehe SOURCE_LABELS/SOURCE_URLS) -- nicht so praezise
 *                    wie die neueren Eintraege, aber immerhin verlinkt.
 *                  - {label, url}-Objekt (ab Juli 2026, per Web-Recherche
 *                    verifiziert): verweist direkt auf das Dokument/die
 *                    Seite, die den konkreten Wert zeigt.
 *                Beide Formen werden von normalizeSources() vereinheitlicht.
 *
 * Wo eine Zahl NICHT in einer Primaerquelle verifiziert werden konnte,
 * steht das explizit im cautionNote-Feld -- lieber Luecke als Erfindung.
 */

export const SOURCE_LABELS = {
  'nih-ods': 'NIH Office of Dietary Supplements, Fact Sheets',
  'efsa-drv': 'EFSA, Dietary Reference Values',
  'efsa-ul': 'EFSA, Tolerable Upper Intake Levels',
  'dach': 'D-A-CH Referenzwerte (DGE/ÖGE/SGE)',
  'bfr': 'Bundesinstitut für Risikobewertung (BfR), Höchstmengen-Empfehlungen',
};

// Allgemeine Uebersichtsseiten fuer die Legacy-String-Keys (siehe oben).
// Weniger praezise als die per-Substanz-Links der neueren Eintraege, aber
// besser als ein unverlinktes Label.
export const SOURCE_URLS = {
  'nih-ods': 'https://ods.od.nih.gov/factsheets/list-all/',
  'efsa-drv': 'https://multimedia.efsa.europa.eu/drvs/index.htm',
  'efsa-ul': 'https://multimedia.efsa.europa.eu/drvs/index.htm',
  'dach': 'https://www.dge.de/wissenschaft/referenzwerte/',
  'bfr': 'https://www.bfr.bund.de/de/höchstmengenvorschlaege_für_vitamine_und_mineralstoffe_in_nahrungsergaenzungsmitteln-54155.html',
};

/**
 * normalizeSources(sources)
 * Bringt beide sources-Formen (String-Key oder {label,url}-Objekt) auf
 * eine einheitliche {label, url}-Form fuer die UI.
 */
export function normalizeSources(sources = []) {
  return sources
    .map((entry) => {
      if (typeof entry === 'string') {
        const label = SOURCE_LABELS[entry];
        if (!label) return null;
        return { label, url: SOURCE_URLS[entry] ?? null };
      }
      if (entry && typeof entry === 'object' && entry.label) {
        return { label: entry.label, url: entry.url ?? null };
      }
      return null;
    })
    .filter(Boolean);
}

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
      { name: 'Carbonat', bioavailability: 'mittel', note: 'Hoher Calciumanteil, benötigt aber Magensäure: mit dem Essen einnehmen.' },
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
    cautionNote: 'Eisen sollte nicht ohne festgestellten Mangel ergänzt werden: überschüssiges Eisen wird gespeichert und ist nicht einfach ausscheidbar.',
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
    cautionNote: 'Der Abstand zwischen Bedarf und Obergrenze ist bei Selen gering: Mengenangaben genau beachten.',
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
      { name: 'Algenpulver (z. B. Kelp)', bioavailability: 'variabel', note: 'Jodgehalt schwankt stark und kann sehr hoch sein: Mengenangabe genau prüfen.' },
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
    cautionNote: 'Fettlöslich und speicherbar: dauerhaft hohe Dosen ohne Blutwertkontrolle sind nicht sinnvoll.',
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
    synonyms: ['vitamin c', 'ascorbinsäure', 'ascorbinsäure', 'ascorbic acid',
      'ester-c', 'calciumascorbat', 'natriumascorbat', 'l-ascorbinsäure', 'vit c'],
    unit: 'mg',
    what: 'Wasserlösliches Vitamin, antioxidativ wirksam und notwendig für die Kollagenbildung.',
    useCases: [
      { topic: 'Immunfunktion', note: 'Häufigstes Anwendungsgebiet, besonders in der Erkältungszeit.' },
      { topic: 'Kollagen, Haut und Bindegewebe', note: 'Unverzichtbar für die Kollagensynthese und damit für Haut, Gefäße und Wundheilung.' },
      { topic: 'Eisenaufnahme', note: 'Verbessert die Resorption pflanzlichen Eisens deutlich: gemeinsame Einnahme ist gängig.' },
      { topic: 'Oxidativer Stress', note: 'Wird bei Rauchen und erhöhter Belastung ergänzt.' },
    ],
    forms: [
      { name: 'Ascorbinsäure', bioavailability: 'hoch', note: 'Standardform, sauer. Kann bei empfindlichem Magen stören.' },
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
      { topic: 'Vegane und vegetarische Ernährung', note: 'Wichtigstes Anwendungsgebiet: B12 kommt praktisch nur in tierischen Lebensmitteln vor. Bei veganer Ernährung ist eine Ergänzung notwendig.' },
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
    synonyms: ['folat', 'folate', 'folsäure', 'folsäure', 'folic acid',
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
    cautionNote: 'Hohe Folatzufuhr kann einen Vitamin-B12-Mangel maskieren: beides gemeinsam betrachten.',
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
    cautionNote: 'Dauerhaft hohe Dosen können Nervenschädigungen verursachen: bei B6 ist die Obergrenze besonders relevant.',
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
      { name: 'Beta-Carotin', bioavailability: 'variabel', note: 'Provitamin, wird bedarfsabhängig umgewandelt: deutlich geringeres Überdosierungsrisiko.' },
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
    cautionNote: 'Hohe Dosen können die Blutungsneigung erhöhen: relevant bei Gerinnungshemmern und vor Operationen.',
    sources: ['nih-ods', 'efsa-ul'],
  },

  // ── Fettsäuren ─────────────────────────────────────────────
  {
    id: 'omega-3',
    name: 'Omega-3 (EPA/DHA)',
    category: 'Fettsäuren',
    synonyms: ['omega 3', 'omega-3', 'omega3', 'fischoel', 'fischöl', 'fish oil',
      'epa', 'dha', 'eicosapentaensäure', 'docosahexaensäure', 'algenoel',
      'algenöl', 'krillöl', 'krilloel'],
    unit: 'mg',
    what: 'Langkettige mehrfach ungesättigte Fettsäuren; Bausteine von Zellmembranen und Ausgangsstoffe entzündungsregulierender Botenstoffe.',
    useCases: [
      { topic: 'Herz-Kreislauf-System', note: 'Am besten untersuchtes Anwendungsgebiet; betrifft unter anderem Triglyzeridwerte.' },
      { topic: 'Entzündliche Prozesse', note: 'EPA ist Ausgangsstoff entzündungsauflösender Mediatoren.' },
      { topic: 'Gehirn und Sehkraft', note: 'DHA ist Strukturbestandteil von Gehirn und Netzhaut: auch in Schwangerschaft und Stillzeit relevant.' },
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
      { name: 'L-Tryptophan', bioavailability: 'hoch', note: 'Aufnahme ins Gehirn wird durch andere Aminosäuren gehemmt: daher nüchtern oder mit Kohlenhydraten.' },
    ],
    fatSoluble: false,
    cautionNote: 'Nicht mit serotonerg wirkenden Medikamenten (SSRI, MAO-Hemmer) kombinieren: Risiko eines Serotonin-Syndroms.',
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
    cautionNote: 'Nicht mit serotonerg wirkenden Medikamenten (SSRI, MAO-Hemmer, Methylenblau) kombinieren: Risiko eines Serotonin-Syndroms.',
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
      { name: 'L-Lysin (HCl)', bioavailability: 'hoch', note: 'Konkurriert mit L-Arginin um dieselben Transporter: zeitlich trennen.' },
    ],
    fatSoluble: false,
    sources: ['nih-ods'],
  },
  {
    id: 'l-arginine',
    name: 'L-Arginin',
    category: 'Aminosäuren',
    synonyms: ['l-arginin', 'arginin', 'arginine', 'arginin-hcl'],
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
      { topic: 'Statin-Einnahme', note: 'Statine senken die körpereigene Q10-Bildung: häufiges Anwendungsgebiet.' },
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
    cautionNote: 'Blockiert die Aufnahme anderer Wirkstoffe und Medikamente: mindestens 2 Stunden Abstand einhalten. Unbedingt mit reichlich Wasser einnehmen.',
    sources: ['nih-ods'],
  },
  {
    id: 'probiotics',
    name: 'Probiotika',
    category: 'Darm',
    synonyms: ['probiotika', 'probiotic', 'probiotics', 'lactobacillus',
      'bifidobacterium', 'laktobazillen', 'milchsäurebakterien',
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
      { name: 'Mit Piperin', bioavailability: 'erhöht', note: 'Schwarzpfefferextrakt steigert die Aufnahme deutlich, kann aber auch die Aufnahme von Medikamenten beeinflussen.' },
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

  // ── Vitamine (Erweiterung Juli 2026) ──────────────────────
  {
    id: 'biotin',
    name: 'Biotin',
    category: 'Vitamine',
    synonyms: ['biotin', 'vitamin b7', 'vitamin b8', 'vitamin h', 'coenzym r', 'd-biotin'],
    unit: 'µg',
    what: 'Wasserlösliches B-Vitamin, Cofaktor mehrerer Carboxylasen im Fett-, Aminosäure- und Glucosestoffwechsel.',
    useCases: [
      { topic: 'Fettsäure- und Energiestoffwechsel', note: 'Wird als Cofaktor von Carboxylasen im Stoffwechsel eingesetzt.' },
      { topic: 'Haut, Haare, Nägel', note: 'Häufig genannter Zusammenhang bei Nahrungsergänzung; laut DGE nur bei nachgewiesenem Mangel belegt.' },
      { topic: 'Nervensystem', note: 'An der Myelinbildung beteiligt.' },
    ],
    forms: [
      { name: 'D-Biotin', aka: ['reines Biotin'], bioavailability: 'gut resorbierbar, biologisch aktive Form', note: 'einzige in Nahrungsergänzungsmitteln übliche Form' },
    ],
    fatSoluble: false,
    cautionNote: 'Ab oralen Aufnahmen von ca. 150 µg/Tag sind Verfälschungen bestimmter Labor-Immunoassays (z. B. Schilddrüsen-, Herzmarker) dokumentiert (EMA/PRAC 2019). Kein UL abgeleitet (SCF/BfR 2024).',
    sources: [
      { label: 'BfR Stellungnahme 2024: Höchstmengenvorschläge Biotin', url: 'https://www.bfr.bund.de/cm/343/höchstmengenvorschlaege-für-biotin-in-lebensmitteln-inklusive-nahrungsergaenzungsmitteln.pdf' },
      { label: 'DGE FAQ Biotin', url: 'https://www.dge.de/gesunde-ernährung/faq/biotin/' },
      { label: 'EFSA Dietary Reference Values Biotin (2014)', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/3580' },
    ],
  },
  {
    id: 'niacin',
    name: 'Niacin',
    category: 'Vitamine',
    synonyms: ['niacin', 'vitamin b3', 'nicotinsäure', 'nicotinsäure', 'nicotinamid', 'niacinamid', 'nikotinsäure', 'nikotinamid', 'vitamin pp'],
    unit: 'mg',
    what: 'Sammelbegriff für Nicotinsäure und Nicotinamid, Baustein der Coenzyme NAD/NADP im Energiestoffwechsel.',
    useCases: [
      { topic: 'Energiestoffwechsel', note: 'Bestandteil von NAD/NADP in praktisch allen Zellen.' },
      { topic: 'Haut- und Schleimhautfunktion', note: 'Historisch mit Pellagra-Prophylaxe verknüpft.' },
      { topic: 'Nervensystem', note: 'An neuronalen Stoffwechselprozessen beteiligt.' },
    ],
    forms: [
      { name: 'Nicotinamid', aka: ['Nicotinsäureamid', 'Niacinamid'], bioavailability: 'gut, kein Flush-Effekt', note: 'übliche Supplementform. Obergrenze rund 900 mg/Tag (Erwachsene), deutlich höher als bei Nicotinsäure.' },
      { name: 'Nicotinsäure', aka: ['Niacin i. e. S.'], bioavailability: 'gut', note: 'kann bereits ab niedrigen mg-Dosen Flush (Hautrötung) auslösen. Obergrenze rund 10 mg/Tag (Erwachsene), deutlich niedriger als bei Nicotinamid.' },
      { name: 'Inosithexanicotinat', aka: ['Inositolniacinat'], bioavailability: 'verzögerte Nicotinsäure-Freisetzung', note: 'nur in Nahrungsergänzungsmitteln, nicht in angereicherten Lebensmitteln zugelassen.' },
    ],
    fatSoluble: false,
    cautionNote: 'Wichtig: Die drei Formen haben stark unterschiedliche Höchstmengen (Faktor über 200 zwischen Nicotinsäure- und Nicotinamid-Obergrenze): ein Nicotinsäure-Produkt darf nicht mit dem Nicotinamid-Wert verglichen werden. In der Schwangerschaft empfiehlt das BfR bei Nicotinamid-Zusätzen über 16 mg/Tag einen Warnhinweis wegen unzureichender Sicherheitsdaten.',
    sources: [
      { label: 'BfR Stellungnahme 2024: Höchstmengenvorschläge Niacin', url: 'https://www.bfr.bund.de/cm/343/höchstmengenvorschlaege-für-niacin-in-lebensmitteln-inklusive-nahrungsergaenzungsmitteln.pdf' },
      { label: 'EFSA Dietary Reference Values Niacin (2014)', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/3759' },
    ],
  },
  {
    id: 'riboflavin',
    name: 'Riboflavin',
    category: 'Vitamine',
    synonyms: ['riboflavin', 'vitamin b2', 'lactoflavin', 'riboflavin-5-phosphat', 'e101'],
    unit: 'mg',
    what: 'Wasserlösliches B-Vitamin, Baustein der Coenzyme FAD/FMN in Redoxreaktionen des Energiestoffwechsels.',
    useCases: [
      { topic: 'Energiestoffwechsel', note: 'Elektronentransportkette, Zellatmung.' },
      { topic: 'Zellwachstum und Regeneration', note: 'Beteiligt an Zellteilungsprozessen.' },
      { topic: 'Rote Blutkörperchen', note: 'An deren Bildung beteiligt.' },
    ],
    forms: [
      { name: 'Riboflavin', aka: ['Lactoflavin'], bioavailability: 'gut', note: 'Standardform.' },
      { name: "Riboflavin-5'-Phosphat", aka: ['FMN'], bioavailability: 'aktive Coenzymform, gut wasserlöslich', note: 'auch als Lebensmittelfarbstoff (E101) zugelassen.' },
    ],
    fatSoluble: false,
    cautionNote: 'Keine relevanten Wechselwirkungen dokumentiert; harmlose Gelbverfärbung des Urins bei höheren Aufnahmen. Kein UL abgeleitet (SCF 2000, bestätigt BfR 2024).',
    sources: [
      { label: 'BfR Stellungnahme 2024: Vitamin B1/B2/Pantothensäure', url: 'https://www.bfr.bund.de/cm/343/hoechstmengenvorschlaege-fuer-vitamin-b1-vitamin-b2-und-pantothensaeure-in-lebensmitteln-inklusive-nahrungsergaenzungsmitteln.pdf' },
      { label: 'EFSA Dietary Reference Values Riboflavin (2017)', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4919' },
    ],
  },
  {
    id: 'thiamin',
    name: 'Thiamin',
    category: 'Vitamine',
    synonyms: ['thiamin', 'thiamine', 'vitamin b1', 'aneurin', 'thiaminhydrochlorid', 'thiaminmononitrat', 'benfotiamin'],
    unit: 'mg',
    what: 'Wasserlösliches B-Vitamin, Cofaktor bei der Decarboxylierung im Kohlenhydratstoffwechsel und für Nervenfunktionen.',
    useCases: [
      { topic: 'Kohlenhydratstoffwechsel', note: 'Cofaktor bei enzymatischer Decarboxylierung.' },
      { topic: 'Nervenfunktion', note: 'Beteiligt an Reizleitung im Nervensystem.' },
      { topic: 'Herzmuskelfunktion', note: 'Am Energiestoffwechsel des Herzmuskels beteiligt.' },
    ],
    forms: [
      { name: 'Thiaminhydrochlorid', bioavailability: 'gut, wasserlöslich', note: 'übliche Supplementform.' },
      { name: 'Thiaminmononitrat', bioavailability: 'gut, stabiler bei Lagerung', note: 'häufig in angereicherten Lebensmitteln.' },
      { name: 'Benfotiamin', aka: ['fettlösliches Thiaminderivat'], bioavailability: 'höhere Aufnahme in Studien beschrieben', note: 'synthetisches Derivat, seltener in klassischen Nahrungsergänzungsmitteln.' },
    ],
    fatSoluble: false,
    cautionNote: 'Keine relevante Kontraindikation bei üblichen Supplement-Dosen bekannt; überschüssiges Thiamin wird über den Urin ausgeschieden. Kein UL abgeleitet (SCF 2001, bestätigt BfR 2024).',
    sources: [
      { label: 'BfR Stellungnahme 2024: Vitamin B1/B2/Pantothensäure', url: 'https://www.bfr.bund.de/cm/343/hoechstmengenvorschlaege-fuer-vitamin-b1-vitamin-b2-und-pantothensaeure-in-lebensmitteln-inklusive-nahrungsergaenzungsmitteln.pdf' },
      { label: 'EFSA Dietary Reference Values Thiamin (2016)', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4653' },
    ],
  },
  {
    id: 'pantothensaeure',
    name: 'Pantothensäure',
    category: 'Vitamine',
    synonyms: ['pantothensäure', 'pantothensaeure', 'vitamin b5', 'pantothenic acid', 'calcium-pantothenat', 'panthenol', 'dexpanthenol'],
    unit: 'mg',
    what: 'Wasserlösliches B-Vitamin, Baustein von Coenzym A, zentral im Fett-, Kohlenhydrat- und Proteinstoffwechsel.',
    useCases: [
      { topic: 'Fett- und Energiestoffwechsel', note: 'Bestandteil von Coenzym A.' },
      { topic: 'Bildung von Hormonen und Neurotransmittern', note: 'An deren Synthese über Coenzym A beteiligt.' },
      { topic: 'Haut', note: 'Panthenol als Provitaminform häufig topisch eingesetzt.' },
    ],
    forms: [
      { name: 'Calcium-D-Pantothenat', aka: ['Calciumpantothenat'], bioavailability: 'gut, stabile Salzform', note: 'übliche orale Supplementform.' },
      { name: 'D-Panthenol', aka: ['Dexpanthenol'], bioavailability: 'wird im Körper zu Pantothensäure umgewandelt', note: 'vor allem in topischen/kosmetischen Produkten.' },
    ],
    fatSoluble: false,
    cautionNote: 'Keine relevanten Wechselwirkungen in Supplement-Dosen dokumentiert. Kein UL abgeleitet (SCF 2002, bestätigt BfR 2024).',
    sources: [
      { label: 'BfR Stellungnahme 2024: Vitamin B1/B2/Pantothensäure', url: 'https://www.bfr.bund.de/cm/343/hoechstmengenvorschlaege-fuer-vitamin-b1-vitamin-b2-und-pantothensaeure-in-lebensmitteln-inklusive-nahrungsergaenzungsmitteln.pdf' },
      { label: 'EFSA Dietary Reference Values Pantothenic Acid (2014)', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/3581' },
    ],
  },
  {
    id: 'choline',
    name: 'Cholin',
    category: 'Vitamine',
    synonyms: ['cholin', 'choline', 'vitamin b4', 'cholinchlorid', 'cholinbitartrat'],
    unit: 'mg',
    what: 'Vitaminähnlicher, semi-essenzieller Nährstoff; wird für den Aufbau von Zellmembranen (Phosphatidylcholin) und den Neurotransmitter Acetylcholin benötigt und teilweise vom Körper selbst gebildet.',
    useCases: [
      { topic: 'Leberfunktion', note: 'EFSA ordnet Cholin eine Rolle bei der normalen Leberfunktion zu.' },
      { topic: 'Schwangerschaft und Stillzeit', note: 'EFSA und das US Food and Nutrition Board setzen hier höhere Schätzwerte an als für Nicht-Schwangere.' },
    ],
    forms: [
      { name: 'Cholinchlorid / Cholinbitartrat', aka: ['gängige Salzformen'], bioavailability: 'gut', note: 'häufigste Supplementform.' },
    ],
    fatSoluble: false,
    cautionNote: 'Die DGE hat keinen eigenen D-A-CH-Referenzwert für Cholin veröffentlicht; in Deutschland wird ersatzweise auf den EFSA-Schätzwert zurückgegriffen. EFSA hat keinen UL abgeleitet (Datenlage laut EFSA unzureichend).',
    sources: [
      { label: 'EFSA Dietary Reference Values for Choline (2016)', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2016.4484' },
      { label: 'NIH ODS Choline Fact Sheet', url: 'https://ods.od.nih.gov/factsheets/Choline-HealthProfessional/' },
    ],
  },

  // ── Mineralien (Erweiterung Juli 2026) ────────────────────
  {
    id: 'chromium',
    name: 'Chrom',
    category: 'Mineralien',
    synonyms: ['chrom', 'chromium', 'chrom(iii)', 'chromium picolinate', 'chrompicolinat', 'chromchlorid', 'chromhefe', 'chromium chloride'],
    unit: 'µg',
    what: 'Spurenelement, dem eine Rolle im Kohlenhydratstoffwechsel zugeschrieben wird; der genaue Wirkmechanismus im Menschen gilt als wissenschaftlich nicht abschließend geklärt.',
    useCases: [
      { topic: 'Kohlenhydratstoffwechsel', note: 'Wird im Zusammenhang mit der Regulation des Blutzuckerspiegels diskutiert.' },
      { topic: 'Nahrungsergänzung bei einseitiger Ernährung', note: 'Wird als Ergänzung bei geringer Zufuhr über Lebensmittel eingesetzt.' },
      { topic: 'Sporternährung', note: 'Wird in manchen Produkten zur Unterstützung des Energiestoffwechsels eingesetzt.' },
    ],
    forms: [
      { name: 'Chrompicolinat', aka: ['chromium picolinate'], bioavailability: 'verbreitetste Form in Nahrungsergänzungsmitteln, gilt als vergleichsweise gut resorbierbar', note: 'meistgenutzte Form.' },
      { name: 'Chromchlorid', aka: ['chromium chloride'], bioavailability: 'geringere Resorption als Picolinat', note: 'einfachere, günstigere Salzform.' },
      { name: 'Chromhefe', aka: ['chromium yeast'], bioavailability: 'organisch gebunden', note: 'wird in manchen Präparaten als natürliche Trägerform verwendet.' },
    ],
    fatSoluble: false,
    cautionNote: 'EFSA konnte Chrom(III) nicht als essenziell für die Allgemeinbevölkerung bestätigen, daher existiert kein offizieller Referenzwert. Das BfR schlägt für Nahrungsergänzungsmittel eine Höchstmenge von 60 µg pro Tagesdosis vor (Stand 2021).',
    sources: [
      { label: 'DGE Referenzwerte: Kupfer, Mangan, Chrom, Molybdän', url: 'https://www.dge.de/wissenschaft/referenzwerte/kupfer-mangan-chrom-molybdaen/' },
      { label: 'BfR: Höchstmengenvorschläge für Chrom', url: 'https://www.bfr.bund.de/cm/343/hoechstmengenvorschlaege-fuer-chrom-in-lebensmitteln-inklusive-nahrungsergaenzungsmitteln.pdf' },
      { label: 'NIH ODS Chromium Fact Sheet', url: 'https://ods.od.nih.gov/factsheets/Chromium-HealthProfessional/' },
    ],
  },
  {
    id: 'manganese',
    name: 'Mangan',
    category: 'Mineralien',
    synonyms: ['mangan', 'manganese', 'manganbisglycinat', 'manganchlorid', 'mangansulfat', 'manganglukonat'],
    unit: 'mg',
    what: 'Spurenelement, Bestandteil mehrerer Enzyme, u. a. antioxidativer Enzyme und solcher des Knochenstoffwechsels.',
    useCases: [
      { topic: 'Knochenstoffwechsel', note: 'Cofaktor knochenrelevanter Enzyme.' },
      { topic: 'Antioxidative Enzymsysteme', note: 'Bestandteil der Mangan-Superoxid-Dismutase.' },
      { topic: 'Kombi-Mineralstoffpräparate', note: 'häufig in Multi-Mineral-Präparaten enthalten.' },
    ],
    forms: [
      { name: 'Manganbisglycinat', aka: ['manganese bisglycinate'], bioavailability: 'an Aminosäuren gebunden, gilt als gut verträglich', note: 'in Nahrungsergänzungsmitteln verbreitete Chelatform.' },
      { name: 'Mangansulfat', aka: ['manganese sulfate'], bioavailability: 'anorganisches Salz', note: 'günstige Standardform.' },
      { name: 'Manganchlorid', aka: ['manganese chloride'], bioavailability: 'anorganisches Salz', note: 'seltener eingesetzt.' },
    ],
    fatSoluble: false,
    cautionNote: 'Das BfR schlägt für Nahrungsergänzungsmittel aktuell 0,5 mg pro Tagesdosis vor.',
    sources: [
      { label: 'DGE Referenzwerte: Kupfer, Mangan, Chrom, Molybdän', url: 'https://www.dge.de/wissenschaft/referenzwerte/kupfer-mangan-chrom-molybdaen/' },
      { label: 'EFSA Scientific Opinion: Tolerable Upper Intake Level for Manganese (2023)', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/8413' },
      { label: 'BfR: Höchstmengenvorschläge für Mangan', url: 'https://www.bfr.bund.de/veroeffentlichung/hoechstmengenvorschlaege-fuer-mangan-in-lebensmitteln-inklusive-nahrungsergaenzungsmitteln/' },
    ],
  },
  {
    id: 'copper',
    name: 'Kupfer',
    category: 'Mineralien',
    synonyms: ['kupfer', 'copper', 'kupferbisglycinat', 'kupfergluconat', 'kupfersulfat'],
    unit: 'mg',
    what: 'Spurenelement, Bestandteil kupferabhängiger Enzyme, u. a. im Eisenstoffwechsel und beim Bindegewebsaufbau.',
    useCases: [
      { topic: 'Eisenstoffwechsel', note: 'Kupferabhängige Enzyme sind am Eisentransport beteiligt.' },
      { topic: 'Bindegewebe', note: 'Wird mit der Quervernetzung von Kollagen und Elastin in Verbindung gebracht.' },
      { topic: 'Kombi-Mineralstoffpräparate', note: 'häufig gemeinsam mit Zink dosiert.' },
    ],
    forms: [
      { name: 'Kupferbisglycinat', aka: ['copper bisglycinate'], bioavailability: 'Chelatform, gilt als gut verträglich', note: 'in Nahrungsergänzungsmitteln verbreitet.' },
      { name: 'Kupfergluconat', aka: ['copper gluconate'], bioavailability: 'organisches Salz', note: 'gängige Supplementform.' },
      { name: 'Kupfersulfat', aka: ['copper sulfate'], bioavailability: 'anorganisches Salz', note: 'Standardform, u. a. in Lebensmittelanreicherung.' },
    ],
    fatSoluble: false,
    cautionNote: 'Eine hohe Zinkzufuhr senkt die Kupferaufnahme im Darm (kompetitive Hemmung): diese Wechselwirkung ist gut belegt. Das BfR weist darauf hin, dass seine Höchstmengen-Empfehlung von 1 mg pro Tagesdosis nicht für Kinder und Jugendliche gilt, da diese Gruppe bereits über die übliche Ernährung vergleichsweise hohe Kupfermengen aufnimmt.',
    sources: [
      { label: 'DGE Referenzwerte: Kupfer, Mangan, Chrom, Molybdän', url: 'https://www.dge.de/wissenschaft/referenzwerte/kupfer-mangan-chrom-molybdaen/' },
      { label: 'EFSA Dietary Reference Values for Copper (2015)', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2015.4253' },
      { label: 'BfR: Höchstmengenvorschläge für Kupfer', url: 'https://www.bfr.bund.de/cm/343/hoechstmengenvorschlaege-fuer-kupfer-in-lebensmitteln-inklusive-nahrungsergaenzungsmitteln.pdf' },
    ],
  },
  {
    id: 'molybdenum',
    name: 'Molybdän',
    category: 'Mineralien',
    synonyms: ['molybdän', 'molybdaen', 'molybdenum', 'natriummolybdat', 'molybdänglycinat'],
    unit: 'µg',
    what: 'Spurenelement, Cofaktor mehrerer Oxidoreduktasen, u. a. im Purin- und Sulfitstoffwechsel.',
    useCases: [
      { topic: 'Enzymcofaktor', note: 'Bestandteil molybdänabhängiger Enzyme (z. B. Sulfitoxidase, Xanthinoxidase).' },
      { topic: 'Kombi-Mineralstoffpräparate', note: 'meist als Nebenkomponente in Multi-Mineral-Präparaten enthalten.' },
    ],
    forms: [
      { name: 'Natriummolybdat', aka: ['sodium molybdate'], bioavailability: 'gut wasserlösliches Salz, Standardform', note: 'häufigste Form in Nahrungsergänzungsmitteln.' },
      { name: 'Molybdänglycinat', aka: ['molybdenum glycinate'], bioavailability: 'Chelatform', note: 'seltener eingesetzt.' },
    ],
    fatSoluble: false,
    cautionNote: 'EFSA-Schätzwert (AI) für Erwachsene: 65 µg/Tag. Ein älterer SCF-Wert von 0,6 mg/Tag (Jahr 2000) ist nicht Teil der aktuellen EFSA-Referenzwert-Bewertung von 2013 und wird hier bewusst nicht als aktuelle Obergrenze übernommen.',
    sources: [
      { label: 'DGE Referenzwerte: Kupfer, Mangan, Chrom, Molybdän', url: 'https://www.dge.de/wissenschaft/referenzwerte/kupfer-mangan-chrom-molybdaen/' },
      { label: 'EFSA Dietary Reference Values for Molybdenum (2013)', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2013.3333' },
      { label: 'BfR: Höchstmengenvorschläge für Molybdän', url: 'https://www.bfr.bund.de/cm/343/hoechstmengenvorschlaege-fuer-molybdaen-in-lebensmitteln-inklusive-nahrungsergaenzungsmittel.pdf' },
    ],
  },
  {
    id: 'phosphorus',
    name: 'Phosphor',
    category: 'Mineralien',
    synonyms: ['phosphor', 'phosphorus', 'phosphat', 'phosphate'],
    unit: 'mg',
    what: 'Mengenelement, zentraler Baustein von Knochen und Zähnen (als Hydroxylapatit), von Nukleinsäuren und energieliefernden Molekülen wie ATP.',
    useCases: [
      { topic: 'Knochen- und Zahnmineralisation', note: 'Hauptbestandteil des Knochenminerals gemeinsam mit Calcium.' },
      { topic: 'Energiestoffwechsel', note: 'Bestandteil von ATP und anderen energietragenden Molekülen.' },
      { topic: 'Zellmembranen und Nukleinsäuren', note: 'Baustein von Phospholipiden, DNA und RNA.' },
    ],
    forms: [
      { name: 'Phosphat (allgemein)', aka: ['phosphate', 'PO4'], bioavailability: 'wird in Nahrungsergänzungsmitteln praktisch nicht isoliert dosiert', note: 'eigenständige Phosphor-Präparate sind unüblich, Phosphor kommt meist als Begleition anderer Mineralstoffverbindungen vor.' },
    ],
    fatSoluble: false,
    cautionNote: 'Das BfR rät von einer gezielten Phosphor-Zugabe in Nahrungsergänzungsmitteln grundsätzlich ab. Weder EFSA noch DGE haben eine Obergrenze abgeleitet (Datenlage laut EFSA 2015 nicht ausreichend).',
    sources: [
      { label: 'DGE Referenzwerte: Phosphor', url: 'https://www.dge.de/wissenschaft/referenzwerte/phosphor/' },
      { label: 'EFSA Dietary Reference Values for Phosphorus (2015)', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4185' },
      { label: 'BfR: Höchstmengenvorschläge für Phosphor/Phosphat', url: 'https://www.bfr.bund.de/veroeffentlichung/hoechstmengenvorschlaege-fuer-phosphor-phosphat-in-lebensmitteln-inklusive-nahrungsergaenzungsmittel/' },
    ],
  },

  // ── Gelenke ────────────────────────────────────────────────
  {
    id: 'glucosamine',
    name: 'Glucosamin',
    category: 'Gelenke',
    synonyms: ['glucosamin', 'glucosamine', 'glukosamin', 'glucosaminsulfat', 'glucosamine sulfate', 'glucosaminhydrochlorid', 'glucosamine hcl', 'aminozucker'],
    unit: 'mg',
    what: 'Aminozucker, der als natürlicher Baustein für Glykosaminoglykane dient: Moleküle, die Teil der Knorpelstruktur sind. Präparate werden meist aus Krebstierschalen (Chitin) oder fermentativ hergestellt.',
    useCases: [
      { topic: 'Kniegelenksarthrose', note: 'Studienlage widersprüchlich: einige Studien zeigen Schmerzlinderung, große Studien fanden wenig bis keine Wirkung. Fachgesellschaften bewerten unterschiedlich.' },
      { topic: 'Hüftgelenksarthrose', note: 'Moderate Evidenz stützt keinen klaren Nutzen.' },
      { topic: 'Kombination mit Chondroitin', note: 'Eine Metaanalyse (29 Studien, 2018) fand: einzeln genommen Schmerzreduktion, in Kombination keinen signifikanten Zusatzeffekt.' },
    ],
    forms: [
      { name: 'Glucosaminsulfat', aka: ['glucosamine sulfate'], bioavailability: 'in Studien am häufigsten untersuchte Form', note: 'in einer Cochrane-Subgruppenanalyse die einzige Form mit signifikantem Effekt gegenüber Placebo.' },
      { name: 'Glucosaminhydrochlorid', aka: ['glucosamine HCl'], bioavailability: 'in Studien uneinheitlicher untersucht', note: 'häufig in Kombinationspräparaten mit Chondroitin.' },
    ],
    fatSoluble: false,
    cautionNote: 'Kann laut NCCIH bei manchen Personen den Blutzuckerspiegel erhöhen; in Kombination mit dem Gerinnungshemmer Warfarin wird ein erhöhtes Blutungsrisiko beschrieben. Ein EFSA-Health-Claim zum Gelenkerhalt wurde mehrfach abgelehnt (Kausalzusammenhang nicht belegt). Handelsübliches Glucosamin stammt meist aus Chitin der Schale, nicht aus dem allergenen Fleisch; dennoch listen viele Hersteller einen Vorsichtshinweis bei Schalentier-Allergie.',
    sources: [
      { label: 'NCCIH: Glucosamine and Chondroitin for Osteoarthritis', url: 'https://www.nccih.nih.gov/health/glucosamine-and-chondroitin-for-osteoarthritis-what-you-need-to-know' },
      { label: 'EFSA Journal 2009 (Opinion 1264)', url: 'https://efsa.onlinelibrary.wiley.com/doi/pdf/10.2903/j.efsa.2009.1264' },
      { label: 'Cochrane: Glucosamine for osteoarthritis', url: 'https://www.cochrane.org/evidence/CD002946_glucosamine-osteoarthritis' },
    ],
  },
  {
    id: 'chondroitin',
    name: 'Chondroitin',
    category: 'Gelenke',
    synonyms: ['chondroitin', 'chondroitinsulfat', 'chondroitin sulfate', 'chondroitin sulphate'],
    unit: 'mg',
    what: 'Sulfatiertes Glykosaminoglykan, natürlicher Bestandteil des Gelenkknorpels; beeinflusst dessen Widerstandsfähigkeit gegen Druckbelastung.',
    useCases: [
      { topic: 'Kniegelenksarthrose', note: 'Studienlage widersprüchlich; eine Metaanalyse (2018) zeigte Schmerzreduktion bei alleiniger Einnahme, nicht in Kombination mit Glucosamin.' },
      { topic: 'Handgelenksarthrose', note: 'Eine Studie zeigte Schmerzreduktion und verbesserte Funktion: Einzelbefund, keine breite Bestätigung.' },
    ],
    forms: [
      { name: 'Chondroitinsulfat', aka: ['chondroitin sulphate'], bioavailability: 'einzige kommerziell relevante Form', note: 'Molekulargewicht und Reinheit variieren stark je nach Ausgangsstoff (Rind-, Schweine-, Fisch- oder Geflügelknorpel).' },
    ],
    fatSoluble: false,
    cautionNote: 'Wie Glucosamin mit einem beschriebenen erhöhten Blutungsrisiko unter Warfarin assoziiert. Ein EFSA-Health-Claim zum Gelenkerhalt wurde abgelehnt (Kausalität nicht nachgewiesen).',
    sources: [
      { label: 'NCCIH: Glucosamine and Chondroitin for Osteoarthritis', url: 'https://www.nccih.nih.gov/health/glucosamine-and-chondroitin-for-osteoarthritis-what-you-need-to-know' },
      { label: 'EFSA Journal 2009 (Opinion 1262)', url: 'https://efsa.onlinelibrary.wiley.com/doi/pdf/10.2903/j.efsa.2009.1262' },
    ],
  },
  {
    id: 'msm',
    name: 'MSM (Methylsulfonylmethan)',
    category: 'Gelenke',
    synonyms: ['msm', 'methylsulfonylmethan', 'methylsulfonylmethane', 'dimethylsulfon', 'dmso2'],
    unit: 'mg',
    what: 'Organische Schwefelverbindung, chemisch verwandt mit DMSO (Dimethylsulfoxid); wird allein oder in Kombination mit Glucosamin angeboten.',
    useCases: [
      { topic: 'Kniegelenksarthrose', note: 'Laut NCCIH nur geringer Forschungsumfang: keine gesicherte Aussage zur Wirksamkeit möglich.' },
      { topic: 'Kombinationspräparate', note: 'häufig zusammen mit Glucosamin vermarktet, eigenständiger Zusatznutzen nicht belegt.' },
    ],
    forms: [
      { name: 'Methylsulfonylmethan', aka: ['MSM'], bioavailability: 'keine belastbaren Vergleichsdaten gefunden', note: 'einzige gebräuchliche Form.' },
    ],
    fatSoluble: false,
    cautionNote: 'Als Nebenwirkungen werden allergische Reaktionen, Magen-Darm-Beschwerden und Hautausschläge beschrieben. Die Gesamtsicherheit gilt laut NCCIH als unsicher, da nur wenig Forschung vorliegt.',
    sources: [
      { label: 'NCCIH: DMSO and MSM for Osteoarthritis', url: 'https://www.nccih.nih.gov/health/dimethyl-sulfoxide-dmso-and-methylsulfonylmethane-msm-for-osteoarthritis' },
    ],
  },
  {
    id: 'collagen-peptides',
    name: 'Kollagenpeptide (hydrolysiertes Kollagen)',
    category: 'Gelenke',
    synonyms: ['kollagen', 'kollagenpeptide', 'hydrolysiertes kollagen', 'collagen peptides', 'collagen hydrolysate', 'hydrolyzed collagen', 'kollagenhydrolysat'],
    unit: 'g',
    what: 'Enzymatisch in kleine Peptide gespaltenes Kollagen (meist aus Rind-, Schweine-, Fisch- oder Geflügelhaut/-knochen); liefert Aminosäuren wie Glycin, Prolin und Hydroxyprolin.',
    useCases: [
      { topic: 'Kniegelenksarthrose (Schmerzen/Funktion)', note: 'Neuere Metaanalysen (u. a. 35 Studien, 2024) zeigen kleine bis moderate Effekte gegenüber Kontrolle; Studienlage insgesamt heterogen bezüglich Dosis, Kollagentyp und Dauer.' },
      { topic: 'Haut', note: 'EFSA hat einen Health Claim zur Hautelastizität abgelehnt (2013): gemessene Effekte erfüllten nicht die EFSA-Definition von Hautfunktion.' },
    ],
    forms: [
      { name: 'Kollagen Typ I', aka: ['collagen type I'], bioavailability: 'hydrolysiert gut resorbierbar', note: 'Hauptbestandteil von Haut, Knochen, Sehnen, Bändern.' },
      { name: 'Kollagen Typ II', aka: ['collagen type II'], bioavailability: 'hydrolysiert vs. undenaturiert unterschiedliche Wirkhypothese', note: 'Hauptbestandteil des Knorpels, im Gelenkkontext am meisten untersucht.' },
      { name: 'Kollagen Typ III', aka: ['collagen type III'], bioavailability: 'meist gemeinsam mit Typ I in Kombipräparaten', note: 'ergänzt Typ I in Haut, Blutgefäßen, elastischem Bindegewebe.' },
    ],
    fatSoluble: false,
    cautionNote: 'Häufige Quellen sind Rind, Schwein, Fisch oder Geflügel: bei entsprechenden Nahrungsmittelallergien relevant für die Herkunftsprüfung. EFSA-Health-Claims zu Gelenken (2011) und Hautelastizität (2013) wurden jeweils abgelehnt.',
    sources: [
      { label: 'EFSA Journal 2011 (Opinion 2291, Gelenke)', url: 'https://efsa.onlinelibrary.wiley.com/doi/pdf/10.2903/j.efsa.2011.2291' },
      { label: 'EFSA Journal 2013 (Opinion 3257, Haut/VeriSol)', url: 'https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2013.3257' },
    ],
  },
  {
    id: 'hyaluronic-acid-oral',
    name: 'Hyaluronsäure (oral)',
    category: 'Gelenke',
    synonyms: ['hyaluronsäure', 'hyaluronsaeure', 'hyaluronic acid', 'hyaluronan', 'natriumhyaluronat', 'sodium hyaluronate'],
    unit: 'mg',
    what: 'Glykosaminoglykan, natürlicher Bestandteil von Gelenkflüssigkeit, Knorpel und Haut; oral als niedrig- bis hochmolekulare Form angeboten (zu unterscheiden von injizierter Hyaluronsäure in der Gelenktherapie).',
    useCases: [
      { topic: 'Kniegelenksarthrose (Symptome)', note: 'Einzelne placebokontrollierte Studien berichten reduzierte Schmerz-/Steifigkeits-Scores; Evidenz insgesamt als limitiert eingestuft.' },
      { topic: 'Hautfeuchtigkeit', note: 'Moderate Evidenzlage, meist mit niedrigmolekularer Hyaluronsäure über 8–12 Wochen untersucht.' },
    ],
    forms: [
      { name: 'Niedrigmolekulare Hyaluronsäure', aka: ['low molecular weight HA'], bioavailability: 'in den meisten Studien mit positiven Daten verwendet', note: 'in Studien überwiegend in Dosen von 80–200 mg/Tag eingesetzt.' },
      { name: 'Hochmolekulare Hyaluronsäure', aka: ['high molecular weight HA'], bioavailability: 'weniger Daten zu oraler Resorption', note: 'vor allem in injizierbarer Form für die Gelenktherapie etabliert.' },
    ],
    fatSoluble: false,
    cautionNote: 'Keine spezifischen Wechselwirkungen oder Kontraindikationen in den geprüften Quellen gefunden. Ein EFSA-Health-Claim zum Gelenkerhalt zählt zu den insgesamt 71 abgelehnten gelenkbezogenen Claims im EU-Register.',
    sources: [
      { label: 'EFSA Journal 2009 (Opinion 1266)', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/1266' },
    ],
  },

  // ── Antioxidantien ─────────────────────────────────────────
  {
    id: 'alpha-lipoic-acid',
    name: 'Alpha-Liponsäure',
    category: 'Antioxidantien',
    synonyms: ['alpha-liponsäure', 'alpha-liponsaeure', 'thioctic acid', 'thioctsäure', 'ala', 'r-ala', 'lipoic acid'],
    unit: 'mg',
    what: 'Schwefelhaltige Fettsäure, die im Körper natürlich als Cofaktor mitochondrialer Enzyme vorkommt und als Antioxidans wirkt; regeneriert zusätzlich verbrauchte Antioxidantien wie Vitamin C.',
    useCases: [
      { topic: 'Oxidativer Stress', note: 'Wird als Radikalfänger diskutiert und ist Gegenstand von Studien zu oxidativem Stress.' },
      { topic: 'Diabetische Neuropathie', note: 'Wird in Studien im Kontext von Nervenfunktion bei Diabetes untersucht.' },
      { topic: 'Blutzuckerstoffwechsel', note: 'Wird im Zusammenhang mit Insulinsensitivität diskutiert.' },
    ],
    forms: [
      { name: 'R-Alpha-Liponsäure (R-ALA)', aka: ['natürliche Form'], bioavailability: 'wird als besser bioverfügbar beschrieben als die S-Form', note: 'körpereigene, biologisch aktive Form.' },
      { name: 'Racemische Mischung (R/S-ALA)', aka: ['synthetisches 50/50-Gemisch'], bioavailability: 'geringere Bioverfügbarkeit der S-Form', note: 'Standard in den meisten kommerziellen Präparaten.' },
    ],
    fatSoluble: false,
    cautionNote: 'Kann die blutzuckersenkende Wirkung von Insulin/Antidiabetika verstärken; Fälle von Unterzuckerung wurden berichtet. Kein EU-weit zugelassener Health Claim. Für eine belastbare Höchstmenge konnte trotz Prüfung keine eindeutig im Volltext verifizierbare Primärquelle bestätigt werden: kursierende Angaben (z. B. 600 mg/Tag) stammen aus Sekundärquellen und werden hier bewusst nicht als gesicherter Wert übernommen.',
    sources: [
      { label: 'Verbraucherzentrale Klartext Nahrungsergänzung: Alpha-Liponsäure', url: 'https://www.klartext-nahrungsergaenzung.de/wissen/lebensmittel/gesund-ernaehren/alphaliponsaeure-eine-fettsaeure-gegen-diabetes-107229' },
    ],
  },
  {
    id: 'n-acetylcysteine',
    name: 'N-Acetylcystein (NAC)',
    category: 'Antioxidantien',
    synonyms: ['nac', 'n-acetylcystein', 'n-acetyl-l-cystein', 'acetylcystein', 'n-acetyl cysteine'],
    unit: 'mg',
    what: 'Synthetisiertes Derivat der Aminosäure Cystein, das im Körper als Vorstufe für die Bildung von Glutathion dient; kommt nicht natürlich in Lebensmitteln vor.',
    useCases: [
      { topic: 'Glutathion-Vorstufe', note: 'Wird als Substrat für die körpereigene Glutathion-Synthese eingeordnet.' },
      { topic: 'Atemwege', note: 'Als Arzneistoff seit den 1960er-Jahren bei Schleimlösung in der Atemwegsmedizin zugelassen.' },
      { topic: 'Oxidativer Stress', note: 'Gegenstand von Forschung zu antioxidativen Prozessen.' },
    ],
    forms: [
      { name: 'N-Acetyl-L-Cystein', aka: ['Standardform'], bioavailability: 'oral, moderat', note: 'einzige gängige Handelsform.' },
    ],
    fatSoluble: false,
    cautionNote: 'Regulatorisch umstritten in Deutschland: NAC ist gleichzeitig zugelassener, teils apothekenpflichtiger Arzneistoff UND wird als Nahrungsergänzungsmittel gehandelt. Diese Doppelrolle wurde wiederholt behördlich geprüft (u. a. Regierungspräsidium Tübingen, Sachverständigenausschuss für Apothekenpflicht beim BfArM 2009): der Status kann je nach Produkt und Zeitpunkt variieren. EFSA hat für NAC bislang keine positive Novel-Food-Bewertung veröffentlicht.',
    sources: [
      { label: 'Apotheke Adhoc: dm verkauft NAC als Lebensmittel', url: 'https://www.apotheke-adhoc.de/nachrichten/detail/markt/dm-verkauft-nac-als-lebensmittel/' },
      { label: 'EFSA: Novel Food (Verfahrensübersicht)', url: 'https://www.efsa.europa.eu/en/topics/topic/novel-food' },
    ],
  },
  {
    id: 'resveratrol',
    name: 'Resveratrol',
    category: 'Antioxidantien',
    synonyms: ['resveratrol', 'trans-resveratrol', 'polygonum-cuspidatum-extrakt', 'japanischer staudenknöterich extrakt'],
    unit: 'mg',
    what: 'Polyphenol (Stilben) aus der Gruppe der Phytoalexine, natürlich u. a. in Rotwein, Traubenschalen und Knöterich-Wurzel enthalten; als synthetisches trans-Resveratrol EU-weit als Novel Food zugelassen.',
    useCases: [
      { topic: 'Antioxidative Prozesse', note: 'Wird im Zusammenhang mit Zellschutz vor oxidativem Stress diskutiert.' },
      { topic: 'Stoffwechsel- und Alterungsforschung', note: 'Gegenstand von Forschung zu Sirtuin-/AMPK-Signalwegen.' },
    ],
    forms: [
      { name: 'Synthetisches trans-Resveratrol', aka: ['EU-zugelassener Novel-Food-Stoff'], bioavailability: 'EU-geprüfte, regulierte Form', note: 'einzige EU-weit als Novel Food für Nahrungsergänzungsmittel zugelassene Form.' },
      { name: 'Polygonum-cuspidatum-Extrakt', aka: ['natürlicher Pflanzenextrakt'], bioavailability: 'variiert je nach Extraktqualität', note: 'gängige Ausgangsquelle in Präparaten.' },
    ],
    fatSoluble: true,
    cautionNote: 'EFSA weist auf mögliche Wechselwirkungen mit bestimmten Arzneimitteln hin. Die Novel-Food-Zulassung gilt ausdrücklich nur für Erwachsene, nicht für Schwangere, Stillende, Kinder und Jugendliche.',
    sources: [
      { label: 'EFSA Journal: Safety of synthetic trans-resveratrol as a novel food (2016)', url: 'https://efsa.onlinelibrary.wiley.com/doi/pdf/10.2903/j.efsa.2016.4368' },
      { label: 'EU-Durchführungsbeschluss (EU) 2016/1190', url: 'https://www.legislation.gov.uk/eudn/2016/1190/data.xht?view=snippet&wrap=true' },
    ],
  },
  {
    id: 'astaxanthin',
    name: 'Astaxanthin',
    category: 'Antioxidantien',
    synonyms: ['astaxanthin', 'haematococcus pluvialis extrakt', 'algen-carotinoid'],
    unit: 'mg',
    what: 'Rotes Carotinoid-Pigment, das vor allem von der Mikroalge Haematococcus pluvialis gebildet wird und über die Nahrungskette (z. B. Lachs, Krill) auch in tierischen Lebensmitteln vorkommt.',
    useCases: [
      { topic: 'Oxidativer Stress', note: 'Wird als eines der potentesten bekannten Carotinoid-Antioxidantien beschrieben.' },
      { topic: 'Sehkraft/Augen', note: 'Gegenstand von Studien zu Augenermüdung.' },
      { topic: 'Haut', note: 'Wird im Kontext von Hautschutz vor UV-bedingtem oxidativem Stress untersucht.' },
    ],
    forms: [
      { name: 'Natürliches Astaxanthin (Algenextrakt)', aka: ['Haematococcus-pluvialis-Extrakt'], bioavailability: 'Referenzform der EFSA-Bewertung', note: 'meistverbreitete Form in Nahrungsergänzungsmitteln.' },
      { name: 'Synthetisches Astaxanthin', bioavailability: 'primär in Aquakultur/Futtermittel eingesetzt', note: 'andere Zulassungshistorie als die Algenform, seltener für Menschen.' },
    ],
    fatSoluble: true,
    cautionNote: 'EFSA bewertet die kombinierte Aufnahme aus Hintergrundernährung (Fisch/Krustentiere) plus Nahrungsergänzung gemeinsam.',
    sources: [
      { label: 'EFSA Journal: Safety of astaxanthin as a novel food in food supplements (2020)', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2020.5993' },
    ],
  },
  {
    id: 'quercetin',
    name: 'Quercetin',
    category: 'Antioxidantien',
    synonyms: ['quercetin', 'quercetin-dihydrat', 'isoquercetin', 'quercetin-glykoside'],
    unit: 'mg',
    what: 'Flavonoid (Flavonol) aus der Gruppe sekundärer Pflanzenstoffe, natürlich enthalten u. a. in Zwiebeln, Äpfeln und Kapern; in Nahrungsergänzungsmitteln meist als isoliertes Quercetin-Dihydrat.',
    useCases: [
      { topic: 'Oxidativer Stress', note: 'Wird als Radikalfänger im Rahmen sekundärer Pflanzenstoffe eingeordnet.' },
      { topic: 'Entzündungsprozesse', note: 'Gegenstand von Forschung zu entzündungsbezogenen Mechanismen.' },
      { topic: 'Immunsystem', note: 'Wird in Studien im Zusammenhang mit Infektabwehr diskutiert.' },
    ],
    forms: [
      { name: 'Quercetin-Dihydrat', aka: ['Standardform'], bioavailability: 'gering, wird durch Bioverfügbarkeitsformulierungen (z. B. Phytosome-Komplexe) verbessert', note: 'häufigste isolierte Form.' },
      { name: 'Quercetin-Glykoside', aka: ['z. B. Rutin, Isoquercetin'], bioavailability: 'unterschiedlich, teils besser resorbiert als das Aglykon', note: 'kommen so natürlich in Lebensmitteln vor.' },
    ],
    fatSoluble: true,
    cautionNote: 'In tierexperimentellen Untersuchungen wurde eine mögliche Verstärkung nephrotoxischer Effekte bei vorgeschädigter Niere sowie ein Effekt auf hormonabhängige Tumore diskutiert. Für Quercetin liegt keine offizielle EFSA-Sicherheitsbewertung/Novel-Food-Entscheidung vor, da es kein Novel Food ist, entsprechend fehlt eine verbindliche EU-Höchstmenge; kursierende Zahlen (500–860 mg) stammen aus wissenschaftlichen Übersichtsarbeiten, nicht aus einer bindenden Behördenfestlegung.',
    sources: [
      { label: 'Andres et al. 2018: Safety Aspects of Quercetin as a Dietary Supplement', url: 'https://onlinelibrary.wiley.com/doi/10.1002/mnfr.201700447' },
      { label: 'VKM (Norwegen): Risk assessment of quercetin dihydrate and rutin (2024)', url: 'https://vkm.no/download/18.111b9bb51900c58335fcde26/1718703086649/Rapport%20quercetin_rutin_final_130624-komprimert.pdf' },
    ],
  },

  // ── Aminosäuren und Neurotransmitter (Erweiterung) ────────
  {
    id: 'taurine',
    name: 'Taurin',
    category: 'Aminosäuren',
    synonyms: ['taurin', 'taurine', '2-aminoethansulfonsäure', '2-aminoethanesulfonic acid'],
    unit: 'mg',
    what: 'Körpereigene, schwefelhaltige Aminosulfonsäure, wird aus Cystein synthetisiert und kommt vor allem in tierischen Lebensmitteln vor. Funktionen: Gallensäure-Konjugation, Zellvolumenregulation, antioxidative Prozesse.',
    useCases: [
      { topic: 'Energy-Drink-Formulierung', note: 'Häufigster Kontext, in dem Taurin behördlich bewertet wurde, meist in Kombination mit Koffein.' },
      { topic: 'Sportlerernährung', note: 'In Studien zu Ausdauerleistung und Erholung untersucht, Ergebnislage uneinheitlich.' },
    ],
    forms: [
      { name: 'Freies Taurin', aka: ['Pulver/Kapsel'], bioavailability: 'hoch, nahezu vollständige Resorption', note: 'Standardform in Nahrungsergänzungsmitteln.' },
    ],
    fatSoluble: false,
    cautionNote: 'Das BfR rät explizit von Energy-Drinks mit Taurin für Kinder, Schwangere und Stillende ab; Wechselwirkungen mit weiteren Energy-Drink-Inhaltsstoffen sind nicht vollständig erforscht.',
    sources: [
      { label: 'EFSA Journal 2009: Taurine and D-glucurono-gamma-lactone in energy drinks', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2009.935' },
      { label: 'BfR: Energydrinks: Bewertung gesundheitlicher Risiken', url: 'https://www.bfr.bund.de/stellungnahme/energydrinks-bfr-aktualisiert-bewertung-der-gesundheitlichen-risiken-fuer-kinder-und-jugendliche-bei-akutem-und-chronischem-verzehr/' },
    ],
  },
  {
    id: 'glycine',
    name: 'Glycin',
    category: 'Aminosäuren',
    synonyms: ['glycin', 'glycine', 'aminoessigsäure', 'glykokoll'],
    unit: 'g',
    what: 'Einfachste proteinogene Aminosäure, Baustein von Kollagen, Glutathion und Kreatin; wirkt zugleich als hemmender Neurotransmitter.',
    useCases: [
      { topic: 'Schlafforschung', note: 'In placebokontrollierten Studien mit ca. 3 g vor dem Zubettgehen auf subjektive Schlafqualität und Einschlaflatenz untersucht.' },
      { topic: 'Kollagen- und Bindegewebsforschung', note: 'Baustein körpereigener Kollagensynthese, daher Bestandteil vieler Kollagen-Präparate.' },
    ],
    forms: [
      { name: 'Freies Glycin', aka: ['Pulver'], bioavailability: 'hoch', note: 'leicht süßlicher Geschmack, meist als Pulver dosiert.' },
    ],
    fatSoluble: false,
    cautionNote: 'Keine spezifische behördliche Warnung gefunden; in Studien mit mehreren Gramm/Tag überwiegend gut vertragen.',
    sources: [
      { label: 'PubMed: Sleep-promoting effects of glycine mediated by NMDA receptors', url: 'https://pubmed.ncbi.nlm.nih.gov/25533534/' },
    ],
  },
  {
    id: 'gaba',
    name: 'GABA (Gamma-Aminobuttersäure)',
    category: 'Neurotransmitter',
    synonyms: ['gaba', 'gamma-aminobuttersäure', 'gamma-aminobutyric acid', '4-aminobuttersäure'],
    unit: 'mg',
    what: 'Wichtigster hemmender Neurotransmitter des zentralen Nervensystems. Oral aufgenommenes GABA überwindet die Blut-Hirn-Schranke nach aktuellem Kenntnisstand nur eingeschränkt: die Übertragbarkeit der zentralen Wirkung auf orale Einnahme wird kontrovers diskutiert.',
    useCases: [
      { topic: 'Entspannung/Stressempfinden', note: 'In klinischen Studien zu subjektivem Stressempfinden untersucht (u. a. 100 mg/Tag über 12 Wochen).' },
      { topic: 'Schlafunterstützung', note: 'Gegenstand von Studien zum Einschlafverhalten.' },
    ],
    forms: [
      { name: 'Freies GABA', aka: ['Pulver/Kapsel'], bioavailability: 'oral eingeschränkt, geringe Passage der Blut-Hirn-Schranke', note: 'häufig fermentativ aus Glutamat hergestellt.' },
    ],
    fatSoluble: false,
    cautionNote: 'In Studien milder, vorübergehender Blutdruckabfall beobachtet. Regulatorischer Status uneinheitlich: In Deutschland existiert seit einem Gerichtsurteil von 2008 eine Allgemeinverfügung, die eine Tagesdosis von 100 mg als Nahrungsergänzungsmittel zulässt; einzelne Behörden haben seither dennoch Beanstandungen ausgesprochen. Das BfR sieht die Datenlage für eine belastbare gesundheitliche Bewertung aktuell als nicht ausreichend an.',
    sources: [
      { label: 'USP: Safety Review of Gamma-Aminobutyric Acid (GABA)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8399837/' },
    ],
  },
  {
    id: 'l-theanine',
    name: 'L-Theanin',
    category: 'Aminosäuren',
    synonyms: ['l-theanin', 'theanin', 'l-theanine', 'theanine', 'gamma-glutamylethylamid'],
    unit: 'mg',
    what: 'Nicht-proteinogene Aminosäure aus Teeblättern (v. a. grüner Tee), strukturell dem Glutamat verwandt.',
    useCases: [
      { topic: 'Entspannung ohne Sedierung', note: 'Meistuntersuchtes Einsatzgebiet, häufig in Kombination mit Koffein betrachtet.' },
      { topic: 'Aufmerksamkeit', note: 'In Kombination mit Koffein in Studien zu Reaktionszeit und Aufmerksamkeit untersucht.' },
      { topic: 'Schlafqualität', note: 'Gegenstand von Studien zur subjektiven Schlafqualität.' },
    ],
    forms: [
      { name: 'Isoliertes L-Theanin', aka: ['Kapsel/Pulver'], bioavailability: 'hoch, gut resorbierbar', note: 'in Deutschland als Kapsel-Nahrungsergänzungsmittel im Handel.' },
    ],
    fatSoluble: false,
    cautionNote: 'EFSA hat 2011 einen wissenschaftlich hinreichend belegten Zusammenhang zwischen L-Theanin und kognitiver Funktion, Stressminderung oder Schlaf verneint und entsprechende Health-Claim-Anträge abgelehnt. Isoliertes, aus Tee extrahiertes L-Theanin gilt als Novel Food; ein EU-Zulassungsverfahren mit vorgeschlagenem Ausschluss von Kindern/Jugendlichen sowie Schwangeren/Stillenden lief zum Recherchezeitpunkt noch.',
    sources: [
      { label: 'EFSA Journal 2011: Health claims related to L-theanine (Ablehnung)', url: 'https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2011.2238' },
      { label: 'EU-Kommission: Novel Food Summary Application L-Theanine', url: 'https://food.ec.europa.eu/document/download/a498e343-3403-427d-a95d-6a8fa4226c3b_en?filename=novel-food_sum_ongoing-app_2024-15277.pdf' },
    ],
  },
  {
    id: 'betaine',
    name: 'Betain (Trimethylglycin, TMG)',
    category: 'Aminosäuren',
    synonyms: ['betain', 'betaine', 'trimethylglycin', 'tmg', 'glycinbetain', 'glycine betaine', 'betain-hcl', 'betain-hydrochlorid'],
    unit: 'mg',
    what: 'Methylgruppen-Donor im Homocystein-Stoffwechsel, kommt natürlich u. a. in Roter Bete, Vollkorn und Spinat vor. Betain-Anhydrat/TMG (Stoffwechselfunktion) ist von Betain-Hydrochlorid (zur Ansäuerung des Magenmilieus) zu unterscheiden: beide werden im Handel als "Betain" bezeichnet, haben aber unterschiedliche Einsatzgebiete.',
    useCases: [
      { topic: 'Homocystein-Stoffwechsel', note: 'Als Methylgruppen-Donor am Homocystein-Stoffwechsel beteiligt.' },
      { topic: 'Sport-/Leistungsergänzung', note: 'EFSA-Zulassung als Novel Food explizit für Sportgetränke/-pulver vorgesehen.' },
      { topic: 'Magenmilieu (Betain-HCl)', note: 'Als Hydrochlorid-Form zur Ansäuerung des Magenmilieus eingesetzt: separate Anwendung von TMG.' },
    ],
    forms: [
      { name: 'Betain-Anhydrat (TMG)', bioavailability: 'hoch', note: 'wasserfreie Form, für Stoffwechsel-/Sport-Anwendungen zugelassen.' },
      { name: 'Betain-Hydrochlorid (Betain-HCl)', bioavailability: 'hoch', note: '76 % Betain + 24 % HCl-Anteil; verändert das Magenmilieu, kann die Resorption von Arzneimitteln beeinflussen.' },
    ],
    fatSoluble: false,
    cautionNote: 'Betain-HCl verändert das Magenmilieu, was die Aufnahme bestimmter Arzneimittel beeinflussen kann. EFSA bezog bei der Sicherheitsbewertung ausdrücklich auch Säuglinge und Kleinkinder ein, da eine Verwendung durch diese Gruppen nicht ausgeschlossen werden kann.',
    sources: [
      { label: 'EFSA Journal 2017: Safety of betaine as a Novel Food', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7009179/' },
    ],
  },

  // ── Pflanzenstoffe (Erweiterung) ──────────────────────────
  {
    id: 'rhodiola-rosea',
    name: 'Rosenwurz (Rhodiola rosea)',
    category: 'Pflanzenstoffe',
    synonyms: ['rhodiola', 'rhodiola rosea', 'rosenwurz', 'rosenwurzel', 'arctic root', 'golden root'],
    unit: 'mg',
    what: 'Wurzelstock einer Pflanze aus arktischen/subarktischen Höhenlagen. In der EU als traditionelles pflanzliches Arzneimittel (HMPC) registriert, Leitsubstanzen sind Rosavine und Salidrosid. Der Wirkmechanismus ist laut HMPC nicht abschließend geklärt.',
    useCases: [
      { topic: 'Stresssymptome (Müdigkeit, Schwächegefühl)', note: 'Einzige offizielle Indikation laut EU-Kräutermonographie (Traditional Use): vorübergehende Linderung. Ein Health-Claim-Antrag zur Reduktion von Müdigkeit bei Stress wurde von EFSA mangels Wirksamkeitsnachweis abgelehnt.' },
    ],
    forms: [
      { name: 'Trockenextrakt', aka: ['Ethanol-Extrakt 67–70 % v/v'], bioavailability: 'einzige in der HMPC-Monographie anerkannte Zubereitungsform', note: 'Handelsübliche Extrakte werden oft zusätzlich auf Rosavin-/Salidrosid-Gehalt standardisiert, das ist jedoch keine offizielle HMPC-Vorgabe.' },
    ],
    fatSoluble: false,
    cautionNote: 'Offiziell (HMPC) einzige Kontraindikation: Überempfindlichkeit gegen den Wirkstoff. Keine Anwendung bei Kindern/Jugendlichen unter 18 Jahren. Eine Wechselwirkung mit Losartan ist beschrieben. Ein in manchen Quellen genannter Hinweis auf Vorsicht bei bipolarer Störung/Manie konnte in offiziellen Primärquellen nicht verifiziert werden.',
    sources: [
      { label: 'EMA/HMPC: Community herbal monograph on Rhodiola rosea', url: 'https://www.ema.europa.eu/en/documents/herbal-monograph/final-community-herbal-monograph-rhodiola-rosea_en.pdf' },
      { label: 'NCCIH: Rhodiola: Usefulness and Safety', url: 'https://www.nccih.nih.gov/health/rhodiola' },
    ],
  },
  {
    id: 'panax-ginseng',
    name: 'Ginseng (Panax ginseng)',
    category: 'Pflanzenstoffe',
    synonyms: ['ginseng', 'panax ginseng', 'asiatischer ginseng', 'koreanischer ginseng', 'roter ginseng', 'weißer ginseng', 'ginsengwurzel'],
    unit: 'mg',
    what: 'Wurzel einer in China/Korea beheimateten Pflanze, botanisch unterschieden von amerikanischem Ginseng (Panax quinquefolius). Leitsubstanzen sind Ginsenoside.',
    useCases: [
      { topic: 'Symptome der Asthenie (Müdigkeit, Schwäche)', note: 'Offizielle HMPC-Indikation (Traditional Use), Anwendungsdauer bis zu 3 Monate.' },
      { topic: 'Blutzucker- und Stoffwechselparameter', note: 'Eine Übersichtsarbeit (2022) zeigte Verbesserungen bei Nüchternblutzucker und Entzündungsmarkern bei Prädiabetes/Diabetes; Evidenz insgesamt nicht abschließend.' },
      { topic: 'Sportliche Leistungsfähigkeit', note: 'Überwiegender Teil der Forschung zeigt laut NCCIH keinen Nutzen für die Leistungssteigerung im Sport.' },
    ],
    forms: [
      { name: 'Trockenextrakt, standardisiert auf 4 % Ginsenoside', aka: ['DER 3–7:1'], bioavailability: 'am stärksten standardisierte Form laut HMPC', note: 'Einzeldosis 40–200 mg, Tagesdosis 40–200 mg.' },
      { name: 'Pulverisierte Droge (weißer Ginseng)', bioavailability: 'n/a', note: 'Tagesdosis 600–2000 mg (HMPC).' },
      { name: 'Pulverisierte Droge (roter Ginseng)', aka: ['dampfbehandelt'], bioavailability: 'n/a', note: 'Tagesdosis 1200–1800 mg (HMPC).' },
    ],
    fatSoluble: false,
    cautionNote: 'Berichtete Nebenwirkungen: Magen-Darm-Beschwerden, Hypersensitivitätsreaktionen, Schlaflosigkeit. Möglicher Einfluss auf Autoimmunerkrankungen und Blutgerinnung. Keine Anwendung bei Kindern/Jugendlichen unter 18 Jahren.',
    sources: [
      { label: 'EMA/HMPC: EU herbal monograph on Panax ginseng (Revision 1, 2024)', url: 'https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-panax-ginseng-camey-radix-revision-1_en.pdf' },
      { label: 'NCCIH: Asian Ginseng: Usefulness and Safety', url: 'https://www.nccih.nih.gov/health/asian-ginseng' },
    ],
  },
  {
    id: 'ginkgo-biloba',
    name: 'Ginkgo (Ginkgo biloba)',
    category: 'Pflanzenstoffe',
    synonyms: ['ginkgo', 'ginkgo biloba', 'ginkgoblätter', 'fächerblattbaum', 'egb 761'],
    unit: 'mg',
    what: 'Blätter des Ginkgobaums. Standardisierter Trockenextrakt mit Flavonglykosiden und Terpenlactonen (Ginkgolide, Bilobalid) als Leitsubstanzen; einziges Präparat dieser Gruppe mit HMPC-"Well-established-use"-Status (höchster Evidenzstatus für pflanzliche Zubereitungen in der EU).',
    useCases: [
      { topic: 'Altersbedingte kognitive Beeinträchtigung / leichte Demenz', note: 'HMPC Well-established-use-Indikation. Große Studien (u. a. mit über 3000 Teilnehmenden 75+) zeigten laut NCCIH keinen Unterschied zu Placebo bei der Demenz-Prävention; allenfalls begrenzter Nutzen bei bestehenden Symptomen.' },
      { topic: 'Durchblutungsstörungen (Schweregefühl in den Beinen)', note: 'HMPC Traditional-Use-Indikation, nach ärztlichem Ausschluss ernster Ursachen.' },
    ],
    forms: [
      { name: 'Trockenextrakt (DER 35–67:1), standardisiert', aka: ['entspricht dem in Studien verwendeten EGb-761-Typ'], bioavailability: 'Well-established-use gemäß HMPC', note: 'Tagesdosis 240 mg, Anwendung mindestens 8 Wochen.' },
    ],
    fatSoluble: false,
    cautionNote: 'Kontraindiziert in der Schwangerschaft (offizielle HMPC-Kontraindikation, nicht nur Warnhinweis). Kann die Blutgerinnung beeinflussen: bei Antikoagulanzien/Thrombozytenaggregationshemmern (z. B. Phenprocoumon, Warfarin, ASS) nur nach ärztlicher Rücksprache. Absetzen 3–4 Tage vor geplanten Operationen als Vorsichtsmaßnahme. Bei Epilepsie kann laut HMPC ein Auftreten weiterer Anfälle nicht ausgeschlossen werden.',
    sources: [
      { label: 'EMA/HMPC: EU herbal monograph on Ginkgo biloba', url: 'https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-ginkgo-biloba-l-folium_en.pdf' },
      { label: 'NCCIH: Ginkgo: Usefulness and Safety', url: 'https://www.nccih.nih.gov/health/ginkgo' },
    ],
  },
  {
    id: 'maca',
    name: 'Maca (Lepidium meyenii)',
    category: 'Pflanzenstoffe',
    synonyms: ['maca', 'lepidium meyenii', 'peruanischer ginseng', 'maca-wurzel', 'maca-pulver'],
    unit: 'mg',
    what: 'Hypocotyl (verdickter Wurzelhals) einer Kreuzblütlerpflanze aus den peruanischen Anden, traditionell als Nahrungsmittel nach Erhitzen verzehrt. Anders als bei anderen Pflanzenstoffen dieser Datenbank existiert keine EMA/HMPC-Kräutermonographie.',
    useCases: [
      { topic: 'Traditioneller Verzehr als Nahrungsmittel', note: 'In den Anden seit langem nach Erhitzen als Lebensmittel verzehrt.' },
      { topic: 'Sexuelles Verlangen (Männer)', note: 'Das BfR zitiert kleine Humanstudien mit Hinweisen auf gesteigertes sexuelles Verlangen bei 1,5–3 g/Tag über 12 Wochen: Studien waren klein (n=15–30) und nicht primär auf Sicherheit ausgelegt.' },
    ],
    forms: [
      { name: 'Wurzelpulver (roh oder geliert)', aka: ['Maca-Pulver'], bioavailability: 'keine behördlich bestätigten Angaben', note: 'Handelsübliche Tagesdosierungen laut einer 2007 zitierten Liste zwischen 400 und 5000 mg, meist 600–2400 mg.' },
    ],
    fatSoluble: false,
    cautionNote: 'Das BfR stellt in seiner Risikobewertung (2007) ausdrücklich fest, dass auf Basis der vorliegenden Daten KEINE gesundheitlich unbedenkliche Verzehrsmenge abgeleitet werden kann: nicht nur, dass keine bekannt ist. Tierstudien zeigen Hinweise auf Effekte auf Geschlechtsorgane und Hormonhaushalt (abhängig von der Farbvariante); konkrete Belege für unerwünschte Wirkungen beim Menschen liegen laut BfR nicht vor, die Datenlage gilt aber als unzureichend.',
    sources: [
      { label: 'BfR: Risikobewertung macahaltiger Nahrungsergänzungsmittel (024/2007)', url: 'https://www.bfr.bund.de/cm/343/risikobewertung_macahaltiger_nahrungsergaenzungsmittel.pdf' },
    ],
  },
  {
    id: 'milk-thistle',
    name: 'Mariendistel (Silybum marianum) / Silymarin',
    category: 'Pflanzenstoffe',
    synonyms: ['mariendistel', 'milk thistle', 'silymarin', 'silybum marianum', 'mariendistelfrüchte'],
    unit: 'mg',
    what: 'Getrocknete Früchte der Mariendistel. Silymarin ist die Sammelbezeichnung für den Flavonolignan-Komplex (u. a. Silybin) der Pflanze und Leitsubstanz der Extrakte.',
    useCases: [
      { topic: 'Verdauungsbeschwerden, Völlegefühl, Blähungen', note: 'HMPC Traditional-Use-Indikation, nach ärztlichem Ausschluss ernster Ursachen.' },
      { topic: 'Unterstützung der Leberfunktion', note: 'Teil der traditionellen HMPC-Indikation. Bei Hepatitis C zeigte eine Auswertung von 5 Studien (2014) laut NCCIH keinen Nutzen für Leberfunktion oder Viruslast.' },
    ],
    forms: [
      { name: 'Pulverisierte Droge', bioavailability: 'n/a', note: 'Einzeldosis 300–600 mg, 2–3×/Tag, Tagesdosis bis 1800 mg (HMPC).' },
      { name: 'Trockenextrakt (DER 30–40:1), Ethanol 96 %', aka: ['hochkonzentrierter Extrakt'], bioavailability: 'am stärksten konzentrierte HMPC-Form', note: 'Einzel-/Tagesdosis 200 mg.' },
      { name: 'Trockenextrakt (DER 20–70:1), Aceton', aka: ['Standardextrakt'], bioavailability: 'gängigste kommerzielle Extraktform', note: 'Tagesdosis bis 478 mg.' },
    ],
    fatSoluble: false,
    cautionNote: 'Kontraindiziert bei Überempfindlichkeit gegen den Wirkstoff und gegen Pflanzen der Familie der Asteraceae/Compositae (Kreuzreaktion). Bei Gelbsucht oder Veränderung der Urin-/Stuhlfarbe soll laut HMPC sofort ärztlicher Rat eingeholt werden.',
    sources: [
      { label: 'EMA/HMPC: EU herbal monograph on Silybum marianum', url: 'https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-silybum-marianum-l-gaertn-fructus_en.pdf' },
      { label: 'NCCIH: Milk Thistle: Usefulness and Safety', url: 'https://www.nccih.nih.gov/health/milk-thistle' },
    ],
  },

  // ── Augen, Sport, Schlaf ───────────────────────────────────
  {
    id: 'lutein-zeaxanthin',
    name: 'Lutein & Zeaxanthin',
    category: 'Augen',
    synonyms: ['lutein', 'zeaxanthin', 'xanthophylle', 'carotinoide', 'macular pigment'],
    unit: 'mg',
    what: 'Zwei Carotinoide (Xanthophylle), die als einzige Carotinoide in nennenswerter Konzentration in der Makula des Auges eingelagert werden, dort blaues Licht filtern und antioxidativ wirken.',
    useCases: [
      { topic: 'Makuladichte', note: 'Werden im Zusammenhang mit dem Schutz der Makula vor oxidativem Stress eingeordnet.' },
      { topic: 'Sehen bei hellem Licht', note: 'EFSA hat einen Health Claim zu verbessertem Sehen unter hellen Lichtbedingungen für die Kombination Lutein/Zeaxanthin wissenschaftlich bestätigt.' },
      { topic: 'Altersbedingte Netzhautveränderungen', note: 'In der NIH-AREDS2-Studie wurde eine Formulierung mit 10 mg Lutein/2 mg Zeaxanthin als Ersatz für Beta-Carotin bei bestehenden Netzhautveränderungen untersucht.' },
    ],
    forms: [
      { name: 'Freies Lutein/Zeaxanthin', aka: ['aus Tagetes erecta'], bioavailability: 'Referenzform in den meisten Studien', note: 'häufigste Rohstoffquelle.' },
      { name: 'Lutein-Ester', bioavailability: 'muss vor Aufnahme im Darm gespalten werden', note: 'kommt so auch natürlich in Pflanzen vor.' },
    ],
    fatSoluble: true,
    cautionNote: 'Als fettlösliche Substanz wird die Aufnahme durch gleichzeitige Nahrungsfette begünstigt. EFSA hat lediglich sicherheitsbezogene Grenzwerte für den Einsatz als Lebensmittelfarbstoff festgelegt, keinen Tages-Referenzwert für Nahrungsergänzungsmittel.',
    sources: [
      { label: 'EFSA Journal: Health Claim Lutein/Zeaxanthin und Sehen (2014)', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2014.3753' },
      { label: 'NIH: Age-Related Eye Disease Study 2 (AREDS2)', url: 'https://www.nei.nih.gov/research/clinical-trials/age-related-eye-disease-studies-aredsareds2' },
    ],
  },
  {
    id: 'beta-alanine',
    name: 'Beta-Alanin',
    category: 'Sport',
    synonyms: ['beta-alanin', 'beta alanin', '3-aminopropionsäure', 'beta-ala'],
    unit: 'mg',
    what: 'Nicht-proteinogene Aminosäure, die als geschwindigkeitsbestimmender Baustein der körpereigenen Carnosin-Synthese in der Skelettmuskulatur dient.',
    useCases: [
      { topic: 'Muskel-Carnosin-Spiegel', note: '4–6 g/Tag über 10 Wochen können den Muskel-Carnosin-Spiegel laut NIH um bis zu 80 % erhöhen.' },
      { topic: 'Kurzzeitige, hochintensive Belastung', note: 'Wird im Kontext von Trainingseinheiten mit hoher Intensität eingeordnet, bei denen Carnosin als Puffer gegen Muskelübersäuerung diskutiert wird.' },
    ],
    forms: [
      { name: 'Freies Beta-Alanin', aka: ['Pulver/Kapsel'], bioavailability: 'gut resorbierbar', note: 'Standardform.' },
      { name: 'Retardiert (sustained-release)', aka: ['verzögerte Freisetzung'], bioavailability: 'soll Spitzenkonzentrationen im Blut senken', note: 'wird zur Reduktion von Kribbeln (Parästhesie) eingesetzt.' },
    ],
    fatSoluble: false,
    cautionNote: 'Bei Einzeldosen oberhalb von ca. 800 mg wird vorübergehendes Kribbeln der Haut (Parästhesie) beschrieben. Keine offizielle Höchstmenge einer Behörde gefunden: Beta-Alanin ist kein essenzieller Nährstoff.',
    sources: [
      { label: 'NIH ODS: Dietary Supplements for Exercise and Athletic Performance', url: 'https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/' },
    ],
  },
  {
    id: 'hmb',
    name: 'HMB (Beta-Hydroxy-Beta-Methylbutyrat)',
    category: 'Sport',
    synonyms: ['hmb', 'beta-hydroxy-beta-methylbutyrat', 'hmb-ca', 'calcium-hmb', 'hmb-fa'],
    unit: 'g',
    what: 'Stoffwechselprodukt der Aminosäure Leucin (rund 5 % des körpereigenen Leucins werden zu HMB umgewandelt); wird mit Muskelproteinstoffwechsel und Regeneration nach muskelschädigender Belastung in Verbindung gebracht.',
    useCases: [
      { topic: 'Regeneration nach intensiver Belastung', note: 'Laut NIH ODS besteht Einigkeit, dass HMB die Erholung nach Training mit ausreichender Intensität für Muskelschäden unterstützen kann.' },
    ],
    forms: [
      { name: 'HMB-Calcium (HMB-Ca)', bioavailability: 'in einer 2024er-Studie höhere relative Bioverfügbarkeit als HMB-FA', note: 'gängigste Kapsel-/Pulverform.' },
      { name: 'HMB freie Säure (HMB-FA)', bioavailability: 'schnellerer, aber insgesamt niedrigerer Bioverfügbarkeitswert als HMB-Ca laut neueren Daten', note: 'meist als Gel oder flüssige Form.' },
    ],
    fatSoluble: false,
    cautionNote: 'Laut NIH ODS gilt 3 g/Tag für Erwachsene bei kurzzeitiger Anwendung als unbedenklich; Sicherheit und Wirksamkeit bei Jugendlichen sind nicht untersucht.',
    sources: [
      { label: 'NIH ODS: Dietary Supplements for Exercise and Athletic Performance', url: 'https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/' },
    ],
  },
  {
    id: 'melatonin',
    name: 'Melatonin',
    category: 'Schlaf',
    synonyms: ['melatonin', 'n-acetyl-5-methoxytryptamin', 'schlafhormon'],
    unit: 'mg',
    what: 'Körpereigenes Hormon der Zirbeldrüse, hauptsächlich nachts gebildet, beteiligt an der Steuerung des Tag-Nacht-Rhythmus.',
    useCases: [
      { topic: 'Jetlag', note: 'EFSA hat einen Health Claim zur Linderung subjektiver Jetlag-Symptome ab 0,5 mg pro Portion wissenschaftlich bestätigt.' },
      { topic: 'Einschlafzeit', note: 'EFSA hat einen Health Claim zur Verkürzung der Einschlafzeit ab 1 mg pro Portion, unmittelbar vor dem Zubettgehen eingenommen, wissenschaftlich bestätigt.' },
    ],
    forms: [
      { name: 'Melatonin, isoliert', bioavailability: 'oral, individuell stark schwankend', note: 'in Nahrungsergänzungsmitteln meist 0,5–2 mg, in Arzneimitteln 2–5 mg pro Einheit.' },
    ],
    fatSoluble: false,
    cautionNote: 'Regulatorischer Sonderstatus in Deutschland: Es gibt keine gesetzlich fixierte mg-Grenze, ab der Melatonin zwingend als Arzneimittel gilt: das BfR vertritt die Position, dass isoliertes Melatonin dosisunabhängig als pharmakologisch wirksamer Stoff einzustufen ist, während Gerichte Einzelfälle unterschiedlich entschieden haben. Als zugelassenes Arzneimittel ist Melatonin zu 3 mg je Packung bis 30 mg bei Jetlag rezeptfrei; andere Dosierungen und Indikationen bleiben verschreibungspflichtig. Das BfR warnte 2024 zusätzlich vor möglichen Gesundheitsrisiken melatoninhaltiger Nahrungsergänzungsmittel.',
    sources: [
      { label: 'BfR: Melatonin als Arzneimittel zulassungspflichtig (dosisunabhängig)', url: 'https://www.bfr.bund.de/veroeffentlichung/melatonin-als-arzneimittel-zulassungspflichtig-empfehlung-der-bundesinstitute-erfolgt-dosisunabhaengig/' },
      { label: 'BfR: Stellungnahme 042/2024 zu melatoninhaltigen Nahrungsergänzungsmitteln', url: 'https://www.bfr.bund.de/cm/343/melatoninhaltige-nahrungsergaenzungsmittel-bfr-weist-auf-moegliche-gesundheitsrisiken-hin-2024.pdf' },
      { label: 'BVL: FAQ Melatonin (Rechtslage)', url: 'https://www.bvl.bund.de/DE/Arbeitsbereiche/01_Lebensmittel/04_AntragstellerUnternehmen/13_FAQ/FAQ_Melatonin/FAQ_Melatonin_node.html' },
    ],
  },

  // ── Eigenbestand-Substanzen (Erweiterung Juli 2026) ───────
  // NMN, Nattokinase, Lion's Mane und Methylenblau sind Teil des
  // persoenlichen inventory.json-Bestands (IDs 1, 2/8, 73, 69), hatten
  // aber bisher keine Wirkstoff-Karte in dieser Datenbank.
  {
    id: 'nmn',
    name: 'NMN (Nicotinamid-Mononukleotid)',
    category: 'Zellenergie',
    synonyms: ['nmn', 'nicotinamide mononucleotide', 'nicotinamidmononukleotid', 'nad+-vorstufe', 'nad-precursor'],
    unit: 'mg',
    what: 'Zwischenprodukt der körpereigenen NAD+-Synthese; NAD+ ist Cofaktor zahlreicher Redoxreaktionen und Substrat für Sirtuine.',
    useCases: [
      { topic: 'NAD+-Spiegel im Blut', note: 'Eine placebokontrollierte Kurzzeit-Humanstudie zeigt einen Anstieg des Blut-NAD+-Spiegels nach oraler Gabe bei gesunden Erwachsenen.' },
      { topic: 'Zellstoffwechsel und Alterungsforschung', note: 'Tierstudien zeigen Effekte auf altersassoziierte Stoffwechselparameter; große klinische Endpunktstudien am Menschen fehlen noch.' },
    ],
    forms: [
      { name: 'Kapsel/Pulver (oral)', bioavailability: 'nur ein Teil des oral aufgenommenen NMN wird unverändert resorbiert, ein relevanter Anteil wird durch die Darmflora zu Nicotinsäure umgewandelt', note: 'Standardform.' },
    ],
    fatSoluble: false,
    cautionNote: 'NMN ist in der EU aktuell nicht als Nahrungsergänzungsmittel zugelassen. EFSA hat im Mai 2026 eine positive Sicherheitsbewertung für einen Zulassungsantrag abgegeben (300 mg/Tag, ausgenommen Schwangere/Stillende): die formale EU-weite Zulassung durch die Kommission steht noch aus. Bis dahin ist die Verkehrsfähigkeit als Nahrungsergänzungsmittel je nach EU-Mitgliedstaat unterschiedlich geregelt.',
    sources: [
      { label: 'EFSA Journal: Safety opinion NMN (2026)', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2026.10007' },
      { label: 'EFSA Journal 2021: Nicotinamide Riboside Chloride (zur Abgrenzung)', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2021.6843' },
    ],
  },
  {
    id: 'nattokinase',
    name: 'Nattokinase',
    category: 'Herz-Kreislauf',
    synonyms: ['nattokinase', 'nsk-sd', 'natto-enzym', 'subtilisin ns'],
    unit: 'mg',
    what: 'Proteolytisches Enzym aus der Fermentation von Sojabohnen zu Natto durch Bacillus subtilis var. natto; in Labor- und Tiermodellen fibrinolytisch wirksam.',
    useCases: [
      { topic: 'Fibrinolyse/Gerinnungssystem', note: 'Labor- und Tiermodelle belegen fibrinolytische Aktivität; kontrollierte Humanstudien zu harten kardiovaskulären Endpunkten sind limitiert.' },
      { topic: 'Zugelassene Werbeaussagen', note: 'Für Nattokinase ist in der EU kein gesundheitsbezogener Claim genehmigt.' },
    ],
    forms: [
      { name: 'NSK-SD (standardisierter fermentierter Sojabohnenextrakt)', bioavailability: 'nicht veröffentlicht', note: 'einzige durch EFSA 2016 im Novel-Food-Verfahren bewertete Spezifikation, standardisiert auf 20.000–28.000 FU/g.' },
    ],
    fatSoluble: false,
    cautionNote: 'Kann die Wirkung von Antikoagulanzien/Thrombozytenaggregationshemmern (Vitamin-K-Antagonisten, DOAK) theoretisch verstärken; Fallberichte beschreiben sowohl Blutungsereignisse als auch thrombotische Komplikationen, wenn Nattokinase eigenmächtig eine Blutverdünner-Therapie ersetzte. Die EFSA-Sicherheitsbewertung 2016 (100 mg NSK-SD/Tag, ≈2000 FU) bezieht sich ausdrücklich auf Erwachsene über 35 Jahre und schließt Schwangere/Stillende aus, deshalb hier ohne strukturierten Referenzwert, da sich die Altersgrenze nicht auf die üblichen Lebensphasen-Gruppen abbilden lässt.',
    sources: [
      { label: 'EFSA Journal 2016: Novel Food Opinion Nattokinase', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2016.4541' },
      { label: 'arznei-telegramm: Fallbericht Blutungsrisiko mit Phenprocoumon', url: 'https://www.arznei-telegramm.de/html/2011_02/1102023_02.html' },
      { label: 'Verbraucherzentrale: Nattokinase bei Herz-Kreislauf-Problemen', url: 'https://www.verbraucherzentrale.de/wissen/lebensmittel/nahrungsergaenzungsmittel/nattokinase-hilfe-bei-herzkreislaufproblemen-93467' },
    ],
  },
  {
    id: 'lions-mane',
    name: "Lion's Mane (Igelstachelbart)",
    category: 'Pilze',
    synonyms: ["lion's mane", 'hericium erinaceus', 'igelstachelbart', 'affenkopfpilz', 'yamabushitake', 'löwenmähne'],
    unit: 'mg',
    what: 'Vitalpilz; der Fruchtkörper enthält vor allem Hericenone, das Myzel vor allem Erinacine: beides Verbindungen mit in präklinischen Studien beschriebener nervenwachstumsfördernder Wirkung.',
    useCases: [
      { topic: 'Leichte kognitive Beeinträchtigung', note: 'Eine kleine japanische Studie (n=30, 3 g Pulver/Tag über 16 Wochen) zeigte Verbesserungen auf Demenz-Symptom-Skalen gegenüber Placebo.' },
      { topic: 'Kognition und Stimmung bei Gesunden', note: 'Placebokontrollierte Studien an gesunden Erwachsenen mit gemischten Ergebnissen: teils schnellere Reaktion in Tests, teils kein signifikanter Gesamteffekt.' },
      { topic: 'Tiermodelle Nervenwachstum', note: 'Effekte auf Gedächtnisleistung und Nervenwachstum in Mäusestudien; Übertragbarkeit auf den Menschen nicht belegt.' },
    ],
    forms: [
      { name: 'Fruchtkörper-Extrakt/-Pulver', bioavailability: 'nicht veröffentlicht', note: 'EU-weit als "nicht neuartig" eingestuft (Verzehr vor 1997 belegt).' },
      { name: 'Myzel-Extrakt/-Pulver', bioavailability: 'Bioverfügbarkeit von Erinacin A ca. 24 %, von Erinacin S ca. 15 % (Tiermodell)', note: 'gilt als Novel Food und benötigt eine gesonderte EU-Zulassung: nicht jedes Marktprodukt verfügt nachweislich darüber.' },
    ],
    fatSoluble: false,
    cautionNote: 'Kein zugelassener EFSA-Health-Claim; Aussagen zur kognitiven Wirkung sind wissenschaftlich nicht abschließend belegt (kleine, gemischte Studienlage).',
    sources: [
      { label: 'EU Novel Food Status Catalogue: Hericium erinaceus', url: 'https://food.ec.europa.eu/system/files/2019-10/novel-food_consult-status_hericium-erinaceus_aesan.pdf' },
      { label: 'PMC: RCT Kognition/Stimmung bei Erwachsenen', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12018234/' },
      { label: 'PMC: Bioverfügbarkeit Erinacin S', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6514545/' },
    ],
  },
  {
    id: 'methylene-blue',
    name: 'Methylenblau',
    category: 'Nootropika',
    synonyms: ['methylenblau', 'methylene blue', 'methylthioniniumchlorid', 'methylthioninium chloride', 'tetramethylthionine chloride'],
    unit: 'mg',
    what: 'Synthetischer Phenothiazin-Farbstoff mit Zulassungsgeschichte als Arzneistoff (u. a. bei Methämoglobinämie, historisch als Antimalariamittel); wird zunehmend niedrigdosiert als "Nootropikum" außerhalb dieses zugelassenen Rahmens vertrieben.',
    useCases: [
      { topic: 'Methämoglobinämie (Arzneimittelindikation)', note: 'Als Arzneistoff intravenös zugelassen zur Behandlung erworbener Methämoglobinämie: betrifft nicht die orale Einnahme als Nahrungsergänzungsmittel.' },
      { topic: 'Vermarktung als Nootropikum', note: 'Wird von Online-Anbietern als Konzentrationsmittel beworben: diese Anwendung ist von keiner der geprüften Behörden (EFSA, BfR, BfArM) bewertet oder zugelassen.' },
    ],
    forms: [
      { name: 'Wässrige Lösung/Tropfen', bioavailability: 'nicht veröffentlicht für den Einnahmekontext als Nahrungsergänzungsmittel', note: 'In Online-Shops teils explizit als "Farbstoff zum Anfärben von Fasern" oder "Laborchemikalie" deklariert: ein erkennbares Schlupfloch, um die Einstufung als Lebensmittel zu umgehen.' },
      { name: 'Kapsel (als Nahrungsergänzungsmittel beworben)', bioavailability: 'nicht veröffentlicht', note: 'Werbung mit "USP-Qualität"/"Pharmaqualität" stammt aus Herstellerangaben, nicht aus behördlicher Prüfung, und ist ohne chargenspezifisches Analysenzertifikat nicht verifizierbar.' },
    ],
    fatSoluble: false,
    cautionNote: 'Regulatorischer Status: Methylenblau ist in Deutschland/der EU nicht als Lebensmittel oder Nahrungsergänzungsmittel zugelassen: keine E-Nummer, kein Novel-Food-Beschluss für den oralen Verzehr. Als Arzneistoff (intravenöse Zubereitung) ist es in Deutschland verschreibungspflichtig. Reinheit: Technische bzw. Labor-Qualität kann Schwermetalle und Restlösungsmittel in Konzentrationen enthalten, die für den menschlichen Verzehr nicht zugelassen wären: eine als "USP" beworbene Kapsel ist ohne unabhängiges Analysenzertifikat nicht überprüfbar. G6PD-Mangel gilt laut Fachinformation als Kontraindikation (Risiko schwerer Hämolyse). Methylenblau wirkt als potenter MAO-A-Hemmer: das Serotonin-Syndrom-Risiko in Kombination mit SSRI, SNRI, MAO-Hemmern, 5-HTP und Tryptophan gilt laut behördlicher Warnung bei JEDER Dosierung, nicht nur bei hohen (Arzneimittel-)Mengen.',
    sources: [
      { label: 'FDA: Prescribing Information Methylene Blue Injection (2024)', url: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/204630Orig1s023lbl.pdf' },
      { label: 'BfArM: Zulassung von Arzneimitteln (Verfahrensrahmen)', url: 'https://www.bfarm.de/DE/Arzneimittel/Zulassung/_node.html' },
      { label: 'Apotheken Umschau: Einordnung als Gefahr statt Wundermittel', url: 'https://www.apotheken-umschau.de/news/methylenblau-kein-wundermittel-sondern-gefahr-für-gesundheit-1168173.html' },
    ],
  },

  // ── Stoffwechsel (Erweiterung) ────────────────────────────
  {
    id: 'l-carnitine',
    name: 'L-Carnitin',
    category: 'Stoffwechsel',
    synonyms: ['l-carnitin', 'l-carnitine', 'carnitin', 'levocarnitin', 'acetyl-l-carnitin', 'alcar', 'propionyl-l-carnitin'],
    unit: 'mg',
    what: 'Aus den Aminosäuren Lysin und Methionin körpereigen synthetisierte Verbindung, die Fettsäuren zur Energiegewinnung in die Mitochondrien transportiert. Für gesunde Menschen kein essenzieller Nährstoff, da die Eigensynthese den Bedarf deckt.',
    useCases: [
      { topic: 'Fettsäure-Transport/Energiestoffwechsel', note: 'Physiologische Grundfunktion, gut belegt.' },
      { topic: 'Sportliche Leistung/Regeneration', note: 'Häufig im Ausdauer- und Kraftsport eingesetzt; Studienlage zu Leistungssteigerung uneinheitlich, Effekte oft klein.' },
      { topic: 'Chronische Nierenerkrankung/Dialyse', note: 'Wird in bestimmten klinischen Kontexten bei nachgewiesenem Mangel ärztlich eingesetzt.' },
    ],
    forms: [
      { name: 'L-Carnitin', aka: ['L-Carnitin-Tartrat', 'L-Carnitin-Fumarat'], bioavailability: 'oral ca. 14–18 % der Dosis, dosisabhängig sinkend', note: 'Standardform.' },
      { name: 'Acetyl-L-Carnitin', aka: ['ALCAR'], bioavailability: 'höher als reines L-Carnitin', note: 'in Studien v. a. mit kognitiven Fragestellungen assoziiert.' },
      { name: 'Propionyl-L-Carnitin', aka: ['PLCAR'], bioavailability: 'vergleichbar mit L-Carnitin, andere Gewebeverteilung', note: 'in Studien v. a. mit Durchblutungsfragestellungen assoziiert.' },
    ],
    fatSoluble: false,
    cautionNote: 'Ab ca. 3 g/Tag können Übelkeit, Erbrechen, Bauchkrämpfe, Durchfall und Fischgeruch auftreten. Bei Anfallsleiden wird unter hohen Dosen ein erhöhtes Anfallsrisiko beschrieben. Kein DGE- oder EFSA-Referenzwert vorhanden, da Carnitin aus Lebensmitteln als sicher gilt.',
    sources: [
      { label: 'NIH ODS: Carnitine (Health Professional Fact Sheet)', url: 'https://ods.od.nih.gov/factsheets/Carnitine-HealthProfessional/' },
    ],
  },
  {
    id: 'berberine',
    name: 'Berberin',
    category: 'Stoffwechsel',
    synonyms: ['berberin', 'berberine', 'berberis', 'berberitze', 'berberin hcl'],
    unit: 'mg',
    what: 'Pflanzlicher Alkaloid-Wirkstoff, enthalten u. a. in Berberitze, Gelbwurzel und Mahonie. Wird mit AMPK-Aktivierung und Effekten auf Glukose- und Lipidstoffwechsel in Verbindung gebracht.',
    useCases: [
      { topic: 'Blutzuckerstoffwechsel', note: 'Klinische Studien zeigen Effekte auf Nüchtern- und postprandialen Blutzucker bei Typ-2-Diabetes; Studienqualität und Produktstandardisierung sind uneinheitlich.' },
      { topic: 'Blutfette', note: 'Studien beschreiben Senkungen von LDL-Cholesterin und Triglyzeriden; kein Ersatz für eine Statintherapie.' },
    ],
    forms: [
      { name: 'Berberin-HCl', bioavailability: 'sehr niedrig (unter 1 %), ausgeprägter First-Pass-Metabolismus', note: 'gängigste Supplementform.' },
    ],
    fatSoluble: false,
    cautionNote: 'Wechselwirkungen mit Statinen, Metformin/Antidiabetika und Blutdrucksenkern werden in der Literatur beschrieben. WICHTIG: EFSA konnte in einer laufenden, noch nicht final abgeschlossenen Risikobewertung (Konsultation 2026) bislang KEINE sichere Aufnahmemenge für berberinhaltige Pflanzenzubereitungen ableiten: eine Obergrenze existiert deshalb nicht, weil die zuständige Behörde selbst keine festlegen konnte.',
    sources: [
      { label: 'NutraIngredients: EFSA-Konsultation zu Berberin (2026)', url: 'https://www.nutraingredients.com/Article/2026/03/10/no-safe-intake-level-for-berberine-efsa-opens-consultation/' },
      { label: 'UK Committee on Toxicity: Draft Scientific Opinion Berberine', url: 'https://www.gov.uk/government/publications/31st-march-2026-committee-on-toxicity-meeting/draft-scientific-opinion-on-the-safety-of-plant-preparations-containing-berberine' },
    ],
  },
  {
    id: 'cla',
    name: 'CLA (Konjugierte Linolsäure)',
    category: 'Stoffwechsel',
    synonyms: ['cla', 'konjugierte linolsäure', 'conjugated linoleic acid'],
    unit: 'g',
    what: 'Sammelbegriff für positionsisomere, konjugierte Doppelbindungsformen der Linolsäure, natürlich in Milchprodukten und Rindfleisch enthalten; als Supplement meist synthetisch aus Linolsäure hergestellt.',
    useCases: [
      { topic: 'Körperfettanteil', note: 'In Tierstudien Effekte auf Fettmasse beschrieben; in Humanstudien laut NIH ODS nur kleine, klinisch fragliche Effekte.' },
      { topic: 'Muskelmasse', note: 'Vermuteter Zusammenhang mit Zunahme fettfreier Masse; EFSA sah die Evidenz als nicht ausreichend an.' },
    ],
    forms: [
      { name: 'CLA-Isomerengemisch (c9,t11 / t10,c12)', bioavailability: 'gut resorbiert wie andere Fettsäuren', note: 'übliche Supplementform.' },
    ],
    fatSoluble: true,
    cautionNote: 'EFSA (2010) verweist auf einen Anstieg von Isoprostanen (Marker für Lipidperoxidation) und Entzündungsmarkern unter CLA-Einnahme (ca. 3 g/Tag) und sah darin ein mögliches Risiko für Gefäßschäden bei längerer Einnahme, deshalb wurden mehrere Health-Claim-Anträge zu CLA abgelehnt. Kein DGE- oder EFSA-Referenzwert vorhanden.',
    sources: [
      { label: 'EFSA Journal 2010: Scientific Opinion on CLA isomers', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2010.1794' },
      { label: 'NutraIngredients: EFSA rejects CLA body fat claim (2015)', url: 'https://www.nutraingredients.com/Article/2015/01/09/EFSA-rejects-CLA-and-body-fat-reduction-claim/' },
    ],
  },
  {
    id: 'green-tea-extract-egcg',
    name: 'Grüntee-Extrakt (EGCG)',
    category: 'Antioxidantien',
    synonyms: ['grüntee-extrakt', 'grüner tee extrakt', 'egcg', 'epigallocatechingallat', 'green tea extract', 'catechine'],
    unit: 'mg',
    what: 'Hochkonzentrierter Extrakt aus Blättern von Camellia sinensis, standardisiert auf den Hauptcatechin Epigallocatechin-3-gallat (EGCG): deutlich höhere EGCG-Konzentration als aufgegossener Tee.',
    useCases: [
      { topic: 'Antioxidative Wirkung', note: 'Catechine gelten als radikalfangende Polyphenole, gut belegt in vitro und präklinisch.' },
      { topic: 'Stoffwechsel/Thermogenese', note: 'Wird mit Effekten auf den Energiestoffwechsel in Verbindung gebracht; Humandatenlage zu klinisch relevanten Effekten uneinheitlich.' },
    ],
    forms: [
      { name: 'Grüntee-Blattextrakt, EGCG-standardisiert', bioavailability: 'gering, nüchtern deutlich erhöht', note: 'Bioverfügbarkeit und Toxizität steigen bei Einnahme auf nüchternen Magen deutlich an.' },
    ],
    fatSoluble: false,
    cautionNote: 'EFSA kam 2018 zu dem Schluss, dass ab einer EGCG-Dosis von 800 mg/Tag aus Nahrungsergänzungsmitteln mit ersten Anzeichen einer Leberschädigung zu rechnen ist. Aufgegossener Grüntee (kein Extrakt) wurde als generell unbedenklich eingestuft: die dokumentierten Leberschadensfälle betreffen praktisch ausschließlich hochkonzentrierte Extrakte. Die Einnahme auf nüchternen Magen erhöht Bioverfügbarkeit und Risiko zusätzlich.',
    sources: [
      { label: 'EFSA Journal 2018: Safety of green tea catechins', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2018.5239' },
      { label: 'Verbraucherzentrale: Grüntee-Extrakt', url: 'https://www.verbraucherzentrale.de/wissen/lebensmittel/nahrungsergaenzungsmittel/gar-nicht-so-harmlos-grünteeextrakt-80386' },
    ],
  },

  // ── Gelenke und Entzündung (Erweiterung) ──────────────────
  {
    id: 'boswellia',
    name: 'Weihrauch (Boswellia serrata)',
    category: 'Gelenke',
    synonyms: ['weihrauch', 'indischer weihrauch', 'boswellia', 'boswellia serrata', 'olibanum', 'frankincense', 'boswelliasäuren'],
    unit: 'mg',
    what: 'Gummiharz-Extrakt aus der Rinde des Weihrauchbaums, enthält Boswelliasäuren, die als Hemmstoffe des Enzyms 5-Lipoxygenase diskutiert werden.',
    useCases: [
      { topic: 'Gelenkbeschwerden', note: 'Mehrere kleinere Studien deuten auf mögliche Reduktion von Entzündung/Schmerz bei Arthrose hin; größere, hochwertige Studien fehlen.' },
      { topic: 'Atemwege', note: 'Vereinzelte kleine Studien zu Asthma-Symptomen, Evidenzlage begrenzt.' },
    ],
    forms: [
      { name: 'Gummiharz-/Trockenextrakt', bioavailability: 'keine einheitliche Standardisierung in den geprüften Quellen belegbar', note: 'Kapsel, Tablette oder Tinktur.' },
    ],
    fatSoluble: false,
    cautionNote: 'Für Weihrauch/Boswellia serrata existiert, anders als bei Teufelskralle, KEINE offizielle EU-Kräutermonographie (HMPC), da keine belegte traditionelle Verwendung in Europa vorliegt. Die einzige belastbare Quelle ist die internationale Studienübersicht der NCCIH: "There is not enough high-quality evidence to determine whether boswellia is useful for any health condition." Bis 1000 mg/Tag über 6 Monate bzw. 2400 mg/Tag über 1 Monat gilt als im Allgemeinen unbedenklich getestet; Sicherheitsdaten zu Schwangerschaft/Stillzeit sind begrenzt.',
    sources: [
      { label: 'NCCIH: Boswellia', url: 'https://www.nccih.nih.gov/health/boswellia' },
    ],
  },
  {
    id: 'harpagophytum',
    name: 'Teufelskralle (Harpagophytum procumbens)',
    category: 'Gelenke',
    synonyms: ['teufelskralle', 'teufelskrallenwurzel', 'harpagophytum', 'harpagophytum procumbens', "devil's claw"],
    unit: 'mg',
    what: 'Getrocknete Speicherwurzel von Harpagophytum procumbens, enthält u. a. Harpagosid. Traditionell als Tee sowie Flüssig- und Trockenextrakte verwendet.',
    useCases: [
      { topic: 'Leichte Gelenkbeschwerden', note: 'HMPC (EU-Kräutermonographie): traditionelles pflanzliches Arzneimittel zur Linderung geringfügiger Gelenkschmerzen, basierend auf langjähriger Anwendung.' },
      { topic: 'Milde Verdauungsbeschwerden', note: 'HMPC: Linderung leichter Beschwerden wie Blähungen sowie bei vorübergehendem Appetitverlust.' },
    ],
    forms: [
      { name: 'Trockenextrakt', bioavailability: 'HMPC listet zahlreiche Extraktvarianten mit unterschiedlichen Dosierungsbereichen', note: 'Auszugsmittel Wasser oder Ethanol 30–90 %.' },
      { name: 'Flüssigextrakt/Tinktur', bioavailability: 'n/a', note: 'z. B. 1:5, Ethanol 25 %.' },
    ],
    fatSoluble: false,
    cautionNote: 'HMPC-Kontraindikation: aktives Magen- oder Zwölffingerdarmgeschwür. Bei Gallensteinen soll vor Anwendung ärztlicher Rat eingeholt werden. Anwendung länger als 4 Wochen (Gelenkschmerzen) bzw. 2 Wochen (Verdauung) ohne ärztlichen Rat nicht vorgesehen. Berichtete Nebenwirkungen: Magen-Darm-Beschwerden, Kopfschmerz, Schwindel, Überempfindlichkeitsreaktionen.',
    sources: [
      { label: 'EMA/HMPC: Harpagophytum procumbens/zeyheri, radix', url: 'https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-harpagophytum-procumbens-dc-andor-harpagophytum-zeyheri-decne-radix_en.pdf' },
    ],
  },
  {
    id: 'bromelain',
    name: 'Bromelain',
    category: 'Gelenke',
    synonyms: ['bromelain', 'bromelin', 'ananas-enzym'],
    unit: 'mg',
    what: 'Gruppe proteinspaltender Enzyme (Cystein-Proteasen) aus Stängel und Frucht der Ananaspflanze.',
    useCases: [
      { topic: 'Nach zahnchirurgischen Eingriffen', note: 'Am häufigsten beworbener Anwendungsbereich laut NCCIH; einige Studien deuten auf mögliche Symptomlinderung hin, Evidenzlage begrenzt.' },
      { topic: 'Gelenkbeschwerden/Muskelkater', note: 'In der Literatur diskutiert, Studienlage begrenzt.' },
    ],
    forms: [
      { name: 'Bromelain-Extrakt/-Pulver', bioavailability: 'n/a', note: 'Potenzangabe auf Etiketten häufig über Wirkeinheiten (GDU/MCU/FIP) statt Masse.' },
    ],
    fatSoluble: false,
    cautionNote: 'Im Allgemeinen gut verträglich; häufigste Nebenwirkungen sind Magenbeschwerden und Durchfall. Als proteinspaltendes Enzym wird eine mögliche Wechselwirkung mit gerinnungshemmenden Wirkstoffen diskutiert. Für Bromelain liegt keine finale EFSA-Bewertung vor: entsprechende Health-Claim-Anträge sind seit Jahren unentschieden ("on hold").',
    sources: [
      { label: 'NCCIH: Bromelain', url: 'https://www.nccih.nih.gov/health/bromelain' },
    ],
  },
  {
    id: 'silicium',
    name: 'Kieselsäure / Silicium',
    category: 'Mineralien',
    synonyms: ['kieselsäure', 'silicium', 'silizium', 'silica', 'orthokieselsäure', 'bambusextrakt', 'zinnkrautextrakt', 'siliciumdioxid'],
    unit: 'mg',
    what: 'Halbmetall, kommt im Körper hauptsächlich als Siliciumdioxid oder gebundene Kieselsäure vor; wird u. a. aus Bambus- oder Zinnkraut-Extrakten sowie in synthetischen Formen angeboten.',
    useCases: [
      { topic: 'Bindegewebe, Haare, Haut, Nägel', note: 'Verbreiteter Einsatzbereich; laut EFSA ist jedoch keine spezifische biochemische Funktion von Silicium beim Menschen gesichert nachgewiesen.' },
    ],
    forms: [
      { name: 'Siliciumdioxid (SiO2)', bioavailability: 'häufigste Form', note: 'BfR-Höchstmengenempfehlung bis 350 mg Silicium/Tag.' },
      { name: 'Kieselsäure/Silicagel', bioavailability: 'n/a', note: 'BfR-Höchstmengenempfehlung bis 100 mg Silicium/Tag.' },
      { name: 'Cholin-stabilisierte Orthokieselsäure', aka: ['Bambusextrakt-Präparate'], bioavailability: 'von EFSA 2009 bewertet', note: 'BfR-Höchstmengenempfehlung bis 10 mg Silicium/Tag.' },
      { name: 'Organisches Silicium (Monomethylsilantriol)', bioavailability: 'n/a', note: 'als Novel Food zugelassen, BfR-Höchstmengenempfehlung bis 10 mg Silicium/Tag.' },
    ],
    fatSoluble: false,
    cautionNote: 'EFSA (2004) konnte mangels Daten keine Obergrenze ableiten; Silicium gilt als nicht-essenzieller Nährstoff, ein Mangel wurde beim Menschen bisher nicht beobachtet. Die D-A-CH-Referenzwerte führen keinen Wert für Silicium. Wichtig: Die BfR-Höchstmengenempfehlung unterscheidet sich stark je nach Form (Faktor 35 zwischen SiO2 und Bambusextrakt): eine einzelne Zahl ohne Formangabe wäre irreführend, deshalb hier ohne strukturierten Referenzwert.',
    sources: [
      { label: 'BfR: Höchstmengenvorschläge für Silicium', url: 'https://www.bfr.bund.de/cm/349/proposed-maximum-levels-for-the-addition-of-silicon-to-foods-including-food-supplements.pdf' },
      { label: 'DGE: Referenzwerte-Übersicht', url: 'https://www.dge.de/wissenschaft/referenzwerte/' },
    ],
  },

  // ── Darm und Algen (Erweiterung) ───────────────────────────
  {
    id: 'spirulina',
    name: 'Spirulina',
    category: 'Algen',
    synonyms: ['spirulina', 'arthrospira platensis', 'blaualge', 'blau-grün-alge'],
    unit: 'g',
    what: 'Cyanobakterium (fälschlich oft als Mikroalge bezeichnet), getrocknet als proteinreiches Nahrungsergänzungsmittel vermarktet.',
    useCases: [
      { topic: 'Proteinquelle', note: 'Wird als pflanzliche Proteinquelle mit hohem Anteil beworben; zur Deckung des Tagesbedarfs wären laut Verbraucherzentrale jedoch unrealistisch große Verzehrmengen nötig.' },
      { topic: 'Antioxidative Wirkung', note: 'Enthält Phycocyanin und Beta-Carotin; entsprechende Health-Claims wurden von EFSA mangels ausreichender Evidenz zurückgewiesen.' },
    ],
    forms: [
      { name: 'Tablette/Kapsel (getrocknete Biomasse)', bioavailability: 'n/a', note: 'häufigste Handelsform.' },
      { name: 'Pulver', bioavailability: 'n/a', note: 'zum Anrühren.' },
    ],
    fatSoluble: false,
    cautionNote: 'Marktchecks dokumentieren wiederholt Belastungen mit Schwermetallen (Blei, Cadmium, Quecksilber), lebertoxischen Mikrocystinen bei Kontamination durch andere Cyanobakterien sowie punktuell Mikroplastik und Pestizidrückstände. Enthält Phenylalanin.',
    sources: [
      { label: 'Verbraucherzentrale: Spirulina: Viel Grün und wenig dahinter', url: 'https://www.verbraucherzentrale.de/wissen/lebensmittel/nahrungsergaenzungsmittel/spirulina-viel-gruen-und-wenig-dahinter-21053' },
      { label: 'NIH LiverTox: Spirulina', url: 'https://www.ncbi.nlm.nih.gov/books/NBK548312/' },
    ],
  },
  {
    id: 'chlorella',
    name: 'Chlorella',
    category: 'Algen',
    synonyms: ['chlorella', 'chlorella vulgaris', 'chlorella pyrenoidosa', 'süsswasseralge'],
    unit: 'g',
    what: 'Einzellige Süßwasser-Grünalge mit dicker Zellwand, die für die Verdaulichkeit meist technisch aufgebrochen wird ("broken cell wall").',
    useCases: [
      { topic: 'Proteinquelle', note: 'Hoher Proteingehalt wird beworben; für den Tagesbedarf sind laut Verbraucherzentrale unrealistisch große Mengen nötig.' },
      { topic: 'Chlorophyllquelle', note: 'Spezifische EFSA-Gesundheits-Claims (u. a. zu Verdauung/Leber) wurden mangels Evidenz abgelehnt.' },
    ],
    forms: [
      { name: 'Tablette (cracked cell wall)', bioavailability: 'höher als bei intakter Zellwand laut Herstellerangaben', note: 'unabhängige Vergleichsdaten dazu nicht verifiziert.' },
      { name: 'Pulver', bioavailability: 'n/a' },
    ],
    fatSoluble: false,
    cautionNote: 'Marktchecks dokumentieren für Algenprodukte generell und Chlorella im Speziellen Belastungen mit Cadmium, Blei, Kupfer sowie Anreicherung von Arsen und Aluminium. Enthält vergleichsweise hohe Mengen Vitamin K.',
    sources: [
      { label: 'Verbraucherzentrale: Marktcheck essbare Algen', url: 'https://www.verbraucherzentrale.de/wissen/lebensmittel/kennzeichnung-und-inhaltsstoffe/marktcheck-essbare-algen-naehrstoffquelle-mit-potenziellem-gesundheitsrisiko-102668' },
    ],
  },
  {
    id: 'digestive-enzymes',
    name: 'Verdauungsenzyme',
    category: 'Darm',
    synonyms: ['verdauungsenzyme', 'digestive enzymes', 'enzymkomplex', 'amylase', 'lipase', 'protease'],
    unit: 'mg',
    what: 'Kombinationspräparate aus verdauungsunterstützenden Enzymen (typisch: Amylase, Lipase, Protease), im Freiverkauf meist pflanzlichen/mikrobiellen Ursprungs, zu unterscheiden von der verschreibungspflichtigen Pankreasenzym-Ersatztherapie bei nachgewiesener Pankreasinsuffizienz.',
    useCases: [
      { topic: 'Amylase', note: 'Spaltet Stärke/Polysaccharide zu Zuckerbausteinen.' },
      { topic: 'Lipase', note: 'Katalysiert die Spaltung von Triglyceriden zu Fettsäuren und Glycerin.' },
      { topic: 'Protease', note: 'Spaltet Proteine in Peptide und Aminosäuren.' },
    ],
    forms: [
      { name: 'Amylase/Lipase/Protease-Kombination', bioavailability: 'wirkt lokal im Verdauungstrakt', note: 'keine systemische Bioverfügbarkeit im eigentlichen Sinn.' },
    ],
    fatSoluble: false,
    cautionNote: 'Die EU-Lebensmittelenzym-Verordnung gilt ausdrücklich NICHT für Enzyme, die zum unmittelbaren menschlichen Verzehr bestimmt sind: Verdauungsenzym-Präparate fallen unter das allgemeine Nahrungsergänzungsmittelrecht. Keine EFSA-Health-Claim-Zulassung für Enzymkombinationen als Supplement gefunden.',
    sources: [
      { label: 'EUR-Lex: Verordnung (EG) Nr. 1332/2008', url: 'https://eur-lex.europa.eu/legal-content/DE/ALL/?uri=CELEX:32008R1332' },
    ],
  },
  {
    id: 'black-seed-oil',
    name: 'Schwarzkümmelöl',
    category: 'Öle',
    synonyms: ['schwarzkümmelöl', 'schwarzkümmel', 'nigella sativa', 'black seed oil', 'kalonji oil'],
    unit: 'mg',
    what: 'Fettes Öl aus den Samen von Nigella sativa, traditionell in Nahost/Südasien als Gewürz und Volksmedizin genutzt; Hauptwirkstoff ist Thymoquinon.',
    useCases: [
      { topic: 'Blutzucker', note: 'Wird in klinischen Studien im Zusammenhang mit Veränderungen des Blutzuckerspiegels untersucht.' },
      { topic: 'Blutdruck', note: 'In Studien wird eine geringfügige Senkung bei gesunden Erwachsenen beschrieben.' },
      { topic: 'Cholesterin/Triglyceride', note: 'Wird im Zusammenhang mit leichten Veränderungen der Blutfettwerte diskutiert.' },
    ],
    forms: [
      { name: 'Fettes Öl (Kaltpressung)', bioavailability: 'n/a', note: 'im Handel übliche Form.' },
    ],
    fatSoluble: true,
    cautionNote: 'Wechselwirkungen mit Blutverdünnern (erhöhtes Blutungsrisiko), Blutdruckmedikamenten, Diabetesmedikamenten und Immunsuppressiva werden in Sekundärquellen beschrieben; empfohlenes Absetzen mindestens zwei Wochen vor Operationen. Eine explizite BfR-Stellungnahme zu Schwarzkümmelöl wurde nicht gefunden.',
    sources: [
      { label: 'PMC: The Use of Nigella sativa in Cardiometabolic Diseases', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10886913/' },
    ],
  },

  // ── Frauen- und Männergesundheit ───────────────────────────
  {
    id: 'saw-palmetto',
    name: 'Sägepalme',
    category: 'Männergesundheit',
    synonyms: ['sägepalme', 'saw palmetto', 'serenoa repens', 'sabal serrulatum', 'sägepalmenfrucht'],
    unit: 'mg',
    what: 'Extrakt aus der Frucht der Sägepalme; wirkt u. a. über eine Hemmung der 5-α-Reduktase und wird bei Prostatabeschwerden untersucht.',
    useCases: [
      { topic: 'Benigne Prostatahyperplasie (Hexan-Extrakt)', note: 'HMPC-Einstufung "Well-established Use": Behandlung von Symptomen der benignen Prostatahyperplasie.' },
      { topic: 'Untere Harnwegssymptome (Ethanol-Extrakt)', note: 'HMPC-Einstufung "Traditional Use", nachdem ernste Erkrankungen ärztlich ausgeschlossen wurden.' },
      { topic: 'Studienlage', note: 'NCCIH: als Monopräparat "wenig bis kein Nutzen" bei BPH-Symptomen laut mehreren NIH-finanzierten Studien, auch bei dreifacher Standarddosis.' },
    ],
    forms: [
      { name: 'Hexan-Extrakt', bioavailability: 'Well-established Use (HMPC)', note: 'am besten untersuchte Extraktform.' },
      { name: 'Ethanol-Extrakt', bioavailability: 'Traditional Use (HMPC)', note: 'geringere Evidenzbasis.' },
    ],
    fatSoluble: false,
    cautionNote: 'HMPC beschränkt die Anwendung auf erwachsene und ältere Männer. Vor Einnahme sollen ernste Erkrankungen (z. B. Prostatakarzinom) ärztlich ausgeschlossen werden.',
    sources: [
      { label: 'EMA/HMPC: Sabalis serrulatae fructus', url: 'https://www.ema.europa.eu/en/medicines/herbal/sabalis-serrulatae-fructus' },
      { label: 'NCCIH: Saw Palmetto', url: 'https://www.nccih.nih.gov/health/saw-palmetto' },
    ],
  },
  {
    id: 'nettle-root',
    name: 'Brennnesselwurzel',
    category: 'Männergesundheit',
    synonyms: ['brennnesselwurzel', 'nettle root', 'urtica dioica radix', 'urticae radix'],
    unit: 'mg',
    what: 'Wurzelextrakt der Großen Brennnessel, von Brennnesselblatt (andere Indikation) klar zu unterscheiden.',
    useCases: [
      { topic: 'Untere Harnwegssymptome bei BPH', note: 'EU-Kräutermonographie (HMPC, Revision 2024): traditionell eingesetzt zur Linderung von Miktionsbeschwerden im Rahmen einer benignen Prostatahyperplasie, nachdem ernste Erkrankungen ärztlich ausgeschlossen wurden.' },
    ],
    forms: [
      { name: 'Wässrig-alkoholischer Trockenextrakt', bioavailability: 'Traditional Use (HMPC)', note: 'klassische traditionelle Zubereitungsform.' },
    ],
    fatSoluble: false,
    cautionNote: 'Nicht zu verwechseln mit Brennnesselblatt (andere Monographie, andere Indikation). Ernste Erkrankungen der Harnwege sollten vor Einnahme ärztlich ausgeschlossen werden.',
    sources: [
      { label: 'EMA/HMPC: Urticae radix', url: 'https://www.ema.europa.eu/en/medicines/herbal/urticae-radix' },
    ],
  },
  {
    id: 'chasteberry',
    name: 'Mönchspfeffer',
    category: 'Frauengesundheit',
    synonyms: ['mönchspfeffer', 'keuschlamm', 'chasteberry', 'vitex agnus-castus', 'mönchspfefferfrucht'],
    unit: 'mg',
    what: 'Extrakt aus den Früchten des Keuschlamms; wirkt u. a. dopaminerg auf die Hypophyse und beeinflusst darüber die Prolaktin-Ausschüttung.',
    useCases: [
      { topic: 'Prämenstruelles Syndrom (spezifischer Trockenextrakt)', note: 'HMPC "Well-established Use": Behandlung von PMS-Symptomen bei kontinuierlicher Einnahme über 3 Monate.' },
      { topic: 'Leichte PMS-Beschwerden (andere Zubereitungen)', note: 'HMPC "Traditional Use": Linderung leichter Beschwerden in den Tagen vor der Menstruation.' },
      { topic: 'Studienlage', note: 'NCCIH: Hinweise auf Besserung bei Brustspannen, insgesamt aber nur begrenzte Evidenzqualität.' },
    ],
    forms: [
      { name: 'Trockenextrakt (spezifisch, standardisiert)', bioavailability: 'Well-established Use (HMPC)', note: 'für PMS-Dauertherapie über 3 Monate.' },
    ],
    fatSoluble: false,
    cautionNote: 'HMPC beschränkt Anwendung auf erwachsene Frauen. NCCIH warnt vor Anwendung bei hormonempfindlichen Erkrankungen (Brust-, Gebärmutter-, Eierstockkrebs). Die dopaminerge Wirkung kann mit hormonellen Kontrazeptiva und dopaminwirksamen Medikamenten interagieren.',
    sources: [
      { label: 'EMA/HMPC: Agni casti fructus', url: 'https://www.ema.europa.eu/en/medicines/herbal/agni-casti-fructus' },
      { label: 'NCCIH: Chasteberry', url: 'https://www.nccih.nih.gov/health/chasteberry' },
    ],
  },
  {
    id: 'black-cohosh',
    name: 'Traubensilberkerze',
    category: 'Frauengesundheit',
    synonyms: ['traubensilberkerze', 'black cohosh', 'cimicifuga racemosa', 'actaea racemosa'],
    unit: 'mg',
    what: 'Extrakt aus dem Wurzelstock der Traubensilberkerze; traditionell und wissenschaftlich bei Wechseljahresbeschwerden untersucht.',
    useCases: [
      { topic: 'Wechseljahresbeschwerden', note: 'HMPC "Well-established Use": Einsatz bei Hitzewallungen und übermäßigem Schwitzen.' },
      { topic: 'Studienlage', note: 'NCCIH (Übersicht über 22 Studien): potenziell hilfreich bei Wechseljahresbeschwerden, insbesondere Hitzewallungen; keine Besserung bei Angst/Depressivität.' },
    ],
    forms: [
      { name: 'Trockenextrakt/Fluidextrakt', bioavailability: 'Well-established Use (HMPC)', note: 'Anwendung maximal 6 Monate ohne ärztliche Rücksprache.' },
    ],
    fatSoluble: false,
    cautionNote: 'Leberwarnhinweis (HMPC): Einnahme sofort beenden und Arzt aufsuchen bei Anzeichen von Leberproblemen (Müdigkeit, Appetitlosigkeit, Gelbfärbung von Haut/Augen, starke Oberbauchschmerzen mit Übelkeit, dunkler Urin). NCCIH bestätigt gemeldete Fälle teils schwerer Leberschäden bei als Traubensilberkerze deklarierten Präparaten (Kausalität unsicher, Fälle selten, teils Qualitätsprobleme durch falsche Pflanze/nicht deklarierte Beimischungen). Sicherheit bei hormonempfindlichen Krebserkrankungen ungeklärt.',
    sources: [
      { label: 'EMA/HMPC: Cimicifugae rhizoma', url: 'https://www.ema.europa.eu/en/medicines/herbal/cimicifugae-rhizoma' },
      { label: 'NCCIH: Black Cohosh', url: 'https://www.nccih.nih.gov/health/black-cohosh' },
    ],
  },
  {
    id: 'myo-inositol',
    name: 'Myo-Inositol',
    category: 'Frauengesundheit',
    synonyms: ['myo-inositol', 'inositol', 'myoinositol'],
    unit: 'g',
    what: 'Zuckeralkohol, körpereigen synthetisiert und über die Nahrung aufgenommen; spielt eine Rolle in Second-Messenger-Systemen der Insulinsignalübertragung.',
    useCases: [
      { topic: 'PCOS-assoziierte Subfertilität/IVF-Vorbehandlung', note: 'Ein Cochrane-Review stuft die Evidenzqualität als "sehr niedrig" ein: Es ist unsicher, ob Myo-Inositol die Lebendgeburten- oder Schwangerschaftsrate bei subfertilen Frauen mit PCOS verbessert.' },
    ],
    forms: [
      { name: 'Myo-Inositol (Pulver/Kapsel)', bioavailability: 'n/a', note: 'in Studien meist als Reinstoff, teils kombiniert mit D-Chiro-Inositol.' },
    ],
    fatSoluble: false,
    cautionNote: 'Keine gesundheitliche Empfehlung ableitbar: die Studienlage (Cochrane) stuft die Evidenz selbst als sehr niedrig ein. Weder DGE noch EFSA führen einen offiziellen Referenzwert.',
    sources: [
      { label: 'Cochrane: Inositol for women with PCOS and subfertility', url: 'https://www.cochrane.org/evidence/CD012378_inositol-women-diagnosis-polycystic-ovary-syndrome-and-subfertility' },
    ],
  },

  // ── Longevity und Spurenelemente (Erweiterung) ────────────
  {
    id: 'pqq',
    name: 'PQQ (Pyrrolochinolinchinon)',
    category: 'Zellenergie',
    synonyms: ['pqq', 'pyrroloquinoline quinone', 'pyrrolochinolinchinon', 'methoxatin', 'biopqq'],
    unit: 'mg',
    what: 'Redox-Cofaktor, der in geringen Mengen in Lebensmitteln vorkommt; wird mit mitochondrialer Biogenese und antioxidativen Redoxreaktionen in Verbindung gebracht.',
    useCases: [
      { topic: 'Zellenergie/Mitochondrien', note: 'Wird in Zellkultur- und Tierstudien mit mitochondrialer Biogenese in Verbindung gebracht; Humandaten sind begrenzt.' },
      { topic: 'Antioxidative Prozesse', note: 'Wirkt in vitro als Redox-Cofaktor; klinische Endpunkte beim Menschen sind nicht etabliert.' },
    ],
    forms: [
      { name: 'PQQ-Dinatriumsalz', aka: ['BioPQQ'], bioavailability: 'einzige in der EU als Novel Food zugelassene Form, Mindestreinheit 99 %', note: 'andere Salzformen sind in der EU nicht als Lebensmittelzutat zugelassen.' },
    ],
    fatSoluble: false,
    cautionNote: 'In der EU als Novel Food nur für Erwachsene zugelassen, Schwangere und Stillende ausdrücklich ausgenommen. Langzeit-Humansicherheitsdaten sind begrenzt.',
    sources: [
      { label: 'EUR-Lex: Durchführungsverordnung (EU) 2018/1122', url: 'https://eur-lex.europa.eu/eli/reg_impl/2018/1122/oj/eng' },
      { label: 'EFSA Journal 2017: Safety of PQQ disodium salt', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2017.5058' },
    ],
  },
  {
    id: 'spermidine',
    name: 'Spermidin',
    category: 'Longevity',
    synonyms: ['spermidin', 'spermidine', 'weizenkeimextrakt', 'polyamin'],
    unit: 'mg',
    what: 'Natürlich vorkommendes Polyamin (u. a. in Weizenkeimen, gereiftem Käse, Sojabohnen), das an Autophagie-Prozessen beteiligt sein soll.',
    useCases: [
      { topic: 'Autophagie/Zellalterung', note: 'Tierstudien (u. a. Mäuse) zeigen Effekte auf die Lebensspanne; Übertragbarkeit auf den Menschen ist nicht belegt, gilt als früher Forschungsstand.' },
      { topic: 'Kognition im Alter', note: 'Eine 12-Monats-Studie fand keinen signifikanten Effekt auf Gedächtnis/Biomarker gegenüber Placebo bei älteren Menschen mit subjektiver kognitiver Beeinträchtigung.' },
    ],
    forms: [
      { name: 'Spermidinreicher Weizenkeimextrakt', bioavailability: 'EU-zugelassene Spezifikation: Spermidingehalt 0,8–2,4 mg/g', note: 'synthetische Spermidin-Salze sind von dieser Zulassung nicht abgedeckt.' },
    ],
    fatSoluble: false,
    cautionNote: 'Spermidinreicher Weizenkeimextrakt ist in der EU als Novel Food zugelassen und reguliert. Die Wirkforschung zu Longevity-Effekten stammt überwiegend aus Zell-/Tiermodellen; kontrollierte Humanstudien mit harten Endpunkten fehlen weitgehend.',
    sources: [
      { label: 'EUR-Lex: Durchführungsverordnung (EU) 2020/443', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32020R0443' },
      { label: 'JAMA Network Open: SmartAge Trial (2022)', url: 'https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2792725' },
    ],
  },
  {
    id: 'fisetin',
    name: 'Fisetin',
    category: 'Longevity',
    synonyms: ['fisetin', 'flavonol'],
    unit: 'mg',
    what: 'Ein Flavonol, das natürlich u. a. in Erdbeeren, Äpfeln und Zwiebeln vorkommt. Wird in der Zellalterungsforschung als sogenannter "Senolytikum-Kandidat" untersucht.',
    useCases: [
      { topic: 'Seneszente Zellen (früher Forschungsstand)', note: 'Tier- und Zellkulturstudien deuten auf senolytische Effekte hin; ein erster kleiner Human-Pilotversuch zu Gebrechlichkeit bei älteren Frauen läuft, belastbare Wirksamkeitsdaten am Menschen liegen NICHT vor.' },
      { topic: 'Entzündungsmarker', note: 'Wird in laufenden klinischen Studien untersucht (z. B. bei Sepsis bei älteren Patienten), Ergebnisse noch offen.' },
    ],
    forms: [
      { name: 'Fisetin-Extrakt/-Isolat', bioavailability: 'geringe orale Bioverfügbarkeit, rasche Verstoffwechselung', note: 'in Studien teils mit Piperin oder Lipid-Formulierungen kombiniert. Keine EU-Novel-Food-Zulassung recherchierbar.' },
    ],
    fatSoluble: false,
    cautionNote: 'Die Forschung zu Fisetin als Senolytikum befindet sich überwiegend im Tier-/Zellkulturstadium; Humandaten stammen aus wenigen kleinen Pilotstudien. Keine gesicherten Interaktionsdaten verfügbar. Keine dedizierte EFSA- oder DGE-Bewertung auffindbar.',
    sources: [
      { label: 'ClinicalTrials.gov: NCT03325322 (Fisetin, Gebrechlichkeit bei älteren Frauen)', url: 'https://clinicaltrials.gov/study/NCT03325322' },
    ],
  },
  {
    id: 'boron',
    name: 'Bor',
    category: 'Mineralien',
    synonyms: ['bor', 'boron', 'borsäure', 'natriumborat', 'bortriglycinat'],
    unit: 'mg',
    what: 'Spurenelement, das von EFSA als nicht-essenziell eingestuft wird: eine spezifische physiologische Funktion beim Menschen ist bislang nicht identifiziert.',
    useCases: [
      { topic: 'Knochenstoffwechsel', note: 'Wird in Tierstudien mit Calcium-/Vitamin-D-Stoffwechsel in Verbindung gebracht; keine zugelassene gesundheitsbezogene Aussage in der EU.' },
    ],
    forms: [
      { name: 'Natriumborat/Borax', bioavailability: 'in EU-Bewertungen als Referenzform genutzt', note: 'auch als Lebensmittelzusatzstoff (E 285) separat bewertet.' },
      { name: 'Bor-Chelat', aka: ['Bortriglycinat'], bioavailability: 'in Nahrungsergänzungsmitteln gängige Form', note: 'keine gesonderten Bioverfügbarkeitsdaten je Chelatform recherchiert.' },
    ],
    fatSoluble: false,
    cautionNote: 'Die DGE führt für Bor keinen D-A-CH-Referenzwert. Das BfR empfiehlt für Nahrungsergänzungsmittel eine deutlich niedrigere Höchstmenge (0,5 mg/Tag) als der EFSA-UL (10 mg/Tag für Erwachsene), da die Hintergrundaufnahme aus anderen Quellen bei Kindern/Jugendlichen bereits den UL ausschöpfen kann. Das BfR empfiehlt einen Verbraucherhinweis "Für Kinder und Jugendliche nicht geeignet".',
    sources: [
      { label: 'BfR: Höchstmengenvorschläge für Bor', url: 'https://www.bfr.bund.de/cm/343/hoechstmengenvorschlaege-fuer-bor-in-lebensmitteln-inklusive-nahrungsergaenzungsmitteln.pdf' },
      { label: 'EFSA 2004: Tolerable Upper Intake Level of Boron', url: 'https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2004.80' },
    ],
  },
  {
    id: 'l-carnosine',
    name: 'L-Carnosin',
    category: 'Antioxidantien',
    synonyms: ['l-carnosin', 'carnosin', 'carnosine', 'beta-alanyl-l-histidin', 'zink-l-carnosin'],
    unit: 'mg',
    what: 'Dipeptid aus den Aminosäuren Beta-Alanin und Histidin, natürlich vor allem in Muskel- und Hirngewebe enthalten. Wirkt u. a. als pH-Puffer. Zu unterscheiden von Beta-Alanin allein, das im Körper zu Carnosin verstoffwechselt wird und die etabliertere Supplementform ist.',
    useCases: [
      { topic: 'Muskel-pH-Pufferung', note: 'Trägt zu 10–20 % der Puffer-Kapazität in Muskelfasern bei; oral zugeführtes Carnosin wird durch Serum-Carnosinase rasch gespalten, wodurch die direkte Wirkung auf den Muskelspiegel begrenzt ist.' },
      { topic: 'Antioxidative Prozesse', note: 'In-vitro-Daten zeigen Abfangen reaktiver Sauerstoffspezies und reduzierte Bildung fortgeschrittener Glykierungsendprodukte.' },
    ],
    forms: [
      { name: 'L-Carnosin (freies Dipeptid)', bioavailability: 'wird durch Serum-Carnosinase rasch zu Beta-Alanin und Histidin hydrolysiert', note: 'in Studien meist 500 mg – 2 g/Tag.' },
      { name: 'Zink-L-Carnosin-Komplex', aka: ['Zinc L-carnosinate'], bioavailability: 'andere Kinetik als freies Carnosin', note: 'eigenständige Zutat, nicht mit reinem L-Carnosin gleichzusetzen.' },
    ],
    fatSoluble: false,
    cautionNote: 'Da L-Carnosin durch körpereigene Carnosinase schnell abgebaut wird, ist der tatsächliche Nutzen einer oralen Zufuhr gegenüber Beta-Alanin-Supplementierung umstritten. Keine dedizierte EFSA- oder D-A-CH-Referenzwertbewertung auffindbar.',
    sources: [
      { label: 'NIH ODS: Verwandte Aminosäure-Fachinformation (Kontext Beta-Alanin/Carnosin)', url: 'https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/' },
    ],
  },
  {
    id: 'caffeine',
    name: 'Koffein',
    category: 'Stimulanzien',
    synonyms: ['koffein', 'coffein', 'caffeine', 'koffeinanhydrat', 'caffeine anhydrous', '1,3,7-trimethylxanthin', 'trimethylxanthine', 'coffeinum'],
    unit: 'mg',
    what: 'Methylxanthin-Alkaloid, blockiert Adenosinrezeptoren im zentralen Nervensystem und wirkt dadurch anregend auf Wachheit, Aufmerksamkeit und körperliche Leistungsfähigkeit.',
    useCases: [
      { topic: 'Wachheit/Konzentration', note: 'wird zur kurzfristigen Steigerung von Aufmerksamkeit eingesetzt.' },
      { topic: 'Sport/Pre-Workout', note: 'wird vor Kraft- und Ausdauerbelastung zur akuten Leistungssteigerung eingesetzt.' },
      { topic: 'Diätprodukte', note: 'wird wegen thermogener Wirkung in Fatburner-Produkten eingeordnet.' },
    ],
    forms: [
      { name: 'Koffein-Anhydrat (Tabletten/Kapseln)', bioavailability: 'orale Bioverfügbarkeit nahezu vollständig', note: 'übliche Portionierung in mg, gut dosierbar.' },
      { name: 'Hochkonzentriertes Koffeinpulver', note: 'identische Menge Pulver = identische Menge Koffein; mit haushaltsüblichen Waagen/Löffeln nicht präzise abmessbar.' },
    ],
    fatSoluble: false,
    cautionNote: 'Laut BfR-Mitteilung 46/2024 gelten 5–10 g reines Koffein bereits als potenziell akut tödliche Dosis für Erwachsene: das entspricht 1–2 Teelöffeln hochkonzentriertem Pulver. Dokumentiert ist ein Todesfall in Deutschland durch versehentliche Einnahme von ca. 9 g Koffeinpulver (Wellershoff, Notarzt 2018;34:85-89). Haushaltsübliche Küchenwaagen messen laut BfR meist erst ab 1 g relativ genau: die unbedenkliche Einzeldosis von 0,2 g lässt sich damit nicht zuverlässig abmessen.',
    sources: [
      { label: 'EFSA: Scientific Opinion on the safety of caffeine (2015), EFSA Journal 13(5):4102', url: 'https://doi.org/10.2903/j.efsa.2015.4102' },
      { label: 'BfR Mitteilung 46/2024: Hochkonzentriertes Koffein-Pulver kann bereits in geringen Mengen schwere Vergiftungen hervorrufen', url: 'https://www.bfr.bund.de/cm/343/hochkonzentriertes-koffein-pulver-kann-bereits-in-geringen-mengen-schwere-vergiftungen-hervorrufen.pdf' },
    ],
  },
  {
    id: 'guarana',
    name: 'Guarana',
    category: 'Stimulanzien',
    synonyms: ['guarana', 'paullinia cupana', 'guaranin', 'guarana-samen', 'guarana-extrakt', 'guarana-pulver'],
    unit: 'mg',
    what: 'Samen einer Kletterpflanze aus dem Amazonasgebiet mit einem Koffeingehalt von bis zu 6 %, deutlich höher als bei Kaffeebohnen. Die stimulierende Wirkung beruht im Wesentlichen auf diesem Koffeingehalt.',
    useCases: [
      { topic: 'Kognitive Leistung', note: 'in einer systematischen Übersichtsarbeit mit akuter kognitiver Leistung in Verbindung gebracht (Hack et al. 2023).' },
      { topic: 'Energy-Drinks/Sportgetränke', note: 'gängige Zutat als Koffeinquelle.' },
      { topic: 'Sport/Pre-Workout', note: 'wird analog zu isoliertem Koffein als Stimulans eingesetzt.' },
    ],
    forms: [
      { name: 'Guarana-Samenpulver', note: 'Koffeingehalt schwankt je nach Charge, oft nicht exakt deklariert.' },
      { name: 'Standardisierter Guarana-Extrakt', note: 'auf definierten Koffeingehalt (%) standardisiert, dadurch besser dosierbar.' },
    ],
    fatSoluble: false,
    cautionNote: 'Die Wirkung beruht überwiegend auf dem enthaltenen Koffein: faktisch gelten dieselben Aufnahmegrenzen wie bei isoliertem Koffein (siehe dortiger Eintrag). Bei nicht standardisierten Produkten ist der tatsächliche Koffeingehalt pro Portion oft unklar deklariert, was die Einordnung der Gesamt-Koffeinaufnahme aus mehreren Quellen (Kaffee, Energy-Drinks) erschwert.',
    sources: [
      { label: 'Schimpl et al. 2013, Phytochemistry: Guarana: revisiting a highly caffeinated plant from the Amazon', url: 'https://pubmed.ncbi.nlm.nih.gov/23981847/' },
      { label: 'Patrick et al. 2019: Safety of Guarana Seed as a Dietary Ingredient: A Review', url: 'https://pubmed.ncbi.nlm.nih.gov/31539257/' },
    ],
  },
  {
    id: 'mct-oil',
    name: 'MCT-Öl (mittelkettige Triglyceride)',
    category: 'Fettsäuren',
    synonyms: ['mct-öl', 'mct oil', 'medium chain triglycerides', 'mittelkettige triglyceride', 'caprylsäure', 'caprinsäure', 'c8', 'c10', 'mct-fett', 'mct-pulver'],
    unit: 'g',
    what: 'Fett aus mittelkettigen Fettsäuren (vor allem Caprylsäure C8 und Caprinsäure C10), meist aus Kokos- oder Palmkernöl gewonnen. Wird ohne Carnitin-Transporter direkt mitochondrial oxidiert und schneller verstoffwechselt als langkettige Fette; ein Teil wird in Ketonkörper umgewandelt.',
    useCases: [
      { topic: 'Ketogene Ernährungsformen', note: 'wird zur Erhöhung der Ketonkörperproduktion eingesetzt.' },
      { topic: 'Ausdauersport', note: 'wird wegen der schnellen Fettoxidation als Energiequelle diskutiert.' },
      { topic: 'Klinische Ernährungsunterstützung', note: 'wurde in einer 12-Wochen-Studie mit 6 g/Tag bei älteren, mangelernährungsgefährdeten Erwachsenen untersucht (Watanabe & Tsujino 2022).' },
    ],
    forms: [
      { name: 'MCT-Öl (flüssig)', note: 'reines Fett, meist Mischung aus C8/C10.' },
      { name: 'MCT-Pulver', aka: ['an Trägerstoff gebundenes MCT'], note: 'bessere Dosierbarkeit/Löslichkeit als flüssiges Öl.' },
    ],
    fatSoluble: true,
    cautionNote: 'In der Fachliteratur wird bei hohen Einzeldosen wiederholt auf gastrointestinale Beschwerden hingewiesen; eine durch EFSA/BfR verifizierte Gramm-Schwelle dafür ist nicht auffindbar, daher hier ohne erfundene Zahl.',
    sources: [
      { label: 'Jadhav & Annapure 2023: Triglycerides of medium-chain fatty acids: a concise review', url: 'https://pubmed.ncbi.nlm.nih.gov/35761969/' },
      { label: 'Watanabe & Tsujino 2022: Applications of Medium-Chain Triglycerides in Foods', url: 'https://pubmed.ncbi.nlm.nih.gov/35719157/' },
    ],
  },
  {
    id: 'l-citrulline',
    name: 'L-Citrullin',
    category: 'Sport',
    synonyms: ['l-citrullin', 'citrullin', 'citrullin-malat', 'citrulline malate', 'l-citrulline', 'cas 372-75-8'],
    unit: 'g',
    what: 'Nicht-essenzielle Aminosäure und Zwischenprodukt des Harnstoffzyklus. Wird in der Niere zu L-Arginin umgewandelt; orale Gabe umgeht den hepatischen First-Pass-Abbau von Arginin und erhöht dadurch den Plasma-Argininspiegel effektiver als die direkte Einnahme von L-Arginin.',
    useCases: [
      { topic: 'Kraft-/Ausdauersport', note: 'Citrullin-Malat wird häufig vor dem Training eingesetzt; 8 g als Einzeldosis ist die in Studien am häufigsten verwendete Menge (Gough et al. 2021).' },
      { topic: 'Vaskuläre Funktion/Durchblutung', note: 'wird über den Arginin-Stickstoffmonoxid-Stoffwechselweg mit gesteigerter Gefäßleitfähigkeit in Verbindung gebracht (Alsop & Hauton 2016).' },
      { topic: 'Erholung nach Belastung', note: 'wird in diesem Zusammenhang untersucht (Gonzalez & Trexler 2020).' },
    ],
    forms: [
      { name: 'L-Citrullin (rein)', bioavailability: 'erhöht Plasma-Citrullin um das ~17-Fache und Plasma-Arginin um das ~3-Fache nach oraler Einnahme (Jirka et al. 2019)', note: 'wirkt als Arginin-Vorstufe wirksamer als direktes L-Arginin.' },
      { name: 'Citrullin-Malat', aka: ['Citrullin gebunden an Apfelsäure, meist 2:1'], note: 'häufigste Sport-Supplement-Form; 8 g Einzeldosis in der Mehrzahl der Studien.' },
    ],
    fatSoluble: false,
    cautionNote: 'Reviews beschreiben milde gastrointestinale Beschwerden als mögliche Begleiterscheinung, aber keine schwerwiegenden Sicherheitssignale (Gonzalez & Trexler 2020). Eine EFSA-geprüfte Höchstmengen-Zahl ist nicht auffindbar.',
    sources: [
      { label: 'Gough et al. 2021: A critical review of citrulline malate supplementation and exercise performance', url: 'https://pubmed.ncbi.nlm.nih.gov/34417881/' },
      { label: 'Gonzalez & Trexler 2020: Effects of Citrulline Supplementation on Exercise Performance in Humans: A Review', url: 'https://pubmed.ncbi.nlm.nih.gov/31977835/' },
    ],
  },
  {
    id: 'cranberry-extract',
    name: 'Cranberry-Extrakt',
    category: 'Harnwege',
    synonyms: ['cranberry', 'cranberry-extrakt', 'moosbeere', 'kronsbeere', 'vaccinium macrocarpon', 'cranberry fruit', 'vaccinii macrocarpi fructus', 'cranberry-saftpulver'],
    unit: 'mg',
    what: 'Presssaft/Extrakt der Frucht von Vaccinium macrocarpon; enthält Proanthocyanidine (PAC), denen eine Hemmung der Anhaftung von E.-coli-Fimbrien an die Blasenschleimhaut zugeschrieben wird.',
    useCases: [
      { topic: 'Linderung leichter, wiederkehrender unterer Harnwegsbeschwerden', note: 'EMA-Traditional-Use-Indikation bei Frauen (Brennen beim Wasserlassen, häufiger Harndrang), nach ärztlichem Ausschluss ernster Ursachen.' },
      { topic: 'Vorbeugung wiederkehrender unkomplizierter Harnwegsinfektionen', note: 'EMA-Traditional-Use-Indikation, ausschließlich auf langjähriger Anwendungstradition basierend, nicht auf klinischen Studien.' },
      { topic: 'Reduktion der Rate symptomatischer wiederkehrender HWI', note: 'NCCIH: kann das Gesamtrisiko um ca. 25 % senken; Ergebnisse bei älteren Menschen und in der Schwangerschaft inkonsistent, keine Wirkung bei bestehender Infektion belegt.' },
    ],
    forms: [
      { name: 'Presssaft aus frischer Frucht', aka: ['Expressed juice'], bioavailability: 'Referenzform der EMA-Monographie', note: '50–60 ml 2–4×/Tag (akute Beschwerdelinderung) bzw. 30 ml 1×/Tag (Vorbeugung).' },
      { name: 'Trockenextrakt (standardisiert)', aka: ['PAC-standardisierter Extrakt'], note: 'in Nahrungsergänzungsmitteln verbreitet, aber außerhalb der offiziellen Monographie-Dosierung.' },
    ],
    fatSoluble: false,
    cautionNote: 'Die EMA-Monographie nennt als Kontraindikation die gleichzeitige Einnahme von Tacrolimus und Warfarin (Cranberry kann die Warfarin-Wirkung verstärken; bei einem nierentransplantierten Patienten wurden gesenkte Tacrolimus-Spiegel dokumentiert). Cranberry-Konzentrat hat einen hohen Oxalatgehalt: bei Nierensteinen in der Vorgeschichte besteht ein erhöhtes Risiko für erneute Steinbildung. EFSA hat 2025 einen Health Claim zur Bakterienabwehr in den Harnwegen mangels konsistenter Kausalitätsbelege abgelehnt (EFSA Journal 2025;23(4):e9319).',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Vaccinium macrocarpon Aiton, fructus', url: 'https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-vaccinium-macrocarpon-aiton-fructus_en.pdf' },
      { label: 'EFSA Journal 2025: abgelehnter Health Claim zu Cranberrypulver (DOI 10.2903/j.efsa.2025.9319)', url: 'https://doi.org/10.2903/j.efsa.2025.9319' },
      { label: 'NCCIH: Cranberry', url: 'https://www.nccih.nih.gov/health/cranberry' },
    ],
  },
  {
    id: 'd-mannose',
    name: 'D-Mannose',
    category: 'Harnwege',
    synonyms: ['d-mannose', 'mannose', 'd-mannose-pulver'],
    unit: 'g',
    what: 'Einfachzucker, strukturell mit Glucose verwandt; wird kaum verstoffwechselt und weitgehend unverändert über den Urin ausgeschieden. Bindet an Typ-1-Fimbrien von E. coli und blockiert dadurch deren Anhaftung an die Blasenschleimhaut.',
    useCases: [
      { topic: 'Vorbeugung wiederkehrender Harnwegsinfektionen', note: 'Systematisches Review 2026 (Int Urogynecol J): vergleichbare Wirksamkeit wie Antibiotika in spezialisierten Settings, jedoch kein Vorteil gegenüber Placebo in breiter hausärztlicher Population: uneinheitliche Evidenz.' },
    ],
    forms: [
      { name: 'Pulver', bioavailability: 'renal ausgeschieden, keine relevante Verstoffwechslung', note: 'in Studien meist 1,5–2 g 1–3×/Tag, kein einheitliches Dosierschema etabliert.' },
      { name: 'Kapseln', bioavailability: 'wie Pulver' },
    ],
    fatSoluble: false,
    cautionNote: 'Keine EMA-Monographie und keine EFSA-Bewertung für D-Mannose als Einzelsubstanz auffindbar. Langzeit-Sicherheitsdaten sind begrenzt; als Einfachzucker potenziell relevant für Personen, die ihre Zuckerzufuhr überwachen, auch wenn D-Mannose kaum in den Glukosestoffwechsel eingeht.',
    sources: [
      { label: 'Int Urogynecol J 2026: Systematic Review nicht-antibiotischer Therapien bei rezidivierenden HWI', url: 'https://pubmed.ncbi.nlm.nih.gov/42133003/' },
    ],
  },
  {
    id: 'pumpkin-seed-extract',
    name: 'Kürbiskernextrakt',
    category: 'Männergesundheit',
    synonyms: ['kürbiskern', 'kürbiskernextrakt', 'kürbiskernöl', 'cucurbita pepo', 'pumpkin seed', 'cucurbitae semen'],
    unit: 'mg',
    what: 'Samen von Cucurbita pepo L.; enthalten Phytosterole, Cucurbitin und ungesättigte Fettsäuren. Traditionell zur Linderung unterer Harnwegsbeschwerden im Zusammenhang mit gutartiger Prostatavergrößerung oder überaktiver Blase eingesetzt.',
    useCases: [
      { topic: 'Linderung unterer Harnwegssymptome bei benigner Prostatahyperplasie oder überaktiver Blase', note: 'EMA-Traditional-Use-Indikation, ausschließlich auf langjähriger Anwendung basierend, ärztlicher Ausschluss ernster Ursachen vorausgesetzt.' },
    ],
    forms: [
      { name: 'Weichextrakt', aka: ['Soft extract DER 15-25:1'], note: 'Einzeldosis 500 mg, 2×/Tag.' },
      { name: 'Trockenextrakt', aka: ['Dry extract DER 15-30:1'], note: 'Einzeldosis 105 mg 3×/Tag oder 152 mg 2×/Tag.' },
      { name: 'Fettes Öl', aka: ['Kürbiskernöl'], note: 'Einzeldosis 1–1,2 g 3×/Tag, Tagesdosis 3–4 g.' },
    ],
    fatSoluble: false,
    cautionNote: 'Laut EMA keine bekannten Wechselwirkungen mit anderen Arzneimitteln. Milde gastrointestinale Beschwerden wurden häufig (ca. 4 %) berichtet. Für Extrakte ist die Sicherheit in Schwangerschaft/Stillzeit nicht belegt; der Verzehr von Kürbiskernen/-öl in Lebensmittelmengen gilt dagegen laut EMA als unbedenklich.',
    sources: [
      { label: 'EMA/HMPC: Community herbal monograph on Cucurbita pepo L., semen', url: 'https://www.ema.europa.eu/en/documents/herbal-monograph/final-community-herbal-monograph-cucurbita-pepo-l-semen_en.pdf' },
    ],
  },
  {
    id: 'grapefruit-seed-extract',
    name: 'Grapefruitkernextrakt',
    category: 'Pflanzenstoffe',
    synonyms: ['gse', 'grapefruitkernextrakt', 'grapefruit seed extract', 'citrus paradisi seed extract', 'grapefruitkern-extrakt'],
    unit: 'mg',
    what: 'Extrakt aus Samen, Fruchtfleisch und weißer Schale der Grapefruit (Citrus paradisi), im Handel als "natürliches antimikrobielles Mittel" beworben. Es existiert keine EMA/HMPC-Monographie für diese Droge: sie ist in der EU nicht als anerkannte pflanzliche Arzneidroge registriert.',
    useCases: [
      { topic: 'Als antimikrobiell beworbener Nahrungsergänzungsstoff', note: 'kein anerkanntes Anwendungsgebiet durch EMA oder EFSA dokumentiert; die beworbene antimikrobielle Aktivität ist wissenschaftlich uneinheitlich belegt, siehe cautionNote.' },
    ],
    forms: [
      { name: 'Flüssigextrakt/Tropfen', note: 'nicht standardisiert, keine EU-weit einheitliche Konzentration oder Dosierungsvorgabe.' },
      { name: 'Kapseln', note: 'ebenfalls ohne Monographie-Referenz.' },
    ],
    fatSoluble: false,
    cautionNote: 'Eine Laboranalyse (von Woedtke et al., Pharmazie 1999) untersuchte sechs Handelsprodukte: In allen fünf antimikrobiell wirksamen Extrakten wurde der synthetische Konservierungsstoff Benzethoniumchlorid nachgewiesen, bei drei zusätzlich Triclosan und Methylparaben: der einzige Extrakt ohne Konservierungsstoff zeigte keine Wirkung. Die vielfach behauptete antimikrobielle Wirkung beruht demnach offenbar auf synthetischen Zusätzen, nicht auf der Pflanzensubstanz selbst. Zusätzlich enthält Grapefruit Furanocumarine, die intestinales CYP3A4 hemmen und dadurch Blutspiegel zahlreicher darüber verstoffwechselter Medikamente erhöhen können (Miedziaszczyk et al. 2022), z. B. Tacrolimus, mit erhöhtem Nephrotoxizitätsrisiko.',
    sources: [
      { label: 'von Woedtke et al., Pharmazie 1999: Antimicrobial efficacy of grapefruit seed extract and its relation to preservative substances', url: 'https://pubmed.ncbi.nlm.nih.gov/10399191/' },
      { label: 'Miedziaszczyk et al., Pharmaceutics 2022: Controversial Interactions of Tacrolimus with Dietary Supplements, Herbs and Food', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9611668/' },
    ],
  },
  {
    id: 'colloidal-silver',
    name: 'Kolloidales Silber',
    category: 'Mineralien',
    synonyms: ['kolloidales silber', 'colloidal silver', 'silberwasser', 'silver hydrosol', 'nanosilber', 'nano-silver', 'silberkolloid', 'ionisches silber'],
    unit: 'ml',
    what: 'Wässrige Suspension feinster Silberpartikel/-ionen, oral als "Silberwasser" eingenommen oder äußerlich angewendet; kein Nährstoff mit physiologischer Funktion im Körper.',
    useCases: [
      { topic: 'Als "natürliches Antibiotikum"/Immunmittel beworben', note: 'innerliche Wirksamkeit gegen Infektionen, Erkältung, Krebs u. a. ist nicht durch seriöse Studien belegt; Labortests dreier Handelsprodukte zeigten laut BARMER keinerlei antibakterielle Wirkung.' },
    ],
    forms: [
      { name: 'Flüssige Suspension', aka: ['Silberwasser', 'Silver Hydrosol'], bioavailability: 'wird systemisch resorbiert, vom Körper nicht effektiv ausgeschieden', note: 'Akkumulation in Haut, Leber, Niere und Nervengewebe möglich.' },
    ],
    fatSoluble: false,
    cautionNote: 'Zentrales Risiko ist die Argyrie: eine irreversible, bläulich-graue Verfärbung von Haut und Schleimhäuten durch Silbereinlagerung, für die laut Fachliteratur keine befriedigende Therapie bekannt ist. Ältere Literatur nennt kumulative Schwellenwerte von ca. 1–1,8 g Gesamt-Silberaufnahme; entscheidend ist die kumulative Dosis, nicht ein Zeitraum. Das BfR rät generell von Nanosilber in Lebensmitteln ab, solange keine ausreichende Datenlage für eine Risikobewertung vorliegt. Silber kann zudem die Aufnahme bestimmter Medikamente hemmen (u. a. Antibiotika, L-Thyroxin). In Deutschland rechtlich als Nahrungsergänzungsmittel frei verkäuflich, jedoch ohne zulässige krankheitsbezogene Werbeaussagen, da die Wirksamkeit nicht belegt ist.',
    sources: [
      { label: 'BfR: Nanosilber in Lebensmitteln und Produkten des täglichen Bedarfs', url: 'https://www.bfr.bund.de/cm/343/bfr_raet_von_nanosilber_in_lebensmitteln_und_produkten_des_taeglichen_bedarfs_ab.pdf' },
      { label: 'BARMER: Kolloidales Silber: Gesundes Silberwasser?', url: 'https://www.barmer.de/gesundheit-verstehen/medizin/medikamente/kolloidales-silber-1481650' },
    ],
  },
  {
    id: 'amygdalin-b17',
    name: 'Amygdalin (fälschlich „Vitamin B17")',
    category: 'Pflanzenstoffe',
    synonyms: ['vitamin b17', 'amygdalin', 'laetrile', 'laetril', 'bittermandelglykosid', 'aprikosenkernextrakt', 'bitter apricot kernel extract', 'nitrilosid'],
    unit: 'mg',
    what: 'Cyanogenes Glykosid, das u. a. in bitteren Aprikosenkernen und Bittermandeln vorkommt. Kein Vitamin: der Name "Vitamin B17" ist eine Marketingbezeichnung ohne biochemische Grundlage.',
    useCases: [
      { topic: 'Als angebliches Krebsheilmittel vermarktet', note: 'wissenschaftlich widerlegt: Deutsche Krebsgesellschaft verweist auf eine kontrollierte Studie mit 178 Patienten ohne Nutzen für Tumorstabilisierung; Vertrieb als Krebsmittel ist in der EU illegale Arzneimittelwerbung.' },
    ],
    forms: [
      { name: 'Bittere Aprikosenkerne (roh)', bioavailability: 'hoch: Amygdalin wird im Darm/Gewebe zu Blausäure (HCN) gespalten', note: '1 g Amygdalin setzt ca. 59 mg Blausäure frei.' },
      { name: 'Kapseln/Extrakt (Laetrile)', note: 'in Deutschland als Fertigarzneimittel nicht im Verkehr.' },
    ],
    fatSoluble: false,
    cautionNote: 'Amygdalin gilt in Deutschland als "bedenkliches Arzneimittel" nach § 5 Arzneimittelgesetz: das BfArM hat diese Einstufung 2014 bekräftigt; danach darf Amygdalin nicht in Verkehr gebracht werden, auch nicht über private Weitergabe. LD50 bei Ratten 405 mg/kg, bei Mäusen 443 mg/kg (oral, reine Substanz). Für einen 60-kg-Erwachsenen gelten ca. 40 Aprikosenkerne innerhalb einer Stunde als potenziell tödlich; der Körper kann ca. 7 Kerne/Stunde noch metabolisch entgiften. Das BfArM dokumentiert seit 1977 22 Vergiftungsfälle weltweit, davon 4 mit Todesfolge. Vitamin C erhöht nachweislich die Toxizität von Amygdalin. Das BfR empfiehlt für rohe bittere Aprikosenkerne als Lebensmittel maximal 2 Kerne pro Tag für Erwachsene; Kinder sollten ganz darauf verzichten (Grenzwert: max. 20 mg Blausäure/kg Rohkerne). Kein Nachweis einer krebshemmenden Wirkung durch randomisiert-kontrollierte Studien.',
    sources: [
      { label: 'BfR: Zwei bittere Aprikosenkerne pro Tag sind für Erwachsene das Limit', url: 'https://www.bfr.bund.de/cm/343/zwei-bittere-aprikosenkerne-pro-tag-sind-fuer-erwachsene-das-limit-kinder-sollten-darauf-verzichten.pdf' },
      { label: 'Deutsche Krebsgesellschaft: Vitamin B17 (Amygdalin) bei Krebs', url: 'https://www.krebsgesellschaft.de/media/positionen/alle-wissenschaftlichen-stellungnahmen/vitamin-b17-amygdalin-2' },
      { label: 'Wikipedia (DE): Amygdalin', url: 'https://de.wikipedia.org/wiki/Amygdalin' },
    ],
  },
  {
    id: 'dhea',
    name: 'DHEA (Dehydroepiandrosteron)',
    category: 'Hormone',
    synonyms: ['dhea', 'dehydroepiandrosteron', 'dehydroepiandrosterone', 'prasteron', 'prasterone', 'dhea-s'],
    unit: 'mg',
    what: 'Körpereigenes Steroidhormon aus der Nebennierenrinde, Vorstufe von Testosteron und Östrogenen; wird außerhalb Deutschlands als "Anti-Aging"-Präparat vermarktet.',
    useCases: [
      { topic: 'Anti-Aging/Hormonoptimierung (Marketingaussage)', note: 'Deutsche Gesellschaft für Endokrinologie sieht keine relevanten Effekte auf Stoffwechselparameter oder Wohlbefinden.' },
      { topic: 'Medizinisch verordnete Hormonsubstitution (Prasteron)', note: 'als zugelassener Arzneistoff z. B. bei postmenopausaler vaginaler Atrophie, ausschließlich ärztlich verordnet.' },
    ],
    forms: [
      { name: 'Kapseln/Tabletten (frei verkäuflich in den USA)', bioavailability: 'oral bioverfügbar, wandelt sich in Sexualhormone um', note: 'in Deutschland/EU nicht als Nahrungsergänzungsmittel verkehrsfähig.' },
    ],
    fatSoluble: false,
    cautionNote: 'In Deutschland ist DHEA nicht legal als Nahrungsergänzungsmittel verkehrsfähig. Die Gemeinsame Expertenkommission von BVL und Ländern hat am 10.02.2025 festgelegt: DHEA-haltige Erzeugnisse werden ab einer Tagesdosis von 10 mg als Arzneimittel eingestuft, und rät zusätzlich generell von isolierten Steroidhormonen in als Lebensmittel vermarkteten Produkten ab. Eine EU-Novel-Food-Zulassung existiert bislang nicht. Das BfR nennt bereits 25 mg/Tag als Schwelle, ab der messbare Hormonveränderungen auftreten können, insbesondere bei postmenopausalen Frauen. Offene Risiken: unklarer Einfluss auf das Wachstum hormonabhängiger Tumoren (Brust, Prostata), mögliche Akne. DHEA steht zudem auf der WADA-Dopingliste. In den USA ist DHEA dagegen frei verkäuflich: der zentrale regulatorische Unterschied zu Deutschland/EU.',
    sources: [
      { label: 'BVL: Einstufung von Dehydroepiandrosteron (Fachmeldung)', url: 'https://www.bvl.bund.de/SharedDocs/Fachmeldungen/01_lebensmittel/2025/2024_02_12_Einstufung_Dehydroepiandrosteron.html' },
      { label: 'Verbraucherzentrale: Anti-Aging-Hormon DHEA', url: 'https://www.verbraucherzentrale.de/faq/antiaginghormon-dhea-33125' },
    ],
  },
  {
    id: 'garcinia-cambogia-hca',
    name: 'Garcinia Cambogia (Hydroxyzitronensäure)',
    category: 'Stoffwechsel',
    synonyms: ['garcinia cambogia', 'garcinia gummi-gutta', 'hca', 'hydroxyzitronensäure', 'hydroxycitric acid', 'malabar-tamarinde', 'brindleberry', 'garcinia-extrakt'],
    unit: 'mg',
    what: 'Extrakt aus der Fruchtschale des Malabar-Tamarindenbaums (Garcinia gummi-gutta); Hauptwirkstoff ist Hydroxyzitronensäure (HCA), vermarktet zur Unterstützung bei Gewichtsreduktion.',
    useCases: [
      { topic: 'Gewichtsmanagement/"Fettblocker" (Marketingaussage)', note: 'kein zugelassener Health Claim für HCA/Garcinia unter EU-Verordnung 1924/2006: entsprechende Werbeaussagen sind nicht zulässig.' },
      { topic: 'Appetitzügelung (Marketingaussage)', note: 'Studienlage uneinheitlich; aktuelle EFSA-Bewertung stellt Sicherheitsbedenken in den Vordergrund, nicht Wirksamkeitsnachweise.' },
    ],
    forms: [
      { name: 'Kapseln/Tabletten mit standardisiertem HCA-Extrakt', aka: ['meist 50–60 % HCA'], bioavailability: 'oral resorbiert, Studienlage zur Bioverfügbarkeit uneinheitlich' },
    ],
    fatSoluble: false,
    cautionNote: 'Ein EFSA/COT-Entwurfsgutachten (30.06.2026, öffentliche Konsultation bis 04.05.2026) kommt zu dem Schluss, dass sich keine sicheren Aufnahmemengen für (–)-HCA bzw. Garcinia-gummi-gutta-Zubereitungen festlegen lassen, wegen unzureichender Datenlage und identifizierter Sicherheitsbedenken: idiosynkratische, arzneimittelähnliche Leberschädigung sowie Hodentoxizität in Tierstudien. Die FDA warnte bereits 2009 vor HCA-haltigen Hydroxycut-Produkten wegen Fällen von Gelbsucht, erhöhten Leberwerten bis hin zu Lebertransplantation und tödlichem Leberversagen. Die französische Behörde ANSES hat Garcinia-gummi-gutta-Zubereitungen verboten und rät zusätzlich ab bei psychiatrischen, kardiometabolischen Erkrankungen, Pankreatitis oder Hepatitis in der Vorgeschichte sowie bei Kindern und Schwangeren/Stillenden.',
    sources: [
      { label: 'EFSA/COT: Draft Scientific Opinion on the safety of hydroxycitric acid and plant preparations containing hydroxycitric acid (2026)', url: 'https://www.gov.uk/government/publications/31st-march-2026-committee-on-toxicity-meeting/draft-scientific-opinion-on-the-safety-of-hydroxycitric-acid-and-plant-preparations-containing-hydroxycitric-acid-for-public-consultation' },
    ],
  },
  {
    id: 'green-coffee-extract',
    name: 'Grüner-Kaffee-Extrakt',
    category: 'Stoffwechsel',
    synonyms: ['grüner kaffee extrakt', 'green coffee bean extract', 'gcbe', 'gca', 'chlorogensäure', 'chlorogenic acid', 'svetol', 'grüne kaffeebohnen-extrakt', 'cga'],
    unit: 'mg',
    what: 'Extrakt aus ungerösteten Kaffeebohnen, standardisiert auf seinen Gehalt an Chlorogensäuren: Polyphenolen, die beim Rösten größtenteils abgebaut werden.',
    useCases: [
      { topic: 'Gewichtsreduktion', note: 'EFSA hat 2011 einen Health Claim zu Gewichtsverlust/Körperfettreduktion mangels ausreichender Evidenz nicht bestätigt.' },
      { topic: 'Blutzucker-Homöostase', note: 'ebenfalls von der EFSA in derselben Stellungnahme geprüfter und nicht bestätigter Claim.' },
      { topic: 'Allgemeine Polyphenol-Zufuhr', note: 'neuere Metaanalysen zu Chlorogensäure/Körpergewicht zeigen uneinheitliche, meist kleine Effekte bei methodisch limitierten Einzelstudien.' },
    ],
    forms: [
      { name: 'Extrakt-Kapsel/Tablette', aka: ['meist standardisiert auf 45–50 % Chlorogensäure'], note: 'Herstellerübliche Dosierung 200–800 mg/Tag; kein etablierter Wirkdosisbereich.' },
    ],
    fatSoluble: false,
    cautionNote: '2014 verhängte die US-Handelsaufsicht FTC eine Strafe von 3,5 Mio. USD gegen den Hersteller Applied Food Sciences: Die zur Bewerbung genutzte Studie (angeblich 10,5 % Körpergewichtsverlust in 22 Wochen) wurde als "so gravierend fehlerhaft, dass sich daraus keine verlässlichen Schlüsse ziehen lassen" eingestuft: der beauftragte Prüfarzt in Indien soll Gewichtsdaten, Studiendauer und Placebo-Zuordnung nachträglich verändert haben. Enthält je nach Extraktionsgrad natürliches Koffein.',
    sources: [
      { label: 'EFSA NDA Panel, Scientific Opinion, EFSA Journal 2011;9(4):2057', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2011.2057' },
      { label: 'FTC, Case 142-3054, Applied Food Sciences, Inc.', url: 'https://www.ftc.gov/legal-library/browse/cases-proceedings/142-3054-applied-food-sciences-inc' },
    ],
  },
  {
    id: 'raspberry-ketone',
    name: 'Himbeerketone',
    category: 'Stoffwechsel',
    synonyms: ['himbeerketone', 'raspberry ketone', 'raspberry ketones', '4-(4-hydroxyphenyl)butan-2-on', 'frambinon', 'rheosmin'],
    unit: 'mg',
    what: 'Aromastoff, der natürlich in geringsten Mengen in Himbeeren vorkommt; in Nahrungsergänzungsmitteln wird praktisch ausschließlich die synthetisch hergestellte Variante eingesetzt.',
    useCases: [
      { topic: 'Gewichtsreduktion/Thermogenese', note: 'ein Health-Claim-Antrag zu Himbeerextrakt (Thermogenese, Sättigung, Gewichtsverlust) wurde von der EFSA mangels ausreichender Evidenz abgelehnt; kontrollierte Humanstudien zu Himbeerketon selbst fehlen weitgehend.' },
      { topic: 'Aromastoff (Lebensmittelindustrie)', note: 'regulatorisch abgesicherter Haupteinsatzzweck ist die Verwendung als Aromastoff, nicht als Nahrungsergänzungsmittel-Wirkstoff.' },
    ],
    forms: [
      { name: 'Extrakt-/Reinsubstanz-Kapsel', aka: ['meist synthetisches Frambinon'], note: 'Herstellerübliche Dosierung 100–200 mg/Tag; keine etablierte Wirkdosis am Menschen.' },
    ],
    fatSoluble: false,
    cautionNote: 'Himbeerketon-Präparate wurden ab ca. 2012 intensiv als "Fettverbrenner" vermarktet, obwohl zu diesem Zeitpunkt keine kontrollierten Humanstudien zur Gewichtsreduktion vorlagen; ein entsprechender Health Claim wurde von der EFSA abgelehnt. Die in Supplements verwendeten Dosen liegen deutlich über dem, was über Früchte realistisch aufgenommen wird: Toxizitätsdaten dazu sind rar.',
    sources: [
      { label: 'NutraIngredients: Weight loss raspberry ketone legal confusion (2015)', url: 'https://www.nutraingredients.com/Article/2015/03/27/Weight-loss-raspberry-ketone-legal-confusion/' },
      { label: 'EU-Register der Health Claims (Verordnung (EG) Nr. 1924/2006)', url: 'https://food.ec.europa.eu/food-safety/labelling-and-nutrition/nutrition-and-health-claims/eu-register-health-claims_en' },
    ],
  },
  {
    id: 'propolis',
    name: 'Propolis',
    category: 'Bienenprodukte',
    synonyms: ['propolis', 'bienenharz', 'kittharz', 'bee propolis', 'propolis-extrakt'],
    unit: 'mg',
    what: 'Harzig-klebriges Gemisch aus Pflanzenharzen, Wachs und Bienensekreten, das Bienen zum Abdichten und Desinfizieren des Stocks nutzen.',
    useCases: [
      { topic: 'Mund-/Rachenraum (Lutschtabletten, Sprays)', note: 'traditioneller Einsatzbereich; einzelne kleine klinische Studien zu Erkältungssymptomen liegen vor, Evidenzlage gilt insgesamt als begrenzt und heterogen.' },
      { topic: 'Äußerliche Hautanwendung', note: 'traditionell bei kleinen Hautirritationen eingesetzt.' },
    ],
    forms: [
      { name: 'Alkoholischer Extrakt (Tinktur)', note: 'ausgeprägter First-Pass-Metabolismus der Flavonoide, humane Bioverfügbarkeitsdaten selten untersucht.' },
      { name: 'Kapsel/Pulver (Trockenextrakt)', note: 'Herstellerübliche Dosierung 200–500 mg/Tag.' },
    ],
    fatSoluble: false,
    cautionNote: 'Propolis zählt zu den häufigsten Kontaktallergenen unter Naturprodukten: In dermatologischen Patch-Test-Kollektiven zeigen 1,2–6,6 % der getesteten Personen eine Sensibilisierung. Da Propolis Pflanzenharze und Pollenbestandteile enthält, sind Personen mit Pollenallergie sowie mit bekannter Allergie gegen Bienenstiche/Bienenprodukte besonders gefährdet (BfR-Stellungnahme Nr. 002/2009).',
    sources: [
      { label: 'BfR, Stellungnahme Nr. 002/2009: Einschätzung von Propolis und Gelée Royale', url: 'https://www.bfr.bund.de/stellungnahme/einschaetzung-von-propolis-und-gelee-royal/' },
      { label: 'de Groot AC: Propolis: a review of properties, applications, chemical composition, contact allergy, and other adverse effects, Dermatitis 2013', url: 'https://pubmed.ncbi.nlm.nih.gov/24201459/' },
    ],
  },
  {
    id: 'royal-jelly',
    name: 'Gelée Royale',
    category: 'Bienenprodukte',
    synonyms: ['gelee royale', 'gelée royale', 'royal jelly', 'königinnenfuttersaft', 'weiselfuttersaft'],
    unit: 'mg',
    what: 'Sekret der Futtersaftdrüsen junger Arbeiterinnen, das ausschließlich der Bienenkönigin als Nahrung dient; im Handel meist frisch (kühlkettenpflichtig) oder gefriergetrocknet.',
    useCases: [
      { topic: 'Allgemeines Vitalstoff-/Anti-Aging-Marketing', note: 'beworben wegen Gehalt an B-Vitaminen, Proteinen und der Fettsäure 10-HDA; laut Verbraucherzentrale gibt es für die beworbenen Effekte keine belastbaren Humanstudien.' },
      { topic: 'Traditionelle Anwendung', note: 'historisch v. a. in traditioneller chinesischer und Volksmedizin verbreitet; wissenschaftliche Absicherung fehlt weitgehend.' },
    ],
    forms: [
      { name: 'Frisches Gelée Royale', note: 'kühlkettenpflichtig, spezifische humane Bioverfügbarkeitsdaten sind rar.' },
      { name: 'Lyophilisiertes Pulver/Kapsel', note: 'Herstellerübliche Dosierung 500–1000 mg/Tag (frisch).' },
    ],
    fatSoluble: false,
    cautionNote: 'Gelée Royale kann bei entsprechender Veranlagung schwere, teils lebensbedrohliche allergische Reaktionen auslösen: Besonders gefährdet sind Personen mit Atopie/Asthma und mit bekannter Allergie gegen Bienenstiche oder andere Bienenprodukte. Die Verbraucherzentrale verweist auf 19 bei der australischen Gesundheitsbehörde gemeldete unerwünschte Ereignisse im Zusammenhang mit Gelée-Royale-Präparaten, darunter drei Todesfälle.',
    sources: [
      { label: 'BfR, Stellungnahme Nr. 002/2009: Einschätzung von Propolis und Gelée Royale', url: 'https://www.bfr.bund.de/stellungnahme/einschaetzung-von-propolis-und-gelee-royal/' },
      { label: 'Verbraucherzentrale: Gelée Royale: königliches Anti-Aging?', url: 'https://www.verbraucherzentrale.de/wissen/lebensmittel/nahrungsergaenzungsmittel/gelee-royale-koenigliches-antiaging-21063' },
      { label: 'Thien FC et al.: Asthma and anaphylaxis induced by royal jelly, Clin Exp Allergy 1996', url: 'https://pubmed.ncbi.nlm.nih.gov/8835130/' },
    ],
  },
  {
    id: 'flaxseed-oil',
    name: 'Leinöl',
    category: 'Fettsäuren',
    synonyms: ['leinöl', 'leinsamenöl', 'flachsöl', 'flaxseed oil', 'flax oil', 'linseed oil', 'linum usitatissimum oil', 'ala-öl'],
    unit: 'g',
    what: 'Öl aus Leinsamen, Hauptbestandteil ist Alpha-Linolensäure (ALA): eine pflanzliche Omega-3-Fettsäure. Im Unterschied zu Fischöl liefert Leinöl kein EPA/DHA direkt; der Körper wandelt ALA nur in begrenztem Umfang um.',
    useCases: [
      { topic: 'Gestationsdiabetes', note: 'NCCIH: begrenzte Evidenz, dass ALA-haltiges Leinöl Nüchternwerte und Insulinresistenz bei Gestationsdiabetes verbessern könnte.' },
      { topic: 'Typ-2-Diabetes', note: 'NCCIH: weitere Forschung nötig, ob Leinsamen-Lignan-Extrakt oder Leinöl die Blutzuckerkontrolle beeinflusst.' },
      { topic: 'Omega-3-Zufuhr allgemein', note: 'EFSA und D-A-CH führen ALA als eigenständigen Referenzwert getrennt von EPA/DHA.' },
    ],
    forms: [
      { name: 'Flüssigöl', aka: ['kaltgepresstes Leinöl'], bioavailability: 'gut resorbierbar, oxidationsempfindlich', note: 'Lichtschutz/Kühllagerung empfohlen.' },
      { name: 'Kapsel', aka: ['Softgel'], bioavailability: 'vergleichbar mit Öl' },
    ],
    fatSoluble: true,
    cautionNote: 'NCCIH nennt theoretische Wechselwirkungen mit gerinnungshemmenden Medikamenten (Antikoagulantien/Thrombozytenaggregationshemmer). Sicherheitsdaten für Schwangerschaft/Stillzeit sind laut NCCIH begrenzt.',
    sources: [
      { label: 'EFSA: Scientific Opinion on Dietary Reference Values for fats (2010)', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2010.1461' },
      { label: 'NCCIH: Flaxseed and Flaxseed Oil', url: 'https://www.nccih.nih.gov/health/flaxseed-and-flaxseed-oil' },
    ],
  },
  {
    id: 'evening-primrose-oil',
    name: 'Nachtkerzenöl',
    category: 'Fettsäuren',
    synonyms: ['nachtkerzenöl', 'nachtkerzensamenöl', 'evening primrose oil', 'epo', 'oenothera biennis oil', 'gamma-linolensäure-öl', 'gla-öl'],
    unit: 'mg',
    what: 'Öl aus den Samen der Nachtkerze, reich an Gamma-Linolensäure (GLA), einer Omega-6-Fettsäure.',
    useCases: [
      { topic: 'Atopische Dermatitis', note: 'NCCIH: oral eingenommenes Nachtkerzenöl zeigte in Studien keinen belegten Nutzen zur Symptomlinderung.' },
      { topic: 'Prämenstruelles Syndrom/Brustschmerzen', note: 'NCCIH: vermutlich nicht wirksamer als Placebo bei Brustschmerzen; Evidenzlage insgesamt unzureichend.' },
      { topic: 'Allgemeine Wirksamkeitsbewertung', note: 'NCCIH-Gesamturteil: keine ausreichende Evidenz für den Nutzen bei irgendeinem Gesundheitszustand.' },
    ],
    forms: [
      { name: 'Kapsel', aka: ['Softgel'], note: 'Standardform in Verbraucherprodukten.' },
    ],
    fatSoluble: true,
    cautionNote: 'NCCIH stuft Nachtkerzenöl für die meisten Erwachsenen oral als wahrscheinlich sicher ein, häufigste Nebenwirkungen sind gastrointestinal (Bauchschmerzen, Übelkeit, Durchfall). Bei widersprüchlicher Studienlage zur Wirkung auf Wehen am Schwangerschaftsende rät NCCIH zur Rücksprache mit medizinischem Fachpersonal vor Einnahme neben anderen Medikamenten. Sicherheit bei Kindern ist nicht ausreichend belegt.',
    sources: [
      { label: 'NCCIH: Evening Primrose Oil', url: 'https://www.nccih.nih.gov/health/evening-primrose-oil' },
    ],
  },
  {
    id: 'grape-seed-extract',
    name: 'Traubenkernextrakt',
    category: 'Antioxidantien',
    synonyms: ['traubenkernextrakt', 'traubenkernöl-extrakt', 'grape seed extract', 'opc', 'oligomere proanthocyanidine', 'procyanidine', 'vitis vinifera seed extract'],
    unit: 'mg',
    what: 'Extrakt aus Traubenkernen, reich an Proanthocyanidinen (OPC): einer Gruppe von Polyphenolen mit antioxidativen Eigenschaften.',
    useCases: [
      { topic: 'Blutcholesterin (LDL, Triglyceride)', note: 'NCCIH zu einer Übersichtsarbeit 2020 (11 Studien, 536 Teilnehmende): positive Effekte auf LDL-Cholesterin und Triglyceride, jedoch nicht auf Gesamtcholesterin oder HDL.' },
      { topic: 'Blutdruck', note: 'NCCIH zu einer Übersichtsarbeit 2022 (19 Studien, 1.080 Teilnehmende): Reduktion des diastolischen Blutdruckwerts, kein Effekt auf den systolischen Wert.' },
    ],
    forms: [
      { name: 'Kapsel/Tablette', aka: ['standardisierter Extrakt, meist auf OPC-Gehalt normiert'], bioavailability: 'unterschiedlich je nach Extraktqualität, keine einheitliche Standardisierung' },
    ],
    fatSoluble: false,
    cautionNote: 'NCCIH stuft Traubenkernextrakt bei oraler/topischer Anwendung als allgemein gut verträglich ein und weist allgemein auf mögliche Wechselwirkungen mit Medikamenten hin, ohne eine konkrete Studie dazu zu benennen. Sicherheit in Schwangerschaft/Stillzeit ist laut NCCIH unklar.',
    sources: [
      { label: 'NCCIH: Grape Seed Extract', url: 'https://www.nccih.nih.gov/health/grape-seed-extract' },
    ],
  },
  {
    id: 'saccharomyces-boulardii',
    name: 'Saccharomyces boulardii',
    category: 'Darm',
    synonyms: ['saccharomyces boulardii', 's. boulardii', 'probiotische hefe', 'saccharomyces cerevisiae hansen cbs 5926'],
    unit: 'mg',
    what: 'Probiotische Hefe (kein Bakterium), taxonomisch ein Stamm von Saccharomyces cerevisiae, der als eigenständige probiotische Spezies vermarktet wird.',
    useCases: [
      { topic: 'Antibiotika-assoziierte Diarrhoe bei Kindern', note: 'Cochrane-Review (Guo et al. 2019, 33 Studien/6.352 Kinder): Probiotika insgesamt senken die Häufigkeit auf 8 % vs. 19 % in der Kontrollgruppe; S. boulardii wird darin als einer der wirksamsten Stämme bei höherer Dosierung (≥5 Mrd. KBE/Tag) benannt.' },
      { topic: 'Reisediarrhoe/akute infektiöse Diarrhoe', note: 'in der Fachliteratur wiederholt untersuchter Anwendungsbereich, separat von der Cochrane-AAD-Analyse.' },
    ],
    forms: [
      { name: 'Kapsel/Sachet (lyophilisierte Hefe)', bioavailability: 'wirkt lokal im Darm, keine systemische Resorption als Hefe', note: 'muss lebende Zellzahl (KBE) enthalten, um wirksam zu sein.' },
    ],
    fatSoluble: false,
    cautionNote: 'Dokumentierte, seltene, aber ernstzunehmende Fungämie-Fälle sind in der Literatur beschrieben (Enache-Angoulvant & Hennequin 2005: 92 analysierte Fälle invasiver Saccharomyces-Infektion, S.-boulardii-Anteil 51,3 %; Rannikko et al. 2021, Finnland: 46 Fungämie-Fälle über 10 Jahre, 43 % der Betroffenen hatten das Probiotikum erhalten vs. 5 % in der Kontrollgruppe, 28-Tage-Mortalität 37 %). Risikofaktoren sind liegende zentralvenöse Katheter und schwere Immunsuppression: Kontamination beim Öffnen der Kapseln kann auf Katheter übertragen werden.',
    sources: [
      { label: 'Cochrane Database of Systematic Reviews: Guo et al. 2019, Probiotics for prevention of pediatric antibiotic-associated diarrhea', url: 'https://www.cochrane.org/evidence/CD004827_probiotics-prevention-antibiotic-associated-diarrhea-children' },
      { label: 'Enache-Angoulvant & Hennequin, Clin Infect Dis 2005', url: 'https://pubmed.ncbi.nlm.nih.gov/16267727/' },
      { label: 'CDC Emerging Infectious Diseases: Rannikko et al. 2021, Fungemia Associated with Use of S. boulardii Probiotic Supplements', url: 'https://wwwnc.cdc.gov/eid/article/27/8/21-0018_article' },
    ],
  },
  {
    id: 'bcaa',
    name: 'BCAA (Verzweigtkettige Aminosäuren)',
    category: 'Aminosäuren',
    synonyms: ['bcaa', 'branched-chain amino acids', 'verzweigtkettige aminosäuren', 'leucin', 'isoleucin', 'valin', 'leucine', 'isoleucine', 'valine', 'l-leucin', 'l-isoleucin', 'l-valin'],
    unit: 'g',
    what: 'Sammelbegriff für die drei essenziellen Aminosäuren Leucin, Isoleucin und Valin mit verzweigter Seitenkette; werden anders als die meisten Aminosäuren primär im Muskel statt in der Leber verstoffwechselt.',
    useCases: [
      { topic: 'Muskelproteinsynthese/Muskelmasse', note: 'Leucin gilt als zentraler Trigger der Muskelproteinsynthese. EFSA hat 2010 den Zusammenhang mit Erhalt/Wachstum der Muskelmasse geprüft und keine hinreichend belegte Kausalität festgestellt: kein zugelassener Health Claim (EFSA Journal 2010;8(10):1790).' },
      { topic: 'Erholung nach Belastung', note: 'wird im Ausdauer-/Kraftsport zur Reduktion von Muskelkater eingesetzt; von EFSA in derselben Opinion geprüft, ebenfalls nicht bestätigt.' },
      { topic: 'Muskelkraft in großer Höhe', note: 'in einzelnen Studien zu Höhentraining untersucht; EFSA sah auch hier keinen belegten Zusammenhang.' },
    ],
    forms: [
      { name: 'Freie Aminosäuren (Pulver/Kapseln)', aka: ['L-Leucin, L-Isoleucin, L-Valin'], bioavailability: 'hohe orale Bioverfügbarkeit über neutrale Aminosäuretransporter im Dünndarm', note: 'übliches Verhältnis 2:1:1 (Leucin:Isoleucin:Valin) ist Markt-/Forschungskonvention, keine behördliche Vorgabe: Produkte reichen von 2:1:1 bis 8:1:1 oder 10:1:1.' },
    ],
    fatSoluble: false,
    cautionNote: 'Kontraindiziert bei Ahornsirupkrankheit (angeborener Defekt im BCAA-Abbau). Bei ALS wird hochdosierte BCAA-Gabe in der Literatur kontrovers diskutiert (eine ältere Studie zeigte erhöhte Mortalität unter Hochdosis). Bei fortgeschrittener Leber-/Nierenerkrankung nur ärztlich begleitet.',
    sources: [
      { label: 'EFSA Journal 2010;8(10):1790', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2010.1790' },
    ],
  },
  {
    id: 'l-glutamine',
    name: 'L-Glutamin',
    category: 'Aminosäuren',
    synonyms: ['glutamin', 'l-glutamin', 'glutamine', 'l-glutamine', 'gln'],
    unit: 'g',
    what: 'Bedingt essenzielle Aminosäure, wichtigster Energieträger für Darmzellen (Enterozyten) und Immunzellen; wird bei hoher Stoffwechsel-Belastung (z. B. Krankheit, Verbrennungen) im Körper knapp.',
    useCases: [
      { topic: 'Darmschleimhaut/intestinale Permeabilität', note: 'EFSA hat 2009 den Zusammenhang zwischen Glutamin und Erhalt der Darmschleimhaut-Integrität geprüft und keine hinreichend belegte Kausalität festgestellt: kein zugelassener Health Claim (EFSA Journal 2009;7(9):1235).' },
      { topic: 'Immunfunktion', note: 'dieselbe EFSA-Opinion prüfte auch normale Immunfunktion; ebenfalls nicht bestätigt.' },
      { topic: 'Regeneration im Sport', note: 'wird zur Erholung nach intensivem Training eingesetzt; Humanstudien außerhalb klinischer Kontexte (Verbrennungen, Intensivmedizin) sind begrenzt und uneinheitlich.' },
    ],
    forms: [
      { name: 'Freies L-Glutamin (Pulver/Kapseln)', bioavailability: 'gut wasserlöslich; ein erheblicher Teil wird bereits in der Darmmukosa verstoffwechselt, bevor er in den Blutkreislauf gelangt', note: 'in der Klinik (z. B. Verbrennungsmedizin) werden andere, deutlich höhere Dosierungen verwendet als im Supplement-Kontext: nicht vergleichbar.' },
    ],
    fatSoluble: false,
    cautionNote: 'Kein EFSA/NIH-Primärbeleg für einen konkreten Grenzwert auffindbar. In Sekundärquellen wird Vorsicht bei Leber-/Niereninsuffizienz genannt, allerdings ohne belastbare Primärquelle mit Zahlenwert, deshalb hier nur als Hinweis, nicht als geprüfter Fakt vermerkt.',
    sources: [
      { label: 'EFSA Journal 2009;7(9):1235', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2009.1235' },
    ],
  },
  {
    id: 'green-lipped-mussel-extract',
    name: 'Grünlippmuschel-Extrakt',
    category: 'Gelenke',
    synonyms: ['grünlippmuschel', 'grünlippmuschel-extrakt', 'gruenlippmuschel', 'perna canaliculus', 'green-lipped mussel', 'neuseeländische grünlippmuschel'],
    unit: 'mg',
    what: 'Extrakt aus der neuseeländischen Grünlippmuschel (Perna canaliculus), enthält u. a. Omega-3-Fettsäuren (inkl. der seltenen ETA) sowie Glykosaminoglykane.',
    useCases: [
      { topic: 'Gelenkbeschwerden/rheumatoide Arthritis', note: 'wird bei Gelenkbeschwerden eingesetzt. NCCIH stuft die Studienlage am Menschen als sehr gering ein und sieht keine belastbaren Schlussfolgerungen zur Wirkung als möglich an.' },
      { topic: 'Entzündungsgeschehen', note: 'Labor-/Tierdaten zu entzündungsmodulierenden Lipidbestandteilen liegen vor, klinische Humandaten sind begrenzt.' },
    ],
    forms: [
      { name: 'Extraktpulver/Öl-Extrakt (Kapseln)', note: 'Extraktionsverfahren (Gefriertrocknung vs. Lipidextraktion) unterscheiden sich stark zwischen Produkten und beeinflussen den Wirkstoffgehalt.' },
    ],
    fatSoluble: false,
    cautionNote: 'Kontraindiziert bei bekannter Muschel-/Schalentierallergie (Kreuzreaktionsrisiko). Kein EFSA-Referenzwert vorhanden. EU-Novel-Food-Status des Extrakts war über die verfügbaren Quellen nicht abschließend zu verifizieren.',
    sources: [
      { label: 'NCCIH: Rheumatoid Arthritis In Depth', url: 'https://www.nccih.nih.gov/health/rheumatoid-arthritis-in-depth' },
    ],
  },
  {
    id: 'phosphatidylserine',
    name: 'Phosphatidylserin',
    category: 'Nootropika',
    synonyms: ['phosphatidylserin', 'ps', 'phosphatidylserine', 'soja-phosphatidylserin', 'soy-derived phosphatidylserine'],
    unit: 'mg',
    what: 'Phospholipid und natürlicher Baustein von Zellmembranen, besonders konzentriert in Nervenzellmembranen des Gehirns.',
    useCases: [
      { topic: 'Gedächtnis/kognitive Funktion im Alter', note: 'EFSA hat 2010 den Zusammenhang geprüft und keine hinreichend belegte Ursache-Wirkungs-Beziehung festgestellt: u. a. weil aus Rind bzw. Soja gewonnenes Phosphatidylserin als chemisch unterschiedliche Substanzen bewertet wurden. Kein zugelassener Health Claim, keine damit verbundene offizielle Tagesdosis (EFSA Journal 2010;8(10):1749).' },
      { topic: 'Stressreaktion', note: 'in derselben EFSA-Opinion mitgeprüft, ebenfalls nicht bestätigt.' },
    ],
    forms: [
      { name: 'Soja-basiertes Phosphatidylserin', aka: ['Soy-derived PS'], bioavailability: 'orale Resorption über intestinale Phospholipid-Verdauung; in Studien meist 100–300 mg/Tag auf mehrere Einnahmen verteilt', note: 'heute Marktstandard, da Rinderhirn-Extrakt wegen BSE-Risiko kaum mehr verwendet wird.' },
    ],
    fatSoluble: true,
    cautionNote: 'Keine EFSA-anerkannte Wechselwirkung dokumentiert. In Sekundärquellen wird eine theoretische Wechselwirkung mit gerinnungshemmenden Medikamenten diskutiert, allerdings ohne bezifferte Primärquelle, deshalb hier nur als Hinweis, nicht als geprüfter Fakt vermerkt. Die verbreitete Angabe "300 mg/Tag" stammt aus einzelnen Studiendesigns, nicht aus einer behördlichen Zulassung.',
    sources: [
      { label: 'EFSA Journal 2010;8(10):1749', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2010.1749' },
    ],
  },
  {
    id: 'valerian',
    name: 'Baldrian',
    category: 'Schlaf',
    synonyms: ['baldrian', 'valerian', 'valeriana officinalis', 'baldrianwurzel', 'echter baldrian', 'valerianae radix'],
    unit: 'mg',
    what: 'Heilpflanze, deren getrocknete Wurzel (Valerianae radix) traditionell und als zugelassenes pflanzliches Arzneimittel bei Unruhe und Schlafstörungen eingesetzt wird.',
    useCases: [
      { topic: 'Nervöse Anspannung', note: 'EMA-Indikation (Well-established Use): Linderung leichter nervöser Anspannung.' },
      { topic: 'Schlafstörungen', note: 'EMA-Indikation: Linderung von Schlafstörungen bzw. traditionell zum Erleichtern des Einschlafens.' },
      { topic: 'Traditionelle Anwendung', note: 'Traditionelles pflanzliches Arzneimittel bei leichten Symptomen psychischer Belastung, ausschließlich auf Basis langjähriger Anwendung.' },
    ],
    forms: [
      { name: 'Trockenextrakt', aka: ['DER 3-7,4:1, Ethanol 40–70 % V/V'], note: 'Well-established Use. EMA-Dosierung: Einzeldosis 400–600 mg, bis zu 3×/Tag; max. 4 Einzeldosen/Tag. Wirkeintritt erst nach 2–4 Wochen kontinuierlicher Einnahme.' },
      { name: 'Geschnittene Droge/Pulver/Tee', note: 'Traditional Use, z. B. Tee: 0,3–3 g Droge auf 150 ml.' },
    ],
    fatSoluble: false,
    cautionNote: 'Nicht bei Kindern unter 12 Jahren (Well-established Use) bzw. keine ausreichenden Daten für unter 12-Jährige (Traditional Use). Sicherheit in Schwangerschaft/Stillzeit nicht belegt. Kann die Fahrtüchtigkeit beeinträchtigen. Laut EMA-Monographie sind keine Wechselwirkungen mit anderen Arzneimitteln bekannt. Bei Dosen um 20 g wurden Symptome wie Müdigkeit, Bauchkrämpfe und Engegefühl in der Brust beobachtet.',
    sources: [
      { label: 'EMA/HMPC: Final European Union herbal monograph on Valeriana officinalis L., radix', url: 'https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-valeriana-officinalis-l-radix_en.pdf' },
      { label: 'NCCIH: Valerian', url: 'https://www.nccih.nih.gov/health/valerian' },
    ],
  },
  {
    id: 'st-johns-wort',
    name: 'Johanniskraut',
    category: 'Nervensystem',
    synonyms: ['johanniskraut', 'st johns wort', "st. john's wort", 'hypericum perforatum', 'hyperici herba', 'hypericum', 'echtes johanniskraut'],
    unit: 'mg',
    what: 'Heilpflanze, deren Kraut (Hyperici herba) in der EU als zulassungspflichtiges Arzneimittel geführt wird: je nach Hyperforin-/Hypericin-Dosis entweder als vollwertiges Arzneimittel (u. a. bei leichten bis mittelschweren depressiven Episoden) oder als registriertes traditionelles pflanzliches Arzneimittel. Eine legale Einstufung als Nahrungsergänzungsmittel existiert in Deutschland für wirksame Dosen nicht.',
    useCases: [
      { topic: 'Psychische Verfassung', note: 'Arzneimittel zur Behandlung leichter bis mittelschwerer depressiver Episoden bzw. zur Kurzzeitbehandlung von Symptomen bei leichten depressiven Störungen.' },
      { topic: 'Vorübergehende geistige Erschöpfung', note: 'Traditionelles Arzneimittel zur Linderung vorübergehender geistiger Erschöpfung: ausschließlich auf Basis langjähriger Anwendung.' },
      { topic: 'Haut/leichte Wunden', note: 'traditionell zur unterstützenden Behandlung kleinerer Hautentzündungen und zur Wundheilung, äußerliche Anwendung.' },
    ],
    forms: [
      { name: 'Trockenextrakt (Well-established Use)', aka: ['DER 3-7:1 bis 2,5-8:1, verschiedene Ethanol-/Methanolkonzentrationen'], note: 'Einzeldosis 300–900 mg je nach Zubereitung, Tagesdosis 500–1800 mg. Behandlungsdauer meist mind. 6 Wochen, Wirkeintritt binnen 4 Wochen erwartet.' },
      { name: 'Traditionelle Zubereitungen (niedriger dosiert)', note: 'z. B. Trockenextrakt 60–180 mg 2–3×/Tag; regulatorisch entscheidend ist nicht die mg-Zahl allein, sondern der resultierende Hyperforin-Gehalt (siehe cautionNote).' },
    ],
    fatSoluble: false,
    cautionNote: 'Johanniskraut-Zubereitungen sind in Deutschland und der EU als Arzneimittel reguliert, nicht als Nahrungsergänzungsmittel, unabhängig davon, ob Well-established Use oder Traditional Use vorliegt. Nach deutscher Arzneimittelverschreibungsverordnung ist Johanniskraut verschreibungspflichtig speziell zur Behandlung mittelschwerer Depressionen, bei anderer Indikation apothekenpflichtig, aber weiterhin Arzneimittel. Die entscheidende pharmakologische Schwelle liegt beim Hyperforin-Gehalt: Bei einer Tagesdosis Hyperforin ≤ 1 mg und Anwendungsdauer ≤ 2 Wochen werden laut EMA/HMPC-Monographie keine klinisch relevanten Interaktionen berichtet; bei einer Tagesdosis über 1 mg induzieren Johanniskraut-Zubereitungen nachweislich CYP3A4, CYP2B6, CYP2C9, CYP2C19 und P-Glykoprotein. Die gleichzeitige Einnahme mit Cumarin-Antikoagulanzien, Ciclosporin, Tacrolimus, Sirolimus, Everolimus, Proteaseinhibitoren und bestimmten Zytostatika (u. a. Irinotecan, Imatinib) ist laut Monographie kontraindiziert. Explizit benannt: Die Reduktion der Plasmakonzentration hormoneller Kontrazeptiva kann zu vermehrten Zwischenblutungen und verminderter Verhütungssicherheit führen. In Kombination mit Serotonin-Wiederaufnahmehemmern wurde in sehr seltenen Fällen ein Serotonin-Syndrom beobachtet. Während der Anwendung soll intensive UV-Exposition vermieden werden (Photosensibilisierung).',
    sources: [
      { label: 'EMA/HMPC: Final European Union herbal monograph on Hypericum perforatum L., herba, Revision 1', url: 'https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-hypericum-perforatum-l-herba-revision-1_en.pdf' },
      { label: 'Gesetze im Internet: AMVV Anlage 1 (Verschreibungspflicht Johanniskraut bei mittelschwerer Depression)', url: 'https://www.gesetze-im-internet.de/amvv/anlage_1.html' },
      { label: "NCCIH: St. John's Wort and Depression", url: 'https://www.nccih.nih.gov/health/st-johns-wort-and-depression-in-depth' },
    ],
  },
  {
    id: 'passionflower',
    name: 'Passionsblume',
    category: 'Schlaf',
    synonyms: ['passionsblume', 'passiflora', 'passiflora incarnata', 'passionflower', 'passionsblumenkraut', 'passiflorae herba'],
    unit: 'mg',
    what: 'Kletterpflanze, deren Kraut (Passiflorae herba) als traditionelles pflanzliches Arzneimittel bei leichter mentaler Belastung und zum Aufbau des Schlafs eingesetzt wird. Es existiert nur eine Traditional-Use-, keine Well-established-Use-Monographie.',
    useCases: [
      { topic: 'Mentale Belastung', note: 'Traditionelles Arzneimittel zur Linderung leichter Symptome psychischer Belastung.' },
      { topic: 'Einschlafen', note: 'traditionell zur Unterstützung des Einschlafens, ausschließlich auf Basis langjähriger Anwendung.' },
    ],
    forms: [
      { name: 'Geschnittenes/pulverisiertes Kraut, Tee', note: 'Tee: 1–2 g Droge/150 ml, 1–4×/Tag; Pulver 0,5–2 g, 1–4×/Tag.' },
      { name: 'Flüssigextrakte', note: 'Dosierungen je nach Extraktkonzentration sehr unterschiedlich, z. B. 2–4 ml bis zu 4×/Tag.' },
    ],
    fatSoluble: false,
    cautionNote: 'Anwendung bei Kindern unter 12 Jahren mangels Daten nicht empfohlen. Sicherheit in Schwangerschaft/Stillzeit nicht belegt. Bei Verschlechterung der Symptome oder wenn sie länger als 2 Wochen anhalten, soll ärztlicher Rat eingeholt werden. Laut EMA-Monographie sind keine Wechselwirkungen mit anderen Arzneimitteln bekannt.',
    sources: [
      { label: 'EMA/HMPC: Community herbal monograph on Passiflora incarnata L., herba', url: 'https://www.ema.europa.eu/en/documents/herbal-monograph/final-community-herbal-monograph-passiflora-incarnata-l-herba_en.pdf' },
    ],
  },
  {
    id: 'echinacea',
    name: 'Echinacea (Sonnenhut)',
    category: 'Immunsystem',
    synonyms: ['echinacea', 'sonnenhut', 'purpur-sonnenhut', 'echinacea purpurea', 'echinacea angustifolia', 'roter sonnenhut', 'coneflower'],
    unit: 'ml',
    what: 'Purpur-Sonnenhut, dessen Presssaft aus dem frischen Kraut (Echinacea purpurea) als Arzneimittel zur kurzzeitigen Vorbeugung und Behandlung von Erkältungen genutzt wird.',
    useCases: [
      { topic: 'Erkältung', note: 'Arzneimittel zur kurzzeitigen Vorbeugung und Behandlung der Erkältung (EMA Well-established Use für Presssaft aus frischem Kraut).' },
      { topic: 'Kleine oberflächliche Wunden', note: 'traditionelles Arzneimittel zur Behandlung kleiner oberflächlicher Wunden, äußerliche Anwendung.' },
    ],
    forms: [
      { name: 'Presssaft aus frischem Kraut', note: 'Einzeldosis 1,5–4,5 ml, Tagesdosis 6–9 ml. Nicht länger als 10 Tage anwenden; Therapiebeginn bei ersten Erkältungszeichen.' },
      { name: 'Presssaft/Trockenpresssaft, äußerlich', note: '10–20 g/100 g Presssaft als Salbe, 2–3×/Tag auf betroffene Stelle; max. 1 Woche.' },
    ],
    fatSoluble: false,
    cautionNote: 'Kontraindiziert bei Überempfindlichkeit gegen Korbblütler (Asteraceae/Compositae). Nicht empfohlen bei fortschreitenden Systemerkrankungen, Autoimmunerkrankungen, Immundefizienz, Immunsuppression und Erkrankungen des weißen Blutbilds. Risiko schwerer Überempfindlichkeitsreaktionen bei atopischen Personen. Laut EMA-Monographie keine Wechselwirkungen mit anderen Arzneimitteln bekannt; NCCIH weist ergänzend auf theoretische, nicht abschließend geklärte Wechselwirkungsbedenken bei Immunsuppressiva hin. Bezieht sich ausschließlich auf Echinacea purpurea, herba recens (Frischpflanzenpresssaft): für Echinacea angustifolia (Wurzel) liegt keine vergleichbare EMA-Monographie mit Dosierungsangaben vor.',
    sources: [
      { label: 'EMA/HMPC: Final European Union herbal monograph on Echinacea purpurea (L.) Moench, herba recens', url: 'https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-echinacea-purpurea-l-moench-herba-recens_en.pdf' },
      { label: 'NCCIH: Echinacea', url: 'https://www.nccih.nih.gov/health/echinacea' },
    ],
  },
  {
    id: 'reishi',
    name: 'Reishi (Ganoderma lucidum)',
    category: 'Pilze',
    synonyms: ['reishi', 'ganoderma lucidum', 'ganoderma lingzhi', 'lingzhi', 'ling zhi', 'lackporling', 'glänzender lackporling', 'reishi mushroom', 'reishi-pilz'],
    unit: 'mg',
    what: 'Baumpilz mit glänzender, lackartiger Oberfläche, in Ostasien traditionell genutzt; verkauft als Fruchtkörper- oder Myzelpulver/-extrakt.',
    useCases: [
      { topic: 'Immunmodulation', note: 'kleine klinische Studien und Tiermodelle zeigen Effekte auf Immunzellen; belastbare Humandaten zu klinischen Endpunkten fehlen.' },
      { topic: 'Symptome der unteren Harnwege beim Mann', note: 'kleine Humanstudien berichten Verbesserungen: Evidenz gilt als begrenzt.' },
      { topic: 'Blutzucker/Cholesterin bei Typ-2-Diabetes', note: 'keine Unterstützung für einen Effekt auf kardiovaskuläre Risikofaktoren in kontrollierten Studien gefunden.' },
      { topic: 'Antitumorale/chemoprotektive Effekte', note: 'ausschließlich Zellkultur- und Tiermodelle: nicht auf den Menschen übertragen.' },
    ],
    forms: [
      { name: 'Fruchtkörper-Extrakt/-Pulver', note: 'gilt EU-weit als nicht neuartig (Verzehrsgeschichte vor 1997 belegt).' },
      { name: 'Myzel-Pulver/-Extrakt', note: 'laut AESAN-Konsultationsdokument (2019) als Novel Food eingestuft: keine Verzehrsgeschichte vor 15.5.1997 nachweisbar und keine belegte Äquivalenz zum Fruchtkörper.' },
    ],
    fatSoluble: false,
    cautionNote: 'Fallberichte akuter Leberschädigung sind dokumentiert, u. a. ein 2023 publizierter Fall mit starkem ALT/AST-Anstieg nach mehrtägiger Einnahme in Kombination mit Alkohol (vermuteter Mechanismus: CYP2E1-Hemmung verlangsamt Ethanolabbau). Weitere berichtete Effekte: Übelkeit, Schlaflosigkeit, Mundtrockenheit, erhöhtes Blutungsrisiko in Kombination mit Antikoagulanzien/Thrombozytenaggregationshemmern, mögliche Verstärkung von Immunsuppressiva-Wirkung. Reishi-Sporenpulver kann den Tumormarker CA72-4 erhöhen (labordiagnostisch relevant, kein Krankheitszeichen).',
    sources: [
      { label: 'MSKCC About Herbs: Reishi Mushroom', url: 'https://www.mskcc.org/cancer-care/integrative-medicine/herbs/reishi-mushroom' },
      { label: 'EU Novel Food Consultation Status (AESAN, 2019): Ganoderma lucidum Myzelpulver', url: 'https://food.ec.europa.eu/system/files/2019-10/novel-food_consult-status_ganoderma-lucidum_aesan.pdf' },
      { label: 'PMC: Case Report akute Leberschädigung (Reishi + Alkohol)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10599861/' },
    ],
  },
  {
    id: 'chaga',
    name: 'Chaga (Inonotus obliquus)',
    category: 'Pilze',
    synonyms: ['chaga', 'inonotus obliquus', 'schiefer schillerporling', 'tschaga', 'chaga mushroom', 'chaga-pilz'],
    unit: 'mg',
    what: 'Parasitischer Baumpilz, wächst v. a. auf Birken in kalten Klimazonen; traditionell als Tee/Sud genutzt, heute auch als Pulver/Extrakt.',
    useCases: [
      { topic: 'Immunmodulation', note: 'nur Zellkultur-/Tiermodelle; Sicherheit und Wirksamkeit beim Menschen sind bislang nicht in klinischen Studien geprüft.' },
      { topic: 'Antioxidative Wirkung', note: 'Laborstudien (Zellkultur) zeigen radikalfangende Effekte: keine Humanstudien.' },
      { topic: 'Entzündungshemmung/Hepatoprotektion', note: 'ausschließlich präklinisch (Tiermodelle).' },
    ],
    forms: [
      { name: 'Getrocknetes Pulver/Sud (traditionell)', note: 'traditionelle Teezubereitung mit langer Verzehrsgeschichte in Nordeuropa/Russland.' },
      { name: 'Konzentrierter Extrakt (Wasser/Alkohol)', note: 'höherer Wirkstoff- und vermutlich auch Oxalatgehalt als traditioneller Tee: genau hierzu liegen die Vergiftungsfälle vor.' },
    ],
    fatSoluble: false,
    cautionNote: 'Mehrere publizierte Fälle akuter Oxalat-Nephropathie nach Chaga-Konsum sind dokumentiert, u. a. ein 2022 publizierter Fall (10–15 g Pulver/Tag über 3 Monate plus 500 mg Vitamin C täglich) mit akutem Nierenversagen und Calciumoxalat-Kristallen in der Nierenbiopsie. Zusätzlich erhöhtes Blutungsrisiko mit Antikoagulanzien/Thrombozytenaggregationshemmern und additive blutzuckersenkende Effekte mit Antidiabetika. Der EU-Novel-Food-Status je Extraktform war über die verfügbaren Quellen nicht abschließend zu verifizieren.',
    sources: [
      { label: 'MSKCC About Herbs: Chaga Mushroom', url: 'https://www.mskcc.org/cancer-care/integrative-medicine/herbs/chaga-mushroom' },
      { label: 'PMC: Case Report Chaga-induzierte Oxalat-Nephropathie (2022)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8913114/' },
    ],
  },
  {
    id: 'cordyceps',
    name: 'Cordyceps',
    category: 'Pilze',
    synonyms: ['cordyceps', 'cordyceps sinensis', 'ophiocordyceps sinensis', 'cordyceps militaris', 'raupenpilz', 'chinesischer raupenpilz'],
    unit: 'mg',
    what: 'Sammelbegriff für zwei unterschiedliche Pilzarten: Cordyceps sinensis (wildwachsend, parasitiert Schmetterlingsraupen, selten/geschützt) und Cordyceps militaris (kultivierbar auf Getreidesubstrat, deutlich häufiger die tatsächliche Quelle kommerzieller Präparate).',
    useCases: [
      { topic: 'Nierenfunktion nach Transplantation', note: 'begrenzte klinische Evidenz für unterstützende Effekte.' },
      { topic: 'Sportliche Leistungsfähigkeit/Ausdauer', note: 'uneinheitliche Ergebnisse in Humanstudien an Gesunden: kein konsistenter Nachweis.' },
      { topic: 'Adjuvante Krebsbehandlung', note: 'mehrere Analysen kommen zum Schluss, dass die Evidenz für einen Nutzen unzureichend ist.' },
    ],
    forms: [
      { name: 'Wildgesammelter Pilz-Raupen-Komplex (C. sinensis)', note: 'traditionelle Form, selten, teuer, unterliegt teils Artenschutz-/Exportregulierung in den Herkunftsländern.' },
      { name: 'Fermentiertes Myzel/Kulturextrakt (meist C. militaris)', note: 'häufigste kommerzielle Form; Cordycepin-Gehalt je nach Kulturbedingung sehr unterschiedlich, kaum standardisiert.' },
    ],
    fatSoluble: false,
    cautionNote: 'Ein Fall verstärkter Blutung nach Zahnextraktion ist dokumentiert, dazu theoretisch erhöhtes Blutungsrisiko durch Hemmung der Thrombozytenaggregation (relevant in Kombination mit Antikoagulanzien) und additive Effekte mit Antidiabetika/Insulin. Die EU-Novel-Food-Einstufung konzentrierter Extrakte ist uneinheitlich recherchiert und über die verfügbaren Primärquellen nicht abschließend zu verifizieren.',
    sources: [
      { label: 'MSKCC About Herbs: Cordyceps', url: 'https://www.mskcc.org/cancer-care/integrative-medicine/herbs/cordyceps' },
    ],
  },
  {
    id: 'maitake',
    name: 'Maitake (Grifola frondosa)',
    category: 'Pilze',
    synonyms: ['maitake', 'grifola frondosa', 'klapperschwamm', 'maitake mushroom'],
    unit: 'mg',
    what: 'Speise- und Vitalpilz aus Ostasien, wächst büschelartig an Baumstämmen; medizinisch v. a. wegen beta-glucan-reicher Extraktfraktionen ("D-Fraktion"/"MD-Fraktion") untersucht.',
    useCases: [
      { topic: 'Immunmodulation bei Krebspatientinnen', note: 'kleine Phase-I/II-Studien bei Brustkrebs zeigen immunmodulatorische Effekte: keine großen kontrollierten Studien.' },
      { topic: 'Reduktion chemotherapiebedingter Nebenwirkungen', note: 'berichtet bei einzelnen Krebsarten in kleinen Studien.' },
      { topic: 'Blutzucker/Cholesterin/Blutdruck', note: 'umfangreiche Tier-/Zellkulturdaten; Humanevidenz deutlich schwächer und limitiert.' },
    ],
    forms: [
      { name: 'Fruchtkörper-Extrakt/-Pulver', note: 'gilt EU-weit als nicht neuartig (Verzehrsgeschichte vor 1997 als Speisepilz belegt).' },
      { name: 'Myzel-Pulver/-Extrakt', note: 'laut AESAN-Konsultationsdokument (2019) als Novel Food eingestuft: keine belegte Verzehrsgeschichte vor 15.5.1997 und keine nachgewiesene Äquivalenz zum Fruchtkörper.' },
      { name: 'Standardisierte D-Fraktion/MD-Fraktion', note: 'spezifische, beta-glucan-angereicherte Extraktfraktion aus klinischen Studien: nicht gleichzusetzen mit generischem Maitake-Pulver aus dem Handel.' },
    ],
    fatSoluble: false,
    cautionNote: 'Ein Fallbericht mit INR-Anstieg unter Maitake-Extrakt in Kombination mit Warfarin ist dokumentiert, dazu additive blutzuckersenkende Effekte mit Antidiabetika und erhöhtes Blutungsrisiko mit Antikoagulanzien. Als mögliche, meist milde Nebenwirkung wird asymptomatische Eosinophilie genannt.',
    sources: [
      { label: 'MSKCC About Herbs: Maitake', url: 'https://www.mskcc.org/cancer-care/integrative-medicine/herbs/maitake' },
      { label: 'EU Novel Food Consultation Status (AESAN, 2019): Grifola frondosa Myzelpulver', url: 'https://food.ec.europa.eu/system/files/2019-10/novel-food_consult-status_grifola-frondosa_aesan.pdf' },
    ],
  },
  {
    id: 'shiitake',
    name: 'Shiitake',
    category: 'Pilze',
    synonyms: ['shiitake', 'shiitake-pilz', 'lentinula edodes', 'lentinus edodes', 'japanischer schwarzer waldpilz', 'lentinan'],
    unit: 'mg',
    what: 'Ostasiatischer Speise- und Vitalpilz, der sowohl als Lebensmittel (Fruchtkörper frisch/getrocknet) als auch als Nahrungsergänzung in Extraktform verkauft wird.',
    useCases: [
      { topic: 'Immunsystem (allgemein)', note: 'traditionell zur Unterstützung des Immunsystems verwendet; kleine randomisierte Humanstudien zeigen Effekte auf Immunparameter: schwache, kleinteilige Datenlage.' },
      { topic: 'Begleitend zur Chemotherapie (Lentinan)', note: 'in Japan ist injizierbares Lentinan als Arzneimittel begleitend zur Chemotherapie bei bestimmten Krebsarten zugelassen: das betrifft ein reguliertes Arzneimittel, nicht das frei verkäufliche Nahrungsergänzungsmittel.' },
      { topic: 'Cholesterinspiegel', note: 'Laborevidenz und einzelne kleine Humanstudien; keine belastbare klinische Evidenz.' },
    ],
    forms: [
      { name: 'Fruchtkörper (frisch/getrocknet)', note: 'keine standardisierte Wirkstoffmenge; Grundlage der traditionellen Verzehrsgeschichte in der EU.' },
      { name: 'Polysaccharid-Extrakt (Lentinan, teils als "LEM" aus Myzel)', note: 'Konzentration je nach Extraktionsverfahren stark unterschiedlich; injizierbares Lentinan (Arzneimittel Japan) ist nicht gleichzusetzen mit oralen Kapselpräparaten.' },
    ],
    fatSoluble: false,
    cautionNote: 'Nach Verzehr von rohem oder nicht ausreichend erhitztem Shiitake kann eine toxische Reaktion auf Lentinan auftreten: ein juckender, streifenartiger Hautausschlag ("Shiitake-Dermatitis"). Lentinan ist hitzelabil und wird beim ausreichenden Erhitzen zersetzt. Weitere berichtete Nebenwirkungen: Eosinophilie, Photosensibilität, Magen-Darm-Beschwerden, vereinzelt Hypersensitivitätspneumonitis durch Sporeninhalation. Der ganze Fruchtkörper gilt als traditionelles Lebensmittel (keine Novel-Food-Einstufung); eine spezifische sterile wässrige Myzelextrakt-Zubereitung wurde per Kommissionsentscheidung 2011/73/EU als neuartige Lebensmittelzutat zugelassen: das betrifft nur dieses eine Extraktprodukt, nicht Shiitake allgemein.',
    sources: [
      { label: 'MSKCC: Shiitake Mushroom', url: 'https://www.mskcc.org/cancer-care/integrative-medicine/herbs/shiitake-mushroom' },
      { label: 'NCI PDQ: Mushrooms (Patient Version)', url: 'https://www.cancer.gov/about-cancer/treatment/cam/patient/mushrooms-pdq' },
      { label: 'EU-Kommission: Entscheidung 2011/73/EU (Lentinula edodes Myzelextrakt)', url: 'https://eur-lex.europa.eu/eli/dec/2011/73(1)/oj/eng' },
    ],
  },
  {
    id: 'coriolus-versicolor',
    name: 'Coriolus versicolor (Schmetterlingstramete)',
    category: 'Pilze',
    synonyms: ['coriolus versicolor', 'trametes versicolor', 'schmetterlingstramete', 'turkey tail', 'yun zhi', 'krestin', 'psk', 'psp'],
    unit: 'mg',
    what: 'Holzbewohnender Porenpilz, der nicht als Speisepilz gilt, sondern ausschließlich als standardisierter Extrakt (v. a. PSK und PSP) in der traditionellen chinesischen Medizin und als Nahrungsergänzung verwendet wird.',
    useCases: [
      { topic: 'Begleitend zur Chemotherapie, Magenkrebs (PSK)', note: 'PSK ist in Japan als Arzneimittel zugelassen; große randomisierte Studien zeigten längeres Überleben zusätzlich zur Chemotherapie: reguliertes Arzneimittel in Japan, kein vergleichbarer Status als freiverkäufliches Supplement in der EU/Deutschland.' },
      { topic: 'Darmkrebs (adjuvant)', note: 'Auswertung mehrerer Studien zeigte weniger Rückfälle und längeres Überleben unter PSK nach Operation.' },
      { topic: 'Lungenkrebs', note: 'randomisierte Studien zeigten Verbesserungen bei Immunfunktion, Gewicht und Wohlbefinden: keine einheitlichen Überlebensdaten.' },
    ],
    forms: [
      { name: 'Polysaccharid-Extrakt (PSK/PSP)', note: 'standardisierte Protein-Polysaccharid-Komplexe aus Pilzkultur; in Japan arzneimittelreguliert, in Europa ohne diesen Status. Kapsel-, Pulver- oder Teeform.' },
    ],
    fatSoluble: false,
    cautionNote: 'Seltene berichtete Nebenwirkungen: dunkel gefärbter Stuhl, Dunkelfärbung der Fingernägel. Keine Anwendung in Schwangerschaft/Stillzeit ohne ärztliche Rücksprache mangels Sicherheitsdaten. Die FDA hat Coriolus-Extrakte nicht als Krebstherapie zugelassen. Der EU-Novel-Food-Status ist über die verfügbaren Quellen nicht abschließend zu verifizieren, da der Pilz traditionell nicht als Lebensmittel, sondern nur als Extrakt verwendet wurde, ist eine Novel-Food-Einstufung plausibel, aber nicht durch eine aufrufbare Primärquelle belegt.',
    sources: [
      { label: 'MSKCC: Coriolus versicolor', url: 'https://www.mskcc.org/cancer-care/integrative-medicine/herbs/coriolus-versicolor' },
      { label: 'NCI PDQ: Mushrooms (Turkey Tail/PSK)', url: 'https://www.cancer.gov/about-cancer/treatment/cam/patient/mushrooms-pdq' },
    ],
  },
  {
    id: 'agaricus-blazei',
    name: 'Agaricus blazei (Mandelpilz)',
    category: 'Pilze',
    synonyms: ['agaricus blazei', 'agaricus subrufescens', 'agaricus brasiliensis', 'mandelpilz', 'abm', 'himematsutake', 'sonnenpilz'],
    unit: 'mg',
    what: 'Aus Brasilien stammender, in Japan kultivierter Speisepilz mit mandelartigem Aroma; wird als Fruchtkörper (getrocknet/Extrakt) oder als Myzelpulver angeboten: mit regulatorisch unterschiedlichem Status je nach Pilzteil.',
    useCases: [
      { topic: 'Begleitend zur Chemotherapie/Lebensqualität', note: 'einzelne Studien bei Krebspatientinnen zeigen verbesserte NK-Zell-Aktivität und Lebensqualität unter oralem Extrakt: keine breite Evidenzbasis.' },
      { topic: 'Blutzucker/Insulinresistenz', note: 'Hinweise auf verbesserte Insulinresistenz bei Diabetikerinnen: vorläufige Datenlage.' },
      { topic: 'Multiples Myelom', note: 'keine Überlebensverbesserung trotz messbarer immunmodulatorischer Effekte.' },
    ],
    forms: [
      { name: 'Fruchtkörper (getrocknet/Extrakt)', note: 'gilt in der EU als Lebensmittel mit Verzehrsgeschichte vor 1997.' },
      { name: 'Myzelpulver (dehydriert)', note: 'keine belegte Äquivalenz zum Fruchtkörper bei Nährstoffzusammensetzung/Wirkstoffgehalt: als Novel Food eingestuft (Verordnung (EU) 2015/2283).' },
    ],
    fatSoluble: false,
    cautionNote: 'In Laborproben wurden teils hohe Gehalte an anorganischem Arsen nachgewiesen. Berichtete Nebenwirkungen: Leberfunktionsstörungen, Lippenschwellung. Kann CYP3A4 hemmen und so den Abbau anderer Medikamente beeinflussen. Nicht bei bekannter Pilzallergie anwenden. Laut AESAN/EU-Kommissions-Konsultation (Oktober 2019) gilt: Der Fruchtkörper hat eine belegte Verzehrsgeschichte in der EU vor dem 15.05.1997 und ist kein Novel Food; das dehydrierte Myzelpulver hat diese Verzehrsgeschichte nicht und ist als Novel Food eingestuft, für Supplement-Etiketten heißt das konkret: Produkte auf Fruchtkörperbasis sind unproblematisch, Produkte auf Myzelbasis benötigen eine Novel-Food-Zulassung.',
    sources: [
      { label: 'MSKCC: Agaricus', url: 'https://www.mskcc.org/cancer-care/integrative-medicine/herbs/agaricus' },
      { label: 'EU-Kommission/AESAN: Novel-Food-Konsultation Agaricus blazei Myzelpulver (29.10.2019)', url: 'https://food.ec.europa.eu/system/files/2019-10/novel-food_consult-status_agaricus-blazei_aesan.pdf' },
    ],
  },
  {
    id: 'nicotinamide-riboside',
    name: 'Nicotinamid-Ribosid (NR)',
    category: 'Longevity',
    synonyms: ['nicotinamide riboside', 'nicotinamide riboside chloride', 'nr', 'nrc', 'nicotinamid-ribosid', 'nicotinamid-ribosid-chlorid', 'nicotinamidribosid'],
    unit: 'mg',
    what: 'Nucleosid-Form von Vitamin B3, die über die Enzyme NRK1/NRK2 zu NMN und weiter zu NAD+ umgewandelt wird: ein anderer Stoffwechselweg als bei NMN. NR besitzt seit 2020 eine EU-Novel-Food-Zulassung mit festgelegten Höchstmengen, während für NMN in der EU keine vergleichbare Zulassung mit definierten Höchstmengen vorliegt.',
    useCases: [
      { topic: 'NAD+-Spiegel im Blut', note: 'RCTs zeigen dosisabhängigen Anstieg von NAD+ nach oraler Einnahme (Conze et al. 2019, bis 1000 mg/Tag über 8 Wochen).' },
      { topic: 'Stoffwechsel bei Adipositas', note: 'RCT bei übergewichtigen Männern fand trotz NAD+-Anstieg keine Verbesserung der Insulinsensitivität (Dollerup et al. 2018): Humandaten zu Stoffwechseleffekten sind uneinheitlich.' },
      { topic: 'Kognitive Funktion im Alter', note: 'kleine placebokontrollierte Pilotstudie (2023) bei leichter kognitiver Beeinträchtigung: frühe, noch nicht replizierte Datenlage.' },
    ],
    forms: [
      { name: 'Nicotinamid-Ribosid-Chlorid (NRC)', note: 'einzige Form mit EU-Novel-Food-Zulassung; in Studien meist 250–1000 mg/Tag.' },
    ],
    fatSoluble: false,
    cautionNote: 'In RCTs bis 1000 mg/Tag über 8 Wochen gut verträglich (milde gastrointestinale Beschwerden möglich). Dosen über 1000 mg/Tag wurden bislang nur in kleinen Studien bei speziellen Patientengruppen untersucht, nicht für die Allgemeinbevölkerung bewertet.',
    sources: [
      { label: 'EFSA Journal 2019 (Opinion 5775)', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2019.5775' },
      { label: 'EUR-Lex, Commission Implementing Regulation (EU) 2020/16', url: 'https://eur-lex.europa.eu/eli/reg_impl/2020/16/oj' },
      { label: 'PubMed, Conze et al. 2019', url: 'https://pubmed.ncbi.nlm.nih.gov/31278280/' },
    ],
  },
  {
    id: 'urolithin-a',
    name: 'Urolithin A',
    category: 'Longevity',
    synonyms: ['urolithin a', 'urolithin-a', 'ua'],
    unit: 'mg',
    what: 'Metabolit, der von Darmbakterien aus Ellagitannin-haltigen Lebensmitteln (Granatapfel, manche Beeren, Walnüsse) gebildet wird: nicht jeder Mensch produziert es in relevanter Menge. Anders als NMN/NR (NAD+-Vorstufen) oder Spermidin (allgemeiner Autophagie-Induktor) wird Urolithin A spezifisch mit Mitophagie (gezieltem Abbau geschädigter Mitochondrien) in Verbindung gebracht.',
    useCases: [
      { topic: 'Muskelkraft und Ausdauer im mittleren/höheren Alter', note: 'RCT mit 88 Teilnehmenden (Singh et al. 2022, 500/1000 mg/Tag über 4 Monate): ca. 12 % höhere Muskelkraft, verbesserte VO2peak-Werte; primärer Endpunkt verfehlte jedoch statistische Signifikanz.' },
      { topic: 'Mitochondriale Biomarker', note: 'erste placebokontrollierte Humanstudie (Andreux et al. 2019) fand nach 4 Wochen Veränderungen bei Plasma-Acylcarnitinen und Muskel-Genexpression: Surrogatparameter, kein klinischer Endpunkt.' },
    ],
    forms: [
      { name: 'Synthetisches/gereinigtes Urolithin A', note: 'über Nahrung stark abhängig vom individuellen Darmmikrobiom; als isolierte Substanz standardisierte Aufnahme, in Studien meist 500–1000 mg/Tag.' },
    ],
    fatSoluble: false,
    cautionNote: 'In Humanstudien bis 1000 mg/Tag über bis zu 4 Monate als gut verträglich mit milden Nebenwirkungen beschrieben. Die US-amerikanische FDA hat Urolithin A 2018 als GRAS für Lebensmittel im Bereich 250 mg–1 g pro Portion eingestuft. Keine EU-Novel-Food-Zulassung gefunden: Rechtsstatus als Nahrungsergänzungsmittel in der EU damit uneinheitlich/ungeklärt. Insgesamt wenige, meist kleine, teils vom Ingredient-Hersteller mitfinanzierte Studien; unabhängige Replikation und Langzeitdaten fehlen.',
    sources: [
      { label: 'PubMed, Andreux et al. 2019 (Nat Metab)', url: 'https://pubmed.ncbi.nlm.nih.gov/32694802/' },
      { label: 'PubMed, Singh et al. 2022 (Cell Rep Med)', url: 'https://pubmed.ncbi.nlm.nih.gov/35584623/' },
    ],
  },
  {
    id: 'alpha-ketoglutarate',
    name: 'Alpha-Ketoglutarat (Ca-AKG)',
    category: 'Longevity',
    synonyms: ['alpha-ketoglutarate', 'alpha-ketoglutarat', 'ca-akg', 'calcium alpha-ketoglutarate', 'calcium-alpha-ketoglutarat', '2-oxoglutarat', 'akg', 'alpha-ketoglutarsäure'],
    unit: 'mg',
    what: 'Natürliches Zwischenprodukt des Zitratzyklus (zellulärer Energiestoffwechsel), meist als Calciumsalz (Ca-AKG) supplementiert. Anders als NMN/NR oder Spermidin wird AKG in Tiermodellen mit epigenetischen Alterungsmarkern und Lebensspanne-Effekten in Verbindung gebracht: die Humandatenlage ist von den Longevity-Substanzen in der Datenbank die früheste und schwächste.',
    useCases: [
      { topic: 'Lebensspanne in Tiermodellen', note: 'bei C. elegans nahezu verdoppelte Lebensspanne (Chin et al. 2014); bei Mäusen verlängerte Lebensspanne und verkürzte Gebrechlichkeitsphase unter Ca-AKG (Asadi Shahmirzadi et al. 2020): Tierstudien, nicht direkt auf den Menschen übertragbar.' },
      { topic: 'Biologisches Alter beim Menschen', note: 'eine unkontrollierte, nicht-randomisierte Anwenderstudie berichtete nach ca. 7 Monaten eine rechnerische Verringerung des epigenetischen Alters, allerdings mit einer Kombination aus Ca-AKG und weiteren Vitaminen und ohne Placebogruppe, sodass der Anteil von AKG selbst nicht bestimmbar ist.' },
      { topic: 'Laufende kontrollierte Humanforschung', note: 'eine RCT in Rekrutierungs-/Machbarkeitsphase bei biologisch älteren, mittelalten Erwachsenen läuft: Ergebnisse stehen noch aus.' },
    ],
    forms: [
      { name: 'Calcium-Alpha-Ketoglutarat (Ca-AKG)', note: 'als Calciumsalz stabiler und in Studien besser charakterisiert als freie Alpha-Ketoglutarsäure; systematische Bioverfügbarkeitsdaten beim Menschen fehlen, keine etablierte Standarddosis.' },
    ],
    fatSoluble: false,
    cautionNote: 'Keine systematischen Sicherheitsstudien am Menschen über eine methodisch schwache Anwenderbeobachtung und eine laufende RCT-Rekrutierung hinaus gefunden. Keine EU-Novel-Food-Zulassung und keine Höchstmenge auffindbar: Rechtsstatus als Nahrungsergänzungsmittel in der EU damit ungeklärt. Keine abgeschlossene kontrollierte Humanstudie mit Wirksamkeitsnachweis.',
    sources: [
      { label: 'PubMed, Lim et al. 2025 (ABLE-Trial)', url: 'https://pubmed.ncbi.nlm.nih.gov/40819772/' },
    ],
  },
  {
    id: 'ginger',
    name: 'Ingwer',
    category: 'Kräuter',
    synonyms: ['ingwer', 'ginger', 'zingiber officinale', 'ingwerwurzel', 'ingwerextrakt', 'zingiberis rhizoma'],
    unit: 'mg',
    what: 'Gewürz- und Heilpflanze, deren Wurzelstock (Zingiberis rhizoma) als pflanzliches Arzneimittel und Nahrungsergänzungsmittel eingesetzt wird.',
    useCases: [
      { topic: 'Reiseübelkeit', note: 'EMA-Indikation (Well-established Use): Vorbeugung von Übelkeit und Erbrechen bei Reisekrankheit.' },
      { topic: 'Verdauungsbeschwerden', note: 'Traditionell eingesetzt bei leichten krampfartigen Magen-Darm-Beschwerden und Blähungen.' },
    ],
    forms: [
      { name: 'Pulver', aka: ['Gemahlener Wurzelstock'], note: 'Die EMA-Monographie bezieht sich auf den pulverisierten Wurzelstock in Kapseln oder Tabletten.' },
      { name: 'Extrakt', note: 'Konzentrate mit standardisierten Scharfstoffen (Gingerole); die Zusammensetzung unterscheidet sich je Hersteller.' },
      { name: 'Tee/Frischwurzel', note: 'Traditionelle Anwendungsform; Gehalt an Inhaltsstoffen schwankt stark.' },
    ],
    fatSoluble: false,
    cautionNote: 'Bei Gallensteinen vor der Einnahme ärztlich abklären. Sicherheit hoher Dosen in der Schwangerschaft ist nicht abschließend geklärt; die Anwendung bei Schwangerschaftsübelkeit gehört in ärztliche Begleitung. Ein Einfluss auf die Blutgerinnung wird diskutiert, die Datenlage ist uneinheitlich.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Zingiber officinale Roscoe, rhizoma', url: 'https://www.ema.europa.eu/en/medicines/herbal/zingiberis-rhizoma' },
      { label: 'NCCIH: Ginger', url: 'https://www.nccih.nih.gov/health/ginger' },
    ],
  },
  {
    id: 'clove',
    name: 'Gewürznelke',
    category: 'Kräuter',
    synonyms: ['gewürznelke', 'nelke', 'nelken', 'clove', 'syzygium aromaticum', 'nelkenöl', 'nelkenknospen', 'caryophylli flos', 'eugenol'],
    unit: 'mg',
    what: 'Getrocknete Blütenknospen des Gewürznelkenbaums (Caryophylli flos); das ätherische Öl mit dem Hauptbestandteil Eugenol wird traditionell lokal angewendet.',
    useCases: [
      { topic: 'Mund und Rachen', note: 'Traditionell bei leichten Entzündungen der Mund- und Rachenschleimhaut eingesetzt (lokale Anwendung).' },
      { topic: 'Zahnschmerzen', note: 'Traditionell zur vorübergehenden lokalen Anwendung bei Zahnschmerzen; ersetzt keine zahnärztliche Behandlung.' },
    ],
    forms: [
      { name: 'Ätherisches Öl', aka: ['Nelkenöl', 'Caryophylli floris aetheroleum'], note: 'Nur verdünnt und lokal anwenden; unverdünnt reizt es Haut und Schleimhaut.' },
      { name: 'Ganze/gemahlene Knospen', note: 'Gewürz und traditionelle Anwendungsform, z. B. als Aufguss zum Spülen.' },
    ],
    fatSoluble: false,
    cautionNote: 'Das ätherische Öl nicht unverdünnt anwenden und nicht bei Kindern einsetzen. Eugenol hemmt in Laboruntersuchungen die Thrombozytenaggregation; wer gerinnungshemmende Medikamente nimmt, bespricht eine regelmäßige hochdosierte Anwendung ärztlich. Für Schwangerschaft und Stillzeit fehlen Daten jenseits der Gewürzmenge.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Syzygium aromaticum, flos', url: 'https://www.ema.europa.eu/en/medicines/herbal/caryophylli-flos' },
      { label: 'EMA/HMPC: European Union herbal monograph on Syzygium aromaticum, floris aetheroleum', url: 'https://www.ema.europa.eu/en/medicines/herbal/caryophylli-floris-aetheroleum' },
    ],
  },
  {
    id: 'chamomile',
    name: 'Kamille',
    category: 'Kräuter',
    synonyms: ['kamille', 'chamomile', 'matricaria', 'kamillenblüten', 'kamillentee', 'matricariae flos', 'echte kamille'],
    unit: 'mg',
    what: 'Heilpflanze, deren Blüten (Matricariae flos) zu den am längsten dokumentierten traditionellen pflanzlichen Arzneimitteln in Europa gehören.',
    useCases: [
      { topic: 'Magen-Darm', note: 'Traditionell bei leichten Magen-Darm-Beschwerden wie Blähungen und leichten Krämpfen eingesetzt.' },
      { topic: 'Erkältungsbeschwerden', note: 'Traditionell als Inhalation oder Spülung bei Erkältungsbeschwerden im Mund- und Rachenraum.' },
      { topic: 'Haut und Schleimhaut', note: 'Traditionell äußerlich bei leichten Haut- und Schleimhautentzündungen.' },
    ],
    forms: [
      { name: 'Tee/Aufguss', note: 'Klassische Anwendungsform der Blüten.' },
      { name: 'Extrakt', note: 'Flüssige oder feste Zubereitungen, auch für Spülungen und Umschläge.' },
    ],
    fatSoluble: false,
    cautionNote: 'Bei bekannter Allergie gegen Korbblütler (z. B. Beifuß, Arnika) nicht anwenden. Für hochkonzentrierte Zubereitungen in Schwangerschaft und Stillzeit fehlen ausreichende Daten.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Matricaria recutita L., flos', url: 'https://www.ema.europa.eu/en/medicines/herbal/matricariae-flos' },
      { label: 'NCCIH: Chamomile', url: 'https://www.nccih.nih.gov/health/chamomile' },
    ],
  },
  {
    id: 'peppermint-oil',
    name: 'Pfefferminzöl',
    category: 'Kräuter',
    synonyms: ['pfefferminzöl', 'pfefferminze', 'peppermint', 'peppermint oil', 'mentha piperita', 'menthae piperitae aetheroleum', 'minzöl'],
    unit: 'mg',
    what: 'Ätherisches Öl aus den Blättern der Pfefferminze; als magensaftresistente Kapsel eines der am besten untersuchten pflanzlichen Mittel für den Darm.',
    useCases: [
      { topic: 'Reizdarm', note: 'EMA-Indikation (Well-established Use): Linderung leichter krampfartiger Beschwerden bei Reizdarmsyndrom, in magensaftresistenten Kapseln.' },
      { topic: 'Spannungskopfschmerz', note: 'Traditionell äußerlich auf Schläfen und Stirn bei Spannungskopfschmerz.' },
      { topic: 'Erkältungsbeschwerden', note: 'Traditionell als Einreibung oder Inhalation bei Husten und Erkältung.' },
    ],
    forms: [
      { name: 'Magensaftresistente Kapseln', note: 'Für die Darm-Anwendung entscheidend: Das Öl soll erst im Darm freigesetzt werden, sonst drohen Sodbrennen und Aufstoßen.' },
      { name: 'Ätherisches Öl äußerlich', note: 'Verdünnt zur Anwendung auf der Haut; nicht im Gesicht von Säuglingen und Kleinkindern anwenden.' },
    ],
    fatSoluble: false,
    cautionNote: 'Nicht bei Verschluss der Gallenwege, Gallenblasenentzündung oder schweren Leberschäden. Bei Reflux können sich Beschwerden verstärken. Menthol-haltige Zubereitungen nicht auf Gesicht oder Brust von Säuglingen und Kleinkindern auftragen (Gefahr von Atemkrämpfen).',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Mentha x piperita L., aetheroleum', url: 'https://www.ema.europa.eu/en/medicines/herbal/menthae-piperitae-aetheroleum' },
      { label: 'NCCIH: Peppermint Oil', url: 'https://www.nccih.nih.gov/health/peppermint-oil' },
    ],
  },
  {
    id: 'lemon-balm',
    name: 'Melisse',
    category: 'Kräuter',
    synonyms: ['melisse', 'zitronenmelisse', 'lemon balm', 'melissa officinalis', 'melissenblätter', 'melissae folium'],
    unit: 'mg',
    what: 'Heilpflanze, deren Blätter (Melissae folium) traditionell bei Unruhe und Magen-Darm-Beschwerden eingesetzt werden.',
    useCases: [
      { topic: 'Unruhe und Schlaf', note: 'Traditionell bei leichten Symptomen von Stress und zur Unterstützung des Einschlafens.' },
      { topic: 'Magen-Darm', note: 'Traditionell bei leichten krampfartigen Magen-Darm-Beschwerden und Blähungen.' },
    ],
    forms: [
      { name: 'Tee/Aufguss', note: 'Klassische Anwendungsform der Blätter.' },
      { name: 'Trockenextrakt', note: 'In Kapseln oder Kombinationspräparaten, häufig zusammen mit Baldrian.' },
    ],
    fatSoluble: false,
    cautionNote: 'Keine ausreichenden Daten für Kinder unter 12 Jahren sowie für Schwangerschaft und Stillzeit. Kann müde machen; Wirkung auf die Fahrtüchtigkeit beachten.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Melissa officinalis L., folium', url: 'https://www.ema.europa.eu/en/medicines/herbal/melissae-folium' },
    ],
  },
  {
    id: 'sage',
    name: 'Salbei',
    category: 'Kräuter',
    synonyms: ['salbei', 'sage', 'salvia officinalis', 'salbeiblätter', 'salviae officinalis folium', 'salbeitee'],
    unit: 'mg',
    what: 'Heilpflanze, deren Blätter (Salviae officinalis folium) traditionell bei übermäßigem Schwitzen sowie im Mund- und Rachenraum eingesetzt werden.',
    useCases: [
      { topic: 'Schwitzen', note: 'Traditionell bei übermäßiger Schweißbildung eingesetzt.' },
      { topic: 'Mund und Rachen', note: 'Traditionell als Spülung oder Gurgellösung bei leichten Entzündungen der Mund- und Rachenschleimhaut.' },
      { topic: 'Verdauungsbeschwerden', note: 'Traditionell bei leichten Verdauungsbeschwerden wie Sodbrennen und Blähungen.' },
    ],
    forms: [
      { name: 'Tee/Aufguss', note: 'Klassische Anwendungsform der Blätter, auch zum Gurgeln.' },
      { name: 'Extrakt', note: 'Flüssige oder feste Zubereitungen; der Thujon-Gehalt hängt von der Zubereitung ab.' },
    ],
    fatSoluble: false,
    cautionNote: 'Salbei enthält Thujon. Hochdosierte oder langfristige Einnahme vermeiden; die EMA nennt Anwendungsgrenzen von wenigen Wochen. Nicht in Schwangerschaft und Stillzeit anwenden (Thujon; Salbei kann zudem die Milchbildung reduzieren, dieser Effekt wird auch gezielt beim Abstillen genutzt).',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Salvia officinalis L., folium', url: 'https://www.ema.europa.eu/en/medicines/herbal/salviae-officinalis-folium' },
    ],
  },
  {
    id: 'cinnamon',
    name: 'Zimt',
    category: 'Kräuter',
    synonyms: ['zimt', 'cinnamon', 'ceylon-zimt', 'cassia-zimt', 'cinnamomum verum', 'cinnamomi cortex', 'zimtrinde', 'zimtextrakt'],
    unit: 'mg',
    what: 'Rinde des Ceylon-Zimtbaums (Cinnamomi cortex); als Gewürz und traditionelles pflanzliches Arzneimittel bei Verdauungsbeschwerden dokumentiert.',
    useCases: [
      { topic: 'Verdauungsbeschwerden', note: 'Traditionell bei leichten krampfartigen Magen-Darm-Beschwerden, Blähungen und Völlegefühl.' },
      { topic: 'Blutzucker', note: 'Wird im Zusammenhang mit dem Zuckerstoffwechsel untersucht; die Studienlage ist uneinheitlich und rechtfertigt keine Selbstbehandlung.' },
    ],
    forms: [
      { name: 'Ceylon-Zimt', aka: ['Cinnamomum verum'], note: 'Enthält deutlich weniger Cumarin als Cassia-Zimt; auf diese Art bezieht sich die EMA-Monographie.' },
      { name: 'Cassia-Zimt', aka: ['Cinnamomum cassia'], note: 'Cumarin-reich. Das BfR warnt vor regelmäßig hohen Mengen (Leberbelastung), besonders bei Kindern.' },
    ],
    fatSoluble: false,
    cautionNote: 'Cassia-Zimt enthält Cumarin, das in hohen regelmäßigen Mengen die Leber belasten kann (BfR-Bewertung); für die regelmäßige Einnahme Ceylon-Zimt bevorzugen. Wer blutzuckersenkende Medikamente nimmt, bespricht Zimt-Präparate ärztlich.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Cinnamomum verum, cortex', url: 'https://www.ema.europa.eu/en/medicines/herbal/cinnamomi-cortex' },
      { label: 'BfR: Fragen und Antworten zu Cumarin in Zimt', url: 'https://www.bfr.bund.de/de/fragen_und_antworten_zu_cumarin_in_zimt_und_anderen_lebensmitteln-8439.html' },
    ],
  },
  {
    id: 'garlic',
    name: 'Knoblauch',
    category: 'Kräuter',
    synonyms: ['knoblauch', 'garlic', 'allium sativum', 'knoblauchextrakt', 'allii sativi bulbus', 'schwarzer knoblauch', 'allicin'],
    unit: 'mg',
    what: 'Zwiebel des Knoblauchs (Allii sativi bulbus); traditionell im Zusammenhang mit Herz-Kreislauf und Erkältungsbeschwerden dokumentiert.',
    useCases: [
      { topic: 'Herz-Kreislauf', note: 'Traditionell zur Unterstützung der Herz-Kreislauf-Gesundheit eingesetzt; Effekte auf Blutfette und Blutdruck werden untersucht, die Studienlage ist uneinheitlich.' },
      { topic: 'Erkältungsbeschwerden', note: 'Traditionell bei Erkältungsbeschwerden eingesetzt.' },
    ],
    forms: [
      { name: 'Pulver', aka: ['Knoblauchpulver-Kapseln'], note: 'Getrocknetes, gemahlenes Knoblauchpulver; Allicin-Ausbeute je nach Verarbeitung sehr unterschiedlich.' },
      { name: 'Gealterter Extrakt', aka: ['Aged Garlic Extract'], note: 'Geruchsarm; anderes Inhaltsstoffprofil als frischer Knoblauch.' },
    ],
    fatSoluble: false,
    cautionNote: 'Knoblauch-Präparate können die Wirkung gerinnungshemmender Medikamente verstärken; vor Operationen die Einnahme ärztlich besprechen und rechtzeitig pausieren. In üblichen Küchenmengen unbedenklich.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Allium sativum L., bulbus', url: 'https://www.ema.europa.eu/en/medicines/herbal/allii-sativi-bulbus' },
      { label: 'NCCIH: Garlic', url: 'https://www.nccih.nih.gov/health/garlic' },
    ],
  },
  {
    id: 'artichoke',
    name: 'Artischocke',
    category: 'Kräuter',
    synonyms: ['artischocke', 'artichoke', 'cynara', 'artischockenextrakt', 'cynarae folium', 'artischockenblätter'],
    unit: 'mg',
    what: 'Blätter der Artischocke (Cynarae folium); traditionell bei Verdauungsbeschwerden mit Bezug zu Galle und Fettverdauung eingesetzt.',
    useCases: [
      { topic: 'Verdauungsbeschwerden', note: 'Traditionell bei Völlegefühl, Blähungen und Beschwerden nach fettreichen Mahlzeiten eingesetzt.' },
    ],
    forms: [
      { name: 'Trockenextrakt', note: 'Übliche Form in Kapseln und Tabletten.' },
      { name: 'Frischpflanzensaft', note: 'Traditionelle flüssige Anwendungsform.' },
    ],
    fatSoluble: false,
    cautionNote: 'Nicht bei Verschluss der Gallenwege; bei Gallensteinen nur nach ärztlicher Rücksprache. Bei Allergie gegen Korbblütler nicht anwenden.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Cynara cardunculus L., folium', url: 'https://www.ema.europa.eu/en/medicines/herbal/cynarae-folium' },
    ],
  },
  {
    id: 'hawthorn',
    name: 'Weißdorn',
    category: 'Kräuter',
    synonyms: ['weißdorn', 'weissdorn', 'hawthorn', 'crataegus', 'weißdornblätter mit blüten', 'crataegi folium cum flore', 'weißdornextrakt'],
    unit: 'mg',
    what: 'Blätter mit Blüten des Weißdorns (Crataegi folium cum flore); traditionell bei nervösen Herzbeschwerden und zur Unterstützung des Schlafs dokumentiert.',
    useCases: [
      { topic: 'Nervöse Herzbeschwerden', note: 'Traditionell bei vorübergehenden nervösen Herzbeschwerden eingesetzt, nachdem ernste Ursachen ärztlich ausgeschlossen wurden.' },
      { topic: 'Unruhe und Schlaf', note: 'Traditionell bei leichten Symptomen von Stress und zur Unterstützung des Einschlafens.' },
    ],
    forms: [
      { name: 'Trockenextrakt', note: 'Übliche Form in Kapseln und Tabletten.' },
      { name: 'Tee/Aufguss', note: 'Traditionelle Anwendungsform der Blätter mit Blüten.' },
    ],
    fatSoluble: false,
    cautionNote: 'Herzbeschwerden gehören grundsätzlich in ärztliche Abklärung; Weißdorn ersetzt keine Herzmedikation. Wer Herzmedikamente einnimmt, bespricht die zusätzliche Anwendung ärztlich. Für Schwangerschaft und Stillzeit fehlen ausreichende Daten.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Crataegus, folium cum flore', url: 'https://www.ema.europa.eu/en/medicines/herbal/crataegi-folium-cum-flore' },
    ],
  },
  {
    id: 'elderflower',
    name: 'Holunderblüten',
    category: 'Kräuter',
    synonyms: ['holunderblüten', 'holunder', 'elderflower', 'sambucus nigra', 'sambuci flos', 'holundertee', 'holunderblütentee'],
    unit: 'mg',
    what: 'Blüten des Schwarzen Holunders (Sambuci flos); traditionell bei Erkältungsbeschwerden eingesetzt.',
    useCases: [
      { topic: 'Erkältungsbeschwerden', note: 'Traditionell zur Linderung von Erkältungsbeschwerden eingesetzt, klassisch als heißer Aufguss.' },
    ],
    forms: [
      { name: 'Tee/Aufguss', note: 'Klassische Anwendungsform der getrockneten Blüten.' },
      { name: 'Extrakt', note: 'Bestandteil vieler Erkältungs-Kombipräparate.' },
    ],
    fatSoluble: false,
    cautionNote: 'Unreife Beeren und andere Pflanzenteile des Holunders enthalten roh Stoffe, die Übelkeit auslösen können; die Monographie bezieht sich auf die Blüten. Für Schwangerschaft und Stillzeit fehlen ausreichende Daten.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Sambucus nigra L., flos', url: 'https://www.ema.europa.eu/en/medicines/herbal/sambuci-flos' },
    ],
  },
  {
    id: 'licorice-root',
    name: 'Süßholzwurzel',
    category: 'Kräuter',
    synonyms: ['süßholz', 'süssholz', 'süßholzwurzel', 'licorice', 'liquorice', 'glycyrrhiza glabra', 'liquiritiae radix', 'lakritz', 'glycyrrhizin'],
    unit: 'mg',
    what: 'Wurzel des Süßholzstrauchs (Liquiritiae radix); traditionell bei Magenbeschwerden und Husten eingesetzt, Ausgangsstoff von Lakritz.',
    useCases: [
      { topic: 'Magenbeschwerden', note: 'Traditionell bei Verdauungsbeschwerden wie Sodbrennen und Magendrücken eingesetzt.' },
      { topic: 'Husten', note: 'Traditionell als schleimlösendes Mittel bei Husten mit zähem Schleim.' },
    ],
    forms: [
      { name: 'Tee/Aufguss', note: 'Klassische Anwendungsform der geschnittenen Wurzel.' },
      { name: 'Extrakt', note: 'Auch entglycyrrhiziniert (DGL) erhältlich; dann entfällt der blutdruckrelevante Anteil weitgehend.' },
    ],
    fatSoluble: false,
    cautionNote: 'Glycyrrhizin kann bei regelmäßig hoher Zufuhr den Blutdruck erhöhen und den Kaliumspiegel senken. Ohne ärztlichen Rat nicht länger als 4 Wochen anwenden. Nicht bei Bluthochdruck, Nieren- oder Lebererkrankungen und nicht in der Schwangerschaft. Vorsicht in Kombination mit entwässernden Medikamenten (zusätzlicher Kaliumverlust).',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Glycyrrhiza glabra L., radix', url: 'https://www.ema.europa.eu/en/medicines/herbal/liquiritiae-radix' },
    ],
  },
  {
    id: 'lavender-oil',
    name: 'Lavendel',
    category: 'Kräuter',
    synonyms: ['lavendel', 'lavender', 'lavandula angustifolia', 'lavendelöl', 'lavandulae aetheroleum', 'lavendelblüten'],
    unit: 'mg',
    what: 'Ätherisches Öl und Blüten des Echten Lavendels; traditionell bei Unruhe und zur Unterstützung des Schlafs eingesetzt.',
    useCases: [
      { topic: 'Unruhe', note: 'Traditionell bei leichten Symptomen von Stress und innerer Unruhe eingesetzt; ein standardisiertes Lavendelöl ist in Deutschland als Arzneimittel zugelassen.' },
      { topic: 'Schlaf', note: 'Traditionell zur Unterstützung des Einschlafens, auch als Duftanwendung.' },
    ],
    forms: [
      { name: 'Ätherisches Öl in Kapseln', note: 'Auf diese Form bezieht sich die EMA-Monographie zur Einnahme; kann anfangs Aufstoßen verursachen.' },
      { name: 'Tee/Duftanwendung', note: 'Traditionelle Anwendungsformen der Blüten und des Öls.' },
    ],
    fatSoluble: false,
    cautionNote: 'Keine ausreichenden Daten für Kinder unter 12 Jahren sowie für Schwangerschaft und Stillzeit. Anhaltende Unruhe- oder Schlafprobleme gehören in ärztliche Abklärung.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Lavandula angustifolia Mill., aetheroleum', url: 'https://www.ema.europa.eu/en/medicines/herbal/lavandulae-aetheroleum' },
      { label: 'NCCIH: Lavender', url: 'https://www.nccih.nih.gov/health/lavender' },
    ],
  },
  {
    id: 'fennel',
    name: 'Fenchel',
    category: 'Kräuter',
    synonyms: ['fenchel', 'fennel', 'foeniculum vulgare', 'fenchelfrüchte', 'fencheltee', 'foeniculi fructus', 'fenchelsamen'],
    unit: 'mg',
    what: 'Früchte des Fenchels (Foeniculi fructus); traditionell bei Blähungen und leichten Verdauungsbeschwerden eingesetzt.',
    useCases: [
      { topic: 'Blähungen', note: 'Traditionell bei leichten krampfartigen Magen-Darm-Beschwerden und Blähungen eingesetzt.' },
      { topic: 'Husten', note: 'Traditionell als mildes schleimlösendes Mittel bei Erkältungshusten.' },
    ],
    forms: [
      { name: 'Tee/Aufguss', note: 'Klassische Anwendungsform der frisch zerstoßenen Früchte.' },
      { name: 'Ätherisches Öl', note: 'Konzentrierte Form; Anwendungsdauer und Dosierung der Monographie beachten.' },
    ],
    fatSoluble: false,
    cautionNote: 'Fenchel enthält Estragol; die EMA empfiehlt, Tee und Öl nur zeitlich begrenzt anzuwenden und bei Kindern unter 4 Jahren auf Fencheltee zur Selbstmedikation zu verzichten. Bei Allergie gegen Doldenblütler nicht anwenden.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Foeniculum vulgare Mill., fructus', url: 'https://www.ema.europa.eu/en/medicines/herbal/foeniculi-dulcis-fructus' },
    ],
  },
  {
    id: 'yarrow',
    name: 'Schafgarbe',
    category: 'Kräuter',
    synonyms: ['schafgarbe', 'yarrow', 'achillea millefolium', 'millefolii herba', 'schafgarbenkraut', 'schafgarbentee'],
    unit: 'mg',
    what: 'Heilpflanze, deren Kraut (Millefolii herba) traditionell bei Appetitlosigkeit, Verdauungsbeschwerden und Menstruationskrämpfen eingesetzt wird.',
    useCases: [
      { topic: 'Verdauungsbeschwerden', note: 'Traditionell bei Appetitlosigkeit und leichten krampfartigen Magen-Darm-Beschwerden.' },
      { topic: 'Menstruationsbeschwerden', note: 'Traditionell bei leichten krampfartigen Beschwerden während der Menstruation.' },
      { topic: 'Haut', note: 'Traditionell äußerlich bei kleinen oberflächlichen Wunden.' },
    ],
    forms: [
      { name: 'Tee/Aufguss', note: 'Klassische Anwendungsform des Krauts.' },
      { name: 'Extrakt', note: 'Flüssige oder feste Zubereitungen.' },
    ],
    fatSoluble: false,
    cautionNote: 'Bei Allergie gegen Korbblütler nicht anwenden. Für Schwangerschaft und Stillzeit fehlen ausreichende Daten.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Achillea millefolium L., herba', url: 'https://www.ema.europa.eu/en/medicines/herbal/millefolii-herba' },
    ],
  },
  {
    id: 'hops',
    name: 'Hopfen',
    category: 'Kräuter',
    synonyms: ['hopfen', 'hops', 'humulus lupulus', 'hopfenzapfen', 'lupuli flos', 'hopfenblüten'],
    unit: 'mg',
    what: 'Zapfen des Hopfens (Lupuli flos); traditionell bei Unruhe und Schlafstörungen eingesetzt, meist kombiniert mit Baldrian.',
    useCases: [
      { topic: 'Unruhe und Schlaf', note: 'Traditionell bei leichten Symptomen von Stress und zur Unterstützung des Einschlafens.' },
    ],
    forms: [
      { name: 'Trockenextrakt', note: 'Häufig in Kombinationspräparaten mit Baldrian oder Melisse.' },
      { name: 'Tee/Aufguss', note: 'Traditionelle Anwendungsform der Zapfen.' },
    ],
    fatSoluble: false,
    cautionNote: 'Kann müde machen; Wirkung auf die Fahrtüchtigkeit beachten. Keine ausreichenden Daten für Kinder unter 12 Jahren sowie für Schwangerschaft und Stillzeit.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Humulus lupulus L., flos', url: 'https://www.ema.europa.eu/en/medicines/herbal/lupuli-flos' },
    ],
  },
  {
    id: 'dandelion',
    name: 'Löwenzahn',
    category: 'Kräuter',
    synonyms: ['löwenzahn', 'loewenzahn', 'dandelion', 'taraxacum officinale', 'löwenzahnwurzel', 'taraxaci radix'],
    unit: 'mg',
    what: 'Wurzel mit Kraut des Löwenzahns (Taraxaci radix cum herba); traditionell bei Verdauungsbeschwerden und zur Durchspülung der Harnwege eingesetzt.',
    useCases: [
      { topic: 'Verdauungsbeschwerden', note: 'Traditionell bei Völlegefühl, Blähungen und vorübergehender Appetitlosigkeit.' },
      { topic: 'Harnwege', note: 'Traditionell zur Erhöhung der Harnmenge im Rahmen einer Durchspülung der Harnwege.' },
    ],
    forms: [
      { name: 'Tee/Aufguss', note: 'Klassische Anwendungsform von Wurzel und Kraut.' },
      { name: 'Extrakt', note: 'Flüssige oder feste Zubereitungen, auch als Frischpflanzensaft.' },
    ],
    fatSoluble: false,
    cautionNote: 'Nicht bei Verschluss der Gallenwege oder aktiven Gallensteinen; bei Gallenerkrankungen ärztlich abklären. Bei Allergie gegen Korbblütler nicht anwenden. Zur Durchspülung ausreichend trinken.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Taraxacum officinale, radix cum herba', url: 'https://www.ema.europa.eu/en/medicines/herbal/taraxaci-radix-cum-herba' },
    ],
  },
  {
    id: 'rosemary',
    name: 'Rosmarin',
    category: 'Kräuter',
    synonyms: ['rosmarin', 'rosemary', 'rosmarinus officinalis', 'salvia rosmarinus', 'rosmarini folium', 'rosmarinblätter'],
    unit: 'mg',
    what: 'Blätter des Rosmarins (Rosmarini folium); traditionell bei Verdauungsbeschwerden sowie äußerlich bei Muskelbeschwerden eingesetzt.',
    useCases: [
      { topic: 'Verdauungsbeschwerden', note: 'Traditionell bei leichten krampfartigen Magen-Darm-Beschwerden und Blähungen.' },
      { topic: 'Muskeln und Gelenke', note: 'Traditionell äußerlich als Einreibung oder Badezusatz bei leichten Muskel- und Gelenkbeschwerden.' },
    ],
    forms: [
      { name: 'Tee/Aufguss', note: 'Klassische Anwendungsform der Blätter.' },
      { name: 'Ätherisches Öl äußerlich', note: 'Verdünnt als Einreibung oder Badezusatz.' },
    ],
    fatSoluble: false,
    cautionNote: 'Für Schwangerschaft und Stillzeit fehlen ausreichende Daten für arzneiliche Dosierungen; Gewürzmengen sind unbedenklich. Bäder mit Rosmarinöl nicht bei größeren Hautverletzungen oder schweren Herz-Kreislauf-Erkrankungen.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Rosmarinus officinalis L., folium', url: 'https://www.ema.europa.eu/en/medicines/herbal/rosmarini-folium' },
    ],
  },
  {
    id: 'thyme',
    name: 'Thymian',
    category: 'Kräuter',
    synonyms: ['thymian', 'thyme', 'thymus vulgaris', 'thymi herba', 'thymiankraut', 'thymiantee'],
    unit: 'mg',
    what: 'Kraut des Thymians (Thymi herba); eines der etablierten pflanzlichen Hustenmittel in Europa.',
    useCases: [
      { topic: 'Husten', note: 'EMA-Monographie: als schleimlösendes Mittel bei produktivem Husten im Rahmen einer Erkältung.' },
      { topic: 'Mund und Rachen', note: 'Traditionell als Spülung oder Gurgellösung bei leichten Entzündungen im Mund- und Rachenraum.' },
    ],
    forms: [
      { name: 'Tee/Aufguss', note: 'Klassische Anwendungsform des Krauts.' },
      { name: 'Extrakt/Saft', note: 'Flüssige Zubereitungen, oft kombiniert mit Efeu oder Primelwurzel.' },
    ],
    fatSoluble: false,
    cautionNote: 'Bei Allergie gegen Lippenblütler nicht anwenden. Hält Husten länger als eine Woche an oder kommen Fieber und Atemnot dazu, gehört das in ärztliche Abklärung.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Thymus vulgaris L., herba', url: 'https://www.ema.europa.eu/en/medicines/herbal/thymi-herba' },
    ],
  },
  {
    id: 'feverfew',
    name: 'Mutterkraut',
    category: 'Kräuter',
    synonyms: ['mutterkraut', 'feverfew', 'tanacetum parthenium', 'tanaceti parthenii herba', 'falsche kamille'],
    unit: 'mg',
    what: 'Kraut des Mutterkrauts (Tanaceti parthenii herba); traditionell zur Vorbeugung von Migräne eingesetzt.',
    useCases: [
      { topic: 'Migräne', note: 'Traditionell zur Prophylaxe von Migräne eingesetzt; die Anwendung ist vorbeugend und ersetzt keine ärztliche Abklärung der Kopfschmerzursache.' },
    ],
    forms: [
      { name: 'Pulver', note: 'Getrocknetes, gemahlenes Kraut in Kapseln; auf diese Form bezieht sich die Monographie.' },
      { name: 'Extrakt', note: 'Standardisierte Zubereitungen, meist auf Parthenolid bezogen.' },
    ],
    fatSoluble: false,
    cautionNote: 'Bei Allergie gegen Korbblütler nicht anwenden. Nicht in Schwangerschaft und Stillzeit. Nach längerer Einnahme wird über Beschwerden beim abrupten Absetzen berichtet; eher ausschleichen. Wer gerinnungshemmende Medikamente nimmt, bespricht die Einnahme ärztlich.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Tanacetum parthenium, herba', url: 'https://www.ema.europa.eu/en/medicines/herbal/tanaceti-parthenii-herba' },
    ],
  },
  {
    id: 'marshmallow-root',
    name: 'Eibischwurzel',
    category: 'Kräuter',
    synonyms: ['eibisch', 'eibischwurzel', 'marshmallow root', 'althaea officinalis', 'althaeae radix', 'echter eibisch'],
    unit: 'mg',
    what: 'Wurzel des Echten Eibischs (Althaeae radix); die Schleimstoffe werden traditionell bei Reizhusten und gereizter Magenschleimhaut eingesetzt.',
    useCases: [
      { topic: 'Reizhusten', note: 'Traditionell bei trockenem Reizhusten; die Schleimstoffe legen sich beruhigend auf die gereizte Schleimhaut.' },
      { topic: 'Magenbeschwerden', note: 'Traditionell bei leichten Beschwerden mit gereizter Magenschleimhaut.' },
    ],
    forms: [
      { name: 'Kaltauszug/Tee', note: 'Schleimstoffe lösen sich am besten im Kaltansatz.' },
      { name: 'Sirup/Lutschpastillen', note: 'Übliche Fertigformen bei Reizhusten.' },
    ],
    fatSoluble: false,
    cautionNote: 'Die Schleimstoffe können die Aufnahme anderer Medikamente verzögern; zwischen Eibisch und anderen Arzneimitteln 30 bis 60 Minuten Abstand halten.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Althaea officinalis L., radix', url: 'https://www.ema.europa.eu/en/medicines/herbal/althaeae-radix' },
    ],
  },
  {
    id: 'uva-ursi',
    name: 'Bärentraube',
    category: 'Kräuter',
    synonyms: ['bärentraube', 'baerentraube', 'uva ursi', 'arctostaphylos uva-ursi', 'bärentraubenblätter', 'uvae ursi folium'],
    unit: 'mg',
    what: 'Blätter der Echten Bärentraube (Uvae ursi folium); traditionell bei leichten wiederkehrenden Beschwerden der unteren Harnwege eingesetzt.',
    useCases: [
      { topic: 'Harnwege', note: 'Traditionell bei leichten wiederkehrenden Beschwerden der unteren Harnwege bei Frauen, nachdem ernste Ursachen ärztlich ausgeschlossen wurden.' },
    ],
    forms: [
      { name: 'Trockenextrakt', note: 'Übliche Form in Tabletten oder Kapseln.' },
      { name: 'Tee/Aufguss', note: 'Traditionelle Anwendungsform der Blätter.' },
    ],
    fatSoluble: false,
    cautionNote: 'Nur kurzzeitig anwenden (die EMA nennt maximal eine Woche) und nicht häufiger als fünfmal im Jahr. Nicht für Kinder, Schwangerschaft oder Stillzeit. Bei Fieber, Flankenschmerz oder Blut im Urin sofort ärztlich abklären, das spricht für eine ernstere Infektion.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Arctostaphylos uva-ursi, folium', url: 'https://www.ema.europa.eu/en/medicines/herbal/uvae-ursi-folium' },
    ],
  },
  {
    id: 'willow-bark',
    name: 'Weidenrinde',
    category: 'Kräuter',
    synonyms: ['weidenrinde', 'willow bark', 'salix', 'salicis cortex', 'silberweide', 'weidenrindenextrakt'],
    unit: 'mg',
    what: 'Rinde der Weide (Salicis cortex); enthält Salicin, eine Vorstufe der Salicylsäure, und wird bei Schmerzen des Bewegungsapparats eingesetzt.',
    useCases: [
      { topic: 'Rückenschmerzen', note: 'EMA-Monographie: kurzzeitige Anwendung bei Kreuzschmerzen.' },
      { topic: 'Gelenkbeschwerden', note: 'Traditionell bei leichten Gelenkschmerzen.' },
      { topic: 'Erkältungsbeschwerden', note: 'Traditionell bei Fieber- und Kopfschmerzbeschwerden im Rahmen einer Erkältung.' },
    ],
    forms: [
      { name: 'Trockenextrakt', note: 'Standardisiert auf Salicin; übliche Form in Tabletten.' },
      { name: 'Tee/Aufguss', note: 'Traditionelle Anwendungsform der Rinde.' },
    ],
    fatSoluble: false,
    cautionNote: 'Nicht bei Salicylat-Unverträglichkeit oder Asthma durch Schmerzmittel (ASS). Nicht für Kinder und Jugendliche mit fieberhaften Infekten. Nicht im letzten Schwangerschaftsdrittel. Wer gerinnungshemmende Medikamente nimmt, bespricht die Einnahme ärztlich.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Salix, cortex', url: 'https://www.ema.europa.eu/en/medicines/herbal/salicis-cortex' },
    ],
  },
  {
    id: 'goldenrod',
    name: 'Goldrute',
    category: 'Kräuter',
    synonyms: ['goldrute', 'goldenrod', 'solidago virgaurea', 'goldrutenkraut', 'solidaginis virgaureae herba', 'echte goldrute'],
    unit: 'mg',
    what: 'Kraut der Echten Goldrute (Solidaginis virgaureae herba); traditionell zur Durchspülung der Harnwege eingesetzt.',
    useCases: [
      { topic: 'Harnwege', note: 'Traditionell zur Erhöhung der Harnmenge und Durchspülung bei leichten Beschwerden der Harnwege.' },
    ],
    forms: [
      { name: 'Tee/Aufguss', note: 'Klassische Anwendungsform des Krauts.' },
      { name: 'Extrakt', note: 'Flüssige oder feste Zubereitungen.' },
    ],
    fatSoluble: false,
    cautionNote: 'Zur Durchspülung ausreichend trinken. Nicht anwenden, wenn wegen einer Herz- oder Nierenerkrankung die Flüssigkeitszufuhr eingeschränkt ist. Bei Allergie gegen Korbblütler nicht anwenden.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Solidago virgaurea L., herba', url: 'https://www.ema.europa.eu/en/medicines/herbal/solidaginis-virgaureae-herba' },
    ],
  },
  {
    id: 'mullein',
    name: 'Königskerze',
    category: 'Kräuter',
    synonyms: ['königskerze', 'koenigskerze', 'mullein', 'verbascum', 'königskerzenblüten', 'verbasci flos', 'wollblume'],
    unit: 'mg',
    what: 'Blüten der Königskerze (Verbasci flos); traditionell bei Husten und Halsbeschwerden im Rahmen einer Erkältung eingesetzt.',
    useCases: [
      { topic: 'Husten', note: 'Traditionell bei Halsbeschwerden und Reizhusten im Rahmen einer Erkältung, klassisch als Bestandteil von Hustentees.' },
    ],
    forms: [
      { name: 'Tee/Aufguss', note: 'Klassische Anwendungsform der Blüten; vor dem Trinken gut abseihen (feine Härchen).' },
    ],
    fatSoluble: false,
    cautionNote: 'Für Schwangerschaft und Stillzeit fehlen ausreichende Daten. Hält Husten länger als eine Woche an, gehört das in ärztliche Abklärung.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Verbascum, flos', url: 'https://www.ema.europa.eu/en/medicines/herbal/verbasci-flos' },
    ],
  },
  {
    id: 'motherwort',
    name: 'Herzgespann',
    category: 'Kräuter',
    synonyms: ['herzgespann', 'motherwort', 'leonurus cardiaca', 'herzgespannkraut', 'leonuri cardiacae herba'],
    unit: 'mg',
    what: 'Kraut des Herzgespanns (Leonuri cardiacae herba); traditionell bei nervösen Herzbeschwerden eingesetzt, ähnlich dem Weißdorn.',
    useCases: [
      { topic: 'Nervöse Herzbeschwerden', note: 'Traditionell bei vorübergehenden nervösen Herzbeschwerden, nachdem ernste Ursachen ärztlich ausgeschlossen wurden.' },
      { topic: 'Unruhe', note: 'Traditionell bei leichten Symptomen von Stress und innerer Unruhe.' },
    ],
    forms: [
      { name: 'Tee/Aufguss', note: 'Klassische Anwendungsform des Krauts.' },
      { name: 'Extrakt', note: 'Flüssige oder feste Zubereitungen, auch in Kombinationspräparaten.' },
    ],
    fatSoluble: false,
    cautionNote: 'Herzbeschwerden gehören grundsätzlich in ärztliche Abklärung. Nicht in Schwangerschaft und Stillzeit anwenden. Für Kinder unter 12 Jahren fehlen Daten.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Leonurus cardiaca L., herba', url: 'https://www.ema.europa.eu/en/medicines/herbal/leonuri-cardiacae-herba' },
    ],
  },
  {
    id: 'calendula',
    name: 'Ringelblume',
    category: 'Kräuter',
    synonyms: ['ringelblume', 'calendula', 'calendula officinalis', 'ringelblumenblüten', 'calendulae flos'],
    unit: 'mg',
    what: 'Blüten der Ringelblume (Calendulae flos); traditionell vor allem äußerlich bei Haut- und Schleimhautreizungen eingesetzt.',
    useCases: [
      { topic: 'Haut', note: 'Traditionell äußerlich bei leichten Hautentzündungen und zur Unterstützung der Abheilung kleiner oberflächlicher Wunden.' },
      { topic: 'Mund und Rachen', note: 'Traditionell als Spülung bei leichten Entzündungen der Mund- und Rachenschleimhaut.' },
    ],
    forms: [
      { name: 'Salbe/Creme', note: 'Häufigste äußerliche Anwendungsform.' },
      { name: 'Tee/Aufguss', note: 'Für Spülungen und Umschläge.' },
    ],
    fatSoluble: false,
    cautionNote: 'Bei Allergie gegen Korbblütler nicht anwenden. Die Monographie bezieht sich auf die äußerliche Anwendung und Spülungen.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Calendula officinalis L., flos', url: 'https://www.ema.europa.eu/en/medicines/herbal/calendulae-flos' },
    ],
  },
  {
    id: 'arnica',
    name: 'Arnika',
    category: 'Kräuter',
    synonyms: ['arnika', 'arnica', 'arnica montana', 'arnikablüten', 'arnicae flos', 'bergwohlverleih'],
    unit: 'mg',
    what: 'Blüten der Arnika (Arnicae flos); ausschließlich zur äußerlichen Anwendung bei stumpfen Verletzungen dokumentiert.',
    useCases: [
      { topic: 'Stumpfe Verletzungen', note: 'Traditionell äußerlich bei Prellungen, Verstauchungen und lokalen Muskelschmerzen (Gel, Salbe, verdünnte Umschläge).' },
    ],
    forms: [
      { name: 'Gel/Salbe', note: 'Übliche äußerliche Anwendungsform.' },
      { name: 'Tinktur verdünnt', note: 'Nur verdünnt für Umschläge; unverdünnt reizt sie die Haut.' },
    ],
    fatSoluble: false,
    cautionNote: 'AUSSCHLIESSLICH äußerlich anwenden: Eingenommene Arnika ist giftig (Herzrhythmusstörungen, Magen-Darm-Beschwerden). Nicht auf offene Wunden oder geschädigte Haut auftragen. Bei Allergie gegen Korbblütler nicht anwenden.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Arnica montana L., flos', url: 'https://www.ema.europa.eu/en/medicines/herbal/arnicae-flos' },
    ],
  },
  {
    id: 'meadowsweet',
    name: 'Mädesüß',
    category: 'Kräuter',
    synonyms: ['mädesüß', 'maedesuess', 'meadowsweet', 'filipendula ulmaria', 'mädesüßkraut', 'filipendulae ulmariae herba'],
    unit: 'mg',
    what: 'Kraut des Echten Mädesüß (Filipendulae ulmariae herba); enthält Salicylate und wird traditionell bei Erkältungsbeschwerden eingesetzt.',
    useCases: [
      { topic: 'Erkältungsbeschwerden', note: 'Traditionell zur unterstützenden Anwendung bei Erkältungen eingesetzt.' },
      { topic: 'Leichte Schmerzen', note: 'Traditionell bei leichten Gelenkschmerzen, verwandt mit der Weidenrinde (Salicylate).' },
    ],
    forms: [
      { name: 'Tee/Aufguss', note: 'Klassische Anwendungsform des Krauts.' },
      { name: 'Extrakt', note: 'Flüssige oder feste Zubereitungen.' },
    ],
    fatSoluble: false,
    cautionNote: 'Enthält Salicylate: nicht bei Salicylat-Unverträglichkeit oder ASS-Allergie, nicht für Kinder und Jugendliche mit fieberhaften Infekten. Für Schwangerschaft und Stillzeit fehlen ausreichende Daten.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Filipendula ulmaria, herba', url: 'https://www.ema.europa.eu/en/medicines/herbal/filipendulae-ulmariae-herba' },
    ],
  },
  {
    id: 'horse-chestnut',
    name: 'Rosskastanie',
    category: 'Kräuter',
    synonyms: ['rosskastanie', 'horse chestnut', 'aesculus hippocastanum', 'rosskastaniensamen', 'hippocastani semen', 'aescin'],
    unit: 'mg',
    what: 'Samen der Rosskastanie (Hippocastani semen); der Extrakt mit dem Wirkstoffkomplex Aescin wird bei Venenbeschwerden eingesetzt.',
    useCases: [
      { topic: 'Venen', note: 'EMA-Monographie (Well-established Use): Extrakt bei chronischer Venenschwäche mit schweren Beinen, Schwellungen und nächtlichen Wadenkrämpfen.' },
    ],
    forms: [
      { name: 'Trockenextrakt', aka: ['standardisiert auf Aescin'], note: 'Auf diese Form bezieht sich der Well-established Use; rohe Samen sind ungenießbar.' },
      { name: 'Gel äußerlich', note: 'Traditionelle äußerliche Anwendung bei müden, schweren Beinen.' },
    ],
    fatSoluble: false,
    cautionNote: 'Rohe Samen, Blätter und Rinde nicht einnehmen. Bei plötzlicher einseitiger Beinschwellung, Hautverfärbung oder Schmerz sofort ärztlich abklären (Thromboseverdacht). Für Schwangerschaft und Stillzeit sowie bei Nieren- oder Lebererkrankungen ärztlich abklären.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Aesculus hippocastanum L., semen', url: 'https://www.ema.europa.eu/en/medicines/herbal/hippocastani-semen' },
    ],
  },
  {
    id: 'birch-leaf',
    name: 'Birkenblätter',
    category: 'Kräuter',
    synonyms: ['birkenblätter', 'birke', 'birch leaf', 'betula', 'betulae folium', 'birkenblättertee'],
    unit: 'mg',
    what: 'Blätter der Birke (Betulae folium); traditionell zur Durchspülung der Harnwege eingesetzt.',
    useCases: [
      { topic: 'Harnwege', note: 'Traditionell zur Erhöhung der Harnmenge und Durchspülung bei leichten Beschwerden der Harnwege.' },
    ],
    forms: [
      { name: 'Tee/Aufguss', note: 'Klassische Anwendungsform der Blätter.' },
      { name: 'Extrakt', note: 'Flüssige oder feste Zubereitungen.' },
    ],
    fatSoluble: false,
    cautionNote: 'Zur Durchspülung ausreichend trinken. Nicht anwenden, wenn wegen einer Herz- oder Nierenerkrankung die Flüssigkeitszufuhr eingeschränkt ist. Bei Allergie gegen Birkenpollen kann es zu Reaktionen kommen.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Betula, folium', url: 'https://www.ema.europa.eu/en/medicines/herbal/betulae-folium' },
    ],
  },
  {
    id: 'horsetail',
    name: 'Ackerschachtelhalm',
    category: 'Kräuter',
    synonyms: ['ackerschachtelhalm', 'schachtelhalm', 'horsetail', 'equisetum arvense', 'zinnkraut', 'equiseti herba'],
    unit: 'mg',
    what: 'Kraut des Ackerschachtelhalms (Equiseti herba, Zinnkraut); traditionell zur Durchspülung der Harnwege eingesetzt, enthält viel Silicium.',
    useCases: [
      { topic: 'Harnwege', note: 'Traditionell zur Erhöhung der Harnmenge und Durchspülung bei leichten Beschwerden der Harnwege.' },
      { topic: 'Haut, Haare, Nägel', note: 'Wird wegen des Siliciumgehalts in diesem Zusammenhang vermarktet; die Datenlage dazu ist begrenzt.' },
    ],
    forms: [
      { name: 'Tee/Abkochung', note: 'Klassische Anwendungsform; die Kieselsäure löst sich besser beim Abkochen.' },
      { name: 'Extrakt', note: 'Flüssige oder feste Zubereitungen.' },
    ],
    fatSoluble: false,
    cautionNote: 'Verwechslungsgefahr beim Selbstsammeln mit dem giftigen Sumpfschachtelhalm; auf geprüfte Apotheken- oder Herstellerware achten. Zur Durchspülung ausreichend trinken; nicht bei eingeschränkter Flüssigkeitszufuhr wegen Herz- oder Nierenerkrankung.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Equisetum arvense L., herba', url: 'https://www.ema.europa.eu/en/medicines/herbal/equiseti-herba' },
    ],
  },
  {
    id: 'wormwood',
    name: 'Wermut',
    category: 'Kräuter',
    synonyms: ['wermut', 'wormwood', 'artemisia absinthium', 'wermutkraut', 'absinthii herba'],
    unit: 'mg',
    what: 'Kraut des Wermuts (Absinthii herba); traditionelles Bittermittel bei Appetitlosigkeit und Verdauungsbeschwerden.',
    useCases: [
      { topic: 'Appetitlosigkeit', note: 'Traditionell als Bittermittel bei vorübergehender Appetitlosigkeit.' },
      { topic: 'Verdauungsbeschwerden', note: 'Traditionell bei leichten Verdauungsbeschwerden wie Völlegefühl und Blähungen.' },
    ],
    forms: [
      { name: 'Tee/Aufguss', note: 'Klassische, sehr bittere Anwendungsform.' },
      { name: 'Tinktur/Extrakt', note: 'Flüssige Bitterstoff-Zubereitungen.' },
    ],
    fatSoluble: false,
    cautionNote: 'Wermut enthält Thujon: nur zeitlich begrenzt und in üblicher Dosierung anwenden, die EMA nennt Anwendungsgrenzen von etwa 2 Wochen. Nicht in Schwangerschaft und Stillzeit. Nicht bei Gallenwegsverschluss oder Magen-Darm-Geschwüren.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Artemisia absinthium L., herba', url: 'https://www.ema.europa.eu/en/medicines/herbal/absinthii-herba' },
    ],
  },
  {
    id: 'burdock-root',
    name: 'Klettenwurzel',
    category: 'Kräuter',
    synonyms: ['klettenwurzel', 'klette', 'burdock', 'arctium lappa', 'arctii radix', 'klettenwurzelöl'],
    unit: 'mg',
    what: 'Wurzel der Großen Klette (Arctii radix); traditionell zur Durchspülung der Harnwege und bei Hautbeschwerden eingesetzt.',
    useCases: [
      { topic: 'Harnwege', note: 'Traditionell zur Erhöhung der Harnmenge im Rahmen einer Durchspülung.' },
      { topic: 'Haut', note: 'Traditionell unterstützend bei leichten seborrhoischen Hautzuständen; als Öl-Auszug auch äußerlich für die Kopfhaut.' },
    ],
    forms: [
      { name: 'Tee/Abkochung', note: 'Klassische Anwendungsform der Wurzel.' },
      { name: 'Öl-Auszug äußerlich', note: 'Traditionelles Klettenwurzelöl für Haut und Kopfhaut.' },
    ],
    fatSoluble: false,
    cautionNote: 'Bei Allergie gegen Korbblütler nicht anwenden. Zur Durchspülung ausreichend trinken. Für Schwangerschaft und Stillzeit fehlen ausreichende Daten.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Arctium lappa L., radix', url: 'https://www.ema.europa.eu/en/medicines/herbal/arctii-radix' },
    ],
  },
  {
    id: 'lovage-root',
    name: 'Liebstöckel',
    category: 'Kräuter',
    synonyms: ['liebstöckel', 'liebstoeckel', 'lovage', 'levisticum officinale', 'liebstöckelwurzel', 'levistici radix', 'maggikraut'],
    unit: 'mg',
    what: 'Wurzel des Liebstöckels (Levistici radix); traditionell zur Durchspülung der Harnwege eingesetzt.',
    useCases: [
      { topic: 'Harnwege', note: 'Traditionell zur Erhöhung der Harnmenge und Durchspülung bei leichten Beschwerden der Harnwege; Bestandteil bekannter Kombinationspräparate.' },
    ],
    forms: [
      { name: 'Tee/Aufguss', note: 'Klassische Anwendungsform der Wurzel.' },
      { name: 'Extrakt', note: 'Auch in festen Kombinationen mit Rosmarin und Tausendgüldenkraut.' },
    ],
    fatSoluble: false,
    cautionNote: 'Zur Durchspülung ausreichend trinken; nicht bei eingeschränkter Flüssigkeitszufuhr wegen Herz- oder Nierenerkrankung. Bei akuten Harnwegsentzündungen mit Fieber gehört die Behandlung in ärztliche Hand. Für Schwangerschaft und Stillzeit fehlen ausreichende Daten.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Levisticum officinale, radix', url: 'https://www.ema.europa.eu/en/medicines/herbal/levistici-radix' },
    ],
  },
  {
    id: 'nettle-leaf',
    name: 'Brennnesselblätter',
    category: 'Kräuter',
    synonyms: ['brennnesselblätter', 'brennnessel', 'nettle leaf', 'urtica dioica', 'urticae folium', 'brennnesseltee', 'brennnesselkraut'],
    unit: 'mg',
    what: 'Blätter und Kraut der Brennnessel (Urticae folium/herba); traditionell zur Durchspülung der Harnwege und bei leichten Gelenkbeschwerden eingesetzt. Nicht zu verwechseln mit der Brennnesselwurzel, die bei Prostatabeschwerden dokumentiert ist.',
    useCases: [
      { topic: 'Harnwege', note: 'Traditionell zur Erhöhung der Harnmenge und Durchspülung bei leichten Beschwerden der Harnwege.' },
      { topic: 'Gelenkbeschwerden', note: 'Traditionell unterstützend bei leichten Gelenkbeschwerden.' },
    ],
    forms: [
      { name: 'Tee/Aufguss', note: 'Klassische Anwendungsform der Blätter.' },
      { name: 'Extrakt/Frischpflanzensaft', note: 'Flüssige oder feste Zubereitungen.' },
    ],
    fatSoluble: false,
    cautionNote: 'Zur Durchspülung ausreichend trinken; nicht bei eingeschränkter Flüssigkeitszufuhr wegen Herz- oder Nierenerkrankung. Für Schwangerschaft und Stillzeit fehlen ausreichende Daten.',
    sources: [
      { label: 'EMA/HMPC: European Union herbal monograph on Urtica, folium', url: 'https://www.ema.europa.eu/en/medicines/herbal/urticae-folium' },
      { label: 'EMA/HMPC: European Union herbal monograph on Urtica, herba', url: 'https://www.ema.europa.eu/en/medicines/herbal/urticae-herba' },
    ],
  },
  {
    id: 'sodium',
    name: 'Natrium',
    category: 'Mineralien',
    synonyms: ['natrium', 'sodium', 'natriumchlorid', 'natriumcitrat', 'kochsalz', 'nacl'],
    unit: 'mg',
    what: 'Mengenelement und wichtigster Elektrolyt des Extrazellulaerraums; reguliert Fluessigkeitshaushalt, Blutdruck und Nervenreizleitung. In Supplements vor allem in Elektrolyt-Mischungen enthalten.',
    useCases: [
      { topic: 'Elektrolythaushalt', note: 'Bestandteil von Elektrolyt-Praeparaten, die bei starkem Schwitzen, Sport oder Fluessigkeitsverlust eingesetzt werden.' },
      { topic: 'Sport', note: 'Wird bei langen Ausdauerbelastungen mit hohem Schweissverlust ergaenzt.' },
    ],
    forms: [
      { name: 'Chlorid', aka: ['Kochsalz', 'NaCl'], note: 'Haeufigste Form in Elektrolyt-Mischungen.' },
      { name: 'Citrat', note: 'In Brausetabletten und Sport-Getraenkepulvern verbreitet.' },
    ],
    fatSoluble: false,
    cautionNote: 'Die uebliche Ernaehrung liefert bereits deutlich mehr Natrium, als die Referenzwerte vorsehen; zusaetzliche Zufuhr ist ausserhalb von Sport- und Verlustsituationen selten sinnvoll. Wer wegen Bluthochdruck, Herz- oder Nierenerkrankung Natrium einschraenken soll, bespricht Elektrolyt-Praeparate aerztlich.',
    sources: [
      { label: 'NIH ODS: Sodium (Dietary Reference Intakes)', url: 'https://ods.od.nih.gov/factsheets/list-all/' },
      { label: 'D-A-CH Referenzwerte: Natrium', url: 'https://www.dge.de/wissenschaft/referenzwerte/natrium/' },
    ],
  },
];

// Schneller Zugriff per ID
export const substanceById = new Map(substances.map((s) => [s.id, s]));

export function getSubstance(id) {
  return substanceById.get(id) ?? null;
}
