/**
 * data/en/outcomeMetrics.js
 * ─────────────────────────────────────────────────────────────
 * English text overlay for data/outcomeMetrics.js.
 *
 * WHY THIS FILE IS EMPTY (deliberately, not an oversight):
 * data/outcomeMetrics.js carries no German free text of its own.
 * Each entry in `OUTCOME_METRICS` is { id, labelKey, direction }:
 *   - `labelKey` points into the i18n catalog (i18n/de/outcome.js /
 *     i18n/en/outcome.js), e.g. 'outcome.metric.sleepQuality' — the
 *     English label "Sleep quality" etc. already exists there via the
 *     regular i18n pipeline, not this data/en/ overlay mechanism.
 *   - `direction` ('higher-better' / 'lower-better') is a code value,
 *     not display text.
 *   - `SCALE_MIN`/`SCALE_MAX`/`TRIAL_DURATIONS`/
 *     `MIN_MEANINGFUL_DURATION`/`MIN_RATINGS_FOR_COMPARISON` are all
 *     numbers. The scale-endpoint labels the file's own header
 *     mentions ("very poor" ... "very good") already live in
 *     i18n/de/outcome.js and i18n/en/outcome.js, not in this data file.
 *
 * So there is nothing for a data/en/ overlay to carry for this file.
 * `OUTCOME_METRICS_EN` is exported as an empty object for structural
 * consistency with the other data/en/ overlays.
 *
 * tests/data-en.test.mjs contains a canary check: it asserts every
 * entry in data/outcomeMetrics.js still has exactly the field set
 * above. If a future entry adds a genuine free-text field, that test
 * fails on purpose, as a signal that this overlay needs real content.
 */

export const OUTCOME_METRICS_EN = {};
