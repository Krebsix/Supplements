/**
 * i18n/en/addSupplement.js
 * Add and edit supplement screen (app/AddSupplement.jsx).
 */

export default {
  'addSupplement.screenTitle.edit': 'Edit supplement',
  'addSupplement.screenTitle.scan': 'Review scan result',
  'addSupplement.screenTitle.manual': 'Manual routine entry',

  'addSupplement.screenSubtitle.edit':
    'Adjust name, dosage, daily slots and notes for your active routine.',
  'addSupplement.screenSubtitle.scan':
    'Check the recognized details, fill in anything missing, and add the entry to your routine only after you confirm it.',
  'addSupplement.screenSubtitle.manual':
    'Create your own routine entry with name, dosage, daily slots and optional notes. Not medical advice.',

  'addSupplement.primaryButton.edit': 'Save changes',
  'addSupplement.primaryButton.scan': 'Add scan result',
  'addSupplement.primaryButton.manual': 'Save manual entry',

  'addSupplement.modeLabel.edit': 'Active routine',
  'addSupplement.modeLabel.scan': 'Scanner review',
  'addSupplement.modeLabel.manual': 'New routine entry',

  'addSupplement.modePill.edit': 'Edit',
  'addSupplement.modePill.scan': 'Review',
  'addSupplement.modePill.manual': 'Manual',

  'addSupplement.trustTitle': 'Review note',
  'addSupplement.trustCopy.scan':
    'Scan data is a starting point. Dosage and unit that were not recognized stay deliberately empty and are stored transparently as missing until you fill them in.',
  'addSupplement.trustCopy.edit':
    'Changes affect your active daily routine. Historical intakes stay untouched.',
  'addSupplement.trustCopy.manual':
    'This entry structures your personal routine. The app gives no diagnosis, therapy, or dosing guidance here.',

  'addSupplement.nameLabel': 'Supplement name',
  'addSupplement.nameHelper':
    'Use a clear product or substance name so dashboard, history and archive stay unambiguous.',
  'addSupplement.namePlaceholder': 'e.g. Magnesium bisglycinate',

  'addSupplement.purposeLabel': 'Purpose / context',
  'addSupplement.purposeHelper':
    'Describes the personal routine context, not the medical effect.',
  'addSupplement.purposePlaceholder': 'e.g. evening routine, recovery, focus',

  'addSupplement.categoryLabel': 'Category / group',
  'addSupplement.categoryHelper':
    'Helps later with filtering, stack logic and cleaner evaluation.',
  'addSupplement.categoryPlaceholder': 'e.g. minerals',
  'addSupplement.categoryExamples': 'Examples from your current inventory: {examples}',

  'addSupplement.amountLabel': 'Amount per intake',
  'addSupplement.amountHelper': 'Just the visible routine amount, not guidance.',
  'addSupplement.amountPlaceholder': 'e.g. 300',

  'addSupplement.unitLabel': 'Unit',
  'addSupplement.unitHelper': 'e.g. mg, IU, capsule, drops or serving.',
  'addSupplement.unitPlaceholder': 'mg',

  'addSupplement.routineSectionTitle': 'Daily routine',
  'addSupplement.routineSectionSubtitle':
    'Choose the time of day this entry should appear in. Multiple slots are possible.',
  'addSupplement.selectedSlots': 'Selected: {slots}',
  'addSupplement.noSlotSelected': 'No daily slot selected yet.',

  'addSupplement.timingLabel': 'Timing display',
  'addSupplement.timingHelper':
    'Optional free text for a more natural display, e.g. "in the evening after dinner".',
  'addSupplement.timingPlaceholder': 'Optional: e.g. in the evening after dinner',

  'addSupplement.childSafeTitle': 'Flag family note',
  'addSupplement.childSafeSubtitle':
    'Internal marker for later notes and filters. Not a safety clearance and not dosing guidance.',

  'addSupplement.notesLabel': 'Internal notes',
  'addSupplement.notesHelper': 'Optional: origin, intake context or personal observations.',
  'addSupplement.notesPlaceholder': 'Optional: notes on intake or origin',

  'addSupplement.alert.nameMissingTitle': 'Name missing',
  'addSupplement.alert.nameMissingMessage': 'Please enter at least a name for the supplement.',
  'addSupplement.alert.slotMissingTitle': 'Slot missing',
  'addSupplement.alert.slotMissingMessage': 'Please select at least one daily slot.',
  'addSupplement.alert.notFoundTitle': 'Entry not found',
  'addSupplement.alert.notFoundMessage':
    'This entry could no longer be found in the local store.',
  'addSupplement.alert.updatedTitle': 'Updated',
  'addSupplement.alert.updatedMessage': 'The changes were saved to your active routine.',
  'addSupplement.alert.savedTitle': 'Saved',
  'addSupplement.alert.savedScanMessage':
    'The confirmed scan result was added to your routine.',
  'addSupplement.alert.savedManualMessage':
    'The supplement was added to your routine as a manual entry.',
  'addSupplement.alert.goToDashboard': 'Go to dashboard',

  'addSupplement.scan.purpose': 'Taken from scan',
  'addSupplement.scan.category': 'Scan result',
  'addSupplement.scan.brandNote': 'Brand: {brand}',
  'addSupplement.scan.ingredientsNote': 'Recognized ingredients: {ingredients}',
  'addSupplement.scan.timingNote': 'Unconfirmed timing note: {timing}',
  'addSupplement.scan.warningsNote': 'Review notes:\n- {warnings}',

  'addSupplement.defaultPurpose': 'Custom',
  'addSupplement.defaultCategory': 'Custom',

  'addSupplement.cureTitle': 'Intake cycle',
  'addSupplement.cureSubtitle':
    'Alternating intake and break phases, for example 21 days on, 7 days off. On break days the product does not appear in the daily plan.',
  'addSupplement.cureOnLabel': 'Intake days',
  'addSupplement.cureOnHelper': 'Length of the intake phase in days.',
  'addSupplement.cureOffLabel': 'Break days',
  'addSupplement.cureOffHelper': 'Length of the break in days.',
  'addSupplement.alert.cureInvalidTitle': 'Cycle details incomplete',
  'addSupplement.alert.cureInvalidMessage':
    'An intake cycle needs intake days and break days, each at least 1.',
};
