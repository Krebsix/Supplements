/**
 * i18n/en/lab.js — Lab values and medical report.
 *
 * Wording rule: the app does not evaluate lab values. No "too low", no
 * "deficiency", no "within range". It documents and shows the trend; the
 * interpretation belongs to a professional.
 */

export default {
  'lab.kicker': 'Lab values',
  'lab.title': 'Your values over time',
  'lab.subtitle':
    'Enter results to follow them over time. The app does not interpret the values, it collects them.',
  'lab.privacy': 'These entries also stay on your device.',

  'lab.marker.ferritin': 'Ferritin',
  'lab.marker.hemoglobin': 'Haemoglobin',
  'lab.marker.vitaminD': 'Vitamin D (25-OH)',
  'lab.marker.vitaminB12': 'Vitamin B12',
  'lab.marker.holoTC': 'Holo-transcobalamin',
  'lab.marker.folate': 'Folate',
  'lab.marker.magnesium': 'Magnesium',
  'lab.marker.zinc': 'Zinc',
  'lab.marker.selenium': 'Selenium',
  'lab.marker.calcium': 'Calcium',
  'lab.marker.tsh': 'TSH',
  'lab.marker.crp': 'CRP',
  'lab.marker.hba1c': 'HbA1c',
  'lab.marker.ldl': 'LDL cholesterol',
  'lab.marker.hdl': 'HDL cholesterol',
  'lab.marker.triglycerides': 'Triglycerides',
  'lab.marker.creatinine': 'Creatinine',
  'lab.marker.altGpt': 'ALT (GPT)',
  'lab.marker.other': 'Other value',

  'lab.new.title': 'Add a value',
  'lab.new.marker': 'Which value?',
  'lab.new.customName': 'Name',
  'lab.new.value': 'Result',
  'lab.new.unit': 'Unit',
  'lab.new.date': 'Date of measurement',
  'lab.new.datePlaceholder': 'YYYY-MM-DD',
  'lab.new.labName': 'Lab or practice',
  'lab.new.reference': 'Reference range from the report',
  'lab.new.referenceHint':
    'Optional. Reference ranges differ by laboratory and method, so the app does not bring its own. If your report states one, you can enter it here.',
  'lab.new.referenceMin': 'from',
  'lab.new.referenceMax': 'to',
  'lab.new.save': 'Save value',
  'lab.new.invalid': 'Please enter a result and a date.',

  'lab.edit.title': 'Edit lab value',
  'lab.edit.save': 'Save changes',

  'lab.list.title': 'Recorded values',
  'lab.list.empty': 'No values entered yet.',
  'lab.list.referenceGiven': 'Reference from the report: {min} to {max}',
  'lab.list.noReference': 'No reference range on file',
  'lab.list.intakeContext': 'Recorded in the 14 days before: {names}',
  'lab.list.delete': 'Delete value',
  'lab.list.deleteConfirm': 'Delete this value?',
  'lab.list.edit': 'Edit',

  'lab.disclaimer':
    'The app does not evaluate lab values and derives no need from them. It records what was measured and what was being taken at the time. The assessment belongs with a doctor.',

  'export.kicker': 'Report',
  'export.screenTitle': 'Report for your doctor or pharmacist',
  'export.screenSubtitle':
    'Creates an overview from your entries. You decide what goes in.',
  'export.sections': 'What should it contain?',
  'export.section.supplements': 'Current products',
  'export.section.totals': 'Daily totals per substance',
  'export.section.profile': 'Medication groups and notes',
  'export.section.lab': 'Lab values',
  'export.section.outcomes': 'Outcome observations',
  'export.section.adherence': 'Recorded intakes',
  'export.generate': 'Create report',
  'export.copy': 'Copy text',
  'export.copied': 'Copied to clipboard',
  'export.preview': 'Preview',

  'export.title': 'Supplement overview',
  'export.generatedOn': 'Created on {date}',
  'export.lifeStage': 'Reference values based on: {stage}',
  'export.disclaimer':
    'This overview was produced from self-reported entries in a supplement app. It contains no diagnosis and no recommendation. Amounts come from product labels, reference values from public sources (DGE, EFSA, BfR).',
  'export.none': 'No entries.',
  'export.purpose': 'Purpose stated by the user: {purpose}',
  'export.totalsIntro':
    'Total per substance across all recorded products. Compound amounts have been converted to the elemental amount.',
  'export.fromProducts_one': 'from {count} product',
  'export.fromProducts_other': 'from {count} products',
  'export.aboveLimit': 'above the upper limit of {limit} {unit}',
  'export.aboveReference': 'above the reference value of {reference} {unit}',
  'export.unresolved': '{count} entry/entries could not be included.',
  'export.noMedication': 'No medication groups stated.',
  'export.medicationGroups': 'Stated medication groups:',
  'export.medicationFindings':
    'Documented notes from the professional sources (verbatim quote, not an assessment of this case):',
  'export.labReference': 'Reference from the report: {min} to {max}',
  'export.labNote': 'Reference ranges come from the respective report, not from the app.',
  'export.trialRunning': 'running for {days} days',
  'export.trialConcluded.continue': 'finished, continued',
  'export.trialConcluded.stop': 'finished, stopped',
  'export.trialConcluded.unclear': 'finished, unclear',
  'export.trialChange':
    'Self-assessment: starting value {baseline}, most recently {current} (across {count} ratings, scale 1 to 5)',
  'export.trialLimitations':
    '{count} limitation(s) argue against attributing this to the intake.',
  'export.outcomesNote':
    'Outcome entries are self-assessments over time, not measurements of efficacy.',
  'export.adherenceSummary': 'Recorded intakes in the last 30 days: {count}',
  'export.footer': 'Created with {app}. All data lives only on the user\'s device; the app transmits nothing to servers. This report is documentation, not medical advice.',
};
