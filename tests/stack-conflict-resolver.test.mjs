// Tests fuer StackConflictResolver.js: Vorschlag eines bestehenden,
// heute schon genutzten Slots, um zwei konfligierende Praeparate zu
// trennen. Kein erfundener Slot, kein Vorschlag ohne Alternative.
import { applySeparation, suggestSeparationSlot } from '../StackConflictResolver';
import { SLOTS } from '../TimingEngine';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}

// Minimaler Tagesplan wie TimingEngine.buildDailySchedule() ihn liefert:
// [{ slot: SLOTS[id], supplements: [{ id, ... }] }, ...] in SLOT_ORDER.
function schedule(bySlot) {
  return Object.entries(bySlot).map(([slotId, supplements]) => ({
    slot: SLOTS[slotId],
    supplements,
  }));
}

console.log('— suggestSeparationSlot —');

const iron = { id: 'user-iron' };
const calcium = { id: 'user-calcium' };
const other = { id: 'user-other' };

const dailyBoth = schedule({
  morning: [iron, calcium],
  evening: [other],
});
const suggestion = suggestSeparationSlot({
  dailySchedule: dailyBoth,
  supplementId: iron.id,
  partnerSupplementId: calcium.id,
});
check('schlaegt einen bereits genutzten anderen Slot vor', suggestion?.slotId === 'evening');
check('nennt den urspruenglichen Slot', suggestion?.fromSlotId === 'morning');
check('nennt das Slot-Label', suggestion?.label === SLOTS.evening.label);

check(
  'kein Alternativ-Slot heute belegt => kein Vorschlag',
  suggestSeparationSlot({
    dailySchedule: schedule({ morning: [iron, calcium] }),
    supplementId: iron.id,
    partnerSupplementId: calcium.id,
  }) === null
);

check(
  'einziger anderer belegter Slot enthaelt den Partner selbst => kein Vorschlag',
  suggestSeparationSlot({
    dailySchedule: schedule({ morning: [iron, calcium], evening: [calcium] }),
    supplementId: iron.id,
    partnerSupplementId: calcium.id,
  }) === null
);

check(
  'Praeparate teilen sich heute gar keinen Slot => kein Vorschlag (nichts zu trennen)',
  suggestSeparationSlot({
    dailySchedule: schedule({ morning: [iron], evening: [calcium] }),
    supplementId: iron.id,
    partnerSupplementId: calcium.id,
  }) === null
);

check(
  'fehlende IDs => kein Vorschlag statt Absturz',
  suggestSeparationSlot({ dailySchedule: dailyBoth }) === null
);

check(
  'leerer Tagesplan => kein Vorschlag',
  suggestSeparationSlot({ dailySchedule: [], supplementId: 'a', partnerSupplementId: 'b' }) === null
);

// Zwei moegliche Alternativ-Slots: SLOT_ORDER-Reihenfolge entscheidet,
// nicht Deklarationsreihenfolge im Testobjekt.
const twoAlternatives = schedule({
  evening: [iron, calcium],
  fasted: [other],
  midday: [other],
});
check(
  'bei mehreren Alternativen gewinnt die SLOT_ORDER-Reihenfolge (fasted vor midday)',
  suggestSeparationSlot({
    dailySchedule: twoAlternatives,
    supplementId: iron.id,
    partnerSupplementId: calcium.id,
  })?.slotId === 'fasted'
);

console.log('— applySeparation —');

check(
  'ersetzt den alten Slot durch den neuen',
  JSON.stringify(applySeparation(['morning'], 'morning', 'evening')) === JSON.stringify(['evening'])
);
check(
  'laesst andere Slots eines 2x/3x-Praeparats unangetastet',
  JSON.stringify(applySeparation(['morning', 'evening'], 'morning', 'midday')) ===
    JSON.stringify(['midday', 'evening'])
);
check(
  'keine Duplikate, wenn der Zielslot schon vorhanden ist',
  JSON.stringify(applySeparation(['morning', 'evening'], 'morning', 'evening')) ===
    JSON.stringify(['evening'])
);
check('Ergebnis folgt SLOT_ORDER, nicht der Eingabereihenfolge',
  JSON.stringify(applySeparation(['evening', 'fasted'], 'evening', 'morning')) ===
    JSON.stringify(['fasted', 'morning'])
);

if (failures > 0) {
  console.error(`\n${failures} Fehlschlaege`);
  process.exit(1);
}
