// Tests fuer storeLogic.js: die reinen Store-Helfer (normalizeProfile,
// INITIAL_USER_STATE, applyOnboardingCompletion). useStore.js selbst kann
// wegen nativer Importe nicht in Node gebuendelt werden -- deshalb liegen
// diese Teile hier, rein und getestet.
import { applyOnboardingCompletion, INITIAL_USER_STATE, normalizeProfile } from '../storeLogic';

let failures = 0;

function check(name, condition) {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name}`);
  }
}

console.log('— normalizeProfile: neue Felder —');

const trimmed = normalizeProfile({ displayName: '  Nadine ', gender: 'female', birthYear: '1990' });
check('displayName getrimmt', trimmed.displayName === 'Nadine');
check('gender uebernommen', trimmed.gender === 'female');
check('birthYear als Zahl', trimmed.birthYear === 1990);

check('ungueltiges gender wird leer', normalizeProfile({ gender: 'alien' }).gender === '');
check('birthYear "abc" wird null', normalizeProfile({ birthYear: 'abc' }).birthYear === null);
check('birthYear ausserhalb des Bereichs wird null', normalizeProfile({ birthYear: 1899 }).birthYear === null && normalizeProfile({ birthYear: 2101 }).birthYear === null);
check('displayName ohne Angabe bleibt leer', normalizeProfile({}).displayName === '');
check('displayName wird auf 40 Zeichen gekappt', normalizeProfile({ displayName: 'x'.repeat(60) }).displayName.length === 40);

console.log('— applyOnboardingCompletion —');

const now = new Date('2026-08-30T00:00:00Z');
const completed = applyOnboardingCompletion(
  INITIAL_USER_STATE,
  {
    lifeStageId: 'adult-woman',
    privacyVersion: 'p',
    termsVersion: 't',
    profile: { displayName: 'N', gender: 'female', birthYear: 1990 },
    firstAction: 'scan',
    accountOffered: true,
  },
  now
);

check('activeLifeStageId uebernommen', completed.activeLifeStageId === 'adult-woman');
check('onboardingCompletedAt als ISO-Zeitstempel', completed.onboardingCompletedAt === now.toISOString());
check('consents.privacyVersion gesetzt', completed.consents.privacyVersion === 'p');
check('consents.termsVersion gesetzt', completed.consents.termsVersion === 't');
check('profile gemischt: neue Felder uebernommen', completed.profile.displayName === 'N' && completed.profile.gender === 'female' && completed.profile.birthYear === 1990);
check('profile gemischt: bestehende Listen bleiben leer', Array.isArray(completed.profile.medicationClasses) && completed.profile.medicationClasses.length === 0);
check('onboarding.firstAction uebernommen', completed.onboarding.firstAction === 'scan');
check('onboarding.accountOffered uebernommen', completed.onboarding.accountOffered === true);

const withoutProfile = applyOnboardingCompletion(
  INITIAL_USER_STATE,
  { lifeStageId: 'adult-man', privacyVersion: 'p', termsVersion: 't' },
  now
);
check('fehlendes profile: unveraendert', withoutProfile.profile === INITIAL_USER_STATE.profile);

const unknownFirstAction = applyOnboardingCompletion(
  INITIAL_USER_STATE,
  { lifeStageId: 'adult-man', firstAction: 'unbekannt' },
  now
);
check('unbekannte firstAction wird "later"', unknownFirstAction.onboarding.firstAction === 'later');

const noAccountOffered = applyOnboardingCompletion(INITIAL_USER_STATE, { lifeStageId: 'adult-man' }, now);
check('accountOffered ohne Angabe: false', noAccountOffered.onboarding.accountOffered === false);

if (failures > 0) {
  console.error(`\n${failures} TEST(S) FEHLGESCHLAGEN`);
  process.exit(1);
}
console.log('\nALLE TESTS BESTANDEN');
