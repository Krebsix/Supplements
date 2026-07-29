/**
 * TimingEngine.js
 * ─────────────────────────────────────────────────────────────
 * Verwaltet Tages-Slots und ordnet Supplements ein.
 */

import { tr } from './i18n/runtime';
import inventory from './inventory.json';

export const SLOT_ORDER = ['fasted', 'morning', 'midday', 'pre_sport', 'post_sport', 'evening'];

const SLOT_EMOJI = {
  fasted: '🌅',
  morning: '☀️',
  midday: '🌤️',
  pre_sport: '💪',
  post_sport: '🏁',
  evening: '🌙',
};

/**
 * getSlot(slotId)
 * Label und Zeitangabe werden bei jedem Aufruf uebersetzt, nicht einmalig
 * beim Laden des Moduls — sonst bliebe die Sprache auf dem Stand, den sie
 * beim App-Start hatte.
 */
export function getSlot(slotId) {
  if (!SLOT_ORDER.includes(slotId)) return null;
  return {
    id: slotId,
    label: tr(`logic.slot.${slotId}.label`),
    emoji: SLOT_EMOJI[slotId],
    time: tr(`logic.slot.${slotId}.time`),
  };
}

/**
 * SLOTS als Getter-Objekt: liest sich im aufrufenden Code weiterhin wie
 * die fruehere Konstante (SLOTS.morning.label), liefert aber die jeweils
 * aktuelle Sprache.
 */
export const SLOTS = Object.freeze(
  Object.fromEntries(
    SLOT_ORDER.map((slotId) => [
      slotId,
      Object.defineProperties(
        { id: slotId, emoji: SLOT_EMOJI[slotId] },
        {
          label: { get: () => tr(`logic.slot.${slotId}.label`), enumerable: true },
          time: { get: () => tr(`logic.slot.${slotId}.time`), enumerable: true },
        }
      ),
    ])
  )
);

// ─────────────────────────────────────────────────────────────
// getSupplementsBySlot()
// Gibt ein Objekt { slotId: [supplement, ...] } zurück
// ─────────────────────────────────────────────────────────────
export function getSupplementsBySlot(profile = 'adult', sourceInventory = inventory) {
  const filtered = sourceInventory.filter(s =>
    profile === 'child' ? s.childSafe : true
  );

  const result = Object.fromEntries(SLOT_ORDER.map(s => [s, []]));

  for (const supplement of filtered) {
    // Primären Slot nehmen (erster Eintrag in timingSlots)
    const primarySlot = supplement.timingSlots?.[0];
    if (primarySlot && result[primarySlot] !== undefined) {
      result[primarySlot].push(supplement);
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// getPrimarySlot(supplementId)
// ─────────────────────────────────────────────────────────────
export function getPrimarySlot(supplementId, sourceInventory = inventory) {
  const s = sourceInventory.find(x => x.id === supplementId);
  return s?.timingSlots?.[0] ?? null;
}

// ─────────────────────────────────────────────────────────────
// getSlotLabel(slotId)
// ─────────────────────────────────────────────────────────────
export function getSlotLabel(slotId) {
  return SLOT_ORDER.includes(slotId) ? tr(`logic.slot.${slotId}.label`) : slotId;
}

// ─────────────────────────────────────────────────────────────
// buildDailySchedule(loggedIds[], profile)
// Gibt geordnete Timeline für das Dashboard zurück
// ─────────────────────────────────────────────────────────────
export function buildDailySchedule(loggedIds = [], profile = 'adult', sourceInventory = inventory) {
  const bySlot = getSupplementsBySlot(profile, sourceInventory);

  return SLOT_ORDER.map(slotId => ({
    slot:        SLOTS[slotId],
    supplements: bySlot[slotId].map(s => ({
      ...s,
      logged: loggedIds.includes(s.id),
    })),
  }));
}
