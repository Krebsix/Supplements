# Account-Grundlage

Stand: 2026-08-29. Entwurf freigegeben von Nadine (Gespraech, siehe unten).

Teilprojekt 1 von 3. Die Kette: **Account-Grundlage** (dieses Dokument)
→ verschluesselter Sync und Cloud-Backup → Zuordnung von Community-Scans
zu einem Konto. Jedes Teilprojekt bekommt eigene Spec, eigenen Plan.

## Ziel

Eine Nutzerin kann sich mit E-Mail und Passwort registrieren, anmelden,
abmelden und ihr Konto wieder loeschen. Die App legt dabei die
kryptografische Grundlage, auf der Teilprojekt 2 Gesundheitsdaten so
synchronisieren kann, dass der Server sie nie im Klartext sieht.

Mehr nicht. Es werden in diesem Teilprojekt keine Nutzdaten hochgeladen.

## Was das Konto loesen soll

Drei Gruende, in dieser Reihenfolge gewichtet:

1. **Geraete-Sync.** Derselbe Bestand und dieselben Laborwerte auf Handy
   und Tablet, ohne JSON-Export ueber das Share-Sheet.
2. **Cloud-Backup ohne Zutun.** Geht das Handy verloren, sind die Daten
   nicht weg.
3. **Community-Beitraege zuordnen.** Foto-Scans landen heute anonym in
   der Pruef-Schleuse. Mit Konto laesst sich Moderation und spaeter
   Reputation daran haengen.

Was das Konto NICHT loest: das Speichern von Daten an sich. Das
funktioniert seit jeher lokal (`useStore.js` + `secureStorage.js`), und
das bleibt so.

## Sechs Entscheidungen, die den Rahmen setzen

### 1. Das Konto ist optional

Die App funktioniert ohne Konto genau wie heute. Das Konto ist ein
Angebot fuer Sync, Backup und Community, kein Tor, das vor der Nutzung
steht. Das Onboarding aendert sich nicht.

Grund: Die Positionierung der App haengt an "kein Konto noetig, keine
Cloud". Die Datenschutzerklaerung sagt heute woertlich "ohne Konto und
ohne Server-Datenbank" (`data/legalContent.js`, Zeile 42) und "no
accounts, no cloud sync" (Zeile 123). Mit einem optionalen Konto bleibt
der Kern des Satzes wahr, die Formulierung muss aber praeziser werden:
"Ohne Konto nutzbar. Wer Sync moechte, legt eines an, und dann verlassen
Daten nur verschluesselt das Geraet." Ein Pflicht-Konto wuerde den Satz
brechen und den Presse-Aufhaenger (heise, netzpolitik) gleich mit.

### 2. Der Server sieht Gesundheitsdaten nie im Klartext

Teilprojekt 2 wird Laborwerte, Medikamentengruppen und Erkrankungen
hochladen, also Daten nach Art. 9 DSGVO. Nadine hat den Trade-off
bewusst entschieden: Sync ist die zusaetzliche Compliance-Arbeit wert,
aber nur mit Ende-zu-Ende-Verschluesselung. Supabase speichert
Chiffretext, der Schluessel entsteht auf dem Geraet und wird nie
uebertragen.

Konsequenz fuer dieses Teilprojekt: Der Schluessel muss beim Signup
entstehen, nicht erst in Teilprojekt 2. Sonst muesste das Signup-Formular
spaeter ein zweites Mal angefasst werden, und Bestandskonten haetten
keinen Schluessel.

### 3. Passwort-Verlust wird mit einem Recovery-Key aufgefangen

Der Datenschluessel wird aus dem Passwort abgeleitet. Ein Passwort-Reset
per Mail setzt nur den Login zurueck; die verschluesselten Daten blieben
ohne den alten Schluessel unlesbar.

Deshalb erzeugt die App beim Signup einmalig einen Recovery-Key (32
zufaellige Bytes, als Base32 in Vierergruppen angezeigt), der den
Datenschluessel umwickelt. Die Nutzerin sieht ihn genau einmal, muss
aktiv bestaetigen, dass sie ihn gesichert hat, und das UI sagt klar: Ohne
Passwort und ohne diesen Key sind die Sync-Daten weg. Das Muster ist von
Bitwarden und 1Password bekannt.

Lokale Daten auf dem urspruenglichen Geraet sind davon nie betroffen.

### 4. E-Mail und Passwort zuerst, Sign in with Apple als Nachtrag

Apples Richtlinie 4.8 verlangt Sign in with Apple erst, wenn ein anderer
Drittanbieter-Login (Google, Facebook) angeboten wird. Mit reinem
E-Mail-Login greift die Pflicht nicht. Der Apple Developer Account ist
laut Launch-Plan noch ein offener Blocker; er soll die Account-Arbeit
nicht aufhalten.

Die Anmelde-Methoden werden trotzdem von Anfang an als austauschbare
Provider-Liste in `AccountLogic.js` gefuehrt, damit Apple (und bei Bedarf
Google) spaeter als Eintrag dazukommt, ohne Screen oder Store anzufassen.

Google Sign-In ist fuer Google Play nicht vorgeschrieben und wird nicht
gebaut.

### 5. Konto-Loeschung in der App, von Anfang an

Apple 5.1.1(v) und Google Play verlangen: Wer in der App ein Konto anlegen
kann, muss es in der App loeschen koennen. Das ist keine Nachreichung,
sondern Teil dieses Teilprojekts. Ohne diesen Knopf lehnt das Review ab.

Die Loeschung entfernt den Supabase-Nutzer und seine Schluessel-Zeile.
Lokale Daten bleiben unangetastet; dafuer gibt es weiterhin
`resetAllData()` als getrennten Weg. Zwei Knoepfe, zwei Fragen: "Konto
loeschen" und "Alle Daten auf diesem Geraet loeschen" sind verschiedene
Dinge und werden nicht vermischt.

### 6. Kein natives Modul fuer die Schluesselableitung

`react-native-argon2` ist ein Native-Modul, laeuft nicht in Expo Go und
wuerde einen Development Build erzwingen. Stattdessen `@noble/hashes`
(reines JavaScript, auditiert) mit scrypt, auf dem Geraet. Argon2id
waere gleichwertig; scrypt ist gewaehlt, weil die noble-Implementierung
dafuer laenger im Einsatz ist.
Laeuft in Expo Go und im Store-Build identisch. Dass die Ableitung auf
einem aelteren Handy ein bis zwei Sekunden dauert, ist beim Signup und
Login hinnehmbar.

## Architektur

Ein neuer, eigenstaendiger Baustein. Bestehendes wird nicht umgebaut.

```
supabaseClient.js      createClient() mit URL und Anon-Key aus scanConfig.js,
                       Session-Persistenz ueber secureStorage-Adapter
AccountLogic.js        Fachlogik: Signup (inkl. Schluesselableitung und
                       Recovery-Key), Login, Logout, Session-Restore,
                       Konto-Loeschung. Kein UI. Provider-Liste.
useAccountStore.js     zustand-Store: eingeloggt/ausgeloggt, E-Mail,
                       Session. Getrennt vom Haupt-Store.
app/(tabs)/(more)/
  account.jsx          Login/Signup-Formular; eingeloggt: E-Mail, Logout,
                       Recovery-Key-Hinweis, Konto loeschen
  account-recovery.jsx Einmalige Anzeige des Recovery-Keys nach Signup
supabase/functions/
  delete-account/      Edge Function: loescht auth.users-Eintrag und
                       user_keys-Zeile. Client darf das nicht selbst.
supabase/migrations/   Tabelle user_keys (siehe Datenmodell)
```

Warum ein eigener Store: Der Kontostand ist kein Gesundheitsdatum und
gehoert nicht in `INITIAL_USER_STATE` und nicht in `BACKUP_DATA_FIELDS`.
Das JSON-Backup bleibt ein reiner Auszug von Bestand und Gesundheitsdaten.
Wer ein Backup auf ein anderes Geraet spielt, bekommt keinen fremden
Login mit.

Warum ein eigener Screen unter `(more)` und kein Onboarding-Schritt: Das
Konto ist optional (Entscheidung 1). Es wird dort angeboten, wo auch
Einstellungen und Datenexport liegen, ueber einen neuen Menuepunkt in
`menu.jsx`.

## Datenmodell

Neue Tabelle `user_keys`, eine Zeile je Nutzer, RLS: nur der eigene
Eintrag lesbar und schreibbar.

| Spalte | Inhalt |
|---|---|
| `user_id` | FK auf `auth.users`, Primaerschluessel |
| `kdf` | Name und Parameter der Schluesselableitung (z. B. `scrypt`, N/r/p), damit sich Parameter spaeter erhoehen lassen |
| `kdf_salt` | zufaelliges Salt fuer die Ableitung aus dem Passwort |
| `wrapped_key_pw` | Datenschluessel, verschluesselt mit dem passwortabgeleiteten Schluessel |
| `wrapped_key_recovery` | Datenschluessel, verschluesselt mit dem Recovery-Key |
| `created_at`, `updated_at` | |

Was NICHT in der Tabelle steht: Passwort, abgeleiteter Schluessel,
Recovery-Key, Datenschluessel im Klartext. Der Server kann mit dieser
Zeile allein nichts entschluesseln.

Das Schluessel-Wrapping nutzt AES-256-GCM (authentifiziert), nicht CTR wie
`secureStorage.js`. Grund: Der lokale Speicher hat "Auslesen" als
Angreifermodell; ein Server-Datensatz braucht auch Integritaetsschutz.
`@noble/ciphers` liefert GCM in reinem JavaScript.

## Datenfluss

**Signup.** E-Mail und Passwort ins Formular. Auf dem Geraet: Salt
erzeugen, Schluessel aus Passwort ableiten, zufaelligen Datenschluessel
und zufaelligen Recovery-Key erzeugen, Datenschluessel zweimal wickeln.
Dann `supabase.auth.signUp()`, danach `user_keys`-Zeile schreiben. Dann
der Recovery-Screen: Key anzeigen, Bestaetigung einholen, erst danach
zurueck ins Menue. Bricht die Nutzerin auf dem Recovery-Screen ab, wird
das Konto serverseitig wieder geloescht; ein Konto ohne gesicherten
Recovery-Key ist ein Konto mit tickender Datenverlust-Uhr.

Supabase verlangt standardmaessig eine E-Mail-Bestaetigung vor dem
ersten Login. Das bleibt an: Die Bestaetigungs-Mail traegt einen Link,
der die App oeffnet (Deep Link, siehe unten).

**Login.** `supabase.auth.signInWithPassword()`. Die Session (Access-
und Refresh-Token) liegt ueber den `secureStorage`-Adapter verschluesselt
im AsyncStorage. Anschliessend `user_keys` lesen und den Datenschluessel
mit dem passwortabgeleiteten Schluessel entpacken; er liegt fuer die
Dauer der Session im Arbeitsspeicher des Stores, nie im AsyncStorage.

**Session-Restore beim App-Start.** `useAccountStore` liest die
persistierte Session und laesst supabase-js bei Bedarf den Token
erneuern. Laeuft neben dem bestehenden Store-Hydrate in `_layout.jsx`,
blockiert das UI nicht. Der Datenschluessel ist nach einem Neustart
NICHT mehr im Speicher; Teilprojekt 2 entscheidet, ob er per
Geraete-Keychain zwischengespeichert wird oder ob Sync bis zur naechsten
Passworteingabe wartet.

**Logout.** `supabase.auth.signOut()`, Session aus `secureStorage`
entfernen, Datenschluessel aus dem Speicher werfen. Lokale
Gesundheitsdaten bleiben.

**Konto loeschen.** Bestaetigungsdialog mit Klartext, was passiert
(Konto und Schluessel weg, lokale Daten bleiben, kein Sync mehr). Dann
Aufruf der Edge Function `delete-account` mit dem eigenen Access-Token;
die Funktion prueft den Token und loescht `auth.users`-Eintrag und
`user_keys`-Zeile. Danach lokaler Logout.

**Passwort-Reset.** `supabase.auth.resetPasswordForEmail()`, Link oeffnet
die App, neues Passwort setzen. Das UI sagt an dieser Stelle: Damit die
Sync-Daten lesbar bleiben, wird jetzt der Recovery-Key gebraucht. Wird er
eingegeben, wickelt die App den Datenschluessel mit dem neuen Passwort
neu ein und schreibt `wrapped_key_pw` zurueck. Ohne Recovery-Key: Login
funktioniert, Sync-Daten sind verloren, `user_keys` wird neu erzeugt.

## Deep Links

Bestaetigungs- und Reset-Mails oeffnen die App. Dafuer:

- `scheme: "mysuplea"` in `app.json`
- Redirect-URLs in Supabase Auth whitelisten: `mysuplea://auth/callback`
  fuer Store-Builds, die `exp://`-URL fuer Expo Go (nur Entwicklung)
- Eine Route `app/auth/callback.jsx`, die den Token aus der URL an
  supabase-js reicht und weiterleitet

Universal Links (https://mysuplea.app/...) folgen spaeter, wenn die
Domain steht; sie sind fuer Store-Freigabe nicht noetig.

## Fehlerbehandlung

- **Offline bei Login oder Signup:** Klartextfehler "keine Verbindung",
  kein stiller Fallback, kein Retry-Loop. Die App bleibt im vorherigen
  Zustand.
- **Falsches Passwort oder unbekannte E-Mail:** Supabase liefert einen
  einheitlichen Fehler. Er wird so durchgereicht; die App unterscheidet
  nicht zwischen "E-Mail gibt es nicht" und "Passwort falsch"
  (User-Enumeration).
- **Session-Refresh scheitert** (Token abgelaufen, Konto anderswo
  geloescht): stiller Logout, App faellt in den kontolosen Zustand.
  Keine Fehlermeldung, die aufschreckt; lokale Daten sind unberuehrt.
- **Recovery-Key-Bestaetigung uebersprungen:** Der Signup laesst sich
  ohne aktive Bestaetigung nicht abschliessen. Abbruch loescht das Konto
  serverseitig wieder.
- **Schluesselableitung schlaegt fehl:** Signup bricht komplett ab, bevor
  `signUp()` aufgerufen wird. Kein Konto ohne funktionierende
  Verschluesselung, kein Teilzustand.
- **`user_keys`-Schreiben schlaegt nach erfolgreichem `signUp()` fehl:**
  Konto wird wieder geloescht, Fehler angezeigt, Nutzerin kann es erneut
  versuchen.

## Rechtstext und Store-Angaben

`data/legalContent.js` wird mitgeaendert, in beiden Sprachen:

- Der Satz "ohne Konto und ohne Server-Datenbank" wird zu "ohne Konto
  nutzbar; wer ein Konto anlegt, uebertraegt E-Mail-Adresse und
  verschluesselte Schluesseldaten an Supabase". Der Absatz beschreibt, was
  gespeichert wird (E-Mail, Zeitstempel, gewickelte Schluessel) und was
  nicht (Passwort, Klartext-Schluessel, Gesundheitsdaten in diesem
  Teilprojekt).
- Rechtsgrundlage: Vertrag (Art. 6 Abs. 1 lit. b), weil das Konto eine
  von der Nutzerin angeforderte Funktion ist.
- `PRIVACY_VERSION` wird erhoeht.
- **Offener Punkt:** Die Region des Supabase-Projekts ist nicht
  verifiziert. Der bestehende Rechtstext sagt fuer die Foto-Analyse
  "auch ausserhalb der EU (insbesondere USA)". Vor dem Bau ist im
  Supabase-Dashboard zu pruefen, in welcher Region das Projekt liegt.
  Liegt es ausserhalb der EU, ist fuer Teilprojekt 2 (Gesundheitsdaten)
  ein Umzug oder ein zweites EU-Projekt zu klaeren. Fuer dieses
  Teilprojekt (E-Mail und Chiffretext) reicht die korrekte Nennung.

Die Angaben fliessen spaeter in Apples Privacy Nutrition Labels und
Googles Data-Safety-Formular: "E-Mail-Adresse, verknuepft mit der
Identitaet, fuer App-Funktionalitaet, keine Weitergabe, kein Tracking".

## Testing

- `tests/account-logic.test.mjs`, gebuendelt wie die anderen
  Logik-Tests: gleiche Eingabe liefert denselben abgeleiteten Schluessel;
  Salt und Recovery-Key sind je Aufruf verschieden; Wrap/Unwrap mit
  Passwortschluessel und mit Recovery-Key liefern denselben
  Datenschluessel; manipulierter Chiffretext wird abgelehnt (GCM).
- Supabase-Aufrufe werden gemockt, kein Netzwerk in Unit-Tests.
- Manueller Geraetetest in Expo Go: Signup, Bestaetigungs-Mail, Recovery-
  Screen, Login, App-Neustart (Session bleibt), Passwort-Reset mit
  Recovery-Key, Logout, Konto loeschen.
- Rechtstext-Test: Der bestehende Test, der `legalContent.js` gegen den
  Datenfluss prueft, wird um die Konto-Aussagen ergaenzt, sofern er so
  gebaut ist; sonst mindestens ein Test, dass `PRIVACY_VERSION` erhoeht
  wurde.

## Abgrenzung

Nicht Teil dieses Teilprojekts:

- Hoch- oder Herunterladen von Bestand, Laborwerten oder sonstigen
  Nutzdaten (Teilprojekt 2)
- Zuordnung von Foto-Scans zum Konto (Teilprojekt 3)
- Sign in with Apple, Google Sign-In
- Universal Links
- Zwischenspeichern des Datenschluessels in der Keychain ueber einen
  App-Neustart hinweg (Teilprojekt 2 entscheidet)
- Mehrfaktor-Authentifizierung
