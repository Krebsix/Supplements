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

**Alle dreizehn Fälle sind offen. Keiner wurde ausgeführt.** Ein Fall
gilt erst als bestanden, wenn er durchgeführt und das Ergebnis in der
Tabelle am Ende eingetragen ist.

## Simulator-Lauf vom 2026-09-14

Durchgeführt auf Basis `deaa747`, in einem eigenen Git-Worktree
(`.worktrees/sim-abnahme`) mit derselben Konfiguration wie die geprüften
Stände, inklusive der nicht committeten EAS-projectId in `app.json`.
Keine bestehenden nativen Dateien gelöscht: Der Worktree hatte weder
`ios/` noch `android/`, `expo prebuild` hat beide neu erzeugt.

**Was im Simulator bestanden ist:**

| Prüfung | Ergebnis | Nachweis |
|---|---|---|
| `npm install` im Worktree | **bestanden** | Exitcode 0 |
| `expo prebuild --platform ios` | **bestanden** | Exitcode 0, `ios/` neu erzeugt |
| `pod install` | **bestanden** | Exitcode 0, `MySuplea.xcworkspace` vorhanden |
| Nativer Build Debug (Simulator) | **bestanden** | `xcodebuild` Exitcode 0, `** BUILD SUCCEEDED **` |
| Nativer Build Release mit eingebettetem Bundle | **bestanden** | Exitcode 0, `MySuplea.app/main.jsbundle` vorhanden |
| Installation und Start auf frischem Gerät | **bestanden** | `simctl install`/`launch` Exitcode 0, Prozess-PID vergeben |
| App rendert den ersten Onboarding-Schritt | **bestanden** | Screenshot: Fortschrittsbalken, App-Icon, "WILLKOMMEN", Headline "MySuplea ordnet, was du nimmst.", Petrol-Knopf "Los geht's" |
| Nachweispunkt 1 des leeren Zustands (Onboarding startet, springt nicht ins Dashboard) | **bestanden** | derselbe Screenshot, auf frisch angelegtem Gerät |
| Frischer Ausgangszustand über Datei-Metadaten belegt | **bestanden** | frisch angelegtes Gerät: 0 App-Container, kein `Library/Keychains/`-Verzeichnis. Gegenprobe am gebrauchten Prüfgerät: 146 Container, gewachsene `keychain-2-debug.db`. Inhalte nicht gelesen |
| Dynamic Type, größte Systemschrift | **bestanden** | `simctl ui content_size extra-extra-extra-large` plus App-Neustart (eine laufende RN-App übernimmt die Änderung nicht): Texte skalieren, Headline und Untertitel brechen um, nichts abgeschnitten, Knopf vollständig |

Prüfumgebung: zwei **neu angelegte** Simulatoren (iPhone 17, iOS 26.5)
statt Zurücksetzen bestehender Geräte, damit keine fremden
Simulator-Daten anderer Projekte gelöscht werden.

**Warum die dreizehn Zeilen trotzdem blockiert sind:** Der Simulator
lässt sich per `xcrun simctl` booten, installieren, starten,
zurücksetzen, mit Deep Links ansprechen und fotografieren, aber **nicht
bedienen**. `simctl` hat keinen Tipp-Befehl; der Weg über AppleScript
scheitert an der Systemberechtigung ("keine Berechtigung für den
Hilfszugriff", -25211; "nicht berechtigt, Tastatureingaben zu senden",
1002). `idb` und `cliclick` sind nicht installiert.

Konkret gescheitert ist es an zwei Stellen, beide belegt per Screenshot:
1. Der Development Build startet in den Dev-Client, findet Metro auf
   `localhost:8081` (grüner Punkt), verlangt für den Sprung in die App
   aber einen Tap auf "Öffnen" in einem System-Dialog. Umgangen durch
   den Release-Build mit eingebettetem Bundle, der direkt startet.
2. Der erste Onboarding-Schritt braucht einen Tap auf "Los geht's".
   Ab hier geht es ohne Tippen nicht weiter: kein Onboarding, also kein
   Konto, also keine der dreizehn Zeilen, die alle eine Anmeldung
   voraussetzen.

**Kein Testkonto angelegt, keine Server-Daten angefasst.** Weil die App
nicht bedienbar war, ist kein Konto entstanden; damit gab es auch keinen
eindeutig zugeordneten Testdatensatz, an dem eine Manipulation oder
Löschung zulässig gewesen wäre. In `public.user_backups` wurde nichts
verändert. Der Zugang wäre vorhanden (Supabase-CLI angemeldet, Projekt
`supplements` zugeordnet) und bleibt für die Fälle 1 und 9 vorgesehen,
ausschließlich auf der Zeile des Testkontos.

**Die eine fehlende Freigabe:** Systemeinstellungen, Datenschutz &
Sicherheit, Bedienungshilfen, dort das Programm freigeben, aus dem die
Prüfung läuft (Terminal bzw. der Editor). Die Berechtigung liegt in einer
vom System geschützten Datenbank und ist über die Kommandozeile nicht
setzbar.

### Zweiter Versuch am 2026-09-14, 15:51 bis 16:10: Berechtigung erteilt, weiter blockiert

Die Bedienungshilfen-Freigabe war gesetzt. Damit ist die vorige
Blockade behoben, eine zweite trat an ihre Stelle.

**Was jetzt funktioniert (Nachweise):**

- `System Events` antwortet ohne Fehler (Prozess-Anzahl 153 bis 162);
  zuvor kam Fehler -1719.
- Menüstrukturen von Simulator.app sind lesbar (Menüleiste: Apple,
  Simulator, File, Edit, Device, I/O, Features, Debug, Window, Help).
- **Ein Klick wurde nachweislich ausgeführt:** `click menu item
  "iPhone 17e" of menu "Open Simulator" of menu "File"` lief ohne Fehler
  durch und öffnete kurzzeitig ein Fenster (Position -1090/219, Größe
  260x224, also auf dem zweiten Bildschirm). Klicken ist damit
  grundsätzlich möglich.
- `screencapture` liefert wieder Bilder (1920x1080); der erste
  Fehlschlag ("could not create image from display") kam vom
  ruhenden Bildschirm, nicht von einer fehlenden Freigabe.

**Woran es jetzt scheitert:**

1. **Simulator.app stellt kein Gerätefenster dar.** `count of windows`
   bleibt bei 0, über alle Varianten hinweg: Gerät per `simctl` gebootet
   oder nicht, Simulator.app neu gestartet, Gerät über das Menü
   geöffnet, `CurrentDeviceUDID` per `defaults` auf das Prüfgerät
   gesetzt. `lsappinfo info -only windows Simulator` gibt
   `"windows"=[ NULL ]`. Das kurz erschienene 260x224-Fenster schloss
   sich wieder. Ohne Fenster auf dem Bildschirm gibt es keine
   Zielkoordinate für einen Tipp.
2. **Der Bildschirm ist von der laufenden Arbeit belegt.** Das
   Bildschirmfoto zeigt einen Browser im Vollbild. Klicks auf
   Bildschirmkoordinaten würden in diese Sitzung eingreifen. Deshalb
   wurde kein Klick auf "Los geht's" abgeschickt: Das Ziel war nicht
   sichtbar, und ein Fehlklick hätte in der fremden Anwendung gelandet.

Nebenbefund zur Geräteauswahl: Das Menü "File, Open Simulator" listet
ausschließlich die Xcode-Standardgeräte, nicht selbst angelegte. Die
vier für diese Abnahme erstellten Geräte sind darüber nicht öffenbar:

| Name | UDID | Typ |
|---|---|---|
| MySuplea-Abnahme-A | 3E67ED35-D278-4358-B010-6F63D58C580F | iPhone 17, trägt den Development-Build |
| MySuplea-Abnahme-B | B6052A86-288A-49FC-9067-E029087F845D | iPhone 17, trägt den Release-Build |
| MySuplea-A | F005697C-0446-40A8-94B5-61719F54584D | iPhone 16 Pro, frisch |
| MySuplea-B | F91886C3-BC94-4E8B-9C1D-F94B875432C2 | iPhone 16, frisch |

Als über das Menü erreichbares Ersatzgerät wurde iPhone 17e
(2BBC79C1-BA14-4967-B5DC-559BB74A4E07) herangezogen, vorher als
unbenutzt verifiziert (0 App-Container, 0 Schlüsselbund-Dateien). Es
wurde nur gebootet, keine App installiert; durch das Booten entsteht
dort inzwischen eine Schlüsselbund-Datei, es ist also für
Neuinstallations-Fälle vor Gebrauch zurückzusetzen.

**Was jetzt gebraucht wird**, damit die dreizehn Zeilen laufen: Ein
sichtbares Simulator-Fenster auf dem Hauptbildschirm, das nicht von
einem Vollbildfenster verdeckt ist. Praktisch: Simulator.app von Hand
öffnen, das Prüfgerät auswählen, Fenster sichtbar stehen lassen und den
Bildschirm während der Prüfung nicht anderweitig belegen. Danach lassen
sich Fensterposition und -größe auslesen und die Taps gezielt setzen.
Gegen Eingriffe in fremde Fenster hilft zusätzlich, den Simulator per
"Window, Stay On Top" nach vorn zu binden.

So kommt die Umgebung zurück:

```bash
cd ~/Developer/supplements/.worktrees/sim-abnahme
xcrun simctl boot B6052A86-288A-49FC-9067-E029087F845D   # Gerät B, frisch
xcrun simctl install B6052A86-288A-49FC-9067-E029087F845D \
  ios/build-release/Build/Products/Release-iphonesimulator/MySuplea.app
xcrun simctl launch B6052A86-288A-49FC-9067-E029087F845D com.indoohome.mysuplea
```

Gerät A (`3E67ED35-D278-4358-B010-6F63D58C580F`) trägt den
Development-Build und braucht zusätzlich `npx expo start` im Worktree.
Für die Fälle 8 und 9 werden beide Geräte gebraucht.

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

**Kein Build für echte Geräte.** `eas device:list` antwortet "No Apple
teams found for account krebsi". Ohne Apple-Team gibt es kein
Signierungszertifikat, kein Provisioning Profile und keine registrierte
Geräte-UDID. Die notwendigen Eingaben stehen im Abschlussbericht der
Sitzung.

**Simulator-Umgebung steht, Bedienung blockiert.** Am 2026-09-14 wurde
der native iOS-Build im Arbeitsverzeichnis
`.worktrees/sim-abnahme` (Git-Worktree auf `deaa747`, `app.json` mit der
EAS-projectId übernommen, `expo prebuild` plus `pod install`, keine
bestehenden nativen Dateien gelöscht) erzeugt und im Simulator gestartet.
Die Prüfzeilen konnten trotzdem nicht durchlaufen werden:

Der Simulator lässt sich per `xcrun simctl` booten, starten,
zurücksetzen und fotografieren, aber **nicht bedienen**. `simctl` kennt
keinen Tipp-Befehl, und der Weg über AppleScript scheitert an der
Systemberechtigung: `osascript` meldet "keine Berechtigung für den
Hilfszugriff" (-25211) und "nicht berechtigt, Tastatureingaben zu
senden" (1002). `idb` und `cliclick` sind nicht installiert. Ohne Tippen
lässt sich das Onboarding nicht durchlaufen, also auch kein Konto
anlegen, also keine der dreizehn Zeilen abschließen: Alle setzen eine
Anmeldung voraus.

Freischalten lässt sich das durch **eine** Aktion am Rechner:
Systemeinstellungen, Datenschutz & Sicherheit, Bedienungshilfen, dort
das Programm freigeben, aus dem die Prüfung läuft (Terminal bzw. der
Editor). Die Berechtigung liegt in einer vom System geschützten
Datenbank und ist über die Kommandozeile nicht setzbar. Danach sind die
Zeilen im Simulator durchführbar.

Was der Simulator auch mit Berechtigung **nicht** abdeckt: Kauf-SDK,
Push-Erinnerungen, echtes Hintergrund- und Sperrverhalten des Systems,
und den Schlüsselbund eines echten Geräts (siehe den Abschnitt zum
Schlüsselbund).

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
   - **Mehr, Konto** zeigt "abgemeldet", keine bestehende Sitzung.
4. Erst dann anmelden.

### Eine abgemeldete Oberfläche beweist keinen leeren Schlüsselbund

Punkt 4 der Liste zeigt nur, dass **keine Sitzung** wiederhergestellt
wurde. Das ist etwas anderes als ein leerer Schlüsselbund, und die
Unterscheidung ist für diese Abnahme wesentlich:

- Die **Sitzung** liegt über `secureStorage` verschlüsselt im
  AsyncStorage. Der wird beim Löschen der App entfernt, deshalb zeigt die
  Oberfläche "abgemeldet".
- Der **Datenschlüssel** liegt getrennt davon im Geräte-Schlüsselbund
  (`expo-secure-store`, WHEN_UNLOCKED_THIS_DEVICE_ONLY), ebenso der
  Schlüssel, mit dem `secureStorage` den Store verschlüsselt. Beide
  können die Oberfläche überleben: iOS löscht Schlüsselbund-Einträge beim
  Entfernen einer App nicht in jedem Fall, und eine Wiederherstellung aus
  einem Backup bringt sie zurück.

Folge für die Fälle 2, 6, 7a und 7b: Ein überlebender Datenschlüssel
kann einen Server-Stand **lesbar** machen, der eigentlich unlesbar sein
soll (Fall 2), oder einen `restore` durchlaufen lassen, dessen
Ausgangslage nicht wirklich frisch war (Fälle 6, 7a, 7b). Die App zeigt
das nicht an.

**Zusätzlicher Nachweis, ohne Schlüsselwerte auszugeben.** Geprüft wird
nur, ob ein Eintrag **existiert**, nie sein Inhalt. Schlüsselwerte,
Recovery-Keys und Passwörter gehören in kein Protokoll und in keinen
Bericht.

- **Simulator:** Der Schlüsselbund liegt im Gerätecontainer unter
  `~/Library/Developer/CoreSimulator/Devices/<UDID>/data/Library/Keychains/`
  als `keychain-2-debug.db` (plus `-shm`/`-wal`). Nachweis über
  Datei-Metadaten: vorhanden ja/nein, Größe, Änderungszeit, und ob nach
  einem Zurücksetzen eine neue Datei mit frischem Zeitstempel entsteht.
  Der Inhalt wird nicht gelesen und gehört in kein Protokoll.
  Ein `xcrun simctl erase <UDID>` leert Schlüsselbund und App-Container
  zuverlässig; das Entfernen der App allein nicht. **Für die Fälle mit
  Neuinstallation deshalb immer `erase` verwenden, nicht nur die App
  löschen.**
  Gegenprobe am 2026-09-14 auf dem Prüfgerät (iPhone 17): Vor dem
  Zurücksetzen lagen 146 App-Container und eine gewachsene
  Schlüsselbund-Datei vor. Ein Simulator, der schon benutzt wurde, ist
  also nachweislich kein frischer Ausgangszustand, selbst wenn keine App
  sichtbar installiert ist.
- **Echtes Gerät:** Von außen nicht einsehbar. Ersatzweise am Verhalten
  belegen: Nach dem Löschen der App und Neustart des Geräts muss der
  erste Start der App das Onboarding zeigen **und** eine Anmeldung
  verlangen, und ein zuvor unlesbarer Server-Stand muss unlesbar
  bleiben. Bleibt er lesbar, ist ein alter Datenschlüssel vorhanden und
  der Fall nicht verwertbar. Sauberer Ausgangszustand auf dem echten
  Gerät: App löschen, Gerät neu starten, App neu installieren.

Wird einer der vier Punkte oder dieser Zusatznachweis nicht erfüllt, ist
das Ergebnis des Falls nicht verwertbar und der Fall bleibt offen.

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

## Reihenfolge der Durchführung

Sobald die Bedienungshilfen-Freigabe erteilt ist, in dieser Reihenfolge,
weil diese vier den Kern der Korrektur belegen:

1. **6 / 7a** Automatischer Restore nach reinem Onboarding. Erscheint
   hier ein Dialog, ist Befund 1 nicht wirksam.
2. **7b** Schutz bei lokalem Gesundheitsprofil. Erscheint hier kein
   Dialog, greift der Schutz nicht.
3. **3 / 4** Behalten mit Neustart. Belegt die persistierte Sperre und
   den sichtbar inaktiven Knopf.
4. **9** Freigabe nach extern entferntem Server-Backup. Bleibt die
   Sperre stehen, ist Befund 3 nicht wirksam.

Danach der Rest: 1, 2, 5, 5b, 8, 8z, 4z.

## Ergebnistabelle

Erst nach tatsächlicher Durchführung ausfüllen. Status ausdrücklich als
"im Simulator bestanden", "im Simulator fehlgeschlagen", "blockiert"
oder "auf echtem Gerät bestanden" eintragen. "blockiert" heißt: nicht
ausgeführt, Grund in der Bemerkung.

| Fall | Aufbau | Ergebnis | Datum | Bemerkung |
|---|---|---|---|---|
| 1 Backup aus neuerer App | 1 + präpariert | blockiert | 2026-09-14 | Tap-Freigabe erteilt, aber kein Simulator-Fenster darstellbar |
| 2 Falscher Schlüssel | 1 | blockiert | 2026-09-14 | dito |
| 3 Behalten (inkl. VoiceOver) | 1 | blockiert | 2026-09-14 | dito. Dynamic Type ist NUR für den Onboarding-Startbildschirm belegt, nicht für den Konto-Screen mit dem gesperrten Knopf |
| 4 Neustart und Jetzt sichern | 1 | blockiert | 2026-09-14 | dito |
| 4z Bestandsgerät nicht gesperrt | 1 | blockiert | 2026-09-14 | dito |
| 5 Bewusster Ersatz | 1 | blockiert | 2026-09-14 | dito |
| 5b Ersatz ohne Netz | 1 | blockiert | 2026-09-14 | dito |
| 6 Gültiger Restore | 1 + Neuinst. | blockiert | 2026-09-14 | dito; Nachweispunkt 1 (Onboarding startet) bestanden |
| 7a Nur Onboarding-Angaben | 1 + Neuinst. | blockiert | 2026-09-14 | dito |
| 7b Gepflegtes Profil | 1 + Neuinst. | blockiert | 2026-09-14 | dito |
| 8 Widersprüchliche Stände | 2 Stände | blockiert | 2026-09-14 | dito; zwei frische Simulatoren stehen bereit |
| 8z Statushänger | 2 Stände | blockiert | 2026-09-14 | dito |
| 9 Sperre, Backup entfernt | 2 Stände | blockiert | 2026-09-14 | dito |

## Was auch nach der Simulator-Abnahme auf einem echten iPhone offen bleibt

Diese Punkte kann der Simulator grundsätzlich nicht beantworten, auch
mit erteilter Tap-Freigabe nicht. Sie brauchen den iOS-Development-Build
auf einem registrierten Gerät und damit das Apple-Team.

| Offen auf echtem Gerät | Warum der Simulator nicht genügt |
|---|---|
| Schlüsselbund-Verhalten beim Löschen der App | Der Simulator-Schlüsselbund ist eine Datei ohne Secure Enclave; `WHEN_UNLOCKED_THIS_DEVICE_ONLY` verhält sich dort nicht wie auf dem Gerät. Ob ein Datenschlüssel eine Neuinstallation überlebt, entscheidet sich nur am Gerät |
| Ausgangszustand nach Wiederherstellung aus einem iCloud-Backup | Im Simulator nicht herstellbar |
| VoiceOver-Ansage des gesperrten Knopfs | Die Simulator-Sprachausgabe weicht ab; die Ansage "abgeblendet" plus Hinweistext muss am Gerät gehört werden |
| Sperrbildschirm und Gerätesperre während eines Uploads | `WHEN_UNLOCKED` greift nur am echten Gerät |
| Echtes Hintergrund- und Wiederaufnahme-Verhalten, App-Beendigung durch das System | Der Simulator terminiert Apps nach anderen Regeln, der Vordergrund-Abgleich (`AppState 'active'`) ist dort nicht repräsentativ |
| Push-Erinnerungen | Im Simulator ohne APNs nur eingeschränkt |
| Kauf-SDK (RevenueCat) | Braucht Development Build und Sandbox-Konto |
| Netzwechsel und echtes Offline (Fall 5b) | Der Flugmodus des Simulators bildet nur die Host-Verbindung ab |
| Dauer und Gefühl der Dialoge im Alltag (10-Sekunden-Maßstab) | Bedienbarkeit auf dem Gerät in der Hand, nicht am Mausklick |
