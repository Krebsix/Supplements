/**
 * supabaseClient.js
 * Einziger Supabase-Client der App (Auth und spaeter Sync).
 *
 * Die Session (Access- und Refresh-Token) liegt ueber denselben
 * verschluesselten Adapter wie der Haupt-Store (secureStorage.js):
 * Tokens sind keine Gesundheitsdaten, aber wer sie hat, ist die Nutzerin.
 *
 * flowType 'pkce': Die Bestaetigungs- und Reset-Links liefern nur einen
 * Einmal-Code (?code=...), der ohne den auf DIESEM Geraet gespeicherten
 * Verifier wertlos ist. Der Implicit-Flow wuerde Access- und Refresh-Token
 * in ein URL-Fragment legen; ein Custom-Scheme-Link kann auf Android von
 * einer fremden App abgefangen werden, dann waeren die Tokens weg.
 * Den Reset-Fall erkennt der Store am Ereignis PASSWORD_RECOVERY, das
 * supabase-js beim Code-Tausch feuert (AccountStore.js).
 *
 * detectSessionInUrl false: Das ist ein Browser-Mechanismus; Deep Links
 * werden in app/auth/callback.jsx ausdruecklich verarbeitet.
 */

import { createClient } from '@supabase/supabase-js';

import { secureStorage } from './secureStorage';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './scanConfig';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: secureStorage,
    storageKey: 'mysuplea-auth-v1',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

export default supabase;
