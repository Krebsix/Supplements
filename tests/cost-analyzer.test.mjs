/**
 * tests/cost-analyzer.test.mjs
 * ─────────────────────────────────────────────────────────────
 * Prueft die Kostenrechnung und ihre Verbindung zur Wirkungskontrolle.
 *
 * Zwei Dinge sind hier heikel:
 *   1. Ohne hinterlegten Preis darf nichts geschaetzt werden — ein
 *      erfundener Preis waere ein erfundener Wert.
 *   2. Gerechnet wird mit dem tatsaechlichen Verbrauch aus den Logs, nicht
 *      mit dem geplanten. Sonst zahlt jemand real 12 Euro im Monat und
 *      die App behauptet 30.
 */

import {
  analyzeCosts,
  calculateSupplementCost,
  findSharedGoals,
  getActualDailyUsage,
  getReviewStatus,
} from '../CostAnalyzer.js';
import { TRIAL_CONCLUSION, TRIAL_STATUS } from '../OutcomeTracker.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

const DAY = 86400000;
const keyOf = (n) => new Date(Date.now() - n * DAY).toISOString().slice(0, 10);

const magnesium = { id: 'u1', name: 'Magnesium', timingSlots: ['evening'] };
const omega = { id: 'u2', name: 'Omega-3', timingSlots: ['morning'] };

console.log('\n— Kosten je Produkt —');

// 20 Euro fuer 100 Kapseln = 0,20 pro Kapsel
const stock = { purchasePrice: 20, packageUnits: 100, currency: 'EUR' };
const dailyLogs = Array.from({ length: 10 }, (_, i) => ({
  userSupplementId: 'u1', dateKey: keyOf(9 - i), undoneAt: null,
}));

const cost = calculateSupplementCost(magnesium, stock, dailyLogs);
check('Preis pro Einheit', cost.costPerUnit === 0.2, cost.costPerUnit);
check('Tägliche Einnahme wird aus den Logs erkannt', cost.unitsPerDay === 1, cost.unitsPerDay);
check('Kosten pro Tag', cost.costPerDay === 0.2, cost.costPerDay);
check('Kosten pro Monat', cost.costPerMonth === 6, cost.costPerMonth);
check('Nicht als Schätzung markiert', cost.isEstimated === false);

console.log('\n— Tatsächlicher statt geplanter Verbrauch —');

// Nur jeden zweiten Tag eingenommen: die Kosten sind real halb so hoch
const everyOtherDay = [0, 2, 4, 6, 8].map((n) => ({
  userSupplementId: 'u1', dateKey: keyOf(n), undoneAt: null,
}));
const halfCost = calculateSupplementCost(magnesium, stock, everyOtherDay);
check('Lückenhafte Einnahme senkt die Tageskosten',
  halfCost.costPerDay < cost.costPerDay, `${halfCost.costPerDay} vs ${cost.costPerDay}`);
check('Verbrauch liegt unter einer Einheit pro Tag',
  halfCost.unitsPerDay < 1, halfCost.unitsPerDay);

const noLogs = calculateSupplementCost(magnesium, stock, []);
check('Ohne Logs wird auf den Plan zurückgegriffen', noLogs.unitsPerDay === 1);
check('… und das wird als Schätzung markiert', noLogs.isEstimated === true);

const rückgängig = getActualDailyUsage('u1', [
  { userSupplementId: 'u1', dateKey: keyOf(1), undoneAt: '2026-01-01' },
]);
check('Rückgängig gemachte Einnahmen zählen nicht mit', rückgängig === null);

console.log('\n— Nichts erfinden ohne Preis —');
check('Ohne Preis keine Rechnung',
  calculateSupplementCost(magnesium, { packageUnits: 100 }, dailyLogs) === null);
check('Ohne Packungsgröße keine Rechnung',
  calculateSupplementCost(magnesium, { purchasePrice: 20 }, dailyLogs) === null);
check('Preis von 0 ergibt keine Rechnung',
  calculateSupplementCost(magnesium, { purchasePrice: 0, packageUnits: 100 }, dailyLogs) === null);

console.log('\n— Überprüfungsstatus —');
const runningTrial = { userSupplementId: 'u1', status: TRIAL_STATUS.RUNNING, conclusion: null };
const continuedTrial = {
  userSupplementId: 'u2', status: TRIAL_STATUS.COMPLETED,
  conclusion: TRIAL_CONCLUSION.CONTINUE, concludedAt: '2026-07-01T00:00:00.000Z',
};
check('Nie überprüft', getReviewStatus('u9', []) === 'never-reviewed');
check('Laufende Beobachtung', getReviewStatus('u1', [runningTrial]) === 'running');
check('Überprüft und weitergenommen',
  getReviewStatus('u2', [continuedTrial]) === 'reviewed-continue');
check('Laufende Beobachtung hat Vorrang vor abgeschlossener',
  getReviewStatus('u1', [
    { userSupplementId: 'u1', status: TRIAL_STATUS.COMPLETED, conclusion: TRIAL_CONCLUSION.STOP, concludedAt: '2026-01-01' },
    runningTrial,
  ]) === 'running');

console.log('\n— Gesamtauswertung —');
const analysis = analyzeCosts(
  [magnesium, omega, { id: 'u3', name: 'Vitamin D3', timingSlots: ['morning'] }],
  {
    u1: { purchasePrice: 20, packageUnits: 100, currency: 'EUR' },
    u2: { purchasePrice: 30, packageUnits: 60, currency: 'EUR' },
    // u3 ohne Preis
  },
  { intakeLogs: dailyLogs, trials: [continuedTrial] }
);

check('Zwei Produkte mit Preis', analysis.items.length === 2, analysis.items.length);
check('Produkt ohne Preis wird separat ausgewiesen',
  analysis.withoutPrice.length === 1 && analysis.withoutPrice[0].supplementName === 'Vitamin D3');
check('Teuerstes zuerst',
  analysis.items[0].costPerMonth >= analysis.items[1].costPerMonth);
check('Monatssumme wird gebildet', analysis.totalPerMonth > 0, analysis.totalPerMonth);
check('Produkt ohne Preis fließt nicht in die Summe ein',
  analysis.totalPerMonth === analysis.items.reduce((s, i) => s + i.costPerMonth, 0));

console.log('\n— Nie überprüfte Ausgaben —');
check('Magnesium gilt als nie überprüft',
  analysis.neverReviewed.names.includes('Magnesium'), analysis.neverReviewed.names.join(','));
check('Omega-3 wurde überprüft und zählt nicht dazu',
  !analysis.neverReviewed.names.includes('Omega-3'));
check('Deren Monatskosten werden beziffert', analysis.neverReviewed.perMonth > 0);
check('Anzahl stimmt', analysis.neverReviewed.count === 1, analysis.neverReviewed.count);

console.log('\n— Produkte mit gleichem Ziel —');
const shared = findSharedGoals([
  { metricId: 'sleep-quality', supplementName: 'Magnesium' },
  { metricId: 'sleep-quality', supplementName: 'Ashwagandha' },
  { metricId: 'energy', supplementName: 'Vitamin B12' },
]);
check('Gemeinsames Ziel wird erkannt', shared.length === 1, shared.length);
check('Beide Produkte werden genannt', shared[0].names.length === 2);
check('Einzelnes Ziel taucht nicht auf',
  !shared.some((entry) => entry.metricId === 'energy'));
check('Doppelte Nennung desselben Produkts zählt einmal',
  findSharedGoals([
    { metricId: 'energy', supplementName: 'Vitamin B12' },
    { metricId: 'energy', supplementName: 'Vitamin B12' },
  ]).length === 0);

console.log('\n— Grenzfälle —');
check('Leerer Bestand', analyzeCosts([], {}).items.length === 0);
check('Leerer Bestand → Summe 0', analyzeCosts([], {}).totalPerMonth === 0);
check('Keine Trials → alles nie überprüft',
  analyzeCosts([magnesium], { u1: stock }, { intakeLogs: dailyLogs }).neverReviewed.count === 1);

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
