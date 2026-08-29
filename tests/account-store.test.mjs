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
const listenerOf = (c) => c.getListener();

function makeClient() {
  const calls = [];
  let session = null;
  let stored = null;
  let listener = null;
  return {
    calls,
    emit: (event, s) => { session = s; listener?.(event, s); },
    get stored() { return stored; },
    getListener: () => listener,
    auth: {
      getSession: async () => ({ data: { session } }),
      onAuthStateChange: (cb) => { listener = cb; return { data: { subscription: { unsubscribe() {} } } }; },
      signUp: async (args) => { calls.push(['signUp', args]); stored = { ...args.options.data.key_record }; return { data: { user: { id: 'u1' }, session: null }, error: null }; },
      signInWithPassword: async (args) => { calls.push(['signIn', args]); session = { access_token: 'at', user: { id: 'u1', email: args.email } }; return { data: { user: session.user, session }, error: null }; },
      signOut: async () => { calls.push(['signOut']); session = null; return { error: null }; },
      updateUser: async () => ({ data: {}, error: null }),
      resetPasswordForEmail: async (email, opts) => { calls.push(['reset', email, opts]); return { error: null }; },
      setSession: async (args) => { session = { access_token: args.access_token, user: { id: 'u1', email: 'a@b.de' } }; return { data: { session }, error: null }; },
      // Wie supabase-js: genau EIN Ereignis, PASSWORD_RECOVERY statt
      // SIGNED_IN bei einem Reset-Link, BEVOR das Promise aufloest.
      exchangeCodeForSession: async (code) => {
        session = { access_token: 'from-code', user: { id: 'u1', email: 'a@b.de' } };
        listener?.(code === 'RECOVERY' ? 'PASSWORD_RECOVERY' : 'SIGNED_IN', session);
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

console.log('— Busy bei ueberlappenden Aktionen —');
{
  const client = makeClient();
  const store = createAccountStore(deps(client));
  await store.getState().initialize();

  // Zaehlt jeden Wechsel von busy mit, statt sich auf eine feste
  // Fertigstellungs-Reihenfolge der beiden ueberlappenden Aktionen zu
  // verlassen (echtes scrypt braucht messbar Zeit, die Reihenfolge der
  // beiden Ableitungen ist aber nicht garantiert).
  const transitions = [];
  const unsubscribe = store.subscribe((state, previous) => {
    if (state.busy !== previous.busy) transitions.push(state.busy);
  });

  const a = store.getState().prepareSignUp('a@b.de', 'korrekt-pferd-batterie');
  const b = store.getState().prepareSignUp('c@d.de', 'korrekt-pferd-batterie');
  check('busy sofort true bei zwei ueberlappenden Aktionen', store.getState().busy === true);

  await Promise.all([a, b]);
  unsubscribe();

  check('busy erst wieder false, wenn BEIDE Aktionen fertig sind', store.getState().busy === false);
  check(
    'genau ein Uebergang zu false (die zuerst fertige Aktion setzt busy nicht vorzeitig zurueck)',
    transitions.filter((v) => v === false).length === 1,
    JSON.stringify(transitions)
  );
}

console.log('— Signup nach Netzwerkfehler wiederholbar —');
{
  const client = makeClient();
  const originalSignUp = client.auth.signUp;
  let attempts = 0;
  client.auth.signUp = async (args) => {
    attempts += 1;
    if (attempts === 1) throw new TypeError('Network request failed');
    return originalSignUp(args);
  };
  const store = createAccountStore(deps(client));
  await store.getState().initialize();
  const recoveryKeyText = await store.getState().prepareSignUp('a@b.de', 'korrekt-pferd-batterie');
  const pendingBefore = store.getState().pendingSignUp;

  let firstError = null;
  try {
    await store.getState().confirmSignUp();
  } catch (error) {
    firstError = error;
  }
  check('erster Versuch wirft (Netzwerkfehler)', firstError instanceof TypeError);
  check(
    'pendingSignUp bleibt erhalten, derselbe Recovery-Key wie vor dem Fehlschlag',
    store.getState().pendingSignUp?.email === 'a@b.de' &&
      store.getState().pendingSignUp?.bundle?.recoveryKeyText === recoveryKeyText
  );

  const result = await store.getState().confirmSignUp();
  check('zweiter Versuch gelingt', result.needsConfirmation === true);
  check('pendingSignUp jetzt geleert', store.getState().pendingSignUp === null);
  const signUpCall = client.calls.find(([name]) => name === 'signUp');
  check(
    'derselbe Schluessel-Umschlag wird gesendet wie im vorbereiteten Bundle (kein neues Bundle beim Retry)',
    signUpCall[1].options.data.key_record.wrapped_key_pw === pendingBefore.bundle.record.wrapped_key_pw
  );
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

console.log('— Kaltstart per Recovery-Link ohne vorheriges initialize() —');
{
  // Simuliert den Deep-Link-Kaltstart: der Screen ruft handleAuthCallback,
  // BEVOR (oder ohne dass) initialize() den Auth-Listener registriert hat.
  // Ohne ensureListening() in handleAuthCallback wuerde das synchron beim
  // Code-Tausch gefeuerte PASSWORD_RECOVERY-Ereignis ins Leere laufen.
  const client = makeClient();
  const store = createAccountStore(deps(client));
  const type = await store.getState().handleAuthCallback('mysuplea://auth/callback?code=RECOVERY');
  check('Kaltstart-Reset-Link liefert Typ recovery ohne initialize()', type === 'recovery');
  check('recoveryPending gesetzt', store.getState().recoveryPending === true);
  check('Status signedIn', store.getState().status === ACCOUNT_STATUS.SIGNED_IN);
}

console.log('— Konto-Einstellungen —');
{
  const client = makeClient();
  client.auth.updateUser = async (args) => {
    if (args.email) { const s = { access_token: 'at', user: { id: 'u1', email: 'a@b.de', new_email: args.email } }; listenerOf(client)?.('USER_UPDATED', s); return { data: { user: s.user }, error: null }; }
    return { data: {}, error: null };
  };
  const store = createAccountStore(deps(client));
  await store.getState().initialize();
  await store.getState().prepareSignUp('a@b.de', 'altes-passwort-123');
  await store.getState().confirmSignUp();
  await store.getState().signIn('a@b.de', 'altes-passwort-123');
  await store.getState().changePassword('altes-passwort-123', 'neues-passwort-2026');
  check('nach Passwortwechsel weiter angemeldet, Schluessel im Speicher', store.getState().status === ACCOUNT_STATUS.SIGNED_IN && store.getState().dataKey !== null);
  await store.getState().changeEmail('neu@b.de');
  check('pendingEmail aus USER_UPDATED', store.getState().pendingEmail === 'neu@b.de');
}

if (failures > 0) { console.error(`\n${failures} Fehler`); process.exit(1); }
console.log('\nAlle AccountStore-Tests bestanden.');
