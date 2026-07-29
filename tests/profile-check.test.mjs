/**
 * tests/profile-check.test.mjs
 * ─────────────────────────────────────────────────────────────
 * Prueft die Verknuepfung von persoenlichem Profil und Bestand.
 *
 * Der wichtigste Test steht am Ende: Jedes Zitat in
 * data/medicationClasses.js muss woertlich im Quelltext von
 * data/substances.js bzw. data/lifeStageAdvisories.js stehen. Diese Datei
 * enthaelt bewusst KEINE eigenstaendigen Aussagen — sie verweist nur auf
 * bereits belegte. Driftet ein Zitat ab, weil jemand einen cautionNote
 * umformuliert, behauptet die App etwas, das so nicht mehr in der Quelle
 * steht. Genau das faengt der Test ab (und hat es bereits einmal getan:
 * "Antikoagulantien" statt "Antikoagulanzien").
 */

import {
  checkProfileAgainstStack,
  summarizeProfileFindings,
} from '../ProfileCheck.js';
import {
  MEDICATION_CLASSES,
  medicationInteractions,
  getInteractionsForClasses,
  getMedicationClass,
} from '../data/medicationClasses.js';
import { substanceById } from '../data/substances.js';
import { advisories } from '../data/lifeStageAdvisories.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

console.log('\n— Profil trifft auf Bestand —');

const stack = [
  { id: 'a', name: 'Vitamin K2', dosage: { amount: '100', unit: 'µg' } },
  { id: 'b', name: 'Magnesium', dosage: { amount: '300', unit: 'mg' } },
  { id: 'c', name: 'Johanniskraut', dosage: { amount: '600', unit: 'mg' } },
];

const withAnticoagulants = checkProfileAgainstStack(
  { medicationClasses: ['anticoagulants'] },
  stack
);

check('Gerinnungshemmer im Profil → Treffer im Bestand',
  withAnticoagulants.length > 0, withAnticoagulants.length);
check('Johanniskraut wird als Treffer erkannt',
  withAnticoagulants.some((f) => f.substanceId === 'st-johns-wort'));
check('Magnesium ohne belegten Bezug taucht nicht auf',
  !withAnticoagulants.some((f) => f.substanceId === 'magnesium'));
check('Jeder Treffer trägt den Originalsatz',
  withAnticoagulants.every((f) => typeof f.quote === 'string' && f.quote.length > 20));
check('Jeder Treffer nennt das Produkt aus dem Bestand',
  withAnticoagulants.every((f) => Array.isArray(f.productNames) && f.productNames.length > 0));
check('Schwerster Hinweis steht zuerst',
  withAnticoagulants[0].severity === 'contraindicated', withAnticoagulants[0].severity);

console.log('\n— Ohne Angaben keine Treffer —');
check('Leeres Profil → keine Treffer',
  checkProfileAgainstStack({}, stack).length === 0);
check('Profil ohne Medikamente → keine Treffer',
  checkProfileAgainstStack({ medicationClasses: [] }, stack).length === 0);
check('Leerer Bestand → keine Treffer',
  checkProfileAgainstStack({ medicationClasses: ['anticoagulants'] }, []).length === 0);
check('Medikamentengruppe ohne Bezug im Bestand → keine Treffer',
  checkProfileAgainstStack({ medicationClasses: ['antibiotics'] }, stack).length === 0);

console.log('\n— Mehrere Gruppen gleichzeitig —');
const multi = checkProfileAgainstStack(
  { medicationClasses: ['anticoagulants', 'contraceptives'] },
  stack
);
check('Beide Gruppen liefern Treffer',
  new Set(multi.map((f) => f.medicationClassId)).size === 2,
  [...new Set(multi.map((f) => f.medicationClassId))].join(','));

console.log('\n— Gescanntes Multivitamin —');
const scanned = checkProfileAgainstStack(
  { medicationClasses: ['anticoagulants'] },
  [{
    id: 'm', name: 'Multi-Komplex',
    ingredientDetails: [
      { name: 'Vitamin E', amount: '50', unit: 'mg' },
      { name: 'Vitamin C', amount: '200', unit: 'mg' },
    ],
  }]
);
check('Wirkstoff aus dem Multivitamin wird gefunden',
  scanned.some((f) => f.substanceId === 'vitamin-e'), scanned.map(f=>f.substanceId).join(','));
check('Der Produktname des Multivitamins wird genannt',
  scanned[0]?.productNames.includes('Multi-Komplex'));

console.log('\n— Zusammenfassung —');
const summary = summarizeProfileFindings(withAnticoagulants);
check('Zählt die Treffer', summary.total === withAnticoagulants.length);
check('Nennt den schwersten Grad', summary.strictest === 'contraindicated', summary.strictest);
check('Leere Liste → kein Schweregrad', summarizeProfileFindings([]).strictest === null);

console.log('\n— Datenintegrität: jedes Zitat steht in der Quelle —');

let missingQuote = 0;
let unknownSubstance = 0;
let unknownClass = 0;

for (const entry of medicationInteractions) {
  const substance = substanceById.get(entry.substanceId);
  if (!substance) {
    console.log(`  FAIL Bezug auf unbekannte Substanz: ${entry.substanceId}`);
    unknownSubstance++;
    continue;
  }

  if (!MEDICATION_CLASSES.some((c) => c.id === entry.medicationClassId)) {
    console.log(`  FAIL Unbekannte Medikamentengruppe: ${entry.medicationClassId}`);
    unknownClass++;
  }

  const haystack = [
    substance.cautionNote ?? '',
    ...(substance.useCases ?? []).map((u) => `${u.topic ?? ''} ${u.note ?? ''}`),
    ...(substance.forms ?? []).map((f) => `${f.note ?? ''} ${f.bioavailability ?? ''}`),
    ...(advisories[entry.substanceId] ?? []).map((a) => a.text),
  ].join(' ');

  if (!haystack.includes(entry.quote)) {
    console.log(`  FAIL Zitat nicht im Quelltext: ${entry.substanceId} / ${entry.medicationClassId}`);
    console.log(`       "${entry.quote.slice(0, 70)}…"`);
    missingQuote++;
  }
}

check('Alle Bezüge verweisen auf bekannte Substanzen', unknownSubstance === 0);
check('Alle Bezüge nutzen bekannte Medikamentengruppen', unknownClass === 0);
check('Alle Zitate stehen wörtlich in der Quelle', missingQuote === 0);

const validSeverities = ['contraindicated', 'medical', 'attention'];
check('Alle Schweregrade sind gültig',
  medicationInteractions.every((e) => validSeverities.includes(e.severity)));
check('Jede Medikamentengruppe hat ein Label und Beispiele',
  MEDICATION_CLASSES.every((c) => c.label && c.examples));
check('getMedicationClass findet eine bekannte Gruppe',
  getMedicationClass('anticoagulants')?.label.includes('Gerinnungshemmer'));
check('getMedicationClass gibt bei Unbekanntem null', getMedicationClass('gibtsnicht') === null);
check('getInteractionsForClasses filtert korrekt',
  getInteractionsForClasses(['contraceptives']).every((e) => e.medicationClassId === 'contraceptives'));

// Ein Bezug ohne Beleg waere genau das, was diese Datei vermeiden soll.
check('Kein Bezug ohne Zitat',
  medicationInteractions.every((e) => typeof e.quote === 'string' && e.quote.trim().length > 15));

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
