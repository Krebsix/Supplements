/**
 * data/outcomeMetrics.js
 * ─────────────────────────────────────────────────────────────
 * Zielgroessen fuer die Wirkungskontrolle.
 *
 * Alles hier ist SUBJEKTIV und wird auch so behandelt. Die App misst
 * nichts, sie protokolliert eine Selbsteinschaetzung. Deshalb eine grobe
 * 5er-Skala statt Prozentwerten oder Nachkommastellen: Wer "63 %
 * Schlafqualitaet" eintraegt, suggeriert eine Genauigkeit, die es bei
 * einer Selbsteinschaetzung nicht gibt.
 *
 * `direction` sagt, in welche Richtung "besser" liegt. Bei Beschwerden
 * ist ein niedriger Wert das Ziel, bei Energie ein hoher — ohne dieses
 * Feld wuerde die Auswertung Verschlechterungen als Verbesserungen lesen.
 *
 * Die Beschriftungen der Skalenenden stehen bewusst in den
 * i18n-Katalogen und nicht hier: Sie sind Oberflaeche, keine Fachdaten.
 */

export const SCALE_MIN = 1;
export const SCALE_MAX = 5;

/**
 * direction:
 *   'higher-better'  5 ist der angestrebte Zustand (Energie, Schlafqualitaet)
 *   'lower-better'   1 ist der angestrebte Zustand (Beschwerden, Nebenwirkungen)
 */
export const OUTCOME_METRICS = [
  { id: 'sleep-quality', labelKey: 'outcome.metric.sleepQuality', direction: 'higher-better' },
  { id: 'sleep-onset', labelKey: 'outcome.metric.sleepOnset', direction: 'lower-better' },
  { id: 'energy', labelKey: 'outcome.metric.energy', direction: 'higher-better' },
  { id: 'focus', labelKey: 'outcome.metric.focus', direction: 'higher-better' },
  { id: 'mood', labelKey: 'outcome.metric.mood', direction: 'higher-better' },
  { id: 'digestion', labelKey: 'outcome.metric.digestion', direction: 'higher-better' },
  { id: 'muscle-complaints', labelKey: 'outcome.metric.muscleComplaints', direction: 'lower-better' },
  { id: 'recovery', labelKey: 'outcome.metric.recovery', direction: 'higher-better' },
  { id: 'training-performance', labelKey: 'outcome.metric.trainingPerformance', direction: 'higher-better' },
  { id: 'skin-hair-nails', labelKey: 'outcome.metric.skinHairNails', direction: 'higher-better' },
  { id: 'wellbeing', labelKey: 'outcome.metric.wellbeing', direction: 'higher-better' },
  { id: 'side-effects', labelKey: 'outcome.metric.sideEffects', direction: 'lower-better' },
];

export function getOutcomeMetric(id) {
  return OUTCOME_METRICS.find((metric) => metric.id === id) ?? null;
}

/**
 * Vorgeschlagene Beobachtungsdauern.
 *
 * Die Untergrenze von 14 Tagen ist kein Zufall: Bei kuerzeren Zeitraeumen
 * dominieren Tagesschwankungen und Erwartungseffekte so stark, dass sich
 * aus dem Verlauf praktisch nichts ablesen laesst. Die App laesst kuerzere
 * Zeitraeume zwar zu, weist aber in der Auswertung darauf hin.
 */
export const TRIAL_DURATIONS = [14, 28, 56, 84];
export const MIN_MEANINGFUL_DURATION = 14;

/**
 * Wie viele Bewertungen mindestens vorliegen sollten, bevor ein
 * Vorher-Nachher-Vergleich ueberhaupt gezeigt wird. Bei zwei Eintraegen
 * waere jeder "Trend" reines Rauschen.
 */
export const MIN_RATINGS_FOR_COMPARISON = 5;
