/**
 * data/en/bfrMaxAmounts.js
 * ─────────────────────────────────────────────────────────────
 * English overlay for data/bfrMaxAmounts.js: translates ONLY the
 * `note` texts, keyed by substanceId. Amounts, units and years stay
 * in the canonical file. German stays canonical; a missing key falls
 * back to German.
 *
 * Wording rules (see project CLAUDE.md): descriptive reporting of the
 * BfR proposals ("the BfR proposes", "BfR hint proposal"), never a
 * recommendation by this app; no em dash.
 */

export const BFR_MAX_NOTES_EN = {
  'vitamin-a': 'BfR hint proposal: vitamin A during pregnancy only after consulting a doctor.',
  'vitamin-e': 'The BfR sees a particular information need for men from age 55: uncontrolled supplementation can raise the prostate cancer risk.',
  'vitamin-k2': 'Applies to vitamin K2; for vitamin K1 the BfR names 80 µg. Warning hint proposal: people on anticoagulant medication seek medical advice before vitamin K products.',
  thiamin: 'No maximum amount proposed: low toxicity, no UL derived.',
  riboflavin: 'No maximum amount proposed: no established adverse effects, no UL derived.',
  pantothensaeure: 'No maximum amount proposed: low toxicity, no UL derived.',
  niacin: 'Applies to nicotinamide; from 16 mg per daily dose the BfR proposes a hint that pregnant women should not use such products. For nicotinic acid the BfR names 4 mg, for inositol hexanicotinate 4.4 mg.',
  'vitamin-b6': 'Lowered in 2024 after EFSA reduced the UL from 25 to 12 mg per day.',
  folate: 'For women of childbearing age and pregnant women in the first trimester, the BfR names 400 µg of folic acid per day as the most suitable measure to lower the neural tube defect risk.',
  biotin: 'No maximum amount proposed. Hint proposal: people undergoing a laboratory test inform the practice or laboratory staff about their biotin intake (interference with immunoassays).',
  sodium: 'No addition foreseen for nutritional purposes; the exception is special drinks to compensate increased sodium losses.',
  chloride: 'No addition foreseen for nutritional purposes; chloride occurs as a companion ion of other additions.',
  calcium: 'From 250 mg per daily dose the BfR proposes a hint to refrain from consuming further calcium-containing preparations.',
  phosphorus: 'No addition foreseen: the BfR sees no reasons for a targeted phosphorus addition to food supplements.',
  magnesium: 'Split into two or more portions per day.',
  iron: 'BfR warning hint proposal: men, postmenopausal women and pregnant women take iron only after consulting a doctor.',
  iodine: 'For pregnant and breastfeeding women the BfR names 150 µg because of the increased need.',
  zinc: 'From 3.5 mg per daily dose the BfR proposes a hint to refrain from consuming further zinc-containing preparations.',
  selenium: 'Lowered after the EFSA update of the UL to 255 µg per day.',
  copper: 'Only for products aimed at adults and labeled as not suitable for children and adolescents; for products also intended for adolescents from age 15, the BfR names zero.',
  boron: 'BfR hint proposal: not for children and adolescents, whose total intake from all sources can already reach the upper level.',
  silicium: 'Depends on the form: 350 mg silicon as silicon dioxide, 100 mg as silica gel, 10 mg each for organic forms (monomethylsilanetriol, choline-stabilized orthosilicic acid).',
};
