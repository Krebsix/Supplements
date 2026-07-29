/**
 * i18n/en/profile.js
 * Personal profile (app/profile.jsx).
 *
 * Wording rule, especially important here: a match means "there is a
 * documented note on this", never "this is dangerous for you". The app
 * knows neither the product, nor the dose, nor any diagnosis, so it must
 * not claim anything about the actual situation.
 */

export default {
  'profile.kicker': 'Personal profile',
  'profile.title': 'What additionally applies in your case',
  'profile.subtitle':
    'The app compares your products against the documented sources. It does not assess your situation, it shows where a source says something about a medication group.',

  'profile.privacy.title': 'Stays on your device',
  'profile.privacy.text':
    'These details are never uploaded and never shared. Like all other data in this app, they stay local.',

  'profile.medications.title': 'Medication',
  'profile.medications.hint':
    'Select the groups you take something from. Product names are not needed, since the documented notes refer to groups anyway.',
  'profile.medications.none': 'Not specified',

  'profile.findings.title': 'Notes from the sources',
  'profile.findings.empty':
    'For your current products, no note is on file for the selected medication groups.',
  'profile.findings.emptyNoSelection':
    'Once you select a medication group above, the notes on file will appear here.',
  'profile.findings.emptyNoStack':
    'Your list of products is still empty. Once you add some, the comparison will appear here.',
  'profile.findings.count_one': '{count} note found',
  'profile.findings.count_other': '{count} notes found',
  'profile.findings.inProducts': 'In your products: {products}',
  'profile.findings.quoteLabel': 'From the documented source:',
  'profile.findings.sources': 'Sources',

  'profile.findings.disclaimer':
    'These notes are quoted verbatim from the documented sources for each substance. Whether they apply in your case depends on the product, the dose and your medical situation. The app cannot judge that. Discuss open questions with a doctor or pharmacist.',

  'profile.severity.contraindicated': 'Source calls it contraindicated',
  'profile.severity.medical': 'Source points to medical consultation',
  'profile.severity.attention': 'Source describes a possible influence',

  'profile.reset': 'Reset entries',
  'profile.resetConfirm.title': 'Reset profile?',
  'profile.resetConfirm.message': 'All medication entries will be deleted.',
  'profile.resetConfirm.confirm': 'Reset',
};
