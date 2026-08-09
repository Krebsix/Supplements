/**
 * InteractionCheck.js
 * Wechselwirkungen und Einnahme-Hinweise auf Substanz-Ebene
 * (data/interactions.js), im Gegensatz zu ConflictLogic.js, das am
 * Beispiel-Inventar haengt.
 *
 * Reine Funktionen ohne UI-Bezug:
 *   findPairInteractions(substanceIds)  alle Regeln, deren beide Partner
 *                                       in der Liste vorkommen
 *   getIntakeGuidance(substanceId)     Einnahme-Hinweis oder null
 *
 * Verdrahtung in Screens folgt separat (SubstanceInsightCard,
 * Analyse-Tab); Logik NIEMALS in UI-Komponenten.
 */

import { INTAKE_GUIDANCE, PAIR_RULES } from './data/interactions';
import { getSubstance } from './data/substances';

const VALID_SEVERITIES = new Set(['critical', 'notice', 'info', 'synergy']);

/**
 * findPairInteractions(substanceIds)
 * Liefert alle Paar-Regeln, deren beide Substanzen in der Liste stehen,
 * angereichert um die Klarnamen. Unbekannte IDs werden ignoriert.
 */
export function findPairInteractions(substanceIds = []) {
  const present = new Set(
    (substanceIds || []).filter((id) => Boolean(getSubstance(id)))
  );
  return PAIR_RULES.filter(
    (rule) => present.has(rule.a) && present.has(rule.b)
  ).map((rule) => ({
    ...rule,
    aName: getSubstance(rule.a)?.name ?? rule.a,
    bName: getSubstance(rule.b)?.name ?? rule.b,
  }));
}

/**
 * getIntakeGuidance(substanceId)
 * Einnahme-Hinweis fuer eine Substanz oder null. Kein Fallback, kein
 * generierter Text: Was nicht belegt hinterlegt ist, wird nicht angezeigt.
 */
export function getIntakeGuidance(substanceId) {
  return INTAKE_GUIDANCE[substanceId] ?? null;
}

// Fuer Tests exportiert: Struktur-Invarianten des Datenmoduls.
export function validateInteractionData() {
  const problems = [];
  for (const rule of PAIR_RULES) {
    if (!getSubstance(rule.a)) problems.push(`Unbekannte Substanz-ID: ${rule.a}`);
    if (!getSubstance(rule.b)) problems.push(`Unbekannte Substanz-ID: ${rule.b}`);
    if (!VALID_SEVERITIES.has(rule.severity)) {
      problems.push(`Ungueltige Severity bei ${rule.a}/${rule.b}: ${rule.severity}`);
    }
    if (!rule.note || !Array.isArray(rule.sources) || rule.sources.length === 0) {
      problems.push(`Regel ${rule.a}/${rule.b} ohne Text oder Quelle`);
    }
  }
  for (const [id, guidance] of Object.entries(INTAKE_GUIDANCE)) {
    if (!getSubstance(id)) problems.push(`Unbekannte Guidance-ID: ${id}`);
    if (!guidance?.note || !Array.isArray(guidance?.sources) || guidance.sources.length === 0) {
      problems.push(`Guidance ${id} ohne Text oder Quelle`);
    }
  }
  return problems;
}
