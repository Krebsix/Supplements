# Suche, Bestand und Tagesplan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tagesplan erklaert jeden Eintrag mit belegtem Satz und Quelle; Suche zeigt zu jedem Wirkstoff die Katalogprodukte; ein gemeinsamer Einstieg "Scannen / Suchen / Manuell" ueberall; Nachfuell-Erinnerung aus dem Bestand; Open-Food-Facts-Eintraege unter ODbL getrennt und attribuiert.

**Architecture:** Vier neue reine Module (`ScheduleGuidance.js`, `SeedCatalog.findProductsBySubstance`, `StockForecast.js`, Katalog-Split-Skript), zwei neue Komponenten (`SlotReason`, `AddSupplementChooser`), Verdrahtung in Dashboard, Bestand, Suche, Erinnerungen. Kein neues Wissen: alle Saetze kommen aus `data/interactions.js` und `data/substances.js` mit Quelle.

**Tech Stack:** bestehend (zustand, expo-router, expo-notifications, esbuild-Tests). Keine neuen Pakete.

**Spec:** `docs/superpowers/specs/2026-08-30-suche-bestand-tagesplan-design.md`

## Global Constraints

- Erklaerungen nur aus belegten Regeln (`INTAKE_GUIDANCE`, `PAIR_RULES`, `substances.js`); ohne Regel kein Satz. Deskriptiv, nie praeskriptiv. Quelle immer sichtbar.
- Produktliste je Wirkstoff: Sortierung nur Marke (alphabetisch, Standard), Menge, Form. Keine Bewertung, keine Preise, keine Shop-Links.
- Nachfuell-Hinweis: "reicht noch etwa {days} Tage", nie "jetzt nachkaufen". Lokal, einmal je Unterschreitung.
- Keine Hex-Farben in Screens, kein Gedankenstrich in Nutzertexten (DE/EN), Fachlogik nie in Screens, Kommentare Deutsch, Commits Englisch (Conventional Commits), i18n-Paritaet.
- `scheduleAllNotificationsForToday` loescht ALLE geplanten Benachrichtigungen; Nachfuell-Erinnerungen werden deshalb innerhalb desselben Refreshs neu geplant, nie separat.
- Wer `data/legalContent.js` aendert, laeuft `npm run build:legal`.

## Abweichungen von der Spec

1. **Keine `reason` in `TimingEngine`.** Der Slot ist `timingSlots[0]` des Praeparats (aus Katalog, Scan oder Hand), TimingEngine berechnet ihn nicht. Die Erklaerung kommt aus den erkannten Wirkstoffen: Einnahme-Hinweis je Substanz (`INTAKE_GUIDANCE`) und Paar-Konflikte (`PAIR_RULES`) mit anderen aktiven Praeparaten. Neues Modul `ScheduleGuidance.js`. Das ist ehrlicher als ein nachtraeglich erfundener Slot-Grund.
2. **ODbL-Split (Variante A, Nadine 2026-08-30):** OFF-Eintraege wandern in `data/offProducts.json` (ODbL, mit Attribution im Dateikopf), der Herstellerkatalog bleibt in `data/seedProducts.json`. `SeedCatalog` liest beide.

---

### Task 1: ScheduleGuidance.js (TDD)

**Files:**
- Create: `ScheduleGuidance.js`
- Modify: `StackAnalyzer.js` (nur `export` vor `extractPositions`, falls noch nicht exportiert)
- Test: `tests/schedule-guidance.test.mjs`

**Interfaces:**
- Produces: `buildEntryGuidance(supplement, activeSupplements = []) => { notes: [{ substanceId, text, sources: [{label,url}] }], conflicts: [{ substanceId, partnerSubstanceId, partnerSupplementName, severity, text, sources }] }`. `notes` maximal 2 (die ersten erkannten Substanzen mit Hinweis), `conflicts` alle Paar-Regeln zwischen den Substanzen dieses Praeparats und den Substanzen anderer aktiver Praeparate, dedupliziert je (substanceId, partnerSubstanceId).

- [ ] **Step 1: Fehlschlagenden Test schreiben**

`tests/schedule-guidance.test.mjs`:

```js
// Tests fuer ScheduleGuidance.js: Erklaerungen je Tagesplan-Eintrag aus
// belegten Regeln. Kein Satz ohne Regel, keine Regel ohne Quelle.
import { buildEntryGuidance } from '../ScheduleGuidance';
import { INTAKE_GUIDANCE, PAIR_RULES } from '../data/interactions';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}
const sup = (name, ingredients) => ({ id: `user-${name}`, name, status: 'active', ingredients: ingredients.map(([n, amount, unit]) => ({ name: n, amount, unit })) });

console.log('— Einnahme-Hinweise —');
const iron = sup('Eisen Kapseln', [['Eisen', '14', 'mg']]);
const g1 = buildEntryGuidance(iron, [iron]);
check('Eisen liefert einen Hinweis mit Quelle', g1.notes.length === 1 && g1.notes[0].substanceId === 'iron' && g1.notes[0].sources.length > 0);
check('Hinweistext ist der hinterlegte', g1.notes[0].text === INTAKE_GUIDANCE.iron.note);
const plain = sup('Nur Vitamin C', [['Vitamin C', '200', 'mg']]);
const g2 = buildEntryGuidance(plain, [plain]);
check('ohne hinterlegten Hinweis: keine Notiz (kein Fuelltext)', Array.isArray(g2.notes) && g2.notes.every((n) => INTAKE_GUIDANCE[n.substanceId]));
const many = sup('Multi', [['Eisen', '5', 'mg'], ['Flohsamenschalen', '3', 'g'], ['Koffein', '80', 'mg']]);
check('maximal zwei Hinweise', buildEntryGuidance(many, [many]).notes.length <= 2);

console.log('— Konflikte —');
const rule = PAIR_RULES[0];
const a = sup('A', [[rule.a, '1', 'mg']]);
const b = sup('B', [[rule.b, '1', 'mg']]);
// Substanz-IDs sind keine Anzeigenamen; der Matcher braucht Namen. Ueber
// die Substanz-Datenbank den Anzeigenamen holen:
import { getSubstance } from '../data/substances';
const aN = sup('A', [[getSubstance(rule.a).name, '1', 'mg']]);
const bN = sup('B', [[getSubstance(rule.b).name, '1', 'mg']]);
const g3 = buildEntryGuidance(aN, [aN, bN]);
check('Paar-Regel zwischen zwei Praeparaten wird gefunden', g3.conflicts.some((c) => c.partnerSupplementName === 'B' && c.severity === rule.severity && c.sources.length > 0));
check('kein Konflikt mit sich selbst', buildEntryGuidance(aN, [aN]).conflicts.length === 0);
check('archivierte Praeparate zaehlen nicht', buildEntryGuidance(aN, [aN, { ...bN, status: 'archived' }]).conflicts.length === 0);
check('leeres Praeparat: leere Struktur', (() => { const g = buildEntryGuidance({ id: 'x', name: 'x', ingredients: [] }, []); return g.notes.length === 0 && g.conflicts.length === 0; })());

if (failures > 0) { console.error(`\n${failures} Fehler`); process.exit(1); }
console.log('\nAlle ScheduleGuidance-Tests bestanden.');
```

Hinweis: Wenn `getSubstance` in `data/substances.js` anders heisst, den tatsaechlichen Export verwenden (der Implementer prueft `grep -n "^export" data/substances.js`). Die `import`-Zeile mitten im Test nach oben ziehen.

- [ ] **Step 2: RED** — `npm test 2>&1 | grep -A3 schedule-guidance` → Modul fehlt.

- [ ] **Step 3: ScheduleGuidance.js**

```js
/**
 * ScheduleGuidance.js
 * ─────────────────────────────────────────────────────────────
 * Erklaerungen fuer einen Tagesplan-Eintrag, ausschliesslich aus belegten
 * Regeln: Einnahme-Hinweise je Substanz (data/interactions.js,
 * INTAKE_GUIDANCE) und Paar-Regeln zwischen den Substanzen dieses
 * Praeparats und denen der anderen aktiven Praeparate (PAIR_RULES).
 *
 * WARUM NICHT AUS DEM SLOT: Der Slot ist timingSlots[0] des Praeparats;
 * niemand hat ihn "entschieden". Eine nachtraeglich erfundene Begruendung
 * waere genau der Fuelltext, den die App nicht schreibt. Was hier steht,
 * hat eine Quelle, oder es steht nicht da.
 */
import { extractPositions } from './StackAnalyzer';
import { findPairInteractions, getIntakeGuidance } from './InteractionCheck';

const MAX_NOTES = 2;

function substanceIdsOf(supplement) {
  const ids = [];
  for (const position of extractPositions(supplement)) {
    const id = position.match?.matched ? position.match.substanceId : null;
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

export function buildEntryGuidance(supplement, activeSupplements = []) {
  const ownIds = substanceIdsOf(supplement);

  const notes = [];
  for (const substanceId of ownIds) {
    const guidance = getIntakeGuidance(substanceId);
    if (guidance?.note && Array.isArray(guidance.sources) && guidance.sources.length > 0) {
      notes.push({ substanceId, text: guidance.note, sources: guidance.sources });
    }
    if (notes.length >= MAX_NOTES) break;
  }

  const conflicts = [];
  const seen = new Set();
  for (const other of activeSupplements) {
    if (!other || other.id === supplement.id || (other.status && other.status !== 'active')) continue;
    const otherIds = substanceIdsOf(other);
    for (const rule of findPairInteractions([...ownIds, ...otherIds])) {
      const mine = ownIds.includes(rule.a) ? rule.a : ownIds.includes(rule.b) ? rule.b : null;
      const theirs = mine === rule.a ? rule.b : rule.a;
      if (!mine || !otherIds.includes(theirs)) continue;
      const key = `${mine}|${theirs}`;
      if (seen.has(key)) continue;
      seen.add(key);
      conflicts.push({ substanceId: mine, partnerSubstanceId: theirs, partnerSupplementName: other.name ?? '', severity: rule.severity, text: rule.note, sources: rule.sources });
    }
  }

  return { notes, conflicts };
}
```

Der Implementer prueft die Rueckgabeform von `findPairInteractions` (Felder `a`, `b`, `severity`, `note`, `sources`) und passt die Feldnamen an, falls sie abweichen; ebenso, ob `extractPositions` `ingredients` oder `detectedIngredients` liest, und welches Feld die Nutzer-Praeparate tragen (`grep -n "ingredients" useStore.js app/AddSupplement.jsx`). Der Test nutzt dasselbe Feld wie der Store.

- [ ] **Step 4: GREEN, Commit**

```bash
git add ScheduleGuidance.js StackAnalyzer.js tests/schedule-guidance.test.mjs
git commit -m "feat(schedule): guidance per entry from documented intake rules and pair conflicts"
```

---

### Task 2: SlotReason im Tagesplan

**Files:**
- Create: `components/SlotReason.jsx`
- Modify: `app/(tabs)/(today)/Dashboard.jsx`, `i18n/de/dashboard.js`, `i18n/en/dashboard.js`

- [ ] **Step 1: Komponente**

`SlotReason({ guidance, onOpenSubstance })`: rendert nichts, wenn `notes` und `conflicts` leer. Sonst je Note eine Zeile: Text gekuerzt auf den ersten Satz (bis zum ersten ". "), dahinter Quellenkuerzel in `type.tiny` (`sources[0].label` bis zum ersten ":"), antippbar → `onOpenSubstance(substanceId)`. Je Konflikt eine Zeile mit Feather `alert-circle` in `toneFor(severity)`-Farbe (bestehende Helfer aus `theme.js`), Text `t('dashboard.reason.conflict', { partner })` plus erster Satz der Regel plus Quellenkuerzel. Englische Texte der Regeln kommen ueber die bestehenden Overlays (`data/localize.js`); der Implementer prueft, ob `INTAKE_GUIDANCE`/`PAIR_RULES` ein EN-Overlay haben (`ls data/en/`), sonst bleibt DE (Fallback laut Sprachregel).

- [ ] **Step 2: Dashboard**

Je Eintrag unter dem Namen: `const guidance = useMemo(() => buildEntryGuidance(supplement, activeSupplements), [...])` und `<SlotReason guidance={guidance} onOpenSubstance={(id) => router.push(\`/search?substance=${id}\`)} />`. Pruefen, ob der Suche-Screen einen `substance`-Parameter bereits versteht (`useLocalSearchParams`); wenn nicht, dort ergaenzen: Parameter oeffnet direkt das Wirkstoff-Profil.

i18n: `dashboard.reason.conflict`: DE "Getrennt von {partner}:" / EN "Apart from {partner}:"; `dashboard.reason.sourceHint`: DE "Quelle antippen für das vollständige Zitat" / EN "Tap the source for the full quote".

- [ ] **Step 3: Syntax-Check, Suite, Commit**

```bash
git add components/SlotReason.jsx "app/(tabs)/(today)/Dashboard.jsx" "app/(tabs)/(discover)/search.jsx" i18n/de/dashboard.js i18n/en/dashboard.js
git commit -m "feat(dashboard): show documented intake guidance and conflicts per entry"
```

---

### Task 3: Produkte je Wirkstoff in der Suche (TDD)

**Files:**
- Modify: `SeedCatalog.js` (`findProductsBySubstance`, Index), `app/(tabs)/(discover)/search.jsx`, `i18n/de/search.js`, `i18n/en/search.js`
- Test: `tests/seed-catalog.test.mjs` (erweitern)

**Interfaces:**
- `findProductsBySubstance(substanceId) => [{ entry, amount: number|null, unit: string, form: string|null, brand, name, country }]`, sortiert nach Marke; `sortProducts(list, 'brand' | 'amount' | 'form')` rein.

- [ ] **Step 1: Test erweitern**

```js
console.log('— Produkte je Wirkstoff —');
const mg = findProductsBySubstance('magnesium');
check('Magnesium liefert Produkte', mg.length >= 60, String(mg.length));
check('jeder Treffer hat Marke und Namen', mg.every((p) => p.brand && p.name));
check('Menge ist Zahl oder null', mg.every((p) => p.amount === null || Number.isFinite(p.amount)));
check('Standard nach Marke sortiert', mg.every((p, i) => i === 0 || mg[i - 1].brand.localeCompare(p.brand, 'de') <= 0));
const byAmount = sortProducts(mg, 'amount');
check('Sortierung nach Menge absteigend', byAmount.every((p, i) => i === 0 || (byAmount[i - 1].amount ?? -1) >= (p.amount ?? -1)));
check('unbekannte Substanz: leer', findProductsBySubstance('gibt-es-nicht').length === 0);
check('Synonym trifft (Magnesiumcitrat-Produkte enthalten)', mg.some((p) => /citrat/i.test(p.form ?? '') || /citrat/i.test(p.name)));
```

- [ ] **Step 2: Implementierung**

Index einmalig (lazy) aufbauen: fuer jeden Katalogeintrag jede `keyIngredients`-Zeile per `matchIngredient(item.name)` (SubstanceMatcher) auf `substanceId` und `form` abbilden; `Map<substanceId, Array<hit>>`. `findProductsBySubstance` liest den Index, `sortProducts` sortiert (amount: absteigend, null zuletzt; form: alphabetisch; brand: `localeCompare('de')`). Katalogquelle: ab Task 6 beide Dateien; bis dahin `seedProducts.json` (Task 6 stellt um, Test bleibt gueltig).

- [ ] **Step 3: Suche**

Unter dem Wirkstoff-Profil ein Abschnitt `search.products.title` ("{count} Produkte mit {substance}"), drei Sortier-Chips (`search.products.sortBrand/sortAmount/sortForm`), Zeilen: Marke, Produktname, `amount unit`, Form, Land als Kuerzel. Antippen → wie heute `seedEntryToScanDraft(entry)` und Formular oeffnen. Bei 0 Treffern kein Abschnitt. i18n DE/EN mit Platzhaltern `{count}`, `{substance}`.

- [ ] **Step 4: Suite, Commit**

```bash
git add SeedCatalog.js "app/(tabs)/(discover)/search.jsx" i18n/de/search.js i18n/en/search.js tests/seed-catalog.test.mjs
git commit -m "feat(search): list catalog products per substance with sorting"
```

---

### Task 4: AddSupplementChooser ueberall

**Files:**
- Create: `components/AddSupplementChooser.jsx`
- Modify: `app/(tabs)/(today)/Dashboard.jsx` (Leerzustand), `app/(tabs)/(today)/inventory.jsx` (Leerzustand und "+"), `app/(tabs)/(more)/menu.jsx` (Zeile "Präparat erfassen" oeffnet Chooser als Modal-Sheet statt Formular), `i18n/de/common.js`, `i18n/en/common.js`

- [ ] **Step 1: Komponente**

Drei `ChoiceCard`-aehnliche Karten (Komponente aus `components/onboarding/ChoiceCard.jsx` wiederverwenden): `add.scan` "Scannen" (Feather `camera`, Untertitel "Barcode oder Etikettenfoto"), `add.search` "Suchen" (`search`, "Wirkstoff oder Produkt im Katalog"), `add.manual` "Manuell eingeben" (`edit-3`, "Name, Dosis, Zeiten selbst eintragen"). Props `{ onScan, onSearch, onManual, compact }`. Navigation: `/scanner`, `/search`, `/AddSupplement`.

- [ ] **Step 2: Einsatzorte**

Dashboard-Leerzustand und Bestand-Leerzustand rendern den Chooser statt des einzelnen Knopfs; der "+"-Knopf im Bestand oeffnet ein kleines Bottom-Sheet (`Modal` mit `presentationStyle="pageSheet"` auf iOS) mit dem Chooser; Menue-Zeile "Präparat erfassen" ebenso. i18n DE/EN Schluessel `add.*` in `common.js`.

- [ ] **Step 3: Syntax-Check, Suite, Commit**

```bash
git add components/AddSupplementChooser.jsx "app/(tabs)/(today)/Dashboard.jsx" "app/(tabs)/(today)/inventory.jsx" "app/(tabs)/(more)/menu.jsx" i18n/de/common.js i18n/en/common.js
git commit -m "feat(inventory): one add-supplement entry point (scan, search, manual)"
```

---

### Task 5: Nachfuell-Erinnerung (TDD)

**Files:**
- Create: `StockForecast.js`
- Modify: `useStore.js` (Stock-Feld `refillNotifiedAt`, Aktion `markRefillNotified(id, iso|null)`), `useNotificationStore.js` (`refillThresholdDays`, `setRefillThresholdDays`), `NotificationScheduler.js` (`scheduleRefillReminders` innerhalb von `scheduleAllNotificationsForToday`), `app/(tabs)/(more)/notifications.jsx` (Schwelle), `app/(tabs)/(today)/inventory.jsx` (Hinweiszeile), i18n `notifications`, `inventory`, `logic`
- Test: `tests/stock-forecast.test.mjs`

**Interfaces:**
- `dailyUnits(supplement) => number` (Anzahl aktiver Slots × `decrementPerIntake` des Bestands, mindestens 1 wenn Slots vorhanden, 0 ohne Slots)
- `daysLeft(stock, supplement) => number | null` (null ohne `currentUnits`)
- `refillState(stock, supplement, thresholdDays, now) => { daysLeft, due: boolean, notify: boolean }` mit `notify = due && !stock.refillNotifiedAt`; Reset-Regel: `!due && stock.refillNotifiedAt` → Aufrufer setzt `refillNotifiedAt` auf null.

- [ ] **Step 1: Test**

```js
import { dailyUnits, daysLeft, refillState } from '../StockForecast';
const sup = (slots) => ({ id: 'user-1', name: 'Magnesium', timingSlots: slots, status: 'active' });
check('1 Slot, 1 je Einnahme: 1 Einheit/Tag', dailyUnits(sup(['morning']), { decrementPerIntake: 1 }) === 1);
check('2 Slots, 2 je Einnahme: 4/Tag', dailyUnits(sup(['morning', 'evening']), { decrementPerIntake: 2 }) === 4);
check('ohne Slots: 0', dailyUnits(sup([]), {}) === 0);
check('30 Einheiten, 2/Tag: 15 Tage', daysLeft({ currentUnits: 30, decrementPerIntake: 1 }, sup(['morning', 'evening'])) === 15);
check('ohne Bestand: null', daysLeft({}, sup(['morning'])) === null);
check('0 Einheiten: 0 Tage', daysLeft({ currentUnits: 0 }, sup(['morning'])) === 0);
const s4 = { currentUnits: 4, decrementPerIntake: 1 };
check('unter Schwelle, noch nicht gemeldet: notify', refillState(s4, sup(['morning']), 5).notify === true);
check('unter Schwelle, schon gemeldet: kein notify', refillState({ ...s4, refillNotifiedAt: '2026-08-29' }, sup(['morning']), 5).notify === false);
check('ueber Schwelle: nicht faellig', refillState({ currentUnits: 40 }, sup(['morning']), 5).due === false);
check('Schwelle 0 = aus', refillState(s4, sup(['morning']), 0).due === false);
check('ohne Bestand: nicht faellig', refillState({}, sup(['morning']), 5).due === false);
```

- [ ] **Step 2: Modul, Store, Scheduler**

`StockForecast.js` rein wie oben (Rundung `Math.floor`). `useStore`: `markRefillNotified(userSupplementId, iso)`. `useNotificationStore`: `refillThresholdDays: 5`, Setter, in `partialize`. `NotificationScheduler.scheduleAllNotificationsForToday` bekommt einen zusaetzlichen Parameter `stocks` (oder liest sie aus `state`) und plant am Ende je faelligem Praeparat eine Benachrichtigung fuer heute 09:00 (oder in 1 Minute, wenn 09:00 vorbei ist) mit Text `tr('logic.notifications.refill', { name, days })` ("{name} reicht noch etwa {days} Tage."), markiert per `markRefillNotified`; setzt `refillNotifiedAt` zurueck, wenn nicht mehr faellig. `refreshNotificationSchedule` in `useNotificationStore` reicht `stockBySupplementId` durch.

- [ ] **Step 3: Screens**

`notifications.jsx`: Karte "Nachfüllen" mit Chips 3 / 5 / 7 Tage / Aus. `inventory.jsx`: unter jedem Praeparat mit Bestand `t('inventory.refillIn', { days })` in `type.tiny`, Farbe `colors.caution` wenn faellig. i18n DE/EN.

- [ ] **Step 4: Suite, Commit**

```bash
git add StockForecast.js useStore.js useNotificationStore.js NotificationScheduler.js "app/(tabs)/(more)/notifications.jsx" "app/(tabs)/(today)/inventory.jsx" i18n tests/stock-forecast.test.mjs
git commit -m "feat(stock): refill reminder from remaining units, threshold in settings"
```

---

### Task 6: ODbL-Split und Attribution

**Files:**
- Create: `scripts/split-off-products.mjs`, `data/offProducts.json`
- Modify: `data/seedProducts.json` (OFF-Eintraege entfernt), `SeedCatalog.js` (liest beide), `data/legalContent.js` (Impressum-Abschnitt "Datenquellen"), `web/*`, `CLAUDE.md`, `launch/avv-dokumentation.md` (kurzer Hinweis, dass OFF Lizenz, kein Verarbeiter ist)
- Test: `tests/seed-catalog.test.mjs` (Zaehlung bleibt 411 gesamt; OFF-Datei traegt `license: 'ODbL'` im Kopf)

- [ ] **Step 1: Skript**

`scripts/split-off-products.mjs`: liest `seedProducts.json`, verschiebt alle Eintraege mit `source` unter `world.openfoodfacts.org` nach `data/offProducts.json` als `{ license: 'ODbL-1.0', attribution: 'Open Food Facts, https://world.openfoodfacts.org, ODbL', generatedAt, products: [...] }`, schreibt `seedProducts.json` ohne sie zurueck. Idempotent. `npm run split:off` in `package.json`.

- [ ] **Step 2: SeedCatalog**

`const CATALOG = [...seedProducts, ...offProducts.products.map((p) => ({ ...p, license: 'ODbL' }))]`; alle Funktionen lesen `CATALOG`. Produktzeilen in Suche und Markenliste zeigen bei `license === 'ODbL'` ein kleines "OFF"-Kuerzel mit Tooltip-Text `search.products.offSource` ("Daten aus Open Food Facts, ODbL").

- [ ] **Step 3: Attribution**

Impressum DE: neuer Abschnitt "Datenquellen": "Produktdaten stammen teilweise aus Open Food Facts (world.openfoodfacts.org), lizenziert unter der Open Database License (ODbL). Diese Eintraege sind in der App gekennzeichnet und werden getrennt vom redaktionell gepflegten Katalog gefuehrt." EN analog. `npm run build:legal`. `CLAUDE.md`: Datenbank-Tabelle um `data/offProducts.json` (ODbL, getrennt, Attribution Pflicht) ergaenzen; Regel: neue OFF-Daten nur in diese Datei.

- [ ] **Step 4: Suite, Commit**

```bash
git add scripts/split-off-products.mjs package.json data/seedProducts.json data/offProducts.json SeedCatalog.js data/legalContent.js web/ CLAUDE.md launch/avv-dokumentation.md tests/seed-catalog.test.mjs "app/(tabs)/(discover)/search.jsx"
git commit -m "feat(catalog): separate Open Food Facts entries under ODbL with attribution"
```

---

## Offen nach diesem Plan

- OFF-Massenimport (eigener Plan, nach diesem Split).
- Fertig-Kriterium Datenbank (Brain-Inbox, Entscheidung Nadine).
- Landingpage-Footer mit OFF-Attribution (steht im Landingpage-Paket).
