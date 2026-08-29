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
};

export function createAccountStore({ client, randomBytes, redirectTo, deleteUrl, anonKey, fetchImpl }) {
  return create((set, get) => {
    const withBusy = async (fn) => {
      set({ busy: true });
      try {
        return await fn();
      } finally {
        set({ busy: false });
      }
    };

    const applySession = (session) => {
      if (session?.user) {
        set({
          status: ACCOUNT_STATUS.SIGNED_IN,
          email: session.user.email ?? null,
          userId: session.user.id ?? null,
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
      // Zwischen Formular und Recovery-Screen: E-Mail, Passwort, Bundle.
      // Wird bei confirm/cancel sofort geleert.
      pendingSignUp: null,
      // Nach einem Reset ohne Recovery-Key: der neue Key, einmal anzeigen.
      pendingRecoveryKeyText: null,

      initialize: async () => {
        const session = await restoreSession(client).catch(() => null);
        applySession(session);
        // Token-Refresh gescheitert, Konto anderswo geloescht: Supabase
        // meldet SIGNED_OUT, der Store faellt still zurueck.
        // PASSWORD_RECOVERY kommt beim Code-Tausch eines Reset-Links
        // (PKCE liefert keinen type in der URL); handleAuthCallback liest
        // das Flag, account-reset.jsx raeumt es beim Abschluss weg.
        client.auth.onAuthStateChange((event, nextSession) => {
          if (event === 'PASSWORD_RECOVERY') {
            set({ recoveryPending: true });
            return;
          }
          if (nextSession?.user) {
            applySession(nextSession);
          } else {
            set({ ...ANONYMOUS_STATE });
          }
        });
      },

      prepareSignUp: (email, password) =>
        withBusy(async () => {
          const bundle = await createKeyBundle(password, randomBytes);
          set({ pendingSignUp: { email: email.trim(), password, bundle } });
          return bundle.recoveryKeyText;
        }),

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
    };
  });
}
