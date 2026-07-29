/**
 * i18n/en.js
 * ─────────────────────────────────────────────────────────────
 * Englische Oberflaechen-Texte. Fehlt ein Schluessel, zeigt die App den
 * deutschen Satz aus de.js — deshalb darf diese Datei hinterherhinken,
 * ohne dass etwas kaputtgeht.
 *
 * FORMULIERUNGSREGEL (gilt hier genauso wie auf Deutsch):
 * Beschreibend, nicht anweisend. "is used for", nicht "take this for".
 * Die App ordnet ein und dokumentiert — sie empfiehlt nichts. Auf
 * Englisch rutscht man schneller in eine Heilsaussage, deshalb hier
 * besonders auf neutrale Verben achten.
 */

export default {
  // Recurring
  'common.back': 'Back',
  'common.backToHome': 'Back to start',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.language': 'Language',

  // Language switch
  'language.title': 'Language',
  'language.hint':
    'The interface switches instantly. Substance database texts remain in German for now.',

  // Home
  'home.kicker': 'Supplement OS',
  'home.title': 'Scan. Verify. Turn into routine.',
  'home.subtitle':
    'Your structured workspace for supplement data, daily routine, history and scan quality.',

  'home.hero.label': 'Clinical workflow',
  'home.hero.title': 'Capture, validate, document.',
  'home.hero.text':
    'Supplement OS puts reliable entries first: clear product data, then routine logic, then real scanning intelligence.',
  'home.hero.scan': 'Scan a product',
  'home.hero.manual': 'Add manually',

  'home.trust.label': 'Product principles',
  'home.trust.quality.title': 'Data quality before automation',
  'home.trust.quality.text':
    'Scanned and manual entries stay traceable before they feed into routine logic.',
  'home.trust.archive.title': 'Archive instead of data loss',
  'home.trust.archive.text':
    'Removed supplements stay restorable, so history and context are preserved.',
  'home.trust.advice.title': 'General information',
  'home.trust.advice.text':
    'The app organises and documents. It does not replace medical advice.',

  'home.section.workflow': 'Workflow',
  'home.nav.today.title': 'Daily plan',
  'home.nav.today.subtitle':
    "Today's scheduled intakes, documented routines, open entries and organisational checks.",
  'home.nav.add.title': 'New supplement',
  'home.nav.add.subtitle':
    'Add a manual entry with dosage, timing and purpose to your active routine.',
  'home.nav.history.title': 'History',
  'home.nav.history.subtitle':
    'Review documented intakes, routine activity and earlier entries.',
  'home.nav.settings.title': 'Settings',
  'home.nav.settings.subtitle':
    'Manage the archive, local data, system status and future data sources.',

  // Stack analysis
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
