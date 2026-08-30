# Gefuehrtes Onboarding

Stand: 2026-08-30. Entwurf, Nadines Vorgabe: "Los geht's, akzeptieren, wie
sollen wir dich ansprechen, Geschlecht, Geburtsjahr zum Scrollen, lass uns
eine Gesundheitsroutine einrichten; hochprofessionell, auch in der
Animation." Referenz: MyTherapy.

Ersetzt das heutige einseitige Onboarding (Lebensphasen-Liste plus
Datenschutz-Haken, `app/onboarding.jsx`). Baut auf der Konto-Grundlage
und der Kaufschicht auf (Specs vom 2026-08-29).

## Ziel

Der erste Start fuehrt in neun kurzen Schritten vom Logo zum ersten
Tagesplan, fragt nur, was die App fachlich braucht, erklaert bei jeder
Frage in einem Satz warum, und bietet Konto und erstes Praeparat an, ohne
sie zu erzwingen. Jeder Schritt ist ein Screen, die Uebergaenge sind
animiert, der Fortschritt sichtbar.

## Sechs Entscheidungen

### 1. Geschlecht und Geburtsjahr statt Lebensphasen-Liste

Heute waehlt die Nutzerin aus acht Lebensphasen ("Frau 18 bis 50",
"Menopause / Frau ab 51", "Ab 65 Jahren", ...). Fachlich richtig,
nutzerfeindlich. Neu: Geschlecht (Frau, Mann, Divers, keine Angabe) und
Geburtsjahr (Rad-Picker). Daraus leitet `LifeStageResolver.js` die
Referenzwert-Gruppe ab:

| Eingabe | Gruppe (`activeLifeStageId`) |
|---|---|
| Alter 4 bis 10 | `child-4-10` |
| Alter 11 bis 17 | `teen-11-17` |
| Frau, 18 bis 50, Zusatzfrage "nichts davon" | `adult-woman` |
| Frau, 15 bis 50, Zusatzfrage "schwanger" | `pregnancy` |
| Frau, 15 bis 50, Zusatzfrage "stillend" | `breastfeeding` |
| Frau, 51 bis 64 | `menopause` |
| Mann, 18 bis 64 | `adult-man` |
| Alter ab 65 | `senior` |
| Divers oder keine Angabe, ab 18 | Zusatzfrage: "Welche Referenzwerte sollen gelten?" mit denselben Gruppen wie bisher (`LifeStagePicker`) |

Die Zusatzfrage Schwangerschaft/Stillzeit erscheint nur fuer Frauen
zwischen 15 und 50. Unter 15 wird keine Schwangerschaftsfrage gestellt.
Unter 4 Jahren lehnt die App ab ("Die App ist fuer Kinder unter 4 nicht
ausgelegt"), unter 16 zeigt sie den Hinweis, dass ein Elternteil die App
einrichten soll (Nutzungsbedingungen: Mindestalter 16 fuer das Konto;
lokale Nutzung durch Eltern fuer ein Kind bleibt moeglich).

Die Lebensphase bleibt in den Einstellungen aenderbar wie heute
(`LifeStagePicker` bleibt bestehen); Schwangerschaft und Stillzeit sind
Zustaende, die sich aendern.

### 2. Der Name ist optional und bleibt lokal

"Wie sollen wir dich ansprechen?" fragt den Vornamen, "Ueberspringen" ist
gleichwertig sichtbar. Der Name wird nur fuer die Anrede im Tagesplan
("Guten Morgen, Nadine") und im Bericht verwendet, liegt im Haupt-Store
(`profile.displayName`), im Backup, nie auf dem Server.

### 3. Ein Knopf fuer Nutzungsbedingungen und Datenschutz, kein Buendeln
von Einwilligungen

"Akzeptieren und weiter" ueber dem Satz "Ich akzeptiere die
Nutzungsbedingungen und habe die Datenschutzerklaerung gelesen", beide
verlinkt. Das ist Vertragsannahme plus Kenntnisnahme, kein Einwilligungs-
Buendel. Die Einwilligung zur Foto-Uebertragung bleibt beim ersten Scan
(Art. 6 Abs. 1 lit. a, spezifisch und informiert); die Push-Erlaubnis wird
im Routine-Schritt vom System erfragt. Verworfen: "Alle akzeptieren" mit
Scan-Einwilligung darin.

### 4. Routine = Erinnerungszeiten plus erstes Praeparat, beides
ueberspringbar

Schritt "Deine Routine": die drei Slots Morgen, Mittag, Abend mit
Standardzeiten (aus `DEFAULT_SLOT_TIMES`), je Zeit antippbar (Uhrzeit-
Picker), Schalter "Erinnerungen an" (Standard an). Beim Weiter mit
Schalter an fragt das System die Push-Erlaubnis
(`checkAndRequestPermission`). Danach "Dein erstes Praeparat": drei
Knoepfe Scannen, Suchen, Spaeter. Scannen und Suchen fuehren nach
Abschluss des Onboardings direkt in den jeweiligen Tab; Spaeter auf den
Tagesplan mit einer Leer-Karte.

### 5. Konto einmal anbieten, "Spaeter" vorausgewaehlt

Schritt "Sichern?": ein Absatz (Backup und Sync, ohne Konto nutzbar), zwei
Knoepfe "Konto anlegen" und "Spaeter ohne Konto". "Spaeter" ist der
Standardknopf. "Konto anlegen" oeffnet nach dem Abschluss den bestehenden
Konto-Screen. Kein zweites Mal, kein Banner: Flag
`onboarding.accountOffered` im Store.

### 6. Animation: ruhig, systemnah, eine Bewegung je Wechsel

Reanimated ist installiert. Jeder Schrittwechsel: aktueller Inhalt
gleitet 24 pt nach links und blendet aus (180 ms, ease-out), neuer Inhalt
kommt von rechts (220 ms, ease-out). Zurueck spiegelt die Richtung.
Fortschrittsbalken oben waechst mit Federbewegung (spring, damping 18).
Auswahl-Karten skalieren beim Antippen kurz auf 0.97 mit leichter Haptik
(`expo-haptics`, `selectionAsync`). Keine Konfetti, kein Parallax, keine
Illustrationen, kein Bounce. Das Rad fuer das Geburtsjahr ist die native
Komponente (`@react-native-picker/picker`), weil sie sich auf iOS wie das
System anfuehlt; ein eigener Nachbau wirkt immer nach.

Bei `reduceMotion` (Systemeinstellung) werden alle Bewegungen durch
einfaches Ein- und Ausblenden ersetzt.

## Ablauf

| # | Schritt | Fragt | Speichert | Pflicht |
|---|---|---|---|---|
| 1 | Willkommen | nichts, Logo, ein Satz, "Los geht's" | | |
| 2 | Rechtliches | Akzeptieren | `consents.privacyVersion`, `consents.termsVersion` | ja |
| 3 | Anrede | Vorname | `profile.displayName` | nein, "Ueberspringen" |
| 4 | Geschlecht | vier Optionen | `profile.gender` | ja |
| 5 | Geburtsjahr | Rad, 1930 bis heute, Vorwahl 1990 | `profile.birthYear` | ja |
| 6 | Zusatzfrage | schwanger / stillend / nichts davon, bzw. Referenzgruppe | `activeLifeStageId` | wenn gezeigt |
| 7a | Routine: Zeiten | drei Uhrzeiten, Schalter | `slotTimes`, `notificationsEnabled`, Push-Erlaubnis | nein, Standard ok |
| 7b | Routine: Praeparat | Scannen / Suchen / Spaeter | `onboarding.firstAction` | nein |
| 8 | Konto | Konto anlegen / Spaeter | `onboarding.accountOffered` | nein |
| 9 | Fertig | "Dein Tagesplan wartet", Knopf | `onboardingCompletedAt` | |

Zurueck ist ab Schritt 3 moeglich (Pfeil oben links), Schritt 2 laesst sich
nicht ueberspringen. Der Fortschrittsbalken zaehlt nur die Schritte, die
tatsaechlich gezeigt werden.

Bestandsnutzerinnen (Onboarding bereits abgeschlossen) sehen das neue
Onboarding nicht; ihnen fehlen Name, Geschlecht und Geburtsjahr, die
Felder bleiben leer und lassen sich im Gesundheitsprofil nachtragen.

## Architektur

```
LifeStageResolver.js        Fachlogik: (gender, birthYear, extra, today) =>
                            { lifeStageId | null, needsExtra: 'pregnancy' |
                            'reference' | null, ageBand, underage, tooYoung }
components/onboarding/
  OnboardingShell.jsx       Fortschritt, Zurueck, animierter Container,
                            Weiter-Leiste
  StepWelcome.jsx, StepLegal.jsx, StepName.jsx, StepGender.jsx,
  StepBirthYear.jsx, StepExtra.jsx, StepRoutineTimes.jsx,
  StepRoutineFirst.jsx, StepAccount.jsx, StepDone.jsx
app/onboarding.jsx          Schrittfolge, Zustand der Antworten, Abschluss
useStore.js                 profile.displayName, profile.gender,
                            profile.birthYear; consents.termsVersion;
                            onboarding: { accountOffered, firstAction }
BackupManager.js            neue Profilfelder sind im Backup (profile ist
                            bereits ein Backup-Feld)
i18n/de/onboarding.js       komplett neu, EN spiegelt
app/(tabs)/(more)/profile   Name, Geschlecht, Geburtsjahr nachtragbar
```

Warum ein Resolver-Modul: Die Zuordnung Alter/Geschlecht zu
Referenzgruppe ist Fachlogik mit Grenzfaellen (14-jaehrige Frau, 65.
Geburtstag, Divers) und gehoert getestet, nicht in einen Screen.

## Datenschutz

Neue lokale Felder: Vorname (optional), Geschlecht, Geburtsjahr. Alle im
verschluesselten Haupt-Store, im Backup, nie am Server (auch nicht mit
Konto; Teilprojekt 2 Sync uebertraegt sie nur verschluesselt).
Datenschutzerklaerung: Absatz "Welche Daten lokal gespeichert werden" um
"Vorname, Geschlecht, Geburtsjahr" ergaenzen, `PRIVACY_VERSION` erhoehen.
Geburtsjahr statt Geburtsdatum: das Jahr reicht fuer die Altersgruppe,
das Datum waere Datensparsamkeit-widrig.

Unter 16: Hinweis, dass ein Elternteil die App einrichtet; kein Konto
(Nutzungsbedingungen). Die lokale Nutzung fuer ein Kind (Referenzgruppe
Kind/Jugend) bleibt ausdruecklich moeglich, das ist ein Anwendungsfall.

## Texte (DE, Ton wie ueberall: erklaerend, nicht werbend)

- Willkommen: "MySuplea ordnet, was du nimmst. Keine Empfehlungen, keine
  Werbung, deine Daten bleiben bei dir." Knopf "Los geht's".
- Rechtliches: "Bevor es losgeht" plus Satz mit Links, Knopf
  "Akzeptieren und weiter".
- Anrede: "Wie sollen wir dich ansprechen?" Feld "Vorname", Text "Nur fuer
  die Anrede in der App. Bleibt auf deinem Geraet." Knoepfe "Weiter",
  "Ueberspringen".
- Geschlecht: "Referenzwerte unterscheiden sich zwischen Frauen und
  Maennern, deshalb fragen wir." Optionen Frau, Mann, Divers, Keine
  Angabe.
- Geburtsjahr: "Obergrenzen haengen vom Alter ab." Rad.
- Zusatzfrage Frau: "Trifft gerade etwas davon zu?" Schwanger, Stillend,
  Nichts davon. Text: "In Schwangerschaft und Stillzeit gelten andere
  Referenzwerte und einige Hinweise."
- Zusatzfrage Referenzgruppe: "Welche Referenzwerte sollen gelten?" mit
  der bekannten Liste.
- Routine Zeiten: "Deine Routine" / "Wann nimmst du meistens etwas?
  Zeiten lassen sich spaeter aendern."
- Routine Praeparat: "Dein erstes Praeparat" / "Scannen", "Suchen",
  "Spaeter".
- Konto: "Sichern?" / "Mit Konto kannst du ein Backup anlegen und spaeter
  mehrere Geraete nutzen. Die App funktioniert auch ohne." / "Konto
  anlegen", "Spaeter ohne Konto".
- Fertig: "Fertig, Nadine." (ohne Name: "Fertig.") / "Dein Tagesplan
  wartet." Knopf "Zum Tagesplan".

Keine Gedankenstriche, kein "hilft", kein "empfohlen".

## Fehler und Grenzfaelle

- Geburtsjahr ergibt Alter unter 4: Hinweis, kein Weiter.
- Alter 4 bis 15: Hinweis "Bitte lass ein Elternteil die App einrichten",
  Weiter moeglich, Konto-Schritt wird uebersprungen.
- Push-Erlaubnis verweigert: Schalter geht auf aus, Hinweis "In den
  Systemeinstellungen aenderbar", Weiter moeglich.
- App wird mitten im Onboarding beendet: Antworten sind Screen-Zustand,
  beim naechsten Start beginnt es von vorn (kein Teilzustand im Store).
- Bestandsnutzerin: Onboarding-Gate bleibt an `onboardingCompletedAt`,
  neue Felder leer.

## Testing

- `tests/life-stage-resolver.test.mjs`: alle Zeilen der Tabelle, Grenzen
  (Geburtstag heute, 4, 11, 15, 18, 51, 65), Divers, fehlende Angaben,
  Zusatzfrage nur bei Frau 15 bis 50.
- `tests/backup-manager.test.mjs` erweitert: neue Profilfelder im Backup.
- i18n-Paritaet automatisch.
- Geraetetest: kompletter Durchlauf als Frau 1990 (Zusatzfrage), als Mann
  1960, als Kind 2015 (Elternhinweis, kein Konto-Schritt), Zurueck in
  jedem Schritt, Push verweigert, Reduce Motion an.

## Abgrenzung

Nicht enthalten: Mehrsprachigkeit der Anrede-Formen, Import aus Health-
App, Foto als Profilbild, erneutes Onboarding fuer Bestandsnutzerinnen,
Aenderung der Referenzwert-Logik selbst.
