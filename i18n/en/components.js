/**
 * i18n/en/components.js
 * Reused components (components/).
 */

export default {
  // SubstanceInsightCard.jsx
  'components.insight.unnamedEntry': 'Unnamed entry',
  'components.insight.referenceHeading': 'Comparison with reference value',
  'components.insight.referenceMeta':
    'Reference value {reference} {unit} · Upper limit {upperLimit} {unit} per day',
  'components.insight.formLabel': 'Detected form',
  'components.insight.formBio': 'Absorption: {bioavailability}',
  'components.insight.useCases': 'Areas of use',
  'components.insight.formsCompare': 'Forms compared',
  'components.insight.fatSolubleHint':
    'Fat-soluble: absorption is markedly better with a meal containing fat.',
  'components.insight.caution': 'Please note',
  'components.insight.sources': 'Sources',
  'components.insight.showLess': 'Show less',
  'components.insight.showMore': 'Show forms and notes',

  // SupplementResultCard.jsx
  'components.result.fieldStateDetected': 'Detected',
  'components.result.fieldStateReview': 'Review',
  'components.result.fieldStateMissing': 'Missing',
  'components.result.productNameMissing': 'Product name not detected',
  'components.result.brandMissing': 'Brand not detected',
  'components.result.dosageMissing': 'Dosage not detected',
  'components.result.confidenceNone': 'No assessment available',
  'components.result.confidenceHigh': 'High technical recognition',
  'components.result.confidenceReview': 'Review required',
  'components.result.confidenceManual': 'Manual check required',
  'components.result.identityEyebrow': 'Detected product identity',
  'components.result.scanBadge': 'Scan',
  'components.result.confidenceTitle': 'Technical recognition',
  'components.result.confidenceExplanation':
    'The percentage only describes the technical recognition of the test model. It confirms neither the factual accuracy nor the suitability of the product.',
  'components.result.reviewSectionTitle': 'Details to review',
  'components.result.reviewSectionHint': 'Check before accepting',
  'components.result.fieldProductName': 'Product name',
  'components.result.helperProductNameDetected':
    'Compare with the front of the product.',
  'components.result.helperProductNameMissing':
    'Must be added manually in the next step.',
  'components.result.fieldBrand': 'Brand',
  'components.result.helperBrandDetected':
    'Check spelling and manufacturer.',
  'components.result.helperBrandMissing':
    'Check the product label and add it.',
  'components.result.fieldDosage': 'Dosage',
  'components.result.helperDosageDetected':
    'Check amount, unit and serving reference.',
  'components.result.helperDosageMissing':
    'No dosage is filled in automatically.',
  'components.result.fieldIngredients': 'Ingredients',
  'components.result.ingredientsCount_one': '1 substance detected',
  'components.result.ingredientsCount_other': '{count} substances detected',
  'components.result.helperIngredientsDetected':
    'Compare all names and amounts with the label.',
  'components.result.helperIngredientsMissing':
    'No usable substances present.',
  'components.result.ingredientsSectionTitle': 'Detected substances',
  'components.result.ingredientsSectionDescription':
    'Recognition initially names only substance names. Amounts, forms and composition are not yet confirmed by this.',
  'components.result.ingredientsEmpty': 'No ingredients detected.',
  'components.result.warningsSectionTitle': 'Review notes',
  'components.result.warningsEmpty': 'No additional notes available.',
  'components.result.timingTitle': 'Timing note',
  'components.result.timingBadge': 'Suggestion',
  'components.result.timingEmpty': 'No timing suggestion available.',
  'components.result.timingFootnote':
    'This note is not automatically confirmed as a personal routine.',
  'components.result.uncertaintyTitle': 'Limits of the analysis',

  // CertificationPanel.jsx
  'components.certification.emptyTitle': 'No certification marks detected',
  'components.certification.emptyText':
    'No known certification mark was visible in the captures. This is not a quality judgment: many products carry no certification, and marks may be on unscanned packaging sides.',
  'components.certification.scopeLabel': 'What it does not cover',
  'components.certification.issuer': 'Issued by: {issuer}',
  'components.certification.unknownLabel': 'Not matched',
  'components.certification.unknownNote':
    'These label claims are not listed in the certification database. Marketing terms such as "lab-tested" or "premium" are not protected certifications.',

  // AppHeader.jsx
  'components.header.kicker': 'MySuplea',
};
