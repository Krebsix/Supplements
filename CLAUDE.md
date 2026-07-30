# CLAUDE.md

Guidance fuer Claude Code (claude.ai/code) in diesem Repo.

---

## Projektziel

**Supplements** — Expo/React-Native-App zur Einnahme-Planung von
Nahrungsergaenzungsmitteln. Ordnet Praeparate in Tages-Slots ein, warnt vor
Wechselwirkungen, verwaltet Kur-Zyklen und erinnert per Push.

Eigenstaendiges Projekt. Kein Bezug zu FHK oder SchulHub.

Sprache: Deutsch (Oberflaeche und Code-Kommentare).

---

## Befehle

```bash
npm start          # Expo Dev-Server
npm run android    # Android
npm run ios        # iOS
npm test           # Logik-Tests (Matching, Referenzwerte, Datenintegritaet)
```

`npm test` buendelt `tests/substance-logic.test.mjs` mit esbuild und laeuft in
Node — noetig, weil die Module ohne Dateiendungen importieren (Metro-Konvention).
Kein Linter konfiguriert.

---

## Architektur

Routing ueber **expo-router** (dateibasiert), State ueber **zustand**,
Styling ueber **nativewind/tailwind**.

```
app/                       Routen (expo-router)
├── index.jsx              Einstieg
├── Dashboard.jsx          Tagesuebersicht
├── AddSupplement.jsx      Anlegen/Bearbeiten
├── scanner.jsx            Kamera-Erfassung (expo-camera)
├── results.jsx            Scan-Ergebnis pruefen
├── search.jsx, history.jsx, settings.jsx
└── _layout.jsx

components/                AppHeader, FeatureCard, PrimaryButton,
                           ScreenContainer, StatusBadge, SupplementResultCard

useStore.js                Hauptzustand (zustand + AsyncStorage)
useNotificationStore.js    Benachrichtigungs-Zustand
```

### Fachlogik — liegt bewusst ausserhalb der UI

| Datei | Aufgabe |
|---|---|
| `TimingEngine.js` | Tages-Slots, ordnet Supplements ein |
| `ConflictLogic.js` | Regelwerk fuer Konflikte und Synergien |
| `AbsorptionBlocker.js` | 2h-Globalsperre nach Flohsamenschalen (ID 43) |
| `CureManager.js` | Kur-Zyklen: `cycle` (z. B. 21/7) und `stepped` (Dosis-Stufen) |
| `SupplementResearchLogic.js` | Aeltere Mini-Wissensdatenbank (Default-Slot, Hinweis) |
| `SubstanceMatcher.js` | Ordnet Etikettentexte Substanzen und chemischen Formen zu |
| `DoseNormalizer.js` | Entscheidet, ob eine Menge die Verbindung oder das Element meint, und rechnet nur im ersten Fall herunter |
| `ReferenceCheck.js` | Vergleicht Mengen mit Referenzwerten je Lebensphase, sammelt Lebensphasen-Hinweise |
| `StackAnalyzer.js` | Summiert Wirkstoffe ueber ALLE Produkte des Bestands und prueft die Tagessumme gegen Obergrenzen |
| `ComplaintSearch.js` | Beschwerdesuche: findet Beschwerdebilder aus Alltagssprache und verknuepft sie mit dem Bestand |
| `ProfileCheck.js` | Verknuepft das persoenliche Profil (Medikamentengruppen) mit dem Bestand und zitiert die belegten Hinweise |
| `OutcomeTracker.js` | Wirkungskontrolle: Ausgangswert, Verlauf, Einnahmetreue — und die Stoerfaktoren, die gegen eine Zuordnung sprechen |
| `LabValues.js` | Laborwerte erfassen und im Verlauf zeigen. Bewertet NICHT — Referenzbereiche kommen aus dem Befund |
| `ExportBuilder.js` | Bericht fuer Praxis/Apotheke als Markdown. Abschnitte waehlbar (Datensparsamkeit) |
| `CostAnalyzer.js` | Kosten je Produkt aus TATSAECHLICHEM Verbrauch, plus die Verbindung zur Wirkungskontrolle (was lief nie ueberprueft mit) |
| `NotificationScheduler.js` | Planung der Push-Erinnerungen |

### Wirkstoff-Datenbank (`data/`)

| Datei | Inhalt |
|---|---|
| `data/substances.js` | Kanonische Wirkstoffe: Synonyme, chemische Formen mit Bioverfuegbarkeit, Anwendungsgebiete, Warnhinweise |
| `data/referenceValues.js` | Referenzwerte und Obergrenzen (UL) je Lebensphase — 8 Gruppen von Kind bis 65+ |
| `data/lifeStageAdvisories.js` | Was in einer bestimmten Lebensphase gilt (z. B. Retinol in der Schwangerschaft). Severity: `contraindicated`, `medical`, `attention`, `increased` |
| `data/certifications.js` | Pruefsiegel mit Geltungsbereich. Das Feld `scope` sagt, was ein Siegel NICHT abdeckt — bewusst so |
| `data/elementalFractions.js` | Massenanteil des Elements in einer Verbindung (500 mg Magnesiumcitrat = rund 81 mg Magnesium). Stoechiometrie mit Summenformel als Beleg |
| `data/outcomeMetrics.js` | Zielgroessen der Wirkungskontrolle (5er-Skala). `direction` sagt, wo "besser" liegt — bei Beschwerden unten |
| `data/complaints.js` | 12 Beschwerdebilder: Einordnung, Ursachenbereiche, Warnsignale, Naehrstoffbezuege, Fragen fuer die Praxis |
| `data/labMarkers.js` | Gaengige Laborwerte als Eingabehilfe. Bewusst OHNE Referenzbereiche — die haengen von Labor und Methode ab |
| `data/medicationClasses.js` | Medikamentengruppen und ihre BELEGTEN Bezuege zu Wirkstoffen. Keine eigene Interaktionsdatenbank — jede Zeile zitiert woertlich aus substances.js/lifeStageAdvisories.js |

Bewusst als versioniertes JS-Modul im Repo, nicht in einer Datenbank:
Katalogwissen aendert sich selten, die App bleibt offline-faehig, und jede
Aenderung an einem Referenzwert ist ueber Git nachvollziehbar.

**Trennung beachten:** `inventory.json` = was die Nutzerin besitzt.
`data/substances.js` = was ein Wirkstoff ist. Nicht vermischen.

**Regel aus dem Code selbst** (`ConflictLogic.js`): *„Logik NIEMALS in
UI-Komponenten!"* Neue Regeln gehoeren in diese Module, nicht in Screens.

---

## Branch-Lage

**Der Arbeitsbranch ist `phase-2s-scan-data-integrity-traceability`, nicht `main`.**
Die Entwicklung laeuft in einer langen Kette von `phase-*`-Branches; `main` liegt
weit zurueck. Alle 23 Branches sind auf GitHub.

Vor dem Anlegen eines neuen Branches pruefen, welcher der aktuelle Kopf ist —
nicht blind von `main` abzweigen.

---

## Sprachen

Oberflaeche auf Deutsch und Englisch, umschaltbar im Hauptmenue und in den
Einstellungen. Kataloge unter `i18n/de/` und `i18n/en/`, nach Bereich
aufgeteilt, Schluessel flach (`dashboard.title`).

- Komponenten nutzen `useTranslation()` aus `i18n/`.
- Fachlogik-Module nutzen `tr()` aus `i18n/runtime` — dort gibt es keine Hooks.
  `runtime.js` importiert bewusst NICHT den Store: `useStore` importiert
  seinerseits `TimingEngine`, das waere ein Ringschluss. Der Store spiegelt
  seinen Wert per `setActiveLanguage()` dorthin.
- Deutsch ist die Pflegesprache. Fehlt ein englischer Schluessel, faellt die App
  auf Deutsch zurueck statt auf eine leere Zeile.
- **Die Fachtexte der Wirkstoff-Datenbank bleiben vorerst deutsch.** Eine
  unsaubere englische Uebersetzung von "wird eingesetzt bei" klingt schnell
  praeskriptiv und waere ein Compliance-Risiko, kein Schoenheitsfehler.

---

## Design

Tokens in `theme.js`. **Keine Hex-Werte in Screens oder Komponenten** — das
ist eine Projektregel und wird eingehalten (Stand: null Treffer).

Die Palette ist bewusst nicht die Tailwind-Vorgabe: Vorher lief alles auf
slate-900/slate-500/teal-700, also genau den Werten, die praktisch jedes
schnell gebaute Projekt verwendet. Die Richtung heisst jetzt "Papier und
Tinte" — warmes Off-White statt blaustichigem Grau, tiefes Petrol
(`colors.accent`) statt Teal, gedeckte Erdtoene fuer Warnungen statt
Signalampel.

- Ueberschriften laufen auf einer **Serifenschrift** (`type.display`,
  `type.heading`, `type.subheading`, `type.numeral`). Systemschriften,
  kein Font-Download. Das ist der sichtbarste Unterschied zum Einheitslook.
- Fliesstext bleibt auf der Systemschrift, weil sie klein besser liest.
- Keine vollrunden Pillen mehr (`borderRadius: 999`), nur moderate Radien.
- Statusfarben ueber `toneFor(level)`. Eine Grenzwertueberschreitung ist ein
  Hinweis, kein Alarm — deshalb gedeckt.
- **Keine Gedankenstriche in Nutzertexten.** Doppelpunkt, Komma oder Punkt
  statt "—". Der Gedankenstrich ist ein verlaessliches Erkennungsmerkmal
  maschinell erzeugter Texte; in Kommentaren im Code ist er unproblematisch.

---

## Datenhaltung

Alles lokal auf dem Geraet: **zustand + AsyncStorage**, kein Server, keine Datenbank.
Es gibt keine Synchronisation und kein Backup. Ein Geraetewechsel oder das
Loeschen der App bedeutet Datenverlust.

`inventory.json` und `data/mockScanResult.js` sind statische Beispieldaten.

---

## Harte Regeln

- Fachlogik in die Module oben, nie in Screens.
- **Keine erfundenen Werte.** Nicht erkannte Dosierung oder Einheit bleiben leer und
  werden als fehlend gespeichert — frueher wurden sie still auf `'1'` bzw. `'Kapsel'`
  gesetzt, was wie ein erkannter Wert aussah. Das war ein Bug, siehe Commit
  `6bd60b6`.
- **Verbindungsmenge ist nicht Elementmenge.** Referenzwerte sind immer elementar.
  „Magnesiumcitrat 500 mg" enthaelt rund 81 mg Magnesium — ungeprueft verglichen
  ergab das eine Grenzwert-Warnung, wo keine war. Umgerechnet wird aber NUR, wenn
  die Menge erkennbar an der Verbindung haengt: nach Richtlinie 2002/46/EG und LMIV
  muss die Naehrwerttabelle bereits die elementare Menge nennen, pauschales
  Herunterrechnen wuerde eine echte Ueberdosierung verschleiern. Die Entscheidung
  trifft `DoseNormalizer.js`; ohne gesicherten Elementanteil wird gar nicht
  gerechnet, sondern gekennzeichnet.
- **Obergrenzen gelten fuer die Tagessumme, nicht pro Dose.** Wirkstoffmengen
  muessen ueber alle aktiven Produkte addiert werden (`StackAnalyzer.js`) —
  drei unauffaellige Praeparate koennen zusammen die Obergrenze reissen.
- **Keine erfundene Medikamenten-Interaktionsdatenbank.** Wechselwirkungen
  gehoeren in eine kuratierte oder lizenzierte Fachquelle; ein Sprachmodell ist
  dafuer nicht zulaessig. `data/medicationClasses.js` enthaelt deshalb keine
  eigenstaendigen Aussagen, sondern verweist mit woertlichem Zitat auf Saetze,
  die in `data/substances.js` bzw. `data/lifeStageAdvisories.js` bereits mit
  Quelle belegt sind. Ein Test prueft, dass jedes Zitat dort noch woertlich
  steht — sonst behauptet die App etwas, das die Quelle nicht mehr hergibt.
- **Eine Veraenderung ist kein Wirkungsnachweis.** Die Wirkungskontrolle darf
  nie "X hat geholfen" sagen — auch nicht abgeschwaecht ("scheint zu wirken"),
  das ist dieselbe Aussage mit Weichzeichner. Erlaubt ist "deine Bewertung ist
  gestiegen". `OutcomeTracker.js` liefert deshalb Zahlen und Stoerfaktoren
  GETRENNT zurueck, und die Oberflaeche zeigt beides nebeneinander. Ohne den
  Stoerfaktor-Block waere das Feature ein Bestaetigungsautomat.
- **"Nie ueberprueft" ist kein Urteil ueber das Produkt.** Die Kostenanalyse
  zeigt, welche Ausgaben ohne Wirkungskontrolle mitlaufen. Das ist eine
  Beobachtungsluecke, keine Aussage ueber Wirksamkeit — die Formulierung muss
  das offenhalten.
- **Aus einer Beschwerde folgt kein Mangel.** Die Beschwerdesuche fuehrt mit der
  Einordnung ("Muedigkeit ist unspezifisch"), dann den Ursachenbereichen — bei
  den meisten Beschwerden Schlaf, Stress und Medikamente, nicht Naehrstoffe —,
  dann den Warnsignalen. Naehrstoffe stehen bewusst ganz unten und eingeklappt.
  Wer bei "muede" mit Eisen anfaengt, hat die Beschwerde bereits gedeutet.
  Warnsignale bleiben beobachtend formuliert ("kommt gemeinsam vor mit"), nie
  deutend ("deutet hin auf").
- **Laborwerte werden nicht interpretiert.** Kein "zu niedrig", kein "Mangel",
  keine Ampelfarbe. Referenzbereiche bringt die App nicht mit: Sie unterscheiden
  sich je Labor und Messmethode, ein hinterlegter Wert waere im Einzelfall
  falsch. Steht im Befund einer, wird er als Angabe des Labors uebernommen.
- **Ein Treffer ist keine Bewertung der Person.** Die App kennt weder Praeparat
  noch Dosis noch Befund. Formulierung deshalb immer "dazu ist ein Hinweis
  hinterlegt", nie "das ist fuer dich gefaehrlich".
- Scan-Ergebnisse tragen `analysisMode` (`'mock'`, `'demo-fallback'`, `'vision'`
  fuer die Claude-Vision-Auswertung, `'barcode-off'` fuer Open-Food-Facts-Treffer)
  und eine `captureSummary`, damit nachvollziehbar ist, woher ein Eintrag stammt.
- Echte Scan-Analyse: `ScanAnalyzer.js` (App) → Supabase Edge Function
  `supabase/functions/analyze-supplement` (Claude Vision, Structured Output).
  Der `ANTHROPIC_API_KEY` liegt NUR als Supabase-Secret, nie in der App.
  Endpoint-Konfiguration in `scanConfig.js` (leere URL = Mock-Fallback).
- Barcode-Pfad: `BarcodeLookup.js` fragt Open Food Facts ab (kein Key noetig).
- Keine gesundheitlichen Empfehlungen im Ausgabetext — die App ordnet Zeitpunkte und
  Konflikte, sie beraet nicht. Konkret: **Referenzwerte anzeigen statt Dosierungen
  empfehlen** ("enthaelt 400 mg, Obergrenze liegt bei 250 mg"), Anwendungsgebiete
  **deskriptiv** formulieren ("wird eingesetzt bei"), nie praeskriptiv. Das haelt die
  App ausserhalb der Medizinprodukte-Regulierung (MDR) und der Health-Claims-Verordnung.
- **Keine Herstellernamen und keine Qualitaets-Rankings von Marken.** Qualitaet wird
  ueber pruefbare Zertifizierungen abgebildet, nicht ueber Markenbewertungen —
  rechtlich unangreifbar und offen fuer spaetere Werbepartnerschaften.
- Deutsche Code-Kommentare beibehalten.
