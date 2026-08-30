/**
 * SlotSuggestion.js
 * Vorschlag des Einnahmezeitpunkts fuer ein neues Praeparat und Ableitung
 * der Tages-Slots aus der Haeufigkeit (1x, 2x, 3x).
 *
 * Reine Logik ohne Store und UI. Der Vorschlag ist eine Voreinstellung im
 * Formular, keine Empfehlung: Er entsteht nur aus Saetzen, die in
 * data/interactions.js (INTAKE_GUIDANCE) oder data/substances.js
 * (fatSoluble + sources) mit Quelle stehen. Ohne Regel bleibt es beim
 * Standard 'morning' mit reason null, und die Oberflaeche sagt das so.
 */

import { getIntakeGuidance } from './InteractionCheck';
import { extractPositions } from './StackAnalyzer';
import { SLOT_ORDER } from './TimingEngine';
import { localizeIntakeNote } from './data/localize';
import { getSubstance, normalizeSources } from './data/substances';
import { tr } from './i18n/runtime';

export const DEFAULT_SLOT = 'morning';

/**
 * Uebersetzung belegter Einnahme-Hinweise in einen Slot. Jede Zeile
 * traegt den Satz aus INTAKE_GUIDANCE, der sie rechtfertigt; ein Test
 * prueft, dass die Regel dort mit Quelle existiert.
 *
 *   iron       "Eisen wird nüchtern am besten aufgenommen"        → fasted
 *   melatonin  "üblicherweise kurz vor dem Zubettgehen eingesetzt" → evening
 *   caffeine   "Einnahme am späteren Tag kann den Schlaf
 *               beeinträchtigen"                                    → morning
 *
 * psyllium (viel trinken) und creatine (Zeitpunkt zweitrangig) haben
 * Hinweise ohne Zeitpunkt und stehen deshalb bewusst nicht hier.
 */
export const SLOT_BY_GUIDANCE = {
  iron: 'fasted',
  melatonin: 'evening',
  caffeine: 'morning',
};

/** Erkannte Substanz-IDs aus der Zutatenliste, ohne Duplikate. */
export function substanceIdsFromDetails(ingredientDetails) {
  if (!Array.isArray(ingredientDetails) || ingredientDetails.length === 0) return [];
  const ids = [];
  for (const position of extractPositions({ ingredientDetails })) {
    const id = position.match?.matched ? position.match.substanceId : null;
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

/**
 * suggestPrimarySlot(substanceIds) => { slot, reason }
 * Prioritaet: Einnahme-Hinweis mit Zeitpunkt, dann fettloeslich, dann
 * Standard. reason: null | { key, substanceId, text, sources }.
 */
export function suggestPrimarySlot(substanceIds = []) {
  const ids = Array.isArray(substanceIds) ? substanceIds : [];

  for (const id of ids) {
    const slot = SLOT_BY_GUIDANCE[id];
    if (!slot) continue;
    const guidance = getIntakeGuidance(id);
    if (guidance?.note && Array.isArray(guidance.sources) && guidance.sources.length > 0) {
      return {
        slot,
        reason: {
          key: 'guidance',
          substanceId: id,
          text: localizeIntakeNote(id, guidance.note),
          sources: guidance.sources,
        },
      };
    }
  }

  for (const id of ids) {
    const substance = getSubstance(id);
    if (!substance?.fatSoluble) continue;
    const sources = normalizeSources(substance.sources);
    if (sources.length === 0) continue;
    return {
      slot: DEFAULT_SLOT,
      reason: {
        key: 'fatSoluble',
        substanceId: id,
        text: tr('logic.slotSuggestion.fatSoluble', { name: substance.name }),
        sources,
      },
    };
  }

  return { slot: DEFAULT_SLOT, reason: null };
}

/**
 * expandSlots(primarySlot, timesPerDay) => string[]
 * 1x: der Vorschlag. 2x: Vorschlag + Abend (ist der Vorschlag der Abend:
 * Morgen + Abend). 3x: Morgen, Mittag, Abend; ist der Vorschlag
 * "nuechtern", ersetzt er den Morgen. Ergebnis in SLOT_ORDER-Reihenfolge.
 */
export function expandSlots(primarySlot, timesPerDay = 1) {
  const primary = SLOT_ORDER.includes(primarySlot) ? primarySlot : DEFAULT_SLOT;
  const times = Math.min(3, Math.max(1, Number.parseInt(timesPerDay, 10) || 1));

  let slots;
  if (times === 1) {
    slots = [primary];
  } else if (times === 2) {
    slots = primary === 'evening' ? ['morning', 'evening'] : [primary, 'evening'];
  } else {
    slots = primary === 'fasted' ? ['fasted', 'midday', 'evening'] : ['morning', 'midday', 'evening'];
  }
  return SLOT_ORDER.filter((id) => slots.includes(id));
}

/** suggestSlots({ substanceIds, timesPerDay }) => { slots, reason } */
export function suggestSlots({ substanceIds = [], timesPerDay = 1 } = {}) {
  const { slot, reason } = suggestPrimarySlot(substanceIds);
  return { slots: expandSlots(slot, timesPerDay), reason };
}
