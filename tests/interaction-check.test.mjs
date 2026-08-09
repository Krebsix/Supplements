// Tests fuer InteractionCheck.js und data/interactions.js:
// Struktur-Invarianten (jede Regel referenziert echte Substanzen, traegt
// Text und Quelle) und das Verhalten der Abfragefunktionen.

import {
  findPairInteractions,
  getIntakeGuidance,
  validateInteractionData,
} from '../InteractionCheck';
import { PAIR_RULES } from '../data/interactions';

let failures = 0;

function check(name, condition, extra = '') {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name} ${extra}`);
  }
}

console.log('— Datenintegritaet —');
const problems = validateInteractionData();
check('Alle Regeln referenzieren echte Substanzen mit Text und Quelle', problems.length === 0, problems.join('; '));
check('Es gibt Regeln', PAIR_RULES.length >= 5);
check('Keine Gedankenstriche in Regeltexten', PAIR_RULES.every((rule) => !rule.note.includes('—')));
check(
  'Keine praeskriptiven Formulierungen ("nimm", "sollten Sie")',
  PAIR_RULES.every((rule) => !/\bnimm\b|sollten sie/i.test(rule.note))
);

console.log('— findPairInteractions —');
const hit = findPairInteractions(['iron', 'calcium', 'vitamin-d3']);
check('Eisen+Calcium wird gefunden', hit.some((rule) => (rule.a === 'iron' && rule.b === 'calcium') || (rule.a === 'calcium' && rule.b === 'iron')));
check('Klarnamen sind angereichert', hit.every((rule) => rule.aName && rule.bName));
check('Nur ein Partner vorhanden → kein Treffer', findPairInteractions(['iron']).length === 0);
check('Unbekannte IDs werden ignoriert', findPairInteractions(['iron', 'unbekannt', 'calcium']).length >= 1);
check('Leere Liste → leeres Ergebnis', findPairInteractions([]).length === 0);

const synergies = findPairInteractions(['iron', 'vitamin-c']);
check('Eisen+Vitamin C ist als Synergie markiert', synergies.some((rule) => rule.severity === 'synergy'));

console.log('— getIntakeGuidance —');
check('Eisen hat einen Einnahme-Hinweis mit Quelle', Boolean(getIntakeGuidance('iron')?.sources?.length));
check('Unbekannte ID → null', getIntakeGuidance('gibts-nicht') === null);

if (failures > 0) {
  console.error(`\n${failures} Fehlschlaege`);
  process.exit(1);
}
console.log('\nALLE TESTS BESTANDEN');
