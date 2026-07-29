/**
 * i18n/en/analysis.js
 * Analysis area (app/analysis.jsx): daily totals, costs, unreviewed spend.
 *
 * Wording rule: "never reviewed" does not mean "ineffective". A gap in
 * observation must not turn into a verdict about the product.
 */

export default {
  'analysis.kicker': 'Analysis',
  'analysis.title': 'Your products at a glance',
  'analysis.subtitle':
    'Daily totals across all products, running costs, and the question of what has ever been reviewed.',

  // Daily totals
  'analysis.totals.title': 'Daily total per substance',
  'analysis.totals.subtitle':
    'Upper limits apply to the total daily amount, not to a single container.',
  'analysis.totals.empty': 'No active products yet.',
  'analysis.totals.fromProducts_one': 'from {count} product',
  'analysis.totals.fromProducts_other': 'from {count} products',
  'analysis.totals.converted': 'includes converted compound amounts',
  'analysis.totals.unresolved_one': '{count} entry could not be included',
  'analysis.totals.unresolved_other': '{count} entries could not be included',
  'analysis.totals.allClear': 'No daily total exceeds a documented upper limit.',

  // Costs
  'analysis.cost.title': 'Running costs',
  'analysis.cost.perMonth': '{amount} {currency} per month',
  'analysis.cost.perDay': '{amount} {currency} per day',
  'analysis.cost.empty':
    'No price is on file for any of your products. Add the purchase price and package size and the calculation will appear here.',
  'analysis.cost.estimated_one':
    '{count} item is projected from planned use, because no intake has been recorded yet.',
  'analysis.cost.estimated_other':
    '{count} items are projected from planned use, because no intake has been recorded yet.',
  'analysis.cost.withoutPrice_one': 'Price missing for {count} product: {names}',
  'analysis.cost.withoutPrice_other': 'Price missing for {count} products: {names}',
  'analysis.cost.isEstimate': 'projected',

  // Entering a price
  'analysis.price.title': 'Add a price',
  'analysis.price.purchasePrice': 'Purchase price',
  'analysis.price.packageUnits': 'Capsules/servings per pack',
  'analysis.price.save': 'Save',

  // Never reviewed
  'analysis.unreviewed.title': 'Never reviewed',
  'analysis.unreviewed.text_one':
    '{count} product costing {amount} {currency} a month keeps running without you ever recording whether it does anything for you: {names}',
  'analysis.unreviewed.text_other':
    '{count} products costing {amount} {currency} a month together keep running without you ever recording whether they do anything for you: {names}',
  'analysis.unreviewed.hint':
    'This is not a verdict on the products — it only means there is no observation on file. You can catch up on that in outcome tracking.',
  'analysis.unreviewed.allReviewed': 'Every priced product has an observation on file.',
  'analysis.unreviewed.goToOutcome': 'Go to outcome tracking',

  // Shared goals
  'analysis.sharedGoals.title': 'Several products, same goal',
  'analysis.sharedGoals.entry': '{metric}: {names}',
  'analysis.sharedGoals.hint':
    'That need not be a mistake. It is worth checking whether all of them are really needed.',

  'analysis.status.reviewedContinue': 'reviewed, continued',
  'analysis.status.reviewedStop': 'reviewed, stopped',
  'analysis.status.reviewedUnclear': 'reviewed, unclear',
  'analysis.status.running': 'being observed',
  'analysis.status.neverReviewed': 'never reviewed',
};
