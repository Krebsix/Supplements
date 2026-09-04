# Redesign: Onboarding straffen, Informationsarchitektur verdichten, Marke angleichen

Stand: 2026-09-04. Auftrag Nadine: externes Redesign-Mockup ("Nocturne"-
Designsystem, 7 Screens, `design_handoff_mysuplea_redesign/`) auf
Gewinn pruefen, dabei Bedienkonzept-Spec (2026-08-31) und Onboarding-Spec
(2026-08-30) nicht blind ueberschreiben. Zwei Entscheidungen im Gespraech
bestaetigt: Tab-Bar bleibt bei fuenf Tabs (keine Regression zur
08-31-Spec), Onboarding wird vollstaendig auf zwei Screens verdichtet.
Waehrend der Arbeit kam eine dritte, groessere Entscheidung dazu: die
App-Akzentfarbe soll sich der Marke (Website, App-Icon) annaehern statt
eigenstaendig zu bleiben.

## Was aus dem Mockup NICHT uebernommen wird

Nocturne-Palette (dunkler Grund, Lila-Akzent), Inter, "Buttons nie
gefuellt", Phosphor-Icons. Das Handoff selbst sagt, nur Layout/Copy seien
verbindlich, falls die App beim eigenen Branding bleibt. Farbe bleibt
zwar eigenstaendig (Azur/Navy statt Lila, s.u.), aber ueber die
bestehenden `theme.js`-Tokens, Feather-Icons und die App-eigene Dichte,
nicht als 1:1-Uebernahme.

## 1. Onboarding: zehn Schritte auf zwei Screens

**Ist:** `app/onboarding.jsx` + `OnboardingSteps.js` fahren bis zu zehn
Einzelschritte (Welcome, Legal, Name, Gender, BirthYear, Extra optional,
RoutineTimes, RoutineFirst, Account, Done) mit `OnboardingShell.jsx`
(eine Frage pro Screen, Slide-Transition, Fortschrittsbalken).

**Soll:**
- **Screen 1 "Los geht's"**: Begruessungstext + Vorname + Geschlecht
  (4er-Chips) + Geburtsjahr (Picker) + Zusatzfrage (nur wenn
  `extraQuestionFor()` sie verlangt) + Rechtstext-Checkbox, eine
  scrollbare Flaeche.
- **Screen 2 "Loslegen"**: drei Einnahmezeiten-Zeilen (Picker) +
  Erinnerungen-Toggle + optionales erstes Praeparat (Scannen/Suchen-
  Kacheln, "Spaeter" dritte Option) + Fusszeile "Konto fuer Backup?
  Spaeter unter Mehr" statt eigenem `StepAccount`-Screen.
- `StepDone` entfaellt, nach Screen 2 direkter Sprung zu `/Dashboard`.
- `resolveLifeStage()`/`extraQuestionFor()` (LifeStageResolver.js) bleiben
  fachlich unveraendert, nur die Praesentation aendert sich.

**Abweichung von einer verbindlichen Regel:** Die Bedienkonzept-Spec
verlangt "eine Frage pro Screen". Beide Onboarding-Screens buendeln
mehrere Felder. Bewusste Ausnahme fuer den einmaligen Ersteinrichtungs-
Flow, gerahmt als je eine uebergeordnete Frage ("Wer bist du" / "Wann
nimmst du etwas"), nicht als Praezedenzfall fuer andere Screens.

**Betroffene Dateien:** `app/onboarding.jsx`, `OnboardingSteps.js`,
`components/onboarding/OnboardingShell.jsx` (Formular- statt Slide-
Modus), `components/onboarding/Step*.jsx` (Inhalte wandern in zwei
Container-Komponenten statt eigener Screens; welche Step-Komponenten
als reine Feld-Bloecke weiterleben und welche aufgehen, entscheidet der
Implementierungsplan).

## 2. Tab-Bar bleibt bei fuenf, zwei Bereiche werden neu geschnitten

**Bestand -> "Praeparate":** `(inventory)/inventory.jsx` bekommt zwei
Filterchips "Aktiv · N" / "Archiv · N" statt Bestand und Archiv als
getrennte Wege. Gleiche Datenquelle, `archiveUserSupplement` bleibt die
einzige Loeschung (Archivieren-statt-Loeschen-Prinzip unveraendert).

**Scan-Pruefung:** `(scan)/results.jsx` bekommt das Feld-fuer-Feld-Muster
aus dem Mockup: sicher erkannt = Wert + gefuelltes Icon, unsicher =
Randfarbe + Stift-Icon (tappbar zum Editieren). Footer "Verwerfen" /
"Bestaetigen & uebernehmen". Deckt sich mit der bestehenden Pruef-
Schleusen-Logik (`verified=false` in `product_cache`), ist aber eine
UI-Verfeinerung, keine neue Fachlogik.

**Verlauf bekommt keinen sechsten Tab.** `(today)/history.jsx` bekommt
Zeitraum-Chips (Woche/Monat/Alles), eine Einnahme-Treue-Kennzahl und ein
Wochenbalkendiagramm, gespeist aus `OutcomeTracker.js` (das die Zahlen
schon berechnet). Einstieg ueber eine Karte oder ein Icon auf dem
Heute-Screen, nicht ueber einen weiteren Tab-Platz.

**Wissen und Hinzufuegen bleiben unveraendert** — keine Regression zur
08-31-Spec, wie im Gespraech bestaetigt.

**Mehr:** bleibt Gruppen-Hub (`menu.jsx` + Unterseiten), nur die
Werte-Zeilen (Einnahmezeiten, Sprache) zeigen kuenftig den aktuellen Wert
direkt in der Zeile statt nur einen Chevron.

**Betroffene Dateien:** `app/(tabs)/(inventory)/inventory.jsx`,
`app/(tabs)/(scan)/results.jsx`, `app/(tabs)/(today)/history.jsx`,
`app/(tabs)/(today)/Dashboard.jsx` (Verlauf-Einstieg),
`app/(tabs)/(more)/menu.jsx`.

## 3. Marke: Akzentfarbe zu Azur/Navy

**Befund:** Das tatsaechliche App-Icon (`assets/icon.png`) ist Navy-Grund
mit Azur/Blau-Kapsel, kein Petrol. Der Kommentar in `theme.js`
("Akzent: das Petrol aus dem App-Icon") stimmt nicht mehr mit dem Icon
ueberein — vermutlich seit der Petrol-Auffrischung vom 2026-08-31 nicht
mehr synchron. Die Website (`web/src/styles/tokens.css`, live auf
mysuplea.com, per curl gegengeprueft) nutzt bereits Navy `#0b2239` und
Azur `#1e6fd9`, mit dem expliziten Kommentar, das App-Icon sei die
gemeinsame Quelle. Aktuell passt die App-Akzentfarbe also weder zum
eigenen Icon noch zur Website.

**Soll:** `colors.accent` in `theme.js` wechselt von `#1d6472` (Petrol)
auf `#1e6fd9` (Azur), der dunkle Ton (aktuell `accentInk`) wird an Navy
`#0b2239` angenaehert. `accentSoft`/abgeleitete Toene (`onDark.*`) werden
als Aufhellungen von Azur/Navy neu abgeleitet, keine neue, dritte Palette
(gleiches Vorgehen wie beim Petrol-Refresh vom 2026-08-31). Alle
Kontrastwerte (WCAG AA, 4.5:1 Fliesstext / 3:1 grosse Schrift) werden vor
Uebernahme nachgerechnet, wie es die Bedienregeln verlangen.

**Was unveraendert bleibt:** warmer Off-White-Hintergrund (`canvas`,
`surface`), Newsreader/Instrument Sans, Statusfarben (alert/caution/
affirm). Nur der Markenakzent wechselt, nicht die gesamte Palette oder
Typografie — eine native App und eine Marketing-Website duerfen
unterschiedliche Dichte und Lesetypografie haben, die Farbe ist der
Wiedererkennungs-Trager.

**Entscheidungsrevision:** Der Kommentar in `web/src/styles/tokens.css`
("bewusst NICHT mehr an theme.js gekoppelt") wird hinfaellig und muss
beim Umsetzen aktualisiert werden. Wird per `brain-capture` als
Entscheidung protokolliert (supersedes die bisherige Entkopplungs-Notiz).

**Betroffene Dateien:** `theme.js` (`colors`, `onDark`),
`web/src/styles/tokens.css` (Kommentar-Update, liegt im Worktree
`.claude/worktrees/website`, separater Branch `phase-2u-website` —
Deploy-Frage klaeren, siehe Offene Punkte).

## Offene Punkte fuer den Implementierungsplan

1. Exakte neue Werte fuer `accentSoft`, `accentInk`, `onDark.*` und
   `caution`/`alert`-Abstand zu Azur (Kontrast nachrechnen, nicht raten).
2. Welche `Step*.jsx`-Komponenten als Feld-Bloecke weiterleben vs. neu
   geschrieben werden (Onboarding-Umbau).
3. Ob der Website-Kommentar-Fix (`tokens.css`) im selben Auftrag oder
   separat auf `phase-2u-website` erfolgt, da dieser Branch bereits live
   deployed ist (Vercel `mysuplea-legal`) und eigenem Push-Freigabe-
   Prozess unterliegt.
4. Genaue Platzierung des Verlauf-Einstiegs auf dem Heute-Screen (Karte
   in `curatedCards` vs. Header-Icon).
