/**
 * data/en/evidenceGraph.js
 * ─────────────────────────────────────────────────────────────
 * English overlay for data/evidenceGraph.js. Same rule as the other
 * overlays: German stays canonical, only `summary` and `population`
 * are translated. `sources` are literature citations and are NOT
 * translated (project rule, see CLAUDE.md "Sprachen").
 *
 * Keyed `${substanceId}|${outcome}`, matching the order in
 * evidenceGraph.js.
 */

export const EVIDENCE_SUMMARIES_EN = {
  'magnesium|muscle-cramps': {
    population: 'Mostly older adults with idiopathic leg cramps',
    summary:
      'The Cochrane review (Garrison 2020, 11 trials, 735 participants) found no clinically meaningful benefit over placebo for idiopathic leg cramps at any of the doses studied. For pregnancy-associated leg cramps, the evidence is of lower certainty, conflicting, and unclear.',
  },
  'magnesium|migraine': {
    population: 'Adults with migraine, taken preventively',
    summary:
      'A Cochrane review (Rodriguez 2025) reports reduced migraine frequency and severity, at low to moderate certainty of evidence, and calls for larger trials. An earlier systematic review (von Luckner 2018, Headache 58(2)) rates the evidence as Grade C (possibly effective).',
  },
  'magnesium|sleep': {
    population: 'Adults with self-reported poor sleep',
    summary:
      'Individual randomized, placebo-controlled trials report improvements (e.g. magnesium bisglycinate 250 mg/day over 4 weeks, small effect, insomnia index stayed in the subthreshold range; magnesium L-threonate 1 g/day over 21 days with objectively measured improvement). A systematic review in older adults found only limited evidence overall for use as an over-the-counter sleep aid; the evidence is considered inconsistent.',
  },
};
