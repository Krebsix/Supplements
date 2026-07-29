/**
 * OutcomeTracker.js
 * ─────────────────────────────────────────────────────────────
 * Wirkungskontrolle: Ziel festlegen, Ausgangswert festhalten, ueber einen
 * Zeitraum bewerten — und am Ende ehrlich einordnen, was das aussagt.
 *
 * DAS EIGENTLICHE PROBLEM IST NICHT DAS MESSEN, SONDERN DAS DEUTEN.
 * Wer ein Praeparat nimmt und sich danach besser fuehlt, schreibt das dem
 * Praeparat zu. Dabei laufen immer mehrere Dinge gleichzeitig: andere
 * Supplements, Jahreszeit, Schlaf, Stress, und nicht zuletzt die
 * Erwartung selbst. Eine App, die "Magnesium hat deinen Schlaf
 * verbessert" ausgibt, behauptet eine Kausalitaet, die aus diesen Daten
 * grundsaetzlich nicht ableitbar ist.
 *
 * Deshalb liefert dieses Modul zwei Dinge getrennt:
 *   1. was sich veraendert hat (Zahlen, unstrittig)
 *   2. was dagegen spricht, das der Einnahme zuzuschreiben (Stoerfaktoren)
 *
 * Punkt 2 ist der Grund, warum es dieses Modul gibt. Ohne ihn waere die
 * Wirkungskontrolle ein Bestaetigungsautomat.
 *
 * Wie ueberall: keine Gesundheitsaussagen. Die App sagt nicht, ob etwas
 * wirkt oder ob man es weiternehmen soll — sie legt die eigene
 * Beobachtung neben die eigenen Rahmenbedingungen.
 */

import {
  MIN_MEANINGFUL_DURATION,
  MIN_RATINGS_FOR_COMPARISON,
  SCALE_MAX,
  SCALE_MIN,
  getOutcomeMetric,
} from './data/outcomeMetrics';

const MS_PER_DAY = 86400000;

export const TRIAL_STATUS = {
  RUNNING: 'running',
  COMPLETED: 'completed',
  STOPPED: 'stopped',
};

export const TRIAL_CONCLUSION = {
  CONTINUE: 'continue',
  STOP: 'stop',
  UNCLEAR: 'unclear',
};

/** Warum eine Veraenderung nicht der Einnahme zugeschrieben werden kann. */
export const CONFOUNDER = {
  PARALLEL_TRIALS: 'parallel_trials',
  SHORT_DURATION: 'short_duration',
  FEW_RATINGS: 'few_ratings',
  LOW_ADHERENCE: 'low_adherence',
  NO_BASELINE: 'no_baseline',
  SMALL_CHANGE: 'small_change',
};

function toDateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function daysBetween(from, to) {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.floor((end - start) / MS_PER_DAY);
}

function average(values) {
  if (!values.length) return null;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

export function clampRating(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(num)));
}

/**
 * createTrial(input)
 * Legt einen Wirkungstest an. Der Ausgangswert wird BEIM START erfasst —
 * nachtraeglich erinnert man ihn systematisch guenstiger, als er war.
 */
export function createTrial(input = {}) {
  const now = input.startedAt ?? new Date().toISOString();

  return {
    id: input.id ?? `trial-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userSupplementId: input.userSupplementId ?? null,
    supplementName: input.supplementName ?? '',
    metricId: input.metricId ?? null,
    reason: typeof input.reason === 'string' ? input.reason.trim() : '',
    baselineValue: clampRating(input.baselineValue),
    startedAt: now,
    durationDays: Number.isFinite(Number(input.durationDays))
      ? Number(input.durationDays)
      : 28,
    status: TRIAL_STATUS.RUNNING,
    conclusion: null,
    concludedAt: null,
  };
}

export function createRating(trialId, value, note = '', date = new Date()) {
  const clamped = clampRating(value);
  if (clamped === null) return null;

  return {
    id: `rating-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    trialId,
    value: clamped,
    note: typeof note === 'string' ? note.trim() : '',
    dateKey: toDateKey(date),
    createdAt: new Date(date).toISOString(),
  };
}

/**
 * Einnahmetreue im Testzeitraum: an wie vielen der vergangenen Tage wurde
 * das Praeparat tatsaechlich dokumentiert.
 *
 * Ohne diese Zahl ist jede Auswertung wertlos — wer an der Haelfte der
 * Tage nichts genommen hat, beobachtet etwas anderes als eine Wirkung.
 */
export function calculateAdherence(trial, intakeLogs = [], now = new Date()) {
  if (!trial?.userSupplementId) return null;

  const elapsed = Math.max(1, daysBetween(trial.startedAt, now) + 1);
  const startKey = toDateKey(trial.startedAt);
  const nowKey = toDateKey(now);

  const loggedDays = new Set(
    intakeLogs
      .filter((log) =>
        log?.userSupplementId === trial.userSupplementId &&
        !log?.undoneAt &&
        log?.dateKey &&
        log.dateKey >= startKey &&
        log.dateKey <= nowKey
      )
      .map((log) => log.dateKey)
  );

  return {
    loggedDays: loggedDays.size,
    elapsedDays: elapsed,
    percent: Math.round((loggedDays.size / elapsed) * 100),
  };
}

/**
 * evaluateTrial(trial, ratings, options)
 *
 * Gibt Zahlen und Stoerfaktoren getrennt zurueck. Die Formulierung
 * uebernimmt die Oberflaeche — dieses Modul liefert bewusst keine
 * fertigen Saetze, damit es uebersetzbar bleibt und nicht versehentlich
 * eine Wertung mitliefert.
 */
export function evaluateTrial(trial, ratings = [], options = {}) {
  if (!trial) return null;

  const { intakeLogs = [], allTrials = [], now = new Date() } = options;
  const metric = getOutcomeMetric(trial.metricId);

  const own = ratings
    .filter((rating) => rating?.trialId === trial.id)
    .slice()
    .sort((a, b) => String(a.dateKey).localeCompare(String(b.dateKey)));

  const values = own.map((rating) => rating.value).filter(Number.isFinite);
  const elapsedDays = Math.max(0, daysBetween(trial.startedAt, now));
  const remainingDays = Math.max(0, trial.durationDays - elapsedDays);

  const currentAverage = average(values);
  // Der juengere Teil der Bewertungen zeigt den aktuellen Stand deutlicher
  // als der Gesamtschnitt, der die Anfangsphase mitschleppt.
  const recentAverage = average(values.slice(-Math.max(3, Math.ceil(values.length / 2))));

  const hasBaseline = Number.isFinite(trial.baselineValue);
  const comparable = hasBaseline && values.length >= MIN_RATINGS_FOR_COMPARISON;

  let change = null;
  let directionLabel = null;
  if (comparable && recentAverage !== null) {
    const raw = Math.round((recentAverage - trial.baselineValue) * 10) / 10;
    change = raw;
    if (Math.abs(raw) < 0.5) {
      directionLabel = 'unchanged';
    } else if (metric?.direction === 'lower-better') {
      directionLabel = raw < 0 ? 'improved' : 'worsened';
    } else {
      directionLabel = raw > 0 ? 'improved' : 'worsened';
    }
  }

  const adherence = calculateAdherence(trial, intakeLogs, now);

  // ── Stoerfaktoren ────────────────────────────────────────────
  const confounders = [];

  // Der wichtigste Fall: parallel gestartete Tests. Wer zwei Praeparate
  // gleichzeitig beginnt, kann eine Veraenderung keinem davon zuordnen.
  const parallel = allTrials.filter(
    (other) =>
      other &&
      other.id !== trial.id &&
      other.status === TRIAL_STATUS.RUNNING &&
      Math.abs(daysBetween(trial.startedAt, other.startedAt)) <= trial.durationDays
  );
  if (parallel.length > 0) {
    confounders.push({
      type: CONFOUNDER.PARALLEL_TRIALS,
      count: parallel.length,
      names: parallel.map((other) => other.supplementName).filter(Boolean),
    });
  }

  if (trial.durationDays < MIN_MEANINGFUL_DURATION) {
    confounders.push({ type: CONFOUNDER.SHORT_DURATION, days: trial.durationDays });
  }

  if (values.length < MIN_RATINGS_FOR_COMPARISON) {
    confounders.push({
      type: CONFOUNDER.FEW_RATINGS,
      count: values.length,
      needed: MIN_RATINGS_FOR_COMPARISON,
    });
  }

  if (adherence && adherence.percent < 70 && adherence.elapsedDays >= 7) {
    confounders.push({ type: CONFOUNDER.LOW_ADHERENCE, percent: adherence.percent });
  }

  if (!hasBaseline) {
    confounders.push({ type: CONFOUNDER.NO_BASELINE });
  }

  // Eine Veraenderung um weniger als einen halben Skalenpunkt liegt bei
  // einer 5er-Selbsteinschaetzung im Bereich der Tagesform.
  if (comparable && change !== null && Math.abs(change) < 0.5) {
    confounders.push({ type: CONFOUNDER.SMALL_CHANGE, change });
  }

  return {
    trialId: trial.id,
    metricId: trial.metricId,
    metricDirection: metric?.direction ?? 'higher-better',
    baseline: hasBaseline ? trial.baselineValue : null,
    currentAverage,
    recentAverage,
    change,
    directionLabel,
    ratingCount: values.length,
    ratings: own,
    elapsedDays,
    remainingDays,
    durationDays: trial.durationDays,
    isDue: elapsedDays >= trial.durationDays,
    adherence,
    confounders,
    // Der Vergleich wird nur gezeigt, wenn ueberhaupt genug Daten da sind.
    // Sonst suggeriert eine Zahl Aussagekraft, die sie nicht hat.
    showComparison: comparable,
  };
}

/**
 * concludeTrial(trial, conclusion)
 * Haelt die Entscheidung fest. Die App trifft sie nicht — sie fragt danach
 * und dokumentiert die Antwort.
 */
export function concludeTrial(trial, conclusion) {
  const valid = Object.values(TRIAL_CONCLUSION).includes(conclusion);
  if (!trial || !valid) return trial;

  return {
    ...trial,
    status: conclusion === TRIAL_CONCLUSION.STOP
      ? TRIAL_STATUS.STOPPED
      : TRIAL_STATUS.COMPLETED,
    conclusion,
    concludedAt: new Date().toISOString(),
  };
}

/**
 * getDueTrials(trials, now)
 * Tests, deren Beobachtungszeitraum abgelaufen ist und die auf eine
 * Entscheidung warten — der Anlass fuer den periodischen Stack Review.
 */
export function getDueTrials(trials = [], now = new Date()) {
  return trials.filter(
    (trial) =>
      trial?.status === TRIAL_STATUS.RUNNING &&
      daysBetween(trial.startedAt, now) >= trial.durationDays
  );
}
