// Tests fuer AccountStore.js: Zustandsuebergaenge des Kontos gegen einen
// Fake-Client. Der Store haelt den Datenschluessel nur im Speicher.

import { webcrypto } from 'node:crypto';
import { ACCOUNT_STATUS, createAccountStore } from '../AccountStore';
import { unlockWithPassword } from '../AccountCrypto';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}
const randomBytes = async (n) => webcrypto.getRandomValues(new Uint8Array(n));
const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => v === b[i]);

function makeClient() {
  const calls = [];
  let session = null;
  let stored = null;
  let listener = null;
  return {
    calls,
    emit: (event, s) => { session = s; listener?.(event, s); },
    get stored() { return stored; },
    auth: {
      getSession: async () => ({ data: { session } }),
      onAuthStateChange: (cb) => { listener = cb; return { data: { subscription: { unsubscribe() {} } } }; },
      signUp: async (args) => { calls.push(['signUp', args]); stored = { ...args.options.data.key_record }; return { data: { user: { id: 'u1' }, session: null }, error: null }; },
      signInWithPassword: async (args) => { calls.push(['signIn', args]); session = { access_token: 'at', user: { id: 'u1', email: args.email } }; return { data: { user: session.user, session }, error: null }; },
      signOut: async () => { calls.push(['signOut']); session = null; return { error: null }; },
      updateUser: async () => ({ data: {}, error: null }),
      resetPasswordForEmail: async (email, opts) => { calls.push(['reset', email, opts]); return { error: null }; },
      setSession: async (args) => { session = { access_token: args.access_token, user: { id: 'u1', email: 'a@b.de' } }; return { data: { session }, error: null }; },
      // Wie supabase-js: erst SIGNED_IN, bei einem Reset-Link zusaetzlich
      // PASSWORD_RECOVERY, beides BEVOR das Promise aufloest.
      exchangeCodeForSession: async (code) => {
        session = { access_token: 'from-code', user: { id: 'u1', email: 'a@b.de' } };
        listener?.('SIGNED_IN', session);
        if (code === 'RECOVERY') listener?.('PASSWORD_RECOVERY', session);
        return { data: { session }, error: null };
      },
    },
    from: () => ({
      select: () => ({ maybeSingle: async () => ({ data: stored, error: null }) }),
      upsert: async (row) => { stored = row; return { error: null }; },
    }),
  };
}

const deps = (client) => ({
  client,
  randomBytes,
  redirectTo: 'mysuplea://auth/callback',
  deleteUrl: 'https://x/functions/v1/delete-account',
  anonKey: 'anon',
  fetchImpl: async () => ({ ok: true, status: 200 }),
});

console.log('— Start —');
{
  const client = makeClient();
  const store = createAccountStore(deps(client));
  check('vor initialize: unknown', store.getState().status === ACCOUNT_STATUS.UNKNOWN);
  await store.getState().initialize();
  check('ohne Session: anonymous', store.getState().status === ACCOUNT_STATUS.ANONYMOUS);
}

console.log('— Signup in zwei Schritten —');
{
  const client = makeClient();
  const store = createAccountStore(deps(client));
  await store.getState().initialize();
  const text = await store.getState().prepareSignUp('a@b.de', 'korrekt-pferd-batterie');
  check('Recovery-Key-Text zurueck', /^([A-Z2-7]{4}-){12}[A-Z2-7]{4}$/.test(text));
  check('noch kein signUp beim Server', !client.calls.some(([n]) => n === 'signUp'));
  check('pendingSignUp gesetzt', store.getState().pendingSignUp?.email === 'a@b.de');
  store.getState().cancelSignUp();
  check('Abbruch raeumt auf, Server unberuehrt', store.getState().pendingSignUp === null && client.calls.length === 0);

  await store.getState().prepareSignUp('a@b.de', 'korrekt-pferd-batterie');
  const result = await store.getState().confirmSignUp();
  check('signUp erst bei confirm', client.calls.some(([n]) => n === 'signUp') && result.needsConfirmation === true);
  check('pendingSignUp geleert (Passwort nicht laenger im Speicher)', store.getState().pendingSignUp === null);
  check('Status bleibt anonymous bis zur Bestaetigung', store.getState().status === ACCOUNT_STATUS.ANONYMOUS);
}

console.log('— Login / Logout —');
{
  const client = makeClient();
  const store = createAccountStore(deps(client));
  await store.getState().initialize();
  await store.getState().prepareSignUp('a@b.de', 'korrekt-pferd-batterie');
  await store.getState().confirmSignUp();
  await store.getState().signIn('a@b.de', 'korrekt-pferd-batterie');
  const s = store.getState();
  check('signedIn mit E-Mail', s.status === ACCOUNT_STATUS.SIGNED_IN && s.email === 'a@b.de' && s.userId === 'u1');
  check('Datenschluessel im Speicher', same(s.dataKey, await unlockWithPassword(client.stored, 'korrekt-pferd-batterie')));
  await store.getState().signOut();
  check('nach Logout anonymous, Schluessel weg', store.getState().status === ACCOUNT_STATUS.ANONYMOUS && store.getState().dataKey === null);
}

console.log('— Stiller Logout bei Session-Verlust —');
{
  const client = makeClient();
  const store = createAccountStore(deps(client));
  await store.getState().initialize();
  client.emit('SIGNED_IN', { access_token: 'at', user: { id: 'u1', email: 'a@b.de' } });
  check('Event SIGNED_IN uebernimmt', store.getState().status === ACCOUNT_STATUS.SIGNED_IN);
  client.emit('SIGNED_OUT', null);
  check('Event SIGNED_OUT setzt zurueck', store.getState().status === ACCOUNT_STATUS.ANONYMOUS && store.getState().email === null);
}

console.log('— Callback und Reset —');
{
  const client = makeClient();
  const store = createAccountStore(deps(client));
  await store.getState().initialize();
  await store.getState().prepareSignUp('a@b.de', 'altes-passwort');
  await store.getState().confirmSignUp();
  const plain = await store.getState().handleAuthCallback('mysuplea://auth/callback?code=CONFIRM');
  check('Bestaetigungs-Link: kein Reset, angemeldet', plain === null && store.getState().recoveryPending === false && store.getState().status === ACCOUNT_STATUS.SIGNED_IN);
  const type = await store.getState().handleAuthCallback('mysuplea://auth/callback?code=RECOVERY');
  check('Reset-Link: Typ recovery aus dem PASSWORD_RECOVERY-Ereignis', type === 'recovery' && store.getState().recoveryPending === true);
  const r = await store.getState().completePasswordReset('neues-passwort-2026', '');
  check('Reset ohne Key: neuer Recovery-Key steht zur Anzeige bereit', r.dataLost === true && store.getState().pendingRecoveryKeyText === r.recoveryKeyText);
  check('Reset abgeschlossen: recoveryPending geloescht', store.getState().recoveryPending === false);
  store.getState().clearPendingRecoveryKey();
  check('nach Anzeige geleert', store.getState().pendingRecoveryKeyText === null);
}

console.log('— Konto loeschen —');
{
  const client = makeClient();
  const store = createAccountStore(deps(client));
  await store.getState().initialize();
  await store.getState().prepareSignUp('a@b.de', 'korrekt-pferd-batterie');
  await store.getState().confirmSignUp();
  await store.getState().signIn('a@b.de', 'korrekt-pferd-batterie');
  await store.getState().deleteAccount();
  check('nach Loeschung anonymous ohne Schluessel', store.getState().status === ACCOUNT_STATUS.ANONYMOUS && store.getState().dataKey === null);
}

if (failures > 0) { console.error(`\n${failures} Fehler`); process.exit(1); }
console.log('\nAlle AccountStore-Tests bestanden.');
