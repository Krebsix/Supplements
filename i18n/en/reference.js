/**
 * i18n/en/reference.js
 * Reference value comparison texts (ReferenceCheck.js).
 *
 * Wording rule: the app compares amounts against published reference
 * values. It never states what someone should take. "is above the
 * reference value" describes a comparison; "you should reduce" would be
 * advice and is not permitted here.
 */

export default {
  // Status labels
  'reference.status.below': 'Below reference value',
  'reference.status.within': 'Around the reference value',
  'reference.status.aboveReference': 'Above reference value',
  'reference.status.aboveLimit': 'Above upper limit',
  'reference.status.safeLevel': 'Within the level assessed as safe',
  'reference.status.unknown': 'No reference value on file',

  // No comparison possible
  'reference.noAmount':
    'Without a recognised amount no comparison is possible. Reference value: {reference} {unit} per day.',
  'reference.unitMismatch':
    'The unit "{unit}" cannot be converted reliably into {targetUnit}. Please take the value from the label.',
  'reference.compoundUnknown':
    'This amount refers to {form}, not to elemental {substance}. No reliable elemental share is on file for this compound, so no comparison with the reference value of {reference} {unit} is possible. The elemental amount is stated in the product’s nutrition table.',

  // Comparison results
  'reference.aboveLimit':
    '{amount} is above the tolerable total intake of {limit} per day. That limit covers all sources together, including food and other products.',
  'reference.safeLevel':
    '{amount} is within the daily amount assessed as safe by EFSA/BfR, which is {limit}. There is no separate daily reference value for this substance because it is not an essential nutrient.',
  'reference.aboveReference':
    '{amount} is above the reference value of {reference} per day.',
  'reference.aboveReferenceWithLimit':
    '{amount} is above the reference value of {reference} per day, but below the upper limit of {limit}.',
  'reference.within':
    '{amount} corresponds roughly to the reference value of {reference} per day.',
  'reference.below':
    '{amount} covers about {percent} % of the reference value of {reference} per day. The remainder usually comes from food.',

  // Added when a compound amount was converted to the elemental amount
  'reference.compoundBasis':
    ' Basis of this calculation: {amount} {unit} of {compound} contains around {percent} % elemental {substance}. Reference values always refer to the elemental amount.',
  'reference.compoundVaries':
    ' The share varies by commercial form — the nutrition table on the product is what counts.',

  // Unknown substance
  'reference.unmatched':
    'This entry is not yet in the substance database. Please take the details directly from the label.',
};
