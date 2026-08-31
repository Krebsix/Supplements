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
