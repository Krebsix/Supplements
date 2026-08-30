# Cloud-Backup mit Abgleich (Konto, Teilprojekt 2)

Stand: 2026-08-30. Freigabe Nadine 14:39 ("ich folge deiner Empfehlung").
Entscheidung: Brain decisions/2026-08-30-supplements-cloud-backup-statt-live-sync.md.
Grundlage: Konto-Spec docs/superpowers/specs/2026-08-29-account-grundlage-design.md.

## Ziel

Wer ein Konto hat, verliert beim Handywechsel nichts: Der Bestand, die
Einnahmen, Laborwerte und das Profil liegen verschluesselt auf dem Server
und kommen auf dem neuen Geraet nach dem Login zurueck. Der Server (Supabase,
Irland) und die Betreiberin koennen die Daten nicht lesen. Das ist der
Mehrwert des Kontos gegenueber der Nutzung ohne Konto.

## Ist

- Konto (Teilprojekt 1): Supabase Auth, Datenschluessel auf dem Geraet,
  zwei Umschlaege in `public.user_keys` (Passwort, Recovery-Key). Das
  Passwort geht im Klartext an Supabase Auth. Der Datenschluessel lebt im
  Arbeitsspeicher des Konto-Stores und ist nach einem Neustart weg.
- JSON-Backup (`BackupManager.js`): `buildBackupPayload(state)` liefert
  `{ schema, version, exportedAt, data }` ueber `BACKUP_DATA_FIELDS`;
  `parseBackupPayload(text)` prueft und liefert `data`; `importBackup(data)`
  im Haupt-Store ersetzt den Bestand. Export ueber das Share-Sheet.
- `AccountCrypto.js`: scrypt (N=32768, r=8, p=1), AES-256-GCM
  `wrapKey`/`unwrapKey` (Format `nonce:ciphertext`, hex), `randomBytes`
  injiziert.
- `secureStorage.js`: AES-256-Adapter fuer den Haupt-Store, Schluessel in
  expo-secure-store (`supplement-os-data-key-v1`).

## Sieben Entscheidungen

### 1. Ein verschluesselter Stand je Konto, kein Live-Sync

Tabelle `public.user_backups`: eine Zeile je Nutzerin.

| Spalte | Inhalt |
|---|---|
| `user_id` | PK, FK auth.users, cascade |
| `ciphertext` | AES-256-GCM ueber das JSON von `buildBackupPayload`, Format `nonce:ciphertext` hex wie die Umschlaege |
| `payload_version` | `BACKUP_VERSION` des Klartexts (heute 1) |
| `device_label` | frei gewaehlter Geraetename, z. B. "iPhone von Nadine" (Klartext, keine Gesundheitsdaten) |
| `exported_at` | Zeitstempel des Standes (vom Client) |
| `updated_at` | Server-Zeit |

Keine Zaehler (Anzahl Praeparate, Laborwerte) in Klartext-Spalten: Das
waeren Metadaten ueber Gesundheitsdaten. Die Zahlen fuer den Dialog kommen
aus dem entschluesselten Stand. Check-Constraint: `length(ciphertext) <=
6000000` (rund 3 MB Klartext, weit ueber einem realen Bestand). RLS:
select/insert/update/delete nur fuer die eigene Zeile. Cascade beim
Konto-Loeschen (Edge Function `delete-account` bleibt unveraendert).

Verschluesselung mit dem Datenschluessel, neuer Nonce je Upload. Nichts
Weiteres: keine Kompression (YAGNI, Stand ist klein), keine Historie
(letzter Stand gewinnt).

### 2. Automatisch hochladen, gebuendelt, nur mit Schluessel

Neu `CloudBackup.js` (rein, Node-testbar):

```
encryptBackup(payloadJsonText, dataKey, randomBytes) => ciphertextText
decryptBackup(ciphertextText, dataKey) => payloadJsonText   (wirft bei falschem Schluessel)
decideOnLogin({ remote, localHasData, lastUploadedAt }) =>
  'none' | 'restore' | 'ask' | 'upload'
```

`decideOnLogin`:
- kein `remote` und lokal keine Daten → `'none'`
- kein `remote`, lokal Daten → `'upload'`
- `remote`, lokal keine Daten → `'restore'`
- `remote` und lokal Daten: ist `remote.exported_at` gleich
  `lastUploadedAt` dieses Geraets → `'upload'` (nur wir haben geschrieben);
  sonst → `'ask'` (ein anderes Geraet hat geschrieben).
"Lokal Daten" heisst: mindestens ein Praeparat, ein Laborwert oder ein
Einnahme-Log.

Neu `CloudBackupStore.js` (zustand-Factory wie AccountStore, Node-testbar,
Abhaengigkeiten injiziert: `client`, `getMainState`, `importBackup`,
`getDataKey`, `randomBytes`, `now`, `persist`-Adapter) und
`useCloudBackupStore.js` (bindet die echten Abhaengigkeiten). Zustand:

| Feld | Bedeutung |
|---|---|
| `autoBackup` | Schalter, Standard `true`, persistiert (unverschluesselt, kein Gesundheitsbezug) |
| `deviceLabel` | Standard aus `expo-device` (`Device.deviceName` oder `modelName`), aenderbar, persistiert |
| `lastUploadedAt` | ISO des zuletzt von DIESEM Geraet hochgeladenen Standes, persistiert |
| `remoteExportedAt` | ISO des zuletzt gesehenen Server-Standes |
| `status` | `'idle' \| 'uploading' \| 'restoring' \| 'error' \| 'offline'` |
| `lastError` | Fehlercode fuer die Oberflaeche |
| `pendingDecision` | `null` oder `{ remote, counts }` fuer den Dialog beim Login |

Aktionen: `uploadNow()`, `scheduleUpload()` (5 s Verzoegerung, gebuendelt
ueber `createCoalescedRunner`), `checkOnLogin()`, `resolveDecision('restore'
| 'upload')`, `setAutoBackup(bool)`, `setDeviceLabel(text)`, `reset()`.

Ausloeser fuer `scheduleUpload()`: Subscription auf den Haupt-Store in
`app/_layout.jsx` (Muster wie die Nachfuell-Subscription), aber nur bei
Aenderung eines Feldes aus `BACKUP_DATA_FIELDS`, und nur wenn
`autoBackup && signedIn && dataKey`. Zusaetzlich beim Wechsel der App in den
Vordergrund (AppState `active`), falls seit dem letzten Upload eine
Aenderung liegt. Ohne Netz: `status: 'offline'`, naechster Versuch beim
naechsten Ausloeser. Kein Hintergrund-Job.

`importBackup()` darf keinen Upload ausloesen (sonst laedt ein
Wiederherstellen den gerade geladenen Stand sofort wieder hoch): Der Store
setzt vor dem Import ein `suppressUntil`-Flag.

### 3. Beim Login pruefen, beim neuen Geraet wiederherstellen

Nach erfolgreichem Login, Bestaetigungslink oder App-Start mit Session und
Schluessel ruft die App `checkOnLogin()`:
- `'restore'`: Stand entschluesseln, `importBackup(data)`, Hinweis auf dem
  Tagesplan: "Stand vom 30.08., 12 Praeparate, 3 Laborwerte, von iPhone
  von Nadine uebernommen." Kein Dialog, weil lokal nichts verloren geht.
- `'ask'`: Dialog "Auf diesem Konto liegt ein neuerer Stand (30.08. 14:02,
  iPhone von Nadine, 12 Praeparate). Diesen Stand uebernehmen oder den
  Stand dieses Geraets hochladen?" mit zwei Knoepfen. Solange nicht
  entschieden ist, laedt dieses Geraet nichts hoch.
- `'upload'`: still hochladen.
- Entschluesselung schlaegt fehl (Schluessel passt nicht, z. B. Reset ohne
  Recovery-Key): Hinweis "Der Stand auf dem Server ist mit einem frueheren
  Schluessel verschluesselt und kann nicht gelesen werden. Beim naechsten
  Upload wird er ersetzt." Dann `'upload'`.

Das Wiederherstellen auf dem neuen Geraet greift auch in der
Ersteinrichtung: Nach Login ohne Praeparat laeuft `checkOnLogin()` vor
`routeAfterAccount`; bei `'restore'` gibt es danach Praeparate, und die
Nutzerin landet auf dem Tagesplan mit Bestand statt in Schritt 3.

### 4. Datenschluessel im Geraete-Schluesselbund

`AccountStore` bekommt eine injizierte Abhaengigkeit `keyStore` mit
`save(hex)`, `load()`, `clear()`. Echte Bindung in `useAccountStore.js`
ueber expo-secure-store, Schluesselname `mysuplea-account-data-key-v1`,
dieselben Optionen wie `secureStorage.js`. Regeln:
- `signIn`, `confirmSignUp` (mit Session), `handleAuthCallback`,
  `completePasswordReset`, `changePassword` → `save`.
- `initialize()` mit gueltiger Session → `load`; ohne Session → `clear`.
- `signOut`, `deleteAccount`, Session weg (Event `SIGNED_OUT`) → `clear`.
- `resetAllData()` im Haupt-Store loescht lokale Daten, nicht das Konto;
  der Schluessel bleibt (Konto weiter nutzbar).

### 5. Bitwarden-Haertung: Supabase sieht das Passwort nie

`AccountCrypto.js` neu: `deriveAuthPassword(password)` = hex von
`scrypt(password NFKC, AUTH_SALT, KDF_PARAMS)` mit `AUTH_SALT = utf8("mysuplea-auth-v1")`
(app-weit fest, keine Ableitung aus der E-Mail; Grund: Bitwardens
E-Mail-Salz bricht den E-Mail-Wechsel mit "secure email change").
`AccountLogic` schickt an Supabase Auth ueberall `authPassword` statt
`password`: `signUpWithEmail`, `signInWithEmail`, `completePasswordReset`
(`updateUser({ password: authPassword })`), `changePassword`. Der
Umschlag-Schluessel bleibt wie heute aus `password` + `kdf_salt`.
`user_keys.kdf` bekommt `auth: 'scrypt-v1'`, damit ein spaeterer Wechsel
erkennbar ist. Kein Migrationspfad fuer alte Konten: Es gibt nur
Test-Konten; die werden geloescht und neu angelegt (Nadine, Geraetetest).
Mindestlaenge 10 bleibt; die Supabase-Passwortregel greift auf den
64-Zeichen-Hex-Wert, ist also immer erfuellt.

Zwei scrypt-Laeufe beim Login. Annahme: unter zwei Sekunden auf dem Geraet;
wird im Geraetetest gemessen, `account.busy.deriving` zeigt solange den
Hinweis.

### 6. Oberflaeche

- `account.jsx`, `SignedInView`: Abschnitt "Cloud-Backup" mit Status
  ("Letzter Stand 14:02 von iPhone von Nadine" / "Noch kein Stand" /
  "Offline, wird nachgeholt" / Fehler), Schalter "Automatisch sichern",
  Knopf "Jetzt sichern", Feld "Geraetename" (einzeilig), Hinweis "Ende-zu-
  Ende verschluesselt. Der Server kann den Stand nicht lesen. Ohne Passwort
  oder Recovery-Key ist er nicht wiederherstellbar."
- `FirstStepsCard`: Konto-Schritt bekommt bei `skipped` den Satz "Deine
  Daten ueberleben den Handywechsel." als zweite Zeile; bei `done` "Cloud-
  Backup aktiv" bzw. "Cloud-Backup aus".
- Dashboard: einmaliger Hinweis nach `'restore'` (Karte, wegtippbar).
- Dialog fuer `'ask'` als `Alert` mit zwei Knoepfen, ausgeloest vom Store
  ueber `pendingDecision`; gerendert in `app/_layout.jsx`, damit er
  unabhaengig vom Screen erscheint.
- Settings: JSON-Backup bleibt unveraendert (Datenauszug, Art. 15/20).

### 7. Recht und Dokumente

- `data/legalContent.js`: neuer Abschnitt "Cloud-Backup (nur mit Konto)"
  in der Datenschutzerklaerung: was gespeichert wird (verschluesselter
  Stand, Geraetename, Zeitstempel), wer es lesen kann (nur die Nutzerin
  mit Passwort oder Recovery-Key), wo (Supabase, Irland), wie lange (bis
  zum Loeschen des Kontos oder Ausschalten mit "Stand loeschen"),
  Rechtsgrundlage (Art. 9 Abs. 2 lit. a, Einwilligung durch Aktivieren des
  Kontos; Widerruf durch Ausschalten/Loeschen). `PRIVACY_VERSION` auf
  `2026-09-01`. `npm run build:legal` fuer `web/`. Hinweis: Die Landingpage
  liegt auf Branch phase-2u-website (Astro) und zieht `legalContent.js`
  beim Merge nach.
- Knopf "Stand auf dem Server loeschen" im Abschnitt Cloud-Backup (Widerruf
  ohne Konto-Loeschung).
- `launch/avv-dokumentation.md`: Supabase speichert verschluesselte
  Gesundheitsdaten (Art. 9), Region Irland, kein Schluessel beim Anbieter.
- `launch/dsfa.md` neu: Datenschutz-Folgenabschaetzung nach Art. 35,
  Schwellwert (Art.-9-Daten, neue Technologie, Verarbeitung in grossem
  Umfang: nein, aber Sensibilitaet ja), Beschreibung der Verarbeitung,
  Risiken (Schluesselverlust, Server-Kompromittierung, Geraeteverlust,
  Metadaten), Massnahmen (E2E mit scrypt/AES-GCM, Recovery-Key, Keychain,
  Region, RLS, In-App-Loeschung, keine Klartext-Zaehler), Restrisiko,
  Konsultation (Anwalt vor Launch, gebuendelt mit ODbL). Entwurf, keine
  Rechtsberatung.
- Store-Listings (`launch/aso.md`, `launch/store-setup.md`): Privacy
  Labels / Data Safety "Health and fitness data, encrypted, linked to
  account, user can delete".

## Architektur

```
AccountCrypto.js        + deriveAuthPassword, AUTH_SALT, encryptText/decryptText (AES-GCM ueber Text)
AccountLogic.js         authPassword statt password an Supabase (4 Stellen); kdf.auth = 'scrypt-v1'
AccountStore.js         + keyStore (save/load/clear), + onDataKeyChange
useAccountStore.js      keyStore an expo-secure-store gebunden
CloudBackup.js          neu, rein: encryptBackup, decryptBackup, decideOnLogin, countsOf
CloudBackupStore.js     neu, zustand-Factory: Upload, Check, Dialog-Zustand
useCloudBackupStore.js  neu: echte Bindung (supabase, useStore, useAccountStore, expo-device)
app/_layout.jsx         Subscription (BACKUP_DATA_FIELDS → scheduleUpload), AppState, Dialog fuer pendingDecision
app/(tabs)/(more)/account.jsx   Abschnitt Cloud-Backup
components/FirstStepsCard.jsx   Konto-Texte
app/(tabs)/(today)/Dashboard.jsx  Hinweis nach Wiederherstellung
supabase/migrations/2026083xxxxxx_user_backups.sql
data/legalContent.js, web/ (build:legal), launch/avv-dokumentation.md, launch/dsfa.md, launch/aso.md
i18n/de,en: account (cloud.*), dashboard (restored.*), legal via legalContent
```

Vorbehalt: `checkOnLogin()` braucht Session UND Datenschluessel; ohne
Schluessel (altes Konto ohne Record) zeigt der Abschnitt "Cloud-Backup
nicht verfuegbar, bitte Passwort neu setzen".

## Datenschutz und Regeln

- Server erhaelt nur Ciphertext, Geraetename, Zeitstempel. Keine Zaehler,
  keine Klartext-Felder aus dem Bestand.
- Datenschluessel verlaesst das Geraet nie; Keychain-Ablage mit derselben
  Schutzklasse wie der lokale Speicher.
- Klartext-Passwort verlaesst das Geraet nie (Haertung).
- Wer diesen Datenfluss aendert, aendert `data/legalContent.js` mit
  (bestehende Regel).
- Keine Gedankenstriche in Nutzertexten, keine Hex-Werte, Fachlogik in
  Modulen, deutsche Kommentare, EN-Parity.

## Testing

- `tests/account-crypto.test.mjs` erweitert: `deriveAuthPassword`
  deterministisch, 64 Hex-Zeichen, unterscheidet sich vom Passwort und vom
  Umschlag-Schluessel; `encryptText/decryptText` Rundtrip, falscher
  Schluessel wirft, Nonce je Aufruf verschieden.
- `tests/account-logic.test.mjs` erweitert: Fake-Client sieht nie das
  Klartext-Passwort (signUp, signIn, reset, change), `kdf.auth` gesetzt.
- `tests/account-store.test.mjs` erweitert: keyStore save/load/clear in
  allen Uebergaengen.
- `tests/cloud-backup.test.mjs` neu: `decideOnLogin` alle Faelle,
  Rundtrip encrypt/decrypt mit echtem Payload, `countsOf`.
- `tests/cloud-backup-store.test.mjs` neu: Upload gebuendelt (drei
  Aenderungen, ein Upload), kein Upload ohne Schluessel/ohne autoBackup,
  `checkOnLogin` → restore importiert und laedt nicht sofort wieder hoch,
  `ask` setzt pendingDecision, `resolveDecision('upload')` laedt hoch,
  Offline setzt status und wirft nicht.
- `tests/legal-site.test.mjs` (bestehend) gegen die neue Version.
- Geraetetest: Konto neu anlegen (altes loeschen), drei Praeparate, im
  Konto "Letzter Stand" sehen; App loeschen und neu installieren, einloggen
  → Praeparate sind da; zweites Geraet: aendern, erstes Geraet oeffnen →
  Dialog.

## Abgrenzung

Nicht enthalten: Live-Sync je Datensatz, Versionshistorie, Teilen mit
Praxis, Community-Zuordnung (Teilprojekt 3), Sign in with Apple, Migration
bestehender Konten auf die Haertung.
