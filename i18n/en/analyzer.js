/**
 * i18n/en/analyzer.js
 * Scan analysis messages (ScanAnalyzer.js).
 *
 * Wording rule: the app reports what the label says. It does not assess
 * whether a product is suitable for anyone.
 */

export default {
  'analyzer.notConfigured': 'Scan analysis is not configured (scanConfig.js).',
  'analyzer.noCaptures': 'No photos available.',
  'analyzer.prepareFailed': 'Photo "{step}" could not be prepared.',
  'analyzer.timeout': 'The analysis took too long. Please try again.',
  'analyzer.unreachable': 'The analysis cannot be reached. Please check your internet connection.',
  'analyzer.failedWithStatus': 'The analysis failed (status {status}).',
  'analyzer.noResult': 'The analysis returned no usable result.',

  'analyzer.manufacturerNote': "Manufacturer's statement: {text}",
  'analyzer.uncertain': 'Uncertain reading: {text}',
  'analyzer.uncertaintyNote':
    'AI reading of the label photos. All details come from the product label and must be checked before being saved. Not health advice.',
};
