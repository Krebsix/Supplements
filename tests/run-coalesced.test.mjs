import { createCoalescedRunner } from '../runCoalesced';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

// Wartet, bis die Mikrotask-Warteschlange vollstaendig geleert ist (nicht
// nur einen festen Tick lang) -- robuster als eine feste Anzahl
// `await Promise.resolve()`, weil die Anzahl noetiger Ticks von der
// internen await-Verschachtelung abhaengt.
function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

console.log('\n— createCoalescedRunner —');

let calls = 0;
let resolvers = [];
function fn() {
  calls += 1;
  return new Promise((resolve) => resolvers.push(resolve));
}

const run = createCoalescedRunner(fn);

const p1 = run();
const p2 = run();
const p3 = run();

check('waehrend des ersten Laufs startet kein zweiter sofort', calls === 1, calls);

resolvers[0]('erstes-ergebnis');
await flush();

check('genau ein gebuendelter Nachlauf: insgesamt zwei Ausfuehrungen', calls === 2, calls);

resolvers[1]('zweites-ergebnis');
const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

check('alle drei Aufrufer bekommen dasselbe (letzte) Ergebnis',
  r1 === 'zweites-ergebnis' && r2 === 'zweites-ergebnis' && r3 === 'zweites-ergebnis',
  `${r1} / ${r2} / ${r3}`);

// Nach abgeschlossenem Durchlauf: ein neuer Aufruf startet wieder sofort,
// nicht gebuendelt mit dem laengst erledigten vorherigen.
const p4 = run();
check('nach Abschluss startet ein neuer Aufruf sofort', calls === 3, calls);
resolvers[2]('drittes-ergebnis');
check('viertes Ergebnis kommt eigenstaendig an', (await p4) === 'drittes-ergebnis');

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
