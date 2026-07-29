/**
 * tests/outcome-tracker.test.mjs
 * ─────────────────────────────────────────────────────────────
 * Prueft die Wirkungskontrolle — mit Schwerpunkt auf dem, was sie
 * NICHT behaupten darf.
 *
 * Der eigentliche Zweck des Moduls ist nicht das Rechnen, sondern das
 * Bremsen: Eine gestiegene Selbsteinschaetzung ist kein Wirkungsnachweis.
 * Die Tests hier stellen sicher, dass die Stoerfaktoren zuverlaessig
 * erkannt werden — parallel laufende Tests, zu kurze Zeitraeume, zu wenige
 * Bewertungen, lueckenhafte Einnahme. Faellt einer davon aus, wuerde die
 * App aus Rauschen einen Erfolg machen.
 */

import {
  CONFOUNDER,
  TRIAL_CONCLUSION,
  TRIAL_STATUS,
  calculateAdherence,
  clampRating,
  concludeTrial,
  createRating,
  createTrial,
  evaluateTrial,
  getDueTrials,
} from '../OutcomeTracker.js';
import {
  MIN_RATINGS_FOR_COMPARISON,
  OUTCOME_METRICS,
  getOutcomeMetric,
} from '../data/outcomeMetrics.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

const DAY = 86400000;
const daysAgo = (n) => new Date(Date.now() - n * DAY);
const keyOf = (d) => d.toISOString().slice(0, 10);

function ratingsOverDays(trialId, values, startDaysAgo) {
  return values.map((value, index) =>
    createRating(trialId, value, '', daysAgo(startDaysAgo - index))
  );
}

console.log('\n— Skala —');
check('Werte werden auf 1–5 begrenzt', clampRating(9) === 5 && clampRating(-2) === 1);
check('Nachkommastellen werden gerundet', clampRating(3.4) === 3);
check('Unsinn ergibt null', clampRating('abc') === null);
check('Jede Zielgröße hat eine Richtung',
  OUTCOME_METRICS.every((m) => ['higher-better', 'lower-better'].includes(m.direction)));
check('Jede Zielgröße hat einen Übersetzungsschlüssel',
  OUTCOME_METRICS.every((m) => typeof m.labelKey === 'string' && m.labelKey.startsWith('outcome.metric.')));
check('Beschwerden sind als "niedriger ist besser" hinterlegt',
  getOutcomeMetric('muscle-complaints').direction === 'lower-better');

console.log('\n— Anlegen —');
const trial = createTrial({
  userSupplementId: 'u1',
  supplementName: 'Magnesium',
  metricId: 'sleep-quality',
  reason: 'Schlaf',
  baselineValue: 2,
  durationDays: 28,
  startedAt: daysAgo(20).toISOString(),
});
check('Test startet als laufend', trial.status === TRIAL_STATUS.RUNNING);
check('Ausgangswert wird übernommen', trial.baselineValue === 2);
check('Noch keine Entscheidung hinterlegt', trial.conclusion === null);

console.log('\n— Auswertung mit ausreichend Daten —');
const good = evaluateTrial(trial, ratingsOverDays(trial.id, [3, 4, 4, 4, 5, 4], 18), {
  allTrials: [trial],
  intakeLogs: [],
});
check('Vergleich wird gezeigt', good.showComparison === true);
check('Verbesserung wird erkannt', good.directionLabel === 'improved', good.directionLabel);
check('Veränderung ist positiv', good.change > 0, good.change);
check('Bewertungen werden gezählt', good.ratingCount === 6, good.ratingCount);

console.log('\n— Umgekehrte Richtung: weniger ist besser —');
const complaintTrial = createTrial({
  userSupplementId: 'u2', supplementName: 'Magnesium', metricId: 'muscle-complaints',
  baselineValue: 4, durationDays: 28, startedAt: daysAgo(20).toISOString(),
});
const complaint = evaluateTrial(
  complaintTrial,
  ratingsOverDays(complaintTrial.id, [3, 2, 2, 2, 1, 2], 18),
  { allTrials: [complaintTrial] }
);
check('Sinkende Beschwerden gelten als Verbesserung',
  complaint.directionLabel === 'improved', complaint.directionLabel);
check('Die Veränderung ist rechnerisch negativ', complaint.change < 0, complaint.change);

console.log('\n— Störfaktor: parallel laufender Test —');
// Der wichtigste Fall. Wer zwei Praeparate gleichzeitig beginnt, kann eine
// Veraenderung keinem von beiden zuordnen.
const other = createTrial({
  userSupplementId: 'u3', supplementName: 'Ashwagandha', metricId: 'sleep-quality',
  baselineValue: 2, durationDays: 28, startedAt: daysAgo(18).toISOString(),
});
const withParallel = evaluateTrial(trial, ratingsOverDays(trial.id, [3, 4, 4, 4, 5, 4], 18), {
  allTrials: [trial, other],
});
const parallelHit = withParallel.confounders.find((c) => c.type === CONFOUNDER.PARALLEL_TRIALS);
check('Parallel laufender Test wird erkannt', Boolean(parallelHit));
check('Der andere Test wird namentlich genannt',
  parallelHit?.names.includes('Ashwagandha'), JSON.stringify(parallelHit?.names));

console.log('\n— Störfaktor: zu wenige Bewertungen —');
const sparse = evaluateTrial(trial, ratingsOverDays(trial.id, [4, 5], 10), { allTrials: [trial] });
check('Zu wenige Bewertungen werden erkannt',
  sparse.confounders.some((c) => c.type === CONFOUNDER.FEW_RATINGS));
check('Ohne genug Bewertungen kein Vorher-Nachher-Vergleich',
  sparse.showComparison === false);
check('… und keine Richtungsaussage', sparse.directionLabel === null);

console.log('\n— Störfaktor: kein Ausgangswert —');
const noBase = createTrial({
  userSupplementId: 'u4', supplementName: 'Zink', metricId: 'energy',
  durationDays: 28, startedAt: daysAgo(20).toISOString(),
});
const noBaseEval = evaluateTrial(noBase, ratingsOverDays(noBase.id, [3, 4, 4, 4, 5], 18), {
  allTrials: [noBase],
});
check('Fehlender Ausgangswert wird erkannt',
  noBaseEval.confounders.some((c) => c.type === CONFOUNDER.NO_BASELINE));
check('Ohne Ausgangswert kein Vergleich', noBaseEval.showComparison === false);

console.log('\n— Störfaktor: zu kurzer Zeitraum —');
const shortTrial = createTrial({
  userSupplementId: 'u5', supplementName: 'Kreatin', metricId: 'energy',
  baselineValue: 3, durationDays: 5, startedAt: daysAgo(4).toISOString(),
});
check('Kurzer Zeitraum wird erkannt',
  evaluateTrial(shortTrial, [], { allTrials: [shortTrial] })
    .confounders.some((c) => c.type === CONFOUNDER.SHORT_DURATION));

console.log('\n— Störfaktor: lückenhafte Einnahme —');
const logs = [
  { userSupplementId: 'u1', dateKey: keyOf(daysAgo(19)), undoneAt: null },
  { userSupplementId: 'u1', dateKey: keyOf(daysAgo(18)), undoneAt: null },
  { userSupplementId: 'u1', dateKey: keyOf(daysAgo(17)), undoneAt: null },
];
const adherence = calculateAdherence(trial, logs);
check('Einnahmetreue wird berechnet', adherence.loggedDays === 3, adherence.loggedDays);
check('Einnahmetreue unter 70 % gilt als Störfaktor',
  evaluateTrial(trial, ratingsOverDays(trial.id, [3, 4, 4, 4, 5, 4], 18), {
    allTrials: [trial], intakeLogs: logs,
  }).confounders.some((c) => c.type === CONFOUNDER.LOW_ADHERENCE));
check('Rückgängig gemachte Einnahmen zählen nicht',
  calculateAdherence(trial, [{ userSupplementId: 'u1', dateKey: keyOf(daysAgo(5)), undoneAt: 'x' }])
    .loggedDays === 0);

console.log('\n— Störfaktor: Veränderung im Bereich der Tagesform —');
const tiny = evaluateTrial(
  createTrial({ userSupplementId: 'u6', supplementName: 'X', metricId: 'energy',
    baselineValue: 3, durationDays: 28, startedAt: daysAgo(20).toISOString(), id: 'tiny' }),
  ratingsOverDays('tiny', [3, 3, 3, 3, 3, 3], 18),
  { allTrials: [] }
);
check('Unveränderter Verlauf wird als solcher benannt',
  tiny.directionLabel === 'unchanged', tiny.directionLabel);
check('Minimale Veränderung wird als Störfaktor markiert',
  tiny.confounders.some((c) => c.type === CONFOUNDER.SMALL_CHANGE));

console.log('\n— Fälligkeit und Abschluss —');
const dueTrial = createTrial({
  userSupplementId: 'u7', supplementName: 'Y', metricId: 'energy',
  baselineValue: 3, durationDays: 14, startedAt: daysAgo(20).toISOString(),
});
check('Abgelaufener Test ist fällig',
  evaluateTrial(dueTrial, [], { allTrials: [] }).isDue === true);
check('getDueTrials findet ihn', getDueTrials([dueTrial, trial]).length === 1);
check('Laufender Test ist nicht fällig',
  evaluateTrial(trial, [], { allTrials: [] }).isDue === false);

const stopped = concludeTrial(dueTrial, TRIAL_CONCLUSION.STOP);
check('Absetzen setzt den Status', stopped.status === TRIAL_STATUS.STOPPED);
check('Entscheidung wird festgehalten', stopped.conclusion === TRIAL_CONCLUSION.STOP);
check('Abschlusszeitpunkt wird gesetzt', Boolean(stopped.concludedAt));
const continued = concludeTrial(dueTrial, TRIAL_CONCLUSION.CONTINUE);
check('Weiterführen schließt ab, ohne zu stoppen',
  continued.status === TRIAL_STATUS.COMPLETED);
check('Ungültige Entscheidung ändert nichts',
  concludeTrial(dueTrial, 'quatsch').status === TRIAL_STATUS.RUNNING);

console.log('\n— Grenzfälle —');
check('Kein Test → keine Auswertung', evaluateTrial(null) === null);
check('Test ohne Bewertungen stürzt nicht ab',
  evaluateTrial(trial, [], { allTrials: [] }).ratingCount === 0);
check('Bewertungen fremder Tests werden ignoriert',
  evaluateTrial(trial, ratingsOverDays('anderer-test', [5, 5, 5, 5, 5], 10), { allTrials: [] })
    .ratingCount === 0);
check('Ungültige Bewertung wird nicht angelegt', createRating('t', 'abc') === null);
check('Mindestanzahl für den Vergleich ist gesetzt', MIN_RATINGS_FOR_COMPARISON >= 3);

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
