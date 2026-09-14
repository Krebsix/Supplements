# Redesign Phase 2: Website-Look und Kern-Screens

Stand: 2026-09-04, Nachtrag zur Spec `2026-09-04-redesign-ia-und-marke.md`.
Nadines Feedback nach Sichtung von Phase 1: "irgendwie sieht alles wie
vorher aus" — berechtigt. Phase 1 baute die Informationsarchitektur um
(Onboarding, Archiv-Chips, Verlauf, Scan-Pruefung), liess aber die zwei
taeglich sichtbaren Kern-Screens (Heute, Praeparate-Liste) und die
Typografie unangetastet. Phase 2 holt den sichtbaren Teil des
Redesign-Mockups nach, in der HELLEN Farbwelt der Website (Entscheidung
"wir gehen nach der Webseite"), nicht im dunklen Nocturne-Look des
Mockups.

Beide Richtungsfragen von Nadine entschieden (2026-09-04):
- Heute-Screen komplett auf die Mockup-Checkliste (Buehne, NextUp-Karte,
  Kennzahlen-Aufklapper fliegen raus).
- Typografie: Space Grotesk fuer Headlines + Mono-Uppercase-Labels;
  Fliesstext und Bedienelemente bleiben Systemschrift.

## 1. Website-Look in den Tokens (theme.js)

Die vier Erkennungsmerkmale von mysuplea.com, uebersetzt in Tokens:

- **Navy als Textfarbe**: `colors.ink` wird Navy `#0b2239` (identisch mit
  `accentInk`), `inkMuted` wird das Website-Muted `#44586e` (Kontrast
  vor Uebernahme nachrechnen, Kontrast-Test erweitern).
- **Harte Linien statt reiner Flaechentrennung**: `surfaces.card` und
  `listGroup` bekommen `borderWidth: border.hairline` mit einer
  navy-getoenten Linienfarbe (neues `colors.rule`-Update), wie die
  Website Karten mit 1px-Linien statt Schatten abgrenzt.
- **Space Grotesk fuer Headlines**: `type.display/heading/subheading`
  bekommen `fontFamily` aus den Google-Fonts-Schnitten. WICHTIG
  (bestehende Projektregel): Bei Schnitt-Fonts nie zusaetzlich
  `fontWeight` setzen (Android-Faux-Bold) — `fontWeight` in diesen drei
  Tokens entfernen, Gewicht kommt aus dem Schnitt.
- **Mono-Uppercase-Sektionslabels**: `type.eyebrow` wird IBM Plex Mono
  mit groesserem letterSpacing, wie die `--font-mono`-Labels der Website.

Fonts ueber `@expo-google-fonts/space-grotesk` und
`@expo-google-fonts/ibm-plex-mono` (offizielle Expo-Pakete), geladen per
`useFonts` in `app/_layout.jsx`. Fliesstext/Buttons/Inputs bleiben
Systemschrift (bewusste Entscheidung, siehe oben).

## 2. Heute-Screen als Checkliste (Dashboard.jsx)

Ersetzt die bisherige Struktur (Navy-Buehne mit DayArc, NextUp-Karte,
Kennzahlen-Aufklapper, Slot-Aufklapper) durch den Mockup-Aufbau:

- Kopf: "Heute" (display), Datumszeile + "X von Y genommen" (Zaehler in
  Akzentfarbe).
- Danach je belegtem Slot eine Zeitgruppe: Mono-Uppercase-Label
  ("MORGENS · 07:30"), beim als-naechstes faelligen Slot mit Zusatz
  "— JETZT" und hervorgehobenen Zeilen.
- Pro Praeparat eine Zeile: Check-Kreis links (leer = offen, gefuellt
  mit Haken = dokumentiert), Titel + Dosis-Subzeile; dokumentiert =
  durchgestrichen und gedimmt. Im JETZT-Slot rechts ein "Nehmen"-Button
  (bestehendes `logIntake`), dokumentierte Zeilen per Tipp wieder
  ruecknehmbar (bestehendes `undoIntakeToday`).
- Was BLEIBT (fachlich begruendete Abweichung vom "komplett"-Mockup):
  die kuratierten Warn-Karten (Tagessummen-Ueberschreitung,
  Lebensphasen-Hinweise, Nachfuellen) — das sind Sicherheits-/
  Fach-Hinweise, keine Kennzahlen-Deko; sie ruecken unter die
  Checkliste. Ebenso bleiben: Ersteinrichtungs-Karte fuer den
  Null-Zustand, Verlauf-Link, Bestand-Link, Disclaimer,
  Cloud-Restore-Hinweis, Erinnerungs-Hinweis.
- Was FLIEGT: DayArc/Buehne (inkl. hellem Statusbar-Handling), NextUp-
  Karte, Kennzahlen-Aufklapper (summaryCard/metricGrid), Slot-Aufklapper
  (Slots sind jetzt immer sichtbar als Zeitgruppen), Duplikat-Gruppen-
  Anzeige nur falls sie an der Buehne hing (pruefen, sonst behalten).
- `NextUp.js` (findNextUp/countOpen) bleibt als Fachlogik: liefert
  weiterhin den JETZT-Slot und den Zaehler.

## 3. Praeparate-Liste als kompakte Zeilen (inventory.jsx)

Die grossen Karten werden Mockup-Zeilen: Icon-Kachel (Pill-Icon auf
Azur-Tint, `radius.sm`) links, Titel + Subzeile ("Dosis · Slot ·
Quelle/Status"), Caret rechts. Der Tipp auf die Zeile oeffnet Bearbeiten;
Pausieren/Archivieren wandern hinter den Detail-Tipp ODER bleiben als
kleine Aktionszeile unter der Zeile — Entscheidung beim Bau nach 44pt-
Regel und Platz. Pausiert-Status und Nachfuell-Hinweis bleiben sichtbar
(Badge/Subzeile). Aktiv/Archiv-Chips aus Phase 1 bleiben unveraendert.

## Nicht in Phase 2

- IBM Plex Sans fuer Fliesstext (bewusst verworfen, Systemschrift
  bleibt).
- Dunkler Nocturne-Look (Entscheidung: helle Website-Welt).
- Wissen/Mehr/Scan-Screens: erben den neuen Look automatisch ueber die
  Token-Aenderungen, kein eigener Umbau.
