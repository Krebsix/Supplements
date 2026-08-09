/**
 * tests/cure-manager.test.mjs
 * ─────────────────────────────────────────────────────────────
 * Prueft beide Kur-Typen:
 *   - cycle:   ON/OFF-Zyklus (z.B. 21/7), inklusive Wiederholung
 *   - stepped: Dosis-Stufen, die nach Woche wechseln und auf der
 *              letzten Stufe stehen bleiben
 *
 * Alle Tests bauen startDate relativ zu Date.now() auf. Um die
 * Tages-Rundung (Math.floor) robust gegen Testlauf-Timing zu machen,
 * wird zu jedem gewuenschten Tagesabstand ein zusaetzlicher Puffer von
 * 12h abgezogen — so liegt der reale elapsed-Wert sicher in der Mitte
 * des gewuenschten Tages, nie an dessen Rand.
 */

import { getCycleStatus, getSteppedDose, getCureStatusLabel, isDueToday } from '../CureManager.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

const MS_PER_DAY = 86_400_000;
const HALF_DAY = 12 * 60 * 60 * 1000;

// startDate so waehlen, dass floor((now - start) / MS_PER_DAY) === days
function startDateForElapsedDays(days) {
  return new Date(Date.now() - days * MS_PER_DAY - HALF_DAY);
}

console.log('\n— cycle: 21/7-Zyklus —');

const cycle21_7 = { type: 'cycle', onDays: 21, offDays: 7 };

// Tag 21 (letzter ON-Tag, 0-indexiert elapsed = 20)
const day21 = getCycleStatus(cycle21_7, startDateForElapsedDays(20));
check('Tag 21 → Phase "on"', day21.phase === 'on', day21.phase);
check('Tag 21 → dayInPhase 21', day21.dayInPhase === 21, day21.dayInPhase);
check('Tag 21 → daysLeft 0 (letzter Tag der Phase)', day21.daysLeft === 0, day21.daysLeft);
check('Tag 21 → nextPhase "off"', day21.nextPhase === 'off');

// Tag 22 (erster OFF-Tag, elapsed = 21)
const day22 = getCycleStatus(cycle21_7, startDateForElapsedDays(21));
check('Tag 22 → Phase "off"', day22.phase === 'off', day22.phase);
check('Tag 22 → dayInPhase 1 (erster Tag der Pause)', day22.dayInPhase === 1, day22.dayInPhase);
check('Tag 22 → daysLeft 6', day22.daysLeft === 6, day22.daysLeft);
check('Tag 22 → nextPhase "on"', day22.nextPhase === 'on');

// letzter OFF-Tag (elapsed = 27, dayInCycle 27)
const day28 = getCycleStatus(cycle21_7, startDateForElapsedDays(27));
check('Letzter Pausentag (Tag 28) → Phase "off", dayInPhase 7',
  day28.phase === 'off' && day28.dayInPhase === 7, JSON.stringify(day28));

// Zyklus-Wiederholung: elapsed = 28 (ein voller Zyklus) → wieder Tag 1 ON
const cycleRepeat = getCycleStatus(cycle21_7, startDateForElapsedDays(28));
check('Zyklus wiederholt sich nach 28 Tagen → wieder Phase "on", Tag 1',
  cycleRepeat.phase === 'on' && cycleRepeat.dayInPhase === 1, JSON.stringify(cycleRepeat));

// zweiter Zyklus, Tag 22 (elapsed = 28 + 21 = 49) → wieder erster Pausentag
const secondCycleOff = getCycleStatus(cycle21_7, startDateForElapsedDays(49));
check('Zweiter Zyklus, Tag 22 → wieder Phase "off", Tag 1',
  secondCycleOff.phase === 'off' && secondCycleOff.dayInPhase === 1);

console.log('\n— cycle: isDueToday spiegelt die Phase —');
check('ON-Phase → isDueToday true',
  isDueToday(cycle21_7, startDateForElapsedDays(0)) === true);
check('OFF-Phase → isDueToday false',
  isDueToday(cycle21_7, startDateForElapsedDays(21)) === false);

console.log('\n— stepped: Dosis-Stufen —');

const stepped = {
  type: 'stepped',
  steps: [
    { week: 1, drops: 5 },
    { week: 2, drops: 7 },
    { week: 3, drops: 10 },
  ],
};

// letzter Tag von Woche 1 (elapsed = 6) → noch Stufe 1
const lastDayWeek1 = getSteppedDose(stepped, startDateForElapsedDays(6));
check('Tag 7 (letzter Tag Woche 1) → Stufe 1 (5 Tropfen)',
  lastDayWeek1.drops === 5 && lastDayWeek1.week === 1, JSON.stringify(lastDayWeek1));

// erster Tag von Woche 2 (elapsed = 7) → Stufenwechsel auf Stufe 2
const firstDayWeek2 = getSteppedDose(stepped, startDateForElapsedDays(7));
check('Tag 8 (erster Tag Woche 2) → Stufenwechsel auf Stufe 2 (7 Tropfen)',
  firstDayWeek2.drops === 7 && firstDayWeek2.week === 2, JSON.stringify(firstDayWeek2));

// Woche 3 beginnt bei elapsed = 14
const week3 = getSteppedDose(stepped, startDateForElapsedDays(14));
check('Tag 15 (Woche 3) → Stufe 3 (10 Tropfen)',
  week3.drops === 10 && week3.week === 3);

// weit ueber die letzte definierte Stufe hinaus → haelt die letzte Stufe
const farBeyond = getSteppedDose(stepped, startDateForElapsedDays(100));
check('Weit ueber die letzte Stufe hinaus (Tag 101) → letzte Stufe haelt (10 Tropfen)',
  farBeyond.drops === 10 && farBeyond.week === 3, JSON.stringify(farBeyond));

console.log('\n— cureConfig null / ungueltig —');

check('getCycleStatus(null, startDate) → Phase "unknown"',
  getCycleStatus(null, new Date()).phase === 'unknown');
check('getCycleStatus(cureConfig, null) → Phase "unknown" (kein startDate)',
  getCycleStatus(cycle21_7, null).phase === 'unknown');
check('getCycleStatus mit type "stepped" → Phase "unknown" (falscher Typ)',
  getCycleStatus(stepped, new Date()).phase === 'unknown');

check('getSteppedDose(null, startDate) → null',
  getSteppedDose(null, new Date()) === null);
check('getSteppedDose(cureConfig, null) → null (kein startDate)',
  getSteppedDose(stepped, null) === null);
check('getSteppedDose mit type "cycle" → null (falscher Typ)',
  getSteppedDose(cycle21_7, new Date()) === null);
check('getSteppedDose ohne steps-Array → null (keine Stufe verfuegbar)',
  getSteppedDose({ type: 'stepped' }, new Date()) === null);

check('getCureStatusLabel(null, startDate) → null',
  getCureStatusLabel(null, new Date()) === null);
check('getCureStatusLabel(cureConfig, null) → null (kein startDate)',
  getCureStatusLabel(cycle21_7, null) === null);
check('getCureStatusLabel mit unbekanntem type → null',
  getCureStatusLabel({ type: 'unknown' }, new Date()) === null);

check('isDueToday(null) → true (keine Kur bedeutet keine Sperre)',
  isDueToday(null, new Date()) === true);
check('isDueToday(stepped) → immer true',
  isDueToday(stepped, startDateForElapsedDays(0)) === true);

console.log('\n— getCureStatusLabel liefert uebersetzten Text —');
const cycleLabel = getCureStatusLabel(cycle21_7, startDateForElapsedDays(0));
check('cycle-Label enthaelt Tagesangabe "Tag 1 von 21"', /Tag 1 von 21/.test(cycleLabel), cycleLabel);
const steppedLabel = getCureStatusLabel(stepped, startDateForElapsedDays(0));
check('stepped-Label enthaelt Woche und Tropfenzahl',
  /1/.test(steppedLabel) && /5/.test(steppedLabel), steppedLabel);

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
