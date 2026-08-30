import { dailyUnits, daysLeft, refillState } from '../StockForecast';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

const sup = (slots) => ({ id: 'user-1', name: 'Magnesium', timingSlots: slots, status: 'active' });

console.log('\n— dailyUnits —');
check('1 Slot, 1 je Einnahme: 1 Einheit/Tag', dailyUnits(sup(['morning']), { decrementPerIntake: 1 }) === 1);
check('2 Slots, 2 je Einnahme: 4/Tag', dailyUnits(sup(['morning', 'evening']), { decrementPerIntake: 2 }) === 4);
check('ohne Slots: 0', dailyUnits(sup([]), {}) === 0);

console.log('\n— daysLeft —');
check('30 Einheiten, 2/Tag: 15 Tage', daysLeft({ currentUnits: 30, decrementPerIntake: 1 }, sup(['morning', 'evening'])) === 15);
check('ohne Bestand: null', daysLeft({}, sup(['morning'])) === null);
check('0 Einheiten: 0 Tage', daysLeft({ currentUnits: 0 }, sup(['morning'])) === 0);

console.log('\n— refillState —');
const s4 = { currentUnits: 4, decrementPerIntake: 1 };
// Fixer Referenzzeitpunkt statt new Date(): sonst haengt "Vergangenheit"
// vs. "Zukunft" vom Testlaufzeitpunkt ab.
const NOW = new Date('2026-08-30T12:00:00.000Z');

check('unter Schwelle, noch nichts geplant: notify', refillState(s4, sup(['morning']), 5, NOW).notify === true);
check('geplant in der Vergangenheit: kein notify (bereits ausgeloest)',
  refillState({ ...s4, refillNotifiedAt: '2026-08-29T09:00:00.000Z' }, sup(['morning']), 5, NOW).notify === false);
check('geplant in der Zukunft: notify (nach cancelAll neu planen)',
  refillState({ ...s4, refillNotifiedAt: '2026-08-30T18:00:00.000Z' }, sup(['morning']), 5, NOW).notify === true);
check('plannedAt spiegelt refillNotifiedAt',
  refillState({ ...s4, refillNotifiedAt: '2026-08-30T18:00:00.000Z' }, sup(['morning']), 5, NOW).plannedAt === '2026-08-30T18:00:00.000Z');
check('plannedAt ist null ohne Eintrag', refillState(s4, sup(['morning']), 5, NOW).plannedAt === null);
check('ueber Schwelle: nicht faellig', refillState({ currentUnits: 40 }, sup(['morning']), 5, NOW).due === false);
check('Schwelle 0 = aus', refillState(s4, sup(['morning']), 0, NOW).due === false);
check('ohne Bestand: nicht faellig', refillState({}, sup(['morning']), 5, NOW).due === false);

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
