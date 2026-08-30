/**
 * FirstSteps.js
 * Ersteinrichtung nach dem Onboarding: welche Schritte sind erledigt,
 * welcher ist dran, wohin geht es nach dem Konto weiter.
 *
 * Reine Logik ohne Store und ohne UI, in Node testbar. Die Karte
 * (components/FirstStepsCard.jsx) zeigt nur, was hier berechnet wird.
 *
 * Vier Schritte in fester Reihenfolge:
 *   1. Profil        aus dem Onboarding, dort immer erledigt
 *   2. Konto         optional; angemeldet, Bestaetigung ausstehend
 *                    oder uebersprungen. Blockiert nie den naechsten Schritt.
 *   3. Praeparat     das erste Praeparat im Bestand
 *   4. Erinnerungen  Push-Erinnerungen eingeschaltet
 *
 * Die Ersteinrichtung gilt als offen, solange kein Praeparat im Bestand
 * liegt. Danach uebernimmt der normale Tagesplan.
 */

export const FIRST_STEP_IDS = {
  PROFILE: 'profile',
  ACCOUNT: 'account',
  SUPPLEMENT: 'supplement',
  REMINDERS: 'reminders',
};

export const STEP_STATE = {
  DONE: 'done',
  CURRENT: 'current',
  OPEN: 'open',
  SKIPPED: 'skipped',
  PENDING: 'pending',
};

/** Offen, solange kein Praeparat im Bestand liegt. */
export function isFirstSetupPending({ supplementCount = 0 } = {}) {
  return Number(supplementCount) === 0;
}

/**
 * buildFirstSteps(input) => [{ id, state, email? }]
 *
 * input:
 *   profileComplete      Onboarding abgeschlossen
 *   accountOffered       Konto-Schritt wurde im Onboarding gezeigt (ab 16)
 *   accountSignedIn      Konto aktiv
 *   accountEmailPending  E-Mail, deren Bestaetigungslink noch aussteht
 *   supplementCount      aktive Praeparate im Bestand
 *   notificationsEnabled Push-Erinnerungen eingeschaltet
 *
 * Genau ein Schritt ist CURRENT: der erste nicht erledigte unter
 * Profil, Praeparat, Erinnerungen. Das Konto ist nie CURRENT, es ist
 * freiwillig und haelt niemanden auf.
 */
export function buildFirstSteps({
  profileComplete = false,
  accountOffered = false,
  accountSignedIn = false,
  accountEmailPending = null,
  supplementCount = 0,
  notificationsEnabled = false,
} = {}) {
  const steps = [];
  let currentAssigned = false;

  const required = (id, done) => {
    if (done) return { id, state: STEP_STATE.DONE };
    if (!currentAssigned) {
      currentAssigned = true;
      return { id, state: STEP_STATE.CURRENT };
    }
    return { id, state: STEP_STATE.OPEN };
  };

  steps.push(required(FIRST_STEP_IDS.PROFILE, Boolean(profileComplete)));

  if (accountOffered) {
    if (accountSignedIn) {
      steps.push({ id: FIRST_STEP_IDS.ACCOUNT, state: STEP_STATE.DONE });
    } else if (accountEmailPending) {
      steps.push({ id: FIRST_STEP_IDS.ACCOUNT, state: STEP_STATE.PENDING, email: accountEmailPending });
    } else {
      steps.push({ id: FIRST_STEP_IDS.ACCOUNT, state: STEP_STATE.SKIPPED });
    }
  }

  steps.push(required(FIRST_STEP_IDS.SUPPLEMENT, Number(supplementCount) > 0));
  steps.push(required(FIRST_STEP_IDS.REMINDERS, Boolean(notificationsEnabled)));

  return steps;
}

/**
 * Wohin nach Login, Registrierung oder Bestaetigungslink?
 * Ohne Praeparat in die Ersteinrichtung (Tagesplan), sonst bleibt die
 * Nutzerin auf dem Konto-Screen, sie kam dann aus "Mehr".
 */
export function routeAfterAccount({ supplementCount = 0 } = {}) {
  return isFirstSetupPending({ supplementCount }) ? '/Dashboard' : '/account';
}
