// Tests fuer AccountLogic.js gegen einen Fake-Client. Kein Netzwerk.
// Geprueft wird, WAS an Supabase geht (nie Passwort oder Klartext-
// Schluessel) und wie Antworten in den App-Zustand uebersetzt werden.

import { webcrypto } from 'node:crypto';
import { createKeyBundle } from '../AccountCrypto';
import {
  PROVIDERS,
  applyAuthCallback,
  completePasswordReset,
  deleteAccount,
  isNetworkError,
  parseAuthCallback,
  signInWithEmail,
  signUpWithEmail,
} from '../AccountLogic';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}
async function throws(fn) { try { await fn(); return false; } catch { return true; } }
const randomBytes = async (n) => webcrypto.getRandomValues(new Uint8Array(n));
const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

// Minimaler Fake: zeichnet Aufrufe auf, liefert vorgegebene Antworten.
function makeClient({ keyRecord = null, signUpSession = null } = {}) {
  const calls = [];
  let stored = keyRecord;
  return {
    calls,
    get stored() { return stored; },
    auth: {
      signUp: async (args) => { calls.push(['signUp', args]); return { data: { user: { id: 'u1' }, session: signUpSession }, error: null }; },
      signInWithPassword: async (args) => { calls.push(['signIn', args]); return { data: { user: { id: 'u1', email: args.email }, session: { access_token: 'at' } }, error: null }; },
      updateUser: async (args) => { calls.push(['updateUser', args]); return { data: {}, error: null }; },
      getSession: async () => ({ data: { session: { access_token: 'at', user: { id: 'u1' } } } }),
      setSession: async (args) => { calls.push(['setSession', args]); return { data: { session: { access_token: args.access_token } }, error: null }; },
      exchangeCodeForSession: async (code) => { calls.push(['exchange', code]); return { data: { session: { access_token: 'from-code' } }, error: null }; },
      signOut: async (args) => { calls.push(['signOut', args]); return { error: null }; },
    },
    from: (table) => ({
      select: () => ({ maybeSingle: async () => ({ data: stored, error: null }) }),
      upsert: async (row) => { calls.push(['upsert', table, row]); stored = row; return { error: null }; },
    }),
  };
}

console.log('— Provider —');
check('E-Mail verfuegbar, Apple noch nicht', PROVIDERS.find((p) => p.id === 'email').available && !PROVIDERS.find((p) => p.id === 'apple').available);

console.log('— Signup —');
{
  const client = makeClient();
  const bundle = await createKeyBundle('korrekt-pferd-batterie', randomBytes);
  const result = await signUpWithEmail(client, { email: 'a@b.de', password: 'korrekt-pferd-batterie', record: bundle.record }, 'mysuplea://auth/callback');
  const [, args] = client.calls.find(([name]) => name === 'signUp');
  check('needsConfirmation ohne Session', result.needsConfirmation === true && result.userId === 'u1');
  check('Record als key_record in den Metadaten', args.options.data.key_record.wrapped_key_pw === bundle.record.wrapped_key_pw);
  check('Redirect gesetzt', args.options.emailRedirectTo === 'mysuplea://auth/callback');
  const sent = JSON.stringify(args);
  check('Klartext-Datenschluessel geht nicht raus', !sent.includes(Buffer.from(bundle.dataKey).toString('hex')));
  check('Recovery-Key geht nicht raus', !sent.includes(bundle.recoveryKeyText));
}

console.log('— Login —');
{
  const bundle = await createKeyBundle('korrekt-pferd-batterie', randomBytes);
  const client = makeClient({ keyRecord: bundle.record });
  const result = await signInWithEmail(client, { email: 'a@b.de', password: 'korrekt-pferd-batterie' });
  check('Session und Nutzer zurueck', result.session.access_token === 'at' && result.user.id === 'u1');
  check('Datenschluessel entsperrt', same(result.dataKey, bundle.dataKey));
  const noRecord = await signInWithEmail(makeClient(), { email: 'a@b.de', password: 'x' });
  check('ohne Record: dataKey null, kein Fehler', noRecord.dataKey === null);
}

console.log('— Callback-URL —');
check('Fragment mit Tokens', (() => { const p = parseAuthCallback('mysuplea://auth/callback#access_token=A&refresh_token=R&type=recovery'); return p.accessToken === 'A' && p.refreshToken === 'R' && p.type === 'recovery'; })());
check('Expo-Go-URL mit Query', (() => { const p = parseAuthCallback('exp://192.168.1.7:8081/--/auth/callback?code=C'); return p.code === 'C'; })());
check('Fehler aus Link', parseAuthCallback('mysuplea://auth/callback#error=access_denied&error_description=Link%20abgelaufen').error === 'Link abgelaufen');
check('leere URL ist null', parseAuthCallback('mysuplea://auth/callback') === null && parseAuthCallback(null) === null);
{
  const client = makeClient();
  const viaTokens = await applyAuthCallback(client, parseAuthCallback('x://y#access_token=A&refresh_token=R&type=signup'));
  check('Tokens werden als Session gesetzt', viaTokens.type === 'signup' && client.calls.some(([n]) => n === 'setSession'));
  const viaCode = await applyAuthCallback(client, parseAuthCallback('x://y?code=C'));
  check('Code wird getauscht', viaCode.session.access_token === 'from-code');
  check('Fehler-Callback wirft', await throws(() => applyAuthCallback(client, { error: 'kaputt' })));
}

console.log('— Passwort-Reset —');
{
  const bundle = await createKeyBundle('altes-passwort', randomBytes);
  const client = makeClient({ keyRecord: bundle.record });
  const result = await completePasswordReset(client, { userId: 'u1', newPassword: 'neues-passwort-2026', recoveryKeyText: bundle.recoveryKeyText, randomBytes });
  check('mit Recovery-Key: Datenschluessel bleibt', same(result.dataKey, bundle.dataKey) && result.dataLost === false && result.recoveryKeyText === null);
  const order = client.calls.map(([n]) => n).filter((n) => n === 'updateUser' || n === 'upsert');
  check('Passwort zuerst, dann Record', order[0] === 'updateUser' && order[1] === 'upsert');
  check('Record neu gewickelt und gespeichert', client.stored.wrapped_key_pw !== bundle.record.wrapped_key_pw && client.stored.user_id === 'u1');
  check('falscher Recovery-Key wirft, bevor irgendetwas gespeichert wird', await throws(() =>
    completePasswordReset(makeClient({ keyRecord: bundle.record }), { userId: 'u1', newPassword: 'n', recoveryKeyText: 'AAAA-AAAA', randomBytes })));
}
{
  const bundle = await createKeyBundle('altes-passwort', randomBytes);
  const client = makeClient({ keyRecord: bundle.record });
  const result = await completePasswordReset(client, { userId: 'u1', newPassword: 'neues-passwort-2026', recoveryKeyText: '', randomBytes });
  check('ohne Recovery-Key: neuer Schluessel, Datenverlust markiert', !same(result.dataKey, bundle.dataKey) && result.dataLost === true && /^([A-Z2-7]{4}-){12}[A-Z2-7]{4}$/.test(result.recoveryKeyText));
}

console.log('— Konto loeschen —');
{
  const client = makeClient();
  const requests = [];
  const fetchImpl = async (url, init) => { requests.push({ url, init }); return { ok: true, status: 200 }; };
  await deleteAccount(client, 'https://x/functions/v1/delete-account', 'anon', fetchImpl);
  check('POST mit Nutzer-Token und apikey', requests[0].init.method === 'POST' && requests[0].init.headers.Authorization === 'Bearer at' && requests[0].init.headers.apikey === 'anon');
  check('danach lokaler Logout', client.calls.some(([n, a]) => n === 'signOut' && a?.scope === 'local'));
  const failing = async () => ({ ok: false, status: 500 });
  check('Fehlstatus wirft', await throws(() => deleteAccount(makeClient(), 'https://x', 'anon', failing)));
}

console.log('— Netzwerkfehler —');
check('TypeError "Network request failed" erkannt', isNetworkError(new TypeError('Network request failed')));
check('AuthError ist kein Netzwerkfehler', !isNetworkError(Object.assign(new Error('Invalid login credentials'), { status: 400 })));

if (failures > 0) { console.error(`\n${failures} Fehler`); process.exit(1); }
console.log('\nAlle AccountLogic-Tests bestanden.');
