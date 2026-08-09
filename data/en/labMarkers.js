/**
 * data/en/labMarkers.js
 * ─────────────────────────────────────────────────────────────
 * English text overlay for data/labMarkers.js.
 *
 * WHY THIS FILE IS EMPTY (deliberately, not an oversight):
 * data/labMarkers.js carries no German free text of its own. Each
 * entry is { id, labelKey, commonUnit, relatedSubstanceId }:
 *   - `labelKey` points into the i18n catalog (i18n/de/lab.js /
 *     i18n/en/lab.js), e.g. 'lab.marker.ferritin' — the English label
 *     "Ferritin" etc. already exists there, translated via the
 *     regular i18n pipeline, not this data/en/ overlay mechanism.
 *   - `commonUnit` (e.g. 'µg/l', 'mmol/l') is a unit abbreviation, not
 *     language-dependent text.
 *   - `id` and `relatedSubstanceId` are identifiers, not display text.
 *
 * So there is nothing for a data/en/ overlay to carry for this file.
 * `LAB_MARKERS_EN` is exported as an empty object for structural
 * consistency with the other data/en/ overlays (and so a consumer can
 * import it uniformly without a special case).
 *
 * tests/data-en.test.mjs contains a canary check: it asserts every
 * entry in data/labMarkers.js still has exactly the field set above.
 * If a future entry adds a genuine free-text field (e.g. a `note`),
 * that test fails on purpose, as a signal that this overlay needs to
 * gain real content.
 */

export const LAB_MARKERS_EN = {};
