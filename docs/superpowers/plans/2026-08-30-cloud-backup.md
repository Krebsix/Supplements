# Cloud-Backup mit Abgleich — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wer ein Konto hat, bekommt seinen Bestand nach einem Handywechsel zurueck: ein verschluesselter Stand je Konto auf Supabase, automatisch hochgeladen, beim Login wiederhergestellt; Supabase sieht weder Inhalte noch das Passwort.

**Architecture:** Kryptografie und Entscheidungen liegen in reinen Modulen (`AccountCrypto.js`, `CloudBackup.js`, `CloudBackupStore.js`-Factory), die echten Abhaengigkeiten werden in `use*Store.js` gebunden. Der Haupt-Store bleibt die Wahrheit; das Backup ist `buildBackupPayload(state)` als AES-GCM-Ciphertext in `public.user_backups`. Der Datenschluessel wandert in den Geraete-Schluesselbund, das Anmelde-Passwort wird aus dem Passwort abgeleitet (Supabase sieht nie den Klartext).

**Tech Stack:** Expo SDK 54, React Native, zustand (+persist), @noble/hashes (scrypt), @noble/ciphers (AES-GCM), expo-secure-store, expo-device, Supabase (Postgres + RLS), Tests via `npm test` (esbuild + Node).

**Spec:** `docs/superpowers/specs/2026-08-30-cloud-backup-design.md`

## Global Constraints

- Server erhaelt nur Ciphertext, Geraetename, Zeitstempel. Keine Klartext-Zaehler, keine Klartext-Felder aus dem Bestand.
- Datenschluessel und Klartext-Passwort verlassen das Geraet nie. An Supabase Auth geht ausschliesslich `deriveAuthPassword(password)`.
- Umschlaege in `user_keys` bleiben wie heute (Passwort-Umschlag aus `password` + `kdf_salt`, Recovery-Umschlag); `kdf.auth = 'scrypt-v1'` kommt hinzu.
- Fachlogik in Modulen, nie in Screens; Stores per Factory mit injizierten Abhaengigkeiten, in Node testbar.
- `importBackup()` darf keinen Upload ausloesen; Wiederherstellen setzt `lastUploadedAt` auf den Server-Stand.
- Keine Hex-Werte, keine Emojis, keine Gedankenstriche ("—") in Nutzertexten DE/EN; EN ohne cure/heals/treats/boosts/recommended/you should. Jeder i18n-Schluessel in DE und EN.
- Wer den Datenfluss aendert, aendert `data/legalContent.js` mit (Task 7). `PRIVACY_VERSION` wird `'2026-09-01'`.
- Deutsche Code-Kommentare, Conventional Commits, `npm test` gruen nach jedem Task. Nicht pushen, keine Supabase-Deploys (Migration wird nur geschrieben; `supabase db push` macht der Controller nach Freigabe).

---

### Task 1: AccountCrypto: Anmelde-Ableitung und Text-Verschluesselung

**Files:**
- Modify: `AccountCrypto.js`
- Modify: `tests/account-crypto.test.mjs` (Abschnitte anhaengen)

**Interfaces:**
- Consumes: `deriveKeyFromPassword`, `gcm`, `utf8ToBytes`, `bytesToHex`, `hexToBytes` (bereits im Modul).
- Produces:
  - `AUTH_SALT` (Uint8Array, 16 Bytes, `utf8ToBytes('mysuplea-auth-v1')`)
  - `AUTH_SCHEME = 'scrypt-v1'`
  - `deriveAuthPassword(password) => Promise<string>` (64 Hex-Zeichen)
  - `encryptText(text, key, randomBytes) => Promise<string>` (Format `nonce:ciphertext`, hex)
  - `decryptText(sealed, key) => string` (wirft bei falschem Schluessel oder Format)
  - `createKeyBundle` und `rewrapWithPassword` schreiben `kdf: { ...KDF_PARAMS, auth: AUTH_SCHEME }`

- [ ] **Step 1: Failing tests anhaengen**

Am Ende von `tests/account-crypto.test.mjs`, VOR dem abschliessenden `if (failures > 0)`-Block (den Block dort belassen), einfuegen. Die Datei importiert bereits aus `../AccountCrypto`; die Import-Zeile um `AUTH_SCHEME, AUTH_SALT, decryptText, deriveAuthPassword, encryptText` ergaenzen (alphabetisch einsortieren).

```js
console.log('— deriveAuthPassword —');
{
  const a = await deriveAuthPassword('korrektes-pferd-batterie');
  const b = await deriveAuthPassword('korrektes-pferd-batterie');
  const c = await deriveAuthPassword('korrektes-pferd-batterie!');
  check('deterministisch', a === b);
  check('64 Hex-Zeichen', /^[0-9a-f]{64}$/.test(a));
  check('anderes Passwort, anderer Wert', a !== c);
  check('enthaelt das Passwort nicht', !a.includes('pferd'));
  check('AUTH_SALT hat 16 Bytes', AUTH_SALT instanceof Uint8Array && AUTH_SALT.length === 16);
  // Umschlag-Schluessel und Anmelde-Schluessel muessen verschieden sein,
  // sonst koennte Supabase mit dem Anmelde-Wert den Umschlag oeffnen.
  const bundle = await createKeyBundle('korrektes-pferd-batterie', randomBytes);
  const wrapKeyHex = bytesToHex(await deriveKeyFromPassword('korrektes-pferd-batterie', hexToBytes(bundle.record.kdf_salt)));
  check('Anmelde-Schluessel ungleich Umschlag-Schluessel', a !== wrapKeyHex);
  check('createKeyBundle markiert kdf.auth', bundle.record.kdf.auth === AUTH_SCHEME);
  const rewrapped = await rewrapWithPassword(bundle.record, bundle.dataKey, 'neues-passwort-1234', randomBytes);
  check('rewrapWithPassword markiert kdf.auth', rewrapped.kdf.auth === AUTH_SCHEME);
  let threw = false;
  try { await deriveAuthPassword(''); } catch { threw = true; }
  check('leeres Passwort wirft', threw);
}

console.log('— encryptText / decryptText —');
{
  const key = await randomBytes(32);
  const text = '{"schema":"supplement-os-backup","version":1,"data":{"labValues":[{"v":"ü"}]}}';
  const sealed = await encryptText(text, key, randomBytes);
  check('Format nonce:ciphertext hex', /^[0-9a-f]{24}:[0-9a-f]+$/.test(sealed));
  check('Rundtrip inkl. Umlaut', decryptText(sealed, key) === text);
  const sealed2 = await encryptText(text, key, randomBytes);
  check('neuer Nonce je Aufruf', sealed !== sealed2);
  const other = await randomBytes(32);
  let wrongKeyThrew = false;
  try { decryptText(sealed, other); } catch { wrongKeyThrew = true; }
  check('falscher Schluessel wirft', wrongKeyThrew);
  let badFormatThrew = false;
  try { decryptText('kein-doppelpunkt', key); } catch { badFormatThrew = true; }
  check('kaputtes Format wirft', badFormatThrew);
  check('leerer Text geht', decryptText(await encryptText('', key, randomBytes), key) === '');
}
```

Falls die Testdatei `bytesToHex`/`hexToBytes`/`deriveKeyFromPassword`/`rewrapWithPassword` noch nicht importiert: aus `@noble/hashes/utils.js` bzw. `../AccountCrypto` ergaenzen. Falls die Datei kein Top-Level-`await` nutzt, die Bloecke in die vorhandene async-Struktur einbetten (Datei zuerst lesen).

- [ ] **Step 2: Test laufen lassen, Fehlschlag sehen**

Run: `npm test 2>&1 | grep -A2 "account-crypto"`
Expected: Bundling-Fehler wegen fehlender Exporte (`deriveAuthPassword`).

- [ ] **Step 3: Implementieren**

In `AccountCrypto.js`:

Import ergaenzen: `import { bytesToHex, bytesToUtf8, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';` (falls `bytesToUtf8` in der installierten Version fehlt: `new TextDecoder().decode(bytes)` verwenden, mit Kommentar).

Nach `KDF_PARAMS` einfuegen:

```js
/**
 * Anmelde-Ableitung (Bitwarden-Muster, Spec Entscheidung 5): Supabase Auth
 * bekommt nie das Klartext-Passwort, sondern scrypt(passwort, AUTH_SALT)
 * als Hex. Das Salz ist app-weit fest und NICHT aus der E-Mail abgeleitet:
 * Ein E-Mail-Salz wuerde beim E-Mail-Wechsel ein Passwort-Update vor der
 * Bestaetigung erzwingen (Supabase "secure email change").
 * Der Umschlag-Schluessel (deriveKeyFromPassword mit kdf_salt) bleibt
 * davon getrennt; beide Werte sind aus dem jeweils anderen nicht ableitbar.
 */
export const AUTH_SALT = utf8ToBytes('mysuplea-auth-v1');
export const AUTH_SCHEME = 'scrypt-v1';

export async function deriveAuthPassword(password) {
  const key = await deriveKeyFromPassword(password, AUTH_SALT);
  return bytesToHex(key);
}
```

Nach `unwrapKey` einfuegen:

```js
/**
 * AES-256-GCM ueber beliebigen Text (Cloud-Backup). Gleiches Format wie
 * die Umschlaege: nonce:ciphertext, beides hex, neuer Nonce je Aufruf.
 */
export async function encryptText(text, key, randomBytes) {
  const nonce = await randomBytes(NONCE_LENGTH);
  const sealed = gcm(key, nonce).encrypt(utf8ToBytes(String(text ?? '')));
  return `${bytesToHex(nonce)}:${bytesToHex(sealed)}`;
}

export function decryptText(sealedText, key) {
  const [nonceHex, sealedHex] = String(sealedText ?? '').split(':');
  if (!nonceHex || !sealedHex) throw new Error('AccountCrypto: unlesbares Format');
  // decrypt wirft, wenn Tag oder Schluessel nicht passen.
  const plain = gcm(key, hexToBytes(nonceHex)).decrypt(hexToBytes(sealedHex));
  return bytesToUtf8(plain);
}
```

In `createKeyBundle` und `rewrapWithPassword`: `kdf: { ...KDF_PARAMS }` → `kdf: { ...KDF_PARAMS, auth: AUTH_SCHEME }`.

- [ ] **Step 4: Tests gruen**

Run: `npm test`
Expected: `account-crypto` komplett `ok`, `ALLE TESTS BESTANDEN`. Hinweis: `unlockWithPassword` uebergibt `record.kdf` als params an scrypt; das zusaetzliche Feld `auth` stoert nicht (nur N, r, p, dkLen werden gelesen), Test `Rundtrip Passwort` bleibt gruen.

- [ ] **Step 5: Commit**

```bash
git add AccountCrypto.js tests/account-crypto.test.mjs
git commit -m "feat(account): Anmelde-Ableitung und Text-Verschluesselung in AccountCrypto"
```

---

### Task 2: AccountLogic: Supabase sieht das Passwort nie

**Files:**
- Modify: `AccountLogic.js` (`signUpWithEmail`, `signInWithEmail`, `completePasswordReset`, `changePassword`)
- Modify: `tests/account-logic.test.mjs`

**Interfaces:**
- Consumes: `deriveAuthPassword` (Task 1).
- Produces: unveraenderte Signaturen; intern geht `authPassword` an Supabase.

- [ ] **Step 1: Failing test anhaengen**

In `tests/account-logic.test.mjs` (Fake-Client `makeClient` zeichnet `calls` auf) vor dem Abschluss-Block einfuegen; `deriveAuthPassword` aus `../AccountCrypto` importieren:

```js
console.log('— Haertung: Klartext-Passwort verlaesst das Geraet nie —');
{
  const password = 'korrektes-pferd-batterie';
  const expected = await deriveAuthPassword(password);
  const bundle = await createKeyBundle(password, randomBytes);

  const c1 = makeClient();
  await signUpWithEmail(c1, { email: 'a@b.de', password, record: bundle.record }, 'mysuplea://auth/callback');
  const signUpArgs = c1.calls.find(([n]) => n === 'signUp')[1];
  check('signUp: abgeleitetes Passwort', signUpArgs.password === expected);
  check('signUp: Klartext nirgends', JSON.stringify(c1.calls).includes(password) === false);
  check('signUp: Record traegt kdf.auth', signUpArgs.options.data.key_record.kdf.auth === 'scrypt-v1');

  const c2 = makeClient({ keyRecord: bundle.record });
  const signedIn = await signInWithEmail(c2, { email: 'a@b.de', password });
  const signInArgs = c2.calls.find(([n]) => n === 'signIn')[1];
  check('signIn: abgeleitetes Passwort', signInArgs.password === expected);
  check('signIn: Datenschluessel trotzdem entsperrt', signedIn.dataKey && signedIn.dataKey.length === 32);

  const c3 = makeClient({ keyRecord: bundle.record });
  await changePassword(c3, { userId: 'u1', currentPassword: password, newPassword: 'neues-passwort-1234', randomBytes });
  const upd = c3.calls.find(([n]) => n === 'updateUser')[1];
  check('changePassword: abgeleitetes neues Passwort', upd.password === await deriveAuthPassword('neues-passwort-1234'));
  check('changePassword: Klartext nirgends', !JSON.stringify(c3.calls).includes('neues-passwort-1234'));

  const c4 = makeClient({ keyRecord: bundle.record });
  await completePasswordReset(c4, { userId: 'u1', newPassword: 'reset-passwort-1234', recoveryKeyText: bundle.recoveryKeyText, randomBytes });
  const upd4 = c4.calls.find(([n]) => n === 'updateUser')[1];
  check('reset: abgeleitetes neues Passwort', upd4.password === await deriveAuthPassword('reset-passwort-1234'));
  check('reset: Klartext nirgends', !JSON.stringify(c4.calls).includes('reset-passwort-1234'));
}
```

Falls `makeClient` den `upsert`-Aufruf nicht in `calls` protokolliert, ist das fuer diesen Test egal. Falls `changePassword`/`completePasswordReset`/`createKeyBundle`/`randomBytes` in der Datei anders heissen: Datei lesen und angleichen.

- [ ] **Step 2: Fehlschlag sehen**

Run: `npm test 2>&1 | grep -B1 -A1 "FAIL" | head -20`
Expected: `signUp: abgeleitetes Passwort` FAIL (Klartext wird gesendet).

- [ ] **Step 3: Implementieren**

In `AccountLogic.js` importieren: `import { createKeyBundle, deriveAuthPassword, rewrapWithPassword, unlockWithPassword, unlockWithRecoveryKey } from './AccountCrypto';` (bestehende Import-Zeile ergaenzen).

- `signUpWithEmail`: vor dem `client.auth.signUp` `const authPassword = await deriveAuthPassword(password);` und `password: authPassword` uebergeben. Kommentar: `// Haertung (Spec 5): Supabase Auth bekommt nur den abgeleiteten Wert.`
- `signInWithEmail`: `const authPassword = await deriveAuthPassword(password);` → `signInWithPassword({ email, password: authPassword })`; `unlockWithPassword(record, password)` bleibt mit dem Klartext.
- `completePasswordReset`: `unwrap(await client.auth.updateUser({ password: await deriveAuthPassword(newPassword) }));`
- `changePassword`: dito fuer `newPassword`.

- [ ] **Step 4: Tests gruen**

Run: `npm test`
Expected: `ALLE TESTS BESTANDEN`.

- [ ] **Step 5: Commit**

```bash
git add AccountLogic.js tests/account-logic.test.mjs
git commit -m "feat(account): Anmelde-Passwort aus dem Passwort abgeleitet, Klartext bleibt auf dem Geraet"
```

---

### Task 3: Datenschluessel im Schluesselbund

**Files:**
- Modify: `AccountStore.js` (neue Abhaengigkeit `keyStore`, Helfer `setDataKey`)
- Modify: `useAccountStore.js` (Bindung an expo-secure-store)
- Modify: `tests/account-store.test.mjs`
- Modify: `i18n/de/account.js`, `i18n/en/account.js` (`account.signedIn.keyLocked` Text)

**Interfaces:**
- Consumes: `bytesToHex`, `hexToBytes` aus `@noble/hashes/utils.js`.
- Produces: `createAccountStore({ ..., keyStore })` mit `keyStore = { save(hex), load() => hex|null, clear() }` (alle async, Default no-op). Store-Feld `dataKey` ist nach `initialize()` mit Session gefuellt, wenn der Schluesselbund einen Wert hat.

- [ ] **Step 1: Failing tests anhaengen**

In `tests/account-store.test.mjs` vor dem Abschluss-Block:

```js
console.log('— keyStore: Datenschluessel im Schluesselbund —');
{
  const makeKeyStore = () => {
    let value = null;
    const log = [];
    return {
      log,
      get value() { return value; },
      save: async (hex) => { value = hex; log.push(['save', hex]); },
      load: async () => { log.push(['load']); return value; },
      clear: async () => { value = null; log.push(['clear']); },
    };
  };

  // signIn speichert, signOut loescht
  const client = makeClient();
  const keyStore = makeKeyStore();
  const store = createAccountStore({ ...deps(client), keyStore });
  await store.getState().prepareSignUp('a@b.de', 'korrektes-pferd-batterie');
  await store.getState().confirmSignUp();
  await store.getState().signIn('a@b.de', 'korrektes-pferd-batterie');
  await new Promise((resolve) => setTimeout(resolve, 0));
  check('signIn speichert den Schluessel', typeof keyStore.value === 'string' && keyStore.value.length === 64);
  check('gespeicherter Wert entspricht dataKey', keyStore.value === bytesToHex(store.getState().dataKey));
  await store.getState().signOut();
  await new Promise((resolve) => setTimeout(resolve, 0));
  check('signOut loescht den Schluessel', keyStore.value === null);
  check('signOut leert dataKey im Store', store.getState().dataKey === null);

  // initialize mit Session laedt den Schluessel
  const client2 = makeClient();
  const keyStore2 = makeKeyStore();
  await keyStore2.save('ab'.repeat(32));
  client2.emit('SIGNED_IN', { access_token: 'at', user: { id: 'u1', email: 'a@b.de' } });
  const store2 = createAccountStore({ ...deps(client2), keyStore: keyStore2 });
  await store2.getState().initialize();
  await new Promise((resolve) => setTimeout(resolve, 0));
  check('initialize laedt den Schluessel aus dem Schluesselbund', store2.getState().dataKey && bytesToHex(store2.getState().dataKey) === 'ab'.repeat(32));

  // initialize ohne Session raeumt den Schluesselbund
  const client3 = makeClient();
  const keyStore3 = makeKeyStore();
  await keyStore3.save('cd'.repeat(32));
  const store3 = createAccountStore({ ...deps(client3), keyStore: keyStore3 });
  await store3.getState().initialize();
  await new Promise((resolve) => setTimeout(resolve, 0));
  check('ohne Session wird der Schluesselbund geleert', keyStore3.value === null);

  // SIGNED_OUT-Ereignis (Token abgelaufen) loescht ebenfalls
  const client4 = makeClient();
  const keyStore4 = makeKeyStore();
  const store4 = createAccountStore({ ...deps(client4), keyStore: keyStore4 });
  await store4.getState().initialize();
  await store4.getState().prepareSignUp('a@b.de', 'korrektes-pferd-batterie');
  await store4.getState().confirmSignUp();
  await store4.getState().signIn('a@b.de', 'korrektes-pferd-batterie');
  await new Promise((resolve) => setTimeout(resolve, 0));
  client4.emit('SIGNED_OUT', null);
  await new Promise((resolve) => setTimeout(resolve, 0));
  check('SIGNED_OUT leert den Schluesselbund', keyStore4.value === null);

  // Ohne keyStore laeuft alles wie bisher (Default no-op)
  const client5 = makeClient();
  const store5 = createAccountStore(deps(client5));
  await store5.getState().initialize();
  check('ohne keyStore kein Fehler', store5.getState().status === ACCOUNT_STATUS.ANONYMOUS);
}
```

`bytesToHex` aus `@noble/hashes/utils.js` importieren. Hinweis: In `makeClient` merkt `emit` die Session, damit `getSession` sie liefert; falls `emit` vor dem Anlegen des Stores keinen Listener hat, setzt es trotzdem `session` (siehe Fake).

- [ ] **Step 2: Fehlschlag sehen**

Run: `npm test 2>&1 | grep FAIL | head`
Expected: `signIn speichert den Schluessel` FAIL.

- [ ] **Step 3: Implementieren**

`AccountStore.js`:

```js
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';

// Schluesselbund-Adapter (Spec Entscheidung 4). Default no-op, damit
// Tests und aeltere Aufrufer ohne ihn laufen.
const NOOP_KEY_STORE = { save: async () => {}, load: async () => null, clear: async () => {} };
```

In `createAccountStore({ ..., onSessionChange = () => {}, keyStore = NOOP_KEY_STORE })`.

Innerhalb der Factory, nach `applySession`:

```js
    // Datenschluessel setzen UND im Schluesselbund spiegeln. Fehler des
    // Schluesselbunds blockieren nie die Konto-Aktion (nur Log): Ohne
    // gespeicherten Schluessel entfaellt das automatische Backup bis zum
    // naechsten Login, mehr nicht.
    const setDataKey = (dataKey) => {
      set({ dataKey: dataKey ?? null });
      const op = dataKey ? keyStore.save(bytesToHex(dataKey)) : keyStore.clear();
      Promise.resolve(op).catch((error) => console.error('[Account] Schluesselbund', error));
    };
```

- In `applySession`: im `else`-Zweig (keine Session) nach `set({ ...ANONYMOUS_STATE })` → `Promise.resolve(keyStore.clear()).catch(() => {});`
- `initialize`: nach `applySession(session)`: 
  ```js
        if (session?.user) {
          const hex = await keyStore.load().catch(() => null);
          if (typeof hex === 'string' && /^[0-9a-f]{64}$/.test(hex)) set({ dataKey: hexToBytes(hex) });
        }
  ```
- Alle `set({ dataKey: ... })`-Stellen (confirmSignUp ohne Bestaetigung, signIn, completePasswordReset, changePassword) durch `setDataKey(...)` ersetzen; bei `completePasswordReset` die uebrigen Felder in einem separaten `set` belassen.
- `signOut` und `deleteAccount`: `applySession(null)` deckt `clear` ab.

`useAccountStore.js`:

```js
import * as SecureStore from 'expo-secure-store';

// Datenschluessel im iOS-Keychain / Android-Keystore, dieselbe Schutzklasse
// wie der Schluessel des lokalen Speichers (secureStorage.js).
const DATA_KEY_NAME = 'mysuplea-account-data-key-v1';
const keyStore = {
  save: (hex) => SecureStore.setItemAsync(DATA_KEY_NAME, hex, SECURE_OPTIONS),
  load: () => SecureStore.getItemAsync(DATA_KEY_NAME, SECURE_OPTIONS),
  clear: () => SecureStore.deleteItemAsync(DATA_KEY_NAME, SECURE_OPTIONS),
};
```

`SECURE_OPTIONS`: dieselben Optionen wie in `secureStorage.js` (dort nachlesen; falls dort keine Optionen uebergeben werden, `{ keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }` verwenden und in `secureStorage.js` NICHT aendern). `keyStore` an `createAccountStore` uebergeben.

i18n: `account.signedIn.keyLocked` DE → `'Datenschlüssel ist auf diesem Gerät nicht hinterlegt. Melde dich einmal ab und wieder an, dann ist das Cloud-Backup verfügbar.'`, EN → `'The data key is not stored on this device. Sign out and back in once, then cloud backup is available.'`

- [ ] **Step 4: Tests gruen**

Run: `npm test`
Expected: `ALLE TESTS BESTANDEN`.

- [ ] **Step 5: Commit**

```bash
git add AccountStore.js useAccountStore.js tests/account-store.test.mjs i18n/de/account.js i18n/en/account.js
git commit -m "feat(account): Datenschluessel im Geraete-Schluesselbund"
```

---

### Task 4: CloudBackup.js (rein) und Migration

**Files:**
- Create: `CloudBackup.js`
- Create: `tests/cloud-backup.test.mjs`
- Create: `supabase/migrations/20260830150000_user_backups.sql`

**Interfaces:**
- Consumes: `encryptText`, `decryptText` (Task 1); `buildBackupPayload`, `parseBackupPayload`, `BACKUP_VERSION` aus `BackupManager.js`.
- Produces:
  - `hasLocalData(state) => boolean`
  - `countsOf(data) => { supplements, labValues, intakeLogs }`
  - `encryptBackup(state, dataKey, randomBytes, exportedAt?) => Promise<{ ciphertext, payloadVersion, exportedAt }>`
  - `decryptBackup(ciphertext, dataKey) => { data, exportedAt }` (wirft `error.code = 'wrongKey' | 'invalidJson' | 'wrongSchema' | 'newerVersion' | 'missingData'`)
  - `decideOnLogin({ remote, localHasData, lastUploadedAt }) => 'none' | 'restore' | 'ask' | 'upload'`
  - `REMOTE_COLUMNS = 'ciphertext,payload_version,device_label,exported_at,updated_at'`

- [ ] **Step 1: Failing test**

`tests/cloud-backup.test.mjs`:

```js
// Tests fuer CloudBackup.js: Rundtrip, Zaehler, Login-Entscheidung.
import { webcrypto } from 'node:crypto';
import {
  countsOf,
  decideOnLogin,
  decryptBackup,
  encryptBackup,
  hasLocalData,
  REMOTE_COLUMNS,
} from '../CloudBackup';
import { BACKUP_VERSION } from '../BackupManager';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}
const randomBytes = async (n) => webcrypto.getRandomValues(new Uint8Array(n));

const state = {
  userSupplements: [
    { id: 'user-1', name: 'Magnesium', status: 'active' },
    { id: 'user-2', name: 'Alt', status: 'archived' },
  ],
  intakeLogs: [{ id: 'log-1' }],
  labValues: [{ id: 'lab-1', name: 'Ferritin', value: '35' }],
  profile: { displayName: 'Nadine' },
  language: 'de',
};

console.log('— hasLocalData / countsOf —');
check('leer → false', hasLocalData({}) === false);
check('nur Logs → true', hasLocalData({ intakeLogs: [{}] }) === true);
check('Praeparate → true', hasLocalData(state) === true);
const counts = countsOf(state);
check('zaehlt aktive Praeparate', counts.supplements === 1);
check('zaehlt Laborwerte', counts.labValues === 1);
check('zaehlt Logs', counts.intakeLogs === 1);
check('countsOf(undefined) → Nullen', countsOf(undefined).supplements === 0);

console.log('— encryptBackup / decryptBackup —');
{
  const key = await randomBytes(32);
  const sealed = await encryptBackup(state, key, randomBytes, new Date('2026-08-30T12:00:00.000Z'));
  check('exportedAt uebernommen', sealed.exportedAt === '2026-08-30T12:00:00.000Z');
  check('payloadVersion = BACKUP_VERSION', sealed.payloadVersion === BACKUP_VERSION);
  check('Ciphertext enthaelt keinen Klartext', !sealed.ciphertext.includes('Ferritin') && !sealed.ciphertext.includes('Nadine'));
  const opened = decryptBackup(sealed.ciphertext, key);
  check('Rundtrip: Laborwert zurueck', opened.data.labValues[0].name === 'Ferritin');
  check('Rundtrip: exportedAt', opened.exportedAt === '2026-08-30T12:00:00.000Z');
  check('Felder ausserhalb BACKUP_DATA_FIELDS fallen weg', !('nichtImBackup' in opened.data));
  const other = await randomBytes(32);
  let code = null;
  try { decryptBackup(sealed.ciphertext, other); } catch (error) { code = error.code; }
  check('falscher Schluessel → code wrongKey', code === 'wrongKey');
  check('REMOTE_COLUMNS ohne Klartext-Zaehler', !REMOTE_COLUMNS.includes('count'));
}

console.log('— decideOnLogin —');
const remote = { exported_at: '2026-08-30T12:00:00.000Z' };
check('nichts da → none', decideOnLogin({ remote: null, localHasData: false, lastUploadedAt: null }) === 'none');
check('nur lokal → upload', decideOnLogin({ remote: null, localHasData: true, lastUploadedAt: null }) === 'upload');
check('nur remote → restore', decideOnLogin({ remote, localHasData: false, lastUploadedAt: null }) === 'restore');
check('beides, remote von uns → upload', decideOnLogin({ remote, localHasData: true, lastUploadedAt: '2026-08-30T12:00:00.000Z' }) === 'upload');
check('beides, remote fremd → ask', decideOnLogin({ remote, localHasData: true, lastUploadedAt: '2026-08-29T08:00:00.000Z' }) === 'ask');
check('beides, nie hochgeladen → ask', decideOnLogin({ remote, localHasData: true, lastUploadedAt: null }) === 'ask');

if (failures > 0) { console.error(`\n${failures} Test(s) fehlgeschlagen`); process.exit(1); }
console.log('\nCloudBackup: alle Tests bestanden');
```

- [ ] **Step 2: Fehlschlag sehen**

Run: `npm test 2>&1 | grep -A2 cloud-backup`
Expected: Bundling-Fehler (Modul fehlt).

- [ ] **Step 3: Modul**

`CloudBackup.js`:

```js
/**
 * CloudBackup.js
 * Verschluesselter Stand je Konto (Spec 2026-08-30-cloud-backup-design):
 * Rundtrip zwischen Haupt-Store-Zustand und Ciphertext, Zaehler fuer den
 * Dialog, und die Entscheidung beim Login. Rein, ohne Store und Netz.
 *
 * Der Server sieht nur Ciphertext, Geraetename und Zeitstempel. Zaehler
 * (Praeparate, Laborwerte) werden hier aus dem ENTSCHLUESSELTEN Stand
 * gebildet, nie in Klartext-Spalten abgelegt.
 */

import { decryptText, encryptText } from './AccountCrypto';
import { BACKUP_VERSION, buildBackupPayload, parseBackupPayload } from './BackupManager';

export const REMOTE_COLUMNS = 'ciphertext,payload_version,device_label,exported_at,updated_at';

const lengthOf = (list) => (Array.isArray(list) ? list.length : 0);

/** Lokal liegt etwas, das verloren gehen koennte. */
export function hasLocalData(state = {}) {
  return (
    lengthOf(state?.userSupplements) > 0 ||
    lengthOf(state?.labValues) > 0 ||
    lengthOf(state?.intakeLogs) > 0
  );
}

/** Zaehler fuer Hinweis und Dialog, aus dem Klartext. */
export function countsOf(data = {}) {
  const supplements = Array.isArray(data?.userSupplements)
    ? data.userSupplements.filter((item) => item?.status !== 'archived').length
    : 0;
  return {
    supplements,
    labValues: lengthOf(data?.labValues),
    intakeLogs: lengthOf(data?.intakeLogs),
  };
}

export async function encryptBackup(state, dataKey, randomBytes, exportedAt = new Date()) {
  const payload = buildBackupPayload(state, exportedAt);
  const ciphertext = await encryptText(JSON.stringify(payload), dataKey, randomBytes);
  return { ciphertext, payloadVersion: BACKUP_VERSION, exportedAt: payload.exportedAt };
}

export function decryptBackup(ciphertext, dataKey) {
  let text;
  try {
    text = decryptText(ciphertext, dataKey);
  } catch (cause) {
    const error = new Error('CloudBackup: Stand nicht lesbar (Schluessel passt nicht)');
    error.code = 'wrongKey';
    error.cause = cause;
    throw error;
  }
  const parsed = parseBackupPayload(text);
  if (!parsed.ok) {
    const error = new Error(`CloudBackup: ${parsed.error}`);
    error.code = parsed.error;
    throw error;
  }
  return { data: parsed.data, exportedAt: parsed.exportedAt };
}

/**
 * Entscheidung beim Login (Spec Entscheidung 2):
 *   kein Server-Stand, lokal leer          → none
 *   kein Server-Stand, lokal Daten         → upload
 *   Server-Stand, lokal leer               → restore
 *   beides, Server-Stand ist unser letzter → upload (nur wir haben geschrieben)
 *   beides, Server-Stand fremd oder unklar → ask
 */
export function decideOnLogin({ remote, localHasData, lastUploadedAt }) {
  if (!remote) return localHasData ? 'upload' : 'none';
  if (!localHasData) return 'restore';
  if (lastUploadedAt && remote.exported_at === lastUploadedAt) return 'upload';
  return 'ask';
}
```

- [ ] **Step 4: Migration**

`supabase/migrations/20260830150000_user_backups.sql`:

```sql
-- Cloud-Backup (Spec 2026-08-30): ein verschluesselter Stand je Nutzerin.
-- ciphertext ist AES-256-GCM ueber das JSON-Backup (CloudBackup.js), mit
-- dem Datenschluessel verschluesselt, der das Geraet nie verlaesst. Der
-- Server kann den Inhalt nicht lesen. Keine Klartext-Zaehler: Anzahl
-- Praeparate oder Laborwerte waeren Metadaten ueber Gesundheitsdaten.

create table if not exists public.user_backups (
  user_id uuid primary key references auth.users (id) on delete cascade,
  ciphertext text not null,
  payload_version integer not null default 1,
  device_label text not null default '',
  exported_at timestamptz not null,
  updated_at timestamptz not null default now(),
  constraint user_backups_ciphertext_format check (ciphertext ~ '^[0-9a-f]{24}:[0-9a-f]+$'),
  -- rund 3 MB Klartext; ein realer Bestand liegt weit darunter
  constraint user_backups_ciphertext_size check (length(ciphertext) <= 6000000),
  constraint user_backups_label_length check (char_length(device_label) <= 60)
);

alter table public.user_backups enable row level security;

-- (select auth.uid()) statt auth.uid(): einmal je Anfrage ausgewertet.
create policy user_backups_select_own on public.user_backups
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy user_backups_insert_own on public.user_backups
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy user_backups_update_own on public.user_backups
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Loeschen erlaubt: "Stand auf dem Server loeschen" (Widerruf ohne
-- Konto-Loeschung). Bei Konto-Loeschung faellt die Zeile per Cascade.
create policy user_backups_delete_own on public.user_backups
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.touch_user_backups_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists user_backups_touch on public.user_backups;
create trigger user_backups_touch
  before update on public.user_backups
  for each row execute function public.touch_user_backups_updated_at();
```

- [ ] **Step 5: Tests gruen und Commit**

Run: `npm test`
Expected: `cloud-backup.test.mjs` komplett `ok`, `ALLE TESTS BESTANDEN`.

```bash
git add CloudBackup.js tests/cloud-backup.test.mjs supabase/migrations/20260830150000_user_backups.sql
git commit -m "feat(backup): CloudBackup-Logik und Migration user_backups"
```

---

### Task 5: CloudBackupStore (Factory) und Bindung

**Files:**
- Create: `CloudBackupStore.js`
- Create: `useCloudBackupStore.js`
- Create: `tests/cloud-backup-store.test.mjs`
- Modify: `package.json` (expo-device)

**Interfaces:**
- Consumes: Task 4 (`encryptBackup`, `decryptBackup`, `decideOnLogin`, `hasLocalData`, `countsOf`, `REMOTE_COLUMNS`), `createCoalescedRunner` aus `runCoalesced.js`, `isNetworkError` aus `AccountLogic.js`.
- Produces: `createCloudBackupStore(deps, { storage })` mit Zustand und Aktionen wie unten; `useCloudBackupStore` (gebunden), `defaultDeviceLabel()`.

Zustand:

| Feld | Persistiert | Bedeutung |
|---|---|---|
| `autoBackup` | ja | Standard `true` |
| `deviceLabel` | ja | Standard `deps.defaultDeviceLabel` |
| `lastUploadedAt` | ja | ISO des letzten Uploads DIESES Geraets |
| `remoteExportedAt` | nein | zuletzt gesehener Server-Stand |
| `remoteDeviceLabel` | nein | |
| `status` | nein | `'idle' \| 'uploading' \| 'restoring' \| 'offline' \| 'error'` |
| `lastError` | nein | `null \| 'wrongKey' \| 'network' \| 'server' \| string` |
| `dirty` | nein | seit dem letzten Upload gab es eine Aenderung |
| `pendingDecision` | nein | `null \| { remote, counts }` |
| `lastRestore` | nein | `null \| { exportedAt, deviceLabel, counts }` (Hinweis auf dem Tagesplan) |

Aktionen: `scheduleUpload()`, `uploadNow()`, `checkOnLogin()`, `resolveDecision('restore' | 'upload')`, `deleteRemote()`, `setAutoBackup(bool)`, `setDeviceLabel(text)`, `dismissRestoreNotice()`, `onSignedOut()`.

deps: `{ client, randomBytes, getMainState, importBackup, getAccount, defaultDeviceLabel, now = () => new Date(), schedule = (fn, ms) => setTimeout(fn, ms), cancel = (id) => clearTimeout(id), delayMs = 5000 }`. `getAccount()` liefert `{ signedIn: boolean, userId, dataKey }`.

- [ ] **Step 1: Failing test**

`tests/cloud-backup-store.test.mjs`:

```js
// Tests fuer CloudBackupStore.js: Upload gebuendelt, Login-Entscheidung,
// Wiederherstellen ohne Rueck-Upload, Offline, Widerruf.
import { webcrypto } from 'node:crypto';
import { createCloudBackupStore } from '../CloudBackupStore';
import { decryptBackup, encryptBackup } from '../CloudBackup';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}
const randomBytes = async (n) => webcrypto.getRandomValues(new Uint8Array(n));
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

function memoryStorage() {
  const map = new Map();
  return {
    getItem: async (k) => map.get(k) ?? null,
    setItem: async (k, v) => { map.set(k, v); },
    removeItem: async (k) => { map.delete(k); },
  };
}

function makeClient({ row = null, fail = null } = {}) {
  const calls = [];
  return {
    calls,
    get row() { return row; },
    from: () => ({
      select: () => ({ maybeSingle: async () => { calls.push(['select']); if (fail === 'select') throw Object.assign(new Error('fetch failed'), { name: 'TypeError' }); return { data: row, error: null }; } }),
      upsert: async (next) => { calls.push(['upsert', next]); if (fail === 'upsert') return { error: { message: 'Network request failed' } }; row = { ...next, updated_at: '2026-08-30T12:00:01.000Z' }; return { error: null }; },
      delete: () => ({ eq: async () => { calls.push(['delete']); row = null; return { error: null }; } }),
    }),
  };
}

// Manuell steuerbarer Timer: schedule sammelt, flush fuehrt aus.
function makeTimer() {
  let queue = [];
  return {
    schedule: (fn, ms) => { const id = Symbol(ms); queue.push({ id, fn }); return id; },
    cancel: (id) => { queue = queue.filter((item) => item.id !== id); },
    flush: async () => { const items = queue; queue = []; for (const item of items) await item.fn(); },
    get size() { return queue.length; },
  };
}

async function setup({ row = null, fail = null, state, account, storage = memoryStorage() } = {}) {
  const key = await randomBytes(32);
  const main = { current: state ?? { userSupplements: [{ id: 'user-1', name: 'Magnesium', status: 'active' }], intakeLogs: [], labValues: [] } };
  const imported = [];
  const timer = makeTimer();
  const client = makeClient({ row, fail });
  const store = createCloudBackupStore(
    {
      client,
      randomBytes,
      getMainState: () => main.current,
      importBackup: (data) => { imported.push(data); main.current = { ...main.current, ...data }; },
      getAccount: () => account ?? { signedIn: true, userId: 'u1', dataKey: key },
      defaultDeviceLabel: 'Testgeraet',
      now: () => new Date('2026-08-30T12:00:00.000Z'),
      schedule: timer.schedule,
      cancel: timer.cancel,
      delayMs: 5000,
    },
    { storage }
  );
  await tick();
  return { store, client, timer, imported, key, main };
}

console.log('— scheduleUpload buendelt —');
{
  const { store, client, timer } = await setup();
  store.getState().scheduleUpload();
  store.getState().scheduleUpload();
  store.getState().scheduleUpload();
  check('nur ein Timer offen', timer.size === 1);
  check('dirty gesetzt', store.getState().dirty === true);
  await timer.flush();
  await tick();
  const upserts = client.calls.filter(([n]) => n === 'upsert');
  check('genau ein Upload', upserts.length === 1);
  check('Upload traegt Geraetename', upserts[0][1].device_label === 'Testgeraet');
  check('Upload traegt user_id', upserts[0][1].user_id === 'u1');
  check('lastUploadedAt = exported_at', store.getState().lastUploadedAt === upserts[0][1].exported_at);
  check('dirty zurueckgesetzt', store.getState().dirty === false);
  check('status idle', store.getState().status === 'idle');
}

console.log('— kein Upload ohne Schluessel / ohne autoBackup / abgemeldet —');
{
  const { store, client, timer } = await setup({ account: { signedIn: true, userId: 'u1', dataKey: null } });
  store.getState().scheduleUpload();
  await timer.flush();
  check('ohne Schluessel kein Upload', client.calls.filter(([n]) => n === 'upsert').length === 0);
}
{
  const { store, client, timer } = await setup();
  store.getState().setAutoBackup(false);
  store.getState().scheduleUpload();
  await timer.flush();
  check('autoBackup aus: kein Timer, kein Upload', timer.size === 0 && client.calls.filter(([n]) => n === 'upsert').length === 0);
  await store.getState().uploadNow();
  check('uploadNow geht trotzdem (manuell)', client.calls.filter(([n]) => n === 'upsert').length === 1);
}
{
  const { store, client, timer } = await setup({ account: { signedIn: false, userId: null, dataKey: null } });
  store.getState().scheduleUpload();
  await timer.flush();
  check('abgemeldet: kein Upload', client.calls.filter(([n]) => n === 'upsert').length === 0);
}

console.log('— checkOnLogin: restore importiert und laedt nicht sofort wieder hoch —');
{
  const key = await randomBytes(32);
  const remoteState = { userSupplements: [{ id: 'user-9', name: 'Eisen', status: 'active' }], labValues: [{ id: 'lab-1' }], intakeLogs: [] };
  const sealed = await encryptBackup(remoteState, key, randomBytes, new Date('2026-08-29T10:00:00.000Z'));
  const row = { ciphertext: sealed.ciphertext, payload_version: 1, device_label: 'Altes iPhone', exported_at: sealed.exportedAt, updated_at: sealed.exportedAt };
  const { store, client, timer, imported } = await setup({ row, state: { userSupplements: [], labValues: [], intakeLogs: [] }, account: { signedIn: true, userId: 'u1', dataKey: key } });
  const decision = await store.getState().checkOnLogin();
  check('Entscheidung restore', decision === 'restore');
  check('importBackup aufgerufen', imported.length === 1 && imported[0].userSupplements[0].name === 'Eisen');
  check('lastRestore gesetzt mit Zaehlern', store.getState().lastRestore?.counts.supplements === 1 && store.getState().lastRestore.deviceLabel === 'Altes iPhone');
  check('lastUploadedAt = Server-Stand', store.getState().lastUploadedAt === sealed.exportedAt);
  store.getState().scheduleUpload();
  check('kein Timer direkt nach Restore (dirty false)', store.getState().dirty === false || timer.size === 0);
  await timer.flush();
  check('kein Rueck-Upload', client.calls.filter(([n]) => n === 'upsert').length === 0);
  store.getState().dismissRestoreNotice();
  check('Hinweis weggetippt', store.getState().lastRestore === null);
}

console.log('— checkOnLogin: ask, dann Entscheidung —');
{
  const key = await randomBytes(32);
  const sealed = await encryptBackup({ userSupplements: [{ id: 'a', status: 'active' }, { id: 'b', status: 'active' }], labValues: [], intakeLogs: [] }, key, randomBytes, new Date('2026-08-30T09:00:00.000Z'));
  const row = { ciphertext: sealed.ciphertext, payload_version: 1, device_label: 'Anderes Geraet', exported_at: sealed.exportedAt, updated_at: sealed.exportedAt };
  const { store, client, imported } = await setup({ row, account: { signedIn: true, userId: 'u1', dataKey: key } });
  const decision = await store.getState().checkOnLogin();
  check('Entscheidung ask', decision === 'ask');
  check('pendingDecision mit Zaehlern', store.getState().pendingDecision?.counts.supplements === 2);
  check('nichts hochgeladen, nichts importiert', client.calls.filter(([n]) => n === 'upsert').length === 0 && imported.length === 0);
  await store.getState().resolveDecision('upload');
  check('upload: hochgeladen', client.calls.filter(([n]) => n === 'upsert').length === 1);
  check('pendingDecision geleert', store.getState().pendingDecision === null);
}
{
  const key = await randomBytes(32);
  const sealed = await encryptBackup({ userSupplements: [{ id: 'a', status: 'active' }], labValues: [], intakeLogs: [] }, key, randomBytes, new Date('2026-08-30T09:00:00.000Z'));
  const row = { ciphertext: sealed.ciphertext, payload_version: 1, device_label: 'Anderes Geraet', exported_at: sealed.exportedAt, updated_at: sealed.exportedAt };
  const { store, imported } = await setup({ row, account: { signedIn: true, userId: 'u1', dataKey: key } });
  await store.getState().checkOnLogin();
  await store.getState().resolveDecision('restore');
  check('restore: importiert', imported.length === 1);
}

console.log('— checkOnLogin: unser eigener Stand → upload; falscher Schluessel → wrongKey + upload —');
{
  const key = await randomBytes(32);
  const sealed = await encryptBackup({ userSupplements: [{ id: 'a', status: 'active' }], labValues: [], intakeLogs: [] }, key, randomBytes, new Date('2026-08-30T09:00:00.000Z'));
  const row = { ciphertext: sealed.ciphertext, payload_version: 1, device_label: 'Testgeraet', exported_at: sealed.exportedAt, updated_at: sealed.exportedAt };
  const storage = memoryStorage();
  await storage.setItem('mysuplea-cloud-backup-v1', JSON.stringify({ state: { autoBackup: true, deviceLabel: 'Testgeraet', lastUploadedAt: sealed.exportedAt }, version: 0 }));
  const { store, client } = await setup({ row, storage, account: { signedIn: true, userId: 'u1', dataKey: key } });
  const decision = await store.getState().checkOnLogin();
  check('eigener Stand → upload', decision === 'upload');
  check('hochgeladen', client.calls.filter(([n]) => n === 'upsert').length === 1);
}
{
  const key = await randomBytes(32);
  const otherKey = await randomBytes(32);
  const sealed = await encryptBackup({ userSupplements: [{ id: 'a', status: 'active' }], labValues: [], intakeLogs: [] }, otherKey, randomBytes, new Date('2026-08-30T09:00:00.000Z'));
  const row = { ciphertext: sealed.ciphertext, payload_version: 1, device_label: 'Fremd', exported_at: sealed.exportedAt, updated_at: sealed.exportedAt };
  const { store, client } = await setup({ row, account: { signedIn: true, userId: 'u1', dataKey: key } });
  const decision = await store.getState().checkOnLogin();
  check('unlesbar → upload', decision === 'upload');
  check('lastError wrongKey', store.getState().lastError === 'wrongKey');
  check('ersetzt den Stand', client.calls.filter(([n]) => n === 'upsert').length === 1);
}

console.log('— Offline und Widerruf —');
{
  const { store } = await setup({ fail: 'upsert' });
  await store.getState().uploadNow();
  check('Netzfehler → status offline, kein throw', store.getState().status === 'offline');
  check('dirty bleibt', store.getState().dirty === true);
}
{
  const { store, client } = await setup({ row: { ciphertext: 'aa'.repeat(12) + ':bb', payload_version: 1, device_label: 'x', exported_at: '2026-08-30T09:00:00.000Z', updated_at: '2026-08-30T09:00:00.000Z' } });
  await store.getState().deleteRemote();
  check('delete aufgerufen', client.calls.some(([n]) => n === 'delete'));
  check('remoteExportedAt und lastUploadedAt geleert', store.getState().remoteExportedAt === null && store.getState().lastUploadedAt === null);
}
{
  const { store } = await setup();
  store.getState().setDeviceLabel('  Nadines iPhone  ');
  check('Geraetename getrimmt', store.getState().deviceLabel === 'Nadines iPhone');
  store.getState().setDeviceLabel('x'.repeat(80));
  check('Geraetename auf 60 gekappt', store.getState().deviceLabel.length === 60);
  store.getState().onSignedOut();
  check('onSignedOut raeumt Laufzeitfelder', store.getState().pendingDecision === null && store.getState().remoteExportedAt === null && store.getState().lastUploadedAt === null);
}

if (failures > 0) { console.error(`\n${failures} Test(s) fehlgeschlagen`); process.exit(1); }
console.log('\nCloudBackupStore: alle Tests bestanden');
```

- [ ] **Step 2: Fehlschlag sehen**

Run: `npm test 2>&1 | grep -A2 cloud-backup-store`
Expected: Modul fehlt.

- [ ] **Step 3: Factory**

`CloudBackupStore.js`:

```js
/**
 * CloudBackupStore.js
 * zustand-Factory fuer das Cloud-Backup (Spec 2026-08-30-cloud-backup-design).
 * Alle Abhaengigkeiten injiziert, in Node testbar; useCloudBackupStore.js
 * bindet die echten. Persistiert nur autoBackup, deviceLabel und
 * lastUploadedAt (kein Gesundheitsbezug), Rest ist Laufzeit.
 *
 * Regeln:
 * - Upload nur mit Session, Datenschluessel und (bei Automatik) autoBackup.
 * - scheduleUpload buendelt: ein Timer, der letzte Aufruf gewinnt; der
 *   Upload selbst laeuft ueber createCoalescedRunner, damit ein Upload
 *   waehrend eines laufenden Uploads nachgeholt statt verdoppelt wird.
 * - importBackup loest keinen Upload aus: waehrend des Imports ist
 *   suppress gesetzt, danach ist dirty false und lastUploadedAt der
 *   Server-Stand.
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isNetworkError } from './AccountLogic';
import {
  countsOf,
  decideOnLogin,
  decryptBackup,
  encryptBackup,
  hasLocalData,
  REMOTE_COLUMNS,
} from './CloudBackup';
import { createCoalescedRunner } from './runCoalesced';

export const CLOUD_BACKUP_STORAGE_KEY = 'mysuplea-cloud-backup-v1';
const LABEL_MAX = 60;

const RUNTIME_RESET = {
  remoteExportedAt: null,
  remoteDeviceLabel: null,
  status: 'idle',
  lastError: null,
  dirty: false,
  pendingDecision: null,
  lastRestore: null,
};

const errorCode = (error) => {
  if (isNetworkError(error) || /network|fetch failed/i.test(error?.message ?? '')) return 'network';
  return error?.code ?? 'server';
};

export function createCloudBackupStore(deps, { storage } = {}) {
  const {
    client,
    randomBytes,
    getMainState,
    importBackup,
    getAccount,
    defaultDeviceLabel = '',
    now = () => new Date(),
    schedule = (fn, ms) => setTimeout(fn, ms),
    cancel = (id) => clearTimeout(id),
    delayMs = 5000,
  } = deps;

  return create(
    persist(
      (set, get) => {
        let timerId = null;
        let suppress = false;

        const ready = () => {
          const account = getAccount();
          return Boolean(account?.signedIn && account?.userId && account?.dataKey);
        };

        const fetchRemote = async () => {
          const { data, error } = await client.from('user_backups').select(REMOTE_COLUMNS).maybeSingle();
          if (error) throw Object.assign(new Error(error.message), { code: 'server' });
          return data ?? null;
        };

        const doUpload = async () => {
          if (!ready()) return;
          const { userId, dataKey } = getAccount();
          set({ status: 'uploading', lastError: null });
          try {
            const sealed = await encryptBackup(getMainState(), dataKey, randomBytes, now());
            const { error } = await client.from('user_backups').upsert({
              user_id: userId,
              ciphertext: sealed.ciphertext,
              payload_version: sealed.payloadVersion,
              device_label: get().deviceLabel,
              exported_at: sealed.exportedAt,
            });
            if (error) throw Object.assign(new Error(error.message), { code: 'server' });
            set({
              status: 'idle',
              dirty: false,
              lastUploadedAt: sealed.exportedAt,
              remoteExportedAt: sealed.exportedAt,
              remoteDeviceLabel: get().deviceLabel,
            });
          } catch (error) {
            const code = errorCode(error);
            set({ status: code === 'network' ? 'offline' : 'error', lastError: code });
          }
        };
        const runUpload = createCoalescedRunner(doUpload);

        const restoreFrom = async (remote) => {
          const { dataKey } = getAccount();
          set({ status: 'restoring', lastError: null });
          const opened = decryptBackup(remote.ciphertext, dataKey); // wirft mit code
          const counts = countsOf(opened.data);
          suppress = true;
          try {
            importBackup(opened.data);
          } finally {
            suppress = false;
          }
          if (timerId) { cancel(timerId); timerId = null; }
          set({
            status: 'idle',
            dirty: false,
            lastUploadedAt: remote.exported_at,
            remoteExportedAt: remote.exported_at,
            remoteDeviceLabel: remote.device_label ?? null,
            lastRestore: { exportedAt: remote.exported_at, deviceLabel: remote.device_label ?? '', counts },
          });
        };

        return {
          autoBackup: true,
          deviceLabel: defaultDeviceLabel,
          lastUploadedAt: null,
          ...RUNTIME_RESET,

          scheduleUpload: () => {
            if (suppress) return;
            set({ dirty: true });
            if (!get().autoBackup || !ready() || get().pendingDecision) return;
            if (timerId) cancel(timerId);
            timerId = schedule(() => {
              timerId = null;
              runUpload();
            }, delayMs);
          },

          uploadNow: () => runUpload(),

          checkOnLogin: async () => {
            if (!ready()) return 'none';
            let remote;
            try {
              remote = await fetchRemote();
            } catch (error) {
              const code = errorCode(error);
              set({ status: code === 'network' ? 'offline' : 'error', lastError: code });
              return 'none';
            }
            set({ remoteExportedAt: remote?.exported_at ?? null, remoteDeviceLabel: remote?.device_label ?? null });
            const decision = decideOnLogin({
              remote,
              localHasData: hasLocalData(getMainState()),
              lastUploadedAt: get().lastUploadedAt,
            });
            if (decision === 'restore') {
              try {
                await restoreFrom(remote);
                return 'restore';
              } catch (error) {
                set({ status: 'idle', lastError: errorCode(error) });
                await runUpload();
                return 'upload';
              }
            }
            if (decision === 'ask') {
              try {
                const opened = decryptBackup(remote.ciphertext, getAccount().dataKey);
                set({ pendingDecision: { remote, counts: countsOf(opened.data) } });
                return 'ask';
              } catch (error) {
                // Unlesbar (z. B. Reset ohne Recovery-Key): unser Stand ersetzt ihn.
                set({ lastError: errorCode(error) });
                await runUpload();
                return 'upload';
              }
            }
            if (decision === 'upload') await runUpload();
            return decision;
          },

          resolveDecision: async (choice) => {
            const pending = get().pendingDecision;
            set({ pendingDecision: null });
            if (!pending) return;
            if (choice === 'restore') {
              try {
                await restoreFrom(pending.remote);
              } catch (error) {
                set({ status: 'idle', lastError: errorCode(error) });
              }
              return;
            }
            await runUpload();
          },

          deleteRemote: async () => {
            const { userId } = getAccount();
            if (!userId) return;
            const { error } = await client.from('user_backups').delete().eq('user_id', userId);
            if (error) {
              set({ status: 'error', lastError: 'server' });
              return;
            }
            set({ remoteExportedAt: null, remoteDeviceLabel: null, lastUploadedAt: null, status: 'idle', lastError: null });
          },

          setAutoBackup: (value) => set({ autoBackup: Boolean(value) }),
          setDeviceLabel: (text) => set({ deviceLabel: String(text ?? '').trim().slice(0, LABEL_MAX) }),
          dismissRestoreNotice: () => set({ lastRestore: null }),
          onSignedOut: () => {
            if (timerId) { cancel(timerId); timerId = null; }
            set({ ...RUNTIME_RESET, lastUploadedAt: null });
          },
        };
      },
      {
        name: CLOUD_BACKUP_STORAGE_KEY,
        storage: createJSONStorage(() => storage ?? memoryFallback()),
        partialize: (state) => ({
          autoBackup: state.autoBackup,
          deviceLabel: state.deviceLabel,
          lastUploadedAt: state.lastUploadedAt,
        }),
      }
    )
  );
}

// Nur fuer Aufrufer ohne storage (sollte in der App nie vorkommen).
function memoryFallback() {
  const map = new Map();
  return {
    getItem: async (key) => map.get(key) ?? null,
    setItem: async (key, value) => { map.set(key, value); },
    removeItem: async (key) => { map.delete(key); },
  };
}
```

Hinweis zur Hydration in Tests: `persist` hydriert asynchron; der Test wartet mit `tick()` nach `setup()`. Falls `lastUploadedAt` aus dem vorbefuellten Storage im Test "eigener Stand → upload" nicht rechtzeitig geladen ist, `await store.persist.rehydrate()` im `setup()` nach dem Anlegen aufrufen (zustand persist API) und im Test-Setup fest einbauen.

- [ ] **Step 4: Bindung**

`npx expo install expo-device` (Expo Go enthaelt das Modul).

`useCloudBackupStore.js`:

```js
/**
 * useCloudBackupStore.js
 * Bindet CloudBackupStore.js an die echten Abhaengigkeiten: Supabase,
 * Haupt-Store (Zustand + importBackup), Konto-Store (Session +
 * Datenschluessel), expo-device fuer den Geraetenamen, AsyncStorage fuer
 * die drei persistierten Felder (kein Gesundheitsbezug, daher
 * unverschluesselt).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';

import { ACCOUNT_STATUS } from './AccountStore';
import { createCloudBackupStore } from './CloudBackupStore';
import { supabase } from './supabaseClient';
import useAccountStore from './useAccountStore';
import useStore from './useStore';

const randomBytes = async (length) => new Uint8Array(await Crypto.getRandomBytesAsync(length));

export function defaultDeviceLabel() {
  return (Device.deviceName || Device.modelName || 'Dieses Gerät').slice(0, 60);
}

export const useCloudBackupStore = createCloudBackupStore(
  {
    client: supabase,
    randomBytes,
    getMainState: () => useStore.getState(),
    importBackup: (data) => useStore.getState().importBackup(data),
    getAccount: () => {
      const account = useAccountStore.getState();
      return {
        signedIn: account.status === ACCOUNT_STATUS.SIGNED_IN,
        userId: account.userId,
        dataKey: account.dataKey,
      };
    },
    defaultDeviceLabel: defaultDeviceLabel(),
  },
  { storage: AsyncStorage }
);

// Abmelden oder Konto weg: Laufzeitfelder und lastUploadedAt raeumen.
let previousUserId = useAccountStore.getState().userId;
useAccountStore.subscribe((state) => {
  if (state.userId !== previousUserId) {
    previousUserId = state.userId;
    if (!state.userId) useCloudBackupStore.getState().onSignedOut();
  }
});

export default useCloudBackupStore;
```

Pruefen, ob `@react-native-async-storage/async-storage` bereits Abhaengigkeit ist (`grep async-storage package.json`); es wird von `useStore.js` genutzt.

- [ ] **Step 5: Tests gruen und Commit**

Run: `npm test`
Expected: `cloud-backup-store.test.mjs` komplett `ok`, `ALLE TESTS BESTANDEN`.

```bash
git add CloudBackupStore.js useCloudBackupStore.js tests/cloud-backup-store.test.mjs package.json package-lock.json
git commit -m "feat(backup): CloudBackupStore mit gebuendeltem Upload und Login-Abgleich"
```

---

### Task 6: Oberflaeche und Verdrahtung

**Files:**
- Modify: `app/_layout.jsx` (Subscription, AppState, Dialog, Check beim Start)
- Modify: `app/(tabs)/(more)/account.jsx` (Abschnitt Cloud-Backup in `SignedInView`, `checkOnLogin` nach Login)
- Modify: `app/(tabs)/(more)/account-recovery.jsx`, `app/auth/callback.jsx` (`checkOnLogin` vor `routeAfterAccount`)
- Modify: `components/FirstStepsCard.jsx` (Konto-Texte)
- Modify: `app/(tabs)/(today)/Dashboard.jsx` (Hinweis nach Wiederherstellung)
- Modify: `i18n/de/account.js`, `i18n/en/account.js`, `i18n/de/dashboard.js`, `i18n/en/dashboard.js`

**Interfaces:**
- Consumes: `useCloudBackupStore` (Task 5), `BACKUP_DATA_FIELDS` aus `BackupManager.js`, `routeAfterAccount` aus `FirstSteps.js`.

- [ ] **Step 1: i18n**

`i18n/de/account.js` ergaenzen (und `account.signedIn.syncNote` ENTFERNEN, DE und EN, sowie die Verwendung in account.jsx):

```js
  'account.cloud.title': 'Cloud-Backup',
  'account.cloud.intro': 'Dein Stand liegt Ende-zu-Ende verschlüsselt auf unserem Server. Weder wir noch der Anbieter können ihn lesen. Ohne dein Passwort oder deinen Recovery-Key ist er nicht wiederherstellbar.',
  'account.cloud.lastUpload': 'Letzter Stand {time} von {device}',
  'account.cloud.none': 'Noch kein Stand auf dem Server.',
  'account.cloud.uploading': 'Wird gesichert.',
  'account.cloud.restoring': 'Wird wiederhergestellt.',
  'account.cloud.offline': 'Offline. Wird beim nächsten Öffnen nachgeholt.',
  'account.cloud.error': 'Sichern fehlgeschlagen. Beim nächsten Öffnen wird es erneut versucht.',
  'account.cloud.wrongKey': 'Der Stand auf dem Server wurde mit einem früheren Schlüssel verschlüsselt und kann nicht gelesen werden. Beim nächsten Sichern wird er ersetzt.',
  'account.cloud.auto': 'Automatisch sichern',
  'account.cloud.autoSub': 'Nach jeder Änderung, gebündelt, nur mit Internet.',
  'account.cloud.now': 'Jetzt sichern',
  'account.cloud.device': 'Gerätename',
  'account.cloud.deviceSub': 'Erscheint auf anderen Geräten als Herkunft des Standes.',
  'account.cloud.delete': 'Stand auf dem Server löschen',
  'account.cloud.deleteConfirmTitle': 'Stand löschen?',
  'account.cloud.deleteConfirmText': 'Der verschlüsselte Stand wird vom Server entfernt. Deine Daten auf diesem Gerät bleiben. Automatisches Sichern wird ausgeschaltet.',
  'account.cloud.deleteConfirm': 'Löschen',
  'account.cloud.keyMissing': 'Cloud-Backup ist auf diesem Gerät nicht verfügbar, weil der Datenschlüssel fehlt. Einmal ab- und wieder anmelden.',
  'account.cloud.decisionTitle': 'Neuerer Stand auf dem Server',
  'account.cloud.decisionText': 'Auf deinem Konto liegt ein Stand vom {time} von {device} ({supplements} Präparate, {labValues} Laborwerte). Diesen Stand übernehmen oder den Stand dieses Geräts hochladen?',
  'account.cloud.decisionRestore': 'Server-Stand übernehmen',
  'account.cloud.decisionUpload': 'Diesen Stand hochladen',
```

EN:

```js
  'account.cloud.title': 'Cloud backup',
  'account.cloud.intro': 'Your data is stored end-to-end encrypted on our server. Neither we nor the provider can read it. Without your password or recovery key it cannot be restored.',
  'account.cloud.lastUpload': 'Last backup {time} from {device}',
  'account.cloud.none': 'No backup on the server yet.',
  'account.cloud.uploading': 'Backing up.',
  'account.cloud.restoring': 'Restoring.',
  'account.cloud.offline': 'Offline. Will catch up next time the app opens.',
  'account.cloud.error': 'Backup failed. It will be retried next time the app opens.',
  'account.cloud.wrongKey': 'The backup on the server was encrypted with an earlier key and cannot be read. It will be replaced with the next backup.',
  'account.cloud.auto': 'Back up automatically',
  'account.cloud.autoSub': 'After every change, batched, only with internet.',
  'account.cloud.now': 'Back up now',
  'account.cloud.device': 'Device name',
  'account.cloud.deviceSub': 'Shown on other devices as the origin of the backup.',
  'account.cloud.delete': 'Delete backup on the server',
  'account.cloud.deleteConfirmTitle': 'Delete backup?',
  'account.cloud.deleteConfirmText': 'The encrypted backup is removed from the server. Your data on this device stays. Automatic backup is switched off.',
  'account.cloud.deleteConfirm': 'Delete',
  'account.cloud.keyMissing': 'Cloud backup is not available on this device because the data key is missing. Sign out and back in once.',
  'account.cloud.decisionTitle': 'Newer backup on the server',
  'account.cloud.decisionText': 'Your account holds a backup from {time} from {device} ({supplements} supplements, {labValues} lab values). Use that backup or upload the data on this device?',
  'account.cloud.decisionRestore': 'Use server backup',
  'account.cloud.decisionUpload': 'Upload this device',
```

`i18n/de/dashboard.js`:

```js
  'dashboard.restored.title': 'Stand übernommen',
  'dashboard.restored.text': 'Stand vom {time} von {device}: {supplements} Präparate, {labValues} Laborwerte.',
  'dashboard.restored.dismiss': 'Verstanden',
  'dashboard.firstSteps.account.skippedCloud': 'Deine Daten überleben den Handywechsel.',
  'dashboard.firstSteps.account.doneCloudOn': 'Cloud-Backup aktiv.',
  'dashboard.firstSteps.account.doneCloudOff': 'Cloud-Backup aus.',
```

EN:

```js
  'dashboard.restored.title': 'Backup restored',
  'dashboard.restored.text': 'Backup from {time} from {device}: {supplements} supplements, {labValues} lab values.',
  'dashboard.restored.dismiss': 'Got it',
  'dashboard.firstSteps.account.skippedCloud': 'Your data survives a phone change.',
  'dashboard.firstSteps.account.doneCloudOn': 'Cloud backup on.',
  'dashboard.firstSteps.account.doneCloudOff': 'Cloud backup off.',
```

Zeitformat: `new Date(iso).toLocaleString(language === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })`; als Helfer `formatBackupTime(iso, language)` in `CloudBackup.js` ergaenzen (rein), mit Test `formatBackupTime('2026-08-30T12:00:00.000Z','de')` liefert einen String mit `30.08.`.

- [ ] **Step 2: `app/_layout.jsx`**

Nach der bestehenden Notification-Subscription im selben `useEffect` ergaenzen (Imports: `AppState` aus react-native, `BACKUP_DATA_FIELDS` aus `../BackupManager`, `useCloudBackupStore` aus `../useCloudBackupStore`):

```jsx
    // Cloud-Backup: jede Aenderung an Backup-Feldern plant einen Upload
    // (gebuendelt im Store). importBackup ist im Store stummgeschaltet.
    const unsubscribeBackup = useStore.subscribe((state, previous) => {
      if (BACKUP_DATA_FIELDS.some((field) => state[field] !== previous[field])) {
        useCloudBackupStore.getState().scheduleUpload();
      }
    });
    // Beim Zurueckkehren in den Vordergrund offene Aenderungen nachholen.
    const appState = AppState.addEventListener('change', (next) => {
      if (next === 'active' && useCloudBackupStore.getState().dirty) {
        useCloudBackupStore.getState().scheduleUpload();
      }
    });
```

Cleanup: `unsubscribeBackup(); appState.remove();`.

Neuer `useEffect` fuer den Start-Abgleich (nach `initialize()` des Konto-Stores; dort, wo `_layout.jsx` heute `useAccountStore.getState().initialize()` aufruft, sonst direkt danach ergaenzen):

```jsx
  // Start mit Session und Schluessel: pruefen, ob ein anderes Geraet
  // geschrieben hat (Dialog) oder unser Stand hochgeladen werden muss.
  const accountStatus = useAccountStore((state) => state.status);
  const accountDataKey = useAccountStore((state) => state.dataKey);
  useEffect(() => {
    if (!hydrated || !onboarded) return;
    if (accountStatus !== ACCOUNT_STATUS.SIGNED_IN || !accountDataKey) return;
    useCloudBackupStore.getState().checkOnLogin().catch((error) => console.error('[Layout] Cloud-Backup-Abgleich', error));
  }, [hydrated, onboarded, accountStatus, accountDataKey]);
```

Dialog fuer `pendingDecision`:

```jsx
  const pendingDecision = useCloudBackupStore((state) => state.pendingDecision);
  const language = useStore((state) => state.language);
  useEffect(() => {
    if (!pendingDecision) return;
    const { remote, counts } = pendingDecision;
    Alert.alert(
      t('account.cloud.decisionTitle'),
      t('account.cloud.decisionText', {
        time: formatBackupTime(remote.exported_at, language),
        device: remote.device_label || '',
        supplements: counts.supplements,
        labValues: counts.labValues,
      }),
      [
        { text: t('account.cloud.decisionUpload'), onPress: () => useCloudBackupStore.getState().resolveDecision('upload') },
        { text: t('account.cloud.decisionRestore'), onPress: () => useCloudBackupStore.getState().resolveDecision('restore') },
      ],
      { cancelable: false }
    );
  }, [pendingDecision, language, t]);
```

`_layout.jsx` nutzt bereits `useTranslation` (fuer `t('nav.*')`); andernfalls ergaenzen.

- [ ] **Step 3: Login-Stellen**

In `account.jsx` (signIn-Erfolg), `account-recovery.jsx` (nach `confirmSignUp` ohne `needsConfirmation`) und `callback.jsx` (nach Bestaetigung): VOR `routeAfterAccount(...)`:

```js
        // Erst der Abgleich mit dem Server-Stand (kann Praeparate holen),
        // dann die Weiche: mit Bestand landet die Nutzerin auf dem Tagesplan
        // statt in Schritt 3 der Ersteinrichtung.
        await useCloudBackupStore.getState().checkOnLogin().catch(() => 'none');
```

In `account-recovery.jsx` nur, wenn `!result.needsConfirmation` (sonst gibt es keine Session).

- [ ] **Step 4: Abschnitt Cloud-Backup in `SignedInView`**

In `account.jsx` nach der ersten Karte (Angemeldet als) eine Karte einfuegen (Komponente `CloudBackupCard` in derselben Datei, keine Fachlogik):

```jsx
function CloudBackupCard({ t, dataKey, language }) {
  const {
    autoBackup, deviceLabel, lastUploadedAt, remoteExportedAt, remoteDeviceLabel,
    status, lastError, setAutoBackup, setDeviceLabel, uploadNow, deleteRemote,
  } = useCloudBackupStore();

  if (!dataKey) {
    return (
      <View style={styles.card}>
        <Text style={styles.bodyStrong}>{t('account.cloud.title')}</Text>
        <Text style={styles.body}>{t('account.cloud.keyMissing')}</Text>
      </View>
    );
  }

  const statusLine = (() => {
    if (status === 'uploading') return t('account.cloud.uploading');
    if (status === 'restoring') return t('account.cloud.restoring');
    if (status === 'offline') return t('account.cloud.offline');
    if (status === 'error' && lastError === 'wrongKey') return t('account.cloud.wrongKey');
    if (status === 'error') return t('account.cloud.error');
    const stamp = remoteExportedAt ?? lastUploadedAt;
    return stamp
      ? t('account.cloud.lastUpload', { time: formatBackupTime(stamp, language), device: remoteDeviceLabel || deviceLabel })
      : t('account.cloud.none');
  })();

  const handleDelete = () =>
    Alert.alert(t('account.cloud.deleteConfirmTitle'), t('account.cloud.deleteConfirmText'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('account.cloud.deleteConfirm'), style: 'destructive', onPress: async () => { setAutoBackup(false); await deleteRemote(); } },
    ]);

  return (
    <View style={styles.card}>
      <Text style={styles.bodyStrong}>{t('account.cloud.title')}</Text>
      <Text style={styles.body}>{t('account.cloud.intro')}</Text>
      <Text style={styles.hint}>{statusLine}</Text>
      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <Text style={styles.bodyStrong}>{t('account.cloud.auto')}</Text>
          <Text style={styles.hint}>{t('account.cloud.autoSub')}</Text>
        </View>
        <Switch value={autoBackup} onValueChange={setAutoBackup} trackColor={{ false: colors.rule, true: colors.accent }} thumbColor={autoBackup ? colors.surface : colors.canvas} accessibilityLabel={t('account.cloud.auto')} />
      </View>
      <Text style={styles.label}>{t('account.cloud.device')}</Text>
      <TextInput style={styles.input} value={deviceLabel} onChangeText={setDeviceLabel} maxLength={60} accessibilityLabel={t('account.cloud.device')} />
      <Text style={styles.hint}>{t('account.cloud.deviceSub')}</Text>
      <Pressable onPress={uploadNow} disabled={status === 'uploading'} style={({ pressed }) => [styles.quietButton, pressed ? styles.buttonPressed : null]} accessibilityRole="button">
        <Text style={styles.quietButtonText}>{t('account.cloud.now')}</Text>
      </Pressable>
      <Pressable onPress={handleDelete} style={({ pressed }) => [styles.quietButton, pressed ? styles.buttonPressed : null]} accessibilityRole="button">
        <Text style={styles.dangerButtonText}>{t('account.cloud.delete')}</Text>
      </Pressable>
    </View>
  );
}
```

Vorhandene Styles (`card`, `bodyStrong`, `body`, `hint`, `quietButton`, `quietButtonText`, `dangerButtonText`, `input`, `label`, `buttonPressed`) wiederverwenden; `switchRow`/`switchText` neu anlegen (`flexDirection: 'row', alignItems: 'center', marginTop: space.md` / `flex: 1, paddingRight: space.md`). `Switch` und `TextInput` sind bereits importiert; `useCloudBackupStore`, `formatBackupTime` importieren; `language` aus `useStore((s) => s.language)`. In `SignedInView` `<CloudBackupCard t={t} dataKey={dataKey} language={language} />` direkt nach der ersten Karte einsetzen und die Zeile mit `account.signedIn.syncNote` entfernen.

- [ ] **Step 5: FirstStepsCard und Dashboard**

`components/FirstStepsCard.jsx`: im `detailFor` fuer `ACCOUNT`:
- `SKIPPED`: `${t('dashboard.firstSteps.account.skipped')} ${t('dashboard.firstSteps.account.skippedCloud')}`
- `DONE`: `${t('dashboard.firstSteps.account.done')} ${t(autoBackup ? 'dashboard.firstSteps.account.doneCloudOn' : 'dashboard.firstSteps.account.doneCloudOff')}` (`autoBackup` aus `useCloudBackupStore`, als Parameter an `detailFor` reichen).

`Dashboard.jsx`: oberhalb der Sektion Routine, wenn `lastRestore` gesetzt:

```jsx
      {lastRestore ? (
        <View style={styles.restoredCard}>
          <Text style={styles.restoredTitle}>{t('dashboard.restored.title')}</Text>
          <Text style={styles.restoredText}>
            {t('dashboard.restored.text', {
              time: formatBackupTime(lastRestore.exportedAt, language),
              device: lastRestore.deviceLabel,
              supplements: lastRestore.counts.supplements,
              labValues: lastRestore.counts.labValues,
            })}
          </Text>
          <TouchableOpacity onPress={dismissRestoreNotice} accessibilityRole="button" style={styles.restoredButton}>
            <Text style={styles.restoredButtonText}>{t('dashboard.restored.dismiss')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
```

Styles: `restoredCard: { ...surfaces.card, backgroundColor: colors.affirmSoft, padding: space.lg, marginBottom: space.lg }`, `restoredTitle: { ...type.bodyStrong, color: colors.affirm }`, `restoredText: { ...type.small, marginTop: space.xs }`, `restoredButton: { alignSelf: 'flex-start', marginTop: space.sm }`, `restoredButtonText: { ...type.small, color: colors.accent }`.

- [ ] **Step 6: Syntax, Tests, Commit**

Run: `for f in app/_layout.jsx "app/(tabs)/(more)/account.jsx" "app/(tabs)/(more)/account-recovery.jsx" app/auth/callback.jsx components/FirstStepsCard.jsx "app/(tabs)/(today)/Dashboard.jsx"; do npx esbuild "$f" --loader:.jsx=jsx --log-level=error --outfile=/dev/null; done; npm test`
Expected: keine esbuild-Fehler, `ALLE TESTS BESTANDEN` (i18n-Parity, `syncNote` nirgends mehr referenziert: `grep -rn "signedIn.syncNote" app components i18n` leer).

```bash
git add app/_layout.jsx "app/(tabs)/(more)/account.jsx" "app/(tabs)/(more)/account-recovery.jsx" app/auth/callback.jsx components/FirstStepsCard.jsx "app/(tabs)/(today)/Dashboard.jsx" i18n CloudBackup.js tests/cloud-backup.test.mjs
git commit -m "feat(backup): Cloud-Backup in Konto, Ersteinrichtung und Tagesplan verdrahtet"
```

---

### Task 7: Recht und Dokumente

**Files:**
- Modify: `data/legalContent.js` (PRIVACY_VERSION, Abschnitt Konto anpassen, neuer Abschnitt Cloud-Backup, DE und EN)
- Modify: `web/*.html` via `npm run build:legal`
- Modify: `launch/avv-dokumentation.md`
- Create: `launch/dsfa.md`
- Modify: `launch/store-setup.md` (Privacy Labels / Data Safety), `launch/aso.md` (ein Satz)
- Modify: `CLAUDE.md` (Datenhaltung: Cloud-Backup; Fachlogik-Tabelle: CloudBackup.js, CloudBackupStore.js)

- [ ] **Step 1: legalContent.js**

`PRIVACY_VERSION = '2026-09-01'`.

Abschnitt "Konto (freiwillig)" DE, zwei Saetze ersetzen:
- `'Zur Anmeldung wird dein Passwort über eine verschlüsselte Verbindung an Supabase übertragen und dort nur als Hash gespeichert.'` → `'Zur Anmeldung wird nicht dein Passwort übertragen, sondern ein daraus auf dem Gerät abgeleiteter Anmeldeschlüssel; Supabase speichert davon nur einen Hash.'`
- `'In dieser Version werden über das Konto keine Präparate, Laborwerte oder sonstigen Inhalte übertragen; kommt Sync hinzu, wird diese Erklärung vorher aktualisiert.'` → `'Inhalte (Präparate, Laborwerte, Profil) werden nur über das Cloud-Backup übertragen, das im nächsten Abschnitt beschrieben ist.'`
EN sinngemaess an den entsprechenden Saetzen des englischen Konto-Abschnitts (Datei lesen).

Neuer Abschnitt nach "Konto (freiwillig)", DE:

```js
    {
      heading: 'Cloud-Backup (nur mit Konto)',
      body:
        'Mit Konto sichert die App deinen Stand auf unserem Server bei Supabase (EU, Irland): Präparate, Einnahme-Verlauf, Lagerbestand, Scan-Ergebnisse, Profil, Laborwerte, Beobachtungen, Einstellungen. Dieser Stand wird auf deinem Gerät mit deinem Datenschlüssel verschlüsselt (AES-256-GCM), bevor er übertragen wird. Auf dem Server liegen nur der verschlüsselte Stand, ein von dir gewählter Gerätename und Zeitstempel. Weder wir noch Supabase können den Inhalt lesen; er lässt sich nur mit deinem Passwort oder deinem Recovery-Key wiederherstellen. Die Sicherung läuft automatisch nach Änderungen, sobald eine Internetverbindung besteht; du kannst sie im Konto ausschalten und den Stand auf dem Server jederzeit löschen. Beim Löschen des Kontos wird der Stand mit gelöscht. Deine lokalen Daten bleiben davon unberührt. Rechtsgrundlage: deine Einwilligung durch das Anlegen des Kontos und das Einschalten der Sicherung (Art. 6 Abs. 1 lit. a und Art. 9 Abs. 2 lit. a DSGVO), jederzeit widerrufbar durch Ausschalten oder Löschen.',
    },
```

EN:

```js
    {
      heading: 'Cloud backup (account only)',
      body:
        'With an account, the app backs up your data to our server at Supabase (EU, Ireland): supplements, intake history, stock, scan results, profile, lab values, observations, settings. This data is encrypted on your device with your data key (AES-256-GCM) before it is transferred. The server holds only the encrypted data, a device name you choose and timestamps. Neither we nor Supabase can read the content; it can only be restored with your password or your recovery key. Backup runs automatically after changes whenever an internet connection is available; you can switch it off in your account and delete the backup on the server at any time. Deleting the account deletes the backup as well. Your local data is not affected. Legal basis: your consent by creating the account and enabling backup (Art. 6(1)(a) and Art. 9(2)(a) GDPR), revocable at any time by switching off or deleting.',
    },
```

Dann `npm run build:legal` und `npm test` (`legal-site.test.mjs` prueft Drift; keine `https://` und kein App-Name-Literal im Text).

- [ ] **Step 2: AVV-Dokumentation**

In `launch/avv-dokumentation.md` unter "### Supabase als Auftragsverarbeiter fuer das Konto" einen Unterabschnitt anfuegen:

```markdown
### Supabase als Auftragsverarbeiter fuer das Cloud-Backup (seit 2026-09-01)

- Tabelle `public.user_backups`: je Nutzerin ein AES-256-GCM-verschluesselter
  Stand der App-Daten (Gesundheitsdaten nach Art. 9 DSGVO im Klartext des
  Standes), Geraetename, Zeitstempel. Der Schluessel verlaesst das Geraet
  nie; Supabase verarbeitet ausschliesslich Ciphertext.
- Region West EU (Ireland), RLS auf `auth.uid()`, Loeschung per Cascade bei
  Konto-Loeschung und per Client (Widerruf).
- Rechtsgrundlage der Verarbeitung: Einwilligung (Art. 9 Abs. 2 lit. a).
  Supabase-AVV (DPA) deckt die Verarbeitung als Auftragsverarbeiter ab; die
  Anmelde-Ableitung sorgt dafuer, dass Supabase Auth kein Klartext-Passwort
  erhaelt.
- DSFA: launch/dsfa.md.
```

- [ ] **Step 3: DSFA**

`launch/dsfa.md`:

```markdown
# Datenschutz-Folgenabschaetzung (Art. 35 DSGVO), Entwurf

Stand: 2026-09-01. Entwurf der Betreiberin, keine Rechtsberatung. Abnahme
durch Anwalt vor Launch (mit ODbL-Frage buendeln).

## 1. Pruefung der Pflicht (Art. 35 Abs. 3, WP248-Kriterien)

| Kriterium | Trifft zu | Begruendung |
|---|---|---|
| Sensible Daten (Art. 9) | ja | Laborwerte, Medikamentengruppen, Erkrankungen, Praeparate |
| Neue Technologie | teilweise | Ende-zu-Ende-Verschluesselung mit Schluessel beim Betroffenen ist etabliert (Passwort-Manager), fuer Gesundheits-Apps ungewoehnlich |
| Grosser Umfang | nein | Beta mit wenigen hundert Nutzerinnen; wird bei Wachstum neu bewertet |
| Bewertung/Scoring, Ueberwachung, Profiling | nein | keine Auswertung serverseitig moeglich (Ciphertext) |
| Betroffene in schwacher Position | nein | |

Zwei Kriterien erfuellt: DSFA wird vorsorglich durchgefuehrt.

## 2. Beschreibung der Verarbeitung

- Zweck: Wiederherstellung der App-Daten nach Geraetewechsel oder Verlust,
  auf Wunsch der Nutzerin (Konto freiwillig, Sicherung abschaltbar).
- Daten: JSON-Stand der App (Praeparate, Einnahmen, Bestand, Scans, Profil,
  Laborwerte, Beobachtungen, Einstellungen), auf dem Geraet AES-256-GCM
  verschluesselt; Metadaten: Geraetename (frei gewaehlt), Zeitstempel,
  Nutzer-ID (UUID), E-Mail (Auth).
- Empfaenger: Supabase (Auftragsverarbeiter, Region Irland). Kein weiterer.
- Speicherdauer: bis zum Loeschen des Standes oder des Kontos durch die
  Nutzerin; keine Backups des Ciphertexts ausserhalb der Supabase-
  Standardsicherungen (Aufbewahrung laut Anbieter, ebenfalls Ciphertext).
- Schluessel: zufaelliger Datenschluessel, entsteht auf dem Geraet, liegt
  im Geraete-Schluesselbund; auf dem Server nur zwei Umschlaege
  (Passwort-Ableitung scrypt N=32768, Recovery-Key). Anmelde-Passwort ist
  eine Ableitung, Klartext-Passwort verlaesst das Geraet nie.

## 3. Notwendigkeit und Verhaeltnismaessigkeit

- Datensparsamkeit: keine Klartext-Zaehler oder Felder ausserhalb des
  Ciphertexts; Geraetename freiwillig.
- Einwilligung: Anlegen des Kontos und Einschalten der Sicherung;
  Widerruf durch Ausschalten, Loeschen des Standes, Loeschen des Kontos
  (alles in der App, ohne Support).
- Betroffenenrechte: Auskunft und Uebertragbarkeit ueber den JSON-Export;
  Loeschung in der App; Berichtigung durch Aendern in der App und
  erneutes Sichern.

## 4. Risiken und Massnahmen

| Risiko | Eintritt | Schwere | Massnahmen | Restrisiko |
|---|---|---|---|---|
| Server-Kompromittierung (Datenbank-Abzug) | gering | hoch | Ciphertext ohne Schluessel; scrypt gegen Woerterbuchangriffe auf den Passwort-Umschlag; Mindestlaenge 10 | gering: Angreifer muss Passwort erraten, scrypt verlangsamt |
| Geraeteverlust | mittel | hoch | Datenschluessel im Keychain/Keystore (Geraetesperre); lokaler Speicher AES-256; Abmelden aus der Ferne nicht moeglich (Restrisiko) | gering bis mittel; Empfehlung: Geraetesperre, Passwort aendern nach Verlust (neuer Umschlag) |
| Schluesselverlust (Passwort und Recovery-Key vergessen) | mittel | mittel | Recovery-Key einmalig angezeigt, Kopierfunktion, Hinweis; lokale Daten bleiben | mittel, bewusst akzeptiert (E2E) |
| Falscher Stand ueberschreibt Daten (zwei Geraete) | gering | mittel | Dialog bei fremdem Server-Stand, kein stilles Ueberschreiben | gering |
| Metadaten-Leck (Geraetename, Zeitstempel, Groesse) | gering | gering | keine Zaehler; Geraetename frei waehlbar | gering |
| Anbieterzugriff (Supabase-Personal) | gering | hoch | Ciphertext; AVV; Region EU | gering |
| Schwaeche der Kryptografie | sehr gering | hoch | Standardverfahren (scrypt, AES-256-GCM, @noble), Parameter dokumentiert, Tests | sehr gering |

## 5. Ergebnis

Restrisiko nach Massnahmen gering bis mittel; das mittlere Restrisiko
(Schluesselverlust) ist eine bewusste Folge der Ende-zu-Ende-Architektur und
wird der Nutzerin beim Anlegen erklaert. Keine Konsultation der
Aufsichtsbehoerde (Art. 36) erforderlich. Wiedervorlage: bei Live-Sync,
bei Community-Zuordnung (Teilprojekt 3), bei mehr als 10.000 Konten.
```

- [ ] **Step 4: Store-Setup, ASO, CLAUDE.md**

`launch/store-setup.md`: im Abschnitt Privacy Labels / Data Safety (oder neu anlegen) ergaenzen: Apple "Health & Fitness: Health, linked to identity, not used for tracking", Google "Health info, encrypted in transit, user can request deletion". `launch/aso.md`: einen Satz in der Feature-Liste: "Cloud-Backup mit Konto: Ende-zu-Ende verschluesselt, Handywechsel ohne Verlust." (DE und EN).

`CLAUDE.md`: Fachlogik-Tabelle um `CloudBackup.js` (Rundtrip, Login-Entscheidung) und `CloudBackupStore.js` / `useCloudBackupStore.js` (gebuendelter Upload, Dialog) ergaenzen; Abschnitt "Datenhaltung" nach dem Konto-Absatz einen Absatz "Cloud-Backup (seit 2026-09-01)": ein verschluesselter Stand je Konto in `user_backups`, Datenschluessel im Keychain, Anmelde-Passwort abgeleitet, wer den Datenfluss aendert, aendert `data/legalContent.js` mit.

- [ ] **Step 5: Tests und Commit**

Run: `npm run build:legal && npm test`
Expected: `ALLE TESTS BESTANDEN`.

```bash
git add data/legalContent.js web launch/avv-dokumentation.md launch/dsfa.md launch/store-setup.md launch/aso.md CLAUDE.md
git commit -m "docs(legal): Cloud-Backup in Datenschutzerklaerung, AVV-Doku, DSFA-Entwurf"
```

---

## Self-Review

- Spec 1 (Tabelle, keine Zaehler, Cascade): Task 4 (Migration, REMOTE_COLUMNS). Delete-Policy ergaenzt fuer Widerruf (Spec 7).
- Spec 2 (CloudBackup.js, Store, Buendelung, Vordergrund, suppress): Task 4, 5, 6.
- Spec 3 (Login-Pruefung, restore/ask/upload, unlesbar): Task 5 (`checkOnLogin`), Task 6 (Login-Stellen, Dialog, Hinweis).
- Spec 4 (Keychain): Task 3.
- Spec 5 (Haertung): Task 1, 2.
- Spec 6 (Oberflaeche): Task 6.
- Spec 7 (Recht): Task 7.
- Typen: `keyStore.save(hex)/load()/clear()` in Task 3 Store und Bindung gleich. `getAccount() => { signedIn, userId, dataKey }` in Task 5 Factory, Test und Bindung gleich. `decideOnLogin({ remote, localHasData, lastUploadedAt })` Task 4/5 gleich. `formatBackupTime(iso, language)` in Task 6 definiert (CloudBackup.js) und in account.jsx/_layout/Dashboard genutzt.
- Abweichung vom Spec-Text: Ersteinrichtung-Konto-Texte kommen ueber neue Schluessel `skippedCloud`/`doneCloudOn`/`doneCloudOff` (Spec nennt nur die Saetze).
