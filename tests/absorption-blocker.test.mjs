/**
 * tests/absorption-blocker.test.mjs
 * ─────────────────────────────────────────────────────────────
 * Prueft die globale 2h-Sperre nach Flohsamenschalen (ID 43).
 *
 * shouldTriggerBlock() erkennt den Ausloeser ueber drei unabhaengige
 * Wege (libraryId 43, conflictTag 'ALL', flags.isAbsorptionBlocker) —
 * isBlocked() rechnet die Sperrzeit ausgehend vom Logging-Zeitpunkt.
 *
 * Alle Zeit-Tests bauen blockerLoggedAt relativ zu Date.now() im
 * Testlauf auf. isBlocked() ruft Date.now() intern selbst nochmal auf,
 * das liegt IMMER (wenn auch nur um Millisekunden) spaeter als die
 * Berechnung hier — deshalb sind Puffer von mehreren Sekunden bewusst
 * grosszuegig gewaehlt, um auf einer langsamen CI nicht zu flackern.
 */

import { isBlocked, shouldTriggerBlock, ABSORPTION_BLOCKER_ID, BLOCK_DURATION_MS } from '../AbsorptionBlocker.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

console.log('\n— shouldTriggerBlock: Ausloeser erkennen —');

check('Numerische ID 43 loest aus', shouldTriggerBlock(43) === true);
check('Objekt mit id 43 loest aus', shouldTriggerBlock({ id: 43 }) === true);
check('Objekt mit libraryId 43 loest aus (id weicht ab)',
  shouldTriggerBlock({ id: 999, libraryId: 43 }) === true);
check('conflictTags enthaelt "ALL" loest aus',
  shouldTriggerBlock({ id: 1, conflictTags: ['ALL'] }) === true);
check('flags.isAbsorptionBlocker === true loest aus',
  shouldTriggerBlock({ id: 1, flags: { isAbsorptionBlocker: true } }) === true);
check('ABSORPTION_BLOCKER_ID entspricht 43', ABSORPTION_BLOCKER_ID === 43);

console.log('\n— shouldTriggerBlock: kein Ausloeser —');

check('Andere numerische ID loest nicht aus', shouldTriggerBlock(1) === false);
check('Objekt ohne matching Merkmal loest nicht aus',
  shouldTriggerBlock({ id: 1, name: 'Magnesium' }) === false);
check('conflictTags ohne "ALL" loest nicht aus',
  shouldTriggerBlock({ id: 1, conflictTags: ['Blutverduenner'] }) === false);
check('flags.isAbsorptionBlocker === false loest nicht aus',
  shouldTriggerBlock({ id: 1, flags: { isAbsorptionBlocker: false } }) === false);
check('Fehlendes conflictTags-Array stuerzt nicht ab',
  shouldTriggerBlock({ id: 1 }) === false);

console.log('\n— isBlocked: kein Blocker aktiv —');

check('null → nicht blockiert', isBlocked(null).blocked === false);
check('null → remainingMinutes 0', isBlocked(null).remainingMinutes === 0);
check('undefined → nicht blockiert', isBlocked(undefined).blocked === false);

console.log('\n— isBlocked: Grenzfaelle um die 2h-Marke —');

// Deutlich unter 2h (10 Sekunden seit dem Logging) → sicher noch blockiert
const justLogged = new Date(Date.now() - 10_000);
const justLoggedResult = isBlocked(justLogged);
check('Vor Sekunden geloggt → blockiert', justLoggedResult.blocked === true);
check('Vor Sekunden geloggt → rund 120 Minuten Rest',
  justLoggedResult.remainingMinutes === 120, justLoggedResult.remainingMinutes);

// Knapp UNTER der 2h-Grenze (10s Puffer) → noch blockiert, ~1 Minute Rest
const almostTwoHours = new Date(Date.now() - (BLOCK_DURATION_MS - 10_000));
const almostResult = isBlocked(almostTwoHours);
check('Knapp unter 2h → noch blockiert', almostResult.blocked === true, JSON.stringify(almostResult));
check('Knapp unter 2h → remainingMinutes ist 1 (aufgerundet)',
  almostResult.remainingMinutes === 1, almostResult.remainingMinutes);

// Genau auf/über der 2h-Grenze → Date.now() beim Aufruf liegt immer
// mindestens so weit in der Zukunft wie die Berechnung hier, die
// Differenz ist also garantiert <= 0 → nicht mehr blockiert.
const exactlyTwoHours = new Date(Date.now() - BLOCK_DURATION_MS);
const exactResult = isBlocked(exactlyTwoHours);
check('Genau 2h (oder knapp darueber) → nicht mehr blockiert',
  exactResult.blocked === false, JSON.stringify(exactResult));
check('Nicht mehr blockiert → remainingMinutes 0', exactResult.remainingMinutes === 0);

// Deutlich UEBER der 2h-Grenze (10 Minuten drueber) → sicher nicht blockiert
const wayOver = new Date(Date.now() - (BLOCK_DURATION_MS + 10 * 60_000));
check('10 Minuten ueber der Grenze → nicht blockiert', isBlocked(wayOver).blocked === false);

console.log('\n— isBlocked: unlocksAt ist exakt berechnet (zeitunabhaengig) —');

const reference = new Date('2026-01-01T10:00:00.000Z');
const referenceResult = isBlocked(reference);
// Dieser Block liegt in der Vergangenheit (2026-01-01 ist vor "heute"),
// daher hier nur die Rechenregel selbst pruefen, nicht den blocked-Status:
// unlocksAt = blockerLoggedAt + BLOCK_DURATION_MS, unabhaengig von Date.now().
const recentBlock = new Date(Date.now() - 5_000);
const recentResult = isBlocked(recentBlock);
check('unlocksAt = Logging-Zeitpunkt + 2h (exakt)',
  recentResult.unlocksAt.getTime() === recentBlock.getTime() + BLOCK_DURATION_MS,
  recentResult.unlocksAt);
check('Alter Block (weit in der Vergangenheit) ist jedenfalls nicht blockiert',
  referenceResult.blocked === false);

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
