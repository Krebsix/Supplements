/**
 * useAccountStore.js
 * Bindet AccountStore.js an die echten Abhaengigkeiten der App.
 *
 * redirectTo ueber expo-linking: in Expo Go exp://<host>/--/auth/callback,
 * im Store-Build mysuplea://auth/callback (scheme aus app.json). Beide
 * muessen in Supabase unter Auth > URL Configuration > Redirect URLs
 * stehen (siehe Task 5).
 *
 * onSessionChange verknuepft die Kaufschicht mit dem Konto (Task 4):
 * usePurchaseStore importiert nur useStore, nicht useAccountStore, daher
 * kein Ringschluss. Ein Fehler beim Verknuepfen/Trennen blockiert nie die
 * Konto-Aktion (kein throw), wird aber geloggt statt verschluckt.
 */

import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';

import { createAccountStore } from './AccountStore';
import { ACCOUNT_DELETE_URL, SUPABASE_ANON_KEY } from './scanConfig';
import { supabase } from './supabaseClient';
import { usePurchaseStore } from './usePurchaseStore';

const randomBytes = async (length) => new Uint8Array(await Crypto.getRandomBytesAsync(length));

export const useAccountStore = createAccountStore({
  client: supabase,
  randomBytes,
  redirectTo: Linking.createURL('auth/callback'),
  deleteUrl: ACCOUNT_DELETE_URL,
  anonKey: SUPABASE_ANON_KEY,
  onSessionChange: (userId) =>
    usePurchaseStore
      .getState()
      .onSessionChange(userId)
      .catch((error) => console.error('[Account] Kauf-Verknuepfung fehlgeschlagen', error)),
});

export default useAccountStore;
