/**
 * data/en/substances.js
 * ─────────────────────────────────────────────────────────────
 * Englisches Text-Overlay zur Wirkstoff-Datenbank (data/substances.js).
 * Deutsch bleibt die kanonische Quelle. Dieses Modul enthaelt NUR die
 * freien Textfelder, keyed nach der Substanz-ID aus data/substances.js.
 * Es ist bewusst noch NICHT in ReferenceCheck.js / SubstanceMatcher.js
 * verdrahtet: reines Datenmodul, keine Aenderung an der Laufzeit-Logik.
 *
 * NICHT enthalten (bleiben deutsch bzw. unveraendert, siehe substances.js):
 *   - id, name, synonyms, category, unit     Fachbegriffe/IDs, keine Freitexte
 *   - sources                                Literaturzitate, wie publiziert
 *   - forms[].name, forms[].aka,
 *     forms[].bioavailability                chemische Fachbegriffe bzw. Enum
 *   - fatSoluble, isAbsorptionBlocker,
 *     unitConversion.factorToIE              Booleans/Zahlen, keine Freitexte
 *
 * Struktur je Substanz-ID (nur die Felder, die im DE-Original vorkommen):
 *   what             string. 1:1-Uebersetzung von substances[i].what.
 *   cautionNote      string. Nur vorhanden, wenn das DE-Original ein
 *                    cautionNote-Feld hat (bei 119 der 126 Substanzen).
 *   useCases         Array von { topic, note }, GLEICHE Laenge und
 *                    Reihenfolge wie substances[i].useCases. topic ist
 *                    die kurze UI-Ueberschrift (wenige Worte, wird in
 *                    SubstanceInsightCard.jsx direkt als Label gerendert),
 *                    note der erklaerende Satz.
 *   forms            Objekt, keyed nach dem EXAKTEN DE forms[].name-String
 *                    aus substances.js (unveraendert als Schluessel, da
 *                    Fachbegriff/Lookup-Key). Wert ist NUR der uebersetzte
 *                    note-Text der jeweiligen Form, als reiner String
 *                    (kein verschachteltes Objekt). Formen ohne note-Text
 *                    im DE-Original (z. B. chlorella "Pulver",
 *                    grape-seed-extract) fehlen entsprechend auch hier.
 *   unitConversion   { note: string }. Kommt in der gesamten Datenbank nur
 *                    bei vitamin-d3 vor.
 *
 * Uebersetzungsregeln (compliance-kritisch, siehe CLAUDE.md):
 *   - Strikt deskriptiv: "wird eingesetzt bei" -> "is used for". Niemals
 *     "helps with", "treats", "cures", "boosts", "improves", "heals",
 *     "recommended" als Wirkversprechen. Keine Zusicherungen, keine
 *     Imperative, keine direkte Ansprache ("you should").
 *   - cautionNote vollstaendig und unveraendert in der Aussage uebertragen:
 *     nichts abgeschwaecht, nichts hinzugedichtet.
 *   - Kein Gedankenstrich ("—") im EN-Text: Doppelpunkt, Komma oder Punkt
 *     statt dessen (gleiche Regel wie im DE-Original).
 *   - NICHT uebersetzt: sources, Synonyme/Fachbegriffe, Zahlen/Einheiten,
 *     IDs, chemische Formeln.
 *
 * Testabdeckung: tests/substances-en.test.mjs prueft Vollstaendigkeit
 * (jede Substanz-ID, jedes vorhandene Freitextfeld, gleiche useCases-Laenge),
 * das Verbotswoerter-Verzeichnis und die Gedankenstrich-Freiheit.
 */
export default {
  magnesium: {
    what: 'Mineral involved in more than 300 enzymatic reactions in the body, including energy and muscle metabolism.',
    useCases: [
      { topic: 'Muscle cramps', note: 'Most common use case; is used for nocturnal calf cramps and cramps after exercise.' },
      { topic: 'Sleep and relaxation', note: 'Is used in the evening to support falling and staying asleep.' },
      { topic: 'Nerves and stress load', note: 'Demand increases under higher physical or mental strain.' },
      { topic: 'Migraine', note: 'Is used prophylactically; evidence exists but is mixed.' },
      { topic: 'Constipation', note: 'Osmotically active forms (citrate, oxide) are also used as laxatives.' },
    ],
    forms: {
      'Bisglycinat': 'Very well tolerated, barely laxative. Preferred form for evening intake and sleep.',
      'Citrat': 'Well absorbed, laxative at higher doses. Often used for acute cramps.',
      'Malat': 'Is used in connection with energy metabolism and fatigue.',
      'L-Threonat': 'Marketed specifically for cognitive applications; human data still limited.',
      'Oxid': 'High magnesium content per gram, but low absorption rate. Distinctly laxative.',
      'Carbonat': 'Also acts as an acid buffer in the stomach.',
    },
  },
  calcium: {
    what: 'Macromineral and main component of bones and teeth; also involved in muscle contraction and nerve conduction.',
    useCases: [
      { topic: 'Bone health', note: 'Central use case, especially with increased demand in old age and after menopause.' },
      { topic: 'Growth', note: 'Increased demand during childhood and adolescence during bone formation.' },
      { topic: 'Low dairy intake', note: 'Is supplemented with dairy-free or vegan diets.' },
    ],
    forms: {
      'Citrat': 'Also well available with low stomach acid, independent of meals.',
      'Carbonat': 'High calcium content, but requires stomach acid; absorption is better with food.',
      'Gluconat': 'Low calcium content per gram, correspondingly larger amounts needed.',
    },
  },
  iron: {
    what: 'Trace element, component of hemoglobin and therefore central to oxygen transport in the blood.',
    useCases: [
      { topic: 'Iron deficiency and deficiency anemia', note: 'Main use case. Should be clarified via blood values (ferritin, hemoglobin).' },
      { topic: 'Heavy menstrual bleeding', note: 'Increased loss is a common reason for lowered stores.' },
      { topic: 'Pregnancy', note: 'Significantly increased demand; medical supervision is common.' },
      { topic: 'Vegetarian and vegan diets', note: 'Plant-based iron is absorbed less well than heme iron from meat.' },
    ],
    forms: {
      'Bisglycinat': 'Considerably gentler on the stomach than sulfate, lower rate of side effects.',
      'Sulfat': 'Standard form in medications, often causes gastrointestinal complaints.',
      'Fumarat': 'High iron content per gram.',
      'Gluconat': 'Better tolerated, lower iron content.',
    },
    cautionNote: 'Iron should not be supplemented without a confirmed deficiency: excess iron is stored and is not easily excreted.',
  },
  zinc: {
    what: 'Trace element, cofactor in more than 300 enzymes; involved in immune function, wound repair, skin, and hormone metabolism.',
    useCases: [
      { topic: 'Immune function', note: 'Frequently used for susceptibility to infections and alongside colds.' },
      { topic: 'Skin and acne', note: 'Classic use case for inflammatory skin conditions.' },
      { topic: 'Hair and nails', note: 'Is used for hair loss and brittle nails.' },
      { topic: 'Wound repair', note: 'Increased demand during tissue repair processes.' },
    ],
    forms: {
      'Bisglycinat': 'Well tolerated, even on an empty stomach.',
      'Picolinat': 'Well absorbed, commonly found in dietary supplements.',
      'Citrat': 'Well available, neutral taste.',
      'Gluconat': 'Common form in lozenges.',
      'Oxid': 'Requires stomach acid, absorbed less well.',
    },
    cautionNote: 'Sustained high zinc intake can impair copper absorption.',
  },
  selenium: {
    what: 'Trace element, component of antioxidant enzymes (glutathione peroxidases) and important for thyroid hormone metabolism.',
    useCases: [
      { topic: 'Thyroid', note: "Is used for Hashimoto's thyroiditis and thyroid function disorders." },
      { topic: 'Oxidative stress', note: 'Involved in cellular protection against free radicals.' },
      { topic: 'Immune function', note: 'Selenium deficiency is associated with reduced immune response.' },
    ],
    forms: {
      'L-Selenomethionin': 'Organic form, well absorbed and storable.',
      'Natriumselenit': 'Inorganic form; is not incorporated into proteins.',
    },
    cautionNote: 'The margin between requirement and upper limit is narrow for selenium; amounts should be checked carefully.',
  },
  iodine: {
    what: 'Trace element and indispensable building block of the thyroid hormones T3 and T4.',
    useCases: [
      { topic: 'Thyroid function', note: 'Central role in hormone formation; Germany is considered an area with mild iodine undersupply.' },
      { topic: 'Pregnancy and breastfeeding', note: "Significantly increased demand for the child's development." },
    ],
    forms: {
      'Kaliumiodid': 'Standard form in supplements and iodized salt.',
      'Algenpulver (z. B. Kelp)': 'Iodine content varies widely and can be very high; the stated amount needs careful checking.',
    },
    cautionNote: 'For thyroid disorders, iodine intake should be clarified medically.',
  },
  potassium: {
    what: 'Macromineral, central to intracellular pressure, nerve conduction, and heart rhythm.',
    useCases: [
      { topic: 'Blood pressure', note: 'Sufficient potassium intake is associated with more favorable blood pressure values.' },
      { topic: 'Muscle function and cramps', note: 'Is considered alongside magnesium for cramps.' },
      { topic: 'Increased losses', note: 'With heavy sweating or diuretic medication.' },
    ],
    forms: {
      'Citrat': 'Well tolerated, alkalizing effect.',
      'Chlorid': 'Common form for offsetting losses.',
    },
    cautionNote: 'For impaired kidney function or blood-pressure-lowering medication, potassium should be clarified medically.',
  },
  'vitamin-d3': {
    what: 'Fat-soluble vitamin and hormone precursor; is formed in the skin through sunlight and regulates calcium absorption, among other functions.',
    useCases: [
      { topic: 'Bone metabolism', note: 'Enables calcium absorption from the intestine; deficiency leads to bone weakness.' },
      { topic: 'Immune function', note: 'Most common use case in the winter months.' },
      { topic: 'Low sun exposure', note: "At DACH latitudes, the body's own production is barely possible from October to March." },
      { topic: 'Muscle function and fall prevention', note: 'Is used in older adults in this context.' },
    ],
    forms: {
      'D3 (Cholecalciferol)': 'Of animal or lichen origin; raises blood levels more effectively than D2.',
      'D2 (Ergocalciferol)': 'Plant-based (yeast/mushrooms), shorter duration of action.',
    },
    unitConversion: { note: '1 µg vitamin D corresponds to 40 IU.' },
    cautionNote: 'Fat-soluble and storable: sustained high doses without blood value monitoring are not advisable.',
  },
  'vitamin-k2': {
    what: 'Fat-soluble vitamin, activates proteins for blood clotting and for incorporating calcium into bone.',
    useCases: [
      { topic: 'Bone metabolism', note: 'Activates osteocalcin and is often used together with vitamin D.' },
      { topic: 'Vascular health', note: 'Activates matrix Gla protein, which counteracts calcium deposits in vessel walls.' },
    ],
    forms: {
      'MK-7 (all-trans)': "Long half-life, once daily is sufficient. The label should specify 'all-trans'.",
      'MK-4': 'Short half-life, requires multiple daily doses.',
      'K1 (Phyllochinon)': 'Primarily for blood clotting; from green leafy vegetables.',
    },
    cautionNote: 'When taking anticoagulants (coumarins/vitamin K antagonists), only after medical consultation.',
  },
  'vitamin-c': {
    what: 'Water-soluble vitamin with antioxidant activity, necessary for collagen formation.',
    useCases: [
      { topic: 'Immune function', note: 'Most common use case, especially during cold and flu season.' },
      { topic: 'Collagen, skin and connective tissue', note: 'Essential for collagen synthesis and therefore for skin, vessels, and wound repair.' },
      { topic: 'Iron absorption', note: 'Increases the absorption of plant-based iron significantly: taking them together is common.' },
      { topic: 'Oxidative stress', note: 'Is supplemented for smoking and increased strain.' },
    ],
    forms: {
      'Ascorbinsäure': 'Standard form, acidic. Can be irritating for a sensitive stomach.',
      'Calciumascorbat (Ester-C)': 'Buffered and gentler on the stomach, also contains calcium.',
      'Natriumascorbat': 'Buffered, contains sodium.',
      'Liposomal': 'Marketed with higher absorption; evidence is limited, notably more expensive.',
    },
    cautionNote: 'Very high single doses are mostly excreted and can cause diarrhea. Spread across several portions.',
  },
  'vitamin-b12': {
    what: 'Water-soluble vitamin, necessary for blood formation, nerve function, and homocysteine breakdown.',
    useCases: [
      { topic: 'Vegan and vegetarian diets', note: 'Most important use case: B12 occurs practically only in animal foods. Supplementation is necessary with a vegan diet.' },
      { topic: 'Nerve function', note: 'Deficiency can cause neurological complaints, some of which are irreversible.' },
      { topic: 'Older age', note: "Absorption capacity in the stomach decreases with age." },
      { topic: 'Stomach acid reducers and metformin', note: 'Long-term use can reduce B12 absorption.' },
    ],
    forms: {
      'Methylcobalamin': 'Directly active form, well storable.',
      'Adenosylcobalamin': 'Second active form, acts within mitochondria.',
      'Hydroxocobalamin': 'Very stable, good depot effect.',
      'Cyanocobalamin': 'Most stable and least expensive form, must be converted in the body.',
    },
  },
  folate: {
    what: 'Water-soluble B vitamin, necessary for cell division, blood formation, and neural tube development.',
    useCases: [
      { topic: 'Family planning and pregnancy', note: 'Most important use case: sufficient intake before and in early pregnancy lowers the risk of neural tube defects.' },
      { topic: 'Blood formation', note: 'Deficiency leads to megaloblastic anemia.' },
      { topic: 'Homocysteine', note: 'Works together with B12 and B6 in homocysteine breakdown.' },
    ],
    forms: {
      '5-MTHF (Methylfolat)': 'Directly active form, usable independent of MTHFR enzyme activity.',
      'Folsäure': 'Synthetic form, must be converted enzymatically; the form the study evidence is based on.',
    },
    cautionNote: 'High folate intake can mask a vitamin B12 deficiency: consider both together.',
  },
  'vitamin-b6': {
    what: 'Water-soluble B vitamin, cofactor in amino acid and neurotransmitter metabolism.',
    useCases: [
      { topic: 'Nerve and neurotransmitter metabolism', note: 'Necessary for the formation of serotonin, dopamine, and GABA.' },
      { topic: 'Premenstrual complaints', note: 'Classic use case for PMS.' },
      { topic: 'Pregnancy nausea', note: 'Is used in this context, usually under medical supervision.' },
    ],
    forms: {
      'Pyridoxal-5-Phosphat (P-5-P)': 'Directly active form, no conversion in the liver needed.',
      'Pyridoxin-HCl': 'Standard form, must be activated.',
    },
    cautionNote: 'Sustained high doses can cause nerve damage: the upper limit is particularly relevant for B6.',
  },
  'vitamin-a': {
    what: 'Fat-soluble vitamin, important for vision, skin, mucous membranes, and immune function.',
    useCases: [
      { topic: 'Vision', note: 'Component of the visual pigment; deficiency leads to night blindness.' },
      { topic: 'Skin and mucous membranes', note: 'Involved in cell renewal and barrier function.' },
    ],
    forms: {
      'Retinol / Retinylester': 'Preformed vitamin A, directly active and storable.',
      'Beta-Carotin': 'Provitamin, converted according to need: distinctly lower risk of overdose.',
    },
    cautionNote: 'In pregnancy, preformed vitamin A (retinol) should be avoided in higher doses. Beta-carotene is less critical in this respect.',
  },
  'vitamin-e': {
    what: 'Fat-soluble vitamin with antioxidant activity, protects cell membranes from fat oxidation.',
    useCases: [
      { topic: 'Cell protection', note: 'Protects polyunsaturated fatty acids in membranes from oxidation.' },
      { topic: 'Skin', note: 'Is used for dry skin and in combination with vitamin C.' },
    ],
    forms: {
      'd-alpha-Tocopherol': 'Natural form, roughly twice as active as the synthetic form.',
      'dl-alpha-Tocopherol': 'Synthetic, a mixture of eight stereoisomers.',
      'Gemischte Tocopherole': 'Closer to the natural occurrence in food.',
    },
    cautionNote: 'High doses can increase bleeding tendency: relevant with anticoagulants and before surgery.',
  },
  'omega-3': {
    what: 'Long-chain polyunsaturated fatty acids; building blocks of cell membranes and starting materials for inflammation-regulating messengers.',
    useCases: [
      { topic: 'Cardiovascular system', note: 'Best-studied use case; concerns triglyceride levels, among other things.' },
      { topic: 'Inflammatory processes', note: 'EPA is the starting material for inflammation-resolving mediators.' },
      { topic: 'Brain and eyesight', note: 'DHA is a structural component of the brain and retina: also relevant in pregnancy and breastfeeding.' },
      { topic: 'Dry eyes', note: 'Common use case.' },
    ],
    forms: {
      'Triglycerid (rTG/TG)': 'Natural or re-esterified form, well absorbed.',
      'Ethylester (EE)': 'Less expensive; absorption benefits notably from a high-fat meal.',
      'Phospholipid (Krill)': 'Good absorption, usually lower EPA/DHA amount per capsule.',
      'Algenöl': 'Vegan source of EPA and DHA.',
    },
    cautionNote: 'What matters is the EPA/DHA content, not the total oil amount per capsule. High doses can increase bleeding tendency.',
  },
  'l-tryptophan': {
    what: 'Essential amino acid and precursor of serotonin and melatonin.',
    useCases: [
      { topic: 'Sleep', note: 'Is used in the evening as a precursor for melatonin formation.' },
      { topic: 'Mood', note: 'Starting material for serotonin.' },
    ],
    forms: {
      'L-Tryptophan': 'Absorption into the brain is inhibited by other amino acids: best absorbed on an empty stomach or with carbohydrates.',
    },
    cautionNote: 'Do not combine with serotonergic medications (SSRIs, MAO inhibitors): risk of serotonin syndrome.',
  },
  '5-htp': {
    what: 'Direct intermediate between tryptophan and serotonin; obtained from Griffonia simplicifolia seeds.',
    useCases: [
      { topic: 'Mood', note: 'Acts closer to serotonin than tryptophan.' },
      { topic: 'Sleep', note: 'Is used in the evening.' },
    ],
    forms: {
      '5-HTP': 'Crosses the blood-brain barrier without transporter competition.',
    },
    cautionNote: 'Do not combine with serotonergic medications (SSRIs, MAO inhibitors, methylene blue): risk of serotonin syndrome.',
  },
  'l-tyrosine': {
    what: 'Amino acid and precursor of dopamine, norepinephrine, and epinephrine, as well as the thyroid hormones.',
    useCases: [
      { topic: 'Focus and strain', note: 'Is used for stress, sleep deprivation, and mental exertion.' },
      { topic: 'Thyroid', note: 'Building block of T3 and T4, together with iodine.' },
    ],
    forms: {
      'L-Tyrosin': 'Best absorbed on an empty stomach; competes with other large amino acids for transport into the brain.',
    },
  },
  'l-lysine': {
    what: 'Essential amino acid, involved in collagen formation and calcium utilization.',
    useCases: [
      { topic: 'Cold sores', note: 'Most common use case; used both preventively and during outbreaks.' },
      { topic: 'Collagen and connective tissue', note: 'Building block of collagen cross-linking.' },
    ],
    forms: {
      'L-Lysin (HCl)': 'Competes with L-arginine for the same transporters, so timing is best kept separate.',
    },
  },
  'l-arginine': {
    what: 'Semi-essential amino acid and starting material for nitric oxide, which dilates blood vessels.',
    useCases: [
      { topic: 'Circulation', note: 'Is used in sports contexts and for vascular function.' },
      { topic: 'Athletic performance', note: 'Common ingredient in pre-workout products.' },
    ],
    forms: {
      'L-Arginin': 'Partially broken down in the intestine.',
      'L-Citrullin': 'Converted to arginine in the kidney and raises arginine levels more effectively.',
    },
    cautionNote: 'For people prone to herpes outbreaks, arginine can be unfavorable (antagonist of lysine).',
  },
  coq10: {
    what: 'Fat-soluble substance in the mitochondria, central to cellular energy production and antioxidant activity.',
    useCases: [
      { topic: 'Energy and fatigue', note: 'Endogenous production declines with age.' },
      { topic: 'Statin use', note: 'Statins lower endogenous Q10 production: a common application area.' },
      { topic: 'Heart function', note: 'Heart muscle cells have a particularly high energy demand.' },
    ],
    forms: {
      'Ubiquinol': 'Reduced, directly usable form; preferred especially from middle age onward.',
      'Ubiquinon': 'Oxidized form, must be converted; cheaper and more stable.',
    },
  },
  creatine: {
    what: 'Endogenous substance that provides short-term energy (ATP) in muscle and brain. One of the most extensively studied supplements overall.',
    useCases: [
      { topic: 'Strength and muscle building', note: 'Well-documented application area for short, intense exertion.' },
      { topic: 'Cognition', note: 'Studied in relation to sleep deprivation and mental strain; vegetarian diets are also relevant, since creatine occurs mainly in meat.' },
      { topic: 'Muscle maintenance in older age', note: 'Used in combination with strength training.' },
    ],
    forms: {
      'Monohydrat': 'The studied standard form. More expensive variants show no proven advantage.',
    },
  },
  psyllium: {
    what: 'Soluble fiber that forms a gel in the intestine and binds water.',
    useCases: [
      { topic: 'Digestion', note: 'Used for both constipation and diarrhea, because it regulates stool volume.' },
      { topic: 'Cholesterol', note: 'Binds bile acids; well studied for soluble fiber.' },
      { topic: 'Satiety', note: 'Used in connection with weight management.' },
    ],
    forms: {
      'Schalen (ganz oder gemahlen)': 'Works physically in the intestine. Always take with plenty of fluid.',
    },
    cautionNote: 'Blocks the absorption of other active ingredients and medications: keep at least a 2 hour gap. Always take with plenty of water.',
  },
  probiotics: {
    what: 'Living microorganisms that influence the composition of the gut flora. Effect is strain-specific.',
    useCases: [
      { topic: 'After antibiotics', note: 'Most common application area for repopulating the gut flora.' },
      { topic: 'Irritable bowel', note: 'Certain strains are studied for this.' },
      { topic: "Traveler's diarrhea", note: 'Used prophylactically.' },
    ],
    forms: {
      'Mehrstammpräparat': 'What matters is the exactly named strain (e.g. "Lactobacillus rhamnosus GG"), not just the genus.',
      'Magensaftresistente Kapsel': 'Protects the cultures from stomach acid.',
    },
    cautionNote: 'CFU figures (colony-forming units) ideally refer to the best-before date, not the manufacturing date.',
  },
  curcumin: {
    what: 'Secondary plant compound from turmeric root, studied for its inflammation-modulating properties.',
    useCases: [
      { topic: 'Joints', note: 'Most common application area for joint complaints.' },
      { topic: 'Inflammatory processes', note: 'Subject of numerous studies.' },
    ],
    forms: {
      'Standardextrakt (95 % Curcuminoide)': 'Barely absorbable without an absorption enhancer.',
      'Mit Piperin': 'Black pepper extract markedly increases absorption, but can also affect the absorption of medications.',
      'Mizellar / Phytosom': 'Technologically improved absorption without piperine.',
    },
    cautionNote: 'May increase bleeding tendency and affect the action of medications. Use with caution in gallstones.',
  },
  ashwagandha: {
    what: 'Medicinal plant from the Ayurvedic tradition, studied mainly in relation to stress load.',
    useCases: [
      { topic: 'Stress and cortisol', note: 'Most frequently studied application area.' },
      { topic: 'Sleep quality', note: 'Used in the evening.' },
    ],
    forms: {
      'Wurzelextrakt (standardisiert)': 'Pay attention to withanolide content; root extracts are better studied than leaf extracts.',
    },
    cautionNote: 'Not for use during pregnancy and breastfeeding. Clarify with a doctor in cases of thyroid and autoimmune conditions. Not a substance for children.',
  },
  biotin: {
    what: 'Water-soluble B vitamin, cofactor of several carboxylases in fat, amino acid and glucose metabolism.',
    useCases: [
      { topic: 'Fatty acid and energy metabolism', note: 'Used as a cofactor of carboxylases in metabolism.' },
      { topic: 'Skin, hair, nails', note: 'Frequently cited connection in supplementation; according to the DGE only proven in cases of documented deficiency.' },
      { topic: 'Nervous system', note: 'Involved in myelin formation.' },
    ],
    forms: {
      'D-Biotin': 'The only form commonly used in dietary supplements.',
    },
    cautionNote: 'From oral intakes of about 150 µg/day, interference with certain laboratory immunoassays (e.g. thyroid, cardiac markers) is documented (EMA/PRAC 2019). No UL has been derived (SCF/BfR 2024).',
  },
  niacin: {
    what: 'Collective term for nicotinic acid and nicotinamide, a building block of the coenzymes NAD/NADP in energy metabolism.',
    useCases: [
      { topic: 'Energy metabolism', note: 'Part of NAD/NADP in practically all cells.' },
      { topic: 'Skin and mucous membrane function', note: 'Historically linked to pellagra prevention.' },
      { topic: 'Nervous system', note: 'Involved in neuronal metabolic processes.' },
    ],
    forms: {
      'Nicotinamid': 'Common supplement form. Upper limit around 900 mg/day (adults), considerably higher than for nicotinic acid.',
      'Nicotinsäure': 'Can trigger flushing (skin reddening) starting from low mg doses. Upper limit around 10 mg/day (adults), considerably lower than for nicotinamide.',
      'Inosithexanicotinat': 'Only approved in dietary supplements, not in fortified foods.',
    },
    cautionNote: 'Important: the three forms have very different upper limits (a factor of over 200 between the nicotinic acid and nicotinamide upper limits): a nicotinic acid product must not be compared with the nicotinamide value. During pregnancy, the BfR recommends a warning notice for nicotinamide additions above 16 mg/day due to insufficient safety data.',
  },
  riboflavin: {
    what: 'Water-soluble B vitamin, building block of the coenzymes FAD/FMN in redox reactions of energy metabolism.',
    useCases: [
      { topic: 'Energy metabolism', note: 'Electron transport chain, cellular respiration.' },
      { topic: 'Cell growth and regeneration', note: 'Involved in cell division processes.' },
      { topic: 'Red blood cells', note: 'Involved in their formation.' },
    ],
    forms: {
      'Riboflavin': 'Standard form.',
      "Riboflavin-5'-Phosphat": 'Also approved as a food colorant (E101).',
    },
    cautionNote: 'No relevant interactions documented; harmless yellow discoloration of urine at higher intakes. No UL has been derived (SCF 2000, confirmed by BfR 2024).',
  },
  thiamin: {
    what: 'Water-soluble B vitamin, cofactor in decarboxylation within carbohydrate metabolism and for nerve function.',
    useCases: [
      { topic: 'Carbohydrate metabolism', note: 'Cofactor in enzymatic decarboxylation.' },
      { topic: 'Nerve function', note: 'Involved in signal transmission in the nervous system.' },
      { topic: 'Heart muscle function', note: 'Involved in the energy metabolism of the heart muscle.' },
    ],
    forms: {
      'Thiaminhydrochlorid': 'Common supplement form.',
      'Thiaminmononitrat': 'Frequently used in fortified foods.',
      'Benfotiamin': 'Synthetic derivative, less common in classic dietary supplements.',
    },
    cautionNote: 'No relevant contraindication known at usual supplement doses; excess thiamin is excreted via urine. No UL has been derived (SCF 2001, confirmed by BfR 2024).',
  },
  pantothensaeure: {
    what: 'Water-soluble B vitamin, building block of coenzyme A, central to fat, carbohydrate and protein metabolism.',
    useCases: [
      { topic: 'Fat and energy metabolism', note: 'Component of coenzyme A.' },
      { topic: 'Formation of hormones and neurotransmitters', note: 'Involved in their synthesis via coenzyme A.' },
      { topic: 'Skin', note: 'Panthenol, as a provitamin form, is frequently used topically.' },
    ],
    forms: {
      'Calcium-D-Pantothenat': 'Common oral supplement form.',
      'D-Panthenol': 'Used mainly in topical/cosmetic products.',
    },
    cautionNote: 'No relevant interactions documented at supplement doses. No UL has been derived (SCF 2002, confirmed by BfR 2024).',
  },
  choline: {
    what: 'Vitamin-like, semi-essential nutrient; needed for building cell membranes (phosphatidylcholine) and the neurotransmitter acetylcholine, and partly produced by the body itself.',
    useCases: [
      { topic: 'Liver function', note: 'EFSA attributes choline a role in normal liver function.' },
      { topic: 'Pregnancy and breastfeeding', note: 'EFSA and the US Food and Nutrition Board set higher estimated values here than for non-pregnant women.' },
    ],
    forms: {
      'Cholinchlorid / Cholinbitartrat': 'Most common supplement form.',
    },
    cautionNote: 'The DGE has not published its own D-A-CH reference value for choline; in Germany the EFSA estimate is used instead. EFSA has not derived a UL (data considered insufficient by EFSA).',
  },
  chromium: {
    what: 'Trace element attributed a role in carbohydrate metabolism; the exact mechanism of action in humans is considered scientifically not conclusively established.',
    useCases: [
      { topic: 'Carbohydrate metabolism', note: 'Discussed in connection with the regulation of blood glucose levels.' },
      { topic: 'Supplementation with unbalanced diet', note: 'Used as a supplement in cases of low intake through food.' },
      { topic: 'Sports nutrition', note: 'Used in some products to support energy metabolism.' },
    ],
    forms: {
      'Chrompicolinat': 'Most widely used form.',
      'Chromchlorid': 'Simpler, cheaper salt form.',
      'Chromhefe': 'Used in some products as a natural carrier form.',
    },
    cautionNote: 'EFSA could not confirm chromium(III) as essential for the general population, so no official reference value exists. The BfR proposes an upper limit of 60 µg per daily dose for dietary supplements (as of 2021).',
  },
  manganese: {
    what: 'Trace element, component of several enzymes, including antioxidant enzymes and those of bone metabolism.',
    useCases: [
      { topic: 'Bone metabolism', note: 'Cofactor of bone-relevant enzymes.' },
      { topic: 'Antioxidant enzyme systems', note: 'Component of manganese superoxide dismutase.' },
      { topic: 'Combination mineral products', note: 'Frequently included in multi-mineral products.' },
    ],
    forms: {
      'Manganbisglycinat': 'Widely used chelate form in dietary supplements.',
      'Mangansulfat': 'Inexpensive standard form.',
      'Manganchlorid': 'Used less often.',
    },
    cautionNote: 'The BfR currently proposes 0.5 mg per daily dose for dietary supplements.',
  },
  copper: {
    what: 'Trace element, component of copper-dependent enzymes, including those in iron metabolism and connective tissue formation.',
    useCases: [
      { topic: 'Iron metabolism', note: 'Copper-dependent enzymes are involved in iron transport.' },
      { topic: 'Connective tissue', note: 'Associated with the cross-linking of collagen and elastin.' },
      { topic: 'Combination mineral products', note: 'Often dosed together with zinc.' },
    ],
    forms: {
      'Kupferbisglycinat': 'Widely used in dietary supplements.',
      'Kupfergluconat': 'Common supplement form.',
      'Kupfersulfat': 'Standard form, used among other things in food fortification.',
    },
    cautionNote: 'A high zinc intake reduces copper absorption in the gut (competitive inhibition): this interaction is well documented. The BfR notes that its proposed upper limit of 1 mg per daily dose does not apply to children and adolescents, since this group already takes in comparatively high amounts of copper through their usual diet.',
  },
  molybdenum: {
    what: 'Trace element, cofactor of several oxidoreductases, including those in purine and sulfite metabolism.',
    useCases: [
      { topic: 'Enzyme cofactor', note: 'Component of molybdenum-dependent enzymes (e.g. sulfite oxidase, xanthine oxidase).' },
      { topic: 'Combination mineral products', note: 'Usually included as a minor component in multi-mineral products.' },
    ],
    forms: {
      'Natriummolybdat': 'Most common form in dietary supplements.',
      'Molybdänglycinat': 'Used less often.',
    },
    cautionNote: 'EFSA estimated value (AI) for adults: 65 µg/day. An older SCF value of 0.6 mg/day (year 2000) is not part of the current EFSA reference value assessment from 2013 and is deliberately not adopted here as a current upper limit.',
  },
  phosphorus: {
    what: 'Macro-mineral, a central building block of bones and teeth (as hydroxyapatite), of nucleic acids and energy-carrying molecules such as ATP.',
    useCases: [
      { topic: 'Bone and tooth mineralization', note: 'Main component of bone mineral together with calcium.' },
      { topic: 'Energy metabolism', note: 'Component of ATP and other energy-carrying molecules.' },
      { topic: 'Cell membranes and nucleic acids', note: 'Building block of phospholipids, DNA and RNA.' },
    ],
    forms: {
      'Phosphat (allgemein)': 'Standalone phosphorus products are uncommon; phosphorus mostly occurs as an accompanying ion in other mineral compounds.',
    },
    cautionNote: 'The BfR generally advises against targeted phosphorus addition in dietary supplements. Neither EFSA nor the DGE have derived an upper limit (data considered insufficient by EFSA 2015).',
  },
  glucosamine: {
    what: 'Amino sugar that serves as a natural building block for glycosaminoglycans: molecules that are part of cartilage structure. Products are usually made from crustacean shells (chitin) or by fermentation.',
    useCases: [
      { topic: 'Knee osteoarthritis', note: 'Study evidence is contradictory: some studies show pain relief, large studies found little to no effect. Professional bodies assess this differently.' },
      { topic: 'Hip osteoarthritis', note: 'Moderate evidence does not support a clear benefit.' },
      { topic: 'Combination with chondroitin', note: 'A meta-analysis (29 studies, 2018) found: pain reduction when taken alone, no significant additional effect in combination.' },
    ],
    forms: {
      'Glucosaminsulfat': 'In a Cochrane subgroup analysis, the only form with a significant effect versus placebo.',
      'Glucosaminhydrochlorid': 'Frequently found in combination products with chondroitin.',
    },
    cautionNote: 'According to NCCIH, may raise blood glucose levels in some people; an increased bleeding risk is described in combination with the anticoagulant warfarin. An EFSA health claim regarding joint preservation was rejected multiple times (causal link not established). Commercially available glucosamine usually comes from chitin in the shell, not from the allergenic flesh; nevertheless, many manufacturers list a precautionary note for shellfish allergy.',
  },
  chondroitin: {
    what: 'Sulfated glycosaminoglycan, a natural component of joint cartilage; affects its resistance to pressure load.',
    useCases: [
      { topic: 'Knee osteoarthritis', note: 'Study evidence is contradictory; a meta-analysis (2018) showed pain reduction when taken alone, not in combination with glucosamine.' },
      { topic: 'Wrist osteoarthritis', note: 'One study showed pain reduction and improved function: an isolated finding, not broadly confirmed.' },
    ],
    forms: {
      'Chondroitinsulfat': 'Molecular weight and purity vary widely depending on the source material (bovine, porcine, fish or poultry cartilage).',
    },
    cautionNote: 'Like glucosamine, associated with a described increased bleeding risk under warfarin. An EFSA health claim regarding joint preservation was rejected (causality not proven).',
  },
  msm: {
    what: 'Organic sulfur compound, chemically related to DMSO (dimethyl sulfoxide); offered alone or in combination with glucosamine.',
    useCases: [
      { topic: 'Knee osteoarthritis', note: 'According to NCCIH, research is only limited in scope: no reliable statement on efficacy is possible.' },
      { topic: 'Combination products', note: 'Often marketed together with glucosamine, standalone additional benefit not proven.' },
    ],
    forms: {
      'Methylsulfonylmethan': 'The only commonly used form.',
    },
    cautionNote: 'Reported side effects include allergic reactions, gastrointestinal complaints and skin rashes. According to NCCIH, overall safety is considered uncertain, since only limited research is available.',
  },
  'collagen-peptides': {
    what: 'Collagen enzymatically split into small peptides (usually from bovine, porcine, fish or poultry skin/bones); supplies amino acids such as glycine, proline and hydroxyproline.',
    useCases: [
      { topic: 'Knee osteoarthritis (pain/function)', note: 'Newer meta-analyses (including 35 studies, 2024) show small to moderate effects versus control; overall study evidence is heterogeneous regarding dose, collagen type and duration.' },
      { topic: 'Skin', note: "EFSA rejected a health claim regarding skin elasticity (2013): the measured effects did not meet EFSA's definition of skin function." },
    ],
    forms: {
      'Kollagen Typ I': 'Main component of skin, bone, tendons, ligaments.',
      'Kollagen Typ II': 'Main component of cartilage, most studied in the joint context.',
      'Kollagen Typ III': 'Complements type I in skin, blood vessels, elastic connective tissue.',
    },
    cautionNote: 'Common sources are beef, pork, fish or poultry: relevant for origin verification in cases of corresponding food allergies. EFSA health claims regarding joints (2011) and skin elasticity (2013) were each rejected.',
  },
  'hyaluronic-acid-oral': {
    what: 'Glycosaminoglycan, a natural component of joint fluid, cartilage and skin; offered orally as a low to high molecular weight form (to be distinguished from injected hyaluronic acid used in joint therapy).',
    useCases: [
      { topic: 'Knee osteoarthritis (symptoms)', note: 'Individual placebo-controlled studies report reduced pain/stiffness scores; overall evidence is classified as limited.' },
      { topic: 'Skin hydration', note: 'Moderate evidence base, mostly studied with low molecular weight hyaluronic acid over 8 to 12 weeks.' },
    ],
    forms: {
      'Niedrigmolekulare Hyaluronsäure': 'used in studies predominantly at doses of 80 to 200 mg/day.',
      'Hochmolekulare Hyaluronsäure': 'established primarily in injectable form for joint therapy.',
    },
    cautionNote: 'No specific interactions or contraindications found in the sources reviewed. An EFSA health claim regarding joint maintenance is among a total of 71 joint-related claims rejected in the EU register.',
  },
  'alpha-lipoic-acid': {
    what: 'Sulfur-containing fatty acid that occurs naturally in the body as a cofactor of mitochondrial enzymes and acts as an antioxidant; also regenerates depleted antioxidants such as vitamin C.',
    useCases: [
      { topic: 'Oxidative stress', note: 'Discussed as a radical scavenger and is the subject of studies on oxidative stress.' },
      { topic: 'Diabetic neuropathy', note: 'Studied in the context of nerve function in diabetes.' },
      { topic: 'Blood sugar metabolism', note: 'Discussed in connection with insulin sensitivity.' },
    ],
    forms: {
      'R-Alpha-Liponsäure (R-ALA)': 'the body\'s own, biologically active form.',
      'Racemische Mischung (R/S-ALA)': 'standard in most commercial products.',
    },
    cautionNote: 'May enhance the blood-sugar-lowering effect of insulin/antidiabetic medication; cases of hypoglycemia have been reported. No EU-wide approved health claim. Despite review, no primary source clearly verifiable in full text could be confirmed for a reliable upper limit: circulating figures (e.g. 600 mg/day) originate from secondary sources and are deliberately not adopted here as a confirmed value.',
  },
  'n-acetylcysteine': {
    what: 'Synthesized derivative of the amino acid cysteine that serves in the body as a precursor for glutathione formation; does not occur naturally in foods.',
    useCases: [
      { topic: 'Glutathione precursor', note: 'Classified as a substrate for the body\'s own glutathione synthesis.' },
      { topic: 'Respiratory tract', note: 'Approved as a medicinal substance for mucolytic use in respiratory medicine since the 1960s.' },
      { topic: 'Oxidative stress', note: 'Subject of research into antioxidant processes.' },
    ],
    forms: {
      'N-Acetyl-L-Cystein': 'the only common commercial form.',
    },
    cautionNote: 'Regulatorily contested in Germany: NAC is simultaneously an approved, partly pharmacy-only medicinal substance AND is marketed as a dietary supplement. This dual role has repeatedly been reviewed by authorities (including the Tübingen Regional Council, the BfArM expert committee on pharmacy-only status in 2009): the status can vary depending on the product and point in time. EFSA has not yet published a positive novel food assessment for NAC.',
  },
  resveratrol: {
    what: 'Polyphenol (stilbene) from the phytoalexin group, occurring naturally in, among others, red wine, grape skins and knotweed root; approved EU-wide as a novel food in its synthetic trans-resveratrol form.',
    useCases: [
      { topic: 'Antioxidant processes', note: 'Discussed in connection with cell protection against oxidative stress.' },
      { topic: 'Metabolism and aging research', note: 'Subject of research into sirtuin/AMPK signaling pathways.' },
    ],
    forms: {
      'Synthetisches trans-Resveratrol': 'the only form approved EU-wide as a novel food for dietary supplements.',
      'Polygonum-cuspidatum-Extrakt': 'a common source material in products.',
    },
    cautionNote: 'EFSA points to possible interactions with certain medications. The novel food approval explicitly applies only to adults, not to pregnant or breastfeeding women, children and adolescents.',
  },
  astaxanthin: {
    what: 'Red carotenoid pigment formed mainly by the microalga Haematococcus pluvialis, also present in animal-derived foods (e.g. salmon, krill) via the food chain.',
    useCases: [
      { topic: 'Oxidative stress', note: 'Described as one of the most potent known carotenoid antioxidants.' },
      { topic: 'Vision/eyes', note: 'Subject of studies on eye fatigue.' },
      { topic: 'Skin', note: 'Studied in the context of skin protection against UV-related oxidative stress.' },
    ],
    forms: {
      'Natürliches Astaxanthin (Algenextrakt)': 'the most common form in dietary supplements.',
      'Synthetisches Astaxanthin': 'a different approval history than the algae form, less commonly used for humans.',
    },
    cautionNote: 'EFSA assesses combined intake from background diet (fish/crustaceans) plus supplementation together.',
  },
  quercetin: {
    what: 'Flavonoid (flavonol) from the group of secondary plant compounds, naturally present in, among others, onions, apples and capers; usually present in dietary supplements as isolated quercetin dihydrate.',
    useCases: [
      { topic: 'Oxidative stress', note: 'Classified as a radical scavenger among secondary plant compounds.' },
      { topic: 'Inflammatory processes', note: 'Subject of research into inflammation-related mechanisms.' },
      { topic: 'Immune system', note: 'Discussed in studies in connection with infection defense.' },
    ],
    forms: {
      'Quercetin-Dihydrat': 'the most common isolated form.',
      'Quercetin-Glykoside': 'occur naturally in foods in this form.',
    },
    cautionNote: 'Animal studies have discussed a possible increase in nephrotoxic effects in pre-damaged kidneys, as well as an effect on hormone-dependent tumors. No official EFSA safety assessment/novel food decision exists for quercetin, since it is not a novel food; accordingly, there is no binding EU upper limit. Circulating figures (500 to 860 mg) originate from scientific review articles, not from a binding regulatory determination.',
  },
  taurine: {
    what: 'The body\'s own sulfur-containing amino sulfonic acid, synthesized from cysteine and found mainly in animal-derived foods. Functions: bile acid conjugation, cell volume regulation, antioxidant processes.',
    useCases: [
      { topic: 'Energy drink formulation', note: 'The most common context in which taurine has been assessed by authorities, usually in combination with caffeine.' },
      { topic: 'Athlete nutrition', note: 'Studied for endurance performance and recovery, with inconsistent results.' },
    ],
    forms: {
      'Freies Taurin': 'the standard form in dietary supplements.',
    },
    cautionNote: 'The BfR explicitly advises against taurine-containing energy drinks for children, pregnant and breastfeeding women; interactions with other energy drink ingredients have not been fully researched.',
  },
  glycine: {
    what: 'The simplest proteinogenic amino acid, a building block of collagen, glutathione and creatine; also acts as an inhibitory neurotransmitter.',
    useCases: [
      { topic: 'Sleep research', note: 'Studied in placebo-controlled trials at approximately 3 g before bedtime for subjective sleep quality and sleep onset latency.' },
      { topic: 'Collagen and connective tissue research', note: 'A building block of the body\'s own collagen synthesis, hence a component of many collagen products.' },
    ],
    forms: {
      'Freies Glycin': 'slightly sweet taste, usually dosed as a powder.',
    },
    cautionNote: 'No specific regulatory warning found; generally well tolerated in studies at several grams per day.',
  },
  gaba: {
    what: 'The most important inhibitory neurotransmitter of the central nervous system. According to current knowledge, orally ingested GABA crosses the blood-brain barrier only to a limited extent: whether the central effect can be transferred to oral intake is discussed controversially.',
    useCases: [
      { topic: 'Relaxation/perceived stress', note: 'Studied in clinical trials for subjective perceived stress (including 100 mg/day over 12 weeks).' },
      { topic: 'Sleep support', note: 'Subject of studies on falling-asleep behavior.' },
    ],
    forms: {
      'Freies GABA': 'often produced fermentatively from glutamate.',
    },
    cautionNote: 'Mild, temporary drops in blood pressure observed in studies. Regulatory status inconsistent: in Germany, a general administrative order has existed since a 2008 court ruling that permits a daily dose of 100 mg as a dietary supplement; individual authorities have nonetheless issued objections since then. The BfR currently considers the data insufficient for a reliable health assessment.',
  },
  'l-theanine': {
    what: 'Non-proteinogenic amino acid from tea leaves (mainly green tea), structurally related to glutamate.',
    useCases: [
      { topic: 'Relaxation without sedation', note: 'The most studied area of use, often examined in combination with caffeine.' },
      { topic: 'Attention', note: 'Studied in combination with caffeine for reaction time and attention.' },
      { topic: 'Sleep quality', note: 'Subject of studies on subjective sleep quality.' },
    ],
    forms: {
      'Isoliertes L-Theanin': 'sold in Germany as a capsule dietary supplement.',
    },
    cautionNote: 'In 2011, EFSA denied a scientifically sufficiently substantiated link between L-theanine and cognitive function, stress reduction or sleep, and rejected the corresponding health claim applications. Isolated L-theanine extracted from tea is considered a novel food; an EU approval process with a proposed exclusion of children/adolescents as well as pregnant/breastfeeding women was still ongoing at the time of research.',
  },
  betaine: {
    what: 'Methyl group donor in homocysteine metabolism, naturally present in, among others, beetroot, whole grains and spinach. Betaine anhydrous/TMG (metabolic function) is to be distinguished from betaine hydrochloride (used to acidify the stomach environment): both are marketed as "betaine" but have different areas of use.',
    useCases: [
      { topic: 'Homocysteine metabolism', note: 'Involved in homocysteine metabolism as a methyl group donor.' },
      { topic: 'Sports/performance supplementation', note: 'EFSA approval as a novel food explicitly intended for sports drinks/powders.' },
      { topic: 'Stomach environment (betaine HCl)', note: 'Used in hydrochloride form to acidify the stomach environment: a use separate from TMG.' },
    ],
    forms: {
      'Betain-Anhydrat (TMG)': 'anhydrous form, approved for metabolic/sports applications.',
      'Betain-Hydrochlorid (Betain-HCl)': '76% betaine plus 24% HCl content; alters the stomach environment and can affect the absorption of medications.',
    },
    cautionNote: 'Betaine HCl alters the stomach environment, which can affect the absorption of certain medications. In its safety assessment, EFSA explicitly included infants and young children, since use by these groups cannot be ruled out.',
  },
  'rhodiola-rosea': {
    what: 'Rootstock of a plant from arctic/subarctic high-altitude regions. Registered in the EU as a traditional herbal medicinal product (HMPC); rosavins and salidroside are the marker substances. According to HMPC, the mechanism of action is not conclusively established.',
    useCases: [
      { topic: 'Stress symptoms (fatigue, feeling of weakness)', note: 'The only official indication according to the EU herbal monograph (traditional use): temporary relief. A health claim application for reducing fatigue under stress was rejected by EFSA for lack of evidence of efficacy.' },
    ],
    forms: {
      Trockenextrakt: 'Commercial extracts are often additionally standardized for rosavin/salidroside content, though this is not an official HMPC requirement.',
    },
    cautionNote: 'Officially (HMPC), the only contraindication is hypersensitivity to the active substance. Not for use in children/adolescents under 18. An interaction with losartan is described. A caution regarding bipolar disorder/mania mentioned in some sources could not be verified in official primary sources.',
  },
  'panax-ginseng': {
    what: 'Root of a plant native to China/Korea, botanically distinct from American ginseng (Panax quinquefolius). Ginsenosides are the marker substances.',
    useCases: [
      { topic: 'Symptoms of asthenia (fatigue, weakness)', note: 'Official HMPC indication (traditional use), duration of use up to 3 months.' },
      { topic: 'Blood sugar and metabolic parameters', note: 'A review article (2022) showed improvements in fasting blood sugar and inflammatory markers in prediabetes/diabetes; overall evidence is not conclusive.' },
      { topic: 'Athletic performance', note: 'According to NCCIH, the majority of research shows no benefit for enhancing athletic performance.' },
    ],
    forms: {
      'Trockenextrakt, standardisiert auf 4 % Ginsenoside': 'single dose 40 to 200 mg, daily dose 40 to 200 mg.',
      'Pulverisierte Droge (weißer Ginseng)': 'daily dose 600 to 2000 mg (HMPC).',
      'Pulverisierte Droge (roter Ginseng)': 'daily dose 1200 to 1800 mg (HMPC).',
    },
    cautionNote: 'Reported side effects: gastrointestinal complaints, hypersensitivity reactions, insomnia. Possible influence on autoimmune diseases and blood clotting. Not for use in children/adolescents under 18.',
  },
  'ginkgo-biloba': {
    what: 'Leaves of the ginkgo tree. Standardized dry extract with flavone glycosides and terpene lactones (ginkgolides, bilobalide) as marker substances; the only preparation in this group with HMPC "well-established use" status (the highest evidence status for herbal preparations in the EU).',
    useCases: [
      { topic: 'Age-related cognitive impairment / mild dementia', note: 'HMPC well-established-use indication. According to NCCIH, large studies (including one with over 3000 participants aged 75+) showed no difference from placebo for dementia prevention; at most limited benefit for existing symptoms.' },
      { topic: 'Circulatory disorders (heaviness in the legs)', note: 'HMPC traditional-use indication, after a doctor has ruled out serious causes.' },
    ],
    forms: {
      'Trockenextrakt (DER 35–67:1), standardisiert': 'daily dose 240 mg, use for at least 8 weeks.',
    },
    cautionNote: 'Contraindicated in pregnancy (an official HMPC contraindication, not merely a caution). Can affect blood clotting: with anticoagulants/antiplatelet agents (e.g. phenprocoumon, warfarin, aspirin) only after consulting a doctor. Discontinue 3 to 4 days before planned surgery as a precaution. According to HMPC, the occurrence of further seizures cannot be ruled out in epilepsy.',
  },
  maca: {
    what: 'Hypocotyl (thickened root neck) of a cruciferous plant from the Peruvian Andes, traditionally consumed as a food after heating. Unlike other plant compounds in this database, no EMA/HMPC herbal monograph exists.',
    useCases: [
      { topic: 'Traditional consumption as a food', note: 'Consumed as a food in the Andes for a long time after heating.' },
      { topic: 'Sexual desire (men)', note: 'The BfR cites small human studies indicating increased sexual desire at 1.5 to 3 g/day over 12 weeks: the studies were small (n=15 to 30) and not primarily designed to assess safety.' },
    ],
    forms: {
      'Wurzelpulver (roh oder geliert)': 'Commercial daily dosages, according to a list cited in 2007, range between 400 and 5000 mg, mostly 600 to 2400 mg.',
    },
    cautionNote: 'In its risk assessment (2007), the BfR explicitly states that, based on the available data, NO health-safe consumption amount can be derived: not merely that none is currently known. Animal studies show indications of effects on reproductive organs and hormone balance (depending on the color variant); according to the BfR, there is no concrete evidence of adverse effects in humans, but the data is considered insufficient.',
  },
  'milk-thistle': {
    what: 'Dried fruits of milk thistle. Silymarin is the collective term for the plant\'s flavonolignan complex (including silybin) and the marker substance of the extracts.',
    useCases: [
      { topic: 'Digestive complaints, bloating, flatulence', note: 'HMPC traditional-use indication, after a doctor has ruled out serious causes.' },
      { topic: 'Support of liver function', note: 'Part of the traditional HMPC indication. According to NCCIH, an analysis of 5 studies (2014) showed no benefit for liver function or viral load in hepatitis C.' },
    ],
    forms: {
      'Pulverisierte Droge': 'single dose 300 to 600 mg, 2 to 3 times/day, daily dose up to 1800 mg (HMPC).',
      'Trockenextrakt (DER 30–40:1), Ethanol 96 %': 'single/daily dose 200 mg.',
      'Trockenextrakt (DER 20–70:1), Aceton': 'daily dose up to 478 mg.',
    },
    cautionNote: 'Contraindicated in hypersensitivity to the active substance and to plants of the Asteraceae/Compositae family (cross-reaction). According to HMPC, medical advice should be sought immediately in case of jaundice or a change in urine/stool color.',
  },
  'lutein-zeaxanthin': {
    what: 'Two carotenoids (xanthophylls) that are the only carotenoids deposited in the macula of the eye in significant concentration, where they filter blue light and act as antioxidants.',
    useCases: [
      { topic: 'Macular density', note: 'Classified in connection with protecting the macula against oxidative stress.' },
      { topic: 'Vision in bright light', note: 'EFSA has scientifically confirmed a health claim for improved vision under bright light conditions for the combination of lutein and zeaxanthin.' },
      { topic: 'Age-related retinal changes', note: 'In the NIH AREDS2 study, a formulation with 10 mg lutein/2 mg zeaxanthin was studied as a replacement for beta-carotene in the presence of existing retinal changes.' },
    ],
    forms: {
      'Freies Lutein/Zeaxanthin': 'the most common raw material source.',
      'Lutein-Ester': 'also occurs naturally in plants in this form.',
    },
    cautionNote: 'As a fat-soluble substance, absorption is favored by simultaneous dietary fat intake. EFSA has only established safety-related limits for use as a food coloring, not a daily reference value for dietary supplements.',
  },
  'beta-alanine': {
    what: 'Non-proteinogenic amino acid that serves as the rate-limiting building block of the body\'s own carnosine synthesis in skeletal muscle.',
    useCases: [
      { topic: 'Muscle carnosine levels', note: 'According to NIH, 4 to 6 g/day over 10 weeks can raise muscle carnosine levels by up to 80%.' },
      { topic: 'Short, high-intensity exertion', note: 'Classified in the context of high-intensity training sessions, where carnosine is discussed as a buffer against muscle acidification.' },
    ],
    forms: {
      'Freies Beta-Alanin': 'the standard form.',
      'Retardiert (sustained-release)': 'used to reduce tingling (paresthesia).',
    },
    cautionNote: 'Temporary skin tingling (paresthesia) is described at single doses above approximately 800 mg. No official upper limit set by any authority found: beta-alanine is not an essential nutrient.',
  },
  hmb: {
    what: 'Metabolic product of the amino acid leucine (around 5% of the body\'s own leucine is converted to HMB); associated with muscle protein metabolism and recovery after muscle-damaging exertion.',
    useCases: [
      { topic: 'Recovery after intense exertion', note: 'According to NIH ODS, there is consensus that HMB can support recovery after training of sufficient intensity to cause muscle damage.' },
    ],
    forms: {
      'HMB-Calcium (HMB-Ca)': 'the most common capsule/powder form.',
      'HMB freie Säure (HMB-FA)': 'usually in gel or liquid form.',
    },
    cautionNote: 'According to NIH ODS, 3 g/day is considered safe for adults with short-term use; safety and efficacy in adolescents have not been studied.',
  },
  melatonin: {
    what: 'The body\'s own hormone from the pineal gland, produced mainly at night, involved in regulating the day-night rhythm.',
    useCases: [
      { topic: 'Jet lag', note: 'EFSA has scientifically confirmed a health claim for reducing the subjective symptoms of jet lag at 0.5 mg per portion.' },
      { topic: 'Time to fall asleep', note: 'EFSA has scientifically confirmed a health claim for reducing the time to fall asleep at 1 mg per portion, taken immediately before bedtime.' },
    ],
    forms: {
      'Melatonin, isoliert': 'usually 0.5 to 2 mg per unit in dietary supplements, 2 to 5 mg per unit in medicinal products.',
    },
    cautionNote: 'Special regulatory status in Germany: there is no legally fixed mg threshold above which melatonin is necessarily classified as a medicinal product: the BfR takes the position that isolated melatonin should be classified as a pharmacologically active substance regardless of dose, while courts have decided individual cases differently. As an approved medicinal product, melatonin is available without prescription at 3 mg per pack up to 30 mg for jet lag; other dosages and indications remain prescription-only. In 2024, the BfR additionally warned of possible health risks from melatonin-containing dietary supplements.',
  },
  nmn: {
    what: 'Intermediate product of the body\'s own NAD+ synthesis; NAD+ is a cofactor of numerous redox reactions and a substrate for sirtuins.',
    useCases: [
      { topic: 'Blood NAD+ levels', note: 'A short-term, placebo-controlled human study shows an increase in blood NAD+ levels after oral administration in healthy adults.' },
      { topic: 'Cell metabolism and aging research', note: 'Animal studies show effects on age-associated metabolic parameters; large clinical endpoint studies in humans are still lacking.' },
    ],
    forms: {
      'Kapsel/Pulver (oral)': 'the standard form.',
    },
    cautionNote: 'NMN is currently not approved as a dietary supplement in the EU. In May 2026, EFSA issued a positive safety assessment for an approval application (300 mg/day, excluding pregnant/breastfeeding women): formal EU-wide approval by the Commission is still pending. Until then, marketability as a dietary supplement is regulated differently depending on the EU member state.',
  },
  nattokinase: {
    what: 'Proteolytic enzyme from the fermentation of soybeans into natto by Bacillus subtilis var. natto; shown to have fibrinolytic activity in laboratory and animal models.',
    useCases: [
      { topic: 'Fibrinolysis/coagulation system', note: 'Laboratory and animal models document fibrinolytic activity; controlled human studies on hard cardiovascular endpoints are limited.' },
      { topic: 'Approved marketing claims', note: 'No health claim is approved for nattokinase in the EU.' },
    ],
    forms: {
      'NSK-SD (standardisierter fermentierter Sojabohnenextrakt)': 'the only specification assessed by EFSA in the 2016 Novel Food procedure, standardised to 20,000 to 28,000 FU/g.',
    },
    cautionNote: 'May theoretically potentiate the effect of anticoagulants/antiplatelet agents (vitamin K antagonists, DOACs); case reports describe both bleeding events and thrombotic complications when nattokinase was used on one’s own initiative to replace blood-thinning therapy. The EFSA safety assessment from 2016 (100 mg NSK-SD/day, approximately 2000 FU) explicitly applies to adults over 35 years of age and excludes pregnant and breastfeeding women, so no structured reference value is given here, since the age threshold cannot be mapped onto the usual life-stage groups.',
  },

  'lions-mane': {
    what: 'Medicinal mushroom; the fruiting body mainly contains hericenones, the mycelium mainly contains erinacines, both compounds described in preclinical studies as having nerve growth promoting activity.',
    useCases: [
      { topic: 'Mild cognitive impairment', note: 'A small Japanese study (n=30, 3 g powder/day over 16 weeks) showed improvements on dementia symptom scales compared with placebo.' },
      { topic: 'Cognition and mood in healthy adults', note: 'Placebo-controlled studies in healthy adults show mixed results: some report faster reaction times in tests, others show no significant overall effect.' },
      { topic: 'Animal models of nerve growth', note: 'Effects on memory performance and nerve growth are documented in mouse studies; transferability to humans is not established.' },
    ],
    forms: {
      'Fruchtkörper-Extrakt/-Pulver': 'classified EU-wide as "not novel" (consumption prior to 1997 documented).',
      'Myzel-Extrakt/-Pulver': 'is considered a Novel Food and requires separate EU authorisation: not every product on the market can be shown to hold it.',
    },
    cautionNote: 'No approved EFSA health claim; statements about cognitive effects are not conclusively established scientifically (small, mixed study base).',
  },

  'methylene-blue': {
    what: 'Synthetic phenothiazine dye with a history of approval as a pharmaceutical drug (among other things for methemoglobinemia, historically as an antimalarial); increasingly marketed at low doses as a "nootropic" outside this approved framework.',
    useCases: [
      { topic: 'Methemoglobinemia (drug indication)', note: 'Approved as an intravenous drug for acquired methemoglobinemia: this does not apply to oral intake as a dietary supplement.' },
      { topic: 'Marketing as a nootropic', note: 'Marketed by online retailers as a concentration aid: this use has not been assessed or approved by any of the authorities reviewed (EFSA, BfR, BfArM).' },
    ],
    forms: {
      'Wässrige Lösung/Tropfen': 'In online shops sometimes explicitly declared as "dye for colouring fibres" or "laboratory chemical": a recognisable loophole to avoid classification as a food.',
      'Kapsel (als Nahrungsergänzungsmittel beworben)': 'Marketing claims of "USP quality"/"pharmaceutical quality" come from manufacturer statements, not regulatory review, and cannot be verified without a batch-specific certificate of analysis.',
    },
    cautionNote: 'Regulatory status: methylene blue is not approved as a food or dietary supplement in Germany/the EU: no E-number, no Novel Food decision for oral consumption. As a drug (intravenous preparation), it is prescription-only in Germany. Purity: technical or laboratory-grade material can contain heavy metals and residual solvents at concentrations that would not be approved for human consumption: a capsule marketed as "USP" cannot be verified without an independent certificate of analysis. G6PD deficiency is listed as a contraindication in the prescribing information (risk of severe hemolysis). Methylene blue acts as a potent MAO-A inhibitor: the risk of serotonin syndrome in combination with SSRIs, SNRIs, MAO inhibitors, 5-HTP, and tryptophan applies, according to regulatory warnings, at ANY dose, not only at high (pharmaceutical) amounts.',
  },

  'l-carnitine': {
    what: 'Compound synthesised endogenously from the amino acids lysine and methionine that transports fatty acids into the mitochondria for energy production. Not an essential nutrient for healthy people, since endogenous synthesis covers requirements.',
    useCases: [
      { topic: 'Fatty acid transport/energy metabolism', note: 'Basic physiological function, well documented.' },
      { topic: 'Athletic performance/recovery', note: 'Frequently used in endurance and strength sports; study results on performance enhancement are inconsistent, and effects are often small.' },
      { topic: 'Chronic kidney disease/dialysis', note: 'Used medically in certain clinical contexts where a deficiency has been demonstrated.' },
    ],
    forms: {
      'L-Carnitin': 'Standard form.',
      'Acetyl-L-Carnitin': 'in studies mostly associated with cognitive research questions.',
      'Propionyl-L-Carnitin': 'in studies mostly associated with circulation-related research questions.',
    },
    cautionNote: 'From around 3 g/day, nausea, vomiting, abdominal cramps, diarrhea, and a fishy odor may occur. In seizure disorders, an increased seizure risk is described under high doses. No DGE or EFSA reference value exists, as carnitine from food is considered safe.',
  },

  berberine: {
    what: 'Plant-derived alkaloid found among other things in barberry, goldenseal, and Oregon grape. Associated with AMPK activation and effects on glucose and lipid metabolism.',
    useCases: [
      { topic: 'Blood glucose metabolism', note: 'Clinical studies show effects on fasting and postprandial blood glucose in type 2 diabetes; study quality and product standardisation are inconsistent.' },
      { topic: 'Blood lipids', note: 'Studies describe reductions in LDL cholesterol and triglycerides; not a substitute for statin therapy.' },
    ],
    forms: {
      'Berberin-HCl': 'the most common supplement form.',
    },
    cautionNote: 'Interactions with statins, metformin/antidiabetic drugs, and blood pressure medications are described in the literature. IMPORTANT: in an ongoing, not yet finally concluded risk assessment (2026 consultation), EFSA has so far been UNABLE to derive a safe intake level for berberine-containing plant preparations: no upper limit therefore exists, because the responsible authority itself could not establish one.',
  },

  cla: {
    what: 'Umbrella term for positional isomers with conjugated double bonds of linoleic acid, naturally present in dairy products and beef; as a supplement usually produced synthetically from linoleic acid.',
    useCases: [
      { topic: 'Body fat percentage', note: 'Effects on fat mass are described in animal studies; in human studies, NIH ODS reports only small, clinically questionable effects.' },
      { topic: 'Muscle mass', note: 'A presumed association with an increase in fat-free mass; EFSA considered the evidence insufficient.' },
    ],
    forms: {
      'CLA-Isomerengemisch (c9,t11 / t10,c12)': 'Common supplement form.',
    },
    cautionNote: 'EFSA (2010) points to an increase in isoprostanes (a marker of lipid peroxidation) and inflammatory markers under CLA intake (approximately 3 g/day) and saw this as a possible risk of vascular damage with prolonged use, and several health claim applications for CLA were rejected as a result. No DGE or EFSA reference value exists.',
  },

  'green-tea-extract-egcg': {
    what: 'Highly concentrated extract from the leaves of Camellia sinensis, standardised to the main catechin epigallocatechin-3-gallate (EGCG): a markedly higher EGCG concentration than brewed tea.',
    useCases: [
      { topic: 'Antioxidant activity', note: 'Catechins are considered radical-scavenging polyphenols, well documented in vitro and preclinically.' },
      { topic: 'Metabolism/thermogenesis', note: 'Associated with effects on energy metabolism; human data on clinically relevant effects are inconsistent.' },
    ],
    forms: {
      'Grüntee-Blattextrakt, EGCG-standardisiert': 'Bioavailability and toxicity increase markedly when taken on an empty stomach.',
    },
    cautionNote: 'In 2018, EFSA concluded that from an EGCG dose of 800 mg/day from dietary supplements, early signs of liver damage are to be expected. Brewed green tea (not an extract) was classified as generally safe: the documented cases of liver damage relate practically exclusively to highly concentrated extracts. Taking it on an empty stomach further increases bioavailability and risk.',
  },

  boswellia: {
    what: 'Gum resin extract from the bark of the frankincense tree, containing boswellic acids, which are discussed as inhibitors of the enzyme 5-lipoxygenase.',
    useCases: [
      { topic: 'Joint complaints', note: 'Several smaller studies suggest a possible reduction in inflammation/pain in osteoarthritis; larger, high-quality studies are lacking.' },
      { topic: 'Respiratory tract', note: 'Isolated small studies on asthma symptoms, evidence base limited.' },
    ],
    forms: {
      'Gummiharz-/Trockenextrakt': 'Capsule, tablet, or tincture.',
    },
    cautionNote: 'Unlike devil’s claw, boswellia/Boswellia serrata has NO official EU herbal monograph (HMPC), as no documented traditional use in Europe exists. The only reliable source is the international evidence review by NCCIH: "There is not enough high-quality evidence to determine whether boswellia is useful for any health condition." Up to 1000 mg/day over 6 months or 2400 mg/day over 1 month has generally tested as safe; safety data for pregnancy/breastfeeding are limited.',
  },

  harpagophytum: {
    what: 'Dried storage root of Harpagophytum procumbens, containing among other things harpagoside. Traditionally used as a tea as well as liquid and dry extracts.',
    useCases: [
      { topic: 'Mild joint complaints', note: 'HMPC (EU herbal monograph): traditional herbal medicinal product for the relief of minor joint pain, based on long-standing use.' },
      { topic: 'Mild digestive complaints', note: 'HMPC: relief of mild complaints such as bloating and in cases of temporary loss of appetite.' },
    ],
    forms: {
      'Trockenextrakt': 'Extraction solvent water or ethanol 30 to 90%.',
      'Flüssigextrakt/Tinktur': 'e.g. 1:5, ethanol 25%.',
    },
    cautionNote: 'HMPC contraindication: active gastric or duodenal ulcer. In cases of gallstones, medical advice should be sought before use. Use beyond 4 weeks (joint pain) or 2 weeks (digestion) without medical advice is not intended. Reported side effects: gastrointestinal complaints, headache, dizziness, hypersensitivity reactions.',
  },

  bromelain: {
    what: 'Group of protein-splitting enzymes (cysteine proteases) from the stem and fruit of the pineapple plant.',
    useCases: [
      { topic: 'After dental surgery', note: 'The most commonly advertised area of use according to NCCIH; some studies suggest possible symptom relief, evidence base limited.' },
      { topic: 'Joint complaints/muscle soreness', note: 'Discussed in the literature, evidence base limited.' },
    ],
    forms: {
      'Bromelain-Extrakt/-Pulver': 'Potency on labels is often stated in activity units (GDU/MCU/FIP) rather than mass.',
    },
    cautionNote: 'Generally well tolerated; the most common side effects are stomach complaints and diarrhea. As a protein-splitting enzyme, a possible interaction with anticoagulant drugs is discussed. No final EFSA assessment exists for bromelain: the corresponding health claim applications have been undecided ("on hold") for years.',
  },

  silicium: {
    what: 'Metalloid, present in the body mainly as silicon dioxide or bound silicic acid; offered among other things from bamboo or horsetail extracts as well as in synthetic forms.',
    useCases: [
      { topic: 'Connective tissue, hair, skin, nails', note: 'A widespread area of use; however, according to EFSA no specific biochemical function of silicon in humans has been conclusively demonstrated.' },
    ],
    forms: {
      'Siliciumdioxid (SiO2)': 'BfR proposed maximum level up to 350 mg silicon/day.',
      'Kieselsäure/Silicagel': 'BfR proposed maximum level up to 100 mg silicon/day.',
      'Cholin-stabilisierte Orthokieselsäure': 'BfR proposed maximum level up to 10 mg silicon/day.',
      'Organisches Silicium (Monomethylsilantriol)': 'approved as a Novel Food, BfR proposed maximum level up to 10 mg silicon/day.',
    },
    cautionNote: 'EFSA (2004) was unable to derive an upper limit due to a lack of data; silicon is considered a non-essential nutrient, and a deficiency has not been observed in humans to date. The D-A-CH reference values do not list a value for silicon. Important: the BfR proposed maximum level differs greatly depending on the form (a factor of 35 between SiO2 and bamboo extract): a single figure without stating the form would be misleading, so no structured reference value is given here.',
  },

  spirulina: {
    what: 'Cyanobacterium (often incorrectly referred to as a microalga), marketed dried as a protein-rich dietary supplement.',
    useCases: [
      { topic: 'Protein source', note: 'Marketed as a plant-based protein source with a high content; according to Verbraucherzentrale, unrealistically large amounts would be needed to cover daily requirements.' },
      { topic: 'Antioxidant activity', note: 'Contains phycocyanin and beta-carotene; corresponding health claims were rejected by EFSA for insufficient evidence.' },
    ],
    forms: {
      'Tablette/Kapsel (getrocknete Biomasse)': 'Most common commercial form.',
      'Pulver': 'For mixing into drinks.',
    },
    cautionNote: 'Market checks repeatedly document contamination with heavy metals (lead, cadmium, mercury), liver-toxic microcystins from contamination by other cyanobacteria, and, occasionally, microplastics and pesticide residues. Contains phenylalanine.',
  },

  chlorella: {
    what: 'Single-celled freshwater green alga with a thick cell wall, which is usually mechanically broken open for digestibility ("broken cell wall").',
    useCases: [
      { topic: 'Protein source', note: 'High protein content is advertised; according to Verbraucherzentrale, unrealistically large amounts are needed to cover daily requirements.' },
      { topic: 'Chlorophyll source', note: 'Specific EFSA health claims (including for digestion/liver) were rejected for lack of evidence.' },
    ],
    forms: {
      'Tablette (cracked cell wall)': 'Independent comparative data on this have not been verified.',
    },
    cautionNote: 'Market checks document, for algae products generally and chlorella specifically, contamination with cadmium, lead, copper, as well as accumulation of arsenic and aluminum. Contains comparatively high amounts of vitamin K.',
  },

  'digestive-enzymes': {
    what: 'Combination preparations of digestion-supporting enzymes (typically amylase, lipase, protease), usually of plant/microbial origin in over-the-counter products, to be distinguished from prescription pancreatic enzyme replacement therapy for documented pancreatic insufficiency.',
    useCases: [
      { topic: 'Amylase', note: 'Breaks down starch/polysaccharides into sugar building blocks.' },
      { topic: 'Lipase', note: 'Catalyses the breakdown of triglycerides into fatty acids and glycerol.' },
      { topic: 'Protease', note: 'Breaks down proteins into peptides and amino acids.' },
    ],
    forms: {
      'Amylase/Lipase/Protease-Kombination': 'No systemic bioavailability in the proper sense.',
    },
    cautionNote: 'The EU Food Enzyme Regulation explicitly does NOT apply to enzymes intended for direct human consumption: digestive enzyme preparations fall under general dietary supplement law. No EFSA health claim approval was found for enzyme combinations as a supplement.',
  },

  'black-seed-oil': {
    what: 'Fixed oil from the seeds of Nigella sativa, traditionally used as a spice and in folk medicine in the Middle East/South Asia; the main active compound is thymoquinone.',
    useCases: [
      { topic: 'Blood glucose', note: 'Investigated in clinical studies in connection with changes in blood glucose levels.' },
      { topic: 'Blood pressure', note: 'Studies describe a slight reduction in healthy adults.' },
      { topic: 'Cholesterol/triglycerides', note: 'Discussed in connection with mild changes in blood lipid levels.' },
    ],
    forms: {
      'Fettes Öl (Kaltpressung)': 'Common commercial form.',
    },
    cautionNote: 'Interactions with blood thinners (increased bleeding risk), blood pressure medications, diabetes medications, and immunosuppressants are described in secondary sources; sources describe discontinuation at least two weeks before surgery as advisable. No explicit BfR statement on black seed oil was found.',
  },

  'saw-palmetto': {
    what: 'Extract from the fruit of the saw palmetto; acts among other things via inhibition of 5-alpha-reductase and is studied for prostate complaints.',
    useCases: [
      { topic: 'Benign prostatic hyperplasia (hexane extract)', note: 'HMPC classification "well-established use": use for symptoms of benign prostatic hyperplasia.' },
      { topic: 'Lower urinary tract symptoms (ethanol extract)', note: 'HMPC classification "traditional use", after serious conditions have been excluded by a doctor.' },
      { topic: 'Study evidence', note: 'NCCIH: as a stand-alone preparation, "little to no benefit" for BPH symptoms according to several NIH-funded studies, even at three times the standard dose.' },
    ],
    forms: {
      'Hexan-Extrakt': 'The best-studied extract form.',
      'Ethanol-Extrakt': 'Lower evidence base.',
    },
    cautionNote: 'HMPC restricts use to adult and elderly men. Serious conditions (e.g. prostate cancer) should be excluded by a doctor before use.',
  },

  'nettle-root': {
    what: 'Root extract of the stinging nettle, to be clearly distinguished from nettle leaf (a different indication).',
    useCases: [
      { topic: 'Lower urinary tract symptoms in BPH', note: 'EU herbal monograph (HMPC, 2024 revision): traditionally used for relief of urination complaints associated with benign prostatic hyperplasia, after serious conditions have been excluded by a doctor.' },
    ],
    forms: {
      'Wässrig-alkoholischer Trockenextrakt': 'Classic traditional preparation form.',
    },
    cautionNote: 'Not to be confused with nettle leaf (different monograph, different indication). Serious urinary tract conditions should be excluded by a doctor before use.',
  },

  chasteberry: {
    what: 'Extract from the fruit of the chaste tree; acts among other things dopaminergically on the pituitary gland, thereby influencing prolactin release.',
    useCases: [
      { topic: 'Premenstrual syndrome (specific dry extract)', note: 'HMPC "well-established use": use for PMS symptoms with continuous intake over 3 months.' },
      { topic: 'Mild PMS complaints (other preparations)', note: 'HMPC "traditional use": relief of mild complaints in the days before menstruation.' },
      { topic: 'Study evidence', note: 'NCCIH: evidence of improvement in breast tenderness, but overall only limited evidence quality.' },
    ],
    forms: {
      'Trockenextrakt (spezifisch, standardisiert)': 'For sustained PMS use over 3 months.',
    },
    cautionNote: 'HMPC restricts use to adult women. NCCIH warns against use in hormone-sensitive conditions (breast, uterine, ovarian cancer). The dopaminergic action may interact with hormonal contraceptives and dopamine-active medications.',
  },

  'black-cohosh': {
    what: 'Extract from the rhizome of black cohosh; studied traditionally and scientifically for menopausal complaints.',
    useCases: [
      { topic: 'Menopausal complaints', note: 'HMPC "well-established use": use for hot flushes and excessive sweating.' },
      { topic: 'Study evidence', note: 'NCCIH (review of 22 studies): potentially useful for menopausal complaints, especially hot flushes; no improvement in anxiety/depression.' },
    ],
    forms: {
      'Trockenextrakt/Fluidextrakt': 'Use for a maximum of 6 months without medical consultation.',
    },
    cautionNote: 'Liver warning (HMPC): stop use immediately and consult a doctor if signs of liver problems occur (fatigue, loss of appetite, yellowing of skin/eyes, severe upper abdominal pain with nausea, dark urine). NCCIH confirms reported cases of sometimes serious liver damage with preparations labeled as black cohosh (causality uncertain, cases rare, sometimes involving quality problems from the wrong plant species/undeclared admixtures). Safety in hormone-sensitive cancers is unresolved.',
  },

  'myo-inositol': {
    what: 'Sugar alcohol, synthesised endogenously and also obtained from food; plays a role in second-messenger systems of insulin signal transduction.',
    useCases: [
      { topic: 'PCOS-associated subfertility/IVF pretreatment', note: 'A Cochrane review rates the evidence quality as "very low": it is uncertain whether myo-inositol has any effect on live birth or pregnancy rates in subfertile women with PCOS.' },
    ],
    forms: {
      'Myo-Inositol (Pulver/Kapsel)': 'in studies mostly used as a pure substance, sometimes combined with D-chiro-inositol.',
    },
    cautionNote: 'No health recommendation can be derived: the study evidence (Cochrane) itself rates the evidence as very low. Neither DGE nor EFSA lists an official reference value.',
  },

  pqq: {
    what: 'Redox cofactor present in small amounts in food; associated with mitochondrial biogenesis and antioxidant redox reactions.',
    useCases: [
      { topic: 'Cell energy/mitochondria', note: 'Associated with mitochondrial biogenesis in cell culture and animal studies; human data are limited.' },
      { topic: 'Antioxidant processes', note: 'Acts as a redox cofactor in vitro; clinical endpoints in humans are not established.' },
    ],
    forms: {
      'PQQ-Dinatriumsalz': 'other salt forms are not approved as a food ingredient in the EU.',
    },
    cautionNote: 'Approved as a Novel Food in the EU only for adults, with pregnant and breastfeeding women explicitly excluded. Long-term human safety data are limited.',
  },
  spermidine: {
    what: 'Naturally occurring polyamine (found among others in wheat germ, aged cheese, soybeans) that is thought to be involved in autophagy processes.',
    useCases: [
      { topic: 'Autophagy/cellular aging', note: 'Animal studies (including mice) show effects on lifespan; applicability to humans is not established, considered an early research stage.' },
      { topic: 'Cognition in old age', note: 'A 12-month study found no significant effect on memory/biomarkers compared to placebo in older adults with subjective cognitive impairment.' },
    ],
    forms: {
      'Spermidinreicher Weizenkeimextrakt': 'synthetic spermidine salts are not covered by this authorization.',
    },
    cautionNote: 'Spermidine-rich wheat germ extract is authorized and regulated in the EU as a novel food. Research on longevity effects comes predominantly from cell/animal models; controlled human studies with hard endpoints are largely lacking.',
  },
  fisetin: {
    what: 'A flavonol that occurs naturally among others in strawberries, apples and onions. It is studied in cellular aging research as a so-called "senolytic candidate."',
    useCases: [
      { topic: 'Senescent cells (early research stage)', note: 'Animal and cell culture studies point to senolytic effects; a first small human pilot trial on frailty in older women is underway, but reliable efficacy data in humans are NOT available.' },
      { topic: 'Inflammation markers', note: 'Under investigation in ongoing clinical trials (for example in sepsis in older patients), results still pending.' },
    ],
    forms: {
      'Fisetin-Extrakt/-Isolat': 'in studies sometimes combined with piperine or lipid formulations. No EU novel food authorization could be found.',
    },
    cautionNote: 'Research on fisetin as a senolytic is predominantly at the animal/cell culture stage; human data come from a few small pilot studies. No established interaction data available. No dedicated EFSA or DGE assessment could be found.',
  },
  boron: {
    what: 'Trace element classified by EFSA as non-essential: a specific physiological function in humans has not yet been identified.',
    useCases: [
      { topic: 'Bone metabolism', note: 'Associated with calcium/vitamin D metabolism in animal studies; no authorized health claim in the EU.' },
    ],
    forms: {
      'Natriumborat/Borax': 'also separately assessed as a food additive (E 285).',
      'Bor-Chelat': 'no separate bioavailability data researched per chelate form.',
    },
    cautionNote: 'The DGE sets no D-A-CH reference value for boron. The BfR recommends a considerably lower maximum amount for food supplements (0.5 mg/day) than the EFSA UL (10 mg/day for adults), since background intake from other sources can already exhaust the UL in children/adolescents. The BfR recommends a consumer notice stating "not suitable for children and adolescents."',
  },
  'l-carnosine': {
    what: 'Dipeptide made of the amino acids beta-alanine and histidine, naturally found mainly in muscle and brain tissue. Acts, among other things, as a pH buffer. To be distinguished from beta-alanine alone, which is metabolized in the body to carnosine and is the more established supplement form.',
    useCases: [
      { topic: 'Muscle pH buffering', note: 'Contributes to 10 to 20 percent of the buffering capacity in muscle fibers; orally supplied carnosine is rapidly split by serum carnosinase, which limits its direct effect on muscle levels.' },
      { topic: 'Antioxidant processes', note: 'In vitro data show scavenging of reactive oxygen species and reduced formation of advanced glycation end products.' },
    ],
    forms: {
      'L-Carnosin (freies Dipeptid)': 'in studies usually 500 mg to 2 g per day.',
      'Zink-L-Carnosin-Komplex': 'a distinct ingredient, not to be equated with pure L-carnosine.',
    },
    cautionNote: 'Because L-carnosine is rapidly broken down by the body\'s own carnosinase, the actual benefit of oral intake compared to beta-alanine supplementation is disputed. No dedicated EFSA or D-A-CH reference value assessment could be found.',
  },
  caffeine: {
    what: 'Methylxanthine alkaloid that blocks adenosine receptors in the central nervous system, thereby stimulating wakefulness, attention and physical performance.',
    useCases: [
      { topic: 'Alertness/concentration', note: 'is used for short-term enhancement of attention.' },
      { topic: 'Sport/pre-workout', note: 'is used before strength and endurance exertion for acute performance enhancement.' },
      { topic: 'Diet products', note: 'is classified in fat-burner products because of its thermogenic effect.' },
    ],
    forms: {
      'Koffein-Anhydrat (Tabletten/Kapseln)': 'usual portioning in mg, easy to dose.',
      'Hochkonzentriertes Koffeinpulver': 'identical amount of powder equals identical amount of caffeine; cannot be measured precisely with household scales/spoons.',
    },
    cautionNote: 'According to BfR communication 46/2024, 5 to 10 g of pure caffeine already counts as a potentially acutely fatal dose for adults: that corresponds to 1 to 2 teaspoons of highly concentrated powder. A death in Germany is documented from accidental ingestion of about 9 g of caffeine powder (Wellershoff, Notarzt 2018;34:85-89). According to the BfR, household kitchen scales are usually only reasonably accurate from 1 g upward: the safe single dose of 0.2 g cannot be reliably measured with them.',
  },
  guarana: {
    what: 'Seeds of a climbing plant from the Amazon region with a caffeine content of up to 6 percent, considerably higher than coffee beans. The stimulating effect is essentially due to this caffeine content.',
    useCases: [
      { topic: 'Cognitive performance', note: 'linked to acute cognitive performance in a systematic review (Hack et al. 2023).' },
      { topic: 'Energy drinks/sports drinks', note: 'common ingredient as a caffeine source.' },
      { topic: 'Sport/pre-workout', note: 'used as a stimulant analogous to isolated caffeine.' },
    ],
    forms: {
      'Guarana-Samenpulver': 'caffeine content varies by batch, often not exactly declared.',
      'Standardisierter Guarana-Extrakt': 'standardized to a defined caffeine content (%), making it easier to dose.',
    },
    cautionNote: 'The effect is predominantly due to the caffeine it contains: the same intake limits effectively apply as for isolated caffeine (see that entry). For non-standardized products, the actual caffeine content per serving is often unclearly declared, which complicates assessing total caffeine intake from multiple sources (coffee, energy drinks).',
  },
  'mct-oil': {
    what: 'Fat made of medium-chain fatty acids (mainly caprylic acid C8 and capric acid C10), usually obtained from coconut or palm kernel oil. It is oxidized directly in the mitochondria without a carnitine transporter and metabolized faster than long-chain fats; part of it is converted into ketone bodies.',
    useCases: [
      { topic: 'Ketogenic diets', note: 'used to increase ketone body production.' },
      { topic: 'Endurance sport', note: 'discussed as an energy source because of rapid fat oxidation.' },
      { topic: 'Clinical nutritional support', note: 'studied over 12 weeks at 6 g/day in older adults at risk of malnutrition (Watanabe & Tsujino 2022).' },
    ],
    forms: {
      'MCT-Öl (flüssig)': 'pure fat, usually a mixture of C8/C10.',
      'MCT-Pulver': 'better dosability/solubility than liquid oil.',
    },
    cautionNote: 'The literature repeatedly notes gastrointestinal discomfort at high single doses; an EFSA/BfR-verified gram threshold for this could not be found, so none is stated here.',
  },
  'l-citrulline': {
    what: 'Non-essential amino acid and intermediate of the urea cycle. It is converted to L-arginine in the kidney; oral intake bypasses the hepatic first-pass breakdown of arginine and thereby raises plasma arginine levels more effectively than direct intake of L-arginine.',
    useCases: [
      { topic: 'Strength/endurance sport', note: 'citrulline malate is often used before training; 8 g as a single dose is the amount most commonly used in studies (Gough et al. 2021).' },
      { topic: 'Vascular function/blood flow', note: 'linked to increased vascular conductance via the arginine nitric oxide metabolic pathway (Alsop & Hauton 2016).' },
      { topic: 'Recovery after exertion', note: 'studied in this context (Gonzalez & Trexler 2020).' },
    ],
    forms: {
      'L-Citrullin (rein)': 'acts as an arginine precursor more effectively than direct L-arginine; increases plasma citrulline about 17-fold and plasma arginine about 3-fold after oral intake (Jirka et al. 2019).',
      'Citrullin-Malat': 'most common sports supplement form; 8 g single dose in the majority of studies.',
    },
    cautionNote: 'Reviews describe mild gastrointestinal discomfort as a possible accompanying effect, but no serious safety signals (Gonzalez & Trexler 2020). An EFSA-reviewed maximum amount figure could not be found.',
  },
  'cranberry-extract': {
    what: 'Pressed juice/extract of the fruit of Vaccinium macrocarpon; contains proanthocyanidins (PAC), which are attributed with inhibiting the adhesion of E. coli fimbriae to the bladder mucosa.',
    useCases: [
      { topic: 'Relief of mild, recurrent lower urinary tract discomfort', note: 'EMA traditional-use indication in women (burning during urination, frequent urge to urinate), after medical exclusion of serious causes.' },
      { topic: 'Prevention of recurrent uncomplicated urinary tract infections', note: 'EMA traditional-use indication, based exclusively on long-standing traditional use, not on clinical studies.' },
      { topic: 'Reduction in the rate of symptomatic recurrent UTIs', note: 'NCCIH: may reduce overall risk by about 25 percent; results in older adults and in pregnancy are inconsistent, no effect on an existing infection has been demonstrated.' },
    ],
    forms: {
      'Presssaft aus frischer Frucht': '50 to 60 ml 2 to 4 times/day (acute symptom relief) or 30 ml once/day (prevention).',
      'Trockenextrakt (standardisiert)': 'common in food supplements, but outside the official monograph dosage.',
    },
    cautionNote: 'The EMA monograph names concurrent use of tacrolimus and warfarin as a contraindication (cranberry can enhance the effect of warfarin; reduced tacrolimus levels were documented in a kidney transplant patient). Cranberry concentrate has a high oxalate content: a history of kidney stones carries an increased risk of recurrent stone formation. In 2025 EFSA rejected a health claim on bacterial defense in the urinary tract for lack of consistent causality evidence (EFSA Journal 2025;23(4):e9319).',
  },
  'd-mannose': {
    what: 'A simple sugar structurally related to glucose; it is barely metabolized and is largely excreted unchanged in the urine. It binds to type 1 fimbriae of E. coli and thereby blocks their adhesion to the bladder mucosa.',
    useCases: [
      { topic: 'Prevention of recurrent urinary tract infections', note: '2026 systematic review (Int Urogynecol J): comparable efficacy to antibiotics in specialized settings, but no advantage over placebo in a broad primary-care population: evidence is inconsistent.' },
    ],
    forms: {
      'Pulver': 'in studies usually 1.5 to 2 g 1 to 3 times/day, no uniform dosing schedule established.',
    },
    cautionNote: 'No EMA monograph and no EFSA assessment for D-mannose as a single substance could be found. Long-term safety data are limited; as a simple sugar it is potentially relevant for people monitoring their sugar intake, even though D-mannose barely enters glucose metabolism.',
  },
  'pumpkin-seed-extract': {
    what: 'Seeds of Cucurbita pepo L.; contain phytosterols, cucurbitin and unsaturated fatty acids. Traditionally used to relieve lower urinary tract symptoms associated with benign prostatic enlargement or overactive bladder.',
    useCases: [
      { topic: 'Relief of lower urinary tract symptoms in benign prostatic hyperplasia or overactive bladder', note: 'EMA traditional-use indication, based exclusively on long-standing use, assuming medical exclusion of serious causes.' },
    ],
    forms: {
      'Weichextrakt': 'single dose 500 mg, twice/day.',
      'Trockenextrakt': 'single dose 105 mg three times/day or 152 mg twice/day.',
      'Fettes Öl': 'single dose 1 to 1.2 g three times/day, daily dose 3 to 4 g.',
    },
    cautionNote: 'According to the EMA, no known interactions with other medicines. Mild gastrointestinal discomfort was frequently reported (about 4 percent). For extracts, safety in pregnancy/breastfeeding is not established; consumption of pumpkin seeds/oil in food amounts, by contrast, is considered safe according to the EMA.',
  },
  'grapefruit-seed-extract': {
    what: 'Extract from the seeds, pulp and white peel of grapefruit (Citrus paradisi), marketed commercially as a "natural antimicrobial agent." No EMA/HMPC monograph exists for this drug: it is not registered as a recognized herbal medicinal drug in the EU.',
    useCases: [
      { topic: 'Marketed as an antimicrobial food supplement ingredient', note: 'no recognized field of application documented by EMA or EFSA; the claimed antimicrobial activity is inconsistently supported by science, see cautionNote.' },
    ],
    forms: {
      'Flüssigextrakt/Tropfen': 'not standardized, no EU-wide uniform concentration or dosage guidance.',
      'Kapseln': 'also without a monograph reference.',
    },
    cautionNote: 'A laboratory analysis (von Woedtke et al., Pharmazie 1999) examined six commercial products: in all five antimicrobially active extracts the synthetic preservative benzethonium chloride was detected, with triclosan and methylparaben additionally found in three: the only extract without a preservative showed no activity. The widely claimed antimicrobial effect thus appears to be based on synthetic additives rather than the plant substance itself. In addition, grapefruit contains furanocoumarins that inhibit intestinal CYP3A4 and can thereby raise blood levels of numerous drugs metabolized through this pathway (Miedziaszczyk et al. 2022), for example tacrolimus, with an increased risk of nephrotoxicity.',
  },
  'colloidal-silver': {
    what: 'Aqueous suspension of finest silver particles/ions, taken orally as "silver water" or applied externally; not a nutrient with a physiological function in the body.',
    useCases: [
      { topic: 'Marketed as a "natural antibiotic"/immune agent', note: 'internal efficacy against infections, colds, cancer and others is not supported by credible studies; laboratory tests of three commercial products showed, according to BARMER, no antibacterial effect whatsoever.' },
    ],
    forms: {
      'Flüssige Suspension': 'is absorbed systemically, not effectively excreted by the body; accumulation in skin, liver, kidney and nerve tissue is possible.',
    },
    cautionNote: 'The central risk is argyria: an irreversible, bluish-gray discoloration of skin and mucous membranes caused by silver deposition, for which the literature reports no satisfactory treatment. Older literature cites cumulative threshold values of about 1 to 1.8 g total silver intake: what matters is the cumulative dose, not a time period. The BfR generally advises against nanosilver in food as long as the data available for a risk assessment remain insufficient. Silver can also inhibit the absorption of certain medicines (including antibiotics, L-thyroxine). In Germany it is legally sold freely as a food supplement, but without permitted disease-related advertising claims, since efficacy is not proven.',
  },
  'amygdalin-b17': {
    what: 'Cyanogenic glycoside found, among others, in bitter apricot kernels and bitter almonds. Not a vitamin: the name "Vitamin B17" is a marketing term without biochemical basis.',
    useCases: [
      { topic: 'Marketed as a purported cancer remedy', note: 'scientifically refuted: the German Cancer Society (Deutsche Krebsgesellschaft) cites a controlled study of 178 patients showing no benefit for tumor stabilization; marketing it as a cancer remedy is illegal medicinal advertising in the EU.' },
    ],
    forms: {
      'Bittere Aprikosenkerne (roh)': 'absorbed to a high degree: amygdalin is split in the gut/tissue into hydrogen cyanide (HCN); 1 g of amygdalin releases about 59 mg of hydrogen cyanide.',
      'Kapseln/Extrakt (Laetrile)': 'not on the market in Germany as a finished medicinal product.',
    },
    cautionNote: 'Amygdalin is classified in Germany as a "medicine of concern" under Section 5 of the German Medicines Act (Arzneimittelgesetz): the BfArM reaffirmed this classification in 2014; under it, amygdalin may not be placed on the market, including through private distribution. LD50 in rats is 405 mg/kg, in mice 443 mg/kg (oral, pure substance). For a 60 kg adult, about 40 apricot kernels within one hour are considered potentially fatal; the body can still metabolically detoxify about 7 kernels per hour. Since 1977 the BfArM has documented 22 poisoning cases worldwide, 4 of them fatal. Vitamin C has been shown to increase the toxicity of amygdalin. For raw bitter apricot kernels as food, the BfR recommends a maximum of 2 kernels per day for adults; children should avoid them entirely (threshold: max. 20 mg hydrogen cyanide/kg raw kernels). No evidence of an anticancer effect from randomized controlled trials.',
  },
  dhea: {
    what: 'The body\'s own steroid hormone from the adrenal cortex, a precursor of testosterone and estrogens; marketed outside Germany as an "anti-aging" preparation.',
    useCases: [
      { topic: 'Anti-aging/hormone optimization (marketing claim)', note: 'the German Society for Endocrinology (Deutsche Gesellschaft für Endokrinologie) sees no relevant effects on metabolic parameters or well-being.' },
      { topic: 'Medically prescribed hormone replacement (prasterone)', note: 'as an approved medicinal substance, for example in postmenopausal vaginal atrophy, exclusively on medical prescription.' },
    ],
    forms: {
      'Kapseln/Tabletten (frei verkäuflich in den USA)': 'orally bioavailable, converts into sex hormones; not marketable as a food supplement in Germany/the EU.',
    },
    cautionNote: 'DHEA is not legally marketable as a food supplement in Germany. The joint expert commission of the BVL and the German states (Länder) determined on 10 February 2025: products containing DHEA are classified as medicinal products from a daily dose of 10 mg, and it additionally advises generally against isolated steroid hormones in products marketed as food. No EU novel food authorization exists to date. The BfR already names 25 mg/day as a threshold above which measurable hormonal changes can occur, particularly in postmenopausal women. Open risks: unclear influence on the growth of hormone-dependent tumors (breast, prostate), possible acne. DHEA is also on the WADA doping list. In the US, by contrast, DHEA is freely available for purchase: the key regulatory difference from Germany/the EU.',
  },
  'garcinia-cambogia-hca': {
    what: 'Extract from the fruit rind of the Malabar tamarind tree (Garcinia gummi-gutta); the main active substance is hydroxycitric acid (HCA), marketed to support weight reduction.',
    useCases: [
      { topic: 'Weight management/"fat blocker" (marketing claim)', note: 'no authorized health claim for HCA/Garcinia under EU Regulation 1924/2006: corresponding advertising claims are not permitted.' },
      { topic: 'Appetite suppression (marketing claim)', note: 'evidence is inconsistent; the current EFSA assessment places safety concerns in the foreground rather than efficacy evidence.' },
    ],
    cautionNote: 'A draft EFSA/COT scientific opinion (30 June 2026, public consultation until 4 May 2026) concludes that no safe intake amounts can be established for (-)-HCA or Garcinia gummi-gutta preparations, due to insufficient data and identified safety concerns: idiosyncratic, drug-like liver injury as well as testicular toxicity in animal studies. The FDA already warned in 2009 about HCA-containing Hydroxycut products because of cases of jaundice, elevated liver values up to liver transplantation and fatal liver failure. The French authority ANSES has banned Garcinia gummi-gutta preparations and additionally advises against use in people with psychiatric or cardiometabolic conditions, pancreatitis or hepatitis in their history, as well as in children and pregnant/breastfeeding women.',
  },
  'green-coffee-extract': {
    what: 'Extract from unroasted coffee beans, standardized to its content of chlorogenic acids: polyphenols that are largely broken down during roasting.',
    useCases: [
      { topic: 'Weight reduction', note: 'in 2011 EFSA did not confirm a health claim on weight loss/body fat reduction for lack of sufficient evidence.' },
      { topic: 'Blood sugar homeostasis', note: 'another claim reviewed and not confirmed by EFSA in the same opinion.' },
      { topic: 'General polyphenol intake', note: 'newer meta-analyses on chlorogenic acid/body weight show inconsistent, mostly small effects in methodically limited individual studies.' },
    ],
    forms: {
      'Extrakt-Kapsel/Tablette': 'typical manufacturer dosage 200 to 800 mg/day; no established effective dose range.',
    },
    cautionNote: 'In 2014 the US Federal Trade Commission (FTC) imposed a fine of 3.5 million USD on the manufacturer Applied Food Sciences: the study used to promote the product (claiming 10.5 percent body weight loss in 22 weeks) was classified as "so hopelessly flawed that no reliable conclusions could be drawn from it": the investigator engaged in India is alleged to have altered weight data, study duration and placebo assignment after the fact. Contains natural caffeine depending on the degree of extraction.',
  },
  'raspberry-ketone': {
    what: 'A flavor compound that occurs naturally in raspberries in the smallest amounts; food supplements use almost exclusively the synthetically produced variant.',
    useCases: [
      { topic: 'Weight reduction/thermogenesis', note: 'a health claim application for raspberry extract (thermogenesis, satiety, weight loss) was rejected by EFSA for lack of sufficient evidence; controlled human studies on raspberry ketone itself are largely lacking.' },
      { topic: 'Flavoring agent (food industry)', note: 'the regulatorily secured main use is as a flavoring agent, not as a food supplement active ingredient.' },
    ],
    forms: {
      'Extrakt-/Reinsubstanz-Kapsel': 'typical manufacturer dosage 100 to 200 mg/day; no established effective dose in humans.',
    },
    cautionNote: 'Raspberry ketone preparations were heavily marketed as "fat burners" from around 2012 onward, even though no controlled human studies on weight reduction existed at that time; a corresponding health claim was rejected by EFSA. The doses used in supplements are considerably higher than what is realistically obtained from fruit: toxicity data on this are scarce.',
  },
  propolis: {
    what: 'A resinous, sticky mixture of plant resins, wax and bee secretions that bees use to seal and disinfect the hive.',
    useCases: [
      { topic: 'Mouth/throat area (lozenges, sprays)', note: 'traditional area of use; a few small clinical studies on cold symptoms exist, but the overall evidence is considered limited and heterogeneous.' },
      { topic: 'External skin application', note: 'traditionally used for minor skin irritations.' },
    ],
    forms: {
      'Alkoholischer Extrakt (Tinktur)': 'pronounced first-pass metabolism of the flavonoids, human bioavailability data rarely studied.',
      'Kapsel/Pulver (Trockenextrakt)': 'typical manufacturer dosage 200 to 500 mg/day.',
    },
    cautionNote: 'Propolis is among the most common contact allergens among natural products: in dermatological patch-test panels, 1.2 to 6.6 percent of tested individuals show sensitization. Because propolis contains plant resins and pollen components, people with pollen allergies as well as those with known allergy to bee stings/bee products are particularly at risk (BfR opinion no. 002/2009).',
  },
  'royal-jelly': {
    what: 'Secretion of the hypopharyngeal glands of young worker bees that serves exclusively as food for the queen bee; sold commercially mostly fresh (requiring cold chain) or freeze-dried.',
    useCases: [
      { topic: 'General vitality/anti-aging marketing', note: 'marketed for its content of B vitamins, proteins and the fatty acid 10-HDA; according to the German consumer advice center (Verbraucherzentrale), there are no reliable human studies for the claimed effects.' },
      { topic: 'Traditional use', note: 'historically widespread mainly in traditional Chinese and folk medicine; scientific support is largely lacking.' },
    ],
    forms: {
      'Frisches Gelée Royale': 'requires cold chain, specific human bioavailability data are scarce.',
      'Lyophilisiertes Pulver/Kapsel': 'typical manufacturer dosage 500 to 1000 mg/day (fresh).',
    },
    cautionNote: 'Royal jelly can, in susceptible individuals, trigger severe, sometimes life-threatening allergic reactions: people with atopy/asthma and those with known allergy to bee stings or other bee products are particularly at risk. The Verbraucherzentrale cites 19 adverse events related to royal jelly preparations reported to the Australian health authority, including three fatalities.',
  },
  'flaxseed-oil': {
    what: 'Oil from flaxseed, its main component is alpha-linolenic acid (ALA): a plant-based omega-3 fatty acid. Unlike fish oil, flaxseed oil does not directly provide EPA/DHA; the body converts ALA only to a limited extent.',
    useCases: [
      { topic: 'Gestational diabetes', note: 'NCCIH: limited evidence that ALA-containing flaxseed oil could affect fasting values and insulin resistance in gestational diabetes.' },
      { topic: 'Type 2 diabetes', note: 'NCCIH: further research needed on whether flaxseed lignan extract or flaxseed oil affects blood sugar control.' },
      { topic: 'General omega-3 intake', note: 'EFSA and the D-A-CH reference values list ALA as a separate reference value distinct from EPA/DHA.' },
    ],
    forms: {
      'Flüssigöl': 'well absorbed, sensitive to oxidation; requires protection from light and refrigerated storage.',
    },
    cautionNote: 'NCCIH names theoretical interactions with anticoagulant medicines (anticoagulants/antiplatelet agents). Safety data for pregnancy/breastfeeding are limited according to NCCIH.',
  },
  'evening-primrose-oil': {
    what: 'Oil from the seeds of the evening primrose plant, rich in gamma-linolenic acid (GLA), an omega-6 fatty acid.',
    useCases: [
      { topic: 'Atopic Dermatitis', note: 'NCCIH: orally taken evening primrose oil showed no proven benefit for symptom relief in studies.' },
      { topic: 'Premenstrual Syndrome/Breast Pain', note: 'NCCIH: likely no more effective than placebo for breast pain; overall evidence is insufficient.' },
      { topic: 'Overall Effectiveness Assessment', note: 'NCCIH overall assessment: insufficient evidence of benefit for any health condition.' },
    ],
    forms: {
      'Kapsel': 'Standard form in consumer products.',
    },
    cautionNote: 'NCCIH classifies evening primrose oil as probably safe for oral use in most adults; the most common side effects are gastrointestinal (abdominal pain, nausea, diarrhea). Given conflicting study results on its effect on labor at the end of pregnancy, NCCIH advises consulting a healthcare professional before taking it alongside other medications. Safety in children is not sufficiently established.',
  },
  'grape-seed-extract': {
    what: 'Extract from grape seeds, rich in proanthocyanidins (OPC), a group of polyphenols with antioxidant properties.',
    useCases: [
      { topic: 'Blood Cholesterol (LDL, Triglycerides)', note: 'NCCIH on a 2020 review (11 studies, 536 participants): positive effects on LDL cholesterol and triglycerides, but not on total cholesterol or HDL.' },
      { topic: 'Blood Pressure', note: 'NCCIH on a 2022 review (19 studies, 1,080 participants): reduction in diastolic blood pressure, no effect on the systolic value.' },
    ],
    cautionNote: 'NCCIH classifies grape seed extract as generally well tolerated with oral or topical use and notes possible interactions with medications in general terms, without citing a specific study. Safety in pregnancy/breastfeeding is unclear according to NCCIH.',
  },
  'saccharomyces-boulardii': {
    what: 'Probiotic yeast (not a bacterium), taxonomically a strain of Saccharomyces cerevisiae marketed as a distinct probiotic species.',
    useCases: [
      { topic: 'Antibiotic-Associated Diarrhea in Children', note: 'Cochrane review (Guo et al. 2019, 33 studies/6,352 children): probiotics overall reduce the incidence to 8% versus 19% in the control group; S. boulardii is named in it as one of the most effective strains at higher dosing (≥5 billion CFU/day).' },
      { topic: 'Travel-Associated Diarrhea/Acute Infectious Diarrhea', note: 'a repeatedly studied application area in the literature, separate from the Cochrane AAD analysis.' },
    ],
    forms: {
      'Kapsel/Sachet (lyophilisierte Hefe)': 'must contain a live cell count (CFU) to be effective.',
    },
    cautionNote: 'Documented, rare but serious cases of fungemia are described in the literature (Enache-Angoulvant & Hennequin 2005: 92 analyzed cases of invasive Saccharomyces infection, with S. boulardii accounting for 51.3%; Rannikko et al. 2021, Finland: 46 fungemia cases over 10 years, 43% of those affected had received the probiotic versus 5% in the control group, 28-day mortality 37%). Risk factors include indwelling central venous catheters and severe immunosuppression: contamination when opening the capsules can be transferred to catheters.',
  },
  'bcaa': {
    what: 'Umbrella term for the three essential amino acids leucine, isoleucine and valine with a branched side chain; unlike most amino acids, they are metabolized primarily in the muscle rather than the liver.',
    useCases: [
      { topic: 'Muscle Protein Synthesis/Muscle Mass', note: 'Leucine is considered a central trigger of muscle protein synthesis. EFSA reviewed the relationship with maintenance/growth of muscle mass in 2010 and found no sufficiently substantiated cause-and-effect relationship: no approved health claim (EFSA Journal 2010;8(10):1790).' },
      { topic: 'Recovery After Exertion', note: 'used in endurance/strength sports to reduce muscle soreness; reviewed by EFSA in the same opinion, also not confirmed.' },
      { topic: 'Muscle Strength at High Altitude', note: 'examined in individual studies on altitude training; EFSA also found no substantiated relationship here.' },
    ],
    forms: {
      'Freie Aminosäuren (Pulver/Kapseln)': 'the common ratio of 2:1:1 (leucine:isoleucine:valine) is a market/research convention, not a regulatory requirement: products range from 2:1:1 to 8:1:1 or 10:1:1.',
    },
    cautionNote: 'Contraindicated in maple syrup urine disease (a congenital defect in BCAA breakdown). High-dose BCAA use in ALS is discussed controversially in the literature (an older study showed increased mortality under high doses). Only under medical supervision in advanced liver or kidney disease.',
  },
  'l-glutamine': {
    what: 'A conditionally essential amino acid and the most important energy source for intestinal cells (enterocytes) and immune cells; becomes scarce in the body under high metabolic stress (e.g. illness, burns).',
    useCases: [
      { topic: 'Intestinal Lining/Intestinal Permeability', note: 'EFSA reviewed the relationship between glutamine and maintenance of intestinal lining integrity in 2009 and found no sufficiently substantiated cause-and-effect relationship: no approved health claim (EFSA Journal 2009;7(9):1235).' },
      { topic: 'Immune Function', note: 'the same EFSA opinion also reviewed normal immune function; also not confirmed.' },
      { topic: 'Recovery in Sport', note: 'used for recovery after intensive training; human studies outside clinical contexts (burns, intensive care) are limited and inconsistent.' },
    ],
    forms: {
      'Freies L-Glutamin (Pulver/Kapseln)': 'the dosages used in clinical settings (e.g. burn medicine) are much higher than in the supplement context: not comparable.',
    },
    cautionNote: 'No EFSA/NIH primary source for a specific limit value could be found. Secondary sources mention caution in liver/kidney insufficiency, but without a solid primary source with a numeric value, so this is noted here only as a hint, not as a verified fact.',
  },
  'green-lipped-mussel-extract': {
    what: 'Extract from the New Zealand green lipped mussel (Perna canaliculus), containing omega-3 fatty acids (including the rare ETA) as well as glycosaminoglycans.',
    useCases: [
      { topic: 'Joint Complaints/Rheumatoid Arthritis', note: 'used for joint complaints. NCCIH rates the human evidence as very limited and does not consider reliable conclusions about its effect possible.' },
      { topic: 'Inflammatory Processes', note: 'lab and animal data on anti-inflammatory lipid components exist; clinical human data are limited.' },
    ],
    forms: {
      'Extraktpulver/Öl-Extrakt (Kapseln)': 'extraction methods (freeze-drying versus lipid extraction) differ significantly between products and affect the active ingredient content.',
    },
    cautionNote: 'Contraindicated in known mussel/shellfish allergy (cross-reaction risk). No EFSA reference value exists. The EU novel food status of the extract could not be conclusively verified from the available sources.',
  },
  'phosphatidylserine': {
    what: 'A phospholipid and natural building block of cell membranes, particularly concentrated in the nerve cell membranes of the brain.',
    useCases: [
      { topic: 'Memory/Cognitive Function in Aging', note: 'EFSA reviewed the relationship in 2010 and found no sufficiently substantiated cause-and-effect relationship, partly because phosphatidylserine derived from bovine versus soy sources was assessed as chemically different substances. No approved health claim, no associated official daily dose (EFSA Journal 2010;8(10):1749).' },
      { topic: 'Stress Response', note: 'also reviewed in the same EFSA opinion, also not confirmed.' },
    ],
    forms: {
      'Soja-basiertes Phosphatidylserin': 'the current market standard, since bovine brain extract is rarely used anymore due to BSE risk.',
    },
    cautionNote: 'No EFSA-recognized interaction is documented. Secondary sources discuss a theoretical interaction with blood-thinning medications, but without a quantified primary source, so this is noted here only as a hint, not as a verified fact. The commonly cited figure of "300 mg/day" comes from individual study designs, not from a regulatory approval.',
  },
  'valerian': {
    what: 'A medicinal plant whose dried root (Valerianae radix) is traditionally used, and approved as a herbal medicinal product, for restlessness and sleep disturbances.',
    useCases: [
      { topic: 'Nervous Tension', note: 'EMA indication (well-established use): relief of mild nervous tension.' },
      { topic: 'Sleep Disturbances', note: 'EMA indication: relief of sleep disturbances, or traditionally to facilitate falling asleep.' },
      { topic: 'Traditional Use', note: 'a traditional herbal medicinal product for mild symptoms of mental stress, based exclusively on long-standing use.' },
    ],
    forms: {
      'Trockenextrakt': 'Well-established use. EMA dosage: single dose 400 to 600 mg, up to 3 times/day; max. 4 single doses/day. Onset of effect only after 2 to 4 weeks of continuous use.',
      'Geschnittene Droge/Pulver/Tee': 'Traditional use, e.g. tea: 0.3 to 3 g of dried herb per 150 ml.',
    },
    cautionNote: 'Not for children under 12 (well-established use), or insufficient data for those under 12 (traditional use). Safety in pregnancy/breastfeeding not established. May impair the ability to drive. According to the EMA monograph, no interactions with other medicines are known. At doses around 20 g, symptoms such as fatigue, abdominal cramps and tightness in the chest have been observed.',
  },
  'st-johns-wort': {
    what: 'A medicinal plant whose herb (Hyperici herba) is classified in the EU as a medicine subject to authorization: depending on the hyperforin/hypericin dose, either as a full medicine (including for mild to moderate depressive episodes) or as a registered traditional herbal medicinal product. A legal classification as a food supplement does not exist in Germany for effective doses.',
    useCases: [
      { topic: 'Mental State', note: 'a medicine used for mild to moderate depressive episodes, or for short-term relief of symptoms in mild depressive disorders.' },
      { topic: 'Temporary Mental Exhaustion', note: 'a traditional medicine for the relief of temporary mental exhaustion, based exclusively on long-standing use.' },
      { topic: 'Skin/Minor Wounds', note: 'traditionally used to support minor skin inflammation and wound closure, for external use.' },
    ],
    forms: {
      'Trockenextrakt (Well-established Use)': 'Single dose 300 to 900 mg depending on preparation, daily dose 500 to 1800 mg. Duration of use usually at least 6 weeks, onset of effect expected within 4 weeks.',
      'Traditionelle Zubereitungen (niedriger dosiert)': 'e.g. dry extract 60 to 180 mg 2 to 3 times/day; what matters regulatorily is not the mg figure alone but the resulting hyperforin content (see cautionNote).',
    },
    cautionNote: 'St. John’s wort preparations are regulated in Germany and the EU as medicines, not as food supplements, regardless of whether well-established use or traditional use applies. Under the German prescription regulation (Arzneimittelverschreibungsverordnung), St. John’s wort is prescription-only specifically for moderate depression; for other indications it remains pharmacy-only, but is still a medicine. The decisive pharmacological threshold is the hyperforin content: at a daily hyperforin dose of 1 mg or less and a duration of use of 2 weeks or less, the EMA/HMPC monograph reports no clinically relevant interactions; at a daily dose above 1 mg, St. John’s wort preparations demonstrably induce CYP3A4, CYP2B6, CYP2C9, CYP2C19 and P-glycoprotein. Concurrent use with coumarin anticoagulants, ciclosporin, tacrolimus, sirolimus, everolimus, protease inhibitors and certain cytostatics (including irinotecan, imatinib) is contraindicated according to the monograph. Explicitly named: the reduction in plasma concentration of hormonal contraceptives can lead to increased breakthrough bleeding and reduced contraceptive reliability. In combination with serotonin reuptake inhibitors, serotonin syndrome has been observed in very rare cases. Intense UV exposure should be avoided during use (photosensitization).',
  },
  'passionflower': {
    what: 'A climbing plant whose herb (Passiflorae herba) is used as a traditional herbal medicine for mild mental strain and to support sleep. Only a traditional use monograph exists, not a well-established use monograph.',
    useCases: [
      { topic: 'Mental Strain', note: 'a traditional medicine for the relief of mild symptoms of mental strain.' },
      { topic: 'Falling Asleep', note: 'traditionally used to support falling asleep, based exclusively on long-standing use.' },
    ],
    forms: {
      'Geschnittenes/pulverisiertes Kraut, Tee': 'Tea: 1 to 2 g of herb per 150 ml, 1 to 4 times/day; powder 0.5 to 2 g, 1 to 4 times/day.',
      'Flüssigextrakte': 'Dosages vary widely depending on extract concentration, e.g. 2 to 4 ml up to 4 times/day.',
    },
    cautionNote: 'Use in children under 12 is not advised due to lack of data. Safety in pregnancy/breastfeeding not established. If symptoms worsen or persist for more than 2 weeks, medical advice should be sought. According to the EMA monograph, no interactions with other medicines are known.',
  },
  'echinacea': {
    what: 'Purple coneflower, whose pressed juice from the fresh herb (Echinacea purpurea) is used as a medicine for the short-term prevention and relief of the common cold.',
    useCases: [
      { topic: 'Common Cold', note: 'a medicine for the short-term prevention and relief of the common cold (EMA well-established use for pressed juice from fresh herb).' },
      { topic: 'Minor Superficial Wounds', note: 'a traditional medicine used for minor superficial wounds, for external use.' },
    ],
    forms: {
      'Presssaft aus frischem Kraut': 'Single dose 1.5 to 4.5 ml, daily dose 6 to 9 ml. Not to be used for longer than 10 days; start of use at the first signs of a cold.',
      'Presssaft/Trockenpresssaft, äußerlich': '10 to 20 g per 100 g pressed juice as an ointment, 2 to 3 times/day on the affected area; max. 1 week.',
    },
    cautionNote: 'Contraindicated in known hypersensitivity to Asteraceae/Compositae. Not advised in progressive systemic diseases, autoimmune diseases, immunodeficiency, immunosuppression and disorders of the white blood cell count. Risk of severe hypersensitivity reactions in atopic individuals. According to the EMA monograph, no interactions with other medicines are known; NCCIH additionally points to theoretical, not conclusively clarified interaction concerns with immunosuppressants. Applies exclusively to Echinacea purpurea, herba recens (fresh plant pressed juice): for Echinacea angustifolia (root) there is no comparable EMA monograph with dosage information.',
  },
  'reishi': {
    what: 'A bracket fungus with a glossy, lacquered surface, traditionally used in East Asia; sold as fruiting body or mycelium powder/extract.',
    useCases: [
      { topic: 'Immune Modulation', note: 'small clinical studies and animal models show effects on immune cells; robust human data on clinical endpoints are lacking.' },
      { topic: 'Lower Urinary Tract Symptoms in Men', note: 'small human studies report symptom changes: evidence is considered limited.' },
      { topic: 'Blood Sugar/Cholesterol in Type 2 Diabetes', note: 'no support found for an effect on cardiovascular risk factors in controlled studies.' },
      { topic: 'Antitumor/Chemoprotective Effects', note: 'exclusively cell culture and animal models: not transferable to humans.' },
    ],
    forms: {
      'Fruchtkörper-Extrakt/-Pulver': 'considered not novel EU-wide (a history of consumption before 1997 is documented).',
      'Myzel-Pulver/-Extrakt': 'classified as novel food according to an AESAN consultation document (2019): no documented history of consumption before 15 May 1997 and no proven equivalence to the fruiting body.',
    },
    cautionNote: 'Case reports of acute liver injury are documented, including a case published in 2023 with a marked rise in ALT/AST after several days of use combined with alcohol (suspected mechanism: CYP2E1 inhibition slows ethanol breakdown). Other reported effects: nausea, insomnia, dry mouth, increased bleeding risk in combination with anticoagulants/antiplatelet drugs, possible enhancement of immunosuppressant effects. Reishi spore powder can increase the tumor marker CA72-4 (relevant for laboratory diagnostics, not a sign of disease).',
  },
  'chaga': {
    what: 'A parasitic bracket fungus that grows mainly on birch trees in cold climate zones; traditionally used as tea/decoction, today also as powder/extract.',
    useCases: [
      { topic: 'Immune Modulation', note: 'only cell culture/animal models; safety and efficacy in humans have not yet been examined in clinical studies.' },
      { topic: 'Antioxidant Effect', note: 'laboratory studies (cell culture) show radical-scavenging effects: no human studies.' },
      { topic: 'Anti-Inflammatory Effects/Hepatoprotection', note: 'exclusively preclinical (animal models).' },
    ],
    forms: {
      'Getrocknetes Pulver/Sud (traditionell)': 'a traditional tea preparation with a long history of consumption in Northern Europe/Russia.',
      'Konzentrierter Extrakt (Wasser/Alkohol)': 'higher active ingredient content and presumably also higher oxalate content than traditional tea: this is precisely where the reported poisoning cases occurred.',
    },
    cautionNote: 'Several published cases of acute oxalate nephropathy after chaga consumption are documented, including a case published in 2022 (10 to 15 g of powder/day over 3 months plus 500 mg of vitamin C daily) with acute kidney failure and calcium oxalate crystals in the kidney biopsy. Additionally, increased bleeding risk with anticoagulants/antiplatelet drugs and additive blood-sugar-lowering effects with antidiabetic drugs. The EU novel food status for each extract form could not be conclusively verified from the available sources.',
  },
  'cordyceps': {
    what: 'An umbrella term for two different fungus species: Cordyceps sinensis (wild-growing, parasitizes caterpillars, rare/protected) and Cordyceps militaris (cultivable on grain substrate, and by far the more common actual source of commercial preparations).',
    useCases: [
      { topic: 'Kidney Function After Transplantation', note: 'limited clinical evidence for supportive effects.' },
      { topic: 'Athletic Performance/Endurance', note: 'inconsistent results in human studies on healthy people: no consistent evidence.' },
      { topic: 'Adjuvant Cancer Care', note: 'several analyses conclude that the evidence for a benefit is insufficient.' },
    ],
    forms: {
      'Wildgesammelter Pilz-Raupen-Komplex (C. sinensis)': 'the traditional form, rare, expensive, subject in part to species protection/export regulation in the countries of origin.',
      'Fermentiertes Myzel/Kulturextrakt (meist C. militaris)': 'the most common commercial form; cordycepin content varies widely depending on culture conditions and is barely standardized.',
    },
    cautionNote: 'One case of increased bleeding after tooth extraction is documented, along with a theoretically increased bleeding risk from inhibition of platelet aggregation (relevant in combination with anticoagulants) and additive effects with antidiabetic drugs/insulin. The EU novel food classification of concentrated extracts is inconsistently documented and could not be conclusively verified from the available primary sources.',
  },
  'maitake': {
    what: 'A culinary and medicinal mushroom from East Asia that grows in clusters on tree trunks; studied medically mainly for its beta-glucan-rich extract fractions ("D-fraction"/"MD-fraction").',
    useCases: [
      { topic: 'Immune Modulation in Cancer Patients', note: 'small phase I/II studies in breast cancer show immunomodulatory effects: no large controlled studies.' },
      { topic: 'Reduction of Chemotherapy-Related Side Effects', note: 'reported in individual cancer types in small studies.' },
      { topic: 'Blood Sugar/Cholesterol/Blood Pressure', note: 'extensive animal/cell culture data; human evidence is considerably weaker and limited.' },
    ],
    forms: {
      'Fruchtkörper-Extrakt/-Pulver': 'considered not novel EU-wide (a history of consumption before 1997 as a culinary mushroom is documented).',
      'Myzel-Pulver/-Extrakt': 'classified as novel food according to an AESAN consultation document (2019): no documented history of consumption before 15 May 1997 and no proven equivalence to the fruiting body.',
      'Standardisierte D-Fraktion/MD-Fraktion': 'a specific, beta-glucan-enriched extract fraction from clinical studies: not equivalent to generic maitake powder from retail.',
    },
    cautionNote: 'A case report of increased INR under maitake extract in combination with warfarin is documented, along with additive blood-sugar-lowering effects with antidiabetic drugs and increased bleeding risk with anticoagulants. Asymptomatic eosinophilia is named as a possible, usually mild side effect.',
  },
  'shiitake': {
    what: 'An East Asian culinary and medicinal mushroom sold both as food (fruiting body, fresh/dried) and as a food supplement in extract form.',
    useCases: [
      { topic: 'Immune System (General)', note: 'traditionally used to support the immune system; small randomized human studies show effects on immune parameters: a weak, small-scale body of data.' },
      { topic: 'Alongside Chemotherapy (Lentinan)', note: 'in Japan, injectable lentinan is approved as a medicine alongside chemotherapy for certain types of cancer: this concerns a regulated medicine, not the freely available food supplement.' },
      { topic: 'Cholesterol Levels', note: 'laboratory evidence and a few small human studies; no robust clinical evidence.' },
    ],
    forms: {
      'Fruchtkörper (frisch/getrocknet)': 'no standardized active ingredient amount; the basis of the traditional history of consumption in the EU.',
      'Polysaccharid-Extrakt (Lentinan, teils als "LEM" aus Myzel)': 'concentration varies widely depending on the extraction method; injectable lentinan (a medicine in Japan) is not equivalent to oral capsule preparations.',
    },
    cautionNote: 'After eating raw or insufficiently heated shiitake, a toxic reaction to lentinan can occur: an itchy, streak-like skin rash ("shiitake dermatitis"). Lentinan is heat-labile and breaks down with sufficient heating. Other reported side effects: eosinophilia, photosensitivity, gastrointestinal complaints, and isolated cases of hypersensitivity pneumonitis from spore inhalation. The whole fruiting body is considered a traditional food (no novel food classification); a specific sterile aqueous mycelium extract preparation was approved as a novel food ingredient by Commission Decision 2011/73/EU: this applies only to that single extract product, not to shiitake in general.',
  },
  'coriolus-versicolor': {
    what: 'A wood-dwelling bracket fungus that is not considered a culinary mushroom, but is used exclusively as a standardized extract (mainly PSK and PSP) in traditional Chinese medicine and as a food supplement.',
    useCases: [
      { topic: 'Alongside Chemotherapy, Stomach Cancer (PSK)', note: 'PSK is approved as a medicine in Japan; large randomized studies showed longer survival in addition to chemotherapy: a regulated medicine in Japan, with no comparable status as a freely available supplement in the EU/Germany.' },
      { topic: 'Colorectal Cancer (Adjuvant)', note: 'an analysis of several studies showed fewer relapses and longer survival with PSK after surgery.' },
      { topic: 'Lung Cancer', note: 'randomized studies showed changes in immune function, weight and well-being: no consistent survival data.' },
    ],
    forms: {
      'Polysaccharid-Extrakt (PSK/PSP)': 'standardized protein-polysaccharide complexes from fungal culture; regulated as a medicine in Japan, without this status in Europe. Capsule, powder or tea form.',
    },
    cautionNote: 'Rare reported side effects: dark-colored stool, darkening of the fingernails. No use in pregnancy/breastfeeding without medical consultation, due to lack of safety data. The FDA has not approved coriolus extracts as a cancer therapy. The EU novel food status could not be conclusively verified from the available sources; since the mushroom was traditionally used not as a food but only as an extract, a novel food classification is plausible but not documented by a retrievable primary source.',
  },
  'agaricus-blazei': {
    what: 'A culinary mushroom native to Brazil and cultivated in Japan with an almond-like aroma; sold as fruiting body (dried/extract) or as mycelium powder, with a regulatory status that differs depending on the mushroom part.',
    useCases: [
      { topic: 'Alongside Chemotherapy/Quality of Life', note: 'individual studies in cancer patients show increased NK cell activity and quality of life with oral extract: no broad evidence base.' },
      { topic: 'Blood Sugar/Insulin Resistance', note: 'indications of reduced insulin resistance in women with diabetes: preliminary data.' },
      { topic: 'Multiple Myeloma', note: 'no survival benefit despite measurable immunomodulatory effects.' },
    ],
    forms: {
      'Fruchtkörper (getrocknet/Extrakt)': 'considered a food in the EU with a history of consumption before 1997.',
      'Myzelpulver (dehydriert)': 'no proven equivalence to the fruiting body in nutrient composition/active ingredient content: classified as novel food (Regulation (EU) 2015/2283).',
    },
    cautionNote: 'Laboratory samples have in some cases shown high levels of inorganic arsenic. Reported side effects: liver function disorders, lip swelling. Can inhibit CYP3A4 and thereby affect the breakdown of other medications. Not to be used in known mushroom allergy. According to the AESAN/EU Commission consultation (October 2019): the fruiting body has a documented history of consumption in the EU before 15 May 1997 and is not a novel food; the dehydrated mycelium powder does not have this history of consumption and is classified as novel food. For supplement labeling this means specifically: products based on the fruiting body are unproblematic, products based on mycelium require novel food approval.',
  },
  'nicotinamide-riboside': {
    what: 'A nucleoside form of vitamin B3 that is converted via the NRK1/NRK2 enzymes to NMN and further to NAD+: a different metabolic pathway than NMN. NR has held an EU novel food approval with defined maximum amounts since 2020, while no comparable approval with defined maximum amounts exists for NMN in the EU.',
    useCases: [
      { topic: 'NAD+ Levels in Blood', note: 'RCTs show a dose-dependent increase in NAD+ after oral intake (Conze et al. 2019, up to 1000 mg/day over 8 weeks).' },
      { topic: 'Metabolism in Obesity', note: 'an RCT in overweight men found no change in insulin sensitivity despite the NAD+ increase (Dollerup et al. 2018): human data on metabolic effects are inconsistent.' },
      { topic: 'Cognitive Function in Aging', note: 'a small placebo-controlled pilot study (2023) in mild cognitive impairment: early data not yet replicated.' },
    ],
    forms: {
      'Nicotinamid-Ribosid-Chlorid (NRC)': 'the only form with EU novel food approval; used in studies mostly at 250 to 1000 mg/day.',
    },
    cautionNote: 'Well tolerated in RCTs up to 1000 mg/day over 8 weeks (mild gastrointestinal complaints possible). Doses above 1000 mg/day have so far only been studied in small studies in specific patient groups, not assessed for the general population.',
  },
  'urolithin-a': {
    what: 'A metabolite formed by gut bacteria from ellagitannin-containing foods (pomegranate, some berries, walnuts): not everyone produces it in a relevant amount. Unlike NMN/NR (NAD+ precursors) or spermidine (a general autophagy inducer), urolithin A is specifically associated with mitophagy (the targeted breakdown of damaged mitochondria).',
    useCases: [
      { topic: 'Muscle Strength and Endurance in Middle/Older Age', note: 'an RCT with 88 participants (Singh et al. 2022, 500/1000 mg/day over 4 months): approximately 12% higher muscle strength and higher VO2peak values; the primary endpoint, however, missed statistical significance.' },
      { topic: 'Mitochondrial Biomarkers', note: 'the first placebo-controlled human study (Andreux et al. 2019) found changes in plasma acylcarnitines and muscle gene expression after 4 weeks: surrogate parameters, not a clinical endpoint.' },
    ],
    forms: {
      'Synthetisches/gereinigtes Urolithin A': 'intake via food is strongly dependent on the individual gut microbiome; as an isolated substance, intake is standardized, used in studies mostly at 500 to 1000 mg/day.',
    },
    cautionNote: 'Described as well tolerated with mild side effects in human studies up to 1000 mg/day over up to 4 months. The US FDA classified urolithin A as GRAS for food in 2018, in the range of 250 mg to 1 g per serving. No EU novel food approval found: legal status as a food supplement in the EU is therefore inconsistent/unclear. Overall few, mostly small studies, some co-funded by the ingredient manufacturer; independent replication and long-term data are lacking.',
  },
  'alpha-ketoglutarate': {
    what: 'A natural intermediate of the citric acid cycle (cellular energy metabolism), usually supplemented as the calcium salt (Ca-AKG). Unlike NMN/NR or spermidine, AKG is associated in animal models with epigenetic aging markers and lifespan effects: the human data among the longevity substances in the database is the earliest and weakest.',
    useCases: [
      { topic: 'Lifespan in Animal Models', note: 'in C. elegans, nearly doubled lifespan (Chin et al. 2014); in mice, extended lifespan and a shortened frailty phase under Ca-AKG (Asadi Shahmirzadi et al. 2020): animal studies, not directly transferable to humans.' },
      { topic: 'Biological Age in Humans', note: 'an uncontrolled, non-randomized user study reported a calculated reduction in epigenetic age after about 7 months, though with a combination of Ca-AKG and other vitamins and without a placebo group, so the contribution of AKG alone cannot be determined.' },
      { topic: 'Ongoing Controlled Human Research', note: 'an RCT in the recruitment/feasibility phase in biologically older, middle-aged adults is underway: results are still pending.' },
    ],
    forms: {
      'Calcium-Alpha-Ketoglutarat (Ca-AKG)': 'as the calcium salt, more stable and better characterized in studies than free alpha-ketoglutaric acid; systematic bioavailability data in humans are lacking, no established standard dose.',
    },
    cautionNote: 'No systematic human safety studies found beyond a methodologically weak user observation and an ongoing RCT recruitment. No EU novel food approval and no maximum amount found: legal status as a food supplement in the EU is therefore unclear. No completed controlled human study demonstrating efficacy.',
  },
  'ginger': {
    what: 'A spice and medicinal plant whose rhizome (Zingiberis rhizoma) is used as a herbal medicinal product and food supplement.',
    useCases: [
      { topic: 'Motion Sickness', note: 'EMA indication (well-established use): prevention of nausea and vomiting in motion sickness.' },
      { topic: 'Digestive Complaints', note: 'traditionally used for mild spasmodic gastrointestinal complaints and bloating.' },
    ],
    forms: {
      'Pulver': 'The EMA monograph refers to the powdered rhizome in capsules or tablets.',
      'Extrakt': 'Concentrates standardized for pungent compounds (gingerols); composition differs by manufacturer.',
      'Tee/Frischwurzel': 'Traditional form of use; the content of active compounds varies widely.',
    },
    cautionNote: 'With gallstones, clarify use with a doctor first. The safety of high doses in pregnancy is not conclusively established; use for pregnancy-related nausea belongs under medical supervision. An influence on blood clotting is under discussion, the data are inconsistent.',
  },
  'clove': {
    what: 'Dried flower buds of the clove tree (Caryophylli flos); the essential oil with its main constituent eugenol is traditionally applied locally.',
    useCases: [
      { topic: 'Mouth and Throat', note: 'traditionally used for minor inflammation of the mouth and throat lining (local application).' },
      { topic: 'Toothache', note: 'traditionally used for temporary local application for toothache; no substitute for dental care.' },
    ],
    forms: {
      'Ätherisches Öl': 'Apply only diluted and locally; undiluted it irritates skin and mucous membranes.',
      'Ganze/gemahlene Knospen': 'Spice and traditional form of use, e.g. as an infusion for rinsing.',
    },
    cautionNote: 'Do not use the essential oil undiluted and do not use it in children. In laboratory studies eugenol inhibits platelet aggregation; anyone taking anticoagulant medication discusses regular high-dose use with a doctor. Beyond culinary amounts, data for pregnancy and breastfeeding are lacking.',
  },
  'chamomile': {
    what: 'A medicinal plant whose flowers (Matricariae flos) are among the longest-documented traditional herbal medicines in Europe.',
    useCases: [
      { topic: 'Digestive Tract', note: 'traditionally used for mild gastrointestinal complaints such as bloating and mild cramps.' },
      { topic: 'Cold Symptoms', note: 'traditionally used as an inhalation or rinse for cold symptoms in the mouth and throat.' },
      { topic: 'Skin and Mucosa', note: 'traditionally used externally for minor inflammation of skin and mucous membranes.' },
    ],
    forms: {
      'Tee/Aufguss': 'The classic form of use for the flowers.',
      'Extrakt': 'Liquid or solid preparations, also for rinses and compresses.',
    },
    cautionNote: 'Do not use with a known allergy to Asteraceae (e.g. mugwort, arnica). For highly concentrated preparations, sufficient data for pregnancy and breastfeeding are lacking.',
  },
  'peppermint-oil': {
    what: 'Essential oil from the leaves of peppermint; as a gastro-resistant capsule one of the best-studied herbal products for the gut.',
    useCases: [
      { topic: 'Irritable Bowel', note: 'EMA indication (well-established use): relief of mild cramp-like complaints in irritable bowel syndrome, in gastro-resistant capsules.' },
      { topic: 'Tension Headache', note: 'traditionally applied externally to the temples and forehead for tension headache.' },
      { topic: 'Cold Symptoms', note: 'traditionally used as a rub or inhalation for coughs and colds.' },
    ],
    forms: {
      'Magensaftresistente Kapseln': 'Decisive for gut use: the oil is meant to be released only in the intestine, otherwise heartburn and belching can occur.',
      'Ätherisches Öl äußerlich': 'Diluted for use on the skin; do not apply to the face of infants and small children.',
    },
    cautionNote: 'Not with bile duct obstruction, gallbladder inflammation or severe liver damage. Reflux complaints can worsen. Do not apply menthol-containing preparations to the face or chest of infants and small children (risk of breathing spasms).',
  },
  'lemon-balm': {
    what: 'A medicinal plant whose leaves (Melissae folium) are traditionally used for restlessness and gastrointestinal complaints.',
    useCases: [
      { topic: 'Restlessness and Sleep', note: 'traditionally used for mild symptoms of stress and to support falling asleep.' },
      { topic: 'Digestive Tract', note: 'traditionally used for mild spasmodic gastrointestinal complaints and bloating.' },
    ],
    forms: {
      'Tee/Aufguss': 'The classic form of use for the leaves.',
      'Trockenextrakt': 'In capsules or combination products, often together with valerian.',
    },
    cautionNote: 'Insufficient data for children under 12 and for pregnancy and breastfeeding. Can cause drowsiness; consider the effect on the ability to drive.',
  },
  'sage': {
    what: 'A medicinal plant whose leaves (Salviae officinalis folium) are traditionally used for excessive sweating and in the mouth and throat.',
    useCases: [
      { topic: 'Sweating', note: 'traditionally used for excessive perspiration.' },
      { topic: 'Mouth and Throat', note: 'traditionally used as a rinse or gargle for minor inflammation of the mouth and throat lining.' },
      { topic: 'Digestive Complaints', note: 'traditionally used for mild digestive complaints such as heartburn and bloating.' },
    ],
    forms: {
      'Tee/Aufguss': 'The classic form of use for the leaves, also for gargling.',
      'Extrakt': 'Liquid or solid preparations; the thujone content depends on the preparation.',
    },
    cautionNote: 'Sage contains thujone. Avoid high-dose or long-term intake; the EMA states use limits of a few weeks. Do not use in pregnancy and breastfeeding (thujone; sage can also reduce milk production, an effect that is deliberately used when weaning).',
  },
  'cinnamon': {
    what: 'Bark of the Ceylon cinnamon tree (Cinnamomi cortex); documented as a spice and traditional herbal medicine for digestive complaints.',
    useCases: [
      { topic: 'Digestive Complaints', note: 'traditionally used for mild spasmodic gastrointestinal complaints, bloating and a feeling of fullness.' },
      { topic: 'Blood Sugar', note: 'studied in connection with glucose metabolism; the evidence is inconsistent and does not justify self-treatment.' },
    ],
    forms: {
      'Ceylon-Zimt': 'Contains considerably less coumarin than cassia cinnamon; the EMA monograph refers to this species.',
      'Cassia-Zimt': 'Rich in coumarin. The BfR warns against regularly high amounts (liver strain), especially in children.',
    },
    cautionNote: 'Cassia cinnamon contains coumarin, which can strain the liver in regularly high amounts (BfR assessment); for regular intake, prefer Ceylon cinnamon. Anyone taking blood-sugar-lowering medication discusses cinnamon products with a doctor.',
  },
  'garlic': {
    what: 'Bulb of garlic (Allii sativi bulbus); traditionally documented in connection with cardiovascular health and cold symptoms.',
    useCases: [
      { topic: 'Cardiovascular', note: 'traditionally used to support cardiovascular health; effects on blood lipids and blood pressure are being studied, the evidence is inconsistent.' },
      { topic: 'Cold Symptoms', note: 'traditionally used for cold symptoms.' },
    ],
    forms: {
      'Pulver': 'Dried, ground garlic powder; allicin yield varies greatly with processing.',
      'Gealterter Extrakt': 'Low odour; a different constituent profile than fresh garlic.',
    },
    cautionNote: 'Garlic products can intensify the effect of anticoagulant medication; discuss intake with a doctor before surgery and pause it in good time. Harmless in usual culinary amounts.',
  },
  'artichoke': {
    what: 'Leaves of the artichoke (Cynarae folium); traditionally used for digestive complaints related to bile and fat digestion.',
    useCases: [
      { topic: 'Digestive Complaints', note: 'traditionally used for a feeling of fullness, bloating and complaints after high-fat meals.' },
    ],
    forms: {
      'Trockenextrakt': 'The usual form in capsules and tablets.',
      'Frischpflanzensaft': 'Traditional liquid form of use.',
    },
    cautionNote: 'Not with bile duct obstruction; with gallstones only after consulting a doctor. Do not use with an allergy to Asteraceae.',
  },
  'hawthorn': {
    what: 'Leaves with flowers of hawthorn (Crataegi folium cum flore); traditionally documented for nervous heart complaints and to support sleep.',
    useCases: [
      { topic: 'Nervous Heart Complaints', note: 'traditionally used for temporary nervous heart complaints, after serious causes have been ruled out by a doctor.' },
      { topic: 'Restlessness and Sleep', note: 'traditionally used for mild symptoms of stress and to support falling asleep.' },
    ],
    forms: {
      'Trockenextrakt': 'The usual form in capsules and tablets.',
      'Tee/Aufguss': 'Traditional form of use for the leaves with flowers.',
    },
    cautionNote: 'Heart complaints always belong in medical evaluation; hawthorn is no substitute for heart medication. Anyone taking heart medication discusses additional use with a doctor. Sufficient data for pregnancy and breastfeeding are lacking.',
  },
  'elderflower': {
    what: 'Flowers of the black elder (Sambuci flos); traditionally used for cold symptoms.',
    useCases: [
      { topic: 'Cold Symptoms', note: 'traditionally used to relieve cold symptoms, classically as a hot infusion.' },
    ],
    forms: {
      'Tee/Aufguss': 'The classic form of use for the dried flowers.',
      'Extrakt': 'A component of many combination cold products.',
    },
    cautionNote: 'Unripe berries and other parts of the elder plant contain substances that can cause nausea when raw; the monograph refers to the flowers. Sufficient data for pregnancy and breastfeeding are lacking.',
  },
  'licorice-root': {
    what: 'Root of the licorice shrub (Liquiritiae radix); traditionally used for stomach complaints and coughs, the base material of licorice confectionery.',
    useCases: [
      { topic: 'Stomach Complaints', note: 'traditionally used for digestive complaints such as heartburn and stomach pressure.' },
      { topic: 'Cough', note: 'traditionally used as an expectorant for coughs with thick mucus.' },
    ],
    forms: {
      'Tee/Aufguss': 'The classic form of use for the cut root.',
      'Extrakt': 'Also available deglycyrrhizinated (DGL); the blood-pressure-relevant fraction is then largely removed.',
    },
    cautionNote: 'With regularly high intake, glycyrrhizin can raise blood pressure and lower potassium levels. Do not use for longer than 4 weeks without medical advice. Not with high blood pressure, kidney or liver disease, and not in pregnancy. Caution in combination with diuretic medication (additional potassium loss).',
  },
  'lavender-oil': {
    what: 'Essential oil and flowers of true lavender; traditionally used for restlessness and to support sleep.',
    useCases: [
      { topic: 'Restlessness', note: 'traditionally used for mild symptoms of stress and inner restlessness; a standardized lavender oil is approved as a medicine in Germany.' },
      { topic: 'Sleep', note: 'traditionally used to support falling asleep, also as a scent application.' },
    ],
    forms: {
      'Ätherisches Öl in Kapseln': 'The EMA monograph on oral use refers to this form; it can initially cause belching.',
      'Tee/Duftanwendung': 'Traditional forms of use for the flowers and the oil.',
    },
    cautionNote: 'Insufficient data for children under 12 and for pregnancy and breastfeeding. Persistent restlessness or sleep problems belong in medical evaluation.',
  },
  'fennel': {
    what: 'Fruits of fennel (Foeniculi fructus); traditionally used for bloating and mild digestive complaints.',
    useCases: [
      { topic: 'Bloating', note: 'traditionally used for mild spasmodic gastrointestinal complaints and bloating.' },
      { topic: 'Cough', note: 'traditionally used as a mild expectorant for coughs associated with colds.' },
    ],
    forms: {
      'Tee/Aufguss': 'The classic form of use for the freshly crushed fruits.',
      'Ätherisches Öl': 'Concentrated form; observe the duration of use and dosage stated in the monograph.',
    },
    cautionNote: 'Fennel contains estragole; the EMA advises using tea and oil only for limited periods and not giving fennel tea to children under 4 as self-medication. Do not use with an allergy to Apiaceae.',
  },
};
