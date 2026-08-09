/**
 * CureManager.js
 * ─────────────────────────────────────────────────────────────
 * Verwaltung von Kur-Zyklen:
 *   - cycle:   ON/OFF-Zyklus   (z.B. Lions Mane 21/7)
 *   - stepped: Stufen-Dosierung (z.B. Testo Booster 5→7→10 Tropfen)
 */

import { tr } from './i18n/runtime';

const MS_PER_DAY = 86_400_000;

// ─────────────────────────────────────────────────────────────
// getCycleStatus(cureConfig, startDate)
//
// Returns: { phase: 'on'|'off', dayInPhase, daysLeft, nextPhase }
// ─────────────────────────────────────────────────────────────
export function getCycleStatus(cureConfig, startDate) {
  if (!cureConfig || cureConfig.type !== 'cycle' || !startDate) {
    return { phase: 'unknown', dayInPhase: 0, daysLeft: 0 };
  }

  const { onDays, offDays } = cureConfig;
  const cycleLength = onDays + offDays;
  const elapsed     = Math.floor((Date.now() - new Date(startDate).getTime()) / MS_PER_DAY);
  const dayInCycle  = elapsed % cycleLength;

  if (dayInCycle < onDays) {
    return {
      phase:       'on',
      dayInPhase:  dayInCycle + 1,
      totalDays:   onDays,
      daysLeft:    onDays - dayInCycle - 1,
      nextPhase:   'off',
    };
  } else {
    const dayInOff = dayInCycle - onDays;
    return {
      phase:       'off',
      dayInPhase:  dayInOff + 1,
      totalDays:   offDays,
      daysLeft:    offDays - dayInOff - 1,
      nextPhase:   'on',
    };
  }
}

// ─────────────────────────────────────────────────────────────
// getSteppedDose(cureConfig, startDate)
//
// Returns: { week, drops, label }
// ─────────────────────────────────────────────────────────────
export function getSteppedDose(cureConfig, startDate) {
  if (!cureConfig || cureConfig.type !== 'stepped' || !startDate) return null;

  const elapsed   = Math.floor((Date.now() - new Date(startDate).getTime()) / MS_PER_DAY);
  const weekIndex = Math.floor(elapsed / 7);
  const steps     = cureConfig.steps ?? [];
  const step      = steps[Math.min(weekIndex, steps.length - 1)];

  if (!step) return null;
  return {
    week:  step.week,
    drops: step.drops,
    label: tr('logic.cure.stepped', { week: step.week, drops: step.drops }),
  };
}

// ─────────────────────────────────────────────────────────────
// getCureStatusLabel(cureConfig, startDate)
// Utility für UI-Anzeige
// ─────────────────────────────────────────────────────────────
export function getCureStatusLabel(cureConfig, startDate) {
  if (!cureConfig || !startDate) return null;

  if (cureConfig.type === 'cycle') {
    const s = getCycleStatus(cureConfig, startDate);
    return tr('logic.cure.cycle', {
      phase: tr(`logic.cure.phase.${s.phase}`),
      day: s.dayInPhase,
      total: s.totalDays,
      left: s.daysLeft,
    });
  }

  if (cureConfig.type === 'stepped') {
    const s = getSteppedDose(cureConfig, startDate);
    // Das Emoji steckt bereits im uebersetzten Label (logic.cure.stepped).
    return s ? s.label : null;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────
// isDueToday(cureConfig, startDate)
// Gibt false zurück wenn Phase = 'off'
// ─────────────────────────────────────────────────────────────
export function isDueToday(cureConfig, startDate) {
  if (!cureConfig) return true;
  if (cureConfig.type === 'cycle') {
    return getCycleStatus(cureConfig, startDate).phase === 'on';
  }
  return true; // stepped: immer aktiv
}
