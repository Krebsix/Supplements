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
check('unter Schwelle, noch nicht gemeldet: notify', refillState(s4, sup(['morning']), 5).notify === true);
check('unter Schwelle, schon gemeldet: kein notify', refillState({ ...s4, refillNotifiedAt: '2026-08-29' }, sup(['morning']), 5).notify === false);
check('ueber Schwelle: nicht faellig', refillState({ currentUnits: 40 }, sup(['morning']), 5).due === false);
check('Schwelle 0 = aus', refillState(s4, sup(['morning']), 0).due === false);
check('ohne Bestand: nicht faellig', refillState({}, sup(['morning']), 5).due === false);

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
