/**
 * useAccountStore.js
 * Bindet AccountStore.js an die echten Abhaengigkeiten der App.
 *
 * redirectTo ueber expo-linking: in Expo Go exp://<host>/--/auth/callback,
 * im Store-Build mysuplea://auth/callback (scheme aus app.json). Beide
 * muessen in Supabase unter Auth > URL Configuration > Redirect URLs
 * stehen (siehe Task 5).
 */

import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';

import { createAccountStore } from './AccountStore';
import { ACCOUNT_DELETE_URL, SUPABASE_ANON_KEY } from './scanConfig';
import { supabase } from './supabaseClient';

const randomBytes = async (length) => new Uint8Array(await Crypto.getRandomBytesAsync(length));

export const useAccountStore = createAccountStore({
  client: supabase,
  randomBytes,
  redirectTo: Linking.createURL('auth/callback'),
  deleteUrl: ACCOUNT_DELETE_URL,
  anonKey: SUPABASE_ANON_KEY,
});

export default useAccountStore;
