/**
 * data/en/referenceValues.js
 * ─────────────────────────────────────────────────────────────
 * English text overlay for data/referenceValues.js. German stays
 * canonical; this file supplies English text for the LIFE_STAGES
 * catalog used by the reference-value comparison.
 *
 * SCOPE (deliberately narrow, matching the task that produced this
 * file): only the `short` and `note` fields of the eight `LIFE_STAGES`
 * entries are overlaid here, keyed by `stage.id`. The much larger
 * per-substance `upperLimitNote` strings inside the `referenceValues`
 * object are NOT covered by this file — that free text overlaps the
 * substance-level regulatory detail handled together with
 * data/substances.js, which is out of scope for this pass.
 *
 * STRUCTURE
 *   LIFE_STAGES_EN[stageId] = { short: string, note: string }
 *
 * WORDING RULES (compliance-critical, see project CLAUDE.md):
 * - The app compares amounts to published reference values; it never
 *   recommends an amount. Sentences describe what is generally usual
 *   ("supplementation should be medically supervised" mirrors the DE
 *   "gehören ärztlich begleitet" as a description of common practice,
 *   not an instruction from the app).
 * - No em dash ("—") in any of these strings. Numeric ranges use an
 *   en dash ("4–10"), matching the DE source's own typography for
 *   ranges, which is a different character from the banned "—".
 */

export const LIFE_STAGES_EN = {
  'child-4-10': {
    short: 'Child 4–10',
    note:
      'Considerably lower upper limits apply to children than to adults. Supplementation for children should generally be clarified medically.',
  },
  'teen-11-17': {
    short: 'Teens',
    note: 'Increased need during the growth phase, especially for calcium and iron.',
  },
  'adult-woman': {
    short: 'Woman',
    note: 'Due to menstruation, iron need is considerably higher than for men.',
  },
  'adult-man': {
    short: 'Man',
    note: 'Without a confirmed deficiency, iron supplementation is unusual for men.',
  },
  pregnancy: {
    short: 'Pregnancy',
    note:
      'Several values differ considerably. Vitamin A (retinol) is particularly critical here. Supplementation should be medically supervised.',
  },
  breastfeeding: {
    short: 'Breastfeeding',
    note: 'Increased need for iodine, vitamin A, zinc and vitamin C.',
  },
  menopause: {
    short: 'Menopause',
    note:
      'After menopause, iron need drops to the level seen in men, while calcium and vitamin D become more important for maintaining bone.',
  },
  senior: {
    short: '65+',
    note:
      "Absorption capacity for vitamin B12 decreases, and the body's own production of vitamin D declines.",
  },
};

export function getLifeStageOverlay(stageId) {
  return LIFE_STAGES_EN[stageId] ?? null;
}
