/**
 * AbsorptionBlocker.js
 * ─────────────────────────────────────────────────────────────
 * Globale 2h-Sperre für alle Supplements, wenn Flohsamenschalen
 * geloggt wurden. ID 43 = Flohsamenschalen (Absorption-Blocker).
 */

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
  return `🚫 Flohsamenschalen aktiv – alle Supplements für noch ${remainingMinutes} Min. gesperrt.`;
}

// ─────────────────────────────────────────────────────────────
// shouldTriggerBlock(supplementId)
// ─────────────────────────────────────────────────────────────
export function shouldTriggerBlock(supplementId) {
  return supplementId === ABSORPTION_BLOCKER_ID;
}
