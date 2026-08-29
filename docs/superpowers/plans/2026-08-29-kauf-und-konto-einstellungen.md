# Kaufschicht und Konto-Einstellungen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pro-Abos und Scan-Pakete ueber App Store und Google Play verkaufen (RevenueCat), Abo-Status ehrlich anzeigen, zu Kuendigung und Rueckerstattung in den Store fuehren, Kaeufe wiederherstellen; dazu E-Mail und Passwort aendern und Laborwerte bearbeiten.

**Architecture:** Neue Fachlogik `PurchaseLogic.js` (SDK injiziert, Node-testbar) und Store `usePurchaseStore.js`; `Entitlements.js` bleibt die Wahrheit fuer die Gates und spiegelt `tier` aus RevenueCat. Konto-Erweiterungen in `AccountLogic.js`/`AccountStore.js`. Zwei Screens (`paywall.jsx` als Modal, `subscription.jsx` unter Mehr). Das Native-Modul wird optional geladen, damit Expo Go weiter laeuft.

**Tech Stack:** `react-native-purchases@^10` (RevenueCat), Supabase Auth (Secure email change), zustand, expo-router, EAS Build (Development Build). Tests: esbuild + Node via `npm test`.

**Spec:** `docs/superpowers/specs/2026-08-29-kauf-und-konto-einstellungen-design.md`

## Global Constraints

- Preise NIE im Code oder in i18n; nur `product.priceString` aus dem SDK anzeigen.
- `Entitlements.js` bleibt einzige Gate-Wahrheit; `PAYWALL_ENFORCED` bleibt `false` in diesem Plan.
- Kein Kuendigungs- oder Storno-Knopf in der App; nur Links in den Store und ehrlicher Status.
- `react-native-purchases` nur per `try { require } catch` laden; ohne Native-Modul `available: false`, kein Absturz, Gates bleiben offen.
- Passwort, abgeleiteter Schluessel, Datenschluessel, Recovery-Key nie Richtung Netz (Ausnahme: Passwort an Supabase Auth). Passwort-Wechsel: erst lokal entsperren, dann `updateUser`, dann `saveKeyRecord`.
- Kein Gedankenstrich in Nutzertexten (DE/EN), keine Hex-Farben in Screens, Fachlogik nie in Screens, Kommentare Deutsch, Commits Englisch (Conventional Commits).
- i18n: kein Schluessel nur auf Englisch; Platzhalter in beiden Sprachen gleich.
- Wer `data/legalContent.js` aendert, laeuft `npm run build:legal`.
- Unversionierte Spike-Dateien (`SpikePdfImport.js`, `babel.config.js`, `spike-pdf/`, `pdfjs-dist` in package.json) werden VOR Task 1 auf den Branch `spike/pdf-text` verschoben (Schritt 0, Controller); danach ist der Arbeitsbaum sauber.

## Abweichungen von der Spec

Keine. Ergaenzung: Consumables (Scan-Pakete) lassen sich nach Apple-Regeln nicht wiederherstellen; "Kaeufe wiederherstellen" holt nur Abos zurueck. Der Screen sagt das in einem Satz.

---

### Schritt 0 (Controller, vor Task 1): Spike parken

```bash
git stash push -u -m "spike-pdf-text" -- SpikePdfImport.js babel.config.js spike-pdf/ "app/(tabs)/(more)/lab.jsx" package.json package-lock.json
git checkout -b spike/pdf-text
git stash pop
git add -A && git commit -m "spike(pdf): park PDF text extraction spike on its own branch"
git checkout phase-2t-account-grundlage
git status --short   # muss leer sein
```

---

### Task 1: Laborwert bearbeiten (`updateLabValue`, Formular im Bearbeiten-Modus)

**Files:**
- Modify: `LabValues.js` (Export `updateLabValue`)
- Modify: `useStore.js` (Aktion `updateLabValue`)
- Modify: `app/(tabs)/(more)/lab.jsx`
- Modify: `i18n/de/lab.js`, `i18n/en/lab.js`
- Test: `tests/lab-values.test.mjs` (neu)

**Interfaces:**
- Produces: `updateLabValue(labValues, id, input) => labValues'` (LabValues.js, rein); Store-Aktion `updateLabValue(id, input) => entry | null`.

- [ ] **Step 1: Fehlschlagenden Test schreiben**

`tests/lab-values.test.mjs`:

```js
// Tests fuer LabValues.js: anlegen und bearbeiten. Bearbeiten behaelt die
// ID und createdAt, validiert wie anlegen und laesst unbekannte IDs in Ruhe.
import { createLabValue, updateLabValue } from '../LabValues';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}

console.log('— updateLabValue —');
const first = createLabValue({ markerId: 'ferritin', value: '45', unit: 'ng/ml', measuredAt: '2026-08-01', labName: 'Labor A' });
const second = createLabValue({ markerId: 'vitamin-d', value: '30', unit: 'ng/ml', measuredAt: '2026-08-02' });
const list = [second, first];

const updated = updateLabValue(list, first.id, { markerId: 'ferritin', value: '52', unit: 'µg/l', measuredAt: '2026-08-03', labName: 'Labor B', referenceMin: '30', referenceMax: '300' });
const entry = updated.find((e) => e.id === first.id);
check('ID bleibt', entry.id === first.id);
check('createdAt bleibt', entry.createdAt === first.createdAt);
check('Wert, Einheit, Datum, Labor uebernommen', entry.value === 52 && entry.unit === 'µg/l' && entry.dateKey === '2026-08-03' && entry.labName === 'Labor B');
check('Referenzbereich aus Eingabe', entry.referenceMin === 30 && entry.referenceMax === 300);
check('anderer Eintrag unveraendert', updated.find((e) => e.id === second.id) === second);
check('Reihenfolge bleibt', updated[0].id === second.id && updated[1].id === first.id);
check('ungueltiger Wert: Liste unveraendert (gleiche Referenz)', updateLabValue(list, first.id, { value: 'abc', measuredAt: '2026-08-03' }) === list);
check('unbekannte ID: Liste unveraendert', updateLabValue(list, 'nope', { value: '1', measuredAt: '2026-08-03' }) === list);
check('Eingabe wird nicht mutiert', first.value === 45);

if (failures > 0) { console.error(`\n${failures} Fehler`); process.exit(1); }
console.log('\nAlle LabValues-Tests bestanden.');
```

- [ ] **Step 2: Test laufen lassen, Fehlschlag pruefen**

Run: `npm test 2>&1 | grep -A3 "lab-values"`
Expected: `No matching export ... "updateLabValue"`.

- [ ] **Step 3: `updateLabValue` in LabValues.js**

Nach `createLabValue` einfuegen:

```js
/**
 * updateLabValue(labValues, id, input)
 * Ersetzt einen Eintrag mit neu validierten Feldern. ID und createdAt
 * bleiben, damit Verlauf und Bericht stabil referenzieren. Ungueltige
 * Eingabe oder unbekannte ID: die Liste kommt unveraendert zurueck (gleiche
 * Referenz), der Aufrufer erkennt daran den Fehlschlag.
 */
export function updateLabValue(labValues = [], id, input = {}) {
  const index = labValues.findIndex((entry) => entry?.id === id);
  if (index < 0) return labValues;
  const fresh = createLabValue({ ...input, id });
  if (!fresh) return labValues;
  const next = labValues.slice();
  next[index] = { ...fresh, createdAt: labValues[index].createdAt };
  return next;
}
```

- [ ] **Step 4: Store-Aktion**

In `useStore.js` nach `deleteLabValue`:

```js
      updateLabValue: (id, input) => {
        const next = updateLabValue(get().labValues, id, input);
        if (next === get().labValues) return null;
        set({ labValues: next });
        return next.find((entry) => entry.id === id) ?? null;
      },
```

Import erweitern: `import { createLabValue, updateLabValue } from './LabValues';`

- [ ] **Step 5: Test gruen**

Run: `npm test 2>&1 | grep -A12 "lab-values"`
Expected: alle `ok`.

- [ ] **Step 6: Formular im Bearbeiten-Modus**

In `app/(tabs)/(more)/lab.jsx`:

1. State ergaenzen: `const [editingId, setEditingId] = useState(null);` und `const updateLabValue = useStore((state) => state.updateLabValue);`
2. Funktion `startEdit(entry)`: setzt `editingId`, `markerId`, `customName`, `value: String(entry.value)`, `unit`, `measuredAt: entry.dateKey`, `labName`, `refMin/refMax` (leer wenn null), scrollt nicht (Formular steht oben, Nutzerin sieht den Titel wechseln).
3. `save()`: wenn `editingId`, `updateLabValue(editingId, {...})` statt `addLabValue`; bei `null` Alert `lab.new.invalid`; danach Felder leeren UND `setEditingId(null)`.
4. `cancelEdit()`: Felder leeren, `setEditingId(null)`.
5. Ueberschrift des Formulars: `t(editingId ? 'lab.edit.title' : 'lab.new.title')`; Speichern-Knopf `t(editingId ? 'lab.edit.save' : 'lab.new.save')` (den bestehenden Schluessel fuer den Speichern-Knopf nachsehen und wiederverwenden); im Bearbeiten-Modus ein zweiter Quiet-Button `t('common.cancel')` mit `cancelEdit`.
6. In der Liste je Eintrag neben dem Loesch-Link einen Bearbeiten-Link: `<Text style={styles.deleteLink} onPress={() => startEdit(entry)}>{t('lab.list.edit')}</Text>` (gleicher Stil, gleiche Zeile; `styles.deleteLink` in `styles.actionLink` umbenennen, wenn das ohne Nebenwirkung geht, sonst belassen).

i18n DE (`i18n/de/lab.js`): `'lab.edit.title': 'Laborwert bearbeiten'`, `'lab.edit.save': 'Änderung speichern'`, `'lab.list.edit': 'Bearbeiten'`. EN: `'Edit lab value'`, `'Save changes'`, `'Edit'`.

- [ ] **Step 7: Volle Suite, Commit**

Run: `npm test` → gruen.

```bash
git add LabValues.js useStore.js "app/(tabs)/(more)/lab.jsx" i18n/de/lab.js i18n/en/lab.js tests/lab-values.test.mjs
git commit -m "feat(lab): edit existing lab values"
```

---

### Task 2: E-Mail und Passwort aendern (Logik, Store, Screen)

**Files:**
- Modify: `AccountLogic.js`, `AccountStore.js`
- Modify: `app/(tabs)/(more)/account.jsx`
- Modify: `i18n/de/account.js`, `i18n/en/account.js`
- Test: `tests/account-logic.test.mjs`, `tests/account-store.test.mjs`

**Interfaces:**
- Consumes: `unlockWithPassword`, `rewrapWithPassword` (AccountCrypto), `fetchKeyRecord`, `saveKeyRecord`, `RECOVERY_KEY_INVALID`-Muster (AccountLogic).
- Produces: `PASSWORD_INVALID = 'PASSWORD_INVALID'`; `changePassword(client, { userId, currentPassword, newPassword, randomBytes }) => Promise<{ dataKey }>`; `changeEmail(client, newEmail) => Promise<{ pendingEmail }>`; Store-Aktionen `changePassword(currentPassword, newPassword)`, `changeEmail(newEmail)`; State `pendingEmail`.

- [ ] **Step 1: Fehlschlagende Tests**

An `tests/account-logic.test.mjs` anhaengen (vor dem Abschluss-Block; Importe `changeEmail, changePassword, PASSWORD_INVALID` ergaenzen):

```js
console.log('— Passwort aendern —');
{
  const bundle = await createKeyBundle('altes-passwort-123', randomBytes);
  const client = makeClient({ keyRecord: bundle.record });
  const wrong = await (async () => { try { await changePassword(client, { userId: 'u1', currentPassword: 'falsch-falsch-1', newPassword: 'neues-passwort-2026', randomBytes }); return null; } catch (e) { return e; } })();
  check('falsches altes Passwort: PASSWORD_INVALID', wrong?.code === PASSWORD_INVALID);
  check('falsches altes Passwort: kein Netzaufruf', !client.calls.some(([n]) => n === 'updateUser' || n === 'upsert'));
  const result = await changePassword(client, { userId: 'u1', currentPassword: 'altes-passwort-123', newPassword: 'neues-passwort-2026', randomBytes });
  check('Datenschluessel bleibt derselbe', same(result.dataKey, bundle.dataKey));
  const order = client.calls.map(([n]) => n).filter((n) => n === 'updateUser' || n === 'upsert');
  check('Passwort zuerst, dann Record', order[0] === 'updateUser' && order[1] === 'upsert');
  check('neues Passwort entsperrt', same(await unlockWithPassword(client.stored, 'neues-passwort-2026'), bundle.dataKey));
  check('altes Passwort scheitert', await throws(() => unlockWithPassword(client.stored, 'altes-passwort-123')));
  check('Recovery-Key bleibt gueltig', same(unlockWithRecoveryKey(client.stored, bundle.recoveryKeyText), bundle.dataKey));
}
console.log('— E-Mail aendern —');
{
  const client = makeClient();
  client.auth.updateUser = async (args) => { client.calls.push(['updateUser', args]); return { data: { user: { id: 'u1', email: 'a@b.de', new_email: args.email } }, error: null }; };
  const r = await changeEmail(client, ' Neu@B.de ');
  check('updateUser mit getrimmter, kleingeschriebener Adresse', client.calls.some(([n, a]) => n === 'updateUser' && a.email === 'neu@b.de'));
  check('pendingEmail zurueck', r.pendingEmail === 'neu@b.de');
  check('ungueltige Adresse wirft ohne Netzaufruf', await throws(() => changeEmail(makeClient(), 'kein-mail')));
}
```

(`unlockWithPassword`, `unlockWithRecoveryKey` aus `../AccountCrypto` importieren, falls noch nicht.)

An `tests/account-store.test.mjs` anhaengen:

```js
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
```

Dazu im Fake `makeClient` eine Hilfe `listenerOf(client)` bereitstellen: `makeClient` legt `listener` in einer Closure ab; ergaenze `getListener: () => listener` am zurueckgegebenen Objekt und definiere oben `const listenerOf = (c) => c.getListener();`. `applySession` im Store muss `session.user.new_email` als `pendingEmail` uebernehmen.

- [ ] **Step 2: RED pruefen**

Run: `npm test 2>&1 | grep -B2 -A3 "changePassword\|changeEmail"` → Import-Fehler.

- [ ] **Step 3: AccountLogic.js**

```js
export const PASSWORD_INVALID = 'PASSWORD_INVALID';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Passwort aendern im angemeldeten Zustand. Erst lokal pruefen (falsches
 * altes Passwort verlaesst das Geraet nicht), dann Auth, dann Record; die
 * Reihenfolge ist dieselbe wie beim Reset, damit ein Abbruch den
 * Recovery-Key intakt laesst.
 */
export async function changePassword(client, { userId, currentPassword, newPassword, randomBytes }) {
  const record = await fetchKeyRecord(client);
  if (!record) throw new Error('AccountLogic: kein Schluesseldatensatz');
  let dataKey;
  try {
    dataKey = await unlockWithPassword(record, currentPassword);
  } catch {
    const error = new Error('AccountLogic: altes Passwort passt nicht');
    error.code = PASSWORD_INVALID;
    throw error;
  }
  const next = await rewrapWithPassword(record, dataKey, newPassword, randomBytes);
  unwrap(await client.auth.updateUser({ password: newPassword }));
  await saveKeyRecord(client, userId, next);
  return { dataKey };
}

/**
 * E-Mail aendern. Supabase (Secure email change) schickt Links an alte und
 * neue Adresse; bis beide bestaetigt sind, steht die neue in user.new_email.
 */
export async function changeEmail(client, newEmail) {
  const email = String(newEmail ?? '').trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw new Error('AccountLogic: ungueltige E-Mail-Adresse');
  const data = unwrap(await client.auth.updateUser({ email }));
  return { pendingEmail: data.user?.new_email ?? email };
}
```

- [ ] **Step 4: AccountStore.js**

- `ANONYMOUS_STATE` und Initialzustand: `pendingEmail: null`.
- `applySession`: `pendingEmail: session.user.new_email ?? null` mitsetzen.
- Listener: `USER_UPDATED` mit Session → `applySession(nextSession)` (faellt in den bestehenden `nextSession?.user`-Zweig, kein eigener Fall noetig; Kommentar ergaenzen).
- Aktionen:

```js
      changePassword: (currentPassword, newPassword) =>
        withBusy(async () => {
          const result = await changePassword(client, { userId: get().userId, currentPassword, newPassword, randomBytes });
          set({ dataKey: result.dataKey });
        }),

      changeEmail: (newEmail) =>
        withBusy(async () => {
          const result = await changeEmail(client, newEmail);
          set({ pendingEmail: result.pendingEmail });
        }),
```

- [ ] **Step 5: GREEN**

Run: beide fokussierten Tests, dann `npm test` → gruen.

- [ ] **Step 6: Screen und Texte**

`i18n/de/account.js` ergaenzen:

```js
  'account.settings.title': 'Konto-Einstellungen',
  'account.settings.email': 'E-Mail-Adresse ändern',
  'account.settings.emailText': 'Du bekommst je einen Bestätigungslink an die alte und die neue Adresse. Die Änderung gilt, sobald beide bestätigt sind.',
  'account.settings.emailPending': 'Wechsel zu {email} wartet auf Bestätigung.',
  'account.settings.emailField': 'Neue E-Mail-Adresse',
  'account.settings.emailAction': 'Bestätigungslinks senden',
  'account.settings.emailSent': 'Links sind unterwegs an beide Adressen.',
  'account.settings.password': 'Passwort ändern',
  'account.settings.passwordText': 'Dein Recovery-Key bleibt gültig. Der Datenschlüssel wird mit dem neuen Passwort neu verschlüsselt.',
  'account.settings.currentPassword': 'Aktuelles Passwort',
  'account.settings.newPassword': 'Neues Passwort',
  'account.settings.passwordAction': 'Passwort ändern',
  'account.settings.passwordDone': 'Passwort geändert',
  'account.error.currentPassword': 'Das aktuelle Passwort passt nicht.',
```

EN entsprechend (`'Account settings'`, `'Change email address'`, `'You will receive a confirmation link at both the old and the new address. The change applies once both are confirmed.'`, `'Change to {email} is waiting for confirmation.'`, `'New email address'`, `'Send confirmation links'`, `'Links are on their way to both addresses.'`, `'Change password'`, `'Your recovery key stays valid. The data key is re-encrypted with the new password.'`, `'Current password'`, `'New password'`, `'Change password'`, `'Password changed'`, `'The current password does not match.'`).

In `account.jsx`, `SignedInView`: zwischen Status-Karte und Loesch-Karte zwei einklappbare Karten (State `openSection: null | 'email' | 'password'`, Kopfzeile als Pressable):
- E-Mail: Text, ggf. `emailPending` mit `pendingEmail`, Feld, Knopf → `changeEmail`; Erfolg Alert `emailSent`; Fehler `describeError`.
- Passwort: Text, drei Felder (aktuell, neu, neu wiederholen), Validierung (min 10, gleich), Knopf → `changePassword`; `error.code === PASSWORD_INVALID` → Inline `account.error.currentPassword`; sonst `describeError`. Erfolg Alert `passwordDone`, Felder leeren.
`PASSWORD_INVALID` aus AccountLogic importieren. Styles aus dem Screen wiederverwenden.

- [ ] **Step 7: Suite, Commit**

```bash
git add AccountLogic.js AccountStore.js "app/(tabs)/(more)/account.jsx" i18n/de/account.js i18n/en/account.js tests/account-logic.test.mjs tests/account-store.test.mjs
git commit -m "feat(account): change email and password while signed in"
```

---

### Task 3: PurchaseLogic.js und Entitlement-Spiegelung (TDD)

**Files:**
- Modify: `package.json` (react-native-purchases)
- Create: `purchaseConfig.js`, `PurchaseLogic.js`
- Modify: `Entitlements.js` (`applyPurchaseStatus`)
- Test: `tests/purchase-logic.test.mjs`

**Interfaces:**
- Produces:
  - `purchaseConfig.js`: `REVENUECAT_API_KEY_IOS`, `REVENUECAT_API_KEY_ANDROID` (leere Strings bis Nadine sie eintraegt), `ENTITLEMENT_ID = 'pro'`, `PRODUCT_IDS = { yearly: 'pro_yearly', monthly: 'pro_monthly', credits10: 'credits_10', credits50: 'credits_50' }`, `CREDIT_AMOUNTS = { credits_10: 10, credits_50: 50 }`, `MANAGE_URL_IOS = 'https://apps.apple.com/account/subscriptions'`, `MANAGE_URL_ANDROID = 'https://play.google.com/store/account/subscriptions?package=com.indoohome.mysuplea'`, `REFUND_URL_IOS = 'https://reportaproblem.apple.com'`, `REFUND_URL_ANDROID = 'https://support.google.com/googleplay/answer/2479637'`.
  - `PurchaseLogic.js`: `PURCHASE_STATUS = { FREE, TRIAL, ACTIVE, CANCELLED, GRACE, EXPIRED, PENDING }`; `mapCustomerInfo(customerInfo, now = new Date()) => { status, expiresAt, willRenew, platform, productId, isPro }`; `creditsForProduct(productId) => number`; `loadOfferings(sdk) => Promise<{ yearly, monthly, credits: [] } | null>` (Pakete aus `offerings.current.availablePackages`, nach `product.identifier` zugeordnet); `purchase(sdk, pkg) => Promise<{ cancelled: boolean, customerInfo|null, productId|null }>`; `restore(sdk) => Promise<customerInfo>`; `linkAccount(sdk, userId)`, `unlinkAccount(sdk)`; `isNativeError(error)`.
  - `Entitlements.js`: `applyPurchaseStatus(entitlement, mapped) => entitlement'` (setzt `tier` pro wenn `mapped.isPro`, sonst free; sonst nichts).

- [ ] **Step 1: Paket installieren**

Run: `npx expo install react-native-purchases`
Expected: `react-native-purchases` (10.x) in package.json. Kein Config-Plugin noetig (Android-Billing-Permission bringt das Paket mit).

- [ ] **Step 2: Fehlschlagenden Test**

`tests/purchase-logic.test.mjs`:

```js
// Tests fuer PurchaseLogic.js gegen ein Fake-SDK. Kein Netzwerk, kein
// Native-Modul. Geprueft: die Uebersetzung des RevenueCat-Status in unseren
// Abo-Status, Kauf und Wiederherstellen, Verknuepfung mit dem Konto.
import { PURCHASE_STATUS, creditsForProduct, isNativeError, linkAccount, loadOfferings, mapCustomerInfo, purchase, restore, unlinkAccount } from '../PurchaseLogic';
import { EMPTY_ENTITLEMENT, applyPurchaseStatus, isPro } from '../Entitlements';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}
const NOW = new Date('2026-09-01T10:00:00Z');
const later = '2027-09-01T10:00:00Z';
const earlier = '2026-08-01T10:00:00Z';
const info = (pro) => ({ entitlements: { active: pro ? { pro } : {} , all: pro ? { pro } : {} }, nonSubscriptionTransactions: [] });
const ent = (over) => ({ isActive: true, willRenew: true, periodType: 'NORMAL', store: 'APP_STORE', expirationDate: later, productIdentifier: 'pro_yearly', billingIssueDetectedAt: null, unsubscribeDetectedAt: null, ...over });

console.log('— Status-Uebersetzung —');
check('kein Entitlement: free', mapCustomerInfo(info(null), NOW).status === PURCHASE_STATUS.FREE);
check('aktiv, verlaengert: active + isPro', (() => { const m = mapCustomerInfo(info(ent()), NOW); return m.status === PURCHASE_STATUS.ACTIVE && m.isPro && m.willRenew && m.platform === 'ios' && m.productId === 'pro_yearly'; })());
check('Trial: trial', mapCustomerInfo(info(ent({ periodType: 'TRIAL' })), NOW).status === PURCHASE_STATUS.TRIAL);
check('gekuendigt, noch aktiv: cancelled + isPro', (() => { const m = mapCustomerInfo(info(ent({ willRenew: false, unsubscribeDetectedAt: earlier })), NOW); return m.status === PURCHASE_STATUS.CANCELLED && m.isPro; })());
check('Zahlungsproblem: grace + isPro', (() => { const m = mapCustomerInfo(info(ent({ billingIssueDetectedAt: earlier })), NOW); return m.status === PURCHASE_STATUS.GRACE && m.isPro; })());
check('abgelaufen (nur in all, nicht active): expired, nicht pro', (() => { const ci = { entitlements: { active: {}, all: { pro: ent({ isActive: false, expirationDate: earlier }) } }, nonSubscriptionTransactions: [] }; const m = mapCustomerInfo(ci, NOW); return m.status === PURCHASE_STATUS.EXPIRED && !m.isPro && m.expiresAt === earlier; })());
check('Play Store: platform android', mapCustomerInfo(info(ent({ store: 'PLAY_STORE' })), NOW).platform === 'android');

console.log('— Entitlement-Spiegelung —');
const pro = applyPurchaseStatus(EMPTY_ENTITLEMENT, mapCustomerInfo(info(ent()), NOW));
check('isPro true nach aktivem Abo', isPro(pro));
check('lokale Zaehler bleiben', pro.freeScansUsed === 0 && pro.extraCredits === 0);
check('zurueck auf free nach Ablauf', !isPro(applyPurchaseStatus(pro, mapCustomerInfo(info(null), NOW))));

console.log('— Credits —');
check('credits_10 → 10, credits_50 → 50, unbekannt → 0', creditsForProduct('credits_10') === 10 && creditsForProduct('credits_50') === 50 && creditsForProduct('pro_yearly') === 0);

console.log('— Angebote, Kauf, Wiederherstellen, Konto —');
function makeSdk() {
  const calls = [];
  const pkg = (id) => ({ identifier: id, product: { identifier: id, priceString: '29,99 €' } });
  return {
    calls,
    getOfferings: async () => ({ current: { availablePackages: [pkg('pro_yearly'), pkg('pro_monthly'), pkg('credits_10'), pkg('credits_50')] } }),
    purchasePackage: async (p) => { calls.push(['purchase', p.identifier]); if (p.identifier === 'cancel') { const e = new Error('cancelled'); e.userCancelled = true; throw e; } return { customerInfo: info(ent()), productIdentifier: p.identifier }; },
    restorePurchases: async () => { calls.push(['restore']); return info(ent()); },
    logIn: async (id) => { calls.push(['logIn', id]); return { customerInfo: info(ent()), created: false }; },
    logOut: async () => { calls.push(['logOut']); return info(null); },
  };
}
{
  const sdk = makeSdk();
  const offers = await loadOfferings(sdk);
  check('Pakete zugeordnet', offers.yearly.identifier === 'pro_yearly' && offers.monthly.identifier === 'pro_monthly' && offers.credits.length === 2);
  check('ohne current: null', (await loadOfferings({ getOfferings: async () => ({ current: null }) })) === null);
  const bought = await purchase(sdk, offers.yearly);
  check('Kauf liefert customerInfo und productId', !bought.cancelled && bought.productId === 'pro_yearly' && bought.customerInfo);
  const cancelled = await purchase(sdk, { identifier: 'cancel', product: { identifier: 'cancel' } });
  check('Abbruch ist kein Fehler', cancelled.cancelled === true && cancelled.customerInfo === null);
  check('restore ruft SDK', (await restore(sdk)) && sdk.calls.some(([n]) => n === 'restore'));
  await linkAccount(sdk, 'u1'); await unlinkAccount(sdk);
  check('logIn/logOut durchgereicht', sdk.calls.some(([n, a]) => n === 'logIn' && a === 'u1') && sdk.calls.some(([n]) => n === 'logOut'));
}
check('isNativeError erkennt fehlendes Modul', isNativeError(new Error("Cannot find native module 'RNPurchases'")));

if (failures > 0) { console.error(`\n${failures} Fehler`); process.exit(1); }
console.log('\nAlle PurchaseLogic-Tests bestanden.');
```

- [ ] **Step 3: RED**

Run: `npm test 2>&1 | grep -A3 "purchase-logic"` → `Could not resolve "../PurchaseLogic"`.

- [ ] **Step 4: purchaseConfig.js, PurchaseLogic.js, Entitlements.applyPurchaseStatus**

`purchaseConfig.js`:

```js
/**
 * purchaseConfig.js
 * RevenueCat-Konfiguration. Public-Keys sind oeffentlich (wie der
 * Supabase-Anon-Key), Produkt-IDs muessen mit App Store Connect, Play
 * Console und dem RevenueCat-Offering "default" uebereinstimmen (Spec,
 * Abschnitt Store-Konfiguration). Leere Keys = Kaufschicht nicht
 * verfuegbar, die App laeuft trotzdem.
 */
export const REVENUECAT_API_KEY_IOS = '';
export const REVENUECAT_API_KEY_ANDROID = '';
export const ENTITLEMENT_ID = 'pro';
export const PRODUCT_IDS = { yearly: 'pro_yearly', monthly: 'pro_monthly', credits10: 'credits_10', credits50: 'credits_50' };
export const CREDIT_AMOUNTS = { credits_10: 10, credits_50: 50 };
export const MANAGE_URL_IOS = 'https://apps.apple.com/account/subscriptions';
export const MANAGE_URL_ANDROID = 'https://play.google.com/store/account/subscriptions?package=com.indoohome.mysuplea';
export const REFUND_URL_IOS = 'https://reportaproblem.apple.com';
export const REFUND_URL_ANDROID = 'https://support.google.com/googleplay/answer/2479637';
```

`PurchaseLogic.js`:

```js
/**
 * PurchaseLogic.js
 * ─────────────────────────────────────────────────────────────
 * Kaufschicht ohne UI. Das RevenueCat-SDK wird uebergeben (wie der
 * Supabase-Client in AccountLogic), damit Tests einen Fake einsetzen und
 * das Modul in Node laeuft. Uebersetzt den Status des Stores in sieben
 * ehrliche Zustaende, die die Abo-Verwaltung woertlich anzeigt.
 *
 * GRUNDSATZ: Kuendigen und Stornieren passieren im Store. Hier gibt es
 * kaufen, wiederherstellen, Status lesen und das Konto verknuepfen, sonst
 * nichts. Preise kommen nur aus dem SDK (product.priceString).
 */
import { CREDIT_AMOUNTS, ENTITLEMENT_ID, PRODUCT_IDS } from './purchaseConfig';

export const PURCHASE_STATUS = {
  FREE: 'free', TRIAL: 'trial', ACTIVE: 'active', CANCELLED: 'cancelled',
  GRACE: 'grace', EXPIRED: 'expired', PENDING: 'pending',
};

function platformOf(store) {
  if (store === 'APP_STORE' || store === 'MAC_APP_STORE') return 'ios';
  if (store === 'PLAY_STORE' || store === 'AMAZON') return 'android';
  return 'unknown';
}

export function mapCustomerInfo(customerInfo, now = new Date()) {
  const active = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] ?? null;
  const any = customerInfo?.entitlements?.all?.[ENTITLEMENT_ID] ?? null;
  const base = { status: PURCHASE_STATUS.FREE, expiresAt: null, willRenew: false, platform: 'unknown', productId: null, isPro: false };

  if (active) {
    let status = PURCHASE_STATUS.ACTIVE;
    if (active.billingIssueDetectedAt) status = PURCHASE_STATUS.GRACE;
    else if (active.periodType === 'TRIAL') status = PURCHASE_STATUS.TRIAL;
    else if (active.willRenew === false || active.unsubscribeDetectedAt) status = PURCHASE_STATUS.CANCELLED;
    return { status, expiresAt: active.expirationDate ?? null, willRenew: Boolean(active.willRenew), platform: platformOf(active.store), productId: active.productIdentifier ?? null, isPro: true };
  }
  if (any && any.expirationDate && new Date(any.expirationDate) < now) {
    return { ...base, status: PURCHASE_STATUS.EXPIRED, expiresAt: any.expirationDate, platform: platformOf(any.store), productId: any.productIdentifier ?? null };
  }
  return base;
}

export function creditsForProduct(productId) {
  return CREDIT_AMOUNTS[productId] ?? 0;
}

export async function loadOfferings(sdk) {
  const offerings = await sdk.getOfferings();
  const packages = offerings?.current?.availablePackages ?? null;
  if (!packages) return null;
  const byProduct = (id) => packages.find((p) => p.product?.identifier === id) ?? null;
  return {
    yearly: byProduct(PRODUCT_IDS.yearly),
    monthly: byProduct(PRODUCT_IDS.monthly),
    credits: [PRODUCT_IDS.credits10, PRODUCT_IDS.credits50].map(byProduct).filter(Boolean),
  };
}

export async function purchase(sdk, pkg) {
  try {
    const result = await sdk.purchasePackage(pkg);
    return { cancelled: false, customerInfo: result.customerInfo, productId: result.productIdentifier ?? pkg.product?.identifier ?? null };
  } catch (error) {
    if (error?.userCancelled) return { cancelled: true, customerInfo: null, productId: null };
    throw error;
  }
}

export const restore = (sdk) => sdk.restorePurchases();
export const linkAccount = async (sdk, userId) => (await sdk.logIn(userId)).customerInfo;
export const unlinkAccount = (sdk) => sdk.logOut();

export function isNativeError(error) {
  return /native module|RNPurchases|not linked/i.test(String(error?.message ?? ''));
}
```

`Entitlements.js` anfuegen:

```js
/**
 * Spiegelt den Abo-Status aus dem Store (PurchaseLogic.mapCustomerInfo) in
 * das Tier. Nur tier; die lokalen Zaehler bleiben, RevenueCat zaehlt keine
 * Scans.
 */
export function applyPurchaseStatus(entitlement, mapped) {
  return setTier(entitlement, mapped?.isPro ? TIERS.PRO : TIERS.FREE);
}
```

- [ ] **Step 5: GREEN, Commit**

Run: `npm test` → gruen.

```bash
git add package.json package-lock.json purchaseConfig.js PurchaseLogic.js Entitlements.js tests/purchase-logic.test.mjs
git commit -m "feat(purchase): RevenueCat logic, status mapping and entitlement mirror"
```

---

### Task 4: usePurchaseStore.js, SDK-Loader, Verdrahtung mit Konto und App-Start

**Files:**
- Create: `PurchaseStore.js` (Factory), `usePurchaseStore.js`, `purchaseSdk.js`
- Modify: `AccountStore.js`, `useAccountStore.js`, `app/_layout.jsx`
- Test: `tests/purchase-store.test.mjs`

**Interfaces:**
- Produces: `createPurchaseStore({ sdk|null, apiKey, getEntitlement, setEntitlement, addCredits })`; State `{ available, configured, offerings, busy, status, expiresAt, willRenew, platform, lastError }`; Aktionen `initialize(userId|null)`, `refresh()`, `loadOfferings()`, `buy(pkg)`, `restore()`, `onSessionChange(userId|null)`.
- `purchaseSdk.js`: `loadPurchasesSdk() => sdk | null` (try/require).
- `AccountStore`: neue optionale Dep `onSessionChange(userId|null)`, aufgerufen nach `applySession` bei Wechsel der userId.

- [ ] **Step 1: Test**

`tests/purchase-store.test.mjs` prueft mit dem Fake-SDK aus Task 3 (kopieren): ohne SDK `available === false` und `buy` wirft nicht, sondern setzt `lastError = 'unavailable'`; mit SDK `initialize('u1')` ruft `configure` + `logIn('u1')` und setzt Status `active`; `buy(yearly)` setzt Status und ruft `setEntitlement` mit `tier: 'pro'`; `buy(credits_10)` ruft `addCredits(10)`; `restore()` aktualisiert Status; `onSessionChange(null)` ruft `logOut`; Listener-Callback (Fake speichert ihn aus `addCustomerInfoUpdateListener`) mit `info(null)` setzt Status `free` und `tier` free. Fake-SDK um `configure`, `isConfigured`, `getCustomerInfo`, `addCustomerInfoUpdateListener` erweitern.

- [ ] **Step 2: PurchaseStore.js**

```js
import { create } from 'zustand';
import { applyPurchaseStatus } from './Entitlements';
import { PURCHASE_STATUS, creditsForProduct, linkAccount, loadOfferings, mapCustomerInfo, purchase, restore, unlinkAccount } from './PurchaseLogic';

export function createPurchaseStore({ sdk, apiKey, getEntitlement, setEntitlement, addCredits }) {
  return create((set, get) => {
    const apply = (customerInfo) => {
      const mapped = mapCustomerInfo(customerInfo);
      set({ status: mapped.status, expiresAt: mapped.expiresAt, willRenew: mapped.willRenew, platform: mapped.platform });
      setEntitlement(applyPurchaseStatus(getEntitlement(), mapped));
    };
    const withBusy = async (fn) => { set({ busy: true, lastError: null }); try { return await fn(); } catch (error) { set({ lastError: error?.message ?? 'error' }); throw error; } finally { set({ busy: false }); } };

    return {
      available: Boolean(sdk && apiKey), configured: false, offerings: null, busy: false,
      status: PURCHASE_STATUS.FREE, expiresAt: null, willRenew: false, platform: 'unknown', lastError: null,

      initialize: async (userId) => {
        if (!get().available) return;
        if (!get().configured) {
          sdk.configure({ apiKey, appUserID: userId ?? null });
          sdk.addCustomerInfoUpdateListener((info) => apply(info));
          set({ configured: true });
        }
        const info = userId ? await linkAccount(sdk, userId) : await sdk.getCustomerInfo();
        apply(info);
      },
      refresh: async () => { if (get().configured) apply(await sdk.getCustomerInfo()); },
      loadOfferings: () => withBusy(async () => { if (!get().available) return null; const offerings = await loadOfferings(sdk); set({ offerings }); return offerings; }),
      buy: (pkg) => withBusy(async () => {
        if (!get().available) { set({ lastError: 'unavailable' }); return { cancelled: true }; }
        const result = await purchase(sdk, pkg);
        if (result.cancelled) return result;
        apply(result.customerInfo);
        const credits = creditsForProduct(result.productId);
        if (credits > 0) addCredits(credits);
        return result;
      }),
      restore: () => withBusy(async () => { if (!get().available) return null; const info = await restore(sdk); apply(info); return mapCustomerInfo(info); }),
      onSessionChange: async (userId) => {
        if (!get().configured) return;
        const info = userId ? await linkAccount(sdk, userId) : await unlinkAccount(sdk);
        apply(info);
      },
    };
  });
}
```

Der `buy`-Rueckgabewert bei `unavailable` muss im Test `lastError === 'unavailable'` sichtbar bleiben: `withBusy` setzt `lastError: null` am Anfang, daher innerhalb setzen (wie oben) und im `finally` nicht ueberschreiben.

- [ ] **Step 3: purchaseSdk.js und usePurchaseStore.js**

```js
// purchaseSdk.js: Native-Modul optional laden. In Expo Go fehlt es; dann
// null, und die Kaufschicht meldet "nicht verfuegbar" statt abzustuerzen.
export function loadPurchasesSdk() {
  try {
    // eslint-disable-next-line global-require
    const mod = require('react-native-purchases');
    const Purchases = mod.default ?? mod;
    return typeof Purchases?.configure === 'function' ? Purchases : null;
  } catch {
    return null;
  }
}
```

```js
// usePurchaseStore.js
import { Platform } from 'react-native';
import { createPurchaseStore } from './PurchaseStore';
import { loadPurchasesSdk } from './purchaseSdk';
import { REVENUECAT_API_KEY_ANDROID, REVENUECAT_API_KEY_IOS } from './purchaseConfig';
import { useStore } from './useStore';

export const usePurchaseStore = createPurchaseStore({
  sdk: loadPurchasesSdk(),
  apiKey: Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID,
  getEntitlement: () => useStore.getState().entitlement,
  setEntitlement: (entitlement) => useStore.setState({ entitlement }),
  addCredits: (count) => useStore.getState().grantScanCredits(count),
});
export default usePurchaseStore;
```

- [ ] **Step 4: Konto ↔ Kauf verdrahten**

`AccountStore.js`: Factory-Option `onSessionChange` (default no-op). In `applySession` nach dem `set`: wenn sich `userId` gegenueber vorher geaendert hat, `onSessionChange(userId)` aufrufen (auch bei `null` nach Logout/Loeschung). `useAccountStore.js`: `onSessionChange: (userId) => usePurchaseStore.getState().onSessionChange(userId).catch(() => {})`. Ringschluss pruefen: `usePurchaseStore` importiert `useStore`, nicht `useAccountStore`; `useAccountStore` importiert `usePurchaseStore`. Kein Zyklus.

`app/_layout.jsx`: im bestehenden Konto-Effekt nach `initialize()`: `usePurchaseStore.getState().initialize(useAccountStore.getState().userId).catch((error) => console.error('[Layout] Kaufschicht', error))`. Reihenfolge: erst Konto-Restore abwarten (`.then`), dann Kaufschicht mit der userId.

- [ ] **Step 5: Suite, Commit**

```bash
git add PurchaseStore.js usePurchaseStore.js purchaseSdk.js AccountStore.js useAccountStore.js app/_layout.jsx tests/purchase-store.test.mjs tests/account-store.test.mjs
git commit -m "feat(purchase): purchase store, optional native SDK, account linking"
```

---

### Task 5: Texte DE/EN, Menuepunkt, Routen

**Files:**
- Create: `i18n/de/purchase.js`, `i18n/en/purchase.js`
- Modify: `i18n/de/index.js`, `i18n/en/index.js`, `i18n/de/common.js`, `i18n/en/common.js`, `i18n/de/home.js`, `i18n/en/home.js`
- Modify: `app/(tabs)/(more)/menu.jsx`, `app/(tabs)/(more)/_layout.jsx`, `app/_layout.jsx`

- [ ] **Step 1: Kataloge**

`i18n/de/purchase.js` (EN spiegeln, Platzhalter identisch):

```js
export default {
  'nav.subscription': 'Abo',
  'home.nav.subscription.title': 'Abo und Käufe',
  'home.nav.subscription.subtitle': 'Status, Abo verwalten, Käufe wiederherstellen.',

  'paywall.kicker': 'MySuplea Pro',
  'paywall.title': 'Alles ohne Limit, nichts verkauft',
  'paywall.intro': 'Pro finanziert die KI-Auswertung deiner Scans und die Pflege der Wirkstoff-Datenbank. Keine Werbung, kein Affiliate, keine Markenkooperation.',
  'paywall.feature.scans': 'Unbegrenzte KI-Foto-Scans (Fair Use)',
  'paywall.feature.inventory': 'Unbegrenzter Bestand',
  'paywall.feature.outcome': 'Wirkungskontrolle',
  'paywall.feature.cost': 'Kostenanalyse',
  'paywall.feature.lab': 'Laborwerte-Verlauf',
  'paywall.feature.cycles': 'Kur-Zyklen',
  'paywall.yearly': 'Jahresabo',
  'paywall.monthly': 'Monatsabo',
  'paywall.trial': '7 Tage kostenlos testen, danach {price}',
  'paywall.perYear': '{price} pro Jahr',
  'paywall.perMonth': '{price} pro Monat',
  'paywall.credits.title': 'Lieber einzeln? Scan-Pakete',
  'paywall.credits.item': '{count} KI-Scans für {price}',
  'paywall.buy': 'Auswählen',
  'paywall.legal': 'Das Abo verlängert sich automatisch, bis du es kündigst. Die Belastung erfolgt über dein Apple- oder Google-Konto. Kündigen kannst du jederzeit in den Abo-Einstellungen deines Store-Kontos, mindestens 24 Stunden vor Ablauf der laufenden Periode.',
  'paywall.restore': 'Käufe wiederherstellen',
  'paywall.unavailable': 'Käufe sind in dieser Testversion nicht verfügbar. In der App aus dem Store funktioniert es.',
  'paywall.loading': 'Preise werden geladen',
  'paywall.loadError': 'Preise gerade nicht abrufbar.',
  'paywall.retry': 'Neu laden',
  'paywall.error.title': 'Kauf nicht abgeschlossen',
  'paywall.success.title': 'Willkommen bei Pro',
  'paywall.success.credits': '{count} Scans wurden deinem Guthaben gutgeschrieben.',

  'subscription.kicker': 'Abo und Käufe',
  'subscription.title': 'Dein Status',
  'subscription.status.free': 'Free',
  'subscription.status.trial': 'Testphase bis {date}',
  'subscription.status.active': 'Pro, verlängert sich am {date}',
  'subscription.status.cancelled': 'Pro, gekündigt, läuft bis {date}',
  'subscription.status.grace': 'Zahlungsproblem, bitte im Store prüfen. Pro bleibt bis {date}.',
  'subscription.status.expired': 'Pro abgelaufen am {date}',
  'subscription.status.pending': 'Kauf wird geprüft',
  'subscription.platform.ios': 'über den App Store',
  'subscription.platform.android': 'über Google Play',
  'subscription.quota.title': 'Scan-Guthaben',
  'subscription.quota.free': 'Freie KI-Scans übrig',
  'subscription.quota.fairUse': 'Fair Use übrig (Monat)',
  'subscription.quota.credits': 'Gekaufte Scans',
  'subscription.manage': 'Abo verwalten',
  'subscription.manageText': 'Kündigen, Tarif wechseln und Zahlungsmittel ändern geht im Abo-Bereich deines Store-Kontos. Nach einer Kündigung zeigt die App hier "gekündigt, läuft bis".',
  'subscription.restore': 'Käufe wiederherstellen',
  'subscription.restoreText': 'Holt ein bestehendes Abo auf dieses Gerät. Scan-Pakete sind Verbrauchsgüter und lassen sich nicht wiederherstellen.',
  'subscription.restore.none': 'Kein Abo zu diesem Store-Konto gefunden.',
  'subscription.restore.done': 'Abo wiederhergestellt.',
  'subscription.refund': 'Rückerstattung beantragen',
  'subscription.refundText': 'Über Rückerstattungen entscheiden Apple und Google, nicht wir. Der Antrag läuft über den Store.',
  'subscription.buy': 'Pro ansehen',
  'subscription.unavailable': 'Käufe sind in dieser Testversion nicht verfügbar.',

  'proGate.action': 'Pro ansehen',
  'scanner.limit.action': 'Pro ansehen',
  'addSupplement.alert.limitAction': 'Pro ansehen',
};
```

Registrierung wie bei `account` (Import und Spread in beiden Index-Dateien). `nav.subscription` und `home.nav.subscription.*` stehen hier statt in common/home, damit die Datei geschlossen bleibt; die Index-Reihenfolge stellt sicher, dass sie geladen werden.

- [ ] **Step 2: Menue und Routen**

`menu.jsx`: MenuRow "Abo und Käufe" → `/subscription` direkt VOR der Konto-Zeile. `(more)/_layout.jsx`: `<Stack.Screen name="subscription" options={{ title: t('nav.subscription') }} />`. `app/_layout.jsx`: im geschuetzten Block `<Stack.Screen name="paywall" options={{ title: t('paywall.kicker'), presentation: 'modal' }} />`.

- [ ] **Step 3: Suite, Commit**

```bash
git add i18n app/\(tabs\)/\(more\)/menu.jsx app/\(tabs\)/\(more\)/_layout.jsx app/_layout.jsx
git commit -m "feat(purchase): copy in de/en, menu entry and routes"
```

---

### Task 6: Screens paywall.jsx und subscription.jsx, Gates oeffnen den Kaufscreen

**Files:**
- Create: `app/paywall.jsx`, `app/(tabs)/(more)/subscription.jsx`
- Modify: `components/ProGate.jsx`, `app/(tabs)/(scan)/scanner.jsx`, `app/AddSupplement.jsx`

- [ ] **Step 1: paywall.jsx**

Modal-Screen. Beim Oeffnen `loadOfferings()`. Aufbau (nur Tokens, Muster aus `account.jsx`):
1. Kicker, Titel, Intro.
2. Sechs Feature-Zeilen (Haekchen-Icon aus `@expo/vector-icons` Feather `check`).
3. Zwei Karten Jahres/Monats: Name, `t('paywall.perYear', { price: pkg.product.priceString })`, bei `pkg.product.introPrice` (Trial) Zeile `t('paywall.trial', { price })`; Knopf `paywall.buy` → `buy(pkg)`; Erfolg (nicht cancelled): Alert `paywall.success.title`, `router.back()`.
4. Credits-Abschnitt: je Paket `t('paywall.credits.item', { count: creditsForProduct(id), price })`, Knopf; Erfolg Alert `paywall.success.credits`.
5. Pflichttext `paywall.legal`, Quiet-Buttons `paywall.restore` (→ `restore()`, Alert `subscription.restore.done` bzw. `.none`), Links `nav.terms` → `/terms`, `nav.privacy` → `/privacy`.
6. Zustaende: `!available` → nur Kicker, Titel, `paywall.unavailable`; `busy` → Spinner; `lastError && !offerings` → `paywall.loadError` + `paywall.retry`.
Fehler bei `buy` (nicht cancelled): Alert `paywall.error.title` mit `error.message`.

- [ ] **Step 2: subscription.jsx**

Statuskarte: `t(\`subscription.status.${status}\`, { date })` mit `date = expiresAt ? new Date(expiresAt).toLocaleDateString() : ''`, Plattformzeile. Scan-Guthaben aus `evaluateVisionScan(entitlement)` (drei Zeilen wie in settings.jsx). Karten: Abo verwalten (`Linking.openURL(Platform.OS === 'ios' ? MANAGE_URL_IOS : MANAGE_URL_ANDROID)`), Wiederherstellen, Rueckerstattung (`REFUND_URL_*`), "Pro ansehen" wenn `status` free/expired → `router.push('/paywall')`. `!available` → Hinweis `subscription.unavailable`, Store-Links bleiben nutzbar.

- [ ] **Step 3: Gates**

- `ProGate.jsx`: Knopf `proGate.action` → `router.push('/paywall')` (useRouter importieren).
- `scanner.jsx` Limit-Alert: Buttons `[{ text: t('common.cancel'), style: 'cancel' }, { text: t('scanner.limit.action'), onPress: () => router.push('/paywall') }]`.
- `AddSupplement.jsx` Limit-Alert: analog mit `addSupplement.alert.limitAction`.
- `settings.jsx` Kontingent-Karte: Quiet-Button "Abo und Käufe" → `/subscription` (Schluessel `home.nav.subscription.title` wiederverwenden).

- [ ] **Step 4: Syntax-Check, Suite, Commit**

Run: `node_modules/.bin/esbuild app/paywall.jsx "app/(tabs)/(more)/subscription.jsx" components/ProGate.jsx --loader:.jsx=jsx --log-level=error --outdir=node_modules/.cache/jsx-check` → keine Ausgabe. `npm test` gruen.

```bash
git add app/paywall.jsx "app/(tabs)/(more)/subscription.jsx" components/ProGate.jsx "app/(tabs)/(scan)/scanner.jsx" app/AddSupplement.jsx "app/(tabs)/(more)/settings.jsx"
git commit -m "feat(purchase): paywall and subscription screens, gates open the paywall"
```

---

### Task 7: Rechtstexte und AVV-Doku

**Files:**
- Modify: `data/legalContent.js`, `launch/avv-dokumentation.md`, `web/*`

- [ ] **Step 1: Datenschutz-Abschnitt "Käufe"**

DE nach "Konto (freiwillig)":

```js
    {
      heading: 'Käufe (Pro-Abo und Scan-Pakete)',
      body:
        'Kaufst du ein Pro-Abo oder ein Scan-Paket, wickelt Apple bzw. Google den Kauf ab; Zahlungsdaten sehen wir nicht. Zur Prüfung der Kaufbelege und zur Anzeige deines Abo-Status nutzen wir den Dienst RevenueCat (RevenueCat, Inc., USA, Standardvertragsklauseln). Übertragen werden eine zufällige Geräte-Kennung oder, wenn du angemeldet bist, deine Konto-Kennung (eine zufällige ID, nicht deine E-Mail-Adresse), die Kaufbelege des Stores, Gerätetyp und Land. Keine Präparate, keine Laborwerte, keine Gesundheitsdaten. Rechtsgrundlage: Vertrag (Art. 6 Abs. 1 lit. b DSGVO). Kündigung und Rückerstattung laufen über dein Apple- oder Google-Konto.',
    },
```

EN "Purchases (Pro subscription and scan packs)" sinngemaess. `PRIVACY_VERSION = '2026-08-30'`. `npm run build:legal`.

- [ ] **Step 2: AVV-Doku**

Abschnitt "RevenueCat": DPA-Link `https://www.revenuecat.com/dpa`, SCC, Sub-Prozessoren, was uebertragen wird (wie oben), Stand-Zeile aktualisieren.

- [ ] **Step 3: Suite, Commit**

```bash
git add data/legalContent.js web/ launch/avv-dokumentation.md
git commit -m "docs(legal): describe purchases via RevenueCat, bump privacy version"
```

---

### Task 8: EAS-Konfiguration, Store-Checkliste, Projektdoku

**Files:**
- Create: `eas.json`, `launch/store-setup.md`
- Modify: `app.json` (falls `expo-dev-client` Plugin noetig), `CLAUDE.md`, `package.json`

- [ ] **Step 1: Development Build vorbereiten**

Run: `npx expo install expo-dev-client`

`eas.json`:

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal", "ios": { "simulator": false } },
    "preview": { "distribution": "internal" },
    "production": {}
  },
  "submit": { "production": {} }
}
```

Kein Bau in diesem Task (braucht `eas login` und den Apple-Account). Befehle dokumentieren: `npx eas build --profile development --platform ios` bzw. `android`.

- [ ] **Step 2: launch/store-setup.md**

Checkliste fuer Nadine, 1:1 aus dem Spec-Abschnitt "Store-Konfiguration", ergaenzt um: wo die RevenueCat-Public-Keys herkommen und in `purchaseConfig.js` eingetragen werden, Sandbox-Tester anlegen (App Store Connect → Users and Access → Sandbox), Play-Lizenztester, Testablauf (Kauf, Trial, Kuendigung im Store, Wiederherstellen auf zweitem Geraet, Statuswechsel per Listener), und der letzte Schritt `PAYWALL_ENFORCED = true` erst nach gruenem Sandbox-Test.

- [ ] **Step 3: CLAUDE.md**

Fachlogik-Tabelle: `PurchaseLogic.js`, `PurchaseStore.js`/`usePurchaseStore.js`, `purchaseSdk.js`. Baum: `paywall.jsx`, `(more)/subscription.jsx`. Abschnitt "Datenhaltung": Absatz "Kaeufe" (RevenueCat, kein Preis im Code, Expo Go vs. Development Build). Abschnitt "Befehle": `npx eas build --profile development --platform ios`.

- [ ] **Step 4: Suite, Commit**

```bash
git add eas.json app.json package.json package-lock.json launch/store-setup.md CLAUDE.md
git commit -m "chore(build): EAS profiles and store setup checklist"
```

---

## Offen nach diesem Plan

- Development Build bauen und Sandbox-Test (Apple-Account, RevenueCat-Keys).
- `PAYWALL_ENFORCED = true` (Gate 3 des Launch-Plans).
- Sign in with Apple (PROVIDERS-Eintrag), Universal Links.
- Teilprojekt 2 (Sync) und die Bitwarden-Haertung.
