# Praeparat aufnehmen in zwei Fragen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein Praeparat aus Katalog, Scan oder von Hand landet mit zwei Fragen (wie oft, wann) und einem Knopf im Tagesplan; die App schlaegt den Zeitpunkt aus belegten Regeln vor.

**Architecture:** Neues reines Modul `SlotSuggestion.js` (Vorschlag + Ableitung der Slots aus der Haeufigkeit, Node-getestet). Drei kleine Komponenten (Produktkarte, Haeufigkeits-Chips, Slot-Chips mit Begruendungszeile). `app/AddSupplement.jsx` wird neu geschrieben und bedient weiterhin alle vier Einstiege (Katalog, Scan, Manuell, Bearbeiten); der Datensatz aendert sich nicht. Katalog-Treffer springen direkt auf den Screen statt ueber `results.jsx`.

**Tech Stack:** Expo SDK 54, React Native, expo-router, zustand, i18n (`useTranslation` in Komponenten, `tr` in Logik), Tests via `npm test` (esbuild + Node).

**Spec:** `docs/superpowers/specs/2026-08-30-praeparat-aufnehmen-design.md`

## Global Constraints

- Fachlogik (Vorschlag, Slot-Ableitung) nur in `SlotSuggestion.js`, nie in Screens (CLAUDE.md).
- Vorschlaege zitieren nur Regeln mit Quelle aus `data/interactions.js` (`INTAKE_GUIDANCE`) oder `data/substances.js` (`fatSoluble` + `sources`). Ohne Regel: Standard `morning`, `reason: null`.
- Formulierung deskriptiv: "Vorschlag", nie "nimm", nie "solltest", nie "empfohlen". EN-Texte ohne cure/heals/treats/boosts/recommended/you should.
- Keine Gedankenstriche ("—") in Nutzertexten (DE und EN). Keine Hex-Werte in Screens/Komponenten, nur Tokens aus `theme.js`. Keine Emojis als Icons.
- Deutsch ist Pflegesprache; jeder neue i18n-Schluessel in `i18n/de/*` UND `i18n/en/*` (Test `tests/i18n.test.mjs` prueft, dass kein Schluessel nur auf Englisch existiert).
- Deutsche Code-Kommentare. Conventional Commits.
- Datensatz `normalizeUserSupplement` (storeLogic.js) bleibt unveraendert: `timingSlots`, `dosage {amount, unit}`, `ingredientDetails`, `cureConfig`, `cureStartDate`, `notes`, `purpose`, `category`, `timingRaw`, `childSafe`.
- Free-Grenze (`canAddSupplement`) und Pro-Gate fuer Kur (`canUseProFeature`) bleiben wie heute vor dem Speichern.
- `npm test` muss nach jedem Task gruen sein.

---

### Task 1: SlotSuggestion.js (rein) mit Tests und i18n-Saetzen

**Files:**
- Create: `SlotSuggestion.js`
- Create: `tests/slot-suggestion.test.mjs`
- Modify: `i18n/de/logic.js` (neue Schluessel am Ende des Objekts)
- Modify: `i18n/en/logic.js` (dieselben Schluessel)
- Modify: `CLAUDE.md` (Tabelle "Fachlogik", neue Zeile)

**Interfaces:**
- Consumes: `getIntakeGuidance(substanceId)` aus `InteractionCheck.js` (liefert `{ note, sources }` oder `null`); `getSubstance(id)`, `normalizeSources(sources)` aus `data/substances.js`; `extractPositions(supplement)` aus `StackAnalyzer.js`; `localizeIntakeNote(substanceId, germanNote)` aus `data/localize.js`; `SLOT_ORDER` aus `TimingEngine.js`; `tr(key, params)` aus `i18n/runtime`.
- Produces (fuer Task 2 und 3):
  - `DEFAULT_SLOT = 'morning'`
  - `SLOT_BY_GUIDANCE` (Objekt substanceId → slotId)
  - `substanceIdsFromDetails(ingredientDetails) => string[]`
  - `suggestPrimarySlot(substanceIds) => { slot, reason }` mit `reason = null | { key: 'guidance' | 'fatSoluble', substanceId, text, sources: [{label, url}] }`
  - `expandSlots(primarySlot, timesPerDay) => string[]` (in `SLOT_ORDER`-Reihenfolge)
  - `suggestSlots({ substanceIds, timesPerDay }) => { slots, reason }`

- [ ] **Step 1: Failing test schreiben**

`tests/slot-suggestion.test.mjs`:

```js
// Tests fuer SlotSuggestion.js: Vorschlag des Einnahmezeitpunkts aus
// belegten Regeln und Ableitung der Slots aus der Haeufigkeit.
import {
  DEFAULT_SLOT,
  expandSlots,
  SLOT_BY_GUIDANCE,
  substanceIdsFromDetails,
  suggestPrimarySlot,
  suggestSlots,
} from '../SlotSuggestion';
import { INTAKE_GUIDANCE } from '../data/interactions';
import { SLOT_ORDER } from '../TimingEngine';
import { setActiveLanguage } from '../i18n/runtime';

let failures = 0;

function check(name, condition, detail = '') {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name}${detail ? ` (${detail})` : ''}`);
  }
}

console.log('— SLOT_BY_GUIDANCE zeigt nur auf belegte Regeln —');
for (const [substanceId, slot] of Object.entries(SLOT_BY_GUIDANCE)) {
  const rule = INTAKE_GUIDANCE[substanceId];
  check(`${substanceId}: Regel mit Quelle vorhanden`, Boolean(rule?.note) && Array.isArray(rule?.sources) && rule.sources.length > 0);
  check(`${substanceId}: Slot ${slot} existiert`, SLOT_ORDER.includes(slot));
}

console.log('— suggestPrimarySlot: Einnahme-Hinweise —');
const iron = suggestPrimarySlot(['iron']);
check('iron → fasted', iron.slot === 'fasted');
check('iron: reason.key guidance', iron.reason?.key === 'guidance' && iron.reason.substanceId === 'iron');
check('iron: Text ist die Regel', iron.reason?.text === INTAKE_GUIDANCE.iron.note);
check('iron: Quelle mit Label', Array.isArray(iron.reason?.sources) && typeof iron.reason.sources[0]?.label === 'string');

check('melatonin → evening', suggestPrimarySlot(['melatonin']).slot === 'evening');
check('caffeine → morning', suggestPrimarySlot(['caffeine']).slot === 'morning');
check('psyllium: kein Vorschlag (Hinweis ohne Zeitpunkt)', suggestPrimarySlot(['psyllium']).reason === null);

console.log('— suggestPrimarySlot: fettloeslich —');
const vitD = suggestPrimarySlot(['vitamin-d3']);
check('vitamin-d3 → morning', vitD.slot === 'morning');
check('vitamin-d3: reason.key fatSoluble', vitD.reason?.key === 'fatSoluble' && vitD.reason.substanceId === 'vitamin-d3');
check('vitamin-d3: Text nennt die Substanz', typeof vitD.reason?.text === 'string' && vitD.reason.text.includes('Vitamin D'));
check('vitamin-d3: Quelle normalisiert', Array.isArray(vitD.reason?.sources) && vitD.reason.sources.length > 0 && typeof vitD.reason.sources[0].label === 'string');

setActiveLanguage('en');
const vitDEn = suggestPrimarySlot(['vitamin-d3']);
check('EN: fettloeslich-Satz auf Englisch', /fat-soluble/i.test(vitDEn.reason?.text ?? ''));
check('EN: kein Gedankenstrich', !(vitDEn.reason?.text ?? '').includes('—'));
setActiveLanguage('de');

console.log('— suggestPrimarySlot: Prioritaet und Default —');
check('Hinweis schlaegt fettloeslich', suggestPrimarySlot(['vitamin-d3', 'iron']).slot === 'fasted');
const mg = suggestPrimarySlot(['magnesium']);
check('magnesium → Default morning', mg.slot === DEFAULT_SLOT && mg.reason === null);
check('leer → Default', suggestPrimarySlot([]).slot === DEFAULT_SLOT);
check('unbekannte ID → Default', suggestPrimarySlot(['gibt-es-nicht']).slot === DEFAULT_SLOT);

console.log('— expandSlots —');
check('1x morning', JSON.stringify(expandSlots('morning', 1)) === '["morning"]');
check('2x morning → morning+evening', JSON.stringify(expandSlots('morning', 2)) === '["morning","evening"]');
check('2x evening → morning+evening', JSON.stringify(expandSlots('evening', 2)) === '["morning","evening"]');
check('2x fasted → fasted+evening', JSON.stringify(expandSlots('fasted', 2)) === '["fasted","evening"]');
check('3x morning → morning+midday+evening', JSON.stringify(expandSlots('morning', 3)) === '["morning","midday","evening"]');
check('3x fasted → fasted+midday+evening', JSON.stringify(expandSlots('fasted', 3)) === '["fasted","midday","evening"]');
check('0 wird 1', expandSlots('morning', 0).length === 1);
check('7 wird 3', expandSlots('morning', 7).length === 3);
check('Reihenfolge folgt SLOT_ORDER', JSON.stringify(expandSlots('evening', 3)) === '["morning","midday","evening"]');

console.log('— substanceIdsFromDetails —');
const ids = substanceIdsFromDetails([
  { name: 'Magnesiumcitrat', amount: '300', unit: 'mg', form: null },
  { name: 'Eisen(II)-bisglycinat', amount: '14', unit: 'mg', form: null },
  { name: 'Magnesium', amount: '50', unit: 'mg', form: null },
]);
check('erkennt magnesium und iron, ohne Duplikate', JSON.stringify(ids) === '["magnesium","iron"]');
check('leere Liste → []', substanceIdsFromDetails([]).length === 0);
check('undefined → []', substanceIdsFromDetails(undefined).length === 0);

console.log('— suggestSlots —');
const combo = suggestSlots({ substanceIds: ['iron'], timesPerDay: 2 });
check('iron 2x → fasted+evening mit reason', JSON.stringify(combo.slots) === '["fasted","evening"]' && combo.reason?.key === 'guidance');
check('ohne Angaben → morning ohne reason', JSON.stringify(suggestSlots().slots) === '["morning"]' && suggestSlots().reason === null);

if (failures > 0) {
  console.error(`\n${failures} Test(s) fehlgeschlagen`);
  process.exit(1);
}
console.log('\nSlotSuggestion: alle Tests bestanden');
```

- [ ] **Step 2: Test laufen lassen, Fehlschlag sehen**

Run: `npm test 2>&1 | grep -A3 "slot-suggestion"`
Expected: Bundling-Fehler "Could not resolve ../SlotSuggestion".

- [ ] **Step 3: Modul schreiben**

`SlotSuggestion.js`:

```js
/**
 * SlotSuggestion.js
 * Vorschlag des Einnahmezeitpunkts fuer ein neues Praeparat und Ableitung
 * der Tages-Slots aus der Haeufigkeit (1x, 2x, 3x).
 *
 * Reine Logik ohne Store und UI. Der Vorschlag ist eine Voreinstellung im
 * Formular, keine Empfehlung: Er entsteht nur aus Saetzen, die in
 * data/interactions.js (INTAKE_GUIDANCE) oder data/substances.js
 * (fatSoluble + sources) mit Quelle stehen. Ohne Regel bleibt es beim
 * Standard 'morning' mit reason null, und die Oberflaeche sagt das so.
 */

import { getIntakeGuidance } from './InteractionCheck';
import { extractPositions } from './StackAnalyzer';
import { SLOT_ORDER } from './TimingEngine';
import { localizeIntakeNote } from './data/localize';
import { getSubstance, normalizeSources } from './data/substances';
import { tr } from './i18n/runtime';

export const DEFAULT_SLOT = 'morning';

/**
 * Uebersetzung belegter Einnahme-Hinweise in einen Slot. Jede Zeile
 * traegt den Satz aus INTAKE_GUIDANCE, der sie rechtfertigt; ein Test
 * prueft, dass die Regel dort mit Quelle existiert.
 *
 *   iron       "Eisen wird nüchtern am besten aufgenommen"        → fasted
 *   melatonin  "üblicherweise kurz vor dem Zubettgehen eingesetzt" → evening
 *   caffeine   "Einnahme am späteren Tag kann den Schlaf
 *               beeinträchtigen"                                    → morning
 *
 * psyllium (viel trinken) und creatine (Zeitpunkt zweitrangig) haben
 * Hinweise ohne Zeitpunkt und stehen deshalb bewusst nicht hier.
 */
export const SLOT_BY_GUIDANCE = {
  iron: 'fasted',
  melatonin: 'evening',
  caffeine: 'morning',
};

/** Erkannte Substanz-IDs aus der Zutatenliste, ohne Duplikate. */
export function substanceIdsFromDetails(ingredientDetails) {
  if (!Array.isArray(ingredientDetails) || ingredientDetails.length === 0) return [];
  const ids = [];
  for (const position of extractPositions({ ingredientDetails })) {
    const id = position.match?.matched ? position.match.substanceId : null;
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

/**
 * suggestPrimarySlot(substanceIds) => { slot, reason }
 * Prioritaet: Einnahme-Hinweis mit Zeitpunkt, dann fettloeslich, dann
 * Standard. reason: null | { key, substanceId, text, sources }.
 */
export function suggestPrimarySlot(substanceIds = []) {
  const ids = Array.isArray(substanceIds) ? substanceIds : [];

  for (const id of ids) {
    const slot = SLOT_BY_GUIDANCE[id];
    if (!slot) continue;
    const guidance = getIntakeGuidance(id);
    if (guidance?.note && Array.isArray(guidance.sources) && guidance.sources.length > 0) {
      return {
        slot,
        reason: {
          key: 'guidance',
          substanceId: id,
          text: localizeIntakeNote(id, guidance.note),
          sources: guidance.sources,
        },
      };
    }
  }

  for (const id of ids) {
    const substance = getSubstance(id);
    if (!substance?.fatSoluble) continue;
    const sources = normalizeSources(substance.sources);
    if (sources.length === 0) continue;
    return {
      slot: DEFAULT_SLOT,
      reason: {
        key: 'fatSoluble',
        substanceId: id,
        text: tr('logic.slotSuggestion.fatSoluble', { name: substance.name }),
        sources,
      },
    };
  }

  return { slot: DEFAULT_SLOT, reason: null };
}

/**
 * expandSlots(primarySlot, timesPerDay) => string[]
 * 1x: der Vorschlag. 2x: Vorschlag + Abend (ist der Vorschlag der Abend:
 * Morgen + Abend). 3x: Morgen, Mittag, Abend; ist der Vorschlag
 * "nuechtern", ersetzt er den Morgen. Ergebnis in SLOT_ORDER-Reihenfolge.
 */
export function expandSlots(primarySlot, timesPerDay = 1) {
  const primary = SLOT_ORDER.includes(primarySlot) ? primarySlot : DEFAULT_SLOT;
  const times = Math.min(3, Math.max(1, Number.parseInt(timesPerDay, 10) || 1));

  let slots;
  if (times === 1) {
    slots = [primary];
  } else if (times === 2) {
    slots = primary === 'evening' ? ['morning', 'evening'] : [primary, 'evening'];
  } else {
    slots = primary === 'fasted' ? ['fasted', 'midday', 'evening'] : ['morning', 'midday', 'evening'];
  }
  return SLOT_ORDER.filter((id) => slots.includes(id));
}

/** suggestSlots({ substanceIds, timesPerDay }) => { slots, reason } */
export function suggestSlots({ substanceIds = [], timesPerDay = 1 } = {}) {
  const { slot, reason } = suggestPrimarySlot(substanceIds);
  return { slots: expandSlots(slot, timesPerDay), reason };
}
```

- [ ] **Step 4: i18n-Saetze ergaenzen**

In `i18n/de/logic.js` innerhalb des exportierten Objekts am Ende ergaenzen:

```js
  // Slot-Vorschlag (SlotSuggestion.js): deskriptiv, keine Anweisung.
  'logic.slotSuggestion.fatSoluble':
    '{name} ist fettlöslich und wird zu einer Mahlzeit mit etwas Fett besser aufgenommen.',
```

In `i18n/en/logic.js` an derselben Stelle:

```js
  'logic.slotSuggestion.fatSoluble':
    '{name} is fat-soluble and is absorbed better with a meal that contains some fat.',
```

- [ ] **Step 5: Test laufen lassen**

Run: `npm test`
Expected: Abschnitt `slot-suggestion.test.mjs` komplett `ok`, Gesamtergebnis `ALLE TESTS BESTANDEN`. Falls `substanceIdsFromDetails` andere IDs liefert als erwartet: `extractPositions` in `StackAnalyzer.js` lesen und den Test an die tatsaechliche Matcher-Ausgabe anpassen, NICHT den Matcher aendern.

- [ ] **Step 6: CLAUDE.md**

In der Tabelle unter "### Fachlogik — liegt bewusst ausserhalb der UI" nach der Zeile `ScheduleGuidance` (falls vorhanden, sonst nach `TimingEngine.js`) ergaenzen:

```
| `SlotSuggestion.js` | Vorschlag des Einnahmezeitpunkts fuer ein neues Praeparat, nur aus belegten Regeln (INTAKE_GUIDANCE, fatSoluble), plus Ableitung der Slots aus der Haeufigkeit 1x/2x/3x. Ohne Regel Standard morgens mit `reason: null` |
```

- [ ] **Step 7: Commit**

```bash
git add SlotSuggestion.js tests/slot-suggestion.test.mjs i18n/de/logic.js i18n/en/logic.js CLAUDE.md
git commit -m "feat(add): SlotSuggestion mit belegten Regeln und Haeufigkeits-Ableitung"
```

---

### Task 2: Komponenten ProductSummaryCard, FrequencyChips, SlotChips

**Files:**
- Create: `components/ProductSummaryCard.jsx`
- Create: `components/FrequencyChips.jsx`
- Create: `components/SlotChips.jsx`
- Modify: `i18n/de/addSupplement.js`, `i18n/en/addSupplement.js` (neue Schluessel ergaenzen; alte bleiben bis Task 3)

**Interfaces:**
- Consumes: `SLOT_ORDER`, `getSlot(slotId)` aus `TimingEngine.js` (`getSlot` liefert `{ label, time }` in aktiver Sprache); `reason` aus Task 1 (`{ text, sources }` oder `null`); Tokens `colors, radius, space, surfaces, type` aus `theme.js`.
- Produces:
  - `<ProductSummaryCard name brand ingredientDetails dosage scanned onEdit />`
  - `<FrequencyChips value onChange />` (value 1 | 2 | 3)
  - `<SlotChips selected onToggle reason showSuggestion />`

- [ ] **Step 1: i18n-Schluessel ergaenzen**

In `i18n/de/addSupplement.js` am Ende des Objekts:

```js
  // Neuer Screen "Aufnehmen" (Spec 2026-08-30-praeparat-aufnehmen)
  'addSupplement.scanHint': 'Aus dem Etikett erkannt, bitte prüfen.',
  'addSupplement.product.change': 'Ändern',
  'addSupplement.product.noDetails': 'Inhaltsstoffe noch nicht erfasst.',
  'addSupplement.frequency.title': 'Wie oft am Tag?',
  'addSupplement.frequency.times': '{count}×',
  'addSupplement.slot.title': 'Wann?',
  'addSupplement.slot.default': 'Standard: morgens. Jederzeit änderbar.',
  'addSupplement.slot.suggestion': 'Vorschlag: {text} ({source})',
  'addSupplement.slot.none': 'Bitte mindestens eine Einnahmezeit wählen.',
```

In `i18n/en/addSupplement.js`:

```js
  'addSupplement.scanHint': 'Read from the label, please check.',
  'addSupplement.product.change': 'Change',
  'addSupplement.product.noDetails': 'Ingredients not captured yet.',
  'addSupplement.frequency.title': 'How often per day?',
  'addSupplement.frequency.times': '{count}×',
  'addSupplement.slot.title': 'When?',
  'addSupplement.slot.default': 'Default: morning. Can be changed any time.',
  'addSupplement.slot.suggestion': 'Suggestion: {text} ({source})',
  'addSupplement.slot.none': 'Please select at least one intake time.',
```

- [ ] **Step 2: ProductSummaryCard**

`components/ProductSummaryCard.jsx`:

```jsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTranslation } from '../i18n';
import { colors, space, surfaces, type } from '../theme';

/**
 * Produktkarte oben auf dem Screen "Aufnehmen": zeigt, was die App schon
 * weiss (Name, Marke, Inhaltsstoffe je Portion). "Aendern" klappt im
 * Screen die Felder auf. Beim Foto-Scan steht eine Pruefzeile darueber.
 */
export default function ProductSummaryCard({
  name,
  brand,
  ingredientDetails = [],
  dosage,
  scanned = false,
  onEdit,
}) {
  const { t } = useTranslation();
  const details = Array.isArray(ingredientDetails)
    ? ingredientDetails.filter((detail) => detail?.name).slice(0, 4)
    : [];
  const detailLine = details
    .map((detail) => {
      const amount = [detail.amount, detail.unit].filter(Boolean).join(' ');
      const form = detail.form ? ` (${detail.form})` : '';
      return amount ? `${amount} ${detail.name}${form}` : `${detail.name}${form}`;
    })
    .join(' · ');
  const dosageLine =
    dosage?.amount && dosage?.unit ? `${dosage.amount} ${dosage.unit}` : null;

  return (
    <View>
      {scanned ? <Text style={styles.scanHint}>{t('addSupplement.scanHint')}</Text> : null}
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titles}>
            <Text style={styles.name}>{name}</Text>
            {brand ? <Text style={styles.brand}>{brand}</Text> : null}
          </View>
          {onEdit ? (
            <Pressable onPress={onEdit} style={styles.edit} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.editText}>{t('addSupplement.product.change')}</Text>
              <Feather name="edit-2" size={14} color={colors.accent} />
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.details}>
          {detailLine || dosageLine || t('addSupplement.product.noDetails')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scanHint: { ...type.small, marginBottom: space.sm },
  card: { ...surfaces.card, padding: space.lg },
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  titles: { flex: 1, paddingRight: space.md },
  name: { ...type.subheading },
  brand: { ...type.small, marginTop: 2 },
  edit: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  editText: { ...type.small, color: colors.accent },
  details: { ...type.body, marginTop: space.sm },
});
```

- [ ] **Step 3: FrequencyChips**

`components/FrequencyChips.jsx`:

```jsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../i18n';
import { space, surfaces, type } from '../theme';

const OPTIONS = [1, 2, 3];

/** Frage 1 auf dem Screen "Aufnehmen": 1x, 2x oder 3x am Tag. */
export default function FrequencyChips({ value = 1, onChange }) {
  const { t } = useTranslation();
  return (
    <View style={styles.block}>
      <Text style={styles.title}>{t('addSupplement.frequency.title')}</Text>
      <View style={styles.row}>
        {OPTIONS.map((count) => {
          const active = value === count;
          return (
            <Pressable
              key={count}
              onPress={() => onChange(count)}
              style={[styles.chip, active && surfaces.chipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[surfaces.chipText, active && surfaces.chipTextActive]}>
                {t('addSupplement.frequency.times', { count })}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: space.xl },
  title: { ...type.subheading, marginBottom: space.md },
  row: { flexDirection: 'row', gap: space.sm },
  chip: { ...surfaces.chip, minWidth: 64, alignItems: 'center' },
});
```

- [ ] **Step 4: SlotChips**

`components/SlotChips.jsx`:

```jsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SLOT_ORDER, getSlot } from '../TimingEngine';
import { useTranslation } from '../i18n';
import { colors, space, surfaces, type } from '../theme';

/**
 * Frage 2 auf dem Screen "Aufnehmen": Tages-Slots als Chips, ohne Emojis,
 * darunter die Begruendung des Vorschlags (SlotSuggestion.js) oder der
 * Hinweis "Standard". Mehrfachauswahl; die Mindestzahl 1 prueft der Screen.
 */
export default function SlotChips({ selected = [], onToggle, reason = null, showSuggestion = true }) {
  const { t } = useTranslation();
  const sourceLabel = reason?.sources?.[0]?.label ?? '';

  return (
    <View style={styles.block}>
      <Text style={styles.title}>{t('addSupplement.slot.title')}</Text>
      <View style={styles.wrap}>
        {SLOT_ORDER.map((slotId) => {
          const slot = getSlot(slotId);
          const active = selected.includes(slotId);
          return (
            <Pressable
              key={slotId}
              onPress={() => onToggle(slotId)}
              style={[styles.chip, active && surfaces.chipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${slot.label}, ${slot.time}`}
            >
              <Text style={[surfaces.chipText, active && surfaces.chipTextActive]}>{slot.label}</Text>
              <Text style={[styles.time, active && surfaces.chipTextActive]}>{slot.time}</Text>
            </Pressable>
          );
        })}
      </View>
      {showSuggestion ? (
        <Text style={styles.reason}>
          {reason
            ? t('addSupplement.slot.suggestion', { text: reason.text, source: sourceLabel })
            : t('addSupplement.slot.default')}
        </Text>
      ) : null}
      {selected.length === 0 ? <Text style={styles.warning}>{t('addSupplement.slot.none')}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: space.xl },
  title: { ...type.subheading, marginBottom: space.md },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { ...surfaces.chip, alignItems: 'center' },
  time: { ...type.tiny, marginTop: 2 },
  reason: { ...type.small, marginTop: space.md },
  warning: { ...type.small, color: colors.caution, marginTop: space.sm },
});
```

Hinweis fuer den Implementierer: `surfaces.chip`, `surfaces.chipActive`, `surfaces.chipText`, `surfaces.chipTextActive` existieren in `theme.js` (Zeilen um 237 bis 245). Falls ein Name abweicht, `theme.js` lesen und den vorhandenen verwenden, keine neuen Hex-Werte anlegen.

- [ ] **Step 5: Syntax und Tests**

Run: `for f in components/ProductSummaryCard.jsx components/FrequencyChips.jsx components/SlotChips.jsx; do npx esbuild "$f" --loader:.jsx=jsx --log-level=error --outfile=/dev/null; done; npm test`
Expected: keine esbuild-Fehler, `ALLE TESTS BESTANDEN` (i18n-Parity gruen).

- [ ] **Step 6: Commit**

```bash
git add components/ProductSummaryCard.jsx components/FrequencyChips.jsx components/SlotChips.jsx i18n/de/addSupplement.js i18n/en/addSupplement.js
git commit -m "feat(add): Produktkarte, Haeufigkeits- und Slot-Chips fuer den Screen Aufnehmen"
```

---

### Task 3: app/AddSupplement.jsx neu schreiben (vier Einstiege)

**Files:**
- Rewrite: `app/AddSupplement.jsx`
- Modify: `i18n/de/addSupplement.js`, `i18n/en/addSupplement.js` (Schluessel fuer den neuen Screen ergaenzen, ungenutzte alte entfernen)

**Interfaces:**
- Consumes: Task 1 (`suggestPrimarySlot`, `expandSlots`, `substanceIdsFromDetails`, `DEFAULT_SLOT`), Task 2 (drei Komponenten), Store-Aktionen wie heute (`addUserSupplement`, `updateUserSupplement`, `addSupplementFromPendingScan`, `clearPendingScanResult`, `pendingScanResult`, `userSupplements`, `entitlement`, `setStock`, `getStock`), `canAddSupplement`, `canUseProFeature` aus `Entitlements.js`, `ProGate` aus `components/ProGate.jsx`, `getDosageAmount`, `getDosageUnit` aus `utils/supplementFormatting.js`.
- Produces: Route `/AddSupplement` mit Parametern `?fromScan=1` (Entwurf aus `pendingScanResult`) und `?editId=<id>`; ohne Parameter manuelle Eingabe. Payload-Form unveraendert (siehe Global Constraints).

- [ ] **Step 1: Vorab pruefen, welche alten Schluessel woanders genutzt werden**

Run: `grep -rn "addSupplement\." app components *.js --include=*.js --include=*.jsx | grep -v "^app/AddSupplement.jsx" | grep -v "^i18n/"`
Expected: Liste (vermutlich leer oder nur `results.jsx`). Jeder dort genutzte Schluessel bleibt in beiden Sprachdateien erhalten.

- [ ] **Step 2: i18n neu ordnen**

In `i18n/de/addSupplement.js` folgende Schluessel ERGAENZEN:

```js
  'addSupplement.title.new': 'Praeparat aufnehmen'.replace('ae', 'ä'),
```

Nein, keine Ersetzungen im Code; die Datei traegt echte Umlaute. Ergaenzen:

```js
  'addSupplement.title.new': 'Präparat aufnehmen',
  'addSupplement.title.edit': 'Präparat bearbeiten',
  'addSupplement.name.label': 'Name',
  'addSupplement.name.placeholder': 'z. B. Magnesium Bisglycinat',
  'addSupplement.amount.label': 'Menge je Einnahme',
  'addSupplement.amount.placeholder': 'z. B. 1',
  'addSupplement.unit.label': 'Einheit',
  'addSupplement.unit.capsule': 'Kapsel',
  'addSupplement.unit.tablet': 'Tablette',
  'addSupplement.unit.mg': 'mg',
  'addSupplement.unit.drops': 'Tropfen',
  'addSupplement.unit.ml': 'ml',
  'addSupplement.unit.portion': 'Portion',
  'addSupplement.unit.other': 'Andere',
  'addSupplement.unit.otherPlaceholder': 'z. B. IE, g, Beutel',
  'addSupplement.more.title': 'Mehr Angaben',
  'addSupplement.more.subtitle': 'Packung, Preis, Kur, Notiz. Alles freiwillig.',
  'addSupplement.more.packageUnits': 'Inhalt der Packung',
  'addSupplement.more.packageUnitsPlaceholder': '120',
  'addSupplement.more.price': 'Kaufpreis in Euro',
  'addSupplement.more.pricePlaceholder': '19,90',
  'addSupplement.more.cure': 'Kur-Zyklus',
  'addSupplement.more.cureSubtitle': 'Einnahmetage und Pausentage im Wechsel.',
  'addSupplement.more.cureOn': 'Einnahmetage',
  'addSupplement.more.cureOff': 'Pausentage',
  'addSupplement.more.notes': 'Notiz',
  'addSupplement.more.notesPlaceholder': 'Optional',
  'addSupplement.save.new': 'Zum Tagesplan hinzufügen',
  'addSupplement.save.edit': 'Speichern',
```

EN in `i18n/en/addSupplement.js`:

```js
  'addSupplement.title.new': 'Add supplement',
  'addSupplement.title.edit': 'Edit supplement',
  'addSupplement.name.label': 'Name',
  'addSupplement.name.placeholder': 'e.g. Magnesium bisglycinate',
  'addSupplement.amount.label': 'Amount per intake',
  'addSupplement.amount.placeholder': 'e.g. 1',
  'addSupplement.unit.label': 'Unit',
  'addSupplement.unit.capsule': 'Capsule',
  'addSupplement.unit.tablet': 'Tablet',
  'addSupplement.unit.mg': 'mg',
  'addSupplement.unit.drops': 'Drops',
  'addSupplement.unit.ml': 'ml',
  'addSupplement.unit.portion': 'Serving',
  'addSupplement.unit.other': 'Other',
  'addSupplement.unit.otherPlaceholder': 'e.g. IU, g, sachet',
  'addSupplement.more.title': 'More details',
  'addSupplement.more.subtitle': 'Package, price, cycle, note. All optional.',
  'addSupplement.more.packageUnits': 'Package content',
  'addSupplement.more.packageUnitsPlaceholder': '120',
  'addSupplement.more.price': 'Purchase price in euro',
  'addSupplement.more.pricePlaceholder': '19.90',
  'addSupplement.more.cure': 'Cycle',
  'addSupplement.more.cureSubtitle': 'Intake days and pause days in turn.',
  'addSupplement.more.cureOn': 'Intake days',
  'addSupplement.more.cureOff': 'Pause days',
  'addSupplement.more.notes': 'Note',
  'addSupplement.more.notesPlaceholder': 'Optional',
  'addSupplement.save.new': 'Add to daily plan',
  'addSupplement.save.edit': 'Save',
```

BEHALTEN (werden weiter genutzt): `addSupplement.alert.nameMissingTitle/Message`, `addSupplement.alert.slotMissingTitle/Message`, `addSupplement.alert.notFoundTitle/Message`, `addSupplement.alert.cureInvalidTitle/Message`, `addSupplement.alert.limitTitle/Message/Action`, `addSupplement.defaultPurpose`, `addSupplement.defaultCategory`, `addSupplement.scan.warningsNote`, plus alle Schluessel aus Task 2.

ENTFERNEN in DE und EN (nur wenn Step 1 sie nirgends sonst zeigt): `screenTitle.*`, `screenSubtitle.*`, `primaryButton.*`, `modeLabel.*`, `modePill.*`, `trustTitle`, `trustCopy.*`, `nameLabel`, `nameHelper`, `namePlaceholder`, `purposeLabel/Helper/Placeholder`, `categoryLabel/Helper/Placeholder/Examples`, `amountLabel/Helper/Placeholder`, `unitLabel/Helper/Placeholder`, `packageUnitsLabel/Helper/Placeholder`, `priceLabel/Helper/Placeholder`, `routineSectionTitle/Subtitle`, `selectedSlots`, `noSlotSelected`, `timingLabel/Helper/Placeholder`, `childSafeTitle/Subtitle`, `notesLabel/Helper/Placeholder`, `alert.updatedTitle/Message`, `alert.savedTitle`, `alert.savedScanMessage`, `alert.savedManualMessage`, `alert.goToDashboard`, `scan.purpose`, `scan.category`, `scan.brandNote`, `scan.ingredientsNote`, `scan.timingNote`, `cureTitle`, `cureSubtitle`, `cureOnLabel/Helper`, `cureOffLabel/Helper`.

- [ ] **Step 3: Screen neu schreiben**

`app/AddSupplement.jsx` vollstaendig ersetzen:

```jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { canAddSupplement, canUseProFeature } from '../Entitlements';
import { SLOT_ORDER } from '../TimingEngine';
import { DEFAULT_SLOT, expandSlots, substanceIdsFromDetails, suggestPrimarySlot } from '../SlotSuggestion';
import FrequencyChips from '../components/FrequencyChips';
import ProductSummaryCard from '../components/ProductSummaryCard';
import ProGate from '../components/ProGate';
import SlotChips from '../components/SlotChips';
import { useTranslation } from '../i18n';
import { colors, radius, space, surfaces, type } from '../theme';
import useStore from '../useStore';
import { getDosageAmount, getDosageUnit } from '../utils/supplementFormatting';

// Einheiten-Chips fuer die manuelle Eingabe. Der gespeicherte Wert ist der
// deutsche Fachbegriff bzw. das Kuerzel, wie er bisher frei eingetippt
// wurde; nur das Label laeuft ueber i18n.
const UNIT_OPTIONS = [
  { value: 'Kapsel', key: 'capsule' },
  { value: 'Tablette', key: 'tablet' },
  { value: 'mg', key: 'mg' },
  { value: 'Tropfen', key: 'drops' },
  { value: 'ml', key: 'ml' },
  { value: 'Portion', key: 'portion' },
];

/**
 * Screen "Aufnehmen": Produktkarte (oder Felder bei manueller Eingabe),
 * zwei Fragen (wie oft, wann), eingeklappt "Mehr Angaben", ein Knopf.
 * Vier Einstiege ueber Parameter: ?fromScan=1 (Katalog, Barcode, Foto),
 * ?editId=<id> (Bearbeiten), ohne Parameter manuell.
 *
 * Keine Fachlogik hier: Vorschlag und Slot-Ableitung kommen aus
 * SlotSuggestion.js, die Free-Grenze aus Entitlements.js.
 */
export default function AddSupplement() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();

  const addUserSupplement = useStore((state) => state.addUserSupplement);
  const updateUserSupplement = useStore((state) => state.updateUserSupplement);
  const addSupplementFromPendingScan = useStore((state) => state.addSupplementFromPendingScan);
  const clearPendingScanResult = useStore((state) => state.clearPendingScanResult);
  const pendingScanResult = useStore((state) => state.pendingScanResult);
  const userSupplements = useStore((state) => state.userSupplements);
  const entitlement = useStore((state) => state.entitlement);
  const setStock = useStore((state) => state.setStock);
  const getStock = useStore((state) => state.getStock);

  const editIdParam = Array.isArray(params.editId) ? params.editId[0] : params.editId;
  const fromScanParam = Array.isArray(params.fromScan) ? params.fromScan[0] : params.fromScan;
  const editId = typeof editIdParam === 'string' && editIdParam.length > 0 ? editIdParam : null;
  const existingSupplement = editId
    ? userSupplements.find((supplement) => supplement.id === editId)
    : null;
  const fromScan = !editId && fromScanParam === '1' && Boolean(pendingScanResult);
  const isManual = !editId && !fromScan;

  // Produkt
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');
  const [unitOther, setUnitOther] = useState(false);
  const [editingProduct, setEditingProduct] = useState(false);

  // Zwei Fragen
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [selectedSlots, setSelectedSlots] = useState([DEFAULT_SLOT]);
  const [primarySlot, setPrimarySlot] = useState(DEFAULT_SLOT);
  const [reason, setReason] = useState(null);

  // Mehr Angaben
  const [moreOpen, setMoreOpen] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [packageUnits, setPackageUnits] = useState('');
  const [cureEnabled, setCureEnabled] = useState(false);
  const [cureOnDays, setCureOnDays] = useState('');
  const [cureOffDays, setCureOffDays] = useState('');
  const [notes, setNotes] = useState('');

  // Zutatenliste: beim Entwurf aus dem Scan/Katalog, beim Bearbeiten aus
  // dem Datensatz, bei manueller Eingabe aus Name/Menge/Einheit abgeleitet,
  // damit Matcher und Vorschlag den Namen versuchen koennen.
  const ingredientDetails = useMemo(() => {
    if (editId) {
      return Array.isArray(existingSupplement?.ingredientDetails) ? existingSupplement.ingredientDetails : [];
    }
    if (fromScan && Array.isArray(pendingScanResult?.ingredientDetails) && pendingScanResult.ingredientDetails.length > 0) {
      return pendingScanResult.ingredientDetails;
    }
    const trimmed = name.trim();
    return trimmed ? [{ name: trimmed, amount: amount.trim(), unit: unit.trim(), form: null }] : [];
  }, [editId, existingSupplement, fromScan, pendingScanResult, name, amount, unit]);

  // Bearbeiten: alles vorbelegen, kein Vorschlag, die gespeicherten Slots gelten.
  useEffect(() => {
    if (!existingSupplement) return;
    setName(existingSupplement.name || '');
    setAmount(getDosageAmount(existingSupplement, ''));
    const existingUnit = getDosageUnit(existingSupplement, '');
    setUnit(existingUnit);
    setUnitOther(Boolean(existingUnit) && !UNIT_OPTIONS.some((option) => option.value === existingUnit));
    const slots = Array.isArray(existingSupplement.timingSlots) && existingSupplement.timingSlots.length > 0
      ? existingSupplement.timingSlots
      : [DEFAULT_SLOT];
    setSelectedSlots(slots);
    setPrimarySlot(slots[0]);
    setTimesPerDay(Math.min(3, Math.max(1, slots.length)));
    setReason(null);
    setNotes(existingSupplement.notes || '');
    if (existingSupplement.cureConfig?.type === 'cycle') {
      setCureEnabled(true);
      setCureOnDays(String(existingSupplement.cureConfig.onDays ?? ''));
      setCureOffDays(String(existingSupplement.cureConfig.offDays ?? ''));
    } else {
      setCureEnabled(false);
      setCureOnDays('');
      setCureOffDays('');
    }
    const stock = getStock(existingSupplement.id);
    const price = Number(stock?.purchasePrice);
    const units = Number(stock?.packageUnits);
    setPurchasePrice(Number.isFinite(price) && price > 0 ? String(price) : '');
    setPackageUnits(Number.isFinite(units) && units > 0 ? String(units) : '');
    setMoreOpen(
      Boolean(existingSupplement.notes) ||
        existingSupplement.cureConfig?.type === 'cycle' ||
        (Number.isFinite(price) && price > 0) ||
        (Number.isFinite(units) && units > 0)
    );
  }, [existingSupplement, getStock]);

  // Entwurf aus Scan/Katalog: Name, Menge, Einheit uebernehmen; Warnhinweise
  // des Scans in die Notiz, damit sie nicht verloren gehen.
  useEffect(() => {
    if (!fromScan) return;
    setName(pendingScanResult.productName || pendingScanResult.name || '');
    const scannedAmount = pendingScanResult?.dosage?.amount ?? pendingScanResult?.dosageAmount ?? pendingScanResult?.amount ?? '';
    const scannedUnit = pendingScanResult?.dosage?.unit ?? pendingScanResult?.dosageUnit ?? pendingScanResult?.unit ?? '';
    setAmount(scannedAmount === null || scannedAmount === undefined ? '' : String(scannedAmount));
    setUnit(scannedUnit === null || scannedUnit === undefined ? '' : String(scannedUnit));
    const warnings = Array.isArray(pendingScanResult.warnings) ? pendingScanResult.warnings : [];
    setNotes(
      [
        warnings.length > 0 ? t('addSupplement.scan.warningsNote', { warnings: warnings.join('\n- ') }) : null,
        pendingScanResult.uncertaintyNote || null,
      ]
        .filter(Boolean)
        .join('\n\n')
    );
  }, [fromScan, pendingScanResult, t]);

  // Vorschlag: sobald sich die erkannten Substanzen aendern (Entwurf geladen
  // oder manueller Name getippt). Nicht beim Bearbeiten.
  const substanceKey = useMemo(() => substanceIdsFromDetails(ingredientDetails).join('|'), [ingredientDetails]);
  useEffect(() => {
    if (editId) return;
    const suggestion = suggestPrimarySlot(substanceKey ? substanceKey.split('|') : []);
    setPrimarySlot(suggestion.slot);
    setReason(suggestion.reason);
    setSelectedSlots(expandSlots(suggestion.slot, timesPerDay));
    // timesPerDay absichtlich nicht in den Abhaengigkeiten: Die Haeufigkeit
    // hat ihren eigenen Handler, sonst wuerde jede Chip-Wahl den Vorschlag
    // neu setzen und eine manuelle Slot-Auswahl ueberschreiben.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, substanceKey]);

  // Ein verwaister Entwurf (Screen ohne fromScan geoeffnet) wird geraeumt.
  useEffect(() => {
    if (!fromScan && !editId && pendingScanResult) clearPendingScanResult();
  }, [clearPendingScanResult, editId, fromScan, pendingScanResult]);

  function handleTimesPerDay(count) {
    setTimesPerDay(count);
    setSelectedSlots(expandSlots(primarySlot, count));
  }

  function toggleSlot(slotId) {
    setSelectedSlots((current) => {
      const next = current.includes(slotId) ? current.filter((id) => id !== slotId) : [...current, slotId];
      return SLOT_ORDER.filter((id) => next.includes(id));
    });
  }

  function pickUnit(option) {
    if (option === 'other') {
      setUnitOther(true);
      setUnit('');
      return;
    }
    setUnitOther(false);
    setUnit(option.value);
  }

  /**
   * Kaufpreis und Packungsinhalt liegen im Bestand (stockBySupplementId),
   * dort rechnet die Kostenanalyse. Leere Felder loeschen den Wert, statt
   * einen alten Preis stehen zu lassen.
   */
  function persistPurchaseInfo(supplementId) {
    if (!supplementId) return;
    const priceText = purchasePrice.trim().replace(',', '.');
    const unitsText = packageUnits.trim();
    const price = Number(priceText);
    const units = Number.parseInt(unitsText, 10);
    const current = getStock(supplementId) ?? {};
    const next = { ...current };
    if (priceText && Number.isFinite(price) && price > 0) {
      next.purchasePrice = price;
      next.currency = current.currency || 'EUR';
    } else {
      delete next.purchasePrice;
    }
    if (unitsText && Number.isInteger(units) && units > 0) {
      next.packageUnits = units;
    } else {
      delete next.packageUnits;
    }
    if (Object.keys(next).length === 0 && Object.keys(current).length === 0) return;
    setStock(supplementId, next);
  }

  function handleSave() {
    if (!editId) {
      const activeCount = userSupplements.filter((supplement) => supplement.status !== 'archived').length;
      const gate = canAddSupplement(entitlement, activeCount);
      if (!gate.allowed) {
        Alert.alert(
          t('addSupplement.alert.limitTitle'),
          t('addSupplement.alert.limitMessage', { limit: gate.limit }),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('addSupplement.alert.limitAction'), onPress: () => router.push('/paywall') },
          ]
        );
        return;
      }
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert(t('addSupplement.alert.nameMissingTitle'), t('addSupplement.alert.nameMissingMessage'));
      return;
    }
    if (selectedSlots.length === 0) {
      Alert.alert(t('addSupplement.alert.slotMissingTitle'), t('addSupplement.alert.slotMissingMessage'));
      return;
    }

    let cureConfig = null;
    let cureStartDate = existingSupplement?.cureStartDate || null;
    if (cureEnabled) {
      const onDays = Number.parseInt(cureOnDays, 10);
      const offDays = Number.parseInt(cureOffDays, 10);
      if (!Number.isInteger(onDays) || onDays < 1 || !Number.isInteger(offDays) || offDays < 1) {
        Alert.alert(t('addSupplement.alert.cureInvalidTitle'), t('addSupplement.alert.cureInvalidMessage'));
        return;
      }
      cureConfig = { type: 'cycle', onDays, offDays };
      if (!cureStartDate) cureStartDate = new Date().toISOString();
    } else {
      cureStartDate = null;
    }

    // Felder, die der Screen nicht mehr zeigt, bleiben beim Bearbeiten
    // erhalten und bekommen beim Anlegen die bisherigen Standardwerte.
    const payload = {
      name: trimmedName,
      purpose: existingSupplement?.purpose || t('addSupplement.defaultPurpose'),
      category: existingSupplement?.category || t('addSupplement.defaultCategory'),
      timingSlots: selectedSlots,
      timingRaw: existingSupplement?.timingRaw || '',
      dosage: { amount: amount.trim(), unit: unit.trim() },
      ingredientDetails,
      childSafe: Boolean(existingSupplement?.childSafe),
      conflictIds: [],
      conflictTags: [],
      synergyIds: [],
      stock: null,
      cureConfig,
      cureStartDate,
      notes: notes.trim(),
    };

    if (editId) {
      if (!existingSupplement) {
        Alert.alert(t('addSupplement.alert.notFoundTitle'), t('addSupplement.alert.notFoundMessage'));
        return;
      }
      updateUserSupplement(editId, payload);
      persistPurchaseInfo(editId);
      router.back();
      return;
    }

    const created = fromScan
      ? addSupplementFromPendingScan(payload)
      : addUserSupplement({ ...payload, source: 'manual' });
    persistPurchaseInfo(created?.id);
    // Keine Bestaetigung per Alert: Der neue Eintrag im Tagesplan ist die
    // Bestaetigung.
    router.replace('/Dashboard');
  }

  const cureLocked = !canUseProFeature(entitlement).allowed && !cureEnabled;
  const showProductFields = isManual || editingProduct;
  const brand = fromScan && pendingScanResult?.brand && pendingScanResult.brand !== 'Demo Brand' ? pendingScanResult.brand : null;

  return (
    <KeyboardAvoidingView style={styles.screenWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t(editId ? 'addSupplement.title.edit' : 'addSupplement.title.new')}</Text>

        {showProductFields ? (
          <View style={styles.productFields}>
            <Field label={t('addSupplement.name.label')} value={name} onChangeText={setName} placeholder={t('addSupplement.name.placeholder')} autoFocus={isManual} />
            <View style={styles.row}>
              <View style={styles.rowField}>
                <Field label={t('addSupplement.amount.label')} value={amount} onChangeText={setAmount} placeholder={t('addSupplement.amount.placeholder')} keyboardType="decimal-pad" />
              </View>
            </View>
            <Text style={styles.label}>{t('addSupplement.unit.label')}</Text>
            <View style={styles.unitWrap}>
              {UNIT_OPTIONS.map((option) => {
                const active = !unitOther && unit === option.value;
                return (
                  <Pressable key={option.key} onPress={() => pickUnit(option)} style={[styles.unitChip, active && surfaces.chipActive]} accessibilityRole="button" accessibilityState={{ selected: active }}>
                    <Text style={[surfaces.chipText, active && surfaces.chipTextActive]}>{t(`addSupplement.unit.${option.key}`)}</Text>
                  </Pressable>
                );
              })}
              <Pressable onPress={() => pickUnit('other')} style={[styles.unitChip, unitOther && surfaces.chipActive]} accessibilityRole="button" accessibilityState={{ selected: unitOther }}>
                <Text style={[surfaces.chipText, unitOther && surfaces.chipTextActive]}>{t('addSupplement.unit.other')}</Text>
              </Pressable>
            </View>
            {unitOther ? (
              <TextInput style={styles.input} value={unit} onChangeText={setUnit} placeholder={t('addSupplement.unit.otherPlaceholder')} placeholderTextColor={colors.inkFaint} />
            ) : null}
          </View>
        ) : (
          <ProductSummaryCard
            name={name}
            brand={brand}
            ingredientDetails={ingredientDetails}
            dosage={{ amount, unit }}
            scanned={fromScan && pendingScanResult?.analysisMode === 'vision'}
            onEdit={() => setEditingProduct(true)}
          />
        )}

        <FrequencyChips value={timesPerDay} onChange={handleTimesPerDay} />
        <SlotChips selected={selectedSlots} onToggle={toggleSlot} reason={reason} showSuggestion={!editId} />

        <Pressable onPress={() => setMoreOpen((open) => !open)} style={styles.moreHeader} accessibilityRole="button" accessibilityState={{ expanded: moreOpen }}>
          <View style={styles.moreTitles}>
            <Text style={styles.moreTitle}>{t('addSupplement.more.title')}</Text>
            <Text style={styles.moreSubtitle}>{t('addSupplement.more.subtitle')}</Text>
          </View>
          <Feather name={moreOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.inkMuted} />
        </Pressable>

        {moreOpen ? (
          <View style={styles.moreBody}>
            <View style={styles.row}>
              <View style={styles.rowField}>
                <Field label={t('addSupplement.more.packageUnits')} value={packageUnits} onChangeText={setPackageUnits} placeholder={t('addSupplement.more.packageUnitsPlaceholder')} keyboardType="number-pad" />
              </View>
              <View style={styles.rowSpacer} />
              <View style={styles.rowField}>
                <Field label={t('addSupplement.more.price')} value={purchasePrice} onChangeText={setPurchasePrice} placeholder={t('addSupplement.more.pricePlaceholder')} keyboardType="decimal-pad" />
              </View>
            </View>

            {cureLocked ? (
              <ProGate />
            ) : (
              <View style={styles.switchRow}>
                <View style={styles.switchText}>
                  <Text style={styles.switchTitle}>{t('addSupplement.more.cure')}</Text>
                  <Text style={styles.switchSubtitle}>{t('addSupplement.more.cureSubtitle')}</Text>
                </View>
                <Switch
                  value={cureEnabled}
                  onValueChange={setCureEnabled}
                  trackColor={{ false: colors.rule, true: colors.accent }}
                  thumbColor={cureEnabled ? colors.surface : colors.canvas}
                  accessibilityLabel={t('addSupplement.more.cure')}
                />
              </View>
            )}
            {cureEnabled ? (
              <View style={styles.row}>
                <View style={styles.rowField}>
                  <Field label={t('addSupplement.more.cureOn')} value={cureOnDays} onChangeText={setCureOnDays} placeholder="21" keyboardType="number-pad" />
                </View>
                <View style={styles.rowSpacer} />
                <View style={styles.rowField}>
                  <Field label={t('addSupplement.more.cureOff')} value={cureOffDays} onChangeText={setCureOffDays} placeholder="7" keyboardType="number-pad" />
                </View>
              </View>
            ) : null}

            <Field label={t('addSupplement.more.notes')} value={notes} onChangeText={setNotes} placeholder={t('addSupplement.more.notesPlaceholder')} multiline />
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footerBar}>
        <Pressable style={styles.footerCancel} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('common.cancel')}>
          <Text style={surfaces.buttonQuietText}>{t('common.cancel')}</Text>
        </Pressable>
        <Pressable style={styles.footerConfirm} onPress={handleSave} accessibilityRole="button">
          <Text style={surfaces.buttonPrimaryText}>{t(editId ? 'addSupplement.save.edit' : 'addSupplement.save.new')}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({ label, multiline = false, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholderTextColor={colors.inkFaint}
        multiline={multiline}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrap: { flex: 1, backgroundColor: colors.canvas },
  screen: { flex: 1 },
  content: { ...surfaces.content, paddingBottom: 120 },
  title: { ...type.heading, marginBottom: space.lg },
  productFields: { ...surfaces.card, padding: space.lg },
  field: { marginBottom: space.md },
  label: { ...type.label, marginBottom: space.xs },
  input: { ...surfaces.input },
  inputMultiline: { minHeight: 88, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  rowField: { flex: 1 },
  rowSpacer: { width: space.md },
  unitWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.md },
  unitChip: { ...surfaces.chip },
  moreHeader: { flexDirection: 'row', alignItems: 'center', marginTop: space.xl, paddingVertical: space.md, borderTopWidth: 1, borderTopColor: colors.rule },
  moreTitles: { flex: 1 },
  moreTitle: { ...type.bodyStrong },
  moreSubtitle: { ...type.small, marginTop: 2 },
  moreBody: { marginTop: space.sm },
  switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.md },
  switchText: { flex: 1, paddingRight: space.md },
  switchTitle: { ...type.bodyStrong },
  switchSubtitle: { ...type.small, marginTop: 2 },
  footerBar: {
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  footerCancel: { ...surfaces.buttonQuiet, flex: 1, alignItems: 'center' },
  footerConfirm: { ...surfaces.buttonPrimary, flex: 2, alignItems: 'center', borderRadius: radius.md },
});
```

Hinweise fuer den Implementierer:
- `surfaces.content`, `surfaces.input`, `surfaces.buttonPrimary`, `surfaces.buttonPrimaryText`, `surfaces.buttonQuiet`, `surfaces.buttonQuietText`, `surfaces.chip*` stehen in `theme.js`; vor dem Verwenden die Namen dort pruefen und ggf. angleichen. Keine Hex-Werte einfuehren.
- `type.heading`, `type.label`, `type.bodyStrong`, `type.small`, `type.tiny` existieren.
- Das Modal ist in `app/_layout.jsx` als `Stack.Screen name="AddSupplement"` registriert; Titel/Optionen dort NICHT aendern.
- `pendingScanResult.analysisMode === 'vision'` markiert den Foto-Scan; Katalog (`'seed-catalog'`), Barcode (`'barcode-off'`) und Cache zeigen keine Pruefzeile.

- [ ] **Step 4: Syntax, Tests, ungenutzte Schluessel**

Run: `npx esbuild app/AddSupplement.jsx --loader:.jsx=jsx --log-level=error --outfile=/dev/null && npm test && grep -rn "addSupplement\.\(screenTitle\|trustCopy\|purposeLabel\|childSafeTitle\|cureTitle\)" app components i18n`
Expected: keine esbuild-Fehler, `ALLE TESTS BESTANDEN`, grep ohne Treffer (alte Schluessel weg).

- [ ] **Step 5: Commit**

```bash
git add app/AddSupplement.jsx i18n/de/addSupplement.js i18n/en/addSupplement.js
git commit -m "feat(add): Screen Aufnehmen mit Produktkarte, zwei Fragen und Mehr Angaben"
```

---

### Task 4: Katalog-Treffer springen direkt auf "Aufnehmen"

**Files:**
- Modify: `app/(tabs)/(discover)/search.jsx` (Funktion `handlePickCatalogProduct`, um Zeile 152)
- Modify: `app/(tabs)/(discover)/brands.jsx` (um Zeile 36 bis 40)
- Modify: `docs/superpowers/specs/2026-08-30-praeparat-aufnehmen-design.md` NICHT; stattdessen CLAUDE.md-Abschnitt "Scan-Ergebnisse tragen analysisMode" um einen Satz ergaenzen

**Interfaces:**
- Consumes: Route `/AddSupplement?fromScan=1` aus Task 3; `saveScanResult`, `seedEntryToScanDraft`, `setPendingScanResult` wie heute.
- Produces: nichts Neues.

- [ ] **Step 1: search.jsx**

In `app/(tabs)/(discover)/search.jsx` die Funktion ersetzen:

```js
  // Katalog-Eintrag als Entwurf uebernehmen und direkt auf "Aufnehmen":
  // Die Wirkstoff-Uebersicht (results.jsx) ist die Kontrolle fuer
  // Foto-Scans; ein Katalogprodukt ist bereits geprueft.
  function handlePickCatalogProduct(entry) {
    const storedScan = saveScanResult(seedEntryToScanDraft(entry));
    setPendingScanResult(storedScan);
    router.push('/AddSupplement?fromScan=1');
  }
```

- [ ] **Step 2: brands.jsx**

An der Stelle, die heute `router.push('/results')` nach `setPendingScanResult(storedScan)` aufruft (um Zeile 39), ersetzen durch `router.push('/AddSupplement?fromScan=1');` und den Kommentar darueber um den Satz ergaenzen: `// Direkt auf "Aufnehmen", der Katalogeintrag ist bereits geprueft.`

- [ ] **Step 3: Pruefen, dass results.jsx fuer Scans unveraendert ist**

Run: `grep -n "router.push" "app/(tabs)/(scan)/results.jsx" "app/(tabs)/(scan)/scanner.jsx" | head`
Expected: `results.jsx` fuehrt weiter auf `/AddSupplement?fromScan=1`; `scanner.jsx` fuehrt weiter auf `/results`. Nichts aendern.

- [ ] **Step 4: CLAUDE.md**

Im Abschnitt "Harte Regeln", Punkt "Scan-Ergebnisse tragen `analysisMode`", am Ende ergaenzen: ` Katalog-Treffer (Suche, Markenregister) springen direkt auf den Screen "Aufnehmen" (`/AddSupplement?fromScan=1`); `results.jsx` bleibt der Pruef-Screen fuer Foto- und Barcode-Scans.`

- [ ] **Step 5: Tests und Commit**

Run: `npm test`
Expected: `ALLE TESTS BESTANDEN`.

```bash
git add "app/(tabs)/(discover)/search.jsx" "app/(tabs)/(discover)/brands.jsx" CLAUDE.md
git commit -m "feat(search): Katalog-Treffer direkt auf den Screen Aufnehmen"
```

---

## Self-Review

- Spec 1 (ein Screen, Produktkarte, zwei Fragen, Mehr Angaben, Knopf, Wegfall Hero/Pruefhinweis/Erklaersaetze): Task 3. Abweichung dokumentiert: beim Bearbeiten `router.back()` statt Tagesplan, weil die Nutzerin aus dem Bestand kam.
- Spec 2 (Katalog direkt): Task 4. Scanner-Namenssuche laeuft weiter ueber `results.jsx` (Barcode-/Foto-Pfad), bewusst.
- Spec 3 (Vorschlag aus belegten Regeln, Tabelle mit Test, Mehrfachgabe): Task 1.
- Spec 4 (manuell: Felder statt Karte, Einheiten-Chips): Task 3.
- Spec 5 (Bearbeiten vorausgefuellt, kein Vorschlag): Task 3.
- Spec 6 (Free-Grenze, Pro-Gate Kur): Task 3.
- Spec 7 (Ersteinrichtung unveraendert): kein Task noetig.
- Typen: `reason` ist `{ key, substanceId, text, sources }` in Task 1, so in Task 2 (`reason.text`, `reason.sources[0].label`) und Task 3 (`setReason(suggestion.reason)`) verwendet. `expandSlots(primarySlot, timesPerDay)` in Task 1 und 3 gleich. `substanceIdsFromDetails(ingredientDetails)` in Task 1 und 3 gleich.
