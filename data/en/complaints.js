/**
 * data/en/complaints.js
 * ─────────────────────────────────────────────────────────────
 * English text overlay for data/complaints.js. German stays canonical;
 * this file supplies the free-text fields for the English UI.
 *
 * STRUCTURE
 * COMPLAINTS_EN[id] mirrors one entry of the DE `COMPLAINTS` array,
 * keyed by the complaint's stable `id` (fatigue, sleep-problems, ...).
 * Shape:
 *   {
 *     label: string,
 *     intro: string,
 *     contextAreas: string[],              // same length & order as DE
 *     redFlags: string[],                  // same length & order as DE
 *     relatedNutrients: [{ substanceId, note }],  // same length, order
 *                                                  // and substanceId
 *                                                  // sequence as DE
 *     questionsForProfessional: string[],  // same length & order as DE
 *   }
 *
 * `synonyms` and `sources` are NOT overlaid: synonyms already mix in
 * English search terms in the DE file, and `sources` labels are already
 * English (they name English-language publications).
 *
 * SCOPE NOTE: the task that produced this file named five free-text
 * groups (Einordnung, Ursachenbereiche, Warnsignale, Naehrstoffbezuege,
 * Fragen fuer die Praxis) — intro, contextAreas, redFlags,
 * relatedNutrients, questionsForProfessional. `label` was not in that
 * list, but it is displayed directly by ComplaintSearch.js
 * (buildComplaintView returns `label` unchanged), so an English UI
 * without it would show German complaint names. It is included here
 * as a deliberate, documented addition, not scope creep left
 * unexplained.
 *
 * WORDING RULES (compliance-critical, see project CLAUDE.md):
 * - Strictly descriptive. No health claims, no recommendations.
 * - `redFlags` stay observational ("occurs together with", "comes
 *   with"), never interpretive ("indicates", "points to", "suggests").
 *   That mirrors the DE rule verbatim (see data/complaints.js header).
 * - No em dash ("—") in any of these strings.
 * - "empfohlen"/"empfiehlt" is rendered as "advise(s)", never
 *   "recommend(s)", to avoid the banned word while staying faithful to
 *   citations of public sources (NHS, IQWiG, NCCIH, MSD, Cleveland
 *   Clinic) — those sources' own guidance is being reported, not this
 *   app's.
 */

export const COMPLAINTS_EN = {
  fatigue: {
    label: 'Persistent fatigue',
    intro:
      'Fatigue is one of the most nonspecific symptoms there is. Everything from everyday factors to conditions requiring treatment can be behind it. Fatigue alone does not point to a cause or a nutrient deficiency.',
    contextAreas: [
      'Sleep quality and sleep duration',
      'Psychological strain: stress, grief, low mood',
      'Hormonal changes, for example pregnancy or menopause',
      'Acute or recent infections',
      'Medication side effects',
      'Thyroid function',
      'Everyday activity and diet',
    ],
    redFlags: [
      'Occurs together with unintended weight loss',
      'Persists for several weeks without an obvious reason',
      'Occurs together with noticeable mood changes',
      'Comes with snoring or breathing pauses during sleep',
      'Occurs together with shortness of breath, heart palpitations or noticeable paleness',
    ],
    relatedNutrients: [
      { substanceId: 'iron', note: 'Studied in connection with fatigue accompanied by shortness of breath or paleness, in relation to iron deficiency anaemia. Detectable only through blood tests, not through the symptom itself.' },
      { substanceId: 'vitamin-b12', note: 'A deficiency is cited as a cause of pronounced fatigue, affecting mainly older adults and people eating a vegan diet.' },
      { substanceId: 'folate', note: 'Studied together with vitamin B12 in connection with changes in blood count.' },
      { substanceId: 'vitamin-d3', note: 'Frequently discussed; the evidence on a causal link is mixed.' },
    ],
    questionsForProfessional: [
      'Which blood values are usually checked first for persistent fatigue?',
      'Could the fatigue be related to a medication I am taking?',
      'From what point would a sleep study make sense?',
    ],
  },

  'sleep-problems': {
    label: 'Trouble falling or staying asleep',
    intro:
      'Sleep problems range from temporary stress to treatable underlying conditions. The symptom alone says nothing about the cause.',
    contextAreas: [
      'Psychological strain and racing thoughts',
      'Caffeine, alcohol and nicotine, even hours before bedtime',
      'Physical complaints: pain, needing to urinate at night, hot flushes',
      'Sleep-related disorders such as sleep apnoea or restless legs',
      'Environment: noise, temperature, shift work, jet lag',
      'Medication side effects',
    ],
    redFlags: [
      'Persists for months despite changed sleep habits',
      'Comes with breathing pauses, loud snoring or shortness of breath',
      'Occurs together with involuntary leg movements',
      'Noticeably affects daily life',
    ],
    relatedNutrients: [
      { substanceId: 'melatonin', note: 'For chronic insomnia, NCCIH sees no sufficiently solid evidence. Cognitive behavioural therapy for insomnia is considerably better supported.' },
      { substanceId: 'magnesium', note: 'Frequently mentioned in this context, but NHS and IQWiG overviews of sleep disorders do not list it as an independent factor.' },
    ],
    questionsForProfessional: [
      'Could one of my medications be a cause?',
      'Should sleep apnoea or restless legs syndrome be checked?',
      'Would behavioural therapy for sleep disorders make sense for me?',
    ],
  },

  'muscle-cramps': {
    label: 'Muscle cramps',
    intro:
      'Nighttime calf cramps are common and usually harmless, but occur with very different triggers.',
    contextAreas: [
      'Training load and heat',
      'Fluid balance',
      'Certain medications, for example diuretics or statins',
      'Pregnancy',
      'Age-related changes in muscle tissue',
      'Nerve-related causes such as restless legs or nerve damage',
    ],
    redFlags: [
      'Occurs together with numbness or swelling in the leg',
      'A cramp lasts longer than ten minutes',
      'One leg is swollen, red, warm, or throbs with pain, on one side only',
      'Newly appears after starting a medication',
    ],
    relatedNutrients: [
      { substanceId: 'magnesium', note: 'Traditionally linked to cramps. In NHS and Mayo Clinic overviews of calf cramps, magnesium deficiency does not appear as a cause; the evidence is mixed. Public perception here is considerably stronger than the evidence that can be cited.' },
      { substanceId: 'potassium', note: 'Discussed in connection with muscle function, particularly when taking diuretic medication.' },
      { substanceId: 'calcium', note: 'Mentioned in connection with muscle function.' },
    ],
    questionsForProfessional: [
      'Could a medication such as a diuretic or statin be related to the cramps?',
      'Should electrolytes and kidney values be checked?',
      'How do I recognise when leg pain is no longer a harmless cramp?',
    ],
  },

  'brain-fog': {
    label: 'Concentration problems',
    intro:
      'The term describes a collection of sensations, not a diagnosis in its own right. Causes range from lack of sleep to chronic conditions.',
    contextAreas: [
      'Sleep quality and sleep amount',
      'Psychological strain',
      'Acute or past infections',
      'Hormonal changes, for example thyroid or menopause',
      'Medications and treatments',
      'Blood sugar fluctuations',
    ],
    redFlags: [
      'Occurs together with a sudden speech, vision or movement disturbance. This needs immediate assessment',
      'Occurs together with unexplained weight loss or fever',
      'Increases over weeks and affects daily life or safety to drive',
      'Occurs together with strong daytime sleepiness and breathing pauses at night',
    ],
    relatedNutrients: [
      { substanceId: 'vitamin-b12', note: 'A deficiency is linked to neurological symptoms including concentration problems.' },
      { substanceId: 'iron', note: 'Iron deficiency anaemia is linked to reduced mental performance.' },
      { substanceId: 'vitamin-d3', note: 'Discussed; the evidence on supplementation is mixed.' },
    ],
    questionsForProfessional: [
      'Could medications I am taking be responsible for this?',
      'Which blood values make sense here, for example thyroid, blood count or vitamin B12?',
      'From what point would a neurological assessment be indicated?',
    ],
  },

  'frequent-infections': {
    label: 'Frequent infections',
    intro:
      'More infections than usual is nonspecific. The range spans from normal variation to treatable underlying conditions.',
    contextAreas: [
      'Lack of sleep and shift work',
      'Persistent stress',
      'Diet and micronutrient supply',
      'Alcohol and excessive training',
      'Existing conditions such as diabetes',
      'Medications, for example corticosteroids or immunosuppressants',
    ],
    redFlags: [
      'Infections begin already in childhood and repeat unusually often',
      'Unusual pathogens or sites, for example recurring abscesses or persistent fungal infections',
      'Infections respond poorly to the usual treatment',
      'Occur together with weight loss, recurring fever or swollen lymph nodes',
    ],
    relatedNutrients: [
      { substanceId: 'zinc', note: 'Studied in connection with immune function.' },
      { substanceId: 'vitamin-d3', note: 'The link with respiratory infections is discussed; the evidence for supplementation is mixed.' },
      { substanceId: 'iron', note: 'Both a deficiency and an excess are linked to altered immune function.' },
      { substanceId: 'selenium', note: 'Mentioned, though where supply is already adequate any additional benefit is limited.' },
    ],
    questionsForProfessional: [
      'Is the frequency actually unusual for my age?',
      'Should a blood count or immunoglobulin measurement be done?',
      'Could medications explain the susceptibility?',
    ],
  },

  'hair-loss': {
    label: 'Hair loss',
    intro:
      'Hair loss has many possible causes and is not, on its own, evidence of a particular nutrient deficiency.',
    contextAreas: [
      'Hereditary predisposition',
      'Thyroid function',
      'A preceding major strain: fever, surgery, childbirth, weight loss',
      'Medications, for example beta blockers or anticoagulants',
      'Psychological stress',
      'Scalp conditions',
    ],
    redFlags: [
      'Occurs together with scarring, redness or heavy flaking of the scalp',
      'Appears in sharply defined bald patches rather than evenly distributed',
      'Occurs together with signs of a thyroid disorder',
      'Comes with fever, swollen lymph nodes or marked weight loss',
    ],
    relatedNutrients: [
      { substanceId: 'iron', note: 'Low ferritin levels, even without anaemia, are discussed in connection with diffuse hair loss; the evidence is not consistent.' },
      { substanceId: 'zinc', note: 'A deficiency is linked to hair loss but affects only a small number of people in Central Europe.' },
      { substanceId: 'biotin', note: 'A deficiency is rare on a balanced diet. Without a confirmed deficiency, the evidence for an effect is weak.' },
      { substanceId: 'vitamin-d3', note: 'Studied in connection with growth cycles; a benefit from supplementation is not established.' },
    ],
    questionsForProfessional: [
      'Is the pattern diffuse, patchy or scarring, and what does that mean for further assessment?',
      'Should thyroid values and ferritin be measured?',
      'Could a medication be a cause?',
    ],
  },

  'brittle-nails': {
    label: 'Brittle nails',
    intro:
      'Brittle nails are nonspecific. Possibilities range from mechanical wear to rare internal causes; nail shape alone allows no conclusion.',
    contextAreas: [
      'Mechanical strain from water, cleaning products or nail polish remover',
      'Nail care and nail biting',
      'Age-related changes',
      'Skin conditions such as psoriasis',
      'Fungal infections',
      'Thyroid, liver or kidney conditions',
    ],
    redFlags: [
      'Nails curve inward like a spoon. This occurs in connection with iron deficiency anaemia',
      'A nail changes shape or colour, or comes loose, for no obvious reason',
      'The skin around the nail is red, swollen, warm or painful',
    ],
    relatedNutrients: [
      { substanceId: 'iron', note: 'Mentioned in connection with spoon-shaped nails. Brittle nails alone do not allow a conclusion of iron deficiency.' },
      { substanceId: 'biotin', note: 'At normal blood levels the evidence is weak.' },
      { substanceId: 'zinc', note: 'Studied in connection with skin and nails; the data is thin.' },
    ],
    questionsForProfessional: [
      'Could the changes be related to a skin condition or a fungal infection?',
      'Would checking iron status make sense?',
    ],
  },

  'digestive-issues': {
    label: 'Digestive complaints',
    intro:
      'Bloating and irregular bowel movements are very common and usually harmless, but also occur with more serious conditions.',
    contextAreas: [
      'Diet, eating speed and swallowing air',
      'Intolerances such as lactose, fructose or coeliac disease',
      'Irritable bowel syndrome',
      'A preceding gut infection or antibiotic use',
      'Psychological strain',
      'Chronic inflammatory bowel disease',
    ],
    redFlags: [
      'Occurs together with clear, unintended weight loss',
      'Blood in the stool',
      'Fever or noticeable paleness accompany the complaints',
      'Sudden, severe abdominal pain',
      'Complaints do not ease despite dietary changes',
    ],
    relatedNutrients: [
      { substanceId: 'magnesium', note: 'Mentioned in connection with bowel regulation. Too high an intake can itself cause diarrhoea, so the link runs in both directions.' },
      { substanceId: 'psyllium', note: 'Fibre is discussed in connection with bowel regularity.' },
      { substanceId: 'saccharomyces-boulardii', note: 'For antibiotic-associated diarrhoea there is Cochrane evidence; for other complaints the evidence is weaker.' },
    ],
    questionsForProfessional: [
      'Could the symptoms point to an intolerance, and how could that be checked?',
      'Should inflammation markers or thyroid values be measured?',
      'Are there signs that would suggest a colonoscopy?',
    ],
  },

  'joint-pain': {
    label: 'Joint complaints',
    intro:
      'Joint complaints have a broad range of causes, from temporary overuse to inflammatory conditions. The complaint alone does not point to a cause.',
    contextAreas: [
      'Overuse or injury from sport',
      'Wear and tear',
      'Inflammatory conditions such as rheumatoid arthritis or gout',
      'Infection of a joint',
      'Hormonal changes',
    ],
    redFlags: [
      'The joint is swollen, feels warm and the skin is red',
      'The complaints occur together with a general feeling of illness or raised temperature',
      'Morning stiffness lasting over 30 minutes, several joints affected symmetrically',
      'Severe pain after a fall, the joint cannot bear weight',
    ],
    relatedNutrients: [
      { substanceId: 'omega-3', note: 'Studied in rheumatoid arthritis; NCCIH rates the evidence as low quality.' },
      { substanceId: 'vitamin-d3', note: 'Linked to bone and muscle health. A deficiency is associated more with bone pain than directly with joint pain.' },
      { substanceId: 'glucosamine', note: 'Frequently discussed; the evidence is mixed.' },
      { substanceId: 'chondroitin', note: 'Discussed alongside glucosamine, likewise with mixed evidence.' },
    ],
    questionsForProfessional: [
      'Do swelling, warmth or redness point to an inflammatory cause that should be checked?',
      'Would a blood test make sense?',
      'How long should I wait before seeing someone again?',
    ],
  },

  'low-mood': {
    label: 'Low mood',
    intro:
      'Low mood and lack of drive are nonspecific. The range spans from temporary exhaustion through psychological to physical conditions.',
    contextAreas: [
      'Sleep quality and sleep duration',
      'Psychological strain: stress, grief, depression',
      'Thyroid function',
      'Medications, for example beta blockers or hormone preparations',
      'Changed life circumstances and isolation',
      'Chronic conditions',
    ],
    redFlags: [
      'The symptoms are present on most days for more than two weeks, continuously',
      'Thoughts of self-harm or of not wanting to live occur. Help is available at any time, for example the (German) crisis helpline at 0800 111 0 111 or 0800 111 0 222',
      'Clear unintended weight loss or clear weight gain is added',
      'Marked physical exhaustion, sensitivity to cold and concentration problems occur at the same time',
    ],
    relatedNutrients: [
      { substanceId: 'vitamin-d3', note: 'Discussed; the evidence is mixed. NCCIH does not list it as an established measure for depression.' },
      { substanceId: 'vitamin-b12', note: 'A deficiency is linked to neurological and psychological symptoms; a causal link with mood is not consistently established.' },
      { substanceId: 'omega-3', note: 'Studied with mixed results.' },
    ],
    questionsForProfessional: [
      'Could thyroid function play a role?',
      'Which lab values make sense here and which do not?',
      'Who can I turn to if my mood gets worse?',
    ],
  },

  headache: {
    label: 'Headache',
    intro:
      'Headaches are among the most common and nonspecific complaints. Triggers range from harmless to requiring assessment.',
    contextAreas: [
      'Fluid balance and skipped meals',
      'Stress and poor posture',
      'Lack of sleep',
      'Frequent use of painkillers, which can itself trigger headaches',
      'Alcohol and infections',
      'Hormonal factors',
    ],
    redFlags: [
      'Begins suddenly and unusually severely',
      'Numbness, weakness, speech, balance or memory problems are added',
      'Occurs after a head injury in the last three months',
      'Drowsiness, confusion or a seizure occur at the same time',
      'High fever, neck stiffness or a rash that does not fade under pressure are added',
    ],
    relatedNutrients: [
      { substanceId: 'magnesium', note: 'Discussed for migraine; a preventive effect is not clearly established.' },
      { substanceId: 'riboflavin', note: 'Mentioned in migraine research. The sources reachable in this research are not sufficient for a solid statement.' },
      { substanceId: 'coq10', note: 'Mentioned in migraine research, with the same caveat about evidence.' },
    ],
    questionsForProfessional: [
      'Is this tension headache, or should it be assessed further?',
      'Could regular painkiller use itself be playing a role?',
      'Which accompanying symptoms mean I should come in immediately rather than wait?',
    ],
  },

  recovery: {
    label: 'Recovery after exercise',
    intro:
      'Delayed recovery and cramps during sport have many possible explanations and are not, on their own, evidence of a nutrient deficiency.',
    contextAreas: [
      'Training load, heat and humidity',
      'Fluid balance',
      'Sleep amount and sleep quality',
      'Certain medications such as statins or diuretics',
      'Total energy intake relative to training load',
    ],
    redFlags: [
      'Cramps regularly disturb sleep',
      'Numbness or swelling in the leg also occurs',
      'A cramp lasts longer than ten minutes',
    ],
    relatedNutrients: [
      { substanceId: 'magnesium', note: 'Traditionally linked to muscle function. The NHS does not explicitly list cramps as a deficiency symptom.' },
      { substanceId: 'potassium', note: 'Discussed in connection with fluid and electrolyte loss from heavy sweating.' },
      { substanceId: 'creatine', note: 'Well studied in a sports context, but in relation to strength performance, not cramps.' },
    ],
    questionsForProfessional: [
      'Could a medication be contributing to the cramps?',
      'Would checking electrolytes and kidney values make sense?',
      'From what point is this no longer just a training issue?',
    ],
  },
};

export function getComplaintOverlay(id) {
  return COMPLAINTS_EN[id] ?? null;
}
