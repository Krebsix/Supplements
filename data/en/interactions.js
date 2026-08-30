/**
 * data/en/interactions.js
 * ─────────────────────────────────────────────────────────────
 * English overlay for data/interactions.js. Same rule as the other
 * overlays: German stays canonical, this file only translates the
 * `note` texts. `sources` are literature citations and are NOT
 * translated (project rule, see CLAUDE.md "Sprachen").
 *
 * PAIR_NOTES_EN is keyed `${a}|${b}` in exactly the order used in
 * PAIR_RULES; INTAKE_NOTES_EN is keyed by substanceId.
 */

export const PAIR_NOTES_EN = {
  'iron|calcium':
    'Calcium inhibits the absorption of iron when taken at the same time. The two are usually taken with a time gap of several hours.',
  'iron|zinc':
    'High-dose iron and zinc compete for the same absorption pathways. At supplement doses of both, taking them with a time gap is documented practice.',
  'zinc|copper':
    'Long-term high zinc intake lowers copper absorption and can contribute to low copper status. Combination products often account for this with a fixed ratio.',
  'calcium|magnesium':
    "Very high doses of calcium and magnesium can interfere with each other's absorption. At typical doses the effect is small; high-dose single supplements are often taken with a time gap.",
  'calcium|zinc':
    'High calcium doses can reduce zinc absorption. The effect is small with typical dietary intake; with high-dose supplements, a time gap is documented practice.',
  'green-tea-extract-egcg|iron':
    'Green tea polyphenols (EGCG) bind non-heme iron and markedly reduce its absorption. Iron supplements and green tea extract are taken with a time gap.',
  'iron|vitamin-c':
    'Vitamin C improves the absorption of non-heme iron when taken at the same time. This combination is used deliberately.',
};

export const INTAKE_NOTES_EN = {
  iron:
    'Iron is absorbed best on an empty stomach, but this more often irritates the stomach. Coffee and tea reduce absorption; a gap of 1 to 2 hours is documented practice.',
  psyllium:
    'Psyllium husk swells considerably: it is taken with plenty of fluid. A gap of about 2 hours to other supplements and medications is documented practice, because the swelling fiber delays absorption.',
  caffeine:
    'Caffeine has a half-life of several hours; intake later in the day can affect sleep. EFSA names about 3 mg per kg body weight as a single dose considered safe: around 180 mg at 60 kg, around 240 mg at 80 kg.',
  melatonin:
    'In studies, melatonin is usually used shortly before bedtime; daytime intake can cause drowsiness.',
  creatine:
    "For creatine, the timing of intake is secondary to its effect; adequate fluid intake is part of documented use.",
};
