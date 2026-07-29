/**
 * i18n/en/stack.js
 * Stack analysis texts (StackAnalyzer.js).
 * Descriptive wording only — the app reports totals, it does not advise.
 */

export default {
  'stack.warning.aboveLimit_one':
    '{name}: the daily total from {count} product is {amount} {unit}, above the upper limit of {limit} {unit}.',
  'stack.warning.aboveLimit_other':
    '{name}: the daily total from {count} products is {amount} {unit}, above the upper limit of {limit} {unit}.',
  'stack.warning.aboveReference':
    '{name}: {amount} {unit} in total from {count} products, above the reference value of {reference} {unit}, but below the upper limit.',
  'stack.warning.duplicate': '{name} is present in {count} of your products.',
  'stack.title': 'Daily total across all products',
  'stack.subtitle':
    'Upper limits apply to the total daily amount, not to a single container.',
  'stack.empty': 'No active products yet.',
  'stack.fromProducts_one': 'from {count} product',
  'stack.fromProducts_other': 'from {count} products',
  'stack.converted': 'includes converted compound amounts',
  'stack.unresolved.title': 'Not included in the total',
  'stack.unresolved.unknownSubstance': 'Substance not in the database',
  'stack.unresolved.noAmount': 'No amount recorded',
  'stack.unresolved.noComparable': 'Amount cannot be converted reliably',
};
