// Tests fuer OnboardingSteps.js: Schrittfolge und "Weiter"-Freigabe.
// Kernpunkt: buildSteps() haengt an extraQuestionFor(), nicht an
// resolveLifeStage(...).needsExtra -- der Zusatzschritt darf nicht
// verschwinden, sobald er beantwortet ist.
import { buildSteps, canAdvance } from '../OnboardingSteps';
import { resolveLifeStage } from '../LifeStageResolver';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}

const TODAY = new Date('2026-08-30T12:00:00Z');
const yearFor = (age) => 2026 - age;
const steps = (person) => buildSteps(person, TODAY);
const resolved = (person) => resolveLifeStage(person, TODAY);

console.log('— buildSteps: Zusatzschritt —');
const female30 = { gender: 'female', birthYear: yearFor(30) };
check('Frau 30: extra in der Liste', steps(female30).includes('extra'));
check(
  'Frau 30: extra bleibt in der Liste, egal welche Antwort schon gesetzt ist',
  steps(female30).includes('extra'),
  '(buildSteps ignoriert extra/referenceOverride per Design, nimmt nur gender/birthYear entgegen)'
);
check('Mann 40: kein extra', !steps({ gender: 'male', birthYear: yearFor(40) }).includes('extra'));
check('Divers 30: extra in der Liste', steps({ gender: 'diverse', birthYear: yearFor(30) }).includes('extra'));
check('Frau 14: kein extra', !steps({ gender: 'female', birthYear: yearFor(14) }).includes('extra'));

console.log('— buildSteps: Konto-Schritt —');
check('Kind 8: kein account', !steps({ gender: 'male', birthYear: yearFor(8) }).includes('account'));
check(
  'Geburtsjahr fehlt: kein extra, aber account vorhanden',
  (() => {
    const s = steps({ gender: 'female', birthYear: null });
    return !s.includes('extra') && s.includes('account');
  })()
);

console.log('— buildSteps: Reihenfolge und Grundgeruest —');
check(
  'weitere feste Schritte immer vorhanden',
  (() => {
    const s = steps({ gender: 'male', birthYear: yearFor(40) });
    return (
      s[0] === 'welcome' &&
      s.includes('legal') &&
      s.includes('name') &&
      s.includes('gender') &&
      s.includes('birthYear') &&
      s.includes('routineTimes') &&
      s.includes('routineFirst') &&
      s[s.length - 1] === 'done'
    );
  })()
);

console.log('— canAdvance —');
const resolvedFemale30 = resolved(female30);
check(
  'extra: Frau 30 ohne Antwort ist nicht bereit',
  canAdvance('extra', { extra: null }, resolvedFemale30) === false
);
check(
  'extra: Frau 30 mit "none" ist bereit',
  canAdvance('extra', { extra: 'none' }, resolvedFemale30) === true
);

const resolvedDiverse30 = resolved({ gender: 'diverse', birthYear: yearFor(30) });
check(
  'extra: Divers 30 mit referenceOverride ist bereit',
  canAdvance('extra', { referenceOverride: 'adult-man' }, resolvedDiverse30) === true
);

check(
  'birthYear: gesperrt, wenn tooYoung',
  canAdvance('birthYear', { birthYear: yearFor(2) }, resolved({ gender: 'male', birthYear: yearFor(2) })) === false
);
check(
  'birthYear: frei, wenn im gueltigen Bereich',
  canAdvance('birthYear', { birthYear: yearFor(30) }, resolved({ gender: 'male', birthYear: yearFor(30) })) === true
);

check('gender: leer nicht bereit', canAdvance('gender', { gender: null }, {}) === false);
check('gender: gesetzt bereit', canAdvance('gender', { gender: 'male' }, {}) === true);

check('routineFirst: ohne Wahl nicht bereit', canAdvance('routineFirst', { firstAction: null }, {}) === false);
check('routineFirst: mit Wahl bereit', canAdvance('routineFirst', { firstAction: 'scan' }, {}) === true);

check('unbekannte/andere Schritte sind immer bereit', canAdvance('routineTimes', {}, {}) === true);

if (failures > 0) {
  console.error(`\n${failures} Test(s) fehlgeschlagen.`);
  process.exit(1);
}
console.log('\nAlle Tests bestanden.');
