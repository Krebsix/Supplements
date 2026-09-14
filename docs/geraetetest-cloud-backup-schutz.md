# Geräteabnahme: Cloud-Backup-Schutz

Gegenstand: Branch `fix/cloud-backup-schutz`, Commits `0fa4b51` (Fremdpatch
MySuplea-Backup-Korrekturpaket-v1) und `60aa83c` (vier Befunde aus der
Prüfung). Stand dieser Liste: 2026-09-14.

Warum diese Abnahme nötig ist: Die Prüfung des Pakets lief in Node mit
Ersatzfunktionen für Kryptografie, Persistenz und Netz. `npm test` ist
grün (echter Exitcode 0, 7664 Zusicherungen, 45 Testdateien) und die
Metro-Bundles für iOS und Android bauen, aber die Alert-Dialoge, der
Geräte-Schlüsselbund, die persist-Middleware auf AsyncStorage und das
echte Supabase-Backend sind damit nicht geprüft. Genau dort liegt das
Risiko: Es geht um Datenverlust bei Gesundheitsdaten.

**Alle acht Fälle sind offen.** Keiner wurde ausgeführt.

## Voraussetzungen

- Development Build (nicht Expo Go: dort fehlt das Kauf-SDK, und der
  Schlüsselbund verhält sich anders).
- Zwei Geräte oder ein Gerät plus Neuinstallation, beide mit demselben
  Konto.
- Testkonto, keine echten Gesundheitsdaten.
- Server-Stand vor jedem Fall bewusst herstellen: Konto, Cloud-Backup,
  "Jetzt sichern".

Wo steht was: Konto und Cloud-Backup unter **Mehr, Konto**. Die
Statuszeile sitzt direkt unter dem Einleitungstext der Karte
"Cloud-Backup".

## Abkürzungen der erwarteten Anzeigen

| Kürzel | Text (DE) |
|---|---|
| SPERRE | "Das vorhandene Backup bleibt geschützt. Automatisches und manuelles Sichern sind gesperrt. Öffne die App erneut, um den Stand zu prüfen und bewusst zu entscheiden." |
| SCHLUESSEL | "Der Stand auf dem Server wurde mit einem früheren Schlüssel verschlüsselt und lässt sich nicht lesen. Automatisches Sichern ist aus, bis du ihn ersetzt oder dein Passwort mit dem Recovery-Key neu setzt." |
| LETZTER | "Letzter Stand {Zeit} von {Gerät}" |
| DIALOG-UNLESBAR | Titel "Server-Stand nicht lesbar" |
| DIALOG-NEUER | Titel "Neuerer Stand auf dem Server" |

---

## 1. Backup aus neuerer App

**Ausgangszustand:** Auf dem Server liegt ein Stand mit einer höheren
`payload_version`, als diese App-Version kennt (`BACKUP_VERSION` in
BackupManager.js). Herstellen: Auf Gerät A mit einer neueren Build-Version
sichern, dann auf Gerät B mit der älteren Version anmelden. Ersatzweise die
Zeile in `public.user_backups` mit einem Ciphertext befüllen, dessen
Klartext `version: BACKUP_VERSION + 1` trägt.

**Aktion:** Auf Gerät B anmelden und die App in den Vordergrund holen.

**Erwartet:**
- DIALOG-UNLESBAR erscheint, Text nennt die App-Version ("kann mit dieser
  App-Version nicht geöffnet werden. Beide Datenstände bleiben erhalten.").
  NICHT der Recovery-Key-Text.
- Knöpfe: "Backup behalten" und "Dauerhaft ersetzen".
- Der Dialog lässt sich nicht wegtippen (`cancelable: false`).
- Kein Upload: Die Zeile in `user_backups` behält ihren `exported_at`.

**Das ist der Kern des Pakets.** Vor der Korrektur ersetzte die App
diesen Stand still durch den lokalen.

---

## 2. Falscher Schlüssel

**Ausgangszustand:** Server-Stand mit einem früheren Datenschlüssel
verschlüsselt. Herstellen: Auf Gerät A sichern, dann Passwort ohne
Recovery-Key zurücksetzen (Konto, Passwort vergessen), danach auf Gerät B
mit dem neuen Passwort anmelden.

**Aktion:** Auf Gerät B anmelden.

**Erwartet:**
- DIALOG-UNLESBAR mit dem Recovery-Key-Text ("Hast du deinen
  Recovery-Key? Dann setze dein Passwort damit neu").
- Knopf links heißt **"Behalten, später mit Recovery-Key"**, nicht
  "Backup behalten". (Befund 4 aus `60aa83c`: Der Fremdpatch hatte den
  ausführlicheren Text hier entfernt.)
- Kein Upload, Server-Stand unverändert.

---

## 3. Behalten

**Ausgangszustand:** Fall 1 oder 2 hergestellt, Dialog offen.

**Aktion:** "Backup behalten" bzw. "Behalten, später mit Recovery-Key"
tippen. Danach Mehr, Konto öffnen.

**Erwartet:**
- Statuszeile zeigt SPERRE.
- Schalter "Automatisch sichern" steht auf aus.
- Knopf "Jetzt sichern" ist **inaktiv** und reagiert nicht auf Tippen.
  (Befund aus der Prüfung: Der Knopf war bei gesetzter Sperre noch
  drückbar und tat dann sichtbar nichts.)
- Änderungen am Bestand lösen keinen Upload aus: `exported_at` auf dem
  Server bleibt gleich, auch nach mehreren Minuten und nach einem Wechsel
  in den Hintergrund und zurück.

**Offener Design-Punkt, hier mitbewerten:** Der Screen kennt keinen
sichtbaren Inaktiv-Stil für Knöpfe (Bestandsmuster, gilt auch für
`disabled={busy}` an anderen Stellen). Der Knopf sieht aktiv aus, ist es
aber nicht. Ob das für die Abnahme reicht oder ein Inaktiv-Stil in
`theme.js` gebraucht wird, ist eine Designentscheidung, keine
Fehlfunktion.

---

## 4. Neustart und "Jetzt sichern"

**Ausgangszustand:** Fall 3 abgeschlossen, Sperre steht.

**Aktion:** App vollständig beenden (App-Switcher, nach oben wischen),
neu starten, Mehr, Konto öffnen, "Jetzt sichern" tippen.

**Erwartet:**
- Statuszeile zeigt nach dem Neustart weiterhin SPERRE. Die Sperre wird
  mitpersistiert (`uploadBlocked` in `partialize`), sie darf den Neustart
  überleben.
- "Jetzt sichern" ist inaktiv, kein Schreibversuch.
- Beim Start erscheint der Dialog erneut (checkOnLogin findet den
  unlesbaren Stand wieder), sofern das Konto angemeldet ist.
- `user_backups.exported_at` unverändert.

**Zusatzprüfung Bestandsgeräte (keine Migration nötig, aber belegen):**
Ein Gerät, das vor diesem Update gesichert hat, kennt `uploadBlocked` im
Speicher nicht. Erwartet: Es ist nach dem Update **nicht** gesperrt,
Statuszeile zeigt LETZTER, Automatik läuft weiter.

---

## 5. Bewusster Ersatz

**Ausgangszustand:** Fall 1 oder 2 hergestellt, Dialog offen. Lokal
mindestens ein Präparat und ein Laborwert, damit erkennbar ist, was
hochgeht.

**Aktion:** "Dauerhaft ersetzen" tippen.

**Erwartet:**
- Genau **ein** Schreibvorgang auf `user_backups`, neuer `exported_at`,
  neuer `device_label` dieses Geräts.
- Statuszeile wechselt auf LETZTER mit der aktuellen Zeit.
- Sperre gelöst: "Jetzt sichern" ist wieder aktiv, Automatik wieder
  einschaltbar.
- Danach ein Neustart: Statuszeile bleibt LETZTER, kein Dialog mehr.

**Variante 5b, Netz weg:** Flugmodus einschalten, dann "Dauerhaft
ersetzen" tippen. Erwartet: Kein Schreibvorgang, Sperre wird **wieder
gesetzt** (SPERRE in der Statuszeile), kein stiller Wiederholversuch.
Das ist die bewusste Entscheidung des Pakets ("ein fehlgeschlagener
bewusster Ersatz sperrt erneut") und der unschönste Fall: Es war nur das
Netz weg, trotzdem muss die Nutzerin die App neu öffnen und erneut
bestätigen. **Bei der Abnahme bewerten, ob das zumutbar ist** oder ob ein
Netzwerkfehler von einem echten Schreibfehler unterschieden werden soll.

---

## 6. Gültiger Restore

**Ausgangszustand:** Gerät A hat einen lesbaren Stand mit mehreren
Präparaten, Laborwerten und Einnahmen gesichert. Gerät B ist frisch
installiert, Onboarding durchlaufen (Geschlecht und Geburtsjahr
angegeben, Name leer gelassen), kein eigener Bestand.

**Aktion:** Auf Gerät B mit demselben Konto anmelden.

**Erwartet:**
- **Kein Dialog.** Der Stand wird automatisch übernommen.
- Bestand, Laborwerte und Verlauf von Gerät A sind da.
- Der Hinweis zur Wiederherstellung erscheint (`lastRestore`).
- Kein Rück-Upload direkt danach: `exported_at` bleibt der von Gerät A
  (justRestored unterdrückt den Nachlauf-Upload).

**Das ist Befund 1 aus `60aa83c`.** Mit dem Fremdpatch allein hätte
dieser Fall einen Dialog gezeigt, weil abgeschlossenes Onboarding,
Einwilligungen, Sprache und Lebensphase als "lokale Daten" zählten. Wenn
hier ein Dialog erscheint, ist der Fix nicht wirksam.

---

## 7. Ausschließlich lokales Profil

Zwei Varianten, sie müssen sich unterscheiden. Genau hier weicht die
Korrektur vom Fremdpatch ab.

**7a, nur Onboarding-Angaben:** Gerät B frisch, Onboarding mit
Geschlecht und Geburtsjahr, **kein** Name, keine Medikamentengruppen,
keine Erkrankungen. Server-Stand vorhanden.
**Aktion:** Anmelden.
**Erwartet:** Automatischer Restore wie Fall 6, kein Dialog.

**7b, gepflegtes Gesundheitsprofil:** Gerät B frisch, Onboarding
durchlaufen, danach unter Mehr, Gesundheitsprofil mindestens eine
Medikamentengruppe oder Erkrankung eintragen (alternativ einen
Anzeigenamen setzen). Weiterhin kein Präparat, kein Laborwert.
**Aktion:** Anmelden.
**Erwartet:**
- DIALOG-NEUER erscheint, mit den Zählern des Server-Standes
  ("{n} Präparate, {m} Laborwerte").
- Reihenfolge der Knöpfe: **"Server-Stand übernehmen" zuerst**, "Diesen
  Stand hochladen" danach und rot/destruktiv.
- "Server-Stand übernehmen" holt die Daten, die lokalen Profilangaben
  werden dabei durch die des Standes ersetzt.
- "Diesen Stand hochladen" überschreibt den Server-Stand. **Hier prüfen,
  ob die Warnwirkung ausreicht**: Ein Fehltipp kostet das Backup.

---

## 8. Widersprüchliche Gerätestände

**Ausgangszustand:** Gerät A und Gerät B haben beide eigene Daten
(je ein anderes Präparat, unterschiedliche Laborwerte). Gerät A hat
zuletzt gesichert, Gerät B kennt diesen Stand nicht
(`lastUploadedAt` weicht ab).

**Aktion:** Auf Gerät B in den Vordergrund wechseln bzw. anmelden.

**Erwartet:**
- DIALOG-NEUER mit Zeit und Gerätename von A sowie den Zählern aus dem
  Server-Stand.
- Während der Dialog offen ist, findet **kein** Upload statt, auch wenn
  auf B etwas geändert wird (pendingDecision blockiert, ein laufender
  Timer wird abgebrochen).
- "Server-Stand übernehmen": Bs eigene Daten werden ersetzt, danach kein
  Rück-Upload.
- "Diesen Stand hochladen": As Stand auf dem Server wird ersetzt, genau
  ein Schreibvorgang.
- Nach der Entscheidung erscheint derselbe Dialog nicht erneut
  (Dedup über `kind:exported_at`).

**Zusatzprüfung Statushänger (Befund 2 aus `60aa83c`):** Während "Jetzt
sichern" läuft, den Dialog auslösen (App in den Hintergrund und zurück).
Erwartet: Die Statuszeile bleibt **nicht** dauerhaft auf "Wird
gesichert." stehen.

---

## Was diese Liste nicht abdeckt

Bewusst außerhalb: Bereits abgeschickte Uploads lassen sich nicht
zurückholen, Kontowechsel während laufender Requests und parallele
Schreibvorgänge mehrerer Geräte auf denselben Datensatz. Das sind die
Grenzen, die das Paket selbst nennt; sie brauchen eine eigene Prüfung und
möglicherweise eine Versionsspalte mit optimistischem Sperren auf
`user_backups`.

## Ergebnisspalte

| Fall | Ergebnis | Datum | Bemerkung |
|---|---|---|---|
| 1 Backup aus neuerer App | offen | | |
| 2 Falscher Schlüssel | offen | | |
| 3 Behalten | offen | | |
| 4 Neustart und Jetzt sichern | offen | | |
| 5 Bewusster Ersatz | offen | | |
| 5b Ersatz ohne Netz | offen | | |
| 6 Gültiger Restore | offen | | |
| 7a Nur Onboarding-Angaben | offen | | |
| 7b Gepflegtes Profil | offen | | |
| 8 Widersprüchliche Stände | offen | | |
