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
import * as SecureStore from 'expo-secure-store';

import { createAccountStore } from './AccountStore';
import { ACCOUNT_DELETE_URL, SUPABASE_ANON_KEY } from './scanConfig';
import { supabase } from './supabaseClient';
import { usePurchaseStore } from './usePurchaseStore';

const randomBytes = async (length) => new Uint8Array(await Crypto.getRandomBytesAsync(length));

// Datenschluessel im iOS-Keychain / Android-Keystore, dieselbe Schutzklasse
// wie der Schluessel des lokalen Speichers (secureStorage.js).
const DATA_KEY_NAME = 'mysuplea-account-data-key-v1';
const SECURE_OPTIONS = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
const keyStore = {
  save: (hex) => SecureStore.setItemAsync(DATA_KEY_NAME, hex, SECURE_OPTIONS),
  load: () => SecureStore.getItemAsync(DATA_KEY_NAME, SECURE_OPTIONS),
  clear: () => SecureStore.deleteItemAsync(DATA_KEY_NAME, SECURE_OPTIONS),
};

export const useAccountStore = createAccountStore({
  client: supabase,
  randomBytes,
  redirectTo: Linking.createURL('auth/callback'),
  deleteUrl: ACCOUNT_DELETE_URL,
  anonKey: SUPABASE_ANON_KEY,
  keyStore,
  onSessionChange: (userId) =>
    usePurchaseStore
      .getState()
      .onSessionChange(userId)
      .catch((error) => console.error('[Account] Kauf-Verknuepfung fehlgeschlagen', error)),
});

export default useAccountStore;
