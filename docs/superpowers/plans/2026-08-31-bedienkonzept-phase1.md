# Bedienkonzept Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die schnellen Uebersichtlichkeits-Gewinne aus dem Bedienkonzept: eindeutige Namen, nach Zweck benannte Menue-Gruppen, verbindliche Bedien-Regeln in CLAUDE.md, und ein Audit mit Fixes fuer Schrift-Skalierung und Tippflaechen.

**Architecture:** Nur Oberflaeche und Dokumentation; keine Fachlogik, kein Datenmodell, kein Routing-Umbau (der kommt in Phase 2). Der Audit-Teil ist exploration mit festem Pruefkatalog und dokumentierten Fixes.

**Tech Stack:** React Native (StyleSheet, Design-Tokens aus theme.js), i18n flach DE/EN, Tests via `npm test`.

**Spec:** `docs/superpowers/specs/2026-08-31-bedienkonzept-design.md` (Phase 1 aus Entscheidung 7; Entscheidungen 2, 5, 6)

**Abweichung von der Spec, hier verbindlich entschieden:** Die Spec nennt fuer "Mehr" vier Gruppen inkl. "Konto" und eingeklapptes "Rechtliches". Die Bestandsaufnahme zeigt: menu.jsx IST bereits eine gegliederte Liste (drei Gruppen mit Untertiteln, Konto als Kopfkarte, Rechtliches als einzeilige Fusszeile). Kopfkarte und Fusszeile erfuellen den Zweck besser als weitere Gruppen; Phase 1 schaerft deshalb nur die Gruppennamen und die Tippflaechen der Fusszeile, statt umzubauen.

## Global Constraints

- Keine Hex-Werte in Screens/Komponenten, nur Tokens aus `theme.js`. Keine Emojis als Icons. Keine Gedankenstriche ("—") in Nutzertexten DE/EN.
- Jeder i18n-Schluessel in DE und EN (tests/i18n.test.mjs prueft Parity und verwaiste Schluessel).
- Bedien-Regeln (werden in Task 1 Teil von CLAUDE.md und gelten ab dann): Tippflaechen mindestens 44x44 pt; jede Funktion per einzelnem Tipp erreichbar; Texte skalieren mit der Systemschrift, Layouts brechen um statt abzuschneiden; Status nie nur ueber Farbe; maximal zwei Aufklapp-Ebenen; sichtbare Rueckmeldung am Ort der Aktion.
- Deutsche Code-Kommentare, Conventional Commits, `npm test` gruen nach jedem Task. Nicht pushen.
- Verhalten aendert sich nicht (keine neuen Features, keine entfernten Wege); nur Darstellung, Namen, Dokumentation.

---

### Task 1: Namen, Gruppen, Bedien-Regeln

**Files:**
- Modify: `i18n/de/common.js`, `i18n/en/common.js` (`nav.results`)
- Modify: `i18n/de/home.js`, `i18n/en/home.js` (`home.section.*`)
- Modify: `CLAUDE.md` (neuer Abschnitt "Bedienregeln" im Design-Teil)

**Interfaces:** keine; reine Texte und Doku.

- [ ] **Step 1: nav.results umbenennen**

Der Scan-Ergebnis-Screen und der Analyse-Tab heissen beide "Analyse" (Spec-Problem 2). In `i18n/de/common.js`: `'nav.results': 'Analyse',` → `'nav.results': 'Scan prüfen',`. In `i18n/en/common.js` den Wert der gleichen Zeile (`grep -n "nav.results" i18n/en/common.js`) auf `'Check scan'` setzen. Danach `grep -rn "nav.results" app components` — es darf nur die Screen-Registrierung in `app/(tabs)/(scan)/_layout.jsx` treffen.

- [ ] **Step 2: Menue-Gruppennamen nach der Eine-Frage-Logik**

In `i18n/de/home.js` (Zeilen um 21-23):

```js
  'home.section.workflow': 'Meine Routine',
  'home.section.insight': 'Meine Daten',
  'home.section.app': 'App und Erinnerungen',
```

In `i18n/en/home.js` an den gleichen Schluesseln: `'My routine'`, `'My data'`, `'App and reminders'`.

- [ ] **Step 3: CLAUDE.md Bedienregeln**

In `CLAUDE.md`, Abschnitt "## Design", nach dem letzten Aufzaehlungspunkt einen Unterabschnitt anfuegen:

```markdown
### Bedienregeln (Spec 2026-08-31-bedienkonzept-design.md, verbindlich)

- Tippflaechen mindestens 44x44 pt (minHeight/hitSlop), mit Abstand zueinander.
- Jede Funktion per einzelnem Tipp erreichbar; Gesten nur als Abkuerzung.
- Dynamic Type: Texte skalieren mit der Systemschrift; Layouts brechen um
  statt abzuschneiden. `allowFontScaling={false}` ist verboten;
  `maxFontSizeMultiplier` nur, wo Umbruch unmoeglich ist, nie unter 1.5.
- Status nie nur ueber Farbe: immer zusaetzlich Text oder Icon.
- Maximal zwei Aufklapp-Ebenen fuer dieselbe Information.
- Sichtbare Rueckmeldung am Ort der Aktion, nie nur Haptik.
- Die erste Flaeche eines Screens beantwortet genau eine Frage; Tiefe ist
  einen Tipp entfernt, nie zwei.
```

- [ ] **Step 4: Tests und Commit**

Run: `npm test`
Expected: `ALLE TESTS BESTANDEN` (i18n-Parity gruen).

```bash
git add i18n/de/common.js i18n/en/common.js i18n/de/home.js i18n/en/home.js CLAUDE.md
git commit -m "feat(ux): eindeutige Screen-Namen, Menue-Gruppen nach Zweck, Bedienregeln in CLAUDE.md"
```

---

### Task 2: Tippflaechen-Audit mit Fixes (44 pt)

**Files:**
- Modify: `theme.js` (`surfaces.chip`: `minHeight: 44` und `justifyContent: 'center'` ergaenzen; `surfaces.buttonQuiet` pruefen)
- Modify: `app/(tabs)/(more)/menu.jsx` (Fusszeilen-Links Datenschutz/Impressum/Nutzungsbedingungen: `hitSlop` und `minHeight: 44` via Style)
- Modify: weitere Fundstellen laut Audit (erwartet: `components/SlotReason.jsx` Zeilen-Taps, `components/SubstanceInsightCard.jsx` expandButton, `components/FirstStepsCard.jsx` QuietLink, `app/(tabs)/(discover)/search.jsx` Chips, `app/AddSupplement.jsx` Einheiten-Chips, `app/(tabs)/(more)/account.jsx` quietButton)

**Interfaces:** keine.

- [ ] **Step 1: Fundstellen erheben**

Run: `grep -rn "TouchableOpacity\|Pressable" app components --include=*.jsx -l` und je Datei die Styles der tappbaren Elemente pruefen: Alles ohne `minHeight >= 44` (oder gleichwertiges Padding: paddingVertical >= 12 bei einzeiligem `type.small`-Text reicht NICHT — 15 lh 20 + 2*12 = 44 knapp ok, nachrechnen) und ohne `hitSlop` kommt auf die Fix-Liste. Die Liste mit Datei:Zeile in den Bericht schreiben, BEVOR gefixt wird.

- [ ] **Step 2: Zentral fixen, wo ein Token hilft**

`theme.js`: `surfaces.chip` bekommt `minHeight: 44` und `justifyContent: 'center'` (Chips sind projektweit tappbar: Suche-Sortierung, Einheiten, Haeufigkeit, Slots, Erinnerungs-Schwellen). Sichtpruefung der vier Chip-Verwender auf Layoutbruch (esbuild + Screens lesen; kein Geraet noetig, Flex-Layouts vertragen minHeight).

- [ ] **Step 3: Einzelfixes**

Je Fundstelle: `minHeight: 44` plus vertikale Zentrierung ODER `hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}`, wenn das Layout kompakt bleiben muss (Inline-Links wie die Rechts-Fusszeile, Quellen-Links). Kommentar an zentralen Stellen: `// Tippflaeche 44 pt (CLAUDE.md Bedienregeln)`.

- [ ] **Step 4: Tests und Commit**

Run: `for f in $(git diff --name-only -- '*.jsx'); do npx esbuild "$f" --loader:.jsx=jsx --log-level=error --outfile=/dev/null; done; npm test`
Expected: keine Fehler, `ALLE TESTS BESTANDEN`.

```bash
git add -A
git commit -m "fix(a11y): Tippflaechen auf 44pt (Audit Bedienregeln)"
```

---

### Task 3: Dynamic-Type-Audit mit Fixes

**Files:**
- Modify: Fundstellen laut Audit in den Kernscreens: `app/(tabs)/(today)/Dashboard.jsx`, `app/AddSupplement.jsx`, `app/(tabs)/(more)/account.jsx`, `app/(tabs)/(more)/menu.jsx`, `app/(tabs)/(scan)/results.jsx`, `app/(tabs)/(discover)/search.jsx`, `components/FirstStepsCard.jsx`, `components/SlotChips.jsx`, `components/FrequencyChips.jsx`, `components/ProductSummaryCard.jsx`, `components/onboarding/*`

**Interfaces:** keine.

- [ ] **Step 1: Verbote pruefen**

Run: `grep -rn "allowFontScaling" app components` — Erwartung: kein Treffer (Stand heute: 0). Bleibt es dabei, in den Bericht schreiben.

- [ ] **Step 2: Feste Hoehen finden**

Run: `grep -rn "height: [0-9]" app components --include=*.jsx | grep -v minHeight | grep -v maxHeight`
Jede feste `height` an einem Container, der Text enthaelt, ist ein Kandidat: bei grosser Systemschrift wird Text abgeschnitten. Fix: `height` → `minHeight` (gleicher Wert), sofern das Layout es vertraegt. Fundstellen und Entscheidung je Stelle in den Bericht.

- [ ] **Step 3: numberOfLines pruefen**

Run: `grep -rn "numberOfLines" app components --include=*.jsx`
Je Treffer entscheiden: Ist der Text kritisch (Wirkstoffname, Warnhinweis, Betrag)? Dann `numberOfLines` entfernen oder erhoehen, damit nichts Wichtiges abgeschnitten wird. Schmuck-Texte (Untertitel in Listen) duerfen bleiben. Entscheidungen in den Bericht.

- [ ] **Step 4: Badges und Chips mit Zahlen**

Der Ersteinrichtungs-Badge (`components/FirstStepsCard.jsx`, `BADGE = 26` mit fester width/height) und aehnliche feste Kreise: bei Schrift-Skalierung waechst die Ziffer aus dem Kreis. Fix: width/height → minWidth/minHeight + `aspectRatio: 1` entfernen falls noetig, oder `maxFontSizeMultiplier={1.5}` auf der Ziffer mit Kommentar (erlaubte Ausnahme laut Bedienregeln, nie unter 1.5).

- [ ] **Step 5: Tests und Commit**

Run: wie Task 2.

```bash
git add -A
git commit -m "fix(a11y): Dynamic-Type-Audit, Layouts brechen um statt abzuschneiden"
```

---

## Self-Review

- Spec Phase 1 deckt: Namen (Task 1, Entscheidung 6), Menue-Gruppen (Task 1, Entscheidung 2 in der oben dokumentierten, verkleinerten Form), Bedienregeln in CLAUDE.md (Task 1, Entscheidung 5), Tippflaechen- und Dynamic-Type-Audit (Tasks 2-3). "Verlauf/Bestand-Verlinkung" aus der Spec entfaellt: beides ist bereits im Heute-Stack und im Menue verlinkt; der Umzug in den Bestand-Tab ist Phase 2.
- Keine Platzhalter; Audit-Tasks tragen Methode, Erwartung und Fix-Muster.
- Typen: keine Schnittstellen zwischen Tasks.
