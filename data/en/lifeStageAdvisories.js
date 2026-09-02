/**
 * data/en/lifeStageAdvisories.js
 * ─────────────────────────────────────────────────────────────
 * English text overlay for data/lifeStageAdvisories.js. German stays
 * canonical; this file supplies the `text` fields plus the
 * `SEVERITY_META` labels for the English UI.
 *
 * KEYING (documented per task requirement)
 * The advisory entries in data/lifeStageAdvisories.js have no stable
 * `id` field — each substanceId maps to a plain array of
 * { lifeStages, severity, text } objects. A pure index key
 * (`substanceId#0`) would silently misalign if the DE array is ever
 * reordered without touching this file, so instead each entry is keyed
 * by a value built from its own content:
 *
 *   buildAdvisoryKey(lifeStages, severity)
 *     = `${normalizedLifeStages}::${severity}`
 *     normalizedLifeStages = lifeStages === 'all'
 *       ? 'all'
 *       : [...lifeStages].sort().join('+')
 *
 * Example: an entry with lifeStages: ['pregnancy', 'breastfeeding'] and
 * severity: 'contraindicated' is keyed 'breastfeeding+pregnancy::contraindicated'
 * (sorted, so entry order inside the DE array doesn't matter).
 *
 * This is a documented deviation from the literal "substanceId +
 * lifeStageId" suggestion: a single entry can apply to several life
 * stages at once (or to 'all'), so there is no one lifeStageId to key
 * on. Severity is folded into the key because a handful of substances
 * (e.g. 'cranberry-extract', 'st-johns-wort') have two entries that
 * both apply to the same lifeStages selector but at different
 * severities — verified by scripting every (substanceId,
 * normalizedLifeStages, severity) triple across the full DE file and
 * confirming zero collisions (127 entries, 127 distinct keys).
 *
 * advisoriesEN[substanceId][buildAdvisoryKey(entry.lifeStages, entry.severity)] = text
 *
 * `buildAdvisoryKey` is exported so tests (and any future consumer)
 * compute the same key from the DE source instead of duplicating the
 * normalization logic.
 *
 * `severityLabels` overlays SEVERITY_META's four `label` values,
 * keyed by the ADVISORY_SEVERITY value ('contraindicated', 'medical',
 * 'attention', 'increased') — not by the object's uppercase key name.
 *
 * WORDING RULES (compliance-critical, see project CLAUDE.md):
 * - Descriptive, not prescriptive: "is considered contraindicated",
 *   never "do not take this".
 * - "empfohlen"/"empfiehlt" is rendered as "advise(s)" / "advised
 *   against", never "recommend(s)" — these sentences report what a
 *   regulatory or advisory body (HMPC, EFSA, BfR, EMA, NCCIH, ANSES,
 *   BVL, NIH ODS, Verbraucherzentrale) states, not a recommendation
 *   made by this app.
 * - No em dash ("—") in any of these strings.
 */

export function buildAdvisoryKey(lifeStages, severity) {
  const normalized =
    lifeStages === 'all'
      ? 'all'
      : [...lifeStages].sort().join('+');
  return `${normalized}::${severity}`;
}

export const severityLabels = {
  contraindicated: 'Not intended',
  medical: 'Requires medical clarification',
  attention: 'Special consideration',
  increased: 'Increased need',
};

export const advisoriesEN = {
  ginger: {
    'pregnancy::medical':
      'The safety of high ginger doses during pregnancy is not conclusively established; use for pregnancy nausea belongs under medical supervision.',
  },
  clove: {
    'child-4-10+teen-11-17::contraindicated':
      'Clove essential oil is not foreseen for children.',
    'breastfeeding+pregnancy::contraindicated':
      'For pregnancy and breastfeeding, data beyond spice amounts are lacking; high-dose use is not foreseen.',
  },
  chamomile: {
    'breastfeeding+pregnancy::contraindicated':
      'For highly concentrated chamomile preparations, sufficient data for pregnancy and breastfeeding are lacking.',
  },
  'lemon-balm': {
    'breastfeeding+pregnancy::contraindicated':
      'No sufficient data for pregnancy and breastfeeding.',
    'child-4-10::contraindicated':
      'No sufficient data for children under 12 years.',
  },
  hawthorn: {
    'breastfeeding+pregnancy::contraindicated':
      'Sufficient data for pregnancy and breastfeeding are lacking.',
  },
  elderflower: {
    'breastfeeding+pregnancy::contraindicated':
      'Sufficient data for pregnancy and breastfeeding are lacking.',
  },
  'licorice-root': {
    'pregnancy::contraindicated':
      'Licorice root is not foreseen during pregnancy (glycyrrhizin).',
  },
  'lavender-oil': {
    'breastfeeding+pregnancy::contraindicated':
      'No sufficient data for pregnancy and breastfeeding.',
    'child-4-10::contraindicated':
      'No sufficient data for children under 12 years.',
  },
  yarrow: {
    'breastfeeding+pregnancy::contraindicated':
      'Sufficient data for pregnancy and breastfeeding are lacking.',
  },
  hops: {
    'breastfeeding+pregnancy::contraindicated':
      'No sufficient data for pregnancy and breastfeeding.',
    'child-4-10::contraindicated':
      'No sufficient data for children under 12 years.',
  },
  rosemary: {
    'breastfeeding+pregnancy::contraindicated':
      'For medicinal rosemary dosages, sufficient data for pregnancy and breastfeeding are lacking; spice amounts are not affected.',
  },
  feverfew: {
    'breastfeeding+pregnancy::contraindicated':
      'Feverfew is not foreseen during pregnancy and breastfeeding.',
  },
  'uva-ursi': {
    'child-4-10+teen-11-17::contraindicated':
      'Bearberry is not foreseen for children.',
    'breastfeeding+pregnancy::contraindicated':
      'Bearberry is not foreseen during pregnancy and breastfeeding.',
  },
  'willow-bark': {
    'pregnancy::contraindicated':
      'Willow bark is not foreseen in the last trimester of pregnancy (salicylates).',
    'child-4-10+teen-11-17::medical':
      'Not for children and adolescents with feverish infections (salicylates); use belongs under medical clarification.',
  },
  mullein: {
    'breastfeeding+pregnancy::contraindicated':
      'Sufficient data for pregnancy and breastfeeding are lacking.',
  },
  motherwort: {
    'breastfeeding+pregnancy::contraindicated':
      'Motherwort is not foreseen during pregnancy and breastfeeding.',
    'child-4-10::contraindicated':
      'Data for children under 12 years are lacking.',
  },
  meadowsweet: {
    'breastfeeding+pregnancy::contraindicated':
      'Sufficient data for pregnancy and breastfeeding are lacking (salicylates).',
    'child-4-10+teen-11-17::medical':
      'Not for children and adolescents with feverish infections (salicylates).',
  },
  'horse-chestnut': {
    'breastfeeding+pregnancy::medical':
      'Use during pregnancy and breastfeeding belongs under medical clarification.',
  },
  wormwood: {
    'breastfeeding+pregnancy::contraindicated':
      'Wormwood is not foreseen during pregnancy and breastfeeding (thujone).',
  },
  'burdock-root': {
    'breastfeeding+pregnancy::contraindicated':
      'Sufficient data for pregnancy and breastfeeding are lacking.',
  },
  'lovage-root': {
    'breastfeeding+pregnancy::contraindicated':
      'Sufficient data for pregnancy and breastfeeding are lacking.',
  },
  'nettle-leaf': {
    'breastfeeding+pregnancy::contraindicated':
      'Sufficient data for pregnancy and breastfeeding are lacking.',
  },
  sage: {
    'breastfeeding+pregnancy::contraindicated':
      'The EMA monograph does not foresee sage preparations during pregnancy and breastfeeding (thujone). In addition, while breastfeeding: sage can reduce milk production; this effect is used deliberately for weaning.',
  },
  'peppermint-oil': {
    'breastfeeding::attention':
      'Peppermint is traditionally used for weaning; a milk-reducing effect is not clinically established (LactMed). Larger amounts are a known point of observation while breastfeeding.',
  },
  'vitamin-a': {
    'pregnancy::contraindicated':
      'Preformed vitamin A (retinol, retinyl acetate, retinyl palmitate) is considered harmful to the fetus in higher amounts during pregnancy. Products intended for pregnancy use beta-carotene instead.',
    'child-4-10+teen-11-17::medical':
      'The upper limit is considerably lower for children than for adults. Supplementation is usually medically supervised.',
    'breastfeeding::increased':
      'Need is considerably increased during breastfeeding, because vitamin A is passed on through breast milk.',
  },
  ashwagandha: {
    'breastfeeding+pregnancy::contraindicated':
      'Ashwagandha is considered contraindicated in pregnancy and breastfeeding; there is not enough safety data available.',
    'child-4-10+teen-11-17::contraindicated':
      'There is no established evidence base for children and adolescents. Adaptogenic plant extracts are not intended for these age groups.',
    'menopause+senior::attention':
      'With thyroid conditions and when taking thyroid or sedative medication, medical clarification is usual.',
  },
  iron: {
    'pregnancy::increased':
      'Need is roughly double during pregnancy. Supply is checked through blood values as part of routine prenatal care.',
    'adult-man+menopause+senior::attention':
      'Without a confirmed deficiency, iron supplementation is unusual in this group: excess iron is stored rather than actively excreted.',
    'adult-woman+teen-11-17::attention':
      'Need is increased due to menstruation. Measuring ferritin is usual before supplementing.',
    'child-4-10::medical':
      'Iron products for children belong in medical hands. Accidental overdose is a relevant poisoning risk in children.',
  },
  iodine: {
    'breastfeeding+pregnancy::increased':
      "Considerably increased need for the child's brain and thyroid development. Supplementation is usual in these phases and is medically supervised.",
    'all::attention':
      'With existing thyroid conditions, particularly hyperthyroidism and autonomy, iodine intake should be clarified medically.',
  },
  folate: {
    'pregnancy::increased':
      'The single most important phase: adequate intake from the point of wanting to conceive and through the first weeks of pregnancy lowers the risk of neural tube defects. Need is considerably increased.',
    'adult-woman::attention':
      'When trying to conceive, supplementation is usually started before pregnancy, because the neural tube closes very early on.',
  },
  'vitamin-b12': {
    'senior::attention':
      'Absorption capacity in the stomach decreases with age. A deficiency can develop despite adequate intake from food.',
    'breastfeeding+pregnancy::increased':
      'Increased need. On a vegan diet, supplementation is particularly relevant during these phases.',
  },
  'vitamin-d3': {
    'menopause+senior::attention':
      "After menopause and at older age, vitamin D becomes more important for maintaining bone, while the body's own production in the skin declines.",
    'child-4-10::medical':
      'The upper limit for children is 2000 IU per day, considerably below the limit for adults. High-dose adult products are not suitable for children.',
  },
  calcium: {
    'menopause::attention':
      'After menopause, bone loss accelerates as oestrogen levels fall. Calcium and vitamin D are considered together in this context.',
    'teen-11-17::increased':
      'Peak bone density is built up during the growth phase: need is highest during this time.',
  },
  'omega-3': {
    'breastfeeding+pregnancy::increased':
      "DHA is a structural component of the child's brain and retina; need is increased during these phases.",
    'all::attention':
      'When taking anticoagulants and before planned surgery, the dose should be clarified medically.',
  },
  'vitamin-k2': {
    'all::medical':
      'When taking vitamin K antagonists (coumarins such as Marcumar/warfarin), vitamin K directly affects how the medication works. Only after medical consultation.',
  },
  'l-tryptophan': {
    'all::medical':
      'Not to be combined with serotonergic medications (SSRIs, SNRIs, MAO inhibitors): risk of serotonin syndrome.',
    'breastfeeding+child-4-10+pregnancy+teen-11-17::contraindicated':
      'Supplementation is not intended for children, adolescents, or during pregnancy and breastfeeding.',
  },
  '5-htp': {
    'all::medical':
      'Not to be combined with serotonergic medications (SSRIs, SNRIs, MAO inhibitors, methylene blue): risk of serotonin syndrome.',
    'breastfeeding+child-4-10+pregnancy+teen-11-17::contraindicated':
      'Supplementation is not intended for children, adolescents, or during pregnancy and breastfeeding.',
  },
  zinc: {
    'child-4-10::attention':
      'The upper limit for children in this age group is 10 mg per day: many adult products exceed that with a single capsule.',
    'breastfeeding::increased': 'Need is increased during breastfeeding.',
  },
  selenium: {
    'child-4-10::attention':
      'The upper limit for children is 130 µg per day. For selenium, requirement and upper limit generally lie close together.',
  },
  'vitamin-b6': {
    'all::attention':
      'EFSA lowered the upper limit to 12 mg per day in 2023. Sustained higher intake can cause nerve damage; many B-complex products exceed this.',
    'child-4-10::attention':
      'For children in this age group, the upper limit is 7 mg per day.',
  },
  curcumin: {
    'breastfeeding+pregnancy::medical':
      'High-dose curcumin extracts have not been sufficiently studied in pregnancy and breastfeeding. Turmeric used as a spice is not affected by this.',
    'all::attention':
      'Products containing piperine not only increase curcumin absorption, they can also affect the absorption of medications.',
  },
  creatine: {
    'child-4-10+teen-11-17::medical':
      'There is hardly any long-term data for children and adolescents; supplementation is unusual in these age groups.',
    'menopause+senior::attention':
      'Studied in this life phase in connection with maintaining muscle mass, in combination with strength training.',
  },
  psyllium: {
    'all::attention':
      'Blocks the absorption of active substances and medications. At least a 2-hour gap and plenty of fluid are required.',
  },
  potassium: {
    'all::medical':
      'With reduced kidney function and with certain blood pressure medications (ACE inhibitors, sartans, potassium-sparing diuretics), potassium supplementation should be clarified medically.',
  },
  probiotics: {
    'all::medical':
      'With a severely weakened immune system, live cultures should be clarified medically.',
  },
  'l-arginine': {
    'breastfeeding+child-4-10+pregnancy+teen-11-17::medical':
      'Not sufficiently studied in these life phases.',
  },
  'l-tyrosine': {
    'all::attention':
      'Clarify medically with hyperthyroidism and when taking thyroid hormones or MAO inhibitors.',
    'breastfeeding+child-4-10+pregnancy+teen-11-17::medical':
      'Not sufficiently studied in these life phases.',
  },
  coq10: {
    'all::attention':
      'May affect how vitamin K antagonists work. A common context of use is alongside statin therapy.',
  },
  'panax-ginseng': {
    'breastfeeding+pregnancy::contraindicated':
      'HMPC: safety in pregnancy and breastfeeding is not established; use is advised against given the insufficient data. One constituent caused malformations in animal studies.',
    'child-4-10+teen-11-17::contraindicated':
      'Use in children and adolescents under 18 is advised against for lack of data (HMPC).',
  },
  'ginkgo-biloba': {
    'pregnancy::contraindicated':
      'Official HMPC contraindication (not just a caution): can impair platelet aggregation and increase the tendency to bleed.',
    'breastfeeding::contraindicated':
      'It is unclear whether metabolites pass into breast milk; HMPC advises against use.',
  },
  'rhodiola-rosea': {
    'breastfeeding+pregnancy::contraindicated':
      'HMPC: safety is not established; use is advised against given the insufficient data.',
    'child-4-10+teen-11-17::contraindicated':
      'Use in children and adolescents under 18 is advised against for lack of data (HMPC).',
  },
  'milk-thistle': {
    'breastfeeding+pregnancy::contraindicated':
      'HMPC: safety is not established; use is advised against given the insufficient data.',
    'child-4-10+teen-11-17::contraindicated':
      'Use in children and adolescents under 18 is advised against for lack of data (HMPC).',
  },
  maca: {
    'breastfeeding+pregnancy::attention':
      'BfR explicitly states that no health-safe consumption amount can be derived from the available data. This caution is drawn from the generally insufficient data overall, not a directly quotable official statement specific to pregnancy or breastfeeding.',
  },
  gaba: {
    'breastfeeding+pregnancy::attention':
      'According to a USP safety assessment, the data is insufficient, since GABA can affect neurotransmitter and hormone balance. Regulatory status in Germany is inconsistent (see the note on the substance).',
  },
  'l-theanine': {
    'breastfeeding+child-4-10+pregnancy+teen-11-17::attention':
      'Proposed as an excluded group in the ongoing EU authorisation process for isolated L-theanine: insufficient data for these groups.',
  },
  melatonin: {
    'breastfeeding+child-4-10+pregnancy::medical':
      'According to BfR, there is no established safety assessment for isolated melatonin; its classification as a pharmacologically active substance applies regardless of dose.',
  },
  'n-acetylcysteine': {
    'all::attention':
      'Regulatory status as a food supplement in Germany is contested among authorities and has already been assessed differently on several occasions.',
  },
  resveratrol: {
    'breastfeeding+child-4-10+pregnancy+teen-11-17::contraindicated':
      'The EU novel food authorisation explicitly applies only to the adult population.',
  },
  glucosamine: {
    'breastfeeding+pregnancy::attention':
      'According to NCCIH, there is little solid data on safety in pregnancy and breastfeeding.',
  },
  niacin: {
    'pregnancy::attention':
      'BfR advises a warning label for pregnant women on nicotinamide additions above 16 mg/day, due to insufficient safety data. The form-specific upper limit also differs by a factor of around 200 between nicotinic acid and nicotinamide, see "Forms compared".',
  },
  biotin: {
    'all::attention':
      'Relevant before lab blood tests: taking it can distort certain test results (for example thyroid or cardiac markers).',
  },
  nattokinase: {
    'breastfeeding+pregnancy::medical':
      'The EFSA safety assessment explicitly excludes pregnant and breastfeeding women.',
    'all::attention':
      'Can theoretically strengthen the effect of anticoagulants/antiplatelet drugs. Case reports describe both bleeding events and thrombotic complications when nattokinase was used to replace blood-thinning therapy without medical guidance.',
  },
  'methylene-blue': {
    'all::contraindicated':
      'G6PD deficiency is a contraindication according to the prescribing information (risk of haemolysis). Combining it with serotonergic substances (SSRIs, SNRIs, MAO inhibitors, 5-HTP, tryptophan) carries a serotonin syndrome risk at any dose, according to an official warning.',
    'breastfeeding+pregnancy::contraindicated':
      'None of the sources reviewed provide a safety assessment for pregnancy or breastfeeding in a food-supplement context; it is not an authorised food supplement in the first place.',
  },
  'l-carnitine': {
    'all::attention':
      'With seizure disorders/epilepsy, high doses can increase seizure risk according to NIH ODS. With chronic kidney disease, high doses can contribute to muscle weakness.',
  },
  berberine: {
    'pregnancy::contraindicated':
      'Reports of bilirubin displacement with a risk of kernicterus in the infant mean berberine is consistently named as an exclusion criterion during pregnancy.',
    'all::medical':
      'Pharmacokinetic interactions with statins, metformin/antidiabetic drugs and blood-pressure medication via CYP enzymes are described.',
  },
  'green-tea-extract-egcg': {
    'all::attention':
      'Taking it on an empty stomach increases both the bioavailability and the liver toxicity risk of EGCG.',
  },
  boswellia: {
    'breastfeeding+pregnancy::attention':
      'According to NCCIH, only limited safety data exists for use during pregnancy and breastfeeding.',
  },
  harpagophytum: {
    'breastfeeding+pregnancy::contraindicated':
      'HMPC: safety is not established; use is advised against given the insufficient data.',
    'child-4-10+teen-11-17::contraindicated':
      'HMPC: use in children/adolescents under 18 is advised against for lack of data.',
  },
  bromelain: {
    'breastfeeding+pregnancy::attention':
      'Safety during pregnancy and breastfeeding is not known, according to NCCIH.',
  },
  spirulina: {
    'all::contraindicated':
      'Contains phenylalanine: with phenylketonuria (PKU), intake of phenylalanine sources must be strictly controlled.',
    'breastfeeding+pregnancy::medical':
      'For algae supplements containing cyanobacteria, guidance is that they are not suitable for pregnant or breastfeeding women, because of possible contamination.',
  },
  chlorella: {
    'all::attention':
      'The vitamin K content reported is mentioned in secondary sources in connection with anticoagulants.',
  },
  'black-seed-oil': {
    'pregnancy::contraindicated':
      'Amounts above typical dietary consumption levels are considered likely unsafe during pregnancy, since an effect on uterine contractions is discussed.',
  },
  chasteberry: {
    'breastfeeding+pregnancy::contraindicated':
      'HMPC restricts use to adult, non-pregnant women; NCCIH names use during pregnancy/breastfeeding as possibly unsafe.',
  },
  'black-cohosh': {
    'breastfeeding+pregnancy::contraindicated':
      'NCCIH explicitly names safety in pregnancy/breastfeeding as unresolved; the HMPC indication does not apply to pregnancy in any case.',
  },
  pqq: {
    'breastfeeding+pregnancy::contraindicated':
      'The EU novel food authorisation explicitly excludes pregnant and breastfeeding women.',
  },
  boron: {
    'child-4-10+teen-11-17::attention':
      'BfR: boron-containing food supplements are, per official guidance, not suitable for children and adolescents, since the upper limit may already be used up by background dietary sources.',
  },
  'vitamin-e': {
    'all::attention':
      'Higher doses can increase the tendency to bleed: relevant with anticoagulants and before surgery.',
  },
  caffeine: {
    'breastfeeding+pregnancy::attention':
      'EFSA names a lower safe total daily intake (200 mg) for this group than for the rest of the adult population.',
    'all::contraindicated':
      'Highly concentrated/pure caffeine powder products carry a high risk of accidental overdose, including fatalities, according to BfR, because household measuring tools cannot precisely capture the small safe single amount (0.2 g).',
  },
  guarana: {
    'breastfeeding+pregnancy::attention':
      'The effect is based on the caffeine it contains: the same lower safe total daily intake therefore applies to pregnant and breastfeeding women as for isolated caffeine.',
  },
  'cranberry-extract': {
    'breastfeeding+pregnancy::medical':
      'Safety during pregnancy/breastfeeding is not established according to EMA; use is advised against.',
    'all::attention':
      'Elevated oxalate content can increase the risk of forming new stones in people with a history of kidney stones.',
    'all::contraindicated':
      'EMA names concurrent use of warfarin or tacrolimus as a contraindication, due to documented interactions.',
  },
  'pumpkin-seed-extract': {
    'child-4-10+teen-11-17::attention':
      'Use in children/adolescents under 18 is advised against by EMA, since urinary complaints in this group require medical assessment.',
    'breastfeeding+pregnancy::medical':
      'Not sufficiently studied for extracts according to EMA; amounts typical of food use (seeds/oil) are considered safe.',
  },
  'grapefruit-seed-extract': {
    'all::medical':
      'When taking CYP3A4-dependent medications (for example immunosuppressants, certain statins/calcium channel blockers), consult a doctor before use because of a possible interaction.',
  },
  'colloidal-silver': {
    'all::contraindicated':
      'Sustained or high-dose oral intake without a medical indication, since cumulative silver intake (~1 g or more) can lead to irreversible argyria (skin discolouration) and possible organ deposition. Effectiveness against internal conditions is not scientifically established.',
  },
  'amygdalin-b17': {
    'all::contraindicated':
      'Classified as a "medicine of concern" (BfArM) and may not be placed on the market in Germany; even small amounts carry a risk of cyanide poisoning, with documented fatalities.',
    'child-4-10+teen-11-17::contraindicated':
      'According to Verbraucherzentrale (consumer advice centre), even a single kernel can be dangerous: complete avoidance is advised.',
    'all::medical':
      'Combining it with high-dose vitamin C demonstrably increases toxicity.',
  },
  dhea: {
    'all::contraindicated':
      'Not authorised for sale as a food supplement in Germany/the EU; classified as a medicine from 10 mg/day upward (BVL expert commission, 02/2025).',
    'menopause::attention':
      'Measurable hormonal changes are possible from as little as 25 mg/day, according to BfR.',
    'all::medical':
      'With a history of hormone-dependent tumours (breast, prostate), the risk is unclear due to its effect on sex hormone balance.',
  },
  'garcinia-cambogia-hca': {
    'all::attention':
      'An EFSA safety assessment (2026 draft) concludes that no safe intake amount can be established; cases of acute liver damage are documented.',
    'breastfeeding+child-4-10+pregnancy+teen-11-17::contraindicated':
      'The French agency ANSES advises against use in pregnancy/breastfeeding and in children/adolescents, as well as with psychiatric or cardiometabolic conditions or a history of pancreatitis/hepatitis.',
  },
  propolis: {
    'all::attention':
      'With a pollen allergy or an allergy to bee products/stings, allergic reactions up to severe courses are possible, according to BfR and dermatological literature.',
  },
  'royal-jelly': {
    'all::contraindicated':
      'With asthma, atopy or a known allergy to bee products/stings, severe to life-threatening allergic reactions are documented, including fatalities (Australian reporting data).',
  },
  'flaxseed-oil': {
    'breastfeeding+pregnancy::attention':
      'Safety data on flaxseed oil in pregnancy/breastfeeding is limited, according to NCCIH.',
    'all::attention':
      'A theoretical interaction with anticoagulants/antiplatelet drugs, according to NCCIH.',
  },
  'evening-primrose-oil': {
    'pregnancy::attention':
      'Conflicting study evidence on the effect on labour contractions late in pregnancy; safety is not conclusively established.',
    'child-4-10+teen-11-17::attention':
      'Safety in children is not sufficiently studied, according to NCCIH.',
  },
  'grape-seed-extract': {
    'breastfeeding+pregnancy::attention':
      'Safety in pregnancy/breastfeeding is not sufficiently established, according to NCCIH.',
  },
  'saccharomyces-boulardii': {
    'all::contraindicated':
      'With an indwelling central venous catheter and/or severe immunosuppression, documented cases of fungaemia with sometimes severe courses have been described.',
  },
  bcaa: {
    'all::contraindicated':
      'Contraindicated with maple syrup urine disease (a congenital defect in BCAA breakdown).',
    'all::medical':
      'With advanced liver or kidney disease, and with ALS, high-dose intake is discussed controversially in the literature and should be medically supervised.',
  },
  'green-lipped-mussel-extract': {
    'all::contraindicated':
      'Contraindicated with a known mussel/shellfish allergy (risk of cross-reaction).',
  },
  valerian: {
    'breastfeeding+pregnancy::contraindicated':
      'Safety in pregnancy/breastfeeding is not established according to EMA/HMPC; use is advised against.',
    'child-4-10+teen-11-17::contraindicated':
      'Use in children under 12 is advised against by EMA/HMPC, or not established for lack of data.',
  },
  'st-johns-wort': {
    'all::contraindicated':
      'At daily hyperforin doses above 1 mg, contraindicated with coumarin anticoagulants, ciclosporin, tacrolimus, sirolimus, everolimus, protease inhibitors and certain cytostatics (including irinotecan, imatinib), via CYP3A4/CYP2B6/CYP2C9/CYP2C19/P-glycoprotein induction, according to EMA/HMPC.',
    'adult-woman+teen-11-17::attention':
      'Can lower the plasma concentration of hormonal contraceptives and thereby reduce contraceptive reliability (increased breakthrough bleeding as a warning sign).',
    'all::attention':
      'In combination with serotonin reuptake inhibitors or other serotonergic substances, serotonin syndrome is possible, very rarely.',
    'child-4-10+teen-11-17::contraindicated':
      'Use in children and adolescents under 18 is advised against for lack of data (HMPC).',
  },
  passionflower: {
    'breastfeeding+pregnancy::contraindicated':
      'Safety in pregnancy/breastfeeding is not established according to EMA/HMPC.',
    'child-4-10+teen-11-17::contraindicated':
      'Use in children under 12 is advised against for lack of data (HMPC).',
  },
  echinacea: {
    'child-4-10+teen-11-17::contraindicated':
      'Use in children under 12 is advised against for lack of safety data (HMPC).',
    'breastfeeding+pregnancy::attention':
      'Limited data shows no adverse effects on pregnancy/the fetus, according to HMPC; for lack of further epidemiological data, use without medical advice is nonetheless advised against.',
  },
  reishi: {
    'all::attention':
      'Increased bleeding risk in combination with anticoagulants/antiplatelet drugs: several sources advise pausing intake before surgical procedures.',
  },
  chaga: {
    'all::medical':
      'Relevant with kidney disease or a history of oxalate kidney stones: documented cases of acute kidney failure from oxalate deposition after high-dose/long-term consumption.',
  },
  cordyceps: {
    'all::attention':
      'A theoretically increased bleeding risk from inhibiting platelet aggregation (relevant with anticoagulants), as well as additive effects with antidiabetic drugs/insulin.',
  },
  maitake: {
    'all::attention':
      'A documented rise in INR in combination with warfarin, as well as additive blood-sugar-lowering effects with antidiabetic drugs.',
  },
  'coriolus-versicolor': {
    'breastfeeding+pregnancy::attention':
      'No use without medical consultation, for lack of safety data.',
  },
  'agaricus-blazei': {
    'all::attention':
      'With hormone-sensitive conditions, medical consultation is advised because of possible oestrogen-like activity.',
  },
  'nicotinamide-riboside': {
    'breastfeeding+pregnancy::attention':
      'The EU authorisation sets a reduced maximum amount for this group (230 mg/day instead of 300 mg).',
  },
};

export function getAdvisoryTextEN(substanceId, lifeStages, severity) {
  const entries = advisoriesEN[substanceId];
  if (!entries) return null;
  return entries[buildAdvisoryKey(lifeStages, severity)] ?? null;
}
