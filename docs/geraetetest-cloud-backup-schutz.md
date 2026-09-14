# Geräteabnahme: Cloud-Backup-Schutz

Gegenstand: Branch `fix/cloud-backup-schutz`. Commits `0fa4b51`
(Fremdpatch MySuplea-Backup-Korrekturpaket-v1), `60aa83c` (vier Befunde
aus der Prüfung), `0e889a6` (diese Liste, "Jetzt sichern" gesperrt) und
der Stand dieser Fassung. Liste aktualisiert: 2026-09-14.

Warum die Abnahme nötig ist: Die Prüfung lief in Node mit
Ersatzfunktionen für Kryptografie, Persistenz und Netz. Alert-Dialoge,
Geräte-Schlüsselbund, persist auf AsyncStorage und das echte
Supabase-Backend sind damit nicht geprüft. Es geht um Datenverlust bei
Gesundheitsdaten.

**Alle Fälle sind offen. Keiner wurde ausgeführt.** Ein Fall gilt erst
als bestanden, wenn er auf einem Gerät durchgeführt und das Ergebnis in
der Tabelle am Ende eingetragen ist.

## Tatsächlich geprüfter Stand

| Prüfung | Ergebnis |
|---|---|
| `npm test`, pipe-frei, Exitcode separat erfasst | **0**, 7664 Zusicherungen, 45 Testdateien, 0 Fehlschläge |
| `npx expo export --platform ios` | Exitcode **0** |
| `npx expo export --platform android` | Exitcode **0** (Stand `60aa83c`) |
| `npx expo-doctor` | 17/18; offen sind vier Expo-Patchversionen aus dem Vorbestand (expo 54.0.34 statt ~54.0.37, expo-constants, expo-file-system, expo-router), nicht aus diesem Branch |
| Hex-Werte in Screens (Projektregel) | keine |

Relevante lokale Konfiguration zum Zeitpunkt dieser Prüfungen:

- `app.json` trägt `extra.eas.projectId` (EAS-Projekt `@krebsi/mysuplea`).
  **Diese Änderung ist bewusst nicht committet** und muss auf dem
  Arbeitsgerät erhalten bleiben; ohne sie findet die CLI das Projekt
  nicht. Gesichert im Sitzungs-Scratchpad.
- `eas.json`: Profile `development` (`developmentClient: true`,
  `distribution: internal`, `ios.simulator: false`), `preview`,
  `production`. Unverändert.
- Expo SDK 54, eas-cli 24.3.0 (Homebrew, nicht über npx erreichbar),
  Xcode 26.6, CocoaPods 1.17.0, kein `ios/`-Ordner (managed workflow).

## Was für die Abnahme noch fehlt

Der interne iOS-Development-Build lässt sich derzeit **nicht** erstellen:
`eas device:list` antwortet "No Apple teams found for account krebsi".
Ohne Apple-Team gibt es kein Signierungszertifikat, kein Provisioning
Profile und keine registrierte Geräte-UDID. Die genau notwendige Eingabe
steht im Abschlussbericht der Sitzung.

Bis dahin ist die Abnahme nur auf dem iOS-Simulator möglich (lokaler
Build, keine Signierung nötig). Der Simulator deckt alles in dieser
Liste ab: Dialoge, Schlüsselbund, AsyncStorage, Supabase. Er deckt
**nicht** ab: Kauf-SDK, Push-Erinnerungen und echtes
Hintergrund-/Vordergrund-Verhalten des Systems.

---

## Wie viele Geräte je Fall

Entscheidend ist nicht die Zahl der Geräte, sondern ob zwei
**unabhängige Datenstände** nebeneinander existieren müssen.

| Aufbau | Bedeutung |
|---|---|
| **1 Gerät** | Ein Gerät genügt, ohne Neuinstallation. |
| **1 Gerät + Neuinstallation** | Ein Gerät genügt, aber der lokale Stand muss zwischendurch wirklich leer werden. Vorher den Abschnitt "Neuinstallation überprüfen" abarbeiten. |
| **1 Gerät + präparierter Server-Stand** | Ein Gerät genügt, der Server-Stand wird direkt in `public.user_backups` hergestellt (Supabase-Konsole), weil die App ihn selbst nicht erzeugen kann. |
| **2 unabhängige Stände** | Zwei Geräte oder zwei Simulatoren, beide mit demselben Konto und eigenen Daten. Mit einem Gerät nicht ehrlich herstellbar. |

Zuordnung:

| Fall | Aufbau |
|---|---|
| 1 Backup aus neuerer App | 1 Gerät + präparierter Server-Stand (echte Variante: 2 Stände mit zwei Build-Versionen) |
| 2 Falscher Schlüssel | 1 Gerät |
| 3 Behalten | 1 Gerät |
| 4 Neustart und "Jetzt sichern" | 1 Gerät |
| 5 / 5b Bewusster Ersatz | 1 Gerät |
| 6 Gültiger Restore | 1 Gerät + Neuinstallation |
| 7a / 7b Nur lokales Profil | 1 Gerät + Neuinstallation |
| 8 Widersprüchliche Gerätestände | **2 unabhängige Stände** |
| 9 Sperre, Server-Backup entfernt | **2 unabhängige Stände** (oder 1 Gerät + Löschung in Supabase) |

---

## Neuinstallation überprüfen

Eine Neuinstallation darf **nicht** ungeprüft als leerer Zustand gelten.
Gründe, aus denen Daten überleben können: ein Build wird überschrieben
statt gelöscht; das Gerät wird aus einem iCloud-Backup wiederhergestellt;
Schlüsselbund-Einträge (`expo-secure-store`) bleiben liegen, wenn die App
nicht wirklich entfernt wurde. Ein nur scheinbar leeres Gerät verfälscht
genau die Fälle 6, 7a und 7b, weil dort der Unterschied zwischen
`restore` und `ask` geprüft wird.

Vorgehen und Nachweis vor jedem Fall mit Neuinstallation:

1. App über den Homescreen löschen (nicht nur neu installieren). Auf dem
   Simulator: Gerät zurücksetzen ("Erase All Content and Settings") oder
   die App aus dem Homescreen entfernen.
2. Neu installieren und öffnen.
3. **Nachweis leerer Zustand, alle vier Punkte:**
   - Das **Onboarding** startet. Springt die App direkt ins Dashboard,
     ist `onboardingCompletedAt` noch gesetzt: nicht leer, abbrechen.
   - Nach dem Onboarding ist der **Bestand leer** (Tab Bestand, keine
     Einträge).
   - **Verlauf leer** (Heute, Verlauf).
   - **Mehr, Konto** zeigt "abgemeldet", nicht eine bestehende Sitzung.
     Eine überlebende Sitzung bedeutet einen überlebenden Datenschlüssel
     im Schlüsselbund.
4. Erst dann anmelden.

Wird einer der vier Punkte nicht erfüllt, ist das Ergebnis des Falls
nicht verwertbar und der Fall bleibt offen.

---

## Abkürzungen der erwarteten Anzeigen

| Kürzel | Text (DE) |
|---|---|
| SPERRE | "Das vorhandene Backup bleibt geschützt. Automatisches und manuelles Sichern sind gesperrt. Öffne die App erneut, um den Stand zu prüfen und bewusst zu entscheiden." |
| SCHLUESSEL | "Der Stand auf dem Server wurde mit einem früheren Schlüssel verschlüsselt und lässt sich nicht lesen. ..." |
| LETZTER | "Letzter Stand {Zeit} von {Gerät}" |
| KEINER | "Noch kein Stand auf dem Server." |
| DIALOG-UNLESBAR | Titel "Server-Stand nicht lesbar" |
| DIALOG-NEUER | Titel "Neuerer Stand auf dem Server" |

Wo steht was: Konto und Cloud-Backup unter **Mehr, Konto**. Die
Statuszeile sitzt unter dem Einleitungstext der Karte "Cloud-Backup".

---

## 1. Backup aus neuerer App

**Aufbau:** 1 Gerät + präparierter Server-Stand.

**Ausgangszustand:** In `public.user_backups` liegt für das Testkonto ein
Ciphertext, dessen Klartext `version: BACKUP_VERSION + 1` trägt
(`BACKUP_VERSION` in `BackupManager.js`). Echte Variante: Auf einem
Gerät mit neuerem Build sichern, dann auf dem älteren Build anmelden.

**Aktion:** Anmelden und die App in den Vordergrund holen.

**Erwartet:**
- DIALOG-UNLESBAR, Text nennt die App-Version ("kann mit dieser
  App-Version nicht geöffnet werden. Beide Datenstände bleiben
  erhalten."). **Nicht** der Recovery-Key-Text.
- Knöpfe "Backup behalten" und "Dauerhaft ersetzen".
- Dialog nicht wegtippbar.
- Kein Upload: `exported_at` der Zeile bleibt unverändert.

Das ist der Kern des Pakets. Vorher ersetzte die App diesen Stand still.

---

## 2. Falscher Schlüssel

**Aufbau:** 1 Gerät.

**Ausgangszustand:** Angemeldet, Daten vorhanden, "Jetzt sichern"
ausgeführt (Statuszeile LETZTER).

**Aktion:** Abmelden. Passwort **ohne** Recovery-Key zurücksetzen
(Konto, Passwort vergessen, Mail-Link). Mit dem neuen Passwort anmelden.

**Erwartet:**
- DIALOG-UNLESBAR mit dem Recovery-Key-Text.
- Knopf links heißt **"Behalten, später mit Recovery-Key"**, nicht
  "Backup behalten" (Befund 4 aus `60aa83c`).
- Kein Upload, Server-Stand unverändert.

---

## 3. Behalten

**Aufbau:** 1 Gerät. Setzt Fall 1 oder 2 voraus, Dialog offen.

**Aktion:** "Backup behalten" bzw. "Behalten, später mit Recovery-Key".
Danach Mehr, Konto öffnen.

**Erwartet:**
- Statuszeile SPERRE.
- Schalter "Automatisch sichern" steht auf aus.
- **"Jetzt sichern" ist sichtbar inaktiv:** graue Fläche statt weiß,
  Beschriftung grau statt petrol, Schloss-Symbol links davor. Tippen
  löst nichts aus, auch keine Drück-Animation.
- Der Sperrgrund bleibt darüber lesbar (SPERRE, nicht ausgegraut).
- **VoiceOver:** Der Knopf wird als "Jetzt sichern, Taste, abgeblendet"
  angesagt, gefolgt vom Hinweis mit dem Sperrtext. Zusätzlich prüfen: Die
  Statuszeile ist als eigenes Element erreichbar und wird vollständig
  vorgelesen.
- **Dynamic Type:** Bei größter Systemschrift bricht die Zeile aus
  Schloss und Beschriftung um statt abzuschneiden.
- Änderungen am Bestand lösen keinen Upload aus: `exported_at` bleibt
  gleich, auch nach mehreren Minuten und nach Hintergrund/Vordergrund.

---

## 4. Neustart und "Jetzt sichern"

**Aufbau:** 1 Gerät. Setzt Fall 3 voraus.

**Aktion:** App vollständig beenden (App-Switcher, nach oben wischen),
neu starten, Mehr, Konto öffnen, "Jetzt sichern" antippen.

**Erwartet:**
- Statuszeile zeigt nach dem Neustart weiterhin SPERRE. `uploadBlocked`
  wird mitpersistiert, die Sperre muss den Neustart überleben.
- "Jetzt sichern" weiter sichtbar inaktiv, kein Schreibversuch.
- Beim Start erscheint der Dialog erneut, solange das Konto angemeldet
  und der unlesbare Stand vorhanden ist.
- `user_backups.exported_at` unverändert.

**Zusatzprüfung Bestandsgeräte (keine Migration nötig, aber belegen):**
Ein Gerät, das vor diesem Update gesichert hat, kennt `uploadBlocked` im
Speicher nicht. Erwartet: nach dem Update **nicht** gesperrt,
Statuszeile LETZTER, Automatik läuft, Knopf aktiv.

---

## 5. Bewusster Ersatz

**Aufbau:** 1 Gerät. Setzt Fall 1 oder 2 voraus, Dialog offen. Lokal
mindestens ein Präparat und ein Laborwert.

**Aktion:** "Dauerhaft ersetzen".

**Erwartet:**
- Genau **ein** Schreibvorgang auf `user_backups`, neuer `exported_at`,
  `device_label` dieses Geräts.
- Statuszeile wechselt auf LETZTER mit aktueller Zeit.
- Sperre gelöst: Knopf wieder aktiv (weiß, petrol, kein Schloss),
  Automatik wieder einschaltbar.
- Nach einem Neustart: Statuszeile bleibt LETZTER, kein Dialog.

### 5b. Bewusster Ersatz ohne Netz

**Aktion:** Flugmodus ein, dann "Dauerhaft ersetzen".

**Erwartet:** Kein Schreibvorgang, Sperre wird **wieder gesetzt**
(SPERRE), kein stiller Wiederholversuch.

Das ist die bewusste Entscheidung des Pakets ("ein fehlgeschlagener
bewusster Ersatz sperrt erneut") und der unschönste Pfad: Es war nur das
Netz weg, trotzdem muss die Nutzerin die App neu öffnen und erneut
bestätigen. **Bei der Abnahme bewerten**, ob das zumutbar ist oder ob ein
Netzwerkfehler von einem echten Schreibfehler unterschieden werden soll.

---

## 6. Gültiger Restore

**Aufbau:** 1 Gerät + Neuinstallation.

**Ausgangszustand:** Vorher auf demselben Gerät mehrere Präparate,
Laborwerte und Einnahmen anlegen und sichern (LETZTER notieren: Zeit und
Gerätename). Dann App löschen, neu installieren, Abschnitt
"Neuinstallation überprüfen" abarbeiten, Onboarding durchlaufen
(Geschlecht und Geburtsjahr angeben, **Name leer lassen**), keine
weiteren Eingaben.

**Aktion:** Mit demselben Konto anmelden.

**Erwartet:**
- **Kein Dialog.** Der Stand wird automatisch übernommen.
- Bestand, Laborwerte und Verlauf sind zurück.
- Der Wiederherstellungs-Hinweis erscheint.
- Kein Rück-Upload danach: `exported_at` bleibt der gesicherte Wert.

Das ist Befund 1 aus `60aa83c`. Mit dem Fremdpatch allein hätte dieser
Fall einen Dialog gezeigt, weil abgeschlossenes Onboarding,
Einwilligungen, Sprache und Lebensphase als lokale Daten zählten.
**Erscheint hier ein Dialog, ist der Fix nicht wirksam.**

---

## 7. Ausschließlich lokales Profil

Zwei Varianten, die sich unterscheiden müssen. Genau hier weicht die
Korrektur vom Fremdpatch ab.

### 7a. Nur Onboarding-Angaben

**Aufbau:** 1 Gerät + Neuinstallation. Server-Stand vorhanden.

**Ausgangszustand:** Nach überprüfter Neuinstallation Onboarding mit
Geschlecht und Geburtsjahr, **kein** Name, keine Medikamentengruppen,
keine Erkrankungen, kein Präparat, kein Laborwert.

**Aktion:** Anmelden.

**Erwartet:** Automatischer Restore wie Fall 6, kein Dialog.

### 7b. Gepflegtes Gesundheitsprofil

**Aufbau:** 1 Gerät + Neuinstallation. Server-Stand vorhanden.

**Ausgangszustand:** Wie 7a, danach unter Mehr, Gesundheitsprofil
mindestens eine Medikamentengruppe oder Erkrankung eintragen
(alternativ einen Anzeigenamen setzen). Weiter kein Präparat, kein
Laborwert.

**Aktion:** Anmelden.

**Erwartet:**
- DIALOG-NEUER mit den Zählern des Server-Standes ("{n} Präparate,
  {m} Laborwerte").
- Knopfreihenfolge: **"Server-Stand übernehmen" zuerst**, "Diesen Stand
  hochladen" danach und rot/destruktiv.
- "Server-Stand übernehmen" holt die Daten; die lokalen Profilangaben
  werden dabei durch die des Standes ersetzt.
- "Diesen Stand hochladen" überschreibt den Server-Stand. **Hier
  bewerten, ob die Warnwirkung ausreicht:** Ein Fehltipp kostet das
  Backup.

---

## 8. Widersprüchliche Gerätestände

**Aufbau:** 2 unabhängige Stände. Mit einem Gerät nicht ehrlich
herstellbar, weil beide Seiten gleichzeitig eigene Daten und einen
eigenen `lastUploadedAt` brauchen.

**Ausgangszustand:** Gerät A und Gerät B, dasselbe Konto, je eigene Daten
(unterschiedliche Präparate und Laborwerte). A hat zuletzt gesichert, B
kennt diesen Stand nicht.

**Aktion:** Auf B in den Vordergrund wechseln bzw. anmelden.

**Erwartet:**
- DIALOG-NEUER mit Zeit und Gerätename von A sowie den Zählern aus dem
  Server-Stand.
- Solange der Dialog offen ist, **kein** Upload, auch wenn auf B etwas
  geändert wird.
- "Server-Stand übernehmen": Bs eigene Daten werden ersetzt, danach kein
  Rück-Upload.
- "Diesen Stand hochladen": As Stand wird ersetzt, genau ein
  Schreibvorgang.
- Derselbe Dialog erscheint nach der Entscheidung nicht erneut.

**Zusatzprüfung Statushänger (Befund 2 aus `60aa83c`):** Während "Jetzt
sichern" läuft, den Dialog auslösen (App in den Hintergrund und zurück).
Erwartet: Die Statuszeile bleibt **nicht** dauerhaft auf "Wird
gesichert." stehen, und der Knopf wird wieder bedienbar.

---

## 9. Sperre gesetzt, Server-Backup inzwischen entfernt

**Aufbau:** 2 unabhängige Stände, oder 1 Gerät und Löschung der Zeile in
Supabase. Wichtig: Die Löschung muss **von außen** kommen. Löscht man auf
demselben Gerät über "Stand auf dem Server löschen", hebt die App die
Sperre selbst mit auf, und der Fall greift nicht.

**Ausgangszustand:** Auf Gerät B ist die Sperre gesetzt (Fall 3
abgeschlossen, Statuszeile SPERRE, Knopf inaktiv). Danach wird der
Server-Stand entfernt: von Gerät A über "Stand auf dem Server löschen",
oder durch Löschen der Zeile in `public.user_backups`.

**Aktion:** Auf Gerät B die App beenden, neu starten und anmelden bzw. in
den Vordergrund holen, sodass der Login-Abgleich läuft.

**Erwartet:**
- Statuszeile wechselt auf KEINER ("Noch kein Stand auf dem Server.").
- Sperre ist **gelöst**: "Jetzt sichern" ist wieder aktiv (weiß, petrol,
  kein Schloss), Automatik wieder einschaltbar.
- Kein Dialog, denn es gibt keinen Stand mehr, über den zu entscheiden
  wäre.
- Nach "Jetzt sichern": genau ein Schreibvorgang, Statuszeile LETZTER.

Das ist Befund 3 aus `60aa83c`. Ohne den Fix wäre das eine Sackgasse: Die
Sperre schützte einen Stand, den es nicht mehr gibt, und blockierte das
Sichern dauerhaft, ohne dass noch ein Dialog erschienen wäre. **Bleibt
die Sperre hier stehen, ist der Fix nicht wirksam.**

---

## Was diese Liste nicht abdeckt

Bewusst außerhalb, weil es eigene Prüfungen und womöglich eine
Versionsspalte mit optimistischem Sperren auf `user_backups` braucht:
bereits abgeschickte Uploads lassen sich nicht zurückholen, Kontowechsel
während laufender Requests, parallele Schreibvorgänge zweier Geräte auf
denselben Datensatz.

Ebenfalls offen, aber unabhängig von diesem Branch: die vier
Expo-Patchversionen aus `expo-doctor`.

## Ergebnistabelle

Erst nach tatsächlicher Durchführung ausfüllen. "offen" bedeutet: nicht
ausgeführt.

| Fall | Aufbau | Ergebnis | Datum | Bemerkung |
|---|---|---|---|---|
| 1 Backup aus neuerer App | 1 + präpariert | offen | | |
| 2 Falscher Schlüssel | 1 | offen | | |
| 3 Behalten (inkl. VoiceOver) | 1 | offen | | |
| 4 Neustart und Jetzt sichern | 1 | offen | | |
| 4z Bestandsgerät nicht gesperrt | 1 | offen | | |
| 5 Bewusster Ersatz | 1 | offen | | |
| 5b Ersatz ohne Netz | 1 | offen | | |
| 6 Gültiger Restore | 1 + Neuinst. | offen | | |
| 7a Nur Onboarding-Angaben | 1 + Neuinst. | offen | | |
| 7b Gepflegtes Profil | 1 + Neuinst. | offen | | |
| 8 Widersprüchliche Stände | 2 Stände | offen | | |
| 8z Statushänger | 2 Stände | offen | | |
| 9 Sperre, Backup entfernt | 2 Stände | offen | | |
