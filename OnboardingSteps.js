/**
 * OnboardingSteps.js
 * ─────────────────────────────────────────────────────────────
 * Reine Ablauflogik fuer app/onboarding.jsx: welche Schritte gezeigt
 * werden (buildSteps) und wann der "Weiter"-Knopf je Schritt aktiv ist
 * (canAdvance). Beides stand vorher im Screen; hier ist es testbar und
 * von der Render-Reihenfolge unabhaengig.
 *
 * Wichtig fuer buildSteps: Ob die Zusatzfrage (extra) in der Liste steht,
 * haengt an `extraQuestionFor` (LifeStageResolver.js), NICHT an
 * `resolveLifeStage(...).needsExtra`. `needsExtra` meldet nur "noch
 * unbeantwortet" und wird null, sobald die Frage beantwortet ist -- eine
 * Schrittliste, die daran haengt, wuerde den gerade beantworteten Schritt
 * im selben Render aus der Liste werfen (siehe Commit-Historie: dadurch
 * fehlte "Weiter" auf der Zusatzfrage). `extraQuestionFor` fragt dieselbe
 * Fachregel ohne Antwort ab und bleibt deshalb stabil, solange sich
 * Geschlecht und Geburtsjahr nicht aendern.
 */

import { extraQuestionFor, resolveLifeStage } from './LifeStageResolver';

export const STEP_IDS = {
  WELCOME: 'welcome',
  LEGAL: 'legal',
  NAME: 'name',
  GENDER: 'gender',
  BIRTH_YEAR: 'birthYear',
  EXTRA: 'extra',
  ROUTINE_TIMES: 'routineTimes',
  ROUTINE_FIRST: 'routineFirst',
  ACCOUNT: 'account',
  DONE: 'done',
};

export function buildSteps({ gender, birthYear } = {}, today = new Date()) {
  const hasExtraQuestion = Boolean(extraQuestionFor({ gender, birthYear }, today));
  const { underage } = resolveLifeStage({ gender, birthYear }, today);

  return [
    STEP_IDS.WELCOME,
    STEP_IDS.LEGAL,
    STEP_IDS.NAME,
    STEP_IDS.GENDER,
    STEP_IDS.BIRTH_YEAR,
    ...(hasExtraQuestion ? [STEP_IDS.EXTRA] : []),
    STEP_IDS.ROUTINE_TIMES,
    STEP_IDS.ROUTINE_FIRST,
    ...(underage ? [] : [STEP_IDS.ACCOUNT]),
    STEP_IDS.DONE,
  ];
}

/**
 * canAdvance
 * ─────────────────────────────────────────────────────────────
 * `resolved` ist das Ergebnis von resolveLifeStage() mit den aktuellen
 * Antworten. Fuer den Zusatzschritt bestimmt `resolved.needsExtra` die Art
 * der Frage (pregnancy/reference), solange sie unbeantwortet ist; ist sie
 * bereits beantwortet, ist needsExtra null und mindestens eines der beiden
 * Antwortfelder ist gesetzt, der Fallback greift dann direkt.
 */
export function canAdvance(stepId, answers = {}, resolved = {}) {
  switch (stepId) {
    case STEP_IDS.GENDER:
      return Boolean(answers.gender);
    case STEP_IDS.BIRTH_YEAR:
      return answers.birthYear !== null && answers.birthYear !== undefined && !resolved.tooYoung;
    case STEP_IDS.EXTRA:
      if (resolved.needsExtra === 'pregnancy') return Boolean(answers.extra);
      if (resolved.needsExtra === 'reference') return Boolean(answers.referenceOverride);
      return Boolean(answers.extra) || Boolean(answers.referenceOverride);
    case STEP_IDS.ROUTINE_FIRST:
      return Boolean(answers.firstAction);
    default:
      return true;
  }
}
