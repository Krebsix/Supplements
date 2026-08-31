# Bedienkonzept Phase 3a: Tagesplan als Arbeitsfluss — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Der Tagesplan beantwortet zuerst "Was nehme ich als Naechstes?" mit einer handelbaren Karte, dann kommt der Rest des Tages; die Kennzahlen-Wand (Fortschrittskarte, vier Metrik-Kacheln, Insight) schrumpft auf eine Zeile mit Aufklapper.

**Architecture:** Reine Auswahllogik "welcher Slot ist als Naechstes dran" in einem neuen Node-testbaren Modul `NextUp.js`. `Dashboard.jsx` wird umgeordnet, nicht neu geschrieben: die bestehende Eintrags-Zeile (Name, Status, SlotReason, Dokumentieren) wird in eine wiederverwendete Render-Funktion gezogen und von der neuen Als-Naechstes-Karte und den uebrigen Slot-Karten gemeinsam genutzt. Verhalten (Dokumentieren, Undo, Bearbeiten, Entfernen) bleibt identisch.

**Tech Stack:** React Native, zustand, Design-Tokens, i18n DE/EN, Tests via `npm test` (echter Exit-Code).

**Spec:** `docs/superpowers/specs/2026-08-31-bedienkonzept-design.md`, Entscheidung 3. (Entscheidung 4, Referenzwert-Balken, ist bewusst NICHT Teil dieses Plans; eigener Plan 3b.) Ausloeser: Nadine 31.08. 14:29/14:35 "Dashboard zu unuebersichtlich, ein zusammenhaengender Arbeitsfluss waere toll".

## Global Constraints

- Bedienregeln aus CLAUDE.md: erste Flaeche beantwortet genau eine Frage; Tiefe einen Tipp entfernt, nie zwei; Tippflaechen 44 pt; Status nie nur Farbe; Dynamic Type (minHeight statt height); Medisafe-Muster: Eintraege bleiben sichtbar offen, bis aktiv dokumentiert.
- Verhalten unveraendert: Dokumentieren/Undo/Bearbeiten/Entfernen/Aufklappen je Eintrag exakt wie heute (dieselben Handler, keine Logik-Aenderung). Kein Element faellt ersatzlos weg; die Metriken wandern hinter einen Aufklapper.
- Keine Fachlogik in Screens: die Als-Naechstes-Auswahl liegt in `NextUp.js`.
- Keine Hex-Werte, keine Emojis, keine Gedankenstriche in Nutzertexten; jeder i18n-Schluessel in DE und EN; deutsche Kommentare; Conventional Commits.
- `npm test > /tmp/t.log 2>&1; echo $?` muss 0 sein vor jedem Commit (nie Pipes maskieren); esbuild-Syntaxcheck je geaenderter .jsx.

---

### Task 1: NextUp.js (rein) mit Tests

**Files:**
- Create: `NextUp.js`
- Create: `tests/next-up.test.mjs`

**Interfaces:**
- Consumes: die Struktur von `buildDailySchedule` (TimingEngine): `[{ slot: { id, label, time }, supplements: [{ id, logged, ... }] }, ...]` in `SLOT_ORDER`-Reihenfolge.
- Produces (fuer Task 2):
  - `findNextUp(dailySchedule) => { slot, supplements, openCount } | null` — der ERSTE Slot der Liste mit mindestens einem Eintrag mit `logged !== true`; `supplements` sind NUR die offenen Eintraege dieses Slots; `null`, wenn kein Slot offene Eintraege hat (alles dokumentiert oder leer).
  - `countOpen(dailySchedule) => number` — Summe aller offenen Eintraege.

- [ ] **Step 1: Failing test**

`tests/next-up.test.mjs`:

```js
// Tests fuer NextUp.js: Auswahl des naechsten offenen Slots.
import { countOpen, findNextUp } from '../NextUp';

let failures = 0;
function check(name, condition) {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name}`); }
}

const schedule = [
  { slot: { id: 'fasted', label: 'Nüchtern', time: '06:00–07:00' }, supplements: [] },
  { slot: { id: 'morning', label: 'Morgen', time: '07:00–09:00' }, supplements: [
    { id: 'a', logged: true }, { id: 'b', logged: false },
  ] },
  { slot: { id: 'evening', label: 'Abend', time: '19:00–21:00' }, supplements: [
    { id: 'c', logged: false }, { id: 'd', logged: false },
  ] },
];

console.log('— findNextUp —');
const next = findNextUp(schedule);
check('erster Slot mit offenem Eintrag', next.slot.id === 'morning');
check('nur offene Eintraege des Slots', next.supplements.length === 1 && next.supplements[0].id === 'b');
check('openCount des Slots', next.openCount === 1);

const allLogged = schedule.map((item) => ({
  ...item,
  supplements: item.supplements.map((s) => ({ ...s, logged: true })),
}));
check('alles dokumentiert → null', findNextUp(allLogged) === null);
check('leerer Plan → null', findNextUp([]) === null);
check('undefined → null', findNextUp(undefined) === null);
check('Eintrag ohne logged-Feld gilt als offen', findNextUp([
  { slot: { id: 'midday' }, supplements: [{ id: 'x' }] },
]).supplements[0].id === 'x');

console.log('— countOpen —');
check('zaehlt ueber alle Slots', countOpen(schedule) === 3);
check('leer → 0', countOpen([]) === 0);
check('undefined → 0', countOpen(undefined) === 0);

if (failures > 0) { console.error(`\n${failures} Test(s) fehlgeschlagen`); process.exit(1); }
console.log('\nNextUp: alle Tests bestanden');
```

- [ ] **Step 2: Fehlschlag sehen**

Run: `npm test > /tmp/t.log 2>&1; echo $?` → 1, Bundling-Fehler (Modul fehlt).

- [ ] **Step 3: Modul**

`NextUp.js`:

```js
/**
 * NextUp.js
 * "Als Naechstes" fuer den Tagesplan (Spec 2026-08-31, Entscheidung 3):
 * Der erste Slot in Tagesreihenfolge, in dem noch etwas offen ist. Rein,
 * ohne Store und UI; die Tagesreihenfolge kommt bereits sortiert aus
 * buildDailySchedule (TimingEngine).
 *
 * Bewusst KEINE Uhrzeit-Logik: Auch ein verpasster Morgen-Slot bleibt
 * "als Naechstes", bis er dokumentiert oder uebersprungen ist
 * (Medisafe-Muster: aktiv bestaetigen statt still verfallen).
 */

const openOf = (item) =>
  Array.isArray(item?.supplements)
    ? item.supplements.filter((supplement) => supplement?.logged !== true)
    : [];

export function findNextUp(dailySchedule) {
  if (!Array.isArray(dailySchedule)) return null;
  for (const item of dailySchedule) {
    const open = openOf(item);
    if (open.length > 0) {
      return { slot: item.slot, supplements: open, openCount: open.length };
    }
  }
  return null;
}

export function countOpen(dailySchedule) {
  if (!Array.isArray(dailySchedule)) return 0;
  return dailySchedule.reduce((sum, item) => sum + openOf(item).length, 0);
}
```

- [ ] **Step 4: Tests gruen, Commit**

Run: `npm test > /tmp/t.log 2>&1; echo $?` → 0.

```bash
git add NextUp.js tests/next-up.test.mjs
git commit -m "feat(dashboard): NextUp-Auswahl des naechsten offenen Slots"
```

---

### Task 2: Dashboard als Arbeitsfluss umordnen

**Files:**
- Modify: `app/(tabs)/(today)/Dashboard.jsx`
- Modify: `i18n/de/dashboard.js`, `i18n/en/dashboard.js`
- Modify: `CLAUDE.md` (ein Satz im Architektur-Teil: Dashboard folgt dem Arbeitsfluss Als-Naechstes → Zusammenfassung → Rest)

**Interfaces:**
- Consumes: `findNextUp`, `countOpen` (Task 1); alle bestehenden Handler und Stores des Screens (unveraendert).

- [ ] **Step 1: i18n-Schluessel**

DE (`i18n/de/dashboard.js`, bei den anderen dashboard-Schluesseln einsortieren):

```js
  // Arbeitsfluss-Kopf (NextUp.js): erst handeln, dann Zahlen.
  'dashboard.nextUp.title': 'Als Nächstes',
  'dashboard.nextUp.slot': '{label} ({time})',
  'dashboard.nextUp.remaining': 'Danach heute noch {count} offen.',
  'dashboard.nextUp.allDone': 'Für heute ist alles dokumentiert.',
  'dashboard.nextUp.nothingPlanned': 'Heute ist nichts geplant.',
  'dashboard.summaryLine': '{done} von {total} dokumentiert',
  'dashboard.summaryDetailsShow': 'Details anzeigen',
  'dashboard.summaryDetailsHide': 'Details ausblenden',
```

EN (`i18n/en/dashboard.js`), gleiche Schluessel:

```js
  'dashboard.nextUp.title': 'Up next',
  'dashboard.nextUp.slot': '{label} ({time})',
  'dashboard.nextUp.remaining': 'After this, {count} still open today.',
  'dashboard.nextUp.allDone': 'Everything is documented for today.',
  'dashboard.nextUp.nothingPlanned': 'Nothing is scheduled today.',
  'dashboard.summaryLine': '{done} of {total} documented',
  'dashboard.summaryDetailsShow': 'Show details',
  'dashboard.summaryDetailsHide': 'Hide details',
```

- [ ] **Step 2: Eintrags-Zeile herausziehen**

In `Dashboard.jsx` rendert die Slot-Schleife je Eintrag einen Block (`styles.supplementCard`: Name, Status-Pille, Meta-Zeile, `SlotReason`, Bestand, Timing-Pille, Aufklappen, Aktionen Dokumentieren/Undo/Bearbeiten/Entfernen; ab etwa Zeile 423). Ziehe diesen Block UNVERAENDERT in eine Funktion innerhalb der Datei:

```jsx
// Eine Eintrags-Zeile der Routine, unveraendert aus der Slot-Schleife
// gezogen, damit die Als-Naechstes-Karte und die Slot-Karten dieselbe
// Darstellung und dieselben Handler nutzen (kein zweiter Anzeigepfad).
function renderSupplementRow(supplement) { /* bisheriger Block, 1:1 */ }
```

Alle im Block verwendeten Variablen/Handler (activeSupplements, getStock, expandedNoteIds, toggleNoteExpanded, guidanceBySupplementId, router, t, Log-/Undo-/Archiv-Handler) bleiben im Komponenten-Scope; `renderSupplementRow` wird deshalb INNERHALB der Dashboard-Komponente definiert (Closure), nicht exportiert. Danach ruft die Slot-Schleife `item.supplements.map(renderSupplementRow)` auf. Verhalten identisch; das ist ein reiner Extract.

- [ ] **Step 3: Als-Naechstes-Karte einbauen**

Nach der Begruessung (und nach den situativen Karten restoredCard/cleanupCard, die dort bleiben) kommt als ERSTE Routine-Flaeche:

```jsx
      {/* Arbeitsfluss statt Kennzahlen-Wand (Spec Entscheidung 3): die
          erste Flaeche beantwortet "Was nehme ich als Naechstes?". */}
      {fullInventoryCount > 0 ? (
        nextUp ? (
          <View style={styles.nextUpCard}>
            <Text style={styles.nextUpKicker}>{t('dashboard.nextUp.title')}</Text>
            <Text style={styles.nextUpSlot}>
              {t('dashboard.nextUp.slot', { label: nextUp.slot.label, time: nextUp.slot.time })}
            </Text>
            {nextUp.supplements.map(renderSupplementRow)}
            {openTotal > nextUp.openCount ? (
              <Text style={styles.nextUpRemaining}>
                {t('dashboard.nextUp.remaining', { count: openTotal - nextUp.openCount })}
              </Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.nextUpCardDone}>
            <Feather name="check-circle" size={18} color={colors.affirm} />
            <Text style={styles.nextUpDoneText}>
              {t(scheduledToday > 0 ? 'dashboard.nextUp.allDone' : 'dashboard.nextUp.nothingPlanned')}
            </Text>
          </View>
        )
      ) : null}
```

mit `const nextUp = findNextUp(dailySchedule);` und `const openTotal = countOpen(dailySchedule);` bei den anderen abgeleiteten Werten. `Feather` importieren, falls noch nicht importiert. Styles:

```js
  nextUpCard: { ...surfaces.card, padding: space.lg, borderWidth: 2, borderColor: colors.accentSoft, marginBottom: space.lg },
  nextUpKicker: { ...type.eyebrow, color: colors.accent },
  nextUpSlot: { ...type.subheading, marginTop: 2, marginBottom: space.sm },
  nextUpRemaining: { ...type.small, marginTop: space.sm },
  nextUpCardDone: { ...surfaces.card, padding: space.lg, marginBottom: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  nextUpDoneText: { ...type.bodyStrong, color: colors.affirm },
```

- [ ] **Step 4: Kennzahlen auf eine Zeile mit Aufklapper**

Die Bloecke `summaryCard` (Fortschritt, Prozent, Balken, Insight, lastActivity) und `metricGrid` (vier `MetricCard`) verschwinden aus dem Immer-Sichtbaren. Stattdessen direkt unter der Als-Naechstes-Karte EINE Zeile:

```jsx
      {fullInventoryCount > 0 && scheduledToday > 0 ? (
        <View style={styles.summaryLineWrap}>
          <Text style={styles.summaryLineText}>
            {t('dashboard.summaryLine', { done: progress.done, total: progress.total })}
          </Text>
          <TouchableOpacity
            onPress={() => setSummaryOpen((value) => !value)}
            accessibilityRole="button"
            accessibilityState={{ expanded: summaryOpen }}
            style={styles.summaryToggle}
          >
            <Text style={styles.summaryToggleText}>
              {t(summaryOpen ? 'dashboard.summaryDetailsHide' : 'dashboard.summaryDetailsShow')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {summaryOpen ? (
        <>{/* hierher wandern die bisherigen Bloecke summaryCard und metricGrid, unveraendert */}</>
      ) : null}
```

mit `const [summaryOpen, setSummaryOpen] = useState(false);`. Styles: `summaryLineWrap` (Row, space-between, alignItems center, marginBottom space.md), `summaryLineText` (`...type.body, color: colors.ink`), `summaryToggle` (`minHeight: 44, justifyContent: 'center'` — Bedienregel), `summaryToggleText` (`...type.small, color: colors.accent`). Die Insight-Logik (`getRoutineInsight`) bleibt im aufgeklappten Teil erhalten; nichts wird geloescht.

- [ ] **Step 5: Reihenfolge des Restes**

Neue Reihenfolge im ScrollView (nur UMORDNEN, keine Bloecke aendern): Begruessung → restoredCard → cleanupCard → FirstStepsCard/leere Zustaende → Als-Naechstes (Step 3) → Zusammenfassungszeile (+ Aufklapper, Step 4) → SectionHeading Routine → Kur-Pause-Karte → Slot-Karten (`visibleSchedule.map(...)`, ABER ohne den Als-Naechstes-Slot: `visibleSchedule.filter((item) => item.slot.id !== nextUp?.slot.id)`) → Bestand-Karte (`inventoryCard`, wandert von oben hierher) → Pruefhinweise-Section → Disclaimer. Kommentar an der Stelle, warum der Als-Naechstes-Slot unten nicht doppelt erscheint.

- [ ] **Step 6: Syntax, Tests, Commit**

Run: `npx esbuild "app/(tabs)/(today)/Dashboard.jsx" --loader:.jsx=jsx --log-level=error --outfile=/dev/null && npm test > /tmp/t.log 2>&1; echo $?` → 0.

```bash
git add "app/(tabs)/(today)/Dashboard.jsx" i18n/de/dashboard.js i18n/en/dashboard.js CLAUDE.md
git commit -m "feat(dashboard): Arbeitsfluss Als-Naechstes zuerst, Kennzahlen hinter einer Zeile"
```

---

## Self-Review

- Spec Entscheidung 3 vollstaendig: Als-Naechstes-Karte mit aktiven Bestaetigen-Handlern (Task 2 Step 3, via renderSupplementRow mit denselben Handlern), Metrik-Raster → eine Zeile + Aufklapper (Step 4), SlotReason bleibt je Eintrag (im extrahierten Block enthalten).
- Kein Placeholder: der "bisherige Block" ist im Repo eindeutig lokalisiert (styles.supplementCard-Schleife); der Plan verlangt 1:1-Extract, nicht Neuschreiben.
- Typen: `findNextUp`/`countOpen` Signaturen in Task 1 und 2 identisch; `nextUp.slot.label/time` entspricht der buildDailySchedule-Struktur (getSlot liefert label/time).
- Abgrenzung: Referenzwert-Balken (Spec Entscheidung 4) und Tab-Umbau (Phase 2) bewusst nicht enthalten.
