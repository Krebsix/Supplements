/**
 * OnboardingSteps.js
 * ─────────────────────────────────────────────────────────────
 * Reine Ablauflogik fuer app/onboarding.jsx: welche Schritte gezeigt
 * werden (buildSteps) und wann der "Weiter"-Knopf je Schritt aktiv ist
 * (canAdvance). Beides stand vorher im Screen; hier ist es testbar und
 * von der Render-Reihenfolge unabhaengig.
 *
 * buildSteps() liefert immer genau zwei Schritte (start, routine) -- die
 * Zusatzfrage (Schwangerschaft/Referenzgruppe) ist kein eigener Listen-
 * Eintrag mehr, sondern wird INNERHALB von "start" bedingt gerendert.
 * `resolved.needsExtra` (LifeStageResolver.js) bleibt trotzdem wichtig:
 * canAdvance('start', ...) braucht es, um zu wissen, ob die Zusatzfrage
 * ueberhaupt beantwortet werden muss, bevor "Weiter" freigegeben wird.
 */

export const STEP_IDS = {
  START: 'start',
  ROUTINE: 'routine',
};

export function buildSteps() {
  return [STEP_IDS.START, STEP_IDS.ROUTINE];
}

/**
 * canAdvance
 * ─────────────────────────────────────────────────────────────
 * `resolved` ist das Ergebnis von resolveLifeStage() mit den aktuellen
 * Antworten. canAdvance('start', ...) buendelt die frueheren Einzel-
 * bedingungen von Geschlecht, Geburtsjahr und Zusatzfrage: `resolved.
 * needsExtra` bestimmt die Art der Frage (pregnancy/reference), solange
 * sie unbeantwortet ist; ist sie beantwortet, ist needsExtra null und
 * "start" ist frei. canAdvance('routine', ...) entspricht unveraendert
 * der alten ROUTINE_FIRST-Regel.
 */
export function canAdvance(stepId, answers = {}, resolved = {}) {
  switch (stepId) {
    case STEP_IDS.START: {
      if (!answers.gender) return false;
      if (answers.birthYear === null || answers.birthYear === undefined || resolved.tooYoung) return false;
      if (resolved.needsExtra === 'pregnancy') return Boolean(answers.extra);
      if (resolved.needsExtra === 'reference') return Boolean(answers.referenceOverride);
      return true;
    }
    case STEP_IDS.ROUTINE:
      return Boolean(answers.firstAction);
    default:
      return true;
  }
}
