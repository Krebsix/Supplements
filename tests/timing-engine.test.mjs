/**
 * tests/timing-engine.test.mjs
 * ─────────────────────────────────────────────────────────────
 * Prueft die Slot-Zuordnung des Tagesplans.
 *
 * Hintergrund: buildDailySchedule() ordnet jedes Supplement seinem
 * PRIMAEREN Slot zu (erster Eintrag in timingSlots) und markiert, ob
 * es heute schon geloggt wurde. Fehlt timingSlots, landet das
 * Supplement in keinem Slot — bewusst kein Rate-Fallback.
 */

import {
  SLOT_ORDER,
  getSlot,
  getSlotLabel,
  getPrimarySlot,
  getSupplementsBySlot,
  buildDailySchedule,
} from '../TimingEngine.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

const testInventory = [
  { id: 1, name: 'NMN', timingSlots: ['fasted', 'morning'], childSafe: false },
  { id: 2, name: 'Vitamin C', timingSlots: ['morning', 'evening'], childSafe: true },
  { id: 3, name: 'Magnesium', timingSlots: ['evening'], childSafe: true },
  { id: 4, name: 'Ohne Slot', childSafe: true }, // kein timingSlots
  { id: 5, name: 'Leeres Array', timingSlots: [], childSafe: true },
];

console.log('\n— Slot-Zuordnung —');

const schedule = buildDailySchedule([], 'adult', testInventory);

check('Schedule hat einen Eintrag je Slot in SLOT_ORDER-Reihenfolge',
  schedule.map((s) => s.slot.id).join(',') === SLOT_ORDER.join(','));

const fastedEntry = schedule.find((s) => s.slot.id === 'fasted');
const morningEntry = schedule.find((s) => s.slot.id === 'morning');
const eveningEntry = schedule.find((s) => s.slot.id === 'evening');

check('NMN landet im fasted-Slot (erster Eintrag in timingSlots)',
  fastedEntry.supplements.some((s) => s.id === 1));
check('NMN landet NICHT im morning-Slot (nur Primaer-Slot zaehlt)',
  !morningEntry.supplements.some((s) => s.id === 1));
check('Vitamin C landet im morning-Slot (primaer)',
  morningEntry.supplements.some((s) => s.id === 2));
check('Vitamin C landet NICHT zusaetzlich im evening-Slot',
  !eveningEntry.supplements.some((s) => s.id === 2));
check('Magnesium landet im evening-Slot',
  eveningEntry.supplements.some((s) => s.id === 3));

console.log('\n— Supplements ohne timingSlots —');
const alleSupplements = schedule.flatMap((s) => s.supplements);
check('Supplement ohne timingSlots taucht in keinem Slot auf',
  !alleSupplements.some((s) => s.id === 4));
check('Supplement mit leerem timingSlots-Array taucht in keinem Slot auf',
  !alleSupplements.some((s) => s.id === 5));

console.log('\n— logged-Markierung —');
const loggedSchedule = buildDailySchedule([2, 3], 'adult', testInventory);
const loggedMorning = loggedSchedule.find((s) => s.slot.id === 'morning');
const loggedEvening = loggedSchedule.find((s) => s.slot.id === 'evening');
const loggedFasted = loggedSchedule.find((s) => s.slot.id === 'fasted');

check('Geloggtes Supplement (id 2) traegt logged: true',
  loggedMorning.supplements.find((s) => s.id === 2)?.logged === true);
check('Geloggtes Supplement (id 3) traegt logged: true',
  loggedEvening.supplements.find((s) => s.id === 3)?.logged === true);
check('Nicht geloggtes Supplement (id 1) traegt logged: false',
  loggedFasted.supplements.find((s) => s.id === 1)?.logged === false);

console.log('\n— Leerer Bestand —');
const emptySchedule = buildDailySchedule([], 'adult', []);
check('Leerer Bestand → sechs Slots, alle mit leerer Supplements-Liste',
  emptySchedule.length === SLOT_ORDER.length &&
  emptySchedule.every((s) => s.supplements.length === 0));

console.log('\n— Kind-Profil filtert nicht kindsichere Supplements —');
const childBySlot = getSupplementsBySlot('child', testInventory);
check('NMN (childSafe: false) fehlt im Kind-Profil',
  !childBySlot.fasted.some((s) => s.id === 1));
check('Vitamin C (childSafe: true) bleibt im Kind-Profil',
  childBySlot.morning.some((s) => s.id === 2));

console.log('\n— getSlot / getSlotLabel / getPrimarySlot —');
check('getSlot(unbekannt) → null', getSlot('brunch') === null);
check('getSlot(morning) → Objekt mit id/emoji', getSlot('morning')?.id === 'morning');
check('getSlotLabel(unbekannt) → gibt die id unveraendert zurueck',
  getSlotLabel('brunch') === 'brunch');
check('getPrimarySlot findet den ersten Slot des Supplements',
  getPrimarySlot(3, testInventory) === 'evening');
check('getPrimarySlot(unbekannte id) → null',
  getPrimarySlot(999, testInventory) === null);
check('getPrimarySlot ohne timingSlots → null',
  getPrimarySlot(4, testInventory) === null);

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
