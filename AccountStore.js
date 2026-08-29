/**
 * AccountStore.js
 * ─────────────────────────────────────────────────────────────
 * Factory fuer den Konto-Store. Getrennt vom Haupt-Store (useStore.js):
 * Der Kontostand ist kein Gesundheitsdatum und gehoert weder in
 * INITIAL_USER_STATE noch ins JSON-Backup. Wer ein Backup auf ein
 * anderes Geraet spielt, bekommt keinen fremden Login mit.
 *
 * KEIN persist: Die Session persistiert supabase-js selbst (ueber
 * secureStorage, siehe supabaseClient.js). Der Datenschluessel liegt NUR
 * im Arbeitsspeicher und ist nach einem Neustart weg; ob er in der
 * Keychain zwischengespeichert wird, entscheidet Teilprojekt 2.
 *
 * Factory statt Modul-Singleton, damit Tests einen Fake-Client
 * uebergeben. Die App bindet in useAccountStore.js.
 */

import { create } from 'zustand';

import { createKeyBundle } from './AccountCrypto';
import {
  applyAuthCallback,
  changeEmail,
  changePassword,
  completePasswordReset,
  deleteAccount,
  parseAuthCallback,
  requestPasswordReset,
  restoreSession,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from './AccountLogic';

export const ACCOUNT_STATUS = {
  UNKNOWN: 'unknown',
  ANONYMOUS: 'anonymous',
  SIGNED_IN: 'signedIn',
};

const ANONYMOUS_STATE = {
  status: ACCOUNT_STATUS.ANONYMOUS,
  email: null,
  userId: null,
  dataKey: null,
  recoveryPending: false,
  pendingEmail: null,
};

export function createAccountStore({ client, randomBytes, redirectTo, deleteUrl, anonKey, fetchImpl }) {
  return create((set, get) => {
    // Zaehlt laufende Aktionen: zwei ueberlappende Aufrufe (z. B. ein
    // Doppelklick, der prepareSignUp zweimal ausloest) duerfen busy nicht
    // vorzeitig auf false setzen, nur weil der schnellere zuerst fertig ist.
    let busyDepth = 0;
    const withBusy = async (fn) => {
      busyDepth += 1;
      set({ busy: true });
      try {
        return await fn();
      } finally {
        busyDepth -= 1;
        set({ busy: busyDepth > 0 });
      }
    };

    // Fast Refresh im Dev-Build ruft initialize() mehrfach auf; ohne diese
    // Sperre wuerde jeder Aufruf einen weiteren onAuthStateChange-Listener
    // registrieren, der dieselben Ereignisse mehrfach verarbeitet.
    let listening = false;

    // Registriert den Auth-Listener genau einmal. Ausgelagert, weil
    // initialize() ihn erst NACH restoreSession() registriert hatte: bei
    // einem Kaltstart ueber einen Recovery-Deep-Link (Linking oeffnet die
    // App direkt auf auth/callback) gab es keine Garantie, dass der
    // Listener schon steht, wenn exchangeCodeForSession() das
    // PASSWORD_RECOVERY-Ereignis feuert, das recoveryPending setzt.
    // handleAuthCallback ruft ensureListening() deshalb selbst zuerst auf,
    // synchron und BEVOR applyAuthCallback den Code eintauscht.
    const ensureListening = () => {
      if (listening) return;
      listening = true;
      // Token-Refresh gescheitert, Konto anderswo geloescht: Supabase
      // meldet SIGNED_OUT, der Store faellt still zurueck.
      // PASSWORD_RECOVERY kommt beim Code-Tausch eines Reset-Links
      // (PKCE liefert keinen type in der URL) und traegt bereits die
      // neue Session; der Store wendet sie direkt an, statt sich auf
      // den spaeteren applySession-Aufruf in handleAuthCallback zu
      // verlassen. handleAuthCallback liest nur noch das recoveryPending-
      // Flag, account-reset.jsx raeumt es beim Abschluss weg.
      // USER_UPDATED (z. B. nach changeEmail) traegt ebenfalls eine
      // Session mit user; braucht keinen eigenen Zweig, faellt in den
      // bestehenden nextSession?.user-Fall darunter.
      client.auth.onAuthStateChange((event, nextSession) => {
        if (event === 'PASSWORD_RECOVERY') {
          applySession(nextSession);
          set({ recoveryPending: true });
          return;
        }
        if (nextSession?.user) {
          applySession(nextSession);
        } else {
          set({ ...ANONYMOUS_STATE });
        }
      });
    };

    const applySession = (session) => {
      if (session?.user) {
        set({
          status: ACCOUNT_STATUS.SIGNED_IN,
          email: session.user.email ?? null,
          userId: session.user.id ?? null,
          pendingEmail: session.user.new_email ?? null,
        });
      } else {
        set({ ...ANONYMOUS_STATE });
      }
    };

    return {
      status: ACCOUNT_STATUS.UNKNOWN,
      email: null,
      userId: null,
      dataKey: null,
      busy: false,
      // Reset-Link wurde eingeloest, neues Passwort steht noch aus.
      recoveryPending: false,
      // Secure email change: neue Adresse wartet auf Bestaetigung beider Links.
      pendingEmail: null,
      // Zwischen Formular und Recovery-Screen: E-Mail, Passwort, Bundle.
      // Wird bei confirm/cancel sofort geleert.
      pendingSignUp: null,
      // Nach einem Reset ohne Recovery-Key: der neue Key, einmal anzeigen.
      pendingRecoveryKeyText: null,

      initialize: async () => {
        const session = await restoreSession(client).catch(() => null);
        applySession(session);
        ensureListening();
      },

      prepareSignUp: (email, password) =>
        withBusy(async () => {
          const bundle = await createKeyBundle(password, randomBytes);
          set({ pendingSignUp: { email: email.trim(), password, bundle } });
          return bundle.recoveryKeyText;
        }),

      // Scheitert signUpWithEmail (z. B. Netzwerkfehler), bleibt
      // pendingSignUp bewusst erhalten statt zu leeren: Der Recovery-Key
      // wurde bereits angezeigt und von der Nutzerin gesichert, ein
      // erneutes prepareSignUp wuerde ein NEUES Bundle mit einem ANDEREN
      // Recovery-Key erzeugen. Ein Retry von confirmSignUp sendet daher
      // absichtlich dasselbe Bundle. Der einzige Weg, pendingSignUp zu
      // verwerfen, ist bewusst cancelSignUp.
      confirmSignUp: () =>
        withBusy(async () => {
          const pending = get().pendingSignUp;
          if (!pending) throw new Error('Kein Signup vorbereitet');
          const result = await signUpWithEmail(
            client,
            { email: pending.email, password: pending.password, record: pending.bundle.record },
            redirectTo
          );
          set({ pendingSignUp: null });
          // Nur wenn Supabase sofort eine Session liefert (Bestaetigung
          // aus), ist der Schluessel jetzt schon nutzbar.
          if (!result.needsConfirmation) set({ dataKey: pending.bundle.dataKey });
          return result;
        }),

      cancelSignUp: () => set({ pendingSignUp: null }),

      signIn: (email, password) =>
        withBusy(async () => {
          const result = await signInWithEmail(client, { email: email.trim(), password });
          applySession(result.session);
          set({ dataKey: result.dataKey });
        }),

      signOut: () =>
        withBusy(async () => {
          await signOut(client);
          set({ ...ANONYMOUS_STATE });
        }),

      requestPasswordReset: (email) =>
        withBusy(() => requestPasswordReset(client, email.trim(), redirectTo)),

      completePasswordReset: (newPassword, recoveryKeyText) =>
        withBusy(async () => {
          const result = await completePasswordReset(client, {
            userId: get().userId,
            newPassword,
            recoveryKeyText,
            randomBytes,
          });
          set({
            dataKey: result.dataKey,
            pendingRecoveryKeyText: result.recoveryKeyText,
            recoveryPending: false,
          });
          return result;
        }),

      clearPendingRecoveryKey: () => set({ pendingRecoveryKeyText: null }),

      handleAuthCallback: (url) =>
        withBusy(async () => {
          // Muss VOR dem Code-Tausch stehen: Kaltstart per Recovery-Link
          // darf initialize() nicht abwarten, sonst kann das
          // PASSWORD_RECOVERY-Ereignis verpasst werden (siehe ensureListening).
          ensureListening();
          const result = await applyAuthCallback(client, parseAuthCallback(url));
          applySession(result.session);
          // Bei PKCE steht der Typ nicht in der URL; das Ereignis
          // PASSWORD_RECOVERY hat waehrend des Code-Tauschs das Flag gesetzt.
          return result.type ?? (get().recoveryPending ? 'recovery' : null);
        }),

      deleteAccount: () =>
        withBusy(async () => {
          await deleteAccount(client, deleteUrl, anonKey, fetchImpl);
          set({ ...ANONYMOUS_STATE });
        }),

      changePassword: (currentPassword, newPassword) =>
        withBusy(async () => {
          const result = await changePassword(client, { userId: get().userId, currentPassword, newPassword, randomBytes });
          set({ dataKey: result.dataKey });
        }),

      changeEmail: (newEmail) =>
        withBusy(async () => {
          const result = await changeEmail(client, newEmail);
          // Secure email change AUS: Supabase liefert kein new_email, die
          // Aenderung gilt sofort, result.email traegt die neue Adresse.
          // Secure email change AN: pendingEmail gesetzt, die aktuelle
          // E-Mail bleibt bis zur Bestaetigung unveraendert.
          set({
            pendingEmail: result.pendingEmail,
            email: result.pendingEmail ? get().email : (result.email ?? get().email),
          });
        }),
    };
  });
}
