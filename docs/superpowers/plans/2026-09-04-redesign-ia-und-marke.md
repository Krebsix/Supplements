# Redesign: Onboarding, Informationsarchitektur, Marke — Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Onboarding von zehn auf zwei Screens verdichten, Bestand/Archiv,
Scan-Pruefung und Verlauf klarer schneiden, und die App-Akzentfarbe von
Petrol auf Azur/Navy umstellen, damit sie zum App-Icon und zur Website
passt.

**Architecture:** Ausschliesslich Aenderungen an bestehenden Screens/
Komponenten und `theme.js`-Tokens. Keine neue Navigationsebene (Tab-Bar
bleibt bei fuenf Tabs), keine neue Datenbank-/Store-Struktur. Zwei kleine,
neue reine Funktionen (Kontrast-Test, Einnahme-Treue-Kennzahl) ergaenzen
bestehende Fachmodule.

**Tech Stack:** Expo Router, React Native (StyleSheet + `theme.js`-
Tokens), zustand, Node-Tests unter `tests/*.test.mjs` (`npm test`).

**Spec:** `docs/superpowers/specs/2026-09-04-redesign-ia-und-marke.md`

## Global Constraints

- Keine Hex-Werte in Screens/Komponenten, nur `theme.js`-Tokens.
- Kontrast mindestens 4,5:1 fuer Fliesstext, 3:1 fuer grosse Schrift
  (WCAG AA) — bei JEDEM neuen Farbwert nachrechnen, nicht schaetzen.
- Tippflaechen mindestens 44×44 pt.
- Keine Gedankenstriche in Nutzertexten (Komma/Doppelpunkt/Punkt statt
  "—"), deutsche Umlaute immer direkt (ä/ö/ü), nie ae/oe/ue.
- Archivieren statt Loeschen bleibt das einzige Entfernen-Muster.
- Fachlogik gehoert in die bestehenden Module (`OutcomeTracker.js` etc.),
  nie in Screens.
- Tab-Bar bleibt bei fuenf Tabs (Heute · Bestand/Praeparate · Hinzufuegen
  · Wissen · Mehr) — keine Regression zur Bedienkonzept-Spec 2026-08-31.
- Nach jeder Aufgabe mit sichtbarer UI-Aenderung: `npm start -- --web`
  (oder bestehender Dev-Server auf Port 8099) und den betroffenen Screen
  im Browser ansehen, bevor die Aufgabe als erledigt gilt — es gibt in
  diesem Repo keine Component-/Snapshot-Tests, `npm test` deckt nur
  Fachlogik ab.

---

### Task 1: Farbtoken Azur/Navy statt Petrol, mit Kontrast-Test

**Files:**
- Modify: `theme.js` (`colors`, `onDark`)
- Create: `tests/color-contrast.test.mjs`

**Interfaces:**
- Produces: `colors.accent = '#1a63c4'`, `colors.accentInk = '#0b2239'`,
  `colors.accentSoft` neu abgeleitet (heller Azur-Tint). `onDark.accent`
  bleibt eine helle Aufhellung von Azur (analog zur bisherigen
  Petrol-Aufhellung), `onDark.rule` eine gedaempfte Azur/Navy-Linie.

**Hintergrund:** Nachgerechnet (Node, WCAG-Formel): `#1e6fd9` (Website-
Azur unveraendert) erreicht auf `canvas` (`#f2f2f7`) nur 4.35:1 — unter
der eigenen 4,5:1-Regel fuer Fliesstext. `#1a63c4` (dieselbe Azur-Familie,
eine Stufe dunkler) erreicht 5.19:1 auf canvas und 5.79:1 auf Weiss,
vergleichbarer Puffer wie das bisherige Petrol (6.73:1 auf Weiss).

- [ ] **Step 1: Kontrast-Test schreiben (schlaegt zuerst fehl, alte Werte)**

```javascript
// tests/color-contrast.test.mjs
// Rechnerischer Kontrast-Check (WCAG 2.1, relative Luminanz) fuer die
// Markenfarben aus theme.js. Verhindert, dass eine kuenftige Farbaenderung
// unter die Bedienregeln-Grenze rutscht, ohne dass es jemand bemerkt.
import { colors } from '../theme';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}

function toLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastRatio(hexA, hexB) {
  const lumA = luminance(hexA);
  const lumB = luminance(hexB);
  const [lighter, darker] = lumA > lumB ? [lumA, lumB] : [lumB, lumA];
  return (lighter + 0.05) / (darker + 0.05);
}

console.log('— Markenfarbe Kontrast (WCAG AA) —');
check(
  'Akzent auf canvas mindestens 4.5:1 (Fliesstext)',
  contrastRatio(colors.accent, colors.canvas) >= 4.5,
  `war ${contrastRatio(colors.accent, colors.canvas).toFixed(2)}:1`
);
check(
  'Akzent auf surface (Weiss) mindestens 4.5:1',
  contrastRatio(colors.accent, colors.surface) >= 4.5,
  `war ${contrastRatio(colors.accent, colors.surface).toFixed(2)}:1`
);
check(
  'accentInk auf surface mindestens 4.5:1 (dunkler Ton als Text)',
  contrastRatio(colors.accentInk, colors.surface) >= 4.5,
  `war ${contrastRatio(colors.accentInk, colors.surface).toFixed(2)}:1`
);

if (failures > 0) {
  console.error(`\n${failures} Fehler`);
  process.exit(1);
}
console.log('\nAlle Kontrast-Tests bestanden.');
```

- [ ] **Step 2: Test laufen lassen, muss mit den ALTEN Petrol-Werten schon bestehen**

Run: `node --experimental-vm-modules tests/color-contrast.test.mjs` (oder
ueber den bestehenden `npm test`-Bundler, falls der Import-ohne-Endung-
Stil das verlangt — siehe `tests/run.mjs`).
Erwartet: PASS (Petrol war bereits kontrastreich, das bestaetigt nur,
dass der Test selbst richtig rechnet).

- [ ] **Step 3: Farbwerte in `theme.js` aendern**

```javascript
// theme.js, im colors-Block ersetzen:

  // Akzent: Azur, dieselbe Familie wie App-Icon und Website
  // (mysuplea.com, web/src/styles/tokens.css). Eine Stufe dunkler als
  // das Website-Azur (#1e6fd9), weil #1e6fd9 auf dem App-Bildschirmgrund
  // (canvas) nur 4.35:1 erreicht, unter der eigenen 4,5:1-Regel.
  accent: '#1a63c4',
  accentSoft: '#e6eefa',
  accentInk: '#0b2239',
```

```javascript
// theme.js, onDark-Block: Aufhellungen von Azur/Navy statt Petrol,
// gleiches Vorgehen wie beim Petrol-Refresh vom 2026-08-31 (abgeleitete
// Toene, keine dritte Palette).
export const onDark = {
  ink: '#ffffff',
  inkMuted: '#a9c4e8',
  accent: '#8fbdf0',
  rule: '#1e4a7a',
  checkInk: colors.accentInk,
};
```

- [ ] **Step 4: Kontrast-Test erneut laufen lassen, muss mit den NEUEN Werten bestehen**

Run: gleicher Befehl wie Step 2.
Erwartet: PASS.

- [ ] **Step 5: Palette-Guard-Hook pruefen**

Run: `npm run check:assets` (falls vorhanden) und den Pre-commit-Hook
(`git commit --dry-run` oder einfach den Commit in Step 7 versuchen) —
der Anti-Palette-Hex-Guard darf die neuen Werte nicht blockieren, da sie
nur in `theme.js` selbst stehen, nicht in Screens.

- [ ] **Step 6: Visuell verifizieren**

Dev-Server starten (`npx expo start --web --port 8099`), `/Dashboard`
und `/paywall` im Browser ansehen: Akzentfarbe ist jetzt Azur, Tagesplan-
Buehne (dunkler Ton) ist Navy statt Petrol. Texte bleiben lesbar.

- [ ] **Step 7: Commit**

```bash
git add theme.js tests/color-contrast.test.mjs
git commit -m "feat(theme): Akzentfarbe von Petrol zu Azur/Navy, Kontrast-Test ergaenzt"
```

---

### Task 2: Einnahme-Treue-Kennzahl fuer den Verlauf

**Files:**
- Modify: `OutcomeTracker.js`
- Test: `tests/outcome-tracker.test.mjs` (bestehende Datei ergaenzen,
  Name pruefen — falls anders benannt, dort ergaenzen)

**Interfaces:**
- Consumes: `intakeLogs` (Store-Array, Eintraege mit `dateKey`,
  `undoneAt`).
- Produces: `calculateOverallAdherence(intakeLogs, periodDays, now)` →
  `{ loggedDays: number, periodDays: number, percent: number }`. Anders
  als `calculateAdherence(trial, ...)` haengt diese Funktion an KEINEM
  Trial, sie zaehlt ueber ALLE Praeparate hinweg, an wie vielen Tagen im
  Zeitraum mindestens ein Log existiert — die Groesse, die der Verlauf-
  Screen (Task 3) als "Einnahme-Treue" zeigt.

- [ ] **Step 1: Failing test schreiben**

```javascript
// Ergaenzung in tests/outcome-tracker.test.mjs (an bestehende Imports/
// check()-Helfer anhaengen, NICHT die Datei neu anlegen):
import { calculateOverallAdherence } from '../OutcomeTracker';

console.log('— Gesamt-Einnahme-Treue (Verlauf-Kennzahl) —');
const NOW = new Date('2026-09-04T12:00:00Z');
const logs = [
  { dateKey: '2026-09-04', undoneAt: null },
  { dateKey: '2026-09-03', undoneAt: null },
  { dateKey: '2026-09-03', undoneAt: null }, // zweiter Log gleicher Tag zaehlt nur einmal
  { dateKey: '2026-09-01', undoneAt: null },
  { dateKey: '2026-08-30', undoneAt: '2026-08-30T10:00:00Z' }, // rueckgaengig gemacht, zaehlt nicht
];
const result = calculateOverallAdherence(logs, 7, NOW);
check('drei distincte Tage mit Log in 7 Tagen', result.loggedDays === 3, `war ${result.loggedDays}`);
check('periodDays wird durchgereicht', result.periodDays === 7);
check('percent gerundet', result.percent === Math.round((3 / 7) * 100), `war ${result.percent}`);
check('leere Logs ergeben 0 Prozent, kein NaN', calculateOverallAdherence([], 7, NOW).percent === 0);
check('periodDays 0 wirft nicht, ergibt 0', calculateOverallAdherence(logs, 0, NOW).percent === 0);
```

- [ ] **Step 2: Test laufen lassen, muss fehlschlagen (Funktion existiert nicht)**

Run: `npm test`
Expected: FAIL mit "calculateOverallAdherence is not a function" o.ae.

- [ ] **Step 3: Funktion implementieren**

```javascript
// OutcomeTracker.js, nach calculateAdherence() ergaenzen:

/**
 * calculateOverallAdherence(intakeLogs, periodDays, now)
 *
 * Anteil der Tage der letzten `periodDays` Tage (inklusive heute), an
 * denen mindestens eine Einnahme dokumentiert wurde — ueber ALLE
 * Praeparate, nicht an einen einzelnen Trial gebunden. Speist die
 * Einnahme-Treue-Kennzahl im Verlauf-Screen. Rueckgaengig gemachte Logs
 * (undoneAt gesetzt) zaehlen nicht.
 */
export function calculateOverallAdherence(intakeLogs = [], periodDays, now = new Date()) {
  if (!periodDays || periodDays <= 0) {
    return { loggedDays: 0, periodDays: 0, percent: 0 };
  }

  const nowKey = toDateKey(now);
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - (periodDays - 1));
  const startKey = toDateKey(startDate);

  const loggedDays = new Set(
    intakeLogs
      .filter((log) => !log?.undoneAt && log?.dateKey && log.dateKey >= startKey && log.dateKey <= nowKey)
      .map((log) => log.dateKey)
  );

  return {
    loggedDays: loggedDays.size,
    periodDays,
    percent: Math.round((loggedDays.size / periodDays) * 100),
  };
}
```

`toDateKey` existiert in `OutcomeTracker.js` bereits (von
`calculateAdherence`/`daysBetween` genutzt) — falls sie privat/nicht
exportiert ist, hier dieselbe lokale Funktion verwenden, nicht
duplizieren.

- [ ] **Step 4: Test laufen lassen, muss bestehen**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add OutcomeTracker.js tests/outcome-tracker.test.mjs
git commit -m "feat(outcome): Gesamt-Einnahme-Treue ueber Zeitraum berechnen"
```

---

### Task 3: Verlauf-Screen — Zeitraum-Chips, Einnahme-Treue, Wochenbalken

**Files:**
- Modify: `app/(tabs)/(today)/history.jsx`

**Interfaces:**
- Consumes: `calculateOverallAdherence` (Task 2), bestehende
  `groupLogsByDate(logs)` und `toDateKey(date)` aus derselben Datei.
- Produces: keine neuen Exporte, nur UI.

- [ ] **Step 1: Zeitraum-State und Chips ergaenzen**

Am Anfang von `HistoryScreen()`:

```javascript
const PERIODS = { week: 7, month: 30, all: null };
const [period, setPeriod] = useState('week');
```

Direkt unter dem bestehenden Titel-Block, vor der Log-Liste:

```jsx
<View style={styles.periodRow}>
  {Object.keys(PERIODS).map((key) => (
    <Pressable
      key={key}
      onPress={() => setPeriod(key)}
      style={[styles.periodChip, period === key && styles.periodChipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: period === key }}
    >
      <Text style={[styles.periodChipText, period === key && styles.periodChipTextActive]}>
        {t(`history.period.${key}`)}
      </Text>
    </Pressable>
  ))}
</View>
```

Neue i18n-Schluessel `history.period.week/month/all` in `i18n/de/` und
`i18n/en/` ergaenzen (Woche/Monat/Alles bzw. Week/Month/All), am
bestehenden `history.*`-Namespace orientieren.

- [ ] **Step 2: Einnahme-Treue-Kennzahl + Wochenbalken rendern**

```javascript
const periodDays = PERIODS[period] ?? daysSinceFirstLog(intakeLogs); // "Alles": ab erstem Log
const adherence = calculateOverallAdherence(intakeLogs, periodDays || 1, new Date());

const last7Days = React.useMemo(() => {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    const count = intakeLogs.filter((log) => log.dateKey === key && !log.undoneAt).length;
    days.push({ key, count, isToday: i === 0 });
  }
  return days;
}, [intakeLogs]);
```

`daysSinceFirstLog` ist eine kleine lokale Hilfsfunktion in
`history.jsx` (kein neues Fachmodul, reine Praesentations-Ableitung wie
das bestehende `groupLogsByDate`):

```javascript
function daysSinceFirstLog(logs) {
  if (!logs.length) return 1;
  const firstKey = logs.reduce((min, log) => (log.dateKey < min ? log.dateKey : min), logs[0].dateKey);
  const first = new Date(firstKey);
  const diff = Math.floor((Date.now() - first.getTime()) / 86400000) + 1;
  return Math.max(1, diff);
}
```

JSX fuer die Kennzahl-Karte (nach den Zeitraum-Chips, vor der bestehenden
Ereignisliste):

```jsx
<View style={styles.adherenceCard}>
  <Text style={styles.adherenceLabel}>{t('history.adherence.label')}</Text>
  <Text style={styles.adherenceValue}>{t('history.adherence.percent', { percent: adherence.percent })}</Text>
  <View style={styles.barsRow}>
    {last7Days.map((day) => (
      <View key={day.key} style={styles.barColumn}>
        <View
          style={[
            styles.bar,
            { height: Math.max(4, Math.min(64, day.count * 20)) },
            day.isToday ? styles.barToday : day.count === 0 ? styles.barEmpty : null,
          ]}
        />
      </View>
    ))}
  </View>
</View>
```

Styles (`accent`/`accentSoft`/`rule` aus `theme.js`, keine Hex-Werte):

```javascript
adherenceCard: { ...surfaces.card, marginBottom: space.lg },
adherenceLabel: { ...type.small, marginBottom: space.xs },
adherenceValue: { ...type.display, marginBottom: space.md },
barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 64 },
barColumn: { flex: 1, alignItems: 'center' },
bar: { width: 10, borderRadius: radius.sm, backgroundColor: colors.accentSoft },
barToday: { backgroundColor: colors.accent },
barEmpty: { backgroundColor: colors.rule },
```

Neue i18n-Schluessel `history.adherence.label` ("Einnahme-Treue") und
`history.adherence.percent` ("{{percent}} %") ergaenzen.

- [ ] **Step 3: Visuell verifizieren**

Dev-Server, `/history` (oder wo immer die Route innerhalb `(today)`
liegt) ansehen: Chips wechseln den Zeitraum, Prozentzahl aendert sich
plausibel, sieben Balken zeigen die letzten 7 Tage unabhaengig vom
gewaehlten Zeitraum (das Balkendiagramm ist immer die letzte Woche,
laut Mockup-Vorbild).

- [ ] **Step 4: Commit**

```bash
git add "app/(tabs)/(today)/history.jsx" i18n/de i18n/en
git commit -m "feat(history): Zeitraum-Chips und Einnahme-Treue-Kennzahl"
```

---

### Task 4: Verlauf-Einstieg auf dem Heute-Screen

**Files:**
- Modify: `app/(tabs)/(today)/Dashboard.jsx`

**Interfaces:**
- Consumes: `router` (expo-router), keine neue Fachlogik.

- [ ] **Step 1: Karte/Link zum Verlauf ergaenzen**

In der bestehenden `curatedCards`-Sektion (nach dem letzten kuratierten
Card-Render, vor dem Bestand-Block) eine feste, immer sichtbare Zeile
ergaenzen (kein kuratiertes Card-Objekt, da sie nicht von Auffaelligkeit
abhaengt):

```jsx
<Pressable
  onPress={() => router.push('/history')}
  style={styles.historyLink}
  accessibilityRole="link"
>
  <Feather name="bar-chart-2" size={18} color={colors.accent} />
  <Text style={styles.historyLinkText}>{t('dashboard.historyLink')}</Text>
  <Feather name="chevron-right" size={18} color={colors.inkFaint} />
</Pressable>
```

Route pruefen: falls `history.jsx` unter einer anderen Pfad-Struktur
liegt als `/history` (z.B. `(today)/history` mit eigenem Segment), den
tatsaechlichen `useRouter().push()`-Pfad aus einer bestehenden
Verlinkung auf diesen Screen uebernehmen statt zu raten.

Style, minHeight 44 pt (Bedienregeln):

```javascript
historyLink: {
  flexDirection: 'row', alignItems: 'center', gap: space.sm,
  minHeight: 44, paddingVertical: space.sm, marginBottom: space.md,
},
historyLinkText: { ...type.body, flex: 1, color: colors.accent },
```

Neuer i18n-Schluessel `dashboard.historyLink` ("Verlauf ansehen" /
"View history").

- [ ] **Step 2: Visuell verifizieren**

`/Dashboard` ansehen, Tap auf die neue Zeile fuehrt zu `/history`.

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/(today)/Dashboard.jsx" i18n/de i18n/en
git commit -m "feat(dashboard): Verlauf-Einstieg statt sechstem Tab"
```

---

### Task 5: Praeparate — Aktiv/Archiv-Filterchips statt Dauer-Abschnitt

**Files:**
- Modify: `app/(tabs)/(inventory)/inventory.jsx`

**Interfaces:**
- Consumes: bestehende `active`/`archived`-Arrays aus dem vorhandenen
  `useMemo` (keine Aenderung an der Datenberechnung noetig, nur an der
  Darstellung).

- [ ] **Step 1: Filter-State ergaenzen**

```javascript
const [filter, setFilter] = useState('active'); // 'active' | 'archived'
```

- [ ] **Step 2: Chips rendern, direkt unter dem Titel-Block**

```jsx
<View style={styles.filterRow}>
  <Pressable
    onPress={() => setFilter('active')}
    style={[styles.filterChip, filter === 'active' && styles.filterChipActive]}
    accessibilityRole="button"
    accessibilityState={{ selected: filter === 'active' }}
  >
    <Text style={[styles.filterChipText, filter === 'active' && styles.filterChipTextActive]}>
      {t('inventory.filter.active', { count: active.length })}
    </Text>
  </Pressable>
  <Pressable
    onPress={() => setFilter('archived')}
    style={[styles.filterChip, filter === 'archived' && styles.filterChipActive]}
    accessibilityRole="button"
    accessibilityState={{ selected: filter === 'archived' }}
  >
    <Text style={[styles.filterChipText, filter === 'archived' && styles.filterChipTextActive]}>
      {t('inventory.filter.archived', { count: archived.length })}
    </Text>
  </Pressable>
</View>
```

- [ ] **Step 3: Bestehende Render-Bloecke hinter den Filter haengen**

`{active.map(...)}`-Block: umschliessen mit `{filter === 'active' ? (
<>...</> ) : null}`. Den bestehenden Archiv-Abschnitt (`{archived.length
> 0 ? (...) : null}`, inklusive `sectionTitle`-Ueberschrift, die jetzt
redundant zum Chip ist) durch dieselbe `archived.map(...)`-Liste
ersetzen, aber im selben Kartenlayout wie die aktiven Eintraege
(`styles.card` statt `styles.archivedRow`), damit die zwei Modi sich
nur durch den Inhalt unterscheiden, nicht durch ein anderes Zeilen-
Layout. "Wiederherstellen"-Aktion (`updateUserSupplement(id, { status:
'active' })`) bleibt erhalten.

- [ ] **Step 4: Neue i18n-Schluessel**

`inventory.filter.active` ("Aktiv · {{count}}"), `inventory.filter.
archived` ("Archiv · {{count}}") in `i18n/de/` und `i18n/en/` ergaenzen,
alten `inventory.archivedSection`-Schluessel nur entfernen, wenn nirgends
sonst referenziert (pruefen mit Grep).

- [ ] **Step 5: Visuell verifizieren**

`/inventory` ansehen: Umschalten zwischen "Aktiv" und "Archiv" zeigt
disjunkte Listen, Wiederherstellen aus dem Archiv-Filter funktioniert,
Suchfeld (falls >4 Eintraege) filtert innerhalb des aktiven Modus weiter.

- [ ] **Step 6: Commit**

```bash
git add "app/(tabs)/(inventory)/inventory.jsx" i18n/de i18n/en
git commit -m "feat(inventory): Aktiv/Archiv als Filterchips statt Dauer-Abschnitt"
```

---

### Task 6: Mehr — Inline-Werte bei Erinnerungen und Sprache

**Files:**
- Modify: `app/(tabs)/(more)/menu.jsx`

**Interfaces:**
- Consumes: `useNotificationStore((s) => s.notificationsEnabled)`,
  aktive Sprache aus `useTranslation()` (`language`), analog zu Task 1
  im "Ist-Zustand" — exakte Store-Selektoren vor dem Schreiben im echten
  `menu.jsx` gegenpruefen, falls sie anders heissen als in Dashboard.jsx.

- [ ] **Step 1: Wert-Zeile fuer bestehende Buttons ergaenzen**

Die Buttons "Erinnerungen" und "Sprache" (bzw. wo immer Sprachumschaltung
aktuell sitzt) bekommen eine zweite `Text`-Zeile mit dem aktuellen Wert,
analog zum Mockup ("Sprache — Deutsch" in Akzentfarbe):

```jsx
<Text style={styles.menuRowValue}>
  {notificationsEnabled ? t('common.on') : t('common.off')}
</Text>
```

bzw. fuer Sprache:

```jsx
<Text style={styles.menuRowValue}>
  {language === 'de' ? 'Deutsch' : 'English'}
</Text>
```

`common.on`/`common.off` ergaenzen falls noch nicht vorhanden (kurzer
Grep vorher).

- [ ] **Step 2: Style ergaenzen**

```javascript
menuRowValue: { ...type.small, color: colors.accent },
```

- [ ] **Step 3: Visuell verifizieren**

`/menu` (Mehr-Tab) ansehen: Werte erscheinen neben den Zeilen, aendern
sich nach Umschalten korrekt.

- [ ] **Step 4: Commit**

```bash
git add "app/(tabs)/(more)/menu.jsx" i18n/de i18n/en
git commit -m "feat(menu): aktuelle Werte inline bei Erinnerungen und Sprache"
```

---

### Task 7: Scan-Pruefung — Feld-Status sicher/unsicher

**Files:**
- Modify: `app/(tabs)/(scan)/results.jsx`

**Interfaces:**
- Consumes: bestehende Scan-Ergebnis-Struktur (Feldname, erkannter Wert,
  Unsicherheits-Flag) — vor dem Schreiben den tatsaechlichen Shape aus
  `ScanAnalyzer.js`/der Edge-Function-Antwort im Screen selbst
  nachlesen, dieser Plan nimmt an, dass pro Feld ein `confidence`- oder
  `uncertain`-Flag bereits vorhanden ist (Pruef-Schleusen-Prinzip
  existiert laut CLAUDE.md schon); falls nicht, ist das ein Vorab-
  Rechercheschritt fuer den Ausfuehrenden, kein neuer Fachlogik-Task.

- [ ] **Step 1: Ist-Zustand pruefen**

`results.jsx` lesen: wie werden aktuell unsichere Felder markiert? Falls
bereits ein Icon/Farbzustand existiert, geht es in diesem Task nur um
Vereinheitlichung auf das Mockup-Muster (Haekchen bei sicher, Rand +
Stift-Icon bei unsicher). Falls es noch keine visuelle Unterscheidung
gibt, hier ergaenzen.

- [ ] **Step 2: Feld-Zeilen-Komponente anpassen/ergaenzen**

```jsx
function ScanFieldRow({ label, value, uncertain, onEdit }) {
  return (
    <View style={[styles.fieldRow, uncertain && styles.fieldRowUncertain]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {uncertain ? (
        <Pressable onPress={onEdit} style={styles.fieldValueRow} accessibilityRole="button">
          <Text style={styles.fieldValueUncertain}>{value ?? '?'}</Text>
          <Feather name="edit-2" size={14} color={colors.accent} />
        </Pressable>
      ) : (
        <View style={styles.fieldValueRow}>
          <Text style={styles.fieldValue}>{value}</Text>
          <Feather name="check-circle" size={16} color={colors.accent} />
        </View>
      )}
    </View>
  );
}
```

```javascript
fieldRow: { ...surfaces.card, marginBottom: space.sm },
fieldRowUncertain: { borderWidth: 1, borderColor: colors.accent },
fieldValueRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
fieldValueUncertain: { ...type.bodyStrong, color: colors.accent },
fieldValue: { ...type.bodyStrong },
```

- [ ] **Step 3: Footer-Buttons pruefen/angleichen**

Falls noch nicht vorhanden: zwei Buttons "Verwerfen" (neutral,
`surfaces.buttonQuiet`) und "Bestaetigen & uebernehmen" (`surfaces.
buttonPrimary`), "Bestaetigen" bleibt deaktiviert oder zeigt einen
Hinweis, solange mindestens ein Pflichtfeld unsicher UND nicht editiert
ist — exakte Sperr-Bedingung im bestehenden Screen-State nachvollziehen,
nicht neu erfinden.

- [ ] **Step 4: Visuell verifizieren**

Einen Scan durchlaufen (oder Mock-Scan-Pfad nutzen, falls vorhanden) und
pruefen, dass sichere/unsichere Felder sich klar unterscheiden und der
Editier-Tap funktioniert.

- [ ] **Step 5: Commit**

```bash
git add "app/(tabs)/(scan)/results.jsx"
git commit -m "feat(scan): Feld-Status sicher/unsicher vereinheitlicht"
```

---

### Task 8: OnboardingSteps.js — zwei Schritte statt zehn (TDD)

**Files:**
- Modify: `OnboardingSteps.js`
- Modify: `tests/onboarding-steps.test.mjs`

**Interfaces:**
- Produces: `STEP_IDS.START`, `STEP_IDS.ROUTINE` (ersetzen WELCOME,
  LEGAL, NAME, GENDER, BIRTH_YEAR, EXTRA, ROUTINE_TIMES, ROUTINE_FIRST,
  ACCOUNT, DONE). `buildSteps()` gibt `[START, ROUTINE]` zurueck (immer
  genau zwei, kein bedingter Schritt mehr — die Zusatzfrage lebt jetzt
  INNERHALB von START, bedingt gerendert, nicht als eigener Listen-
  Eintrag). `canAdvance('start', answers, resolved)` fasst die
  bisherigen Bedingungen von GENDER + BIRTH_YEAR + EXTRA zusammen,
  `canAdvance('routine', answers, resolved)` die von ROUTINE_FIRST.

- [ ] **Step 1: Bestehende Tests lesen und verstehen, was bricht**

`tests/onboarding-steps.test.mjs` pruefen: alle Assertions, die sich auf
einzelne alte STEP_IDS beziehen (`gender`, `birthYear`, `extra`), muessen
auf die neuen zusammengefassten Bedingungen umgeschrieben werden.

- [ ] **Step 2: Neue/angepasste Tests schreiben**

```javascript
// tests/onboarding-steps.test.mjs — Ersetzt die alten STEP_IDS-basierten
// Einzelchecks durch Checks gegen die zwei gebuendelten Schritte.
import { STEP_IDS, buildSteps, canAdvance } from '../OnboardingSteps';

console.log('— Schrittliste: immer genau zwei —');
check('zwei Schritte fuer Standardfall', buildSteps({ gender: 'male', birthYear: yearFor(30) }, TODAY).length === 2);
check('Reihenfolge start, routine', buildSteps({}, TODAY)[0] === STEP_IDS.START && buildSteps({}, TODAY)[1] === STEP_IDS.ROUTINE);
check('auch bei Zusatzfrage weiterhin zwei Schritte (Frau, 30)', buildSteps({ gender: 'female', birthYear: yearFor(30) }, TODAY).length === 2);

console.log('— canAdvance("start") buendelt Geschlecht+Geburtsjahr+Zusatzfrage —');
check(
  'kein Geschlecht: nicht weiter',
  canAdvance('start', { gender: null, birthYear: yearFor(30) }, resolvedFemale30) === false
);
check(
  'zu jung: nicht weiter',
  canAdvance('start', { gender: 'male', birthYear: yearFor(2) }, resolved({ gender: 'male', birthYear: yearFor(2) })) === false
);
check(
  'Zusatzfrage noetig aber unbeantwortet: nicht weiter',
  canAdvance('start', { gender: 'female', birthYear: yearFor(30), extra: null }, resolvedFemale30) === false
);
check(
  'Zusatzfrage beantwortet: weiter',
  canAdvance('start', { gender: 'female', birthYear: yearFor(30), extra: 'none' }, resolvedFemale30) === true
);
check(
  'keine Zusatzfrage noetig (Mann): weiter ohne extra',
  canAdvance('start', { gender: 'male', birthYear: yearFor(30) }, resolved({ gender: 'male', birthYear: yearFor(30) })) === true
);

console.log('— canAdvance("routine") uebernimmt die alte ROUTINE_FIRST-Regel —');
check('kein firstAction: nicht weiter', canAdvance('routine', {}, {}) === false);
check('firstAction gesetzt: weiter', canAdvance('routine', { firstAction: 'later' }, {}) === true);
```

Bestehende Test-Helfer (`yearFor`, `resolved`, `resolvedFemale30`,
`resolvedDiverse30`, `check`, `TODAY`) aus der Datei weiterverwenden,
nicht duplizieren.

- [ ] **Step 3: Test laufen lassen, muss fehlschlagen**

Run: `npm test`
Expected: FAIL (STEP_IDS.START existiert noch nicht, `buildSteps` liefert
noch 6-10 Eintraege).

- [ ] **Step 4: `OnboardingSteps.js` umbauen**

```javascript
export const STEP_IDS = {
  START: 'start',
  ROUTINE: 'routine',
};

export function buildSteps() {
  return [STEP_IDS.START, STEP_IDS.ROUTINE];
}

export function canAdvance(stepId, answers = {}, resolved = {}) {
  switch (stepId) {
    case STEP_IDS.START: {
      if (!answers.gender) return false;
      if (answers.birthYear === null || answers.birthYear === undefined || resolved.tooYoung) return false;
      if (resolved.needsExtra === 'pregnancy') return Boolean(answers.extra);
      if (resolved.needsExtra === 'reference') return Boolean(answers.referenceOverride);
      return true;
    }
    case STEP_IDS.ROUTINE:
      return Boolean(answers.firstAction);
    default:
      return true;
  }
}
```

Den erklaerenden Kommentar am Dateikopf (Warum `extraQuestionFor` statt
`needsExtra` fuer die Listenzugehoerigkeit genutzt wurde) anpassen oder
entfernen — er bezieht sich auf die alte, jetzt nicht mehr existierende
bedingte Listenlaenge; `resolved.needsExtra` wird weiterhin fuer die
canAdvance-Bedingung gebraucht, nur nicht mehr fuer `buildSteps()`.

- [ ] **Step 5: Test laufen lassen, muss bestehen**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add OnboardingSteps.js tests/onboarding-steps.test.mjs
git commit -m "refactor(onboarding): buildSteps/canAdvance auf zwei gebuendelte Schritte"
```

---

### Task 9: Neue Onboarding-Screens — Inhalte buendeln

**Files:**
- Create: `components/onboarding/ScreenStart.jsx`
- Create: `components/onboarding/ScreenRoutine.jsx`
- Modify: `components/onboarding/StepName.jsx`, `StepGender.jsx`,
  `StepBirthYear.jsx`, `StepExtra.jsx`, `StepRoutineTimes.jsx`,
  `StepRoutineFirst.jsx` (nur `styles.container`, siehe Step 1)

**Interfaces:**
- Consumes: dieselben Props wie bisher pro Step-Komponente (`t, value,
  onChange` bzw. Aequivalent — vor dem Schreiben jede der sechs
  Komponenten kurz gegenlesen, Props koennen leicht abweichen).
- Produces: `ScreenStart({ t, answers, onChange, resolved })`,
  `ScreenRoutine({ t, answers, onChange })` — je eine Container-
  Komponente, die die bestehenden Step-Komponenten als Kind-Bloecke
  untereinander rendert.

- [ ] **Step 1: Container-Style der wiederverwendeten Step-Komponenten anpassen**

`StepGender.jsx`, `StepBirthYear.jsx`, `StepExtra.jsx`, `StepName.jsx`,
`StepRoutineTimes.jsx`, `StepRoutineFirst.jsx`, `StepLegal.jsx`:
`styles.container` von `{ flex: 1, justifyContent: 'center' }` (fuer den
bisherigen Einzelschritt-Vollbild-Modus) auf `{ marginBottom: space.xl }`
aendern — (Preflight-Fund: `StepLegal.jsx` hat denselben Vollbild-
Container-Style wie die anderen und wird jetzt ebenfalls in ScreenStart
gestapelt statt zentriert gerendert, war im ersten Entwurf uebersehen)
sie werden jetzt gestapelt in einem ScrollView statt zentriert allein
auf dem Screen zu stehen.

- [ ] **Step 2: `ScreenStart.jsx` schreiben**

```jsx
// components/onboarding/ScreenStart.jsx
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { extraQuestionFor } from '../../LifeStageResolver';
import { space, type } from '../../theme';
import StepName from './StepName';
import StepGender from './StepGender';
import StepBirthYear from './StepBirthYear';
import StepExtra from './StepExtra';
import StepLegal from './StepLegal';

/**
 * ScreenStart
 * Buendelt Anrede, Geschlecht, Geburtsjahr, Zusatzfrage (bedingt) und
 * den Rechtstext auf einer Flaeche. Ersetzt die fruehere Schrittfolge
 * Welcome/Legal/Name/Gender/BirthYear/Extra (Spec 2026-09-04, bewusste
 * Ausnahme von "eine Frage pro Screen" fuer den einmaligen Onboarding-
 * Flow). Die Zustimmung selbst passiert weiterhin ueber den Fusszeilen-
 * Knopf ("Akzeptieren und weiter"), StepLegal traegt nur Text+Links,
 * keinen eigenen Haken (siehe Kommentar in StepLegal.jsx).
 */
export default function ScreenStart({ t, answers, onChange, onOpenTerms, onOpenPrivacy }) {
  const questionKind = extraQuestionFor({ gender: answers.gender, birthYear: answers.birthYear });

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('onboarding.start.title')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.start.subtitle')}</Text>

      <StepName t={t} value={answers.displayName} onChange={(v) => onChange({ displayName: v })} />
      <StepGender t={t} value={answers.gender} onChange={(v) => onChange({ gender: v })} />
      <StepBirthYear t={t} value={answers.birthYear} onChange={(v) => onChange({ birthYear: v })} />
      {questionKind ? (
        <StepExtra
          t={t}
          questionKind={questionKind}
          value={{ extra: answers.extra, referenceOverride: answers.referenceOverride }}
          onChange={onChange}
        />
      ) : null}

      <StepLegal t={t} onOpenTerms={onOpenTerms} onOpenPrivacy={onOpenPrivacy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg },
  title: { ...type.display, marginBottom: space.sm },
  subtitle: { ...type.body, marginBottom: space.xl },
});
```

`onOpenTerms`/`onOpenPrivacy` aus dem bisherigen `app/onboarding.jsx`
uebernehmen (dort bereits an `StepLegal` durchgereicht, vermutlich
`router.push('/terms')`/`router.push('/privacy')` o. ae. — exakte
Implementierung dort nachlesen, nicht neu erfinden).

- [ ] **Step 3: Fusszeilen-Text von Screen 1 anpassen**

Da `StepLegal` keine eigene Checkbox hat, bleibt die Zustimmung wie
bisher am "Weiter"/"Akzeptieren und weiter"-Knopf der Fusszeile
haengen. `canAdvance('start', ...)` (Task 8) braucht deshalb bewusst
KEINE `legalAccepted`-Bedingung — das entspricht dem bestehenden
Verhalten (der bisherige LEGAL-Schritt hatte ebenfalls keinen
Checkbox-Gate in `canAdvance`, `default: true`). `StepLegal.jsx` bleibt
unveraendert bestehen und wird direkt in `ScreenStart` eingebettet,
keine neue `LegalNotice`-Komponente noetig.

- [ ] **Step 4: `ScreenRoutine.jsx` schreiben**

```jsx
// components/onboarding/ScreenRoutine.jsx
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { space, type } from '../../theme';
import StepRoutineTimes from './StepRoutineTimes';
import StepRoutineFirst from './StepRoutineFirst';

/**
 * ScreenRoutine
 * Buendelt Einnahmezeiten und erstes Praeparat. Das Konto-Angebot
 * (frueher StepAccount als Pflichtschritt) ist jetzt nur noch ein Link
 * in der Fusszeile, siehe app/onboarding.jsx (Task 10).
 */
export default function ScreenRoutine({ t, answers, onChange, permissionDenied }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('onboarding.routine.title')}</Text>

      <StepRoutineTimes t={t} value={permissionDenied} />
      <StepRoutineFirst
        t={t}
        value={answers.firstAction}
        onChange={(v) => onChange({ firstAction: v })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg },
  title: { ...type.display, marginBottom: space.xl },
});
```

Exakte Props von `StepRoutineTimes`/`StepRoutineFirst` vorher in den
bestehenden Dateien nachlesen (der Plan uebernimmt die Aufrufsignatur
aus dem alten `app/onboarding.jsx`, siehe Task 10 Step 1) — falls sie
abweichen, hier korrigieren statt zu raten.

- [ ] **Step 5: Visuell verifizieren (isoliert, vor der onboarding.jsx-Verdrahtung)**

Da `ScreenStart`/`ScreenRoutine` erst in Task 10 tatsaechlich gerendert
werden, diesen Schritt zusammen mit Task 10 Step 4 durchfuehren statt
separat — hier nur `npx eslint components/onboarding/ScreenStart.jsx
components/onboarding/ScreenRoutine.jsx` (oder aequivalente
Syntaxpruefung, falls kein Linter konfiguriert ist: `node --check`
funktioniert bei JSX nicht, ein kurzer Blick auf offensichtliche Tippfehler
reicht) als Zwischenstand.

- [ ] **Step 6: Commit**

```bash
git add components/onboarding/ScreenStart.jsx components/onboarding/ScreenRoutine.jsx components/onboarding/StepName.jsx components/onboarding/StepGender.jsx components/onboarding/StepBirthYear.jsx components/onboarding/StepExtra.jsx components/onboarding/StepLegal.jsx components/onboarding/StepRoutineTimes.jsx components/onboarding/StepRoutineFirst.jsx
git commit -m "feat(onboarding): ScreenStart/ScreenRoutine buendeln bisherige Einzelschritte"
```

---

### Task 10: `app/onboarding.jsx` auf zwei Screens verdrahten

**Files:**
- Modify: `app/onboarding.jsx`
- Delete (falls nach Task 9 ungenutzt): `components/onboarding/
  StepWelcome.jsx`, `StepAccount.jsx`, `StepDone.jsx` (`StepLegal.jsx`
  bleibt, es wird von `ScreenStart` weiterverwendet)

**Interfaces:**
- Consumes: `STEP_IDS`, `buildSteps`, `canAdvance` (Task 8),
  `ScreenStart`, `ScreenRoutine` (Task 9).

- [ ] **Step 1: Aktuellen `renderStep()`/Importe lesen**

Die bestehenden Prop-Uebergaben an `StepGender`, `StepBirthYear`,
`StepExtra`, `StepRoutineTimes`, `StepRoutineFirst` in der jetzigen
`app/onboarding.jsx` Zeile fuer Zeile notieren — `ScreenStart`/
`ScreenRoutine` (Task 9) muessen exakt dieselben Werte weiterreichen,
nur gebuendelt.

- [ ] **Step 2: Imports und `renderStep()` reduzieren**

```javascript
import ScreenStart from '../components/onboarding/ScreenStart';
import ScreenRoutine from '../components/onboarding/ScreenRoutine';
// StepWelcome, StepLegal, StepName, StepGender, StepBirthYear, StepExtra,
// StepRoutineTimes, StepRoutineFirst, StepAccount, StepDone: Einzelimporte
// entfernen, sie werden jetzt innerhalb von ScreenStart/ScreenRoutine
// importiert.
```

```javascript
const renderStep = () => {
  switch (stepId) {
    case STEP_IDS.START:
      return (
        <ScreenStart
          t={t}
          answers={answers}
          onChange={(patch) => setAnswers((a) => ({ ...a, ...patch }))}
          resolved={resolved}
        />
      );
    case STEP_IDS.ROUTINE:
      return (
        <ScreenRoutine
          t={t}
          answers={answers}
          onChange={(patch) => setAnswers((a) => ({ ...a, ...patch }))}
          permissionDenied={permissionDenied}
        />
      );
    default:
      return null;
  }
};
```

Exakte Namen von `answers`/`setAnswers`/`resolved`/`permissionDenied`
gegen die tatsaechliche Datei pruefen, nicht blind uebernehmen.

- [ ] **Step 3: Abschluss-Verhalten aendern**

Bisheriger `finish()`-Aufruf (nach `StepDone`) wandert an das Ende von
`STEP_IDS.ROUTINE`: nach `canAdvance('routine', ...)` direkt
`completeOnboarding()` (useStore.js) aufrufen und zu `/Dashboard`
navigieren, kein `StepDone`-Zwischenscreen mehr. Konto-Angebot
(`StepAccount`) als Pflichtschritt entfaellt; falls `accountOffered`
(Onboarding-Flag, siehe CLAUDE.md Datenhaltung-Abschnitt) an dieser
Stelle bisher gesetzt wurde, den Fusszeilen-Link in `ScreenRoutine`
(Task 9) diese Funktion uebernehmen lassen (`onPress={() => { markAccountOffered(); router.push('/account'); }}`
oder aequivalent zum bisherigen Verhalten).

- [ ] **Step 4: Visuell End-to-End verifizieren**

Kompletten Onboarding-Durchlauf im Browser (frischer Tab, kein
localStorage) durchklicken: zwei Screens, Zusatzfrage erscheint nur bei
Bedarf (z. B. Geschlecht "Frau", Alter im gebaerfaehigen Bereich),
"Weiter" bleibt deaktiviert bis alle Pflichtfelder von Screen 1 gesetzt
sind, Screen 2 fuehrt direkt zu `/Dashboard`. Denselben Durchlauf ein
zweites Mal mit anderer Geschlechts-/Alterskombination wiederholen, um
die bedingte Zusatzfrage in beide Richtungen zu pruefen.

- [ ] **Step 5: Ungenutzte alte Step-Dateien entfernen**

Mit `grep -rln "StepWelcome\|StepAccount\|StepDone"
app/ components/` pruefen, ob noch irgendwo referenziert (z. B. andere
Screens, die `StepAccount` fuer ein Konto-Angebot ausserhalb des
Onboardings wiederverwenden) — nur loeschen, was wirklich verwaist ist.
`StepLegal.jsx` bewusst NICHT in diese Pruefung aufnehmen, es bleibt
aktiv (siehe Task 9 Step 3).

- [ ] **Step 6: `npm test` komplett laufen lassen**

Run: `npm test`
Expected: alle bestehenden Suiten weiterhin gruen, insbesondere
`tests/onboarding-store.test.mjs` (falls dort `completeOnboarding()`
oder Onboarding-Flags geprueft werden).

- [ ] **Step 7: Commit**

```bash
git add app/onboarding.jsx
git add -u components/onboarding
git commit -m "refactor(onboarding): Screen-Umbau auf zwei Schritte verdrahtet"
```

---

### Task 11: Website-Kommentar aktualisieren und Entscheidung protokollieren

**Files:**
- Modify: `.claude/worktrees/website/web/src/styles/tokens.css`
  (Branch `phase-2u-website`, eigener Worktree — siehe Offene Punkte in
  der Spec: separat pruefen, ob dieser Branch eigene Freigabe/Deploy-
  Schritte braucht, bevor committet wird)

- [ ] **Step 1: Kommentar-Kopf anpassen**

Den Absatz "Bewusst NICHT mehr an theme.js (App-Palette) gekoppelt ..."
ersetzen durch einen Hinweis, dass die App seit diesem Redesign
denselben Azur/Navy-Grundton wie die Website nutzt (Quelle: App-Icon),
Website und App aber weiterhin eigene Dichte/Typografie behalten
(Space Grotesk/IBM Plex fuer die Website bleiben unveraendert).

- [ ] **Step 2: `brain-capture`-Skill aufrufen**

Entscheidung protokollieren: Supersedes die bisherige Design-
Entkopplungs-Notiz. Warum: Markenwiedererkennung zwischen Landingpage
und App war Nadine wichtiger als die urspruengliche Trennung. Verworfen:
vollstaendige Design-Angleichung (auch Typografie/Layout) — bewusst nur
Farbe, da native App und Marketing-Website unterschiedliche
Lesekontexte haben.

- [ ] **Step 3: Commit (auf dem website-Worktree, separat pruefen ob Push-Freigabe noetig)**

```bash
cd .claude/worktrees/website
git add web/src/styles/tokens.css
git commit -m "docs: Farb-Kommentar an App-Angleichung (Azur/Navy) anpassen"
```

## Self-Review-Notiz fuer den Ausfuehrenden

Tasks 1-7 sind unabhaengig voneinander und koennen in beliebiger
Reihenfolge nach Task 1 (Farbe zuerst, damit alle folgenden UI-Aenderungen
schon die richtige Akzentfarbe sehen) erledigt werden. Tasks 8-10
(Onboarding) haengen strikt aneinander und sollten am Stueck bearbeitet
werden. Task 11 ist optional und zeitlich unabhaengig, beruehrt einen
anderen Branch/Worktree.
