/**
 * CostAnalyzer.js
 * ─────────────────────────────────────────────────────────────
 * Was der Bestand kostet — und wofuer.
 *
 * Die reine Summe ist der uninteressante Teil. Wertvoll wird es erst in
 * Verbindung mit der Wirkungskontrolle: Welche laufenden Ausgaben wurden
 * nie ueberprueft, und welche Produkte verfolgen dasselbe Ziel.
 *
 * WICHTIGE ABGRENZUNG IN DER FORMULIERUNG:
 * "Kein dokumentierter Nutzen" heisst NICHT "wirkungslos". Es heisst: Du
 * hast es nie ueberprueft. Das ist ein Unterschied, den die Oberflaeche
 * halten muss — sonst wird aus einer Beobachtungsluecke ein Urteil ueber
 * das Produkt.
 *
 * VERBRAUCH:
 * Gerechnet wird mit dem TATSAECHLICHEN Verbrauch aus den Einnahme-Logs,
 * nicht mit dem geplanten. Wer ein Praeparat nur jeden zweiten Tag nimmt,
 * gibt real weniger aus — und eine Hochrechnung auf Basis des Plans wuerde
 * die Kosten systematisch ueberschaetzen. Fehlen Logs, faellt die Rechnung
 * auf die geplante Einnahmehaeufigkeit zurueck und markiert das.
 */

import { TRIAL_CONCLUSION, TRIAL_STATUS } from './OutcomeTracker';

const MS_PER_DAY = 86400000;
const DAYS_PER_MONTH = 30;
const LOOKBACK_DAYS = 30;

function round2(value) {
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
}

function toDateKey(date) {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return null;
  return value.toISOString().slice(0, 10);
}

/**
 * Tatsaechlicher Verbrauch pro Tag aus den Einnahme-Logs.
 * Gibt null zurueck, wenn keine Logs vorliegen — dann kann nur geschaetzt
 * werden, und das soll sichtbar bleiben.
 */
export function getActualDailyUsage(userSupplementId, intakeLogs = [], now = new Date()) {
  const cutoff = toDateKey(new Date(now.getTime() - LOOKBACK_DAYS * MS_PER_DAY));
  const nowKey = toDateKey(now);

  const relevant = intakeLogs.filter(
    (log) =>
      log?.userSupplementId === userSupplementId &&
      !log?.undoneAt &&
      log?.dateKey &&
      log.dateKey >= cutoff &&
      log.dateKey <= nowKey
  );

  if (relevant.length === 0) return null;

  // Erster Log als Startpunkt: Wer erst seit fuenf Tagen dokumentiert,
  // soll nicht so aussehen, als haette er 25 Tage lang nichts genommen.
  const firstKey = relevant.reduce(
    (min, log) => (log.dateKey < min ? log.dateKey : min),
    relevant[0].dateKey
  );
  const spanDays = Math.max(
    1,
    Math.round((new Date(nowKey).getTime() - new Date(firstKey).getTime()) / MS_PER_DAY) + 1
  );

  return {
    unitsPerDay: round2(relevant.length / spanDays),
    observedDays: spanDays,
    intakeCount: relevant.length,
  };
}

/**
 * Geplante Einnahmen pro Tag — Rueckfallebene ohne Log-Daten.
 */
function getPlannedDailyUsage(supplement) {
  const slots = Array.isArray(supplement?.timingSlots) ? supplement.timingSlots.length : 0;
  return slots > 0 ? slots : 1;
}

/**
 * calculateSupplementCost(supplement, stock, intakeLogs)
 *
 * stock: { purchasePrice, packageUnits, currency, ... }
 * Gibt null zurueck, wenn kein Preis hinterlegt ist — geschaetzte Preise
 * waeren erfundene Werte.
 */
export function calculateSupplementCost(supplement, stock, intakeLogs = [], now = new Date()) {
  const price = Number(stock?.purchasePrice);
  const packageUnits = Number(stock?.packageUnits);

  if (!Number.isFinite(price) || price <= 0) return null;
  if (!Number.isFinite(packageUnits) || packageUnits <= 0) return null;

  const costPerUnit = price / packageUnits;

  const actual = getActualDailyUsage(supplement?.id, intakeLogs, now);
  const unitsPerDay = actual?.unitsPerDay ?? getPlannedDailyUsage(supplement);
  const isEstimated = !actual;

  const costPerDay = costPerUnit * unitsPerDay;

  return {
    supplementId: supplement?.id ?? null,
    supplementName: supplement?.name ?? '',
    currency: stock?.currency ?? 'EUR',
    purchasePrice: round2(price),
    packageUnits,
    costPerUnit: round2(costPerUnit),
    unitsPerDay,
    costPerDay: round2(costPerDay),
    costPerMonth: round2(costPerDay * DAYS_PER_MONTH),
    // true = auf Basis des Plans hochgerechnet, nicht aus echten Einnahmen
    isEstimated,
    observedDays: actual?.observedDays ?? null,
  };
}

/**
 * Ordnet einem Produkt den Status seiner Wirkungskontrolle zu.
 *
 *   reviewed-continue  ueberprueft, danach weitergenommen
 *   reviewed-stop      ueberprueft, danach abgesetzt
 *   reviewed-unclear   ueberprueft, Ergebnis blieb unklar
 *   running            wird gerade beobachtet
 *   never-reviewed     nie ueberprueft
 */
export function getReviewStatus(supplementId, trials = []) {
  const own = trials.filter((trial) => trial?.userSupplementId === supplementId);
  if (own.length === 0) return 'never-reviewed';

  if (own.some((trial) => trial.status === TRIAL_STATUS.RUNNING)) return 'running';

  const latest = own
    .slice()
    .sort((a, b) => String(b.concludedAt ?? '').localeCompare(String(a.concludedAt ?? '')))[0];

  switch (latest?.conclusion) {
    case TRIAL_CONCLUSION.CONTINUE: return 'reviewed-continue';
    case TRIAL_CONCLUSION.STOP: return 'reviewed-stop';
    default: return 'reviewed-unclear';
  }
}

/**
 * analyzeCosts(supplements, stockById, options)
 *
 * Rueckgabe:
 *   items          Kosten je Produkt, teuerstes zuerst
 *   totalPerMonth  Summe der bezifferbaren Produkte
 *   withoutPrice   Produkte ohne hinterlegten Preis (nicht mitgerechnet)
 *   neverReviewed  bezifferbare Kosten von nie ueberpruefen Produkten
 *   estimatedCount wie viele Posten auf einer Hochrechnung beruhen
 */
export function analyzeCosts(supplements = [], stockById = {}, options = {}) {
  const { intakeLogs = [], trials = [], now = new Date() } = options;

  const items = [];
  const withoutPrice = [];

  for (const supplement of supplements) {
    const cost = calculateSupplementCost(
      supplement,
      stockById?.[supplement?.id],
      intakeLogs,
      now
    );

    if (!cost) {
      withoutPrice.push({
        supplementId: supplement?.id ?? null,
        supplementName: supplement?.name ?? '',
      });
      continue;
    }

    items.push({ ...cost, reviewStatus: getReviewStatus(supplement?.id, trials) });
  }

  items.sort((a, b) => (b.costPerMonth ?? 0) - (a.costPerMonth ?? 0));

  const totalPerMonth = round2(
    items.reduce((sum, item) => sum + (item.costPerMonth ?? 0), 0)
  );

  const neverReviewedItems = items.filter((item) => item.reviewStatus === 'never-reviewed');

  return {
    items,
    withoutPrice,
    totalPerMonth,
    totalPerDay: round2(items.reduce((sum, item) => sum + (item.costPerDay ?? 0), 0)),
    currency: items[0]?.currency ?? 'EUR',
    neverReviewed: {
      count: neverReviewedItems.length,
      perMonth: round2(
        neverReviewedItems.reduce((sum, item) => sum + (item.costPerMonth ?? 0), 0)
      ),
      names: neverReviewedItems.map((item) => item.supplementName),
    },
    estimatedCount: items.filter((item) => item.isEstimated).length,
  };
}

/**
 * findSharedGoals(trials)
 * Produkte, die auf dieselbe Zielgroesse einzahlen — der Ansatzpunkt fuer
 * "brauche ich das alles". Beruht auf den erfassten Beobachtungen, nicht
 * auf einer Vermutung der App darueber, wofuer etwas gut sein soll.
 */
export function findSharedGoals(trials = []) {
  const byMetric = new Map();

  for (const trial of trials) {
    if (!trial?.metricId || !trial?.supplementName) continue;
    if (!byMetric.has(trial.metricId)) byMetric.set(trial.metricId, new Set());
    byMetric.get(trial.metricId).add(trial.supplementName);
  }

  return [...byMetric.entries()]
    .filter(([, names]) => names.size > 1)
    .map(([metricId, names]) => ({ metricId, names: [...names] }));
}
