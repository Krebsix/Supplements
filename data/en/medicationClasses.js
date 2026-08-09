/**
 * data/en/medicationClasses.js
 * ─────────────────────────────────────────────────────────────
 * English text overlay for data/medicationClasses.js. German stays
 * canonical; this file supplies English labels/examples for the
 * medication-class catalog, and the English wording of every quoted
 * interaction reference.
 *
 * WHAT THIS IS NOT (same rule as the DE source):
 * This is still not an interaction database. No sentence here was
 * newly researched or drawn from model knowledge. Every `quote` value
 * is a literal, verbatim substring of the ALREADY-TRANSLATED English
 * overlay text in data/en/substances.js or data/en/lifeStageAdvisories.js
 * — never a fresh translation of the German quote. That is the whole
 * point: the English claim must be traceable to the same reviewed
 * English sentence a reader of the substance page already sees, not to
 * a paraphrase invented for this file.
 *
 * STRUCTURE
 *   MEDICATION_CLASSES_EN[id] = { label: string, examples: string }
 *   QUOTES_EN[key] = string   // see KEYING below
 *
 * KEYING
 * Each entry in data/medicationClasses.js `medicationInteractions` is
 * identified by `${medicationClassId}::${substanceId}`. This is enough:
 * verified by script that no (medicationClassId, substanceId) pair
 * repeats in the DE source (52 entries, 52 distinct pairs) — unlike
 * data/en/lifeStageAdvisories.js, there is no case here of the same
 * substance/class combination appearing twice at different severities.
 * If that ever changes, the key must become
 * `${medicationClassId}::${substanceId}::${severity}` and this comment
 * must say so; tests/medication-en.test.mjs asserts the 1:1 mapping
 * so a silent collision would fail loudly instead of overwriting an
 * entry.
 *
 * HOW EACH EN QUOTE WAS DERIVED
 * For every DE `quote`, the DE source field (cautionNote / advisory /
 * useCase note, per `sourceField`) was located the same way
 * tests/profile-check.test.mjs locates it. The matching English overlay
 * field was then read in full (data/en/substances.js `cautionNote` /
 * `useCases[i].note`, or data/en/lifeStageAdvisories.js via
 * `getAdvisoryTextEN`), and the EN quote below is a literal, unedited
 * substring of that field — same sentence, same clause boundaries
 * where the DE quote was itself a clause fragment (e.g. cut off before
 * a parenthetical). No wording, punctuation, or word order was changed
 * beyond picking the substring boundary.
 *
 * Several substances repeat the same DE quote across multiple
 * medication classes because one caution sentence is relevant to more
 * than one class (e.g. st-johns-wort's contraindication sentence is
 * cited for anticoagulants, immunosuppressants, chemotherapy, and
 * protease-inhibitors alike). The EN quote is naturally identical
 * across those keys too, since it resolves to the same EN source
 * sentence.
 *
 * No translation gaps were found: every one of the 52 DE quotes in
 * data/medicationClasses.js resolved to a matching EN overlay sentence
 * in data/en/substances.js or data/en/lifeStageAdvisories.js. There is
 * therefore no exception list here.
 */

export const MEDICATION_CLASSES_EN = {
  anticoagulants: {
    label: 'Anticoagulants / Blood thinners',
    examples: 'e.g. Marcumar, phenprocoumon, warfarin, aspirin, DOACs',
  },
  antidepressants: {
    label: 'Antidepressants',
    examples: 'SSRIs, SNRIs, MAO inhibitors',
  },
  thyroid: {
    label: 'Thyroid hormones',
    examples: 'e.g. L-thyroxine, levothyroxine',
  },
  immunosuppressants: {
    label: 'Immunosuppressants',
    examples: 'e.g. ciclosporin, tacrolimus, for example after transplantation',
  },
  antidiabetics: {
    label: 'Diabetes medications',
    examples: 'e.g. metformin, insulin',
  },
  antihypertensives: {
    label: 'Blood pressure medications',
    examples: 'e.g. ACE inhibitors, sartans, diuretics, calcium channel blockers',
  },
  statins: {
    label: 'Statins / Cholesterol-lowering drugs',
    examples: 'e.g. simvastatin, atorvastatin',
  },
  antibiotics: {
    label: 'Antibiotics',
    examples: 'e.g. tetracyclines, gyrase inhibitors',
  },
  chemotherapy: {
    label: 'Cytostatics / Chemotherapy',
    examples: 'e.g. irinotecan, imatinib',
  },
  'protease-inhibitors': {
    label: 'Protease inhibitors',
    examples: 'HIV therapy, e.g. indinavir',
  },
  contraceptives: {
    label: 'Hormonal contraception',
    examples: 'the pill, hormone patch, hormonal IUD',
  },
  cyp3a4: {
    label: 'Medications dependent on CYP3A4',
    examples: 'many active substances, check the package leaflet if in doubt',
  },
  sedatives: {
    label: 'Sedatives and sleep medications',
    examples: 'e.g. benzodiazepines, sedatives',
  },
  'gastric-acid': {
    label: 'Stomach acid reducers',
    examples: 'Proton pump inhibitors, e.g. pantoprazole, omeprazole',
  },
  dopaminergic: {
    label: 'Dopamine-active medications',
    examples: 'e.g. prolactin inhibitors, Parkinson’s medications',
  },
};

export function getMedicationClassEN(id) {
  return MEDICATION_CLASSES_EN[id] ?? null;
}

/**
 * QUOTES_EN
 * Keyed by `${medicationClassId}::${substanceId}`, see KEYING above.
 */
export const QUOTES_EN = {
  // ── Anticoagulants ──────────────────────────────────────────
  'anticoagulants::bromelain':
    'As a protein-splitting enzyme, a possible interaction with anticoagulant drugs is discussed.',
  'anticoagulants::chaga':
    'Additionally, increased bleeding risk with anticoagulants/antiplatelet drugs and additive blood-sugar-lowering effects with antidiabetic drugs.',
  'anticoagulants::chondroitin':
    'Like glucosamine, associated with a described increased bleeding risk under warfarin.',
  'anticoagulants::cordyceps':
    'One case of increased bleeding after tooth extraction is documented, along with a theoretically increased bleeding risk from inhibition of platelet aggregation (relevant in combination with anticoagulants) and additive effects with antidiabetic drugs/insulin.',
  'anticoagulants::cranberry-extract':
    'The EMA monograph names concurrent use of tacrolimus and warfarin as a contraindication',
  'anticoagulants::flaxseed-oil':
    'NCCIH names theoretical interactions with anticoagulant medicines (anticoagulants/antiplatelet agents).',
  'anticoagulants::glucosamine':
    'an increased bleeding risk is described in combination with the anticoagulant warfarin.',
  'anticoagulants::maitake':
    'A case report of increased INR under maitake extract in combination with warfarin is documented',
  'anticoagulants::nattokinase':
    'May theoretically potentiate the effect of anticoagulants/antiplatelet agents',
  'anticoagulants::phosphatidylserine':
    'Secondary sources discuss a theoretical interaction with blood-thinning medications',
  'anticoagulants::reishi':
    'increased bleeding risk in combination with anticoagulants/antiplatelet drugs',
  'anticoagulants::st-johns-wort':
    'Concurrent use with coumarin anticoagulants, ciclosporin, tacrolimus, sirolimus, everolimus, protease inhibitors and certain cytostatics (including irinotecan, imatinib) is contraindicated according to the monograph.',
  'anticoagulants::vitamin-e':
    'Higher doses can increase the tendency to bleed: relevant with anticoagulants and before surgery.',
  'anticoagulants::vitamin-k2':
    'When taking vitamin K antagonists (coumarins such as Marcumar/warfarin), vitamin K directly affects how the medication works. Only after medical consultation.',
  'anticoagulants::omega-3':
    'When taking anticoagulants and before planned surgery, the dose should be clarified medically.',
  'anticoagulants::ginkgo-biloba':
    'Can affect blood clotting',

  // ── Antidepressants ─────────────────────────────────────────
  'antidepressants::5-htp':
    'Do not combine with serotonergic medications',
  'antidepressants::l-tryptophan':
    'Do not combine with serotonergic medications',
  'antidepressants::methylene-blue':
    'Methylene blue acts as a potent MAO-A inhibitor',
  'antidepressants::st-johns-wort':
    'In combination with serotonin reuptake inhibitors, serotonin syndrome has been observed in very rare cases.',

  // ── Thyroid hormones ────────────────────────────────────────
  'thyroid::l-tyrosine':
    'Clarify medically with hyperthyroidism and when taking thyroid hormones or MAO inhibitors.',
  'thyroid::ashwagandha':
    'With thyroid conditions and when taking thyroid or sedative medication, medical clarification is usual.',
  'thyroid::colloidal-silver':
    'Silver can also inhibit the absorption of certain medicines (including antibiotics, L-thyroxine).',

  // ── Immunosuppressants ──────────────────────────────────────
  'immunosuppressants::black-seed-oil':
    'Interactions with blood thinners (increased bleeding risk), blood pressure medications, diabetes medications, and immunosuppressants are described in secondary sources',
  'immunosuppressants::cranberry-extract':
    'The EMA monograph names concurrent use of tacrolimus and warfarin as a contraindication',
  'immunosuppressants::echinacea':
    'NCCIH additionally points to theoretical, not conclusively clarified interaction concerns with immunosuppressants.',
  'immunosuppressants::grapefruit-seed-extract':
    'When taking CYP3A4-dependent medications (for example immunosuppressants, certain statins/calcium channel blockers), consult a doctor before use because of a possible interaction.',
  'immunosuppressants::reishi':
    'possible enhancement of immunosuppressant effects',
  'immunosuppressants::st-johns-wort':
    'Concurrent use with coumarin anticoagulants, ciclosporin, tacrolimus, sirolimus, everolimus, protease inhibitors and certain cytostatics (including irinotecan, imatinib) is contraindicated according to the monograph.',

  // ── Diabetes medications ────────────────────────────────────
  'antidiabetics::alpha-lipoic-acid':
    'May enhance the blood-sugar-lowering effect of insulin/antidiabetic medication',
  'antidiabetics::berberine':
    'Interactions with statins, metformin/antidiabetic drugs, and blood pressure medications are described in the literature.',
  'antidiabetics::black-seed-oil':
    'Interactions with blood thinners (increased bleeding risk), blood pressure medications, diabetes medications, and immunosuppressants are described in secondary sources',
  'antidiabetics::chaga':
    'additive blood-sugar-lowering effects with antidiabetic drugs',
  'antidiabetics::cordyceps':
    'additive effects with antidiabetic drugs/insulin',
  'antidiabetics::maitake':
    'additive blood-sugar-lowering effects with antidiabetic drugs',

  // ── Blood pressure medications ──────────────────────────────
  'antihypertensives::potassium':
    'certain blood pressure medications',
  'antihypertensives::berberine':
    'Interactions with statins, metformin/antidiabetic drugs, and blood pressure medications are described in the literature.',
  'antihypertensives::black-seed-oil':
    'Interactions with blood thinners (increased bleeding risk), blood pressure medications, diabetes medications, and immunosuppressants are described in secondary sources',

  // ── Statins ─────────────────────────────────────────────────
  'statins::coq10':
    'A common context of use is alongside statin therapy.',
  'statins::berberine':
    'Interactions with statins, metformin/antidiabetic drugs, and blood pressure medications are described in the literature.',
  'statins::grapefruit-seed-extract':
    'When taking CYP3A4-dependent medications (for example immunosuppressants, certain statins/calcium channel blockers), consult a doctor before use because of a possible interaction.',

  // ── Antibiotics ─────────────────────────────────────────────
  'antibiotics::colloidal-silver':
    'Silver can also inhibit the absorption of certain medicines (including antibiotics, L-thyroxine).',

  // ── Cytostatics / Chemotherapy ──────────────────────────────
  'chemotherapy::st-johns-wort':
    'Concurrent use with coumarin anticoagulants, ciclosporin, tacrolimus, sirolimus, everolimus, protease inhibitors and certain cytostatics (including irinotecan, imatinib) is contraindicated according to the monograph.',

  // ── Protease inhibitors ─────────────────────────────────────
  'protease-inhibitors::st-johns-wort':
    'Concurrent use with coumarin anticoagulants, ciclosporin, tacrolimus, sirolimus, everolimus, protease inhibitors and certain cytostatics (including irinotecan, imatinib) is contraindicated according to the monograph.',

  // ── Hormonal contraception ──────────────────────────────────
  'contraceptives::chasteberry':
    'The dopaminergic action may interact with hormonal contraceptives and dopamine-active medications.',
  'contraceptives::st-johns-wort':
    'the reduction in plasma concentration of hormonal contraceptives can lead to increased breakthrough bleeding and reduced contraceptive reliability.',

  // ── CYP3A4 ──────────────────────────────────────────────────
  'cyp3a4::agaricus-blazei':
    'Can inhibit CYP3A4 and thereby affect the breakdown of other medications.',
  'cyp3a4::grapefruit-seed-extract':
    'When taking CYP3A4-dependent medications (for example immunosuppressants, certain statins/calcium channel blockers), consult a doctor before use because of a possible interaction.',
  'cyp3a4::st-johns-wort':
    'St. John’s wort preparations demonstrably induce CYP3A4, CYP2B6, CYP2C9, CYP2C19 and P-glycoprotein',

  // ── Sedatives and sleep medications ─────────────────────────
  'sedatives::ashwagandha':
    'With thyroid conditions and when taking thyroid or sedative medication, medical clarification is usual.',

  // ── Stomach acid reducers ───────────────────────────────────
  'gastric-acid::vitamin-b12':
    'Long-term use can reduce B12 absorption.',

  // ── Dopamine-active medications ─────────────────────────────
  'dopaminergic::chasteberry':
    'The dopaminergic action may interact with hormonal contraceptives and dopamine-active medications.',
};

export function getQuoteEN(medicationClassId, substanceId) {
  return QUOTES_EN[`${medicationClassId}::${substanceId}`] ?? null;
}
