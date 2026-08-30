// Tests fuer FirstSteps.js: Ersteinrichtung nach dem Onboarding.
import {
  buildFirstSteps,
  FIRST_STEP_IDS,
  isFirstSetupPending,
  routeAfterAccount,
  STEP_STATE,
} from '../FirstSteps';

let failures = 0;

function check(name, condition) {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name}`);
  }
}

const byId = (steps, id) => steps.find((step) => step.id === id);
const currentIds = (steps) => steps.filter((step) => step.state === STEP_STATE.CURRENT).map((step) => step.id);

console.log('— isFirstSetupPending —');
check('ohne Praeparat offen', isFirstSetupPending({ supplementCount: 0 }) === true);
check('mit Praeparat erledigt', isFirstSetupPending({ supplementCount: 1 }) === false);
check('ohne Angabe offen', isFirstSetupPending() === true);

console.log('— buildFirstSteps: nach Onboarding, Konto spaeter —');
const later = buildFirstSteps({ profileComplete: true, accountOffered: true });
check('vier Schritte', later.length === 4);
check('Profil erledigt', byId(later, FIRST_STEP_IDS.PROFILE).state === STEP_STATE.DONE);
check('Konto uebersprungen', byId(later, FIRST_STEP_IDS.ACCOUNT).state === STEP_STATE.SKIPPED);
check('Praeparat ist dran', byId(later, FIRST_STEP_IDS.SUPPLEMENT).state === STEP_STATE.CURRENT);
check('Erinnerungen offen', byId(later, FIRST_STEP_IDS.REMINDERS).state === STEP_STATE.OPEN);
check('genau ein Schritt CURRENT', currentIds(later).length === 1);

console.log('— buildFirstSteps: Bestaetigungsmail ausstehend —');
const pending = buildFirstSteps({
  profileComplete: true,
  accountOffered: true,
  accountEmailPending: 'n@example.com',
});
check('Konto PENDING mit E-Mail', byId(pending, FIRST_STEP_IDS.ACCOUNT).state === STEP_STATE.PENDING && byId(pending, FIRST_STEP_IDS.ACCOUNT).email === 'n@example.com');
check('Praeparat trotzdem dran (Konto blockiert nicht)', currentIds(pending)[0] === FIRST_STEP_IDS.SUPPLEMENT);

console.log('— buildFirstSteps: angemeldet —');
const signedIn = buildFirstSteps({
  profileComplete: true,
  accountOffered: true,
  accountSignedIn: true,
  accountEmailPending: 'n@example.com',
});
check('angemeldet schlaegt ausstehende Mail', byId(signedIn, FIRST_STEP_IDS.ACCOUNT).state === STEP_STATE.DONE);
check('Praeparat ist dran', currentIds(signedIn)[0] === FIRST_STEP_IDS.SUPPLEMENT);

console.log('— buildFirstSteps: unter 16, kein Konto-Schritt —');
const underage = buildFirstSteps({ profileComplete: true, accountOffered: false });
check('drei Schritte', underage.length === 3);
check('kein Konto-Schritt', byId(underage, FIRST_STEP_IDS.ACCOUNT) === undefined);

console.log('— buildFirstSteps: Praeparat da, Erinnerungen aus —');
const withSupplement = buildFirstSteps({ profileComplete: true, accountOffered: true, supplementCount: 2 });
check('Praeparat erledigt', byId(withSupplement, FIRST_STEP_IDS.SUPPLEMENT).state === STEP_STATE.DONE);
check('Erinnerungen jetzt dran', byId(withSupplement, FIRST_STEP_IDS.REMINDERS).state === STEP_STATE.CURRENT);

console.log('— buildFirstSteps: alles erledigt —');
const allDone = buildFirstSteps({
  profileComplete: true,
  accountOffered: true,
  accountSignedIn: true,
  supplementCount: 1,
  notificationsEnabled: true,
});
check('kein Schritt CURRENT', currentIds(allDone).length === 0);
check('alle DONE', allDone.every((step) => step.state === STEP_STATE.DONE));

console.log('— buildFirstSteps: Profil offen (Bestandsdaten ohne Onboarding) —');
const noProfile = buildFirstSteps({ profileComplete: false, accountOffered: true });
check('Profil ist dran', currentIds(noProfile)[0] === FIRST_STEP_IDS.PROFILE);
check('Praeparat nur offen', byId(noProfile, FIRST_STEP_IDS.SUPPLEMENT).state === STEP_STATE.OPEN);

console.log('— routeAfterAccount —');
check('ohne Praeparat in die Ersteinrichtung', routeAfterAccount({ supplementCount: 0 }) === '/Dashboard');
check('mit Praeparat zurueck aufs Konto', routeAfterAccount({ supplementCount: 3 }) === '/account');

if (failures > 0) {
  console.error(`\n${failures} Test(s) fehlgeschlagen`);
  process.exit(1);
}
console.log('\nFirstSteps: alle Tests bestanden');
