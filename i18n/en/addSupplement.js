/**
 * i18n/en/addSupplement.js
 * "Add" screen (app/AddSupplement.jsx): product card, two questions
 * (how often, when) and a collapsed "More details" section. Four entry
 * points: catalog/scan (?fromScan=1), edit (?editId=), manual with no
 * parameter.
 */

export default {
  'addSupplement.title.new': 'Add supplement',
  'addSupplement.title.edit': 'Edit supplement',
  'addSupplement.name.label': 'Name',
  'addSupplement.name.placeholder': 'e.g. Magnesium bisglycinate',
  'addSupplement.amount.label': 'Amount per intake',
  'addSupplement.amount.placeholder': 'e.g. 1',
  'addSupplement.unit.label': 'Unit',
  'addSupplement.unit.capsule': 'Capsule',
  'addSupplement.unit.tablet': 'Tablet',
  'addSupplement.unit.mg': 'mg',
  'addSupplement.unit.drops': 'Drops',
  'addSupplement.unit.ml': 'ml',
  'addSupplement.unit.portion': 'Serving',
  'addSupplement.unit.other': 'Other',
  'addSupplement.unit.otherPlaceholder': 'e.g. IU, g, sachet',
  'addSupplement.more.title': 'More details',
  'addSupplement.more.subtitle': 'Package, price, cycle, note. All optional.',
  'addSupplement.more.packageUnits': 'Package content',
  'addSupplement.more.packageUnitsPlaceholder': '120',
  'addSupplement.more.price': 'Purchase price in euro',
  'addSupplement.more.pricePlaceholder': '19.90',
  'addSupplement.more.cure': 'Cycle',
  'addSupplement.more.cureSubtitle': 'Intake days and pause days in turn.',
  'addSupplement.more.cureOn': 'Intake days',
  'addSupplement.more.cureOff': 'Pause days',
  'addSupplement.more.notes': 'Note',
  'addSupplement.more.notesPlaceholder': 'Optional',
  'addSupplement.save.new': 'Add to daily plan',
  'addSupplement.save.edit': 'Save',

  'addSupplement.alert.nameMissingTitle': 'Name missing',
  'addSupplement.alert.nameMissingMessage': 'Please enter at least a name for the supplement.',
  'addSupplement.alert.slotMissingTitle': 'Slot missing',
  'addSupplement.alert.slotMissingMessage': 'Please select at least one daily slot.',
  'addSupplement.alert.notFoundTitle': 'Entry not found',
  'addSupplement.alert.notFoundMessage':
    'This entry could no longer be found in the local store.',
  'addSupplement.alert.cureInvalidTitle': 'Cycle details incomplete',
  'addSupplement.alert.cureInvalidMessage':
    'An intake cycle needs intake days and break days, each at least 1.',
  'addSupplement.alert.limitTitle': 'Free tier limit reached',
  'addSupplement.alert.limitMessage':
    'The free tier holds up to {limit} products at a time. The Pro subscription removes this limit.',

  'addSupplement.defaultPurpose': 'Custom',
  'addSupplement.defaultCategory': 'Custom',

  'addSupplement.scan.warningsNote': 'Review notes:\n- {warnings}',

  // Product card, frequency and slot chips (Task 2)
  'addSupplement.scanHint': 'Read from the label, please check.',
  'addSupplement.product.change': 'Change',
  'addSupplement.product.noDetails': 'Ingredients not captured yet.',
  'addSupplement.frequency.title': 'How often per day?',
  'addSupplement.frequency.times': '{count}×',
  'addSupplement.slot.title': 'When?',
  'addSupplement.slot.default': 'Default: morning. Can be changed any time.',
  'addSupplement.slot.suggestion': 'Suggestion: {text} ({source})',
  'addSupplement.slot.none': 'Please select at least one intake time.',
};
