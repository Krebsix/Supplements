/**
 * ScheduleGuidance.js
 * ─────────────────────────────────────────────────────────────
 * Erklaerungen fuer einen Tagesplan-Eintrag, ausschliesslich aus belegten
 * Regeln: Einnahme-Hinweise je Substanz (data/interactions.js,
 * INTAKE_GUIDANCE) und Paar-Regeln zwischen den Substanzen dieses
 * Praeparats und denen der anderen aktiven Praeparate (PAIR_RULES).
 *
 * WARUM NICHT AUS DEM SLOT: Der Slot ist timingSlots[0] des Praeparats;
 * niemand hat ihn "entschieden". Eine nachtraeglich erfundene Begruendung
 * waere genau der Fuelltext, den die App nicht schreibt. Was hier steht,
 * hat eine Quelle, oder es steht nicht da.
 */
import { extractPositions } from './StackAnalyzer';
import { findPairInteractions, getIntakeGuidance } from './InteractionCheck';

const MAX_NOTES = 2;

// Erkannte Substanz-IDs eines Praeparats, in Reihenfolge der Positionen,
// ohne Duplikate.
function substanceIdsOf(supplement) {
  const ids = [];
  for (const position of extractPositions(supplement)) {
    const id = position.match?.matched ? position.match.substanceId : null;
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

export function buildEntryGuidance(supplement, activeSupplements = []) {
  const ownIds = substanceIdsOf(supplement);

  const notes = [];
  for (const substanceId of ownIds) {
    if (notes.length >= MAX_NOTES) break;
    const guidance = getIntakeGuidance(substanceId);
    if (guidance?.note && Array.isArray(guidance.sources) && guidance.sources.length > 0) {
      notes.push({ substanceId, text: guidance.note, sources: guidance.sources });
    }
  }

  const conflicts = [];
  const seen = new Set();
  for (const other of activeSupplements) {
    if (!other || other.id === supplement.id) continue;
    if (other.status && other.status !== 'active') continue;

    const otherIds = substanceIdsOf(other);
    for (const rule of findPairInteractions([...ownIds, ...otherIds])) {
      // Herausfinden, welcher Regel-Partner zu diesem und welcher zum
      // anderen Praeparat gehoert -- eine Regel matcht nur, wenn beide
      // Substanzen ueberhaupt in der kombinierten Liste vorkommen, sagt
      // aber nichts darueber, wer welche traegt.
      const mine = ownIds.includes(rule.a) ? rule.a : ownIds.includes(rule.b) ? rule.b : null;
      const theirs = mine === rule.a ? rule.b : rule.a;
      if (!mine || !otherIds.includes(theirs)) continue;

      const key = `${mine}|${theirs}`;
      if (seen.has(key)) continue;
      seen.add(key);

      conflicts.push({
        substanceId: mine,
        partnerSubstanceId: theirs,
        partnerSupplementName: other.name ?? '',
        severity: rule.severity,
        text: rule.note,
        sources: rule.sources,
      });
    }
  }

  return { notes, conflicts };
}
