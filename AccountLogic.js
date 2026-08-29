/**
 * AccountLogic.js
 * ─────────────────────────────────────────────────────────────
 * Ablaeufe rund um das Konto: Signup, Login, Session, Passwort-Reset,
 * Loeschung. Kein UI, kein Store. Der Supabase-Client wird uebergeben,
 * damit Tests einen Fake einsetzen koennen und dieses Modul in Node
 * laeuft (der echte Client zieht expo-secure-store).
 *
 * GRUNDSATZ: Passwort, abgeleiteter Schluessel, Datenschluessel und
 * Recovery-Key verlassen dieses Modul nur Richtung AccountCrypto und
 * Store, nie Richtung Netzwerk. Zum Server gehen ausschliesslich
 * E-Mail, Passwort (an Supabase Auth, das ist dessen Aufgabe) und die
 * vier Umschlagfelder aus AccountCrypto.createKeyBundle().
 *
 * ANMELDE-METHODEN: PROVIDERS ist die Liste, die spaeter Sign in with
 * Apple aufnimmt (braucht Apple Developer Account). Der Screen rendert
 * nur, was available ist.
 */

import {
  createKeyBundle,
  rewrapWithPassword,
  unlockWithPassword,
  unlockWithRecoveryKey,
} from './AccountCrypto';

export const PROVIDERS = [
  { id: 'email', available: true },
  // Nachtrag, sobald der Apple Developer Account steht (Spec, Entscheidung 4).
  { id: 'apple', available: false },
];

const KEY_RECORD_COLUMNS = 'kdf, kdf_salt, wrapped_key_pw, wrapped_key_recovery';

export function isNetworkError(error) {
  if (!error) return false;
  const message = String(error.message ?? '');
  return error instanceof TypeError || /network request failed|failed to fetch/i.test(message);
}

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(client, { email, password, record }, redirectTo) {
  const data = unwrap(
    await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        // Der Trigger handle_new_user_keys kopiert das nach public.user_keys
        // (Migration 20260829090000_user_keys.sql).
        data: { key_record: record },
      },
    })
  );
  return { userId: data.user?.id ?? null, needsConfirmation: !data.session };
}

export async function fetchKeyRecord(client) {
  const data = unwrap(await client.from('user_keys').select(KEY_RECORD_COLUMNS).maybeSingle());
  return data ?? null;
}

export async function saveKeyRecord(client, userId, record) {
  unwrap(
    await client.from('user_keys').upsert({
      user_id: userId,
      kdf: record.kdf,
      kdf_salt: record.kdf_salt,
      wrapped_key_pw: record.wrapped_key_pw,
      wrapped_key_recovery: record.wrapped_key_recovery,
      updated_at: new Date().toISOString(),
    })
  );
}

export async function signInWithEmail(client, { email, password }) {
  const data = unwrap(await client.auth.signInWithPassword({ email, password }));
  const record = await fetchKeyRecord(client);
  // Kein Record (Konto aus einer Zeit vor dem Trigger, oder Trigger-
  // Fehler): Login klappt, Datenschluessel bleibt null. Teilprojekt 2
  // muss damit umgehen, hier ist es kein Fehler.
  const dataKey = record ? await unlockWithPassword(record, password) : null;
  return { session: data.session, user: data.user, dataKey };
}

export async function signOut(client) {
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function restoreSession(client) {
  const { data } = await client.auth.getSession();
  return data?.session ?? null;
}

export async function requestPasswordReset(client, email, redirectTo) {
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

/**
 * Nach dem Reset-Link: neues Passwort setzen und den Datenschluessel
 * neu wickeln. Mit Recovery-Key bleibt der Datenschluessel erhalten;
 * ohne wird ein neuer erzeugt (bisherige Sync-Daten sind dann nicht mehr
 * lesbar, dataLost sagt das dem Screen).
 *
 * Reihenfolge: Erst Passwort bei Auth, dann Record. Scheitert der zweite
 * Schritt, bleibt der Recovery-Key gueltig und der Reset laesst sich
 * wiederholen. Umgekehrt entstuende ein Record, den weder altes noch
 * neues Passwort oeffnet.
 */
export async function completePasswordReset(client, { userId, newPassword, recoveryKeyText, randomBytes }) {
  const record = await fetchKeyRecord(client);
  const keyText = String(recoveryKeyText ?? '').trim();

  let nextRecord;
  let result;
  if (record && keyText) {
    // Wirft bei falschem Key, BEVOR irgendetwas geschrieben wird.
    const dataKey = unlockWithRecoveryKey(record, keyText);
    nextRecord = await rewrapWithPassword(record, dataKey, newPassword, randomBytes);
    result = { dataKey, recoveryKeyText: null, dataLost: false };
  } else {
    const bundle = await createKeyBundle(newPassword, randomBytes);
    nextRecord = bundle.record;
    result = { dataKey: bundle.dataKey, recoveryKeyText: bundle.recoveryKeyText, dataLost: Boolean(record) };
  }

  unwrap(await client.auth.updateUser({ password: newPassword }));
  await saveKeyRecord(client, userId, nextRecord);
  return result;
}

// Kein URLSearchParams: React Native implementiert davon nur einen Teil.
function parseParams(query) {
  const out = {};
  for (const pair of query.split('&')) {
    if (!pair) continue;
    const [k, v = ''] = pair.split('=');
    try {
      out[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
    } catch {
      out[k] = v;
    }
  }
  return out;
}

export function parseAuthCallback(url) {
  if (!url || typeof url !== 'string') return null;
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');
  const raw =
    hashIndex >= 0 ? url.slice(hashIndex + 1) : queryIndex >= 0 ? url.slice(queryIndex + 1) : '';
  if (!raw) return null;
  const p = parseParams(raw);
  if (p.error_description || p.error) return { error: p.error_description || p.error };
  if (p.code) return { code: p.code, type: p.type ?? null };
  if (p.access_token && p.refresh_token) {
    return { accessToken: p.access_token, refreshToken: p.refresh_token, type: p.type ?? null };
  }
  return null;
}

export async function applyAuthCallback(client, parsed) {
  if (!parsed) throw new Error('Ungueltiger Link');
  if (parsed.error) throw new Error(parsed.error);
  if (parsed.code) {
    const data = unwrap(await client.auth.exchangeCodeForSession(parsed.code));
    return { session: data.session, type: parsed.type };
  }
  const data = unwrap(
    await client.auth.setSession({ access_token: parsed.accessToken, refresh_token: parsed.refreshToken })
  );
  return { session: data.session, type: parsed.type };
}

/**
 * Konto loeschen (Apple 5.1.1(v), Google Play). Der Client darf
 * auth.users nicht loeschen; die Edge Function prueft das Token und
 * loescht mit Service-Role. user_keys haengt per Cascade daran.
 */
export async function deleteAccount(client, deleteUrl, anonKey, fetchImpl = fetch) {
  const session = await restoreSession(client);
  const token = session?.access_token;
  if (!token) throw new Error('Nicht angemeldet');

  const response = await fetchImpl(deleteUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: anonKey,
    },
  });
  if (!response.ok) throw new Error(`Konto-Loeschung fehlgeschlagen (${response.status})`);

  // Der Nutzer existiert nicht mehr; ein globaler Logout wuerde scheitern.
  await client.auth.signOut({ scope: 'local' }).catch(() => {});
}
