/**
 * TimingEngine.js
 * ─────────────────────────────────────────────────────────────
 * Verwaltet Tages-Slots und ordnet Supplements ein.
 */

import inventory from './inventory.json';

// ── Slot-Definitionen ────────────────────────────────────────
export const SLOTS = {
  fasted:     { id: 'fasted',     label: 'Nüchtern',   emoji: '🌅', time: '06:00–07:00' },
  morning:    { id: 'morning',    label: 'Morgen',      emoji: '☀️', time: '07:00–09:00' },
  midday:     { id: 'midday',     label: 'Mittag',      emoji: '🌤️', time: '12:00–13:00' },
  pre_sport:  { id: 'pre_sport',  label: 'Vor Sport',   emoji: '💪', time: '60–90 min vor Training' },
  post_sport: { id: 'post_sport', label: 'Nach Sport',  emoji: '🏁', time: 'Direkt nach Training' },
  evening:    { id: 'evening',    label: 'Abend',       emoji: '🌙', time: '19:00–21:00' },
};

export const SLOT_ORDER = ['fasted', 'morning', 'midday', 'pre_sport', 'post_sport', 'evening'];

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
  return SLOTS[slotId]?.label ?? slotId;
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
