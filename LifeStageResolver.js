/**
 * LifeStageResolver.js
 * ─────────────────────────────────────────────────────────────
 * Leitet aus Geschlecht, Geburtsjahr und einer Zusatzangabe die
 * Referenzwert-Gruppe (data/referenceValues.js) ab. Ersetzt die Wahl aus
 * acht Lebensphasen im Onboarding; die Gruppen selbst bleiben unveraendert.
 *
 * Nur Fachlogik, kein UI. Grenzfaelle sind hier, nicht im Screen:
 * Schwangerschaftsfrage nur bei Frauen von 15 bis 50, Divers und "keine
 * Angabe" fragen ab 18 nach der Referenzgruppe, unter 4 Jahren gibt es
 * keine Gruppe.
 *
 * Das Alter wird allein aus dem Geburtsjahr berechnet: Wer spaet im Jahr
 * Geburtstag hat, zaehlt bis dahin ein Jahr aelter. Fuer die Zuordnung zu
 * einer Referenzgruppe ist das hinnehmbar, weil die Eingabe bewusst nur
 * das Geburtsjahr abfragt, kein volles Geburtsdatum.
 */

import { LIFE_STAGE_IDS } from './data/referenceValues';

export const GENDERS = ['female', 'male', 'diverse', 'unspecified'];

export const EXTRA_PREGNANCY = {
  NONE: 'none',
  PREGNANT: 'pregnant',
  BREASTFEEDING: 'breastfeeding',
};

const MIN_AGE = 4;
const ACCOUNT_MIN_AGE = 16;

export function ageFromBirthYear(birthYear, today = new Date()) {
  const year = Number(birthYear);
  const current = today.getFullYear();
  if (!Number.isInteger(year) || year < 1900 || year > current) return null;
  return current - year;
}

function ageBand(age) {
  if (age < MIN_AGE) return null;
  if (age <= 10) return 'child';
  if (age <= 17) return 'teen';
  if (age <= 64) return 'adult';
  return 'senior';
}

export function resolveLifeStage({ gender, birthYear, extra, referenceOverride } = {}, today = new Date()) {
  const age = ageFromBirthYear(birthYear, today);
  const base = { lifeStageId: null, needsExtra: null, age, tooYoung: false, underage: false };
  if (age === null) return base;

  const band = ageBand(age);
  const result = { ...base, tooYoung: band === null, underage: age < ACCOUNT_MIN_AGE };
  if (band === null) return result;
  if (band === 'child') return { ...result, lifeStageId: 'child-4-10' };
  if (band === 'senior') return { ...result, lifeStageId: 'senior' };

  const isFemale = gender === 'female';
  const isMale = gender === 'male';

  // Frauen 15 bis 50: Schwangerschaft und Stillzeit haben eigene Gruppen.
  if (isFemale && age >= 15 && age <= 50) {
    if (extra === EXTRA_PREGNANCY.PREGNANT) return { ...result, lifeStageId: 'pregnancy' };
    if (extra === EXTRA_PREGNANCY.BREASTFEEDING) return { ...result, lifeStageId: 'breastfeeding' };
    if (extra === EXTRA_PREGNANCY.NONE) {
      return { ...result, lifeStageId: band === 'teen' ? 'teen-11-17' : 'adult-woman' };
    }
    return { ...result, needsExtra: 'pregnancy' };
  }

  if (band === 'teen') return { ...result, lifeStageId: 'teen-11-17' };

  if (isFemale) return { ...result, lifeStageId: 'menopause' };
  if (isMale) return { ...result, lifeStageId: 'adult-man' };

  // Divers oder keine Angabe: Referenzwerte sind nach Geschlecht
  // differenziert, die Wahl bleibt bei der Nutzerin.
  if (referenceOverride && LIFE_STAGE_IDS.includes(referenceOverride)) {
    return { ...result, lifeStageId: referenceOverride };
  }
  return { ...result, needsExtra: 'reference' };
}

/**
 * extraQuestionFor
 * ─────────────────────────────────────────────────────────────
 * Sagt, welche Zusatzfrage fuer diese Person grundsaetzlich gilt,
 * unabhaengig davon, ob sie schon beantwortet ist. `resolveLifeStage`
 * meldet in `needsExtra` nur "noch unbeantwortet": Sobald `extra` oder
 * `referenceOverride` gesetzt ist, wird `needsExtra` null, auch wenn die
 * Frage fachlich weiter zutrifft. Fuer eine stabile Schrittliste
 * (OnboardingSteps.js) braucht es die Praesenz-Semantik getrennt vom
 * Beantwortet-Status: deshalb hier derselbe Aufruf ohne extra/override,
 * damit beide Werte konsistent bleiben.
 */
export function extraQuestionFor({ gender, birthYear } = {}, today = new Date()) {
  return resolveLifeStage({ gender, birthYear }, today).needsExtra;
}
