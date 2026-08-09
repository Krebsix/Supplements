/**
 * tests/medication-en.test.mjs
 * ─────────────────────────────────────────────────────────────
 * Tests fuer data/en/medicationClasses.js: das englische Overlay zu
 * data/medicationClasses.js.
 *
 * EN-Pendant zu tests/profile-check.test.mjs: dort wird geprueft, dass
 * jedes DEUTSCHE Zitat woertlich im deutschen Quelltext
 * (data/substances.js / data/lifeStageAdvisories.js) steht. Hier wird
 * dieselbe Kette fuer Englisch geprueft: jedes ENGLISCHE Zitat muss
 * woertlicher Teilstring des englischen Overlay-Texts
 * (data/en/substances.js / data/en/lifeStageAdvisories.js) sein, NICHT
 * nur eine freie Uebersetzung des deutschen Zitats. Driftet die
 * englische Substanz-Datenbank (z. B. weil ein cautionNote umformuliert
 * wird), faengt dieser Test das ab, genau wie der DE-Test das fuer
 * Deutsch tut.
 */

import { MEDICATION_CLASSES, medicationInteractions } from '../data/medicationClasses.js';
import { MEDICATION_CLASSES_EN, QUOTES_EN, getMedicationClassEN, getQuoteEN } from '../data/en/medicationClasses.js';

import { substanceById } from '../data/substances.js';
import overlayEN from '../data/en/substances.js';
import { advisories } from '../data/lifeStageAdvisories.js';
import { getAdvisoryTextEN } from '../data/en/lifeStageAdvisories.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

console.log('\n— medicationClasses EN: Vollstaendigkeit der Labels —');

for (const cls of MEDICATION_CLASSES) {
  const en = MEDICATION_CLASSES_EN[cls.id];
  check(`${cls.id}: EN-Eintrag vorhanden`, Boolean(en));
  if (!en) continue;
  check(`${cls.id}: EN-Label vorhanden`, typeof en.label === 'string' && en.label.trim().length > 0);
  check(`${cls.id}: EN-Examples vorhanden`, typeof en.examples === 'string' && en.examples.trim().length > 0);
}

check(
  'keine ueberzaehligen EN-Klassen ohne DE-Gegenstueck',
  Object.keys(MEDICATION_CLASSES_EN).every((id) => MEDICATION_CLASSES.some((c) => c.id === id))
);
check('getMedicationClassEN findet eine bekannte Gruppe',
  getMedicationClassEN('anticoagulants')?.label.includes('Anticoagulants'));
check('getMedicationClassEN gibt bei Unbekanntem null', getMedicationClassEN('gibtsnicht') === null);

console.log('\n— medicationClasses EN: jedes DE-Zitat hat ein EN-Zitat —');

// Schluessel: `${medicationClassId}::${substanceId}`, siehe Header von
// data/en/medicationClasses.js. Vorab pruefen, dass diese Kombination
// im DE-Datensatz tatsaechlich eindeutig ist -- sonst wuerde ein
// zweiter Eintrag den ersten in QUOTES_EN stillschweigend ueberschreiben.
const seenKeys = new Map();
let duplicateKeys = 0;
for (const entry of medicationInteractions) {
  const key = `${entry.medicationClassId}::${entry.substanceId}`;
  if (seenKeys.has(key)) {
    duplicateKeys++;
    console.log(`  FAIL doppelter Schluessel (medicationClassId::substanceId ohne severity reicht nicht mehr): ${key}`);
  }
  seenKeys.set(key, entry);
}
check('jede (medicationClassId, substanceId)-Kombination ist im DE-Datensatz eindeutig', duplicateKeys === 0);

let missingEnQuote = 0;
for (const entry of medicationInteractions) {
  const key = `${entry.medicationClassId}::${entry.substanceId}`;
  const enQuote = QUOTES_EN[key];
  if (typeof enQuote !== 'string' || enQuote.trim().length === 0) {
    console.log(`  FAIL kein EN-Zitat fuer ${key}`);
    missingEnQuote++;
  }
}
check('jeder DE-Eintrag mit quote hat ein EN-quote', missingEnQuote === 0);
check('getQuoteEN findet ein bekanntes Zitat',
  typeof getQuoteEN('anticoagulants', 'vitamin-k2') === 'string');
check('getQuoteEN gibt bei Unbekanntem null', getQuoteEN('gibtsnicht', 'gibtsnicht') === null);

console.log('\n— medicationClasses EN: Zitat-Integritaet (EN-Pendant zum DE-Test) —');

// Fuer jede Substanz mit mind. einem EN-Zitat: kompletten EN-Heuhaufen
// aus data/en/substances.js + data/en/lifeStageAdvisories.js aufbauen,
// analog zum DE-Heuhaufen in tests/profile-check.test.mjs.
function buildEnHaystack(substanceId) {
  const entry = overlayEN[substanceId];
  const advisoryTexts = (advisories[substanceId] ?? [])
    .map((a) => getAdvisoryTextEN(substanceId, a.lifeStages, a.severity))
    .filter((text) => typeof text === 'string');

  return [
    entry?.cautionNote ?? '',
    ...(entry?.useCases ?? []).map((u) => `${u.topic ?? ''} ${u.note ?? ''}`),
    ...Object.values(entry?.forms ?? {}),
    ...advisoryTexts,
  ].join(' ');
}

let enQuoteNotFound = 0;
let unknownEnSubstance = 0;

for (const entry of medicationInteractions) {
  const key = `${entry.medicationClassId}::${entry.substanceId}`;
  const enQuote = QUOTES_EN[key];
  if (typeof enQuote !== 'string') continue; // bereits oben als FAIL erfasst

  if (!substanceById.get(entry.substanceId) || !overlayEN[entry.substanceId]) {
    console.log(`  FAIL kein EN-Overlay fuer Substanz: ${entry.substanceId}`);
    unknownEnSubstance++;
    continue;
  }

  const haystack = buildEnHaystack(entry.substanceId);
  if (!haystack.includes(enQuote)) {
    console.log(`  FAIL EN-Zitat nicht im EN-Quelltext: ${entry.substanceId} / ${entry.medicationClassId}`);
    console.log(`       "${enQuote.slice(0, 70)}…"`);
    enQuoteNotFound++;
  }
}

check('jede zitierte Substanz hat ein EN-Overlay', unknownEnSubstance === 0);
check('alle EN-Zitate stehen woertlich im EN-Quelltext', enQuoteNotFound === 0);

console.log('\n— medicationClasses EN: Compliance-Scan —');

// Verbotswoerter nur in Labels/Examples: Zitate stammen woertlich aus
// data/en/substances.js bzw. data/en/lifeStageAdvisories.js, die bereits
// per tests/substances-en.test.mjs und tests/data-en.test.mjs auf
// Verbotswoerter und Gedankenstriche gescannt werden. Ein zweiter Scan
// hier wuerde nur denselben, bereits geprueften Text erneut pruefen.
const FORBIDDEN_PATTERN = /\b(cures?|cured|curing|heals?|healed|healing|treats?|treated|treating|boosts?|boosted|boosting|recommended|recommends?|recommending)\b|\byou should\b/i;

const labelExampleTexts = [];
for (const en of Object.values(MEDICATION_CLASSES_EN)) {
  labelExampleTexts.push(en.label, en.examples);
}

const forbiddenHits = labelExampleTexts.filter((text) => FORBIDDEN_PATTERN.test(text));
check('keine Verbotswoerter in EN-Labels/Examples (cure/heals/treats/boosts/recommended/"you should")', forbiddenHits.length === 0);
if (forbiddenHits.length > 0) {
  forbiddenHits.forEach((text) => console.log(`       Treffer: "${text}"`));
}

const emDashHits = labelExampleTexts.filter((text) => text.includes('—'));
check('kein Gedankenstrich ("—") in EN-Labels/Examples', emDashHits.length === 0);
if (emDashHits.length > 0) {
  emDashHits.forEach((text) => console.log(`       Treffer: "${text}"`));
}

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
