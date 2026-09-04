// Tests fuer OnboardingSteps.js: Schrittliste (immer genau zwei Schritte,
// start und routine) und "Weiter"-Freigabe je gebuendeltem Schritt.
// canAdvance('start', ...) fasst die frueheren Einzelchecks fuer
// Geschlecht, Geburtsjahr und Zusatzfrage zusammen; canAdvance('routine', ...)
// entspricht der frueheren ROUTINE_FIRST-Regel.
import { STEP_IDS, buildSteps, canAdvance } from '../OnboardingSteps';
import { resolveLifeStage } from '../LifeStageResolver';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}

const TODAY = new Date('2026-08-30T12:00:00Z');
const yearFor = (age) => 2026 - age;
const resolved = (person) => resolveLifeStage(person, TODAY);

const female30 = { gender: 'female', birthYear: yearFor(30) };
const resolvedFemale30 = resolved(female30);
const resolvedDiverse30 = resolved({ gender: 'diverse', birthYear: yearFor(30) });

console.log('— Schrittliste: immer genau zwei —');
check('zwei Schritte fuer Standardfall', buildSteps({ gender: 'male', birthYear: yearFor(30) }, TODAY).length === 2);
check('Reihenfolge start, routine', buildSteps({}, TODAY)[0] === STEP_IDS.START && buildSteps({}, TODAY)[1] === STEP_IDS.ROUTINE);
check('auch bei Zusatzfrage weiterhin zwei Schritte (Frau, 30)', buildSteps({ gender: 'female', birthYear: yearFor(30) }, TODAY).length === 2);

console.log('— canAdvance("start") buendelt Geschlecht+Geburtsjahr+Zusatzfrage —');
check(
  'kein Geschlecht: nicht weiter',
  canAdvance('start', { gender: null, birthYear: yearFor(30) }, resolvedFemale30) === false
);
check(
  'zu jung: nicht weiter',
  canAdvance('start', { gender: 'male', birthYear: yearFor(2) }, resolved({ gender: 'male', birthYear: yearFor(2) })) === false
);
check(
  'Zusatzfrage noetig aber unbeantwortet: nicht weiter',
  canAdvance('start', { gender: 'female', birthYear: yearFor(30), extra: null }, resolvedFemale30) === false
);
check(
  'Zusatzfrage beantwortet: weiter',
  canAdvance('start', { gender: 'female', birthYear: yearFor(30), extra: 'none' }, resolvedFemale30) === true
);
check(
  'Zusatzfrage tatsaechlich beantwortet, frisch aufgeloest: weiter ueber den Fallback',
  canAdvance('start', { ...female30, extra: 'none' }, resolved({ ...female30, extra: 'none' })) === true
);
check(
  'keine Zusatzfrage noetig (Mann): weiter ohne extra',
  canAdvance('start', { gender: 'male', birthYear: yearFor(30) }, resolved({ gender: 'male', birthYear: yearFor(30) })) === true
);
check(
  'Zusatzfrage per referenceOverride (Divers): weiter',
  canAdvance('start', { gender: 'diverse', birthYear: yearFor(30), referenceOverride: 'adult-man' }, resolvedDiverse30) === true
);

console.log('— canAdvance("routine") uebernimmt die alte ROUTINE_FIRST-Regel —');
check('kein firstAction: nicht weiter', canAdvance('routine', {}, {}) === false);
check('firstAction gesetzt: weiter', canAdvance('routine', { firstAction: 'later' }, {}) === true);

if (failures > 0) {
  console.error(`\n${failures} Test(s) fehlgeschlagen.`);
  process.exit(1);
}
console.log('\nAlle Tests bestanden.');
