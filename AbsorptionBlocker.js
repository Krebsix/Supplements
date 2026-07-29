/**
 * AbsorptionBlocker.js
 * ─────────────────────────────────────────────────────────────
 * Globale 2h-Sperre für alle Supplements, wenn Flohsamenschalen
 * geloggt wurden. ID 43 = Flohsamenschalen (Absorption-Blocker).
 */

import { tr } from './i18n/runtime';

export const ABSORPTION_BLOCKER_ID = 43;
export const BLOCK_DURATION_MS     = 2 * 60 * 60 * 1000; // 2 Stunden

// ─────────────────────────────────────────────────────────────
// isBlocked(blockerLoggedAt: Date | null)
// Gibt { blocked: bool, remainingMinutes: number } zurück
// ─────────────────────────────────────────────────────────────
export function isBlocked(blockerLoggedAt) {
  if (!blockerLoggedAt) return { blocked: false, remainingMinutes: 0 };

  const elapsed   = Date.now() - new Date(blockerLoggedAt).getTime();
  const remaining = BLOCK_DURATION_MS - elapsed;

  if (remaining <= 0) return { blocked: false, remainingMinutes: 0 };

  return {
    blocked:          true,
    remainingMinutes: Math.ceil(remaining / 60000),
    unlocksAt:        new Date(new Date(blockerLoggedAt).getTime() + BLOCK_DURATION_MS),
  };
}

// ─────────────────────────────────────────────────────────────
// getBlockMessage(remainingMinutes)
// ─────────────────────────────────────────────────────────────
export function getBlockMessage(remainingMinutes) {
  return tr('logic.absorption.blocked', { minutes: remainingMinutes });
}

// ─────────────────────────────────────────────────────────────
// shouldTriggerBlock(supplementId)
// ─────────────────────────────────────────────────────────────
export function shouldTriggerBlock(supplement) {
  const libraryId = typeof supplement === 'object' ? supplement.libraryId ?? supplement.id : supplement;
  const conflictTags = typeof supplement === 'object' && Array.isArray(supplement.conflictTags)
    ? supplement.conflictTags
    : [];
  const flags = typeof supplement === 'object' ? supplement.flags || {} : {};

  return (
    libraryId === ABSORPTION_BLOCKER_ID ||
    conflictTags.includes('ALL') ||
    flags.isAbsorptionBlocker === true
  );
}
