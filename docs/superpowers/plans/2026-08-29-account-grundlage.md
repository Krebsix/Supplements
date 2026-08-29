# Account-Grundlage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optionales Nutzerkonto (E-Mail + Passwort) mit Supabase Auth, das beim Signup einen Ende-zu-Ende-Datenschluessel samt Recovery-Key erzeugt, Session verschluesselt persistiert, Passwort-Reset per Deep Link kann und sich in der App wieder loeschen laesst.

**Architecture:** Drei neue Fachlogik-Module ohne UI (`AccountCrypto.js` reine Kryptografie, `AccountLogic.js` Supabase-Ablaeufe mit injiziertem Client, `AccountStore.js` zustand-Factory), ein gebundener Store (`useAccountStore.js`), vier Screens, eine Migration mit Trigger und RLS, eine Edge Function zum Loeschen. Der Haupt-Store `useStore.js` bleibt unangetastet.

**Tech Stack:** `@supabase/supabase-js@2`, `@noble/hashes@2` (scrypt), `@noble/ciphers@2` (AES-256-GCM), `expo-crypto` (Zufall), `expo-linking` (Deep Links), `expo-clipboard`, zustand, expo-router. Tests: esbuild + Node via `npm test`.

**Spec:** `docs/superpowers/specs/2026-08-29-account-grundlage-design.md`

## Global Constraints

- Sprache: Oberflaeche DE/EN ueber `i18n/de/*` und `i18n/en/*`, Code-Kommentare Deutsch. Kein Schluessel darf nur auf Englisch existieren (`tests/i18n.test.mjs`).
- **Keine Gedankenstriche in Nutzertexten**, auch nicht in EN-Texten. Doppelpunkt, Komma, Punkt.
- Keine Hex-Farbwerte in Screens, nur Tokens aus `theme.js` (`colors`, `type`, `space`, `radius`, `surfaces`).
- Fachlogik nie in Screens. Screens rufen Store-Aktionen, sonst nichts.
- Keine Secrets in der App. `SUPABASE_ANON_KEY` ist oeffentlich, der Service-Role-Key existiert nur in der Edge Function.
- Passwort, abgeleiteter Schluessel, Datenschluessel und Recovery-Key gehen nie an den Server. Server sieht nur `kdf`, `kdf_salt`, `wrapped_key_pw`, `wrapped_key_recovery`.
- Fehler bei Login: einheitliche Meldung, keine Unterscheidung "E-Mail unbekannt" vs. "Passwort falsch".
- Konto ist optional: kein Gate, kein Onboarding-Schritt.
- Wer `data/legalContent.js` aendert, fuehrt `npm run build:legal` aus (sonst faellt `tests/legal-site.test.mjs`).
- Conventional Commits, Commit-Messages Englisch.

## Abweichungen von der Spec (mit Grund)

1. **Recovery-Screen VOR `signUp()`, nicht danach.** Supabase legt das Konto bei `signUp()` an, liefert aber bei aktiver E-Mail-Bestaetigung keine Session. Ohne Session gibt es kein Token, mit dem ein Abbruch das Konto wieder loeschen koennte. Reihenfolge deshalb: Formular, Schluessel erzeugen, Recovery-Key anzeigen und bestaetigen lassen, erst dann `signUp()`. Abbruch bedeutet: nichts wurde angelegt. Der Fehlerpfad "user_keys-Schreiben schlaegt nach signUp fehl" entfaellt.
2. **`user_keys` wird per Trigger aus den Signup-Metadaten gefuellt**, nicht per Client-Insert. Gleicher Grund: vor der E-Mail-Bestaetigung kann der Client unter RLS nichts schreiben. `signUp()` traegt den Schluesseldatensatz in `options.data.key_record`, ein `after insert`-Trigger auf `auth.users` kopiert ihn nach `public.user_keys`. Der Client darf die Zeile spaeter lesen und aktualisieren (Passwort-Reset).

---

### Task 1: Abhaengigkeiten, Konfiguration, Supabase-Client

**Files:**
- Modify: `package.json`
- Modify: `scanConfig.js`
- Create: `supabaseClient.js`

**Interfaces:**
- Produces: `SUPABASE_URL`, `ACCOUNT_DELETE_URL` (scanConfig.js); `supabase` (supabaseClient.js)

- [ ] **Step 1: Pakete installieren**

```bash
npx expo install @supabase/supabase-js expo-clipboard
npm install @noble/hashes@^2 @noble/ciphers@^2
```

Erwartet: `package.json` enthaelt die vier Pakete. `pdfjs-dist` und `babel.config.js` aus dem Spike NICHT anfassen und NICHT committen.

- [ ] **Step 2: scanConfig.js erweitern**

Unter `SUPABASE_ANON_KEY` anfuegen:

```js
// Basis-URL des Supabase-Projekts. Wird vom Auth-Client (supabaseClient.js)
// und fuer die Konto-Loeschung gebraucht. Oeffentlicher Wert.
export const SUPABASE_URL = 'https://zeflyivnxbmkyiacogzu.supabase.co';

// Edge Function, die ein Konto loescht (supabase/functions/delete-account).
// Der Client darf auth.users nicht selbst loeschen; die Funktion prueft das
// Token und loescht mit Service-Role.
export const ACCOUNT_DELETE_URL = `${SUPABASE_URL}/functions/v1/delete-account`;
```

- [ ] **Step 3: supabaseClient.js anlegen**

```js
/**
 * supabaseClient.js
 * Einziger Supabase-Client der App (Auth und spaeter Sync).
 *
 * Die Session (Access- und Refresh-Token) liegt ueber denselben
 * verschluesselten Adapter wie der Haupt-Store (secureStorage.js):
 * Tokens sind keine Gesundheitsdaten, aber wer sie hat, ist die Nutzerin.
 *
 * flowType 'implicit': Die Bestaetigungs- und Reset-Links tragen dann
 * access_token, refresh_token und type im URL-Fragment. So erkennt
 * app/auth/callback.jsx einen Passwort-Reset (type=recovery) direkt an
 * der URL. PKCE wuerde nur einen Code liefern und den Typ verschlucken.
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
    flowType: 'implicit',
  },
});

export default supabase;
```

- [ ] **Step 4: Tests laufen lassen und App-Start pruefen**

Run: `npm test`
Expected: alle bestehenden Tests gruen (der neue Client wird noch nirgends importiert).

Run: `npx expo export --platform ios --output-dir node_modules/.cache/export-check > /dev/null && echo BUNDLE_OK`
Expected: `BUNDLE_OK`. Falls Metro `URL is not implemented` oder aehnliches wirft: `npx expo install react-native-url-polyfill` und in `supabaseClient.js` als erste Zeile `import 'react-native-url-polyfill/auto';` ergaenzen.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json scanConfig.js supabaseClient.js
git commit -m "feat(account): add supabase auth client and crypto dependencies"
```

---

### Task 2: AccountCrypto.js (reine Kryptografie, TDD)

**Files:**
- Create: `AccountCrypto.js`
- Test: `tests/account-crypto.test.mjs`

**Interfaces:**
- Produces:
  - `KDF_PARAMS = { name: 'scrypt', N: 32768, r: 8, p: 1, dkLen: 32 }`
  - `deriveKeyFromPassword(password: string, salt: Uint8Array, params?) => Promise<Uint8Array(32)>`
  - `wrapKey(dataKey: Uint8Array, wrappingKey: Uint8Array, randomBytes) => Promise<string>` (Format `nonceHex:sealedHex`)
  - `unwrapKey(wrapped: string, wrappingKey: Uint8Array) => Uint8Array` (wirft bei Manipulation)
  - `createKeyBundle(password, randomBytes) => Promise<{ dataKey, recoveryKey, recoveryKeyText, record }>` mit `record = { kdf, kdf_salt, wrapped_key_pw, wrapped_key_recovery }`
  - `unlockWithPassword(record, password) => Promise<Uint8Array>`
  - `unlockWithRecoveryKey(record, recoveryKeyText) => Uint8Array`
  - `rewrapWithPassword(record, dataKey, newPassword, randomBytes) => Promise<record>`
  - `formatRecoveryKey(bytes) => string` (Base32, Vierergruppen mit Bindestrich)
  - `parseRecoveryKey(text) => Uint8Array(32)`
  - `randomBytes` ist immer eine injizierte `async (n) => Uint8Array`, damit das Modul in Node testbar bleibt und in der App `expo-crypto` nutzt.

- [ ] **Step 1: Fehlschlagenden Test schreiben**

`tests/account-crypto.test.mjs`:

```js
// Tests fuer AccountCrypto.js: Schluesselableitung, Wrapping, Recovery-Key.
// Alles reine Kryptografie ohne Supabase, deshalb vollstaendig in Node
// pruefbar. randomBytes wird injiziert (in der App: expo-crypto).

import { webcrypto } from 'node:crypto';
import {
  KDF_PARAMS,
  createKeyBundle,
  deriveKeyFromPassword,
  formatRecoveryKey,
  parseRecoveryKey,
  rewrapWithPassword,
  unlockWithPassword,
  unlockWithRecoveryKey,
  unwrapKey,
  wrapKey,
} from '../AccountCrypto';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}
async function throws(fn) {
  try { await fn(); return false; } catch { return true; }
}
const randomBytes = async (n) => webcrypto.getRandomValues(new Uint8Array(n));
const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

console.log('— Schluesselableitung —');
const salt = await randomBytes(16);
const k1 = await deriveKeyFromPassword('korrekt-pferd-batterie', salt);
const k2 = await deriveKeyFromPassword('korrekt-pferd-batterie', salt);
const k3 = await deriveKeyFromPassword('korrekt-pferd-batterie', await randomBytes(16));
const k4 = await deriveKeyFromPassword('anderes-passwort', salt);
check('32 Byte Schluessel', k1.length === 32 && k1.length === KDF_PARAMS.dkLen);
check('gleiche Eingabe, gleicher Schluessel', same(k1, k2));
check('anderes Salt, anderer Schluessel', !same(k1, k3));
check('anderes Passwort, anderer Schluessel', !same(k1, k4));
check('leeres Passwort wird abgelehnt', await throws(() => deriveKeyFromPassword('', salt)));
check('NFKC: zusammengesetztes und vorkomponiertes ü sind gleich',
  same(await deriveKeyFromPassword('gr\u00fcn', salt), await deriveKeyFromPassword('gru\u0308n', salt)));

console.log('— Wrap / Unwrap —');
const dataKey = await randomBytes(32);
const wrapped = await wrapKey(dataKey, k1, randomBytes);
check('Format nonceHex:sealedHex', /^[0-9a-f]{24}:[0-9a-f]+$/.test(wrapped));
check('Rundtrip liefert Datenschluessel', same(unwrapKey(wrapped, k1), dataKey));
check('falscher Schluessel wird abgelehnt', await throws(() => unwrapKey(wrapped, k4)));
const [nonceHex, sealedHex] = wrapped.split(':');
const flipped = sealedHex.slice(0, -1) + (sealedHex.endsWith('0') ? '1' : '0');
check('manipulierter Chiffretext wird abgelehnt (GCM)', await throws(() => unwrapKey(`${nonceHex}:${flipped}`, k1)));
check('zwei Wraps desselben Schluessels unterscheiden sich (Nonce)',
  (await wrapKey(dataKey, k1, randomBytes)) !== wrapped);

console.log('— Recovery-Key Darstellung —');
const rk = await randomBytes(32);
const text = formatRecoveryKey(rk);
check('13 Vierergruppen', /^([A-Z2-7]{4}-){12}[A-Z2-7]{4}$/.test(text), text);
check('Parse-Rundtrip', same(parseRecoveryKey(text), rk));
check('Kleinschreibung und Leerzeichen werden toleriert',
  same(parseRecoveryKey(text.toLowerCase().replace(/-/g, ' ')), rk));
check('zu kurzer Key wird abgelehnt', await throws(() => parseRecoveryKey('ABCD-EFGH')));

console.log('— Bundle —');
const bundle = await createKeyBundle('korrekt-pferd-batterie', randomBytes);
check('Record traegt genau die vier Serverfelder',
  JSON.stringify(Object.keys(bundle.record).sort()) ===
    JSON.stringify(['kdf', 'kdf_salt', 'wrapped_key_pw', 'wrapped_key_recovery']));
check('kdf im Record entspricht KDF_PARAMS', bundle.record.kdf.N === KDF_PARAMS.N && bundle.record.kdf.name === 'scrypt');
check('Record enthaelt keinen Klartext-Schluessel',
  !JSON.stringify(bundle.record).includes(Buffer.from(bundle.dataKey).toString('hex')));
check('Passwort entsperrt', same(await unlockWithPassword(bundle.record, 'korrekt-pferd-batterie'), bundle.dataKey));
check('Recovery-Key entsperrt', same(unlockWithRecoveryKey(bundle.record, bundle.recoveryKeyText), bundle.dataKey));
check('falsches Passwort scheitert', await throws(() => unlockWithPassword(bundle.record, 'falsch')));

console.log('— Rewrap nach Passwort-Reset —');
const rewrapped = await rewrapWithPassword(bundle.record, bundle.dataKey, 'neues-passwort-2026', randomBytes);
check('neues Passwort entsperrt', same(await unlockWithPassword(rewrapped, 'neues-passwort-2026'), bundle.dataKey));
check('altes Passwort scheitert', await throws(() => unlockWithPassword(rewrapped, 'korrekt-pferd-batterie')));
check('Recovery-Key bleibt gueltig', same(unlockWithRecoveryKey(rewrapped, bundle.recoveryKeyText), bundle.dataKey));
check('Salt wurde erneuert', rewrapped.kdf_salt !== bundle.record.kdf_salt);

if (failures > 0) { console.error(`\n${failures} Fehler`); process.exit(1); }
console.log('\nAlle AccountCrypto-Tests bestanden.');
```

- [ ] **Step 2: Test laufen lassen, Fehlschlag pruefen**

Run: `npm test 2>&1 | grep -A3 "account-crypto"`
Expected: Bundling-Fehler `Could not resolve "../AccountCrypto"`.

- [ ] **Step 3: AccountCrypto.js schreiben**

```js
/**
 * AccountCrypto.js
 * ─────────────────────────────────────────────────────────────
 * Kryptografische Grundlage fuer das Konto: Aus dem Passwort wird ein
 * Schluessel abgeleitet, der einen zufaelligen Datenschluessel umwickelt.
 * Ein zweiter Umschlag mit einem Recovery-Key erlaubt den Zugriff nach
 * Passwortverlust. Der Server (Supabase) bekommt nur die Umschlaege.
 *
 * WARUM SO:
 * Teilprojekt 2 (Sync) wird Gesundheitsdaten nach Art. 9 DSGVO
 * hochladen. Die Nutzerin soll sich darauf verlassen koennen, dass
 * weder wir noch Supabase sie lesen koennen. Deshalb entsteht der
 * Schluessel hier, auf dem Geraet, und verlaesst es nie.
 *
 * WAHL DER VERFAHREN:
 * - scrypt statt Argon2id: beides waere gleichwertig, die noble-
 *   Implementierung fuer scrypt ist laenger im Einsatz. Parameter im
 *   Record, damit sie sich spaeter erhoehen lassen.
 * - AES-256-GCM statt CTR (wie secureStorage.js): Ein Server-Datensatz
 *   braucht Integritaetsschutz, ein manipulierter Umschlag muss auffallen.
 * - Reines JavaScript (@noble/*): laeuft in Expo Go und im Store-Build
 *   identisch, kein Native-Modul, kein Dev-Build noetig.
 *
 * randomBytes wird injiziert: In der App expo-crypto, im Test Node.
 */

import { gcm } from '@noble/ciphers/aes.js';
import { scryptAsync } from '@noble/hashes/scrypt.js';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';

export const KDF_PARAMS = { name: 'scrypt', N: 32768, r: 8, p: 1, dkLen: 32 };

const SALT_LENGTH = 16;
const NONCE_LENGTH = 12;
const KEY_LENGTH = 32;
const RECOVERY_LENGTH = 32;

// RFC 4648 Base32 ohne Padding: nur Grossbuchstaben und Ziffern 2 bis 7,
// keine 0/O- oder 1/I-Verwechslung beim Abtippen.
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export async function deriveKeyFromPassword(password, salt, params = KDF_PARAMS) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('AccountCrypto: leeres Passwort');
  }
  if (!(salt instanceof Uint8Array) || salt.length < SALT_LENGTH) {
    throw new Error('AccountCrypto: Salt fehlt oder zu kurz');
  }
  // NFKC: dasselbe Wort, auf zwei Tastaturen verschieden kodiert, muss
  // denselben Schluessel ergeben.
  return scryptAsync(utf8ToBytes(password.normalize('NFKC')), salt, {
    N: params.N,
    r: params.r,
    p: params.p,
    dkLen: params.dkLen,
  });
}

export async function wrapKey(dataKey, wrappingKey, randomBytes) {
  const nonce = await randomBytes(NONCE_LENGTH);
  const sealed = gcm(wrappingKey, nonce).encrypt(dataKey);
  return `${bytesToHex(nonce)}:${bytesToHex(sealed)}`;
}

export function unwrapKey(wrapped, wrappingKey) {
  const [nonceHex, sealedHex] = String(wrapped ?? '').split(':');
  if (!nonceHex || !sealedHex) throw new Error('AccountCrypto: unlesbares Format');
  // decrypt wirft, wenn Tag oder Schluessel nicht passen.
  return gcm(wrappingKey, hexToBytes(nonceHex)).decrypt(hexToBytes(sealedHex));
}

export function formatRecoveryKey(bytes) {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
    value &= (1 << bits) - 1;
  }
  if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return out.match(/.{1,4}/g).join('-');
}

export function parseRecoveryKey(text) {
  const clean = String(text ?? '').toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const out = [];
  for (const ch of clean) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
    value &= (1 << bits) - 1;
  }
  if (out.length !== RECOVERY_LENGTH) {
    throw new Error('AccountCrypto: Recovery-Key hat nicht die erwartete Laenge');
  }
  return Uint8Array.from(out);
}

export async function createKeyBundle(password, randomBytes) {
  const salt = await randomBytes(SALT_LENGTH);
  const dataKey = await randomBytes(KEY_LENGTH);
  const recoveryKey = await randomBytes(RECOVERY_LENGTH);
  const passwordKey = await deriveKeyFromPassword(password, salt);

  const record = {
    kdf: { ...KDF_PARAMS },
    kdf_salt: bytesToHex(salt),
    wrapped_key_pw: await wrapKey(dataKey, passwordKey, randomBytes),
    wrapped_key_recovery: await wrapKey(dataKey, recoveryKey, randomBytes),
  };

  return { dataKey, recoveryKey, recoveryKeyText: formatRecoveryKey(recoveryKey), record };
}

export async function unlockWithPassword(record, password) {
  const key = await deriveKeyFromPassword(password, hexToBytes(record.kdf_salt), record.kdf);
  return unwrapKey(record.wrapped_key_pw, key);
}

export function unlockWithRecoveryKey(record, recoveryKeyText) {
  return unwrapKey(record.wrapped_key_recovery, parseRecoveryKey(recoveryKeyText));
}

export async function rewrapWithPassword(record, dataKey, newPassword, randomBytes) {
  const salt = await randomBytes(SALT_LENGTH);
  const key = await deriveKeyFromPassword(newPassword, salt);
  return {
    ...record,
    kdf: { ...KDF_PARAMS },
    kdf_salt: bytesToHex(salt),
    wrapped_key_pw: await wrapKey(dataKey, key, randomBytes),
  };
}
```

- [ ] **Step 4: Test laufen lassen**

Run: `npm test 2>&1 | grep -A40 "account-crypto"`
Expected: alle `ok`, Abschluss `Alle AccountCrypto-Tests bestanden.`

- [ ] **Step 5: Commit**

```bash
git add AccountCrypto.js tests/account-crypto.test.mjs
git commit -m "feat(account): key derivation, wrapping and recovery key (AccountCrypto)"
```

---

### Task 3: AccountLogic.js (Supabase-Ablaeufe mit injiziertem Client, TDD)

**Files:**
- Create: `AccountLogic.js`
- Test: `tests/account-logic.test.mjs`

**Interfaces:**
- Consumes: alles aus `AccountCrypto.js` (Task 2)
- Produces (alle Funktionen nehmen `client` als erstes Argument, damit Tests einen Fake uebergeben):
  - `PROVIDERS = [{ id: 'email', available: true }, { id: 'apple', available: false }]`
  - `isNetworkError(error) => boolean`
  - `signUpWithEmail(client, { email, password, record }, redirectTo) => Promise<{ userId, needsConfirmation }>`
  - `signInWithEmail(client, { email, password }) => Promise<{ session, user, dataKey|null }>`
  - `fetchKeyRecord(client) => Promise<record|null>`
  - `saveKeyRecord(client, userId, record) => Promise<void>`
  - `signOut(client) => Promise<void>`
  - `restoreSession(client) => Promise<session|null>`
  - `requestPasswordReset(client, email, redirectTo) => Promise<void>`
  - `completePasswordReset(client, { userId, newPassword, recoveryKeyText, randomBytes }) => Promise<{ dataKey, recoveryKeyText|null, dataLost }>`
  - `parseAuthCallback(url) => { code, type } | { accessToken, refreshToken, type } | { error } | null`
  - `applyAuthCallback(client, parsed) => Promise<{ session, type }>`
  - `deleteAccount(client, deleteUrl, anonKey, fetchImpl?) => Promise<void>`

- [ ] **Step 1: Fehlschlagenden Test schreiben**

`tests/account-logic.test.mjs`:

```js
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
```

- [ ] **Step 2: Test laufen lassen, Fehlschlag pruefen**

Run: `npm test 2>&1 | grep -A3 "account-logic"`
Expected: `Could not resolve "../AccountLogic"`.

- [ ] **Step 3: AccountLogic.js schreiben**

```js
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
```

- [ ] **Step 4: Test laufen lassen**

Run: `npm test 2>&1 | grep -A40 "account-logic"`
Expected: alle `ok`, `Alle AccountLogic-Tests bestanden.`

- [ ] **Step 5: Commit**

```bash
git add AccountLogic.js tests/account-logic.test.mjs
git commit -m "feat(account): signup, login, reset and delete flows (AccountLogic)"
```

---

### Task 4: AccountStore (zustand-Factory, TDD) und Bindung an die App

**Files:**
- Create: `AccountStore.js`
- Create: `useAccountStore.js`
- Modify: `app/_layout.jsx`
- Test: `tests/account-store.test.mjs`

**Interfaces:**
- Consumes: `AccountLogic.js` (Task 3), `AccountCrypto.createKeyBundle`
- Produces:
  - `ACCOUNT_STATUS = { UNKNOWN: 'unknown', ANONYMOUS: 'anonymous', SIGNED_IN: 'signedIn' }`
  - `createAccountStore({ client, randomBytes, redirectTo, deleteUrl, anonKey, fetchImpl? })` liefert einen zustand-Hook mit State `{ status, email, userId, dataKey, busy, pendingSignUp, pendingRecoveryKeyText }` und Aktionen `initialize, prepareSignUp(email, password) => recoveryKeyText, confirmSignUp() => { needsConfirmation }, cancelSignUp, signIn(email, password), signOut, requestPasswordReset(email), completePasswordReset(newPassword, recoveryKeyText) => { dataLost, recoveryKeyText }, clearPendingRecoveryKey, handleAuthCallback(url) => type, deleteAccount`
  - `useAccountStore` (useAccountStore.js): der gebundene Store fuer Screens

- [ ] **Step 1: Fehlschlagenden Test schreiben**

`tests/account-store.test.mjs`:

```js
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
      exchangeCodeForSession: async () => ({ data: { session }, error: null }),
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
  const type = await store.getState().handleAuthCallback('mysuplea://auth/callback#access_token=A&refresh_token=R&type=recovery');
  check('Callback liefert Typ und meldet an', type === 'recovery' && store.getState().status === ACCOUNT_STATUS.SIGNED_IN);
  const r = await store.getState().completePasswordReset('neues-passwort-2026', '');
  check('Reset ohne Key: neuer Recovery-Key steht zur Anzeige bereit', r.dataLost === true && store.getState().pendingRecoveryKeyText === r.recoveryKeyText);
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
```

- [ ] **Step 2: Test laufen lassen, Fehlschlag pruefen**

Run: `npm test 2>&1 | grep -A3 "account-store"`
Expected: `Could not resolve "../AccountStore"`.

- [ ] **Step 3: AccountStore.js schreiben**

```js
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
        client.auth.onAuthStateChange((_event, nextSession) => {
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
          set({ dataKey: result.dataKey, pendingRecoveryKeyText: result.recoveryKeyText });
          return result;
        }),

      clearPendingRecoveryKey: () => set({ pendingRecoveryKeyText: null }),

      handleAuthCallback: (url) =>
        withBusy(async () => {
          const result = await applyAuthCallback(client, parseAuthCallback(url));
          applySession(result.session);
          return result.type;
        }),

      deleteAccount: () =>
        withBusy(async () => {
          await deleteAccount(client, deleteUrl, anonKey, fetchImpl);
          set({ ...ANONYMOUS_STATE });
        }),
    };
  });
}
```

- [ ] **Step 4: Test laufen lassen**

Run: `npm test 2>&1 | grep -A40 "account-store"`
Expected: alle `ok`, `Alle AccountStore-Tests bestanden.`

- [ ] **Step 5: useAccountStore.js anlegen**

```js
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
```

- [ ] **Step 6: Root-Layout initialisiert den Konto-Store**

In `app/_layout.jsx` Import ergaenzen:

```js
import { useAccountStore } from '../useAccountStore';
```

Und in `Layout()` direkt nach `const hydrated = useStoreHydrated();`:

```js
  // Konto-Session wiederherstellen. Laeuft parallel zum Store-Hydrate und
  // blockiert nichts: Die App ist ohne Konto voll nutzbar.
  useEffect(() => {
    useAccountStore
      .getState()
      .initialize()
      .catch((error) => console.error('[Layout] Konto-Initialisierung fehlgeschlagen', error));
  }, []);
```

- [ ] **Step 7: Volle Testsuite und Bundle**

Run: `npm test`
Expected: alle gruen.

Run: `npx expo export --platform ios --output-dir node_modules/.cache/export-check > /dev/null && echo BUNDLE_OK`
Expected: `BUNDLE_OK`.

- [ ] **Step 8: Commit**

```bash
git add AccountStore.js useAccountStore.js app/_layout.jsx tests/account-store.test.mjs
git commit -m "feat(account): account store with session restore and in-memory data key"
```

---

### Task 5: Datenbank, Edge Function, Supabase-Konfiguration

**Files:**
- Create: `supabase/migrations/20260829090000_user_keys.sql`
- Create: `supabase/functions/delete-account/index.ts`
- Create: `supabase/functions/delete-account/deno.json`

**Interfaces:**
- Produces: Tabelle `public.user_keys` (Spalten wie in AccountLogic.saveKeyRecord), Trigger `on_auth_user_created_keys`, Endpoint `POST /functions/v1/delete-account`

- [ ] **Step 1: Migration schreiben**

`supabase/migrations/20260829090000_user_keys.sql`:

```sql
-- Konto-Grundlage (Spec 2026-08-29): eine Zeile je Nutzerin mit den
-- Umschlaegen des Datenschluessels. Enthaelt KEINEN Klartext-Schluessel,
-- kein Passwort, keinen Recovery-Key. Der Server kann damit allein nichts
-- entschluesseln (AccountCrypto.js).
--
-- Befuellung: Der Client schreibt den Datensatz bei signUp() in die
-- Nutzer-Metadaten (options.data.key_record); der Trigger unten kopiert
-- ihn hierher. Grund: Vor der E-Mail-Bestaetigung hat der Client keine
-- Session und darf unter RLS nichts schreiben.

create table if not exists public.user_keys (
  user_id uuid primary key references auth.users (id) on delete cascade,
  kdf jsonb not null,
  kdf_salt text not null,
  wrapped_key_pw text not null,
  wrapped_key_recovery text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_keys_salt_hex check (kdf_salt ~ '^[0-9a-f]{32}$'),
  constraint user_keys_pw_format check (wrapped_key_pw ~ '^[0-9a-f]{24}:[0-9a-f]+$'),
  constraint user_keys_recovery_format check (wrapped_key_recovery ~ '^[0-9a-f]{24}:[0-9a-f]+$')
);

alter table public.user_keys enable row level security;

-- (select auth.uid()) statt auth.uid(): einmal je Anfrage ausgewertet,
-- nicht je Zeile (Supabase-Empfehlung fuer RLS-Performance).
create policy user_keys_select_own on public.user_keys
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy user_keys_insert_own on public.user_keys
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy user_keys_update_own on public.user_keys
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Kein delete fuer Clients: Die Zeile faellt per Cascade, wenn die
-- Edge Function delete-account den auth.users-Eintrag loescht.

create or replace function public.handle_new_user_keys()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec jsonb := new.raw_user_meta_data -> 'key_record';
begin
  if rec is not null and rec ? 'wrapped_key_pw' then
    insert into public.user_keys (user_id, kdf, kdf_salt, wrapped_key_pw, wrapped_key_recovery)
    values (
      new.id,
      rec -> 'kdf',
      rec ->> 'kdf_salt',
      rec ->> 'wrapped_key_pw',
      rec ->> 'wrapped_key_recovery'
    )
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

-- Nur der Trigger darf die Funktion ausfuehren, kein Client. Der Insert
-- in auth.users laeuft unter supabase_auth_admin, deshalb dort explizit
-- erlauben.
revoke execute on function public.handle_new_user_keys() from public, anon, authenticated;
grant execute on function public.handle_new_user_keys() to supabase_auth_admin;

drop trigger if exists on_auth_user_created_keys on auth.users;
create trigger on_auth_user_created_keys
  after insert on auth.users
  for each row execute function public.handle_new_user_keys();
```

- [ ] **Step 2: Edge Function schreiben**

`supabase/functions/delete-account/deno.json`:

```json
{"nodeModulesDir":"auto"}
```

`supabase/functions/delete-account/index.ts`:

```ts
/**
 * delete-account — Supabase Edge Function
 * ─────────────────────────────────────────────────────────────
 * Loescht das Konto der anfragenden Nutzerin (Apple 5.1.1(v), Google
 * Play: Konto-Loeschung muss in der App moeglich sein). Der Client darf
 * auth.users nicht selbst loeschen; hier wird das Nutzer-Token geprueft
 * und mit Service-Role geloescht. public.user_keys faellt per Cascade.
 *
 * Keine Secrets im Code: SUPABASE_URL, SUPABASE_ANON_KEY und
 * SUPABASE_SERVICE_ROLE_KEY stellt die Laufzeit bereit.
 *
 * Deploy:
 *   supabase functions deploy delete-account
 */

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "unauthorized" }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return json({ error: "misconfigured" }, 500);

  // Wer ist das? Mit dem Nutzer-Token, nicht mit Service-Role.
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData?.user) return json({ error: "unauthorized" }, 401);

  const admin = createClient(url, serviceKey);
  const { error: deleteError } = await admin.auth.admin.deleteUser(userData.user.id);
  if (deleteError) {
    console.error("delete-account: Loeschung fehlgeschlagen", deleteError.message);
    return json({ error: "delete_failed" }, 500);
  }

  return json({ ok: true }, 200);
});
```

- [ ] **Step 3: Migration und Funktion ausrollen**

Voraussetzung: `supabase login` und `supabase link --project-ref zeflyivnxbmkyiacogzu` sind einmal gelaufen (`.temp/project-ref` existiert bereits).

Run: `supabase db push`
Expected: Migration `20260829090000_user_keys` wird angewendet. Bei Fehlermeldung zu fehlendem `auth`-Zugriff: Migration alternativ ueber das SQL-Editor-Fenster im Dashboard einspielen (Inhalt der Datei 1:1).

Run: `supabase functions deploy delete-account`
Expected: `Deployed Functions on project zeflyivnxbmkyiacogzu: delete-account`.

- [ ] **Step 4: Dashboard-Konfiguration (manuell, einmalig)**

Im Supabase-Dashboard, Projekt `zeflyivnxbmkyiacogzu`:

1. **Authentication > Providers > Email:** Enable Email provider: an. Confirm email: **an**. Secure email change: an. Minimum password length: 10.
2. **Authentication > URL Configuration > Redirect URLs** ergaenzen:
   - `mysuplea://auth/callback`
   - `exp://192.168.1.7:8081/--/auth/callback` (nur Entwicklung; bei anderer LAN-IP entsprechend, Wildcard `exp://192.168.1.*:8081/--/auth/callback` ist erlaubt)
3. **Authentication > Email Templates > Confirm signup und Reset password:** Standard belassen. Wichtig: Die Vorlagen nutzen `{{ .ConfirmationURL }}`, das ist die URL mit `redirect_to`.
4. **Settings > General:** Region notieren und in `docs/superpowers/specs/2026-08-29-account-grundlage-design.md` unter "Offener Punkt" nachtragen (Task 9 uebernimmt die Nennung in den Rechtstext).

- [ ] **Step 5: Smoke-Test der Funktion ohne Token**

Run: `curl -s -o /dev/null -w "%{http_code}\n" -X POST https://zeflyivnxbmkyiacogzu.supabase.co/functions/v1/delete-account -H "apikey: $(node -e "console.log(require('./scanConfig.js').SUPABASE_ANON_KEY)" 2>/dev/null || echo ANON)"`
Expected: `401` (Gateway oder Funktion lehnen ab). Falls `scanConfig.js` als ESM nicht per `require` ladbar ist, den Anon-Key von Hand aus der Datei kopieren.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260829090000_user_keys.sql supabase/functions/delete-account
git commit -m "feat(account): user_keys table with signup trigger and delete-account function"
```

---

### Task 6: Texte (DE/EN), Menuepunkt, Stack-Registrierung

**Files:**
- Create: `i18n/de/account.js`, `i18n/en/account.js`
- Modify: `i18n/de/index.js`, `i18n/en/index.js`
- Modify: `i18n/de/common.js`, `i18n/en/common.js` (je ein `nav.account`)
- Modify: `i18n/de/home.js`, `i18n/en/home.js` (je Titel und Untertitel)
- Modify: `app/(tabs)/(more)/menu.jsx`
- Modify: `app/(tabs)/(more)/_layout.jsx`

**Interfaces:**
- Produces: alle `account.*`-Schluessel, die Task 7 und 8 nutzen (Liste unten ist vollstaendig)

- [ ] **Step 1: Deutscher Katalog**

`i18n/de/account.js`:

```js
/**
 * i18n/de/account.js
 * Konto: Anmelden, Registrieren, Recovery-Key, Passwort-Reset, Loeschen
 * (app/(tabs)/(more)/account*.jsx, app/auth/callback.jsx).
 */

export default {
  'account.kicker': 'Konto',
  'account.title.anonymous': 'Ohne Konto nutzbar',
  'account.intro':
    'Diese App funktioniert vollständig ohne Konto. Ein Konto brauchst du nur, wenn du deine Daten später auf mehreren Geräten nutzen oder automatisch sichern willst. Gesundheitsdaten verlassen dein Gerät dann ausschließlich verschlüsselt: Der Schlüssel entsteht aus deinem Passwort und wird nie übertragen.',

  'account.mode.signIn': 'Anmelden',
  'account.mode.signUp': 'Konto anlegen',

  'account.field.email': 'E-Mail-Adresse',
  'account.field.password': 'Passwort',
  'account.field.passwordRepeat': 'Passwort wiederholen',
  'account.hint.password':
    'Mindestens 10 Zeichen. Das Passwort schützt nicht nur den Login, sondern auch deine Daten.',

  'account.action.signIn': 'Anmelden',
  'account.action.continue': 'Weiter',
  'account.action.forgot': 'Passwort vergessen?',
  'account.action.signOut': 'Abmelden',

  'account.busy.deriving': 'Schlüssel wird erzeugt. Das dauert einen Moment.',

  'account.error.title': 'Das hat nicht geklappt',
  'account.error.emailInvalid': 'Bitte eine gültige E-Mail-Adresse eingeben.',
  'account.error.passwordShort': 'Das Passwort braucht mindestens 10 Zeichen.',
  'account.error.passwordMismatch': 'Die Passwörter stimmen nicht überein.',
  'account.error.offline': 'Keine Verbindung. Prüfe dein Netz und versuche es erneut.',
  'account.error.credentials': 'Anmeldung nicht möglich. Prüfe E-Mail-Adresse und Passwort.',
  'account.error.generic': 'Unerwarteter Fehler: {message}',

  'account.confirmMail.title': 'Bestätige deine E-Mail-Adresse',
  'account.confirmMail.text':
    'Wir haben einen Link an {email} geschickt. Öffne ihn auf diesem Gerät, dann ist dein Konto aktiv.',

  'account.signedIn.title': 'Angemeldet',
  'account.signedIn.as': 'Angemeldet als {email}',
  'account.signedIn.keyReady': 'Datenschlüssel ist für diese Sitzung entsperrt.',
  'account.signedIn.keyLocked':
    'Datenschlüssel wird beim nächsten Anmelden mit Passwort entsperrt.',
  'account.signedIn.recoveryNote':
    'Dein Recovery-Key wurde beim Anlegen einmalig angezeigt. Ohne Passwort und ohne Recovery-Key sind synchronisierte Daten nicht wiederherstellbar. Daten auf diesem Gerät sind davon nicht betroffen.',
  'account.signedIn.syncNote':
    'Sync und Cloud-Backup folgen in einem späteren Update. Bis dahin liegt weiterhin alles nur auf diesem Gerät.',

  'account.delete.title': 'Konto löschen',
  'account.delete.text':
    'Löscht dein Konto und den verschlüsselten Schlüssel bei uns. Deine Daten auf diesem Gerät bleiben erhalten. Willst du auch die löschen: Einstellungen, Alle Daten löschen.',
  'account.delete.confirmTitle': 'Konto wirklich löschen?',
  'account.delete.confirmText': 'Das lässt sich nicht rückgängig machen. Lokale Daten bleiben.',
  'account.delete.confirm': 'Löschen',
  'account.delete.cancel': 'Abbrechen',
  'account.delete.done': 'Konto gelöscht',

  'account.recovery.kicker': 'Recovery-Key',
  'account.recovery.title': 'Einmal sichern, dann nie wieder sichtbar',
  'account.recovery.text':
    'Dieser Key entsperrt deine synchronisierten Daten, falls du dein Passwort vergisst. Er wird nur jetzt angezeigt und liegt nirgends sonst, auch nicht bei uns. Ohne Passwort und ohne diesen Key sind synchronisierte Daten weg.',
  'account.recovery.copy': 'Kopieren',
  'account.recovery.copied': 'In die Zwischenablage kopiert',
  'account.recovery.checkbox': 'Ich habe den Recovery-Key an einem sicheren Ort gespeichert.',
  'account.recovery.confirm': 'Konto anlegen',
  'account.recovery.cancel': 'Abbrechen',
  'account.recovery.newTitle': 'Dein neuer Recovery-Key',
  'account.recovery.newText':
    'Weil der alte Recovery-Key nicht vorlag, wurde ein neuer Schlüssel erzeugt. Bisher synchronisierte Daten sind damit nicht mehr lesbar. Sichere diesen Key jetzt.',
  'account.recovery.done': 'Fertig',

  'account.forgot.title': 'Passwort zurücksetzen',
  'account.forgot.text':
    'Wir schicken dir einen Link. Damit deine synchronisierten Daten lesbar bleiben, brauchst du danach deinen Recovery-Key.',
  'account.forgot.action': 'Link senden',
  'account.forgot.sent': 'Wenn zu {email} ein Konto existiert, ist ein Link unterwegs.',

  'account.reset.title': 'Neues Passwort setzen',
  'account.reset.text':
    'Mit deinem Recovery-Key bleiben synchronisierte Daten lesbar. Ohne ihn setzen wir einen neuen Schlüssel, und bisher synchronisierte Daten sind nicht mehr lesbar.',
  'account.reset.field.recoveryKey': 'Recovery-Key (optional)',
  'account.reset.recoveryPlaceholder': 'ABCD-EFGH-…',
  'account.reset.action': 'Passwort setzen',
  'account.reset.withoutKeyTitle': 'Ohne Recovery-Key fortfahren?',
  'account.reset.withoutKeyText':
    'Bisher synchronisierte Daten sind danach nicht mehr lesbar. Daten auf diesem Gerät bleiben.',
  'account.reset.withoutKeyConfirm': 'Fortfahren',
  'account.reset.wrongKey': 'Der Recovery-Key passt nicht. Prüfe die Eingabe.',
  'account.reset.done': 'Passwort gesetzt',

  'account.callback.title': 'Link wird geprüft',
  'account.callback.errorTitle': 'Link ungültig oder abgelaufen',
};
```

Wichtig: Der Platzhalter `…` in `account.reset.recoveryPlaceholder` ist ein Auslassungszeichen, kein Gedankenstrich.

- [ ] **Step 2: Englischer Katalog**

`i18n/en/account.js`:

```js
/**
 * i18n/en/account.js
 * Account: sign in, sign up, recovery key, password reset, deletion.
 */

export default {
  'account.kicker': 'Account',
  'account.title.anonymous': 'Works without an account',
  'account.intro':
    'This app works fully without an account. You only need one if you want to use your data on several devices later or back it up automatically. Health data then leaves your device encrypted only: the key is derived from your password and is never transmitted.',

  'account.mode.signIn': 'Sign in',
  'account.mode.signUp': 'Create account',

  'account.field.email': 'Email address',
  'account.field.password': 'Password',
  'account.field.passwordRepeat': 'Repeat password',
  'account.hint.password':
    'At least 10 characters. The password protects your data, not just the login.',

  'account.action.signIn': 'Sign in',
  'account.action.continue': 'Continue',
  'account.action.forgot': 'Forgot password?',
  'account.action.signOut': 'Sign out',

  'account.busy.deriving': 'Generating key. This takes a moment.',

  'account.error.title': 'That did not work',
  'account.error.emailInvalid': 'Please enter a valid email address.',
  'account.error.passwordShort': 'The password needs at least 10 characters.',
  'account.error.passwordMismatch': 'The passwords do not match.',
  'account.error.offline': 'No connection. Check your network and try again.',
  'account.error.credentials': 'Sign in not possible. Check email address and password.',
  'account.error.generic': 'Unexpected error: {message}',

  'account.confirmMail.title': 'Confirm your email address',
  'account.confirmMail.text':
    'We sent a link to {email}. Open it on this device to activate your account.',

  'account.signedIn.title': 'Signed in',
  'account.signedIn.as': 'Signed in as {email}',
  'account.signedIn.keyReady': 'Data key is unlocked for this session.',
  'account.signedIn.keyLocked': 'Data key will be unlocked at the next sign in with password.',
  'account.signedIn.recoveryNote':
    'Your recovery key was shown once when the account was created. Without password and without recovery key, synced data cannot be restored. Data on this device is not affected.',
  'account.signedIn.syncNote':
    'Sync and cloud backup follow in a later update. Until then everything still lives on this device only.',

  'account.delete.title': 'Delete account',
  'account.delete.text':
    'Deletes your account and the encrypted key on our side. Your data on this device stays. To delete that too: Settings, Delete all data.',
  'account.delete.confirmTitle': 'Really delete the account?',
  'account.delete.confirmText': 'This cannot be undone. Local data stays.',
  'account.delete.confirm': 'Delete',
  'account.delete.cancel': 'Cancel',
  'account.delete.done': 'Account deleted',

  'account.recovery.kicker': 'Recovery key',
  'account.recovery.title': 'Save it once, it will never be shown again',
  'account.recovery.text':
    'This key unlocks your synced data if you forget your password. It is shown only now and stored nowhere else, not even with us. Without password and without this key, synced data is gone.',
  'account.recovery.copy': 'Copy',
  'account.recovery.copied': 'Copied to clipboard',
  'account.recovery.checkbox': 'I have saved the recovery key in a safe place.',
  'account.recovery.confirm': 'Create account',
  'account.recovery.cancel': 'Cancel',
  'account.recovery.newTitle': 'Your new recovery key',
  'account.recovery.newText':
    'Because the old recovery key was not available, a new key was generated. Previously synced data can no longer be read. Save this key now.',
  'account.recovery.done': 'Done',

  'account.forgot.title': 'Reset password',
  'account.forgot.text':
    'We will send you a link. To keep your synced data readable you will need your recovery key afterwards.',
  'account.forgot.action': 'Send link',
  'account.forgot.sent': 'If an account exists for {email}, a link is on its way.',

  'account.reset.title': 'Set a new password',
  'account.reset.text':
    'With your recovery key, synced data stays readable. Without it we set a new key and previously synced data can no longer be read.',
  'account.reset.field.recoveryKey': 'Recovery key (optional)',
  'account.reset.recoveryPlaceholder': 'ABCD-EFGH-…',
  'account.reset.action': 'Set password',
  'account.reset.withoutKeyTitle': 'Continue without recovery key?',
  'account.reset.withoutKeyText':
    'Previously synced data will no longer be readable. Data on this device stays.',
  'account.reset.withoutKeyConfirm': 'Continue',
  'account.reset.wrongKey': 'The recovery key does not match. Check the input.',
  'account.reset.done': 'Password set',

  'account.callback.title': 'Checking link',
  'account.callback.errorTitle': 'Link invalid or expired',
};
```

- [ ] **Step 3: Kataloge registrieren**

In `i18n/de/index.js`: nach `import addSupplement from './addSupplement';` die Zeile `import account from './account';` einfuegen und im Export-Objekt nach `...stack,` die Zeile `...account,` ergaenzen. Dasselbe in `i18n/en/index.js`.

In `i18n/de/common.js` nach `'nav.settings': 'Einstellungen',` einfuegen:

```js
  'nav.account': 'Konto',
```

In `i18n/en/common.js` nach `'nav.settings': 'Settings',`:

```js
  'nav.account': 'Account',
```

In `i18n/de/home.js` vor der schliessenden `};` (nach dem `home.nav.settings.subtitle`-Eintrag):

```js
  'home.nav.account.title': 'Konto',
  'home.nav.account.subtitle': 'Optional. Grundlage für Sync und Backup auf mehreren Geräten.',
```

In `i18n/en/home.js` an derselben Stelle:

```js
  'home.nav.account.title': 'Account',
  'home.nav.account.subtitle': 'Optional. Basis for sync and backup across devices.',
```

- [ ] **Step 4: Menuepunkt und Stack**

In `app/(tabs)/(more)/menu.jsx`, Abschnitt `home.section.app`, VOR der `MenuRow` fuer `nav.notifications` einfuegen:

```jsx
        <MenuRow
          title={t('home.nav.account.title')}
          subtitle={t('home.nav.account.subtitle')}
          onPress={() => router.push('/account')}
        />
```

In `app/(tabs)/(more)/_layout.jsx` nach der `settings`-Zeile:

```jsx
      <Stack.Screen name="account" options={{ title: t('nav.account') }} />
      <Stack.Screen
        name="account-recovery"
        options={{ title: t('account.recovery.kicker'), headerBackVisible: false, gestureEnabled: false }}
      />
      <Stack.Screen name="account-reset" options={{ title: t('account.reset.title') }} />
```

Der Recovery-Screen sperrt Zurueck-Geste und Zurueck-Knopf: Verlassen geht nur ueber die zwei Knoepfe (Bestaetigen oder Abbrechen), sonst gaebe es einen Weg am Recovery-Key vorbei.

- [ ] **Step 5: Tests**

Run: `npm test 2>&1 | grep -A12 "i18n.test"`
Expected: `Kein Schlüssel existiert nur auf Englisch` ok, keine Platzhalter-Abweichung (`{email}`, `{message}` in beiden Sprachen gleich).

- [ ] **Step 6: Commit**

```bash
git add i18n app/\(tabs\)/\(more\)/menu.jsx app/\(tabs\)/\(more\)/_layout.jsx
git commit -m "feat(account): account copy in de/en, menu entry and stack routes"
```

---

### Task 7: Screens account.jsx und account-recovery.jsx

**Files:**
- Create: `app/(tabs)/(more)/account.jsx`
- Create: `app/(tabs)/(more)/account-recovery.jsx`

**Interfaces:**
- Consumes: `useAccountStore` (Task 4), `ACCOUNT_STATUS` (AccountStore.js), `isNetworkError` (AccountLogic.js), `PROVIDERS`, i18n-Schluessel (Task 6)

- [ ] **Step 1: account.jsx**

```jsx
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ACCOUNT_STATUS } from '../../../AccountStore';
import { isNetworkError, PROVIDERS } from '../../../AccountLogic';
import { useTranslation } from '../../../i18n';
import { colors, radius, space, surfaces, type } from '../../../theme';
import useAccountStore from '../../../useAccountStore';

const MIN_PASSWORD_LENGTH = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Konto-Screen. Zwei Zustaende: ohne Konto (Formular fuer Anmelden oder
 * Anlegen) und angemeldet (E-Mail, Schluesselstatus, Abmelden, Loeschen).
 * Keine Fachlogik hier: Validierung der Eingaben ja, alles andere macht
 * der Store.
 */
export default function AccountScreen() {
  const { t } = useTranslation();
  const status = useAccountStore((state) => state.status);

  if (status === ACCOUNT_STATUS.UNKNOWN) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return status === ACCOUNT_STATUS.SIGNED_IN ? <SignedInView t={t} /> : <AuthForm t={t} />;
}

// Fehler aus Supabase in eine Nutzermeldung uebersetzen. Login-Fehler
// bleiben absichtlich einheitlich (keine Unterscheidung E-Mail/Passwort).
function describeError(t, error, { credentials = false } = {}) {
  if (isNetworkError(error)) return t('account.error.offline');
  if (credentials) return t('account.error.credentials');
  return t('account.error.generic', { message: error?.message ?? '' });
}

function AuthForm({ t }) {
  const router = useRouter();
  const busy = useAccountStore((state) => state.busy);
  const prepareSignUp = useAccountStore((state) => state.prepareSignUp);
  const signIn = useAccountStore((state) => state.signIn);
  const requestPasswordReset = useAccountStore((state) => state.requestPasswordReset);

  const [mode, setMode] = useState('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [formError, setFormError] = useState(null);

  const emailProvider = PROVIDERS.find((p) => p.id === 'email' && p.available);
  if (!emailProvider) return null;

  const validate = () => {
    if (!EMAIL_PATTERN.test(email.trim())) return t('account.error.emailInvalid');
    if (password.length < MIN_PASSWORD_LENGTH) return t('account.error.passwordShort');
    if (mode === 'signUp' && password !== passwordRepeat) return t('account.error.passwordMismatch');
    return null;
  };

  const handleSubmit = async () => {
    const problem = validate();
    setFormError(problem);
    if (problem) return;

    try {
      if (mode === 'signUp') {
        await prepareSignUp(email, password);
        setPassword('');
        setPasswordRepeat('');
        router.push('/account-recovery');
      } else {
        await signIn(email, password);
        setPassword('');
      }
    } catch (error) {
      Alert.alert(t('account.error.title'), describeError(t, error, { credentials: mode === 'signIn' }));
    }
  };

  const handleForgot = () => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      setFormError(t('account.error.emailInvalid'));
      return;
    }
    Alert.alert(t('account.forgot.title'), t('account.forgot.text'), [
      { text: t('account.delete.cancel'), style: 'cancel' },
      {
        text: t('account.forgot.action'),
        onPress: async () => {
          try {
            await requestPasswordReset(email);
            Alert.alert(t('account.forgot.title'), t('account.forgot.sent', { email: email.trim() }));
          } catch (error) {
            Alert.alert(t('account.error.title'), describeError(t, error));
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>{t('account.kicker')}</Text>
        <Text style={styles.title}>{t('account.title.anonymous')}</Text>
        <Text style={styles.intro}>{t('account.intro')}</Text>

        <View style={styles.segment}>
          {['signIn', 'signUp'].map((value) => {
            const active = mode === value;
            return (
              <Pressable
                key={value}
                onPress={() => { setMode(value); setFormError(null); }}
                style={[styles.segmentItem, active ? styles.segmentItemActive : null]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.segmentText, active ? styles.segmentTextActive : null]}>
                  {t(value === 'signIn' ? 'account.mode.signIn' : 'account.mode.signUp')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t('account.field.email')}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            accessibilityLabel={t('account.field.email')}
          />

          <Text style={styles.label}>{t('account.field.password')}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType={mode === 'signUp' ? 'newPassword' : 'password'}
            accessibilityLabel={t('account.field.password')}
          />
          {mode === 'signUp' ? (
            <>
              <Text style={styles.hint}>{t('account.hint.password')}</Text>
              <Text style={styles.label}>{t('account.field.passwordRepeat')}</Text>
              <TextInput
                style={styles.input}
                value={passwordRepeat}
                onChangeText={setPasswordRepeat}
                secureTextEntry
                textContentType="newPassword"
                accessibilityLabel={t('account.field.passwordRepeat')}
              />
            </>
          ) : null}

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Pressable
            onPress={handleSubmit}
            disabled={busy}
            style={({ pressed }) => [styles.primaryButton, pressed || busy ? styles.buttonPressed : null]}
            accessibilityRole="button"
          >
            {busy ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {t(mode === 'signUp' ? 'account.action.continue' : 'account.action.signIn')}
              </Text>
            )}
          </Pressable>
          {busy && mode === 'signUp' ? <Text style={styles.hint}>{t('account.busy.deriving')}</Text> : null}

          {mode === 'signIn' ? (
            <Pressable onPress={handleForgot} style={styles.quietButton} accessibilityRole="button">
              <Text style={styles.quietButtonText}>{t('account.action.forgot')}</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SignedInView({ t }) {
  const email = useAccountStore((state) => state.email);
  const dataKey = useAccountStore((state) => state.dataKey);
  const busy = useAccountStore((state) => state.busy);
  const signOut = useAccountStore((state) => state.signOut);
  const deleteAccount = useAccountStore((state) => state.deleteAccount);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert(t('account.error.title'), describeError(t, error));
    }
  };

  const handleDelete = () => {
    Alert.alert(t('account.delete.confirmTitle'), t('account.delete.confirmText'), [
      { text: t('account.delete.cancel'), style: 'cancel' },
      {
        text: t('account.delete.confirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount();
            Alert.alert(t('account.delete.done'));
          } catch (error) {
            Alert.alert(t('account.error.title'), describeError(t, error));
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{t('account.kicker')}</Text>
      <Text style={styles.title}>{t('account.signedIn.title')}</Text>

      <View style={styles.card}>
        <Text style={styles.bodyStrong}>{t('account.signedIn.as', { email: email ?? '' })}</Text>
        <Text style={styles.body}>
          {t(dataKey ? 'account.signedIn.keyReady' : 'account.signedIn.keyLocked')}
        </Text>
        <Text style={styles.hint}>{t('account.signedIn.recoveryNote')}</Text>
        <Text style={styles.hint}>{t('account.signedIn.syncNote')}</Text>

        <Pressable
          onPress={handleSignOut}
          disabled={busy}
          style={({ pressed }) => [styles.quietButton, pressed ? styles.buttonPressed : null]}
          accessibilityRole="button"
        >
          <Text style={styles.quietButtonText}>{t('account.action.signOut')}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.bodyStrong}>{t('account.delete.title')}</Text>
        <Text style={styles.body}>{t('account.delete.text')}</Text>
        <Pressable
          onPress={handleDelete}
          disabled={busy}
          style={({ pressed }) => [styles.dangerButton, pressed ? styles.buttonPressed : null]}
          accessibilityRole="button"
        >
          <Text style={styles.dangerButtonText}>{t('account.delete.title')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { ...surfaces.screen },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { ...surfaces.content },
  kicker: { ...type.eyebrow, marginBottom: space.sm },
  title: { ...type.display, marginBottom: space.sm },
  intro: { ...type.body, marginBottom: space.lg },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    padding: 2,
    marginBottom: space.lg,
  },
  segmentItem: { flex: 1, paddingVertical: space.sm, borderRadius: radius.sm, alignItems: 'center' },
  segmentItemActive: { backgroundColor: colors.surface },
  segmentText: { ...type.small, color: colors.inkMuted },
  segmentTextActive: { color: colors.ink, fontWeight: '600' },
  card: { ...surfaces.card, marginBottom: space.lg },
  label: { ...type.label, marginTop: space.md, marginBottom: space.xs },
  input: { ...surfaces.input },
  hint: { ...type.tiny, marginTop: space.sm },
  body: { ...type.body, marginTop: space.sm },
  bodyStrong: { ...type.bodyStrong },
  formError: { ...type.small, color: colors.alert, marginTop: space.md },
  primaryButton: { ...surfaces.buttonPrimary, marginTop: space.lg },
  primaryButtonText: { ...surfaces.buttonPrimaryText },
  quietButton: { ...surfaces.buttonQuiet, marginTop: space.md },
  quietButtonText: { ...surfaces.buttonQuietText },
  dangerButton: {
    ...surfaces.buttonQuiet,
    marginTop: space.md,
    borderColor: colors.alert,
  },
  dangerButtonText: { ...surfaces.buttonQuietText, color: colors.alert },
  buttonPressed: { opacity: 0.6 },
});
```

Hinweis: Falls `surfaces.buttonQuiet` in `theme.js` keinen `borderColor` traegt, `dangerButton` ohne `borderColor` lassen und nur die Textfarbe setzen. Vorher `sed -n '228,236p' theme.js` pruefen.

- [ ] **Step 2: account-recovery.jsx**

Der Screen dient zwei Faellen: Signup (Bundle im `pendingSignUp`) und Reset ohne Recovery-Key (`pendingRecoveryKeyText`). Beide zeigen einen Key an, unterscheiden sich in Texten und Abschluss.

```jsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';

import { isNetworkError } from '../../../AccountLogic';
import { useTranslation } from '../../../i18n';
import { colors, radius, space, surfaces, type } from '../../../theme';
import useAccountStore from '../../../useAccountStore';

/**
 * Einmalige Anzeige des Recovery-Keys.
 *
 * Fall A (Signup): Der Key gehoert zum vorbereiteten Bundle. Erst nach
 * aktiver Bestaetigung ruft der Screen confirmSignUp(); Abbruch loescht
 * das Bundle, beim Server ist nichts passiert.
 *
 * Fall B (Reset ohne Key): Das Konto hat schon einen neuen Schluessel;
 * hier wird nur der neue Key gezeigt, Bestaetigung raeumt ihn weg.
 *
 * Zurueck-Geste und Header-Back sind im Stack deaktiviert; Verlassen nur
 * ueber die zwei Knoepfe.
 */
export default function AccountRecoveryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const busy = useAccountStore((state) => state.busy);
  const pendingSignUp = useAccountStore((state) => state.pendingSignUp);
  const pendingRecoveryKeyText = useAccountStore((state) => state.pendingRecoveryKeyText);
  const confirmSignUp = useAccountStore((state) => state.confirmSignUp);
  const cancelSignUp = useAccountStore((state) => state.cancelSignUp);
  const clearPendingRecoveryKey = useAccountStore((state) => state.clearPendingRecoveryKey);

  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const isReset = !pendingSignUp && Boolean(pendingRecoveryKeyText);
  const keyText = pendingSignUp?.bundle.recoveryKeyText ?? pendingRecoveryKeyText ?? null;

  // Kein Key vorhanden (z. B. Neustart mitten im Ablauf): zurueck. Im
  // Effekt, nicht im Render, sonst navigiert der Router waehrend des
  // Aufbaus.
  useEffect(() => {
    if (!keyText) router.replace('/account');
  }, [keyText, router]);

  if (!keyText) return null;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(keyText);
    setCopied(true);
  };

  const handleCancel = () => {
    cancelSignUp();
    router.replace('/account');
  };

  const handleConfirm = async () => {
    if (isReset) {
      clearPendingRecoveryKey();
      router.replace('/account');
      return;
    }
    try {
      const email = pendingSignUp.email;
      const result = await confirmSignUp();
      if (result.needsConfirmation) {
        Alert.alert(t('account.confirmMail.title'), t('account.confirmMail.text', { email }));
      }
      router.replace('/account');
    } catch (error) {
      Alert.alert(
        t('account.error.title'),
        isNetworkError(error) ? t('account.error.offline') : t('account.error.generic', { message: error?.message ?? '' })
      );
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{t('account.recovery.kicker')}</Text>
      <Text style={styles.title}>{t(isReset ? 'account.recovery.newTitle' : 'account.recovery.title')}</Text>
      <Text style={styles.body}>{t(isReset ? 'account.recovery.newText' : 'account.recovery.text')}</Text>

      <View style={styles.keyBox}>
        <Text style={styles.keyText} selectable accessibilityLabel={t('account.recovery.kicker')}>
          {keyText}
        </Text>
      </View>

      <Pressable onPress={handleCopy} style={styles.quietButton} accessibilityRole="button">
        <Text style={styles.quietButtonText}>
          {t(copied ? 'account.recovery.copied' : 'account.recovery.copy')}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setSaved((value) => !value)}
        style={styles.checkboxRow}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: saved }}
      >
        <View style={[styles.checkbox, saved ? styles.checkboxChecked : null]} />
        <Text style={styles.checkboxLabel}>{t('account.recovery.checkbox')}</Text>
      </Pressable>

      <Pressable
        onPress={handleConfirm}
        disabled={!saved || busy}
        style={[styles.primaryButton, !saved || busy ? styles.buttonDisabled : null]}
        accessibilityRole="button"
      >
        {busy ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={styles.primaryButtonText}>
            {t(isReset ? 'account.recovery.done' : 'account.recovery.confirm')}
          </Text>
        )}
      </Pressable>

      {isReset ? null : (
        <Pressable onPress={handleCancel} disabled={busy} style={styles.quietButton} accessibilityRole="button">
          <Text style={styles.quietButtonText}>{t('account.recovery.cancel')}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { ...surfaces.screen },
  content: { ...surfaces.content },
  kicker: { ...type.eyebrow, marginBottom: space.sm },
  title: { ...type.display, marginBottom: space.sm },
  body: { ...type.body, marginBottom: space.lg },
  keyBox: {
    ...surfaces.card,
    backgroundColor: colors.surfaceSunken,
    marginBottom: space.md,
  },
  keyText: {
    ...type.numeral,
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    color: colors.ink,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.lg },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.ruleStrong,
    marginRight: space.md,
  },
  checkboxChecked: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkboxLabel: { ...type.body, flex: 1, color: colors.ink },
  primaryButton: { ...surfaces.buttonPrimary, marginTop: space.lg },
  primaryButtonText: { ...surfaces.buttonPrimaryText },
  buttonDisabled: { opacity: 0.4 },
  quietButton: { ...surfaces.buttonQuiet, marginTop: space.md },
  quietButtonText: { ...surfaces.buttonQuietText },
});
```

Hinweis: Falls `type.numeral` in `theme.js` eine Schriftfamilie setzt, die keine Monospace ist, ist das in Ordnung; die Vierergruppen tragen die Lesbarkeit.

- [ ] **Step 3: Geraetetest in Expo Go**

Voraussetzung: `npm start` laeuft, Dashboard aus Task 5 ist konfiguriert.

1. Mehr > Konto: Intro-Text sichtbar, Umschalter Anmelden/Konto anlegen.
2. Konto anlegen mit Test-Adresse und Passwort unter 10 Zeichen: Fehlermeldung inline.
3. Mit gueltigem Passwort: Spinner mit "Schluessel wird erzeugt", danach Recovery-Screen. Zurueck-Geste greift nicht.
4. Abbrechen: zurueck auf Konto-Screen, kein Nutzer im Dashboard (Authentication > Users).
5. Nochmal, Kopieren, Checkbox, "Konto anlegen": Alert "Bestaetige deine E-Mail", Nutzer im Dashboard (unbestaetigt), Zeile in `user_keys` (Table Editor).
6. Anmelden VOR Bestaetigung: einheitliche Fehlermeldung.

Expected: alle sechs Punkte wie beschrieben. Punkt 5: `select user_id, kdf->>'name' from public.user_keys;` im SQL-Editor zeigt die Zeile mit `scrypt`.

- [ ] **Step 4: Commit**

```bash
git add app/\(tabs\)/\(more\)/account.jsx app/\(tabs\)/\(more\)/account-recovery.jsx
git commit -m "feat(account): account screen and one-time recovery key screen"
```

---

### Task 8: Deep-Link-Callback und Passwort-Reset-Screen

**Files:**
- Create: `app/auth/callback.jsx`
- Create: `app/(tabs)/(more)/account-reset.jsx`
- Modify: `app/_layout.jsx`

**Interfaces:**
- Consumes: `useAccountStore.handleAuthCallback(url) => type`, `completePasswordReset(newPassword, recoveryKeyText) => { dataLost, recoveryKeyText }`

- [ ] **Step 1: Callback-Route**

`app/auth/callback.jsx`:

```jsx
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

import { useTranslation } from '../../i18n';
import { colors, space, surfaces, type } from '../../theme';
import useAccountStore from '../../useAccountStore';

/**
 * Ziel der Bestaetigungs- und Reset-Links. Liest Tokens aus der URL,
 * setzt die Session und leitet weiter: type=recovery zum Reset-Screen,
 * sonst zum Konto. Die eigentliche Verarbeitung liegt in AccountLogic.
 *
 * Liegt ausserhalb des Onboarding-Gates (siehe app/_layout.jsx): Der
 * Link wird auf dem Geraet geoeffnet, auf dem das Konto angelegt wurde,
 * das Onboarding ist also durch. Falls nicht, faengt das Gate die
 * anschliessende Navigation ab.
 */
export default function AuthCallbackScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const url = Linking.useURL();
  const handled = useRef(false);
  const handleAuthCallback = useAccountStore((state) => state.handleAuthCallback);

  useEffect(() => {
    if (!url || handled.current) return;
    handled.current = true;

    handleAuthCallback(url)
      .then((type) => router.replace(type === 'recovery' ? '/account-reset' : '/account'))
      .catch((error) => {
        Alert.alert(t('account.callback.errorTitle'), error?.message ?? '');
        router.replace('/account');
      });
  }, [url, handleAuthCallback, router, t]);

  return (
    <View style={styles.screen}>
      <ActivityIndicator color={colors.accent} />
      <Text style={styles.text}>{t('account.callback.title')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { ...surfaces.screen, justifyContent: 'center', alignItems: 'center' },
  text: { ...type.body, marginTop: space.md },
});
```

- [ ] **Step 2: Root-Layout registriert die Route**

In `app/_layout.jsx` im `<Stack>` nach der `imprint`-Zeile:

```jsx
      {/* Ziel der Konto-Mails (Bestaetigung, Passwort-Reset). Ausserhalb
          der Gates, damit ein Link die App auch dann oeffnet, wenn der
          Store noch entscheidet. */}
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
```

- [ ] **Step 3: Reset-Screen**

`app/(tabs)/(more)/account-reset.jsx`:

```jsx
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { isNetworkError } from '../../../AccountLogic';
import { useTranslation } from '../../../i18n';
import { colors, space, surfaces, type } from '../../../theme';
import useAccountStore from '../../../useAccountStore';

const MIN_PASSWORD_LENGTH = 10;

/**
 * Neues Passwort nach dem Reset-Link. Mit Recovery-Key bleibt der
 * Datenschluessel erhalten; ohne wird nach Rueckfrage ein neuer erzeugt
 * und einmalig angezeigt (account-recovery.jsx, Fall B).
 */
export default function AccountResetScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const busy = useAccountStore((state) => state.busy);
  const completePasswordReset = useAccountStore((state) => state.completePasswordReset);

  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [formError, setFormError] = useState(null);

  const run = async (keyText) => {
    try {
      const result = await completePasswordReset(password, keyText);
      setPassword('');
      setPasswordRepeat('');
      if (result.recoveryKeyText) {
        router.replace('/account-recovery');
      } else {
        Alert.alert(t('account.reset.done'));
        router.replace('/account');
      }
    } catch (error) {
      if (isNetworkError(error)) {
        Alert.alert(t('account.error.title'), t('account.error.offline'));
      } else if (keyText) {
        // Falscher Key wirft in AccountCrypto.unwrapKey, bevor etwas
        // gespeichert wird. Eingabe pruefen lassen, nicht neu erzeugen.
        setFormError(t('account.reset.wrongKey'));
      } else {
        Alert.alert(t('account.error.title'), t('account.error.generic', { message: error?.message ?? '' }));
      }
    }
  };

  const handleSubmit = () => {
    if (password.length < MIN_PASSWORD_LENGTH) return setFormError(t('account.error.passwordShort'));
    if (password !== passwordRepeat) return setFormError(t('account.error.passwordMismatch'));
    setFormError(null);

    const keyText = recoveryKey.trim();
    if (keyText) return run(keyText);

    return Alert.alert(t('account.reset.withoutKeyTitle'), t('account.reset.withoutKeyText'), [
      { text: t('account.delete.cancel'), style: 'cancel' },
      { text: t('account.reset.withoutKeyConfirm'), style: 'destructive', onPress: () => run('') },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>{t('account.kicker')}</Text>
        <Text style={styles.title}>{t('account.reset.title')}</Text>
        <Text style={styles.body}>{t('account.reset.text')}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>{t('account.field.password')}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
            accessibilityLabel={t('account.field.password')}
          />
          <Text style={styles.hint}>{t('account.hint.password')}</Text>

          <Text style={styles.label}>{t('account.field.passwordRepeat')}</Text>
          <TextInput
            style={styles.input}
            value={passwordRepeat}
            onChangeText={setPasswordRepeat}
            secureTextEntry
            textContentType="newPassword"
            accessibilityLabel={t('account.field.passwordRepeat')}
          />

          <Text style={styles.label}>{t('account.reset.field.recoveryKey')}</Text>
          <TextInput
            style={styles.input}
            value={recoveryKey}
            onChangeText={setRecoveryKey}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder={t('account.reset.recoveryPlaceholder')}
            placeholderTextColor={colors.inkFaint}
            accessibilityLabel={t('account.reset.field.recoveryKey')}
          />

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Pressable
            onPress={handleSubmit}
            disabled={busy}
            style={({ pressed }) => [styles.primaryButton, pressed || busy ? styles.buttonPressed : null]}
            accessibilityRole="button"
          >
            {busy ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.primaryButtonText}>{t('account.reset.action')}</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { ...surfaces.screen },
  content: { ...surfaces.content },
  kicker: { ...type.eyebrow, marginBottom: space.sm },
  title: { ...type.display, marginBottom: space.sm },
  body: { ...type.body, marginBottom: space.lg },
  card: { ...surfaces.card },
  label: { ...type.label, marginTop: space.md, marginBottom: space.xs },
  input: { ...surfaces.input },
  hint: { ...type.tiny, marginTop: space.sm },
  formError: { ...type.small, color: colors.alert, marginTop: space.md },
  primaryButton: { ...surfaces.buttonPrimary, marginTop: space.lg },
  primaryButtonText: { ...surfaces.buttonPrimaryText },
  buttonPressed: { opacity: 0.6 },
});
```

- [ ] **Step 4: Bundle pruefen**

Run: `npx expo export --platform ios --output-dir node_modules/.cache/export-check > /dev/null && echo BUNDLE_OK`
Expected: `BUNDLE_OK`.

- [ ] **Step 5: Geraetetest in Expo Go (Mail-Links)**

Alle Schritte auf dem Handy, Mail-App auf demselben Geraet:

1. Bestaetigungs-Mail aus Task 7 oeffnen, Link antippen: Expo Go oeffnet sich, kurz "Link wird geprueft", dann Konto-Screen mit "Angemeldet als …", Datenschluessel gesperrt (erwartet, da noch kein Login mit Passwort).
2. Abmelden, Anmelden mit Passwort: "Datenschluessel ist fuer diese Sitzung entsperrt".
3. App komplett beenden, neu oeffnen, Mehr > Konto: weiterhin angemeldet, Schluessel gesperrt.
4. Abmelden, "Passwort vergessen?", Link senden, Mail oeffnen: Reset-Screen. Neues Passwort ohne Recovery-Key: Rueckfrage, bestaetigen, Recovery-Screen mit neuem Key, Fertig. Danach mit neuem Passwort anmelden: entsperrt.
5. Nochmal Reset, diesmal mit dem neuen Recovery-Key: kein Recovery-Screen, direkt "Passwort gesetzt". Anmelden mit dem neuesten Passwort: entsperrt.
6. Falscher Recovery-Key: Inline-Fehler "passt nicht", nichts geaendert.
7. Konto loeschen: Rueckfrage, danach anonym. Dashboard: Nutzer weg, `user_keys` leer.

Expected: alle sieben Punkte. Falls der Link Safari statt Expo Go oeffnet: Redirect-URL in Supabase mit der aktuellen `exp://`-Adresse vergleichen (`npx expo start` zeigt sie).

- [ ] **Step 6: Commit**

```bash
git add app/auth/callback.jsx app/\(tabs\)/\(more\)/account-reset.jsx app/_layout.jsx
git commit -m "feat(account): deep-link callback and password reset with recovery key"
```

---

### Task 9: Rechtstext (DE/EN) und Web-Seiten neu bauen

**Files:**
- Modify: `data/legalContent.js`
- Regenerate: `web/index.html`, `web/imprint.html` (via `npm run build:legal`)

**Interfaces:**
- Consumes: Region des Supabase-Projekts aus Task 5, Schritt 4

- [ ] **Step 1: PRIVACY_VERSION erhoehen**

```js
export const PRIVACY_VERSION = '2026-08-29';
```

- [ ] **Step 2: Deutsche Abschnitte**

`Grundprinzip` ersetzen durch:

```js
    {
      heading: 'Grundprinzip',
      body:
        'Diese App ist ohne Konto nutzbar. Alles, was du eingibst, bleibt auf deinem Gerät: deine Präparate, Einnahmen, dein Profil, deine Laborwerte und Beobachtungen. Es gibt keine Analyse- oder Werbedienste und kein Tracking. Ein Konto ist freiwillig und Grundlage für spätere Funktionen wie Sync und Cloud-Backup; was dabei übertragen wird, steht im Abschnitt Konto.',
    },
```

Nach dem Abschnitt `Erinnerungen` einfuegen (Region einsetzen, siehe Task 5):

```js
    {
      heading: 'Konto (freiwillig)',
      body:
        'Wenn du ein Konto anlegst, werden deine E-Mail-Adresse, ein Passwort-Hash und Zeitstempel bei unserem Auftragsverarbeiter Supabase gespeichert (Serverstandort: [REGION AUS DEM DASHBOARD EINSETZEN]). Zusätzlich liegt dort ein Datensatz mit verschlüsselten Schlüsseln: Dein Passwort wird auf dem Gerät in einen Schlüssel umgerechnet, der einen zufälligen Datenschlüssel verschlüsselt; ein zweiter, dir einmalig angezeigter Recovery-Key verschlüsselt denselben Datenschlüssel. Übertragen werden nur diese verschlüsselten Umschläge, nie dein Passwort, nie der Datenschlüssel, nie der Recovery-Key. Weder wir noch Supabase können damit Daten entschlüsseln. In dieser Version werden über das Konto keine Präparate, Laborwerte oder sonstigen Inhalte übertragen; kommt Sync hinzu, wird diese Erklärung vorher aktualisiert. Du kannst das Konto jederzeit in der App löschen; dabei werden Konto und Schlüsseldatensatz entfernt, deine lokalen Daten bleiben. Rechtsgrundlage: Vertrag (Art. 6 Abs. 1 lit. b DSGVO).',
    },
```

`Deine Rechte`: den Satz `Löschung: In den Einstellungen kannst du einzelne Einträge oder mit einem Schritt sämtliche Daten löschen; da die Daten nur auf deinem Gerät liegen, sind sie danach unwiederbringlich entfernt.` ersetzen durch:

```
Löschung: In den Einstellungen kannst du einzelne Einträge oder mit einem Schritt sämtliche lokalen Daten löschen; ein Konto löschst du im Bereich Konto. Beides ist danach unwiederbringlich.
```

`Was diese App nicht tut` ersetzen durch:

```js
    {
      heading: 'Was diese App nicht tut',
      body:
        'Keine Weitergabe an Dritte über die oben beschriebenen Auftragsverarbeiter hinaus, keine Werbung, kein Verkauf von Daten, kein Konto-Zwang, keine Cloud-Synchronisation in dieser Version. Beachte: Weil es noch keine Synchronisation gibt, bedeutet ein Gerätewechsel ohne Backup den Verlust deiner Daten.',
    },
```

- [ ] **Step 3: Englische Abschnitte**

`Core principle`:

```js
    {
      heading: 'Core principle',
      body:
        'This app can be used without an account. Everything you enter stays on your device: your products, intakes, profile, lab values and observations. There are no analytics or advertising services and no tracking. An account is optional and the basis for later features such as sync and cloud backup; what is transmitted for it is described in the Account section.',
    },
```

Nach `Reminders` einfuegen:

```js
    {
      heading: 'Account (optional)',
      body:
        'If you create an account, your email address, a password hash and timestamps are stored with our processor Supabase (server location: [INSERT REGION FROM DASHBOARD]). In addition, a record with encrypted keys is stored there: your password is converted on the device into a key that encrypts a random data key; a second recovery key, shown to you once, encrypts the same data key. Only these encrypted envelopes are transmitted, never your password, never the data key, never the recovery key. Neither we nor Supabase can decrypt data with them. In this version no products, lab values or other content are transmitted via the account; if sync is added, this statement will be updated beforehand. You can delete the account in the app at any time; account and key record are removed, your local data stays. Legal basis: contract (Art. 6(1)(b) GDPR).',
    },
```

`Your rights`: den Satz `Erasure: in the settings you can delete individual entries or all data in one step; since the data only lives on your device, it is irrevocably removed afterwards.` ersetzen durch:

```
Erasure: in the settings you can delete individual entries or all local data in one step; an account is deleted in the Account section. Both are irrevocable afterwards.
```

`What this app does not do`:

```js
    {
      heading: 'What this app does not do',
      body:
        'No sharing with third parties beyond the processors described above, no advertising, no sale of data, no mandatory account, no cloud sync in this version. Note: because there is no sync yet, changing devices without a backup means losing your data.',
    },
```

- [ ] **Step 4: Region einsetzen und Kopfkommentar ergaenzen**

Beide `[REGION …]`-Platzhalter durch die Region aus Task 5, Schritt 4 ersetzen (z. B. `EU, Frankfurt` oder `USA, Ost`). Im Kopfkommentar der Datei die Liste der Quellen ergaenzen: `AccountLogic.js, supabaseClient.js` nach `useStore.js`.

Run: `grep -n "REGION" data/legalContent.js`
Expected: keine Treffer.

- [ ] **Step 5: Web-Seiten neu bauen und testen**

Run: `npm run build:legal && npm test 2>&1 | grep -A8 "legal-site"`
Expected: `Committete Seiten aktuell` ok, PRIVACY_VERSION `2026-08-29` auf der Seite.

Run: `grep -c "—" data/legalContent.js`
Expected: `0` in den neuen Absaetzen (Kopfkommentar zaehlt nicht mit; wenn > 0, pruefen, ob nur Kommentarzeilen betroffen sind).

- [ ] **Step 6: Commit**

```bash
git add data/legalContent.js web/
git commit -m "docs(legal): describe optional account and key envelopes, bump privacy version"
```

---

### Task 10: Projektdoku nachziehen

**Files:**
- Modify: `CLAUDE.md`
- Modify: `docs/superpowers/specs/2026-08-29-account-grundlage-design.md` (Region nachtragen)

- [ ] **Step 1: CLAUDE.md, Architektur-Tabelle**

In der Tabelle unter "Fachlogik" nach der Zeile `NotificationScheduler.js` ergaenzen:

```
| `AccountCrypto.js` | Schluesselableitung (scrypt), Umschlaege (AES-GCM), Recovery-Key. Reine Kryptografie, randomBytes injiziert |
| `AccountLogic.js` | Konto-Ablaeufe gegen Supabase Auth mit uebergebenem Client: Signup, Login, Reset, Loeschung. Nie Passwort oder Klartext-Schluessel Richtung Netz |
| `AccountStore.js` | zustand-Factory fuer den Kontostand, getrennt vom Haupt-Store; `useAccountStore.js` bindet die echten Abhaengigkeiten |
```

Im Verzeichnisbaum unter `(more)/` die Screens `account.jsx, account-recovery.jsx, account-reset.jsx` ergaenzen und unter `app/` die Zeile `auth/callback.jsx  Ziel der Konto-Mails (Deep Link)`.

- [ ] **Step 2: CLAUDE.md, Datenhaltung**

Am Ende des Abschnitts "Datenhaltung" anfuegen:

```
**Konto (optional, seit 2026-08-29):** Supabase Auth ueber `supabaseClient.js`.
Die Session liegt ueber `secureStorage` verschluesselt im AsyncStorage. Beim
Signup entsteht auf dem Geraet ein Datenschluessel, der mit dem
Passwort-Schluessel und mit einem Recovery-Key umwickelt wird; nur die
Umschlaege gehen in `public.user_keys` (Trigger aus den Signup-Metadaten).
Der Datenschluessel lebt im Arbeitsspeicher des Konto-Stores und ist nach
einem Neustart weg. Konto-Loeschung ueber die Edge Function
`delete-account` (Store-Pflicht). Wer den Konto-Datenfluss aendert,
aendert `data/legalContent.js` mit.
```

- [ ] **Step 3: Spec-Nachtrag**

In der Spec unter "Offener Punkt" die verifizierte Region eintragen und den Satz "ist nicht verifiziert" streichen.

- [ ] **Step 4: Abschlusslauf**

Run: `npm test`
Expected: alle gruen.

Run: `git status --short`
Expected: nur die Spike-Dateien (`SpikePdfImport.js`, `babel.config.js`, `spike-pdf/`, `lab.jsx`-Knopf, `pdfjs-dist` in package.json) sind unversioniert. Sie gehoeren NICHT in diesen Commit.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md docs/superpowers/specs/2026-08-29-account-grundlage-design.md
git commit -m "docs: document account modules, data flow and verified region"
```

---

## Offen nach diesem Plan (bewusst nicht enthalten)

- Sign in with Apple: `PROVIDERS`-Eintrag auf `available: true`, `expo-apple-authentication`, Capability im Apple Developer Account.
- Universal Links (`https://mysuplea.app/auth/callback`), sobald die Domain steht.
- Teilprojekt 2: Sync und Cloud-Backup auf Basis des Datenschluessels.
- Teilprojekt 3: Zuordnung von Community-Scans.
- Spike-Dateien der PDF-Extraktion ueberfuehren oder zurueckrollen (unabhaengig vom Konto).
