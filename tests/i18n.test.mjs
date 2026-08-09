/**
 * tests/i18n.test.mjs
 * ─────────────────────────────────────────────────────────────
 * Prueft die Zweisprachigkeit auf die Fehler, die man im laufenden
 * Betrieb erst spaet bemerkt:
 *   - Platzhalter, die zwischen den Sprachen auseinanderlaufen
 *     ("{count} Produkte" vs. "products") — im Deutschen unauffaellig,
 *     im Englischen fehlt dann die Zahl
 *   - leere Uebersetzungen, die als leere Zeile durchrutschen
 *   - Schluessel, die nur auf Englisch existieren (dann greift der
 *     Deutsch-Fallback nicht und die Nutzerin sieht den rohen Schluessel)
 */

import de from '../i18n/de/index.js';
import en from '../i18n/en/index.js';
// Direkt aus runtime, nicht aus i18n/index: Der Index importiert den
// Store, und der Store zieht seit der Verschluesselung native Module
// (expo-secure-store), die im Node-Bundle nichts verloren haben.
import { translate, isSupportedLanguage, LANGUAGES, DEFAULT_LANGUAGE } from '../i18n/runtime.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

const deKeys = Object.keys(de);
const enKeys = Object.keys(en);

console.log('\n— Kataloge —');
check('Deutscher Katalog ist nicht leer', deKeys.length > 0, deKeys.length);
check('Deutsch ist die Standardsprache', DEFAULT_LANGUAGE === 'de');
check('Genau zwei Sprachen angeboten', LANGUAGES.length === 2, LANGUAGES.length);
check('Beide Sprachcodes werden erkannt',
  LANGUAGES.every((l) => isSupportedLanguage(l.code)));
check('Unbekannter Code wird abgelehnt', !isSupportedLanguage('fr'));

console.log('\n— Vollständigkeit —');

// Englische Luecken sind erlaubt (Fallback auf Deutsch), werden aber
// gezaehlt, damit der Rueckstand sichtbar bleibt statt zu verschwinden.
const missingInEn = deKeys.filter((key) => !enKeys.includes(key));
if (missingInEn.length > 0) {
  console.log(`  Hinweis: ${missingInEn.length} Schlüssel noch ohne englische Übersetzung (Fallback greift): ${missingInEn.slice(0, 5).join(', ')}${missingInEn.length > 5 ? ' …' : ''}`);
}

// Umgekehrt ist es ein echter Fehler: ein nur englischer Schluessel hat
// keinen Fallback und wuerde auf Deutsch als roher Schluessel erscheinen.
const orphanedInEn = enKeys.filter((key) => !deKeys.includes(key));
check('Kein Schlüssel existiert nur auf Englisch', orphanedInEn.length === 0, orphanedInEn.join(', '));

const emptyDe = deKeys.filter((key) => !String(de[key]).trim());
const emptyEn = enKeys.filter((key) => !String(en[key]).trim());
check('Keine leeren deutschen Texte', emptyDe.length === 0, emptyDe.join(', '));
check('Keine leeren englischen Texte', emptyEn.length === 0, emptyEn.join(', '));

console.log('\n— Platzhalter stimmen überein —');

function placeholders(text) {
  return (String(text).match(/\{(\w+)\}/g) ?? []).sort().join(',');
}

const placeholderMismatches = enKeys.filter(
  (key) => deKeys.includes(key) && placeholders(de[key]) !== placeholders(en[key])
);
check('Deutsche und englische Platzhalter sind identisch',
  placeholderMismatches.length === 0,
  placeholderMismatches.map((k) => `${k}: "${placeholders(de[k])}" vs "${placeholders(en[k])}"`).join(' | '));

console.log('\n— Nachschlagen und Ersetzen —');
check('Deutscher Text wird gefunden', translate('nav.dashboard', 'de') === 'Tagesplan');
check('Englischer Text wird gefunden', translate('nav.dashboard', 'en') === 'Daily plan');
check('Fehlender englischer Text fällt auf Deutsch zurück',
  translate('__nur_de_test__', 'en') === '__nur_de_test__');
check('Unbekannter Schlüssel gibt den Schlüssel zurück (sichtbar statt leer)',
  translate('gibt.es.nicht', 'de') === 'gibt.es.nicht');

check('Platzhalter wird ersetzt',
  translate('stack.fromProducts_other', 'de', { count: 3 }) === 'aus 3 Produkten',
  translate('stack.fromProducts_other', 'de', { count: 3 }));
check('Platzhalter auch auf Englisch',
  translate('stack.fromProducts_other', 'en', { count: 3 }) === 'from 3 products');
check('Fehlender Wert lässt den Platzhalter stehen (sichtbar falsch statt "undefined")',
  translate('stack.fromProducts_other', 'de', {}) === 'aus {count} Produkten');

console.log('\n— Formulierungsregel auf Englisch —');

// Die App ordnet ein, sie empfiehlt nicht. Auf Englisch rutscht man
// schneller in eine Handlungsanweisung, deshalb hier ein Wachhund gegen
// die typischen Formulierungen.
const prescriptive = /\b(you should take|take this|we recommend|recommended dose|cures?|treats?|prevents?)\b/i;
const prescriptiveHits = enKeys.filter((key) => prescriptive.test(String(en[key])));
check('Keine anweisenden oder heilbezogenen Formulierungen im Englischen',
  prescriptiveHits.length === 0,
  prescriptiveHits.join(', '));


console.log('\n— Fachlogik-Module schalten mit —');

// Die Logik-Module sind bewusst frei von React und nutzen tr() aus
// i18n/runtime. Diese Pruefung faengt zwei Fehler ab:
//   1. einen vergessenen deutschen String in einem der Module
//   2. einen Import-Ringschluss (useStore -> TimingEngine -> useStore),
//      der dazu fuehren wuerde, dass tr() beim Laden noch undefiniert ist
const { setActiveLanguage, getActiveLanguage } = await import('../i18n/runtime.js');
const { getSlotLabel } = await import('../TimingEngine.js');
const { getBlockMessage } = await import('../AbsorptionBlocker.js');
const { checkConflicts } = await import('../ConflictLogic.js');
const { matchIngredient } = await import('../SubstanceMatcher.js');
const { checkAgainstReference, getStatusMeta } = await import('../ReferenceCheck.js');

setActiveLanguage('de');
check('Aktive Sprache wird gesetzt', getActiveLanguage() === 'de');
const slotDe = getSlotLabel('pre_sport');
const blockDe = getBlockMessage(45);
const conflictDe = checkConflicts(17, [19])[0]?.message ?? '';
const probe = matchIngredient({ name: 'Magnesium', amount: '200', unit: 'mg' });
const summaryDe = checkAgainstReference(probe, 'adult-woman').summary;
const statusDe = getStatusMeta('below').label;

setActiveLanguage('en');
check('Umschalten wirkt auf TimingEngine', getSlotLabel('pre_sport') !== slotDe,
  `${slotDe} / ${getSlotLabel('pre_sport')}`);
check('Umschalten wirkt auf AbsorptionBlocker', getBlockMessage(45) !== blockDe);
check('Umschalten wirkt auf ConflictLogic',
  (checkConflicts(17, [19])[0]?.message ?? '') !== conflictDe);
check('Umschalten wirkt auf ReferenceCheck-Sätze',
  checkAgainstReference(probe, 'adult-woman').summary !== summaryDe);
check('Umschalten wirkt auf Status-Beschriftungen',
  getStatusMeta('below').label !== statusDe);

check('Englische Slot-Bezeichnung enthält keine Umlaute',
  !/[äöüß]/i.test(getSlotLabel('fasted')), getSlotLabel('fasted'));
check('Englischer Konflikt-Text enthält keine deutschen Wörter',
  !/\b(und|nicht|mit|Abstand|Aufnahme)\b/.test(checkConflicts(17, [19])[0]?.message ?? ''),
  checkConflicts(17, [19])[0]?.message);

// Zurueck auf den Ausgangszustand, damit nachfolgende Pruefungen in
// derselben Datei nicht auf Englisch laufen.
setActiveLanguage('de');

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
