/**
 * useStore.js
 * ─────────────────────────────────────────────────────────────
 * Zustand Store – Zentraler State für Supplement OS
 * Persistenz via zustand/middleware (AsyncStorage / MMKV)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import inventory from '../data/inventory.json';
import { shouldTriggerBlock } from '../logic/AbsorptionBlocker';
import { checkConflicts }      from '../logic/ConflictLogic';

// ─────────────────────────────────────────────────────────────
// STATE SHAPE
// ─────────────────────────────────────────────────────────────
const initialState = {
  // Profile
  profiles: [
    { id: 'adult', label: 'Erwachsener', emoji: '🧑', isChild: false },
    { id: 'child', label: 'Kind',        emoji: '🧒', isChild: true  },
  ],
  activeProfileId: 'adult',

  // Tages-Log: { [profileId]: { [dateStr]: [supplementId, ...] } }
  dailyLog: {},

  // Bestand: { [supplementId]: number (Kapseln/Tropfen) }
  stock: {},

  // Kur-Starts: { [supplementId]: ISO-Date-String }
  cureStartDates: {},

  // Absorption Blocker Timestamp
  absorptionBlockedAt: null,

  // UI-State
  lastLoggedId: null,
  pendingConflicts: [],
};

// ─────────────────────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────────────────────
const useStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Profile ──────────────────────────────────────────
      setActiveProfile: (profileId) => set({ activeProfileId: profileId }),

      getActiveProfile: () => {
        const { profiles, activeProfileId } = get();
        return profiles.find(p => p.id === activeProfileId) ?? profiles[0];
      },

      // ── Supplement Filter nach Profil ────────────────────
      getFilteredInventory: () => {
        const { activeProfileId, profiles } = get();
        const profile = profiles.find(p => p.id === activeProfileId);
        if (profile?.isChild) return inventory.filter(s => s.childSafe);
        return inventory;
      },

      // ── Daily Log ────────────────────────────────────────
      _getTodayKey: () => new Date().toISOString().split('T')[0],

      _getProfileLog: () => {
        const { dailyLog, activeProfileId } = get();
        const today = get()._getTodayKey();
        return dailyLog?.[activeProfileId]?.[today] ?? [];
      },

      getLoggedToday: () => get()._getProfileLog(),

      isLoggedToday: (supplementId) =>
        get()._getProfileLog().includes(supplementId),

      // ─────────────────────────────────────────────────────
      // logSupplement(supplementId)
      //
      // Haupt-Aktion: prüft Konflikte & Blocker, dann loggt.
      // Returns { success, conflicts, blocked }
      // ─────────────────────────────────────────────────────
      logSupplement: (supplementId) => {
        const state = get();
        const today = state._getTodayKey();
        const { activeProfileId } = state;

        // 1. Absorption Blocker Check
        const { isBlocked, remainingMinutes } = state.getAbsorptionStatus();
        if (isBlocked && supplementId !== 43) {
          return { success: false, blocked: true, remainingMinutes };
        }

        // 2. Duplikat-Check
        const currentLog = state._getProfileLog();
        if (currentLog.includes(supplementId)) {
          return { success: false, alreadyLogged: true };
        }

        // 3. Konflikt-Check
        const conflicts = checkConflicts(supplementId, currentLog);
        const criticals = conflicts.filter(c => c.severity === 'CRITICAL');

        // 4. Log schreiben
        set(prev => ({
          dailyLog: {
            ...prev.dailyLog,
            [activeProfileId]: {
              ...(prev.dailyLog[activeProfileId] ?? {}),
              [today]: [...(prev.dailyLog[activeProfileId]?.[today] ?? []), supplementId],
            },
          },
          lastLoggedId:    supplementId,
          pendingConflicts: conflicts,
          // Flohsamen → Absorption Blocker starten
          absorptionBlockedAt: shouldTriggerBlock(supplementId)
            ? new Date().toISOString()
            : prev.absorptionBlockedAt,
        }));

        // 5. Bestand reduzieren
        get().decrementStock(supplementId);

        return { success: true, conflicts, hasCriticals: criticals.length > 0 };
      },

      unlogSupplement: (supplementId) => {
        const { activeProfileId } = get();
        const today = get()._getTodayKey();
        set(prev => ({
          dailyLog: {
            ...prev.dailyLog,
            [activeProfileId]: {
              ...(prev.dailyLog[activeProfileId] ?? {}),
              [today]: (prev.dailyLog[activeProfileId]?.[today] ?? [])
                .filter(id => id !== supplementId),
            },
          },
        }));
      },

      clearPendingConflicts: () => set({ pendingConflicts: [] }),

      // ── Bestand ──────────────────────────────────────────
      setStock: (supplementId, amount) =>
        set(prev => ({ stock: { ...prev.stock, [supplementId]: amount } })),

      decrementStock: (supplementId) =>
        set(prev => {
          const current = prev.stock[supplementId];
          if (current === null || current === undefined) return {};
          return { stock: { ...prev.stock, [supplementId]: Math.max(0, current - 1) } };
        }),

      getStock: (supplementId) => get().stock[supplementId] ?? null,

      getLowStockAlerts: (threshold = 7) =>
        Object.entries(get().stock)
          .filter(([, amount]) => amount !== null && amount <= threshold)
          .map(([id, amount]) => ({
            supplement: inventory.find(s => s.id === Number(id)),
            amount,
          }))
          .filter(x => x.supplement),

      // ── Kur-Verwaltung ───────────────────────────────────
      startCure: (supplementId) =>
        set(prev => ({
          cureStartDates: {
            ...prev.cureStartDates,
            [supplementId]: new Date().toISOString(),
          },
        })),

      resetCure: (supplementId) =>
        set(prev => {
          const next = { ...prev.cureStartDates };
          delete next[supplementId];
          return { cureStartDates: next };
        }),

      getCureStartDate: (supplementId) =>
        get().cureStartDates[supplementId] ?? null,

      // ── Absorption Blocker ───────────────────────────────
      getAbsorptionStatus: () => {
        const { absorptionBlockedAt } = get();
        if (!absorptionBlockedAt) return { isBlocked: false, remainingMinutes: 0 };

        const elapsed   = Date.now() - new Date(absorptionBlockedAt).getTime();
        const remaining = 2 * 60 * 60 * 1000 - elapsed;
        if (remaining <= 0) {
          set({ absorptionBlockedAt: null });
          return { isBlocked: false, remainingMinutes: 0 };
        }
        return { isBlocked: true, remainingMinutes: Math.ceil(remaining / 60000) };
      },

      clearAbsorptionBlock: () => set({ absorptionBlockedAt: null }),

      // ── Reset ─────────────────────────────────────────────
      resetDailyLog: () =>
        set(prev => ({
          dailyLog: {
            ...prev.dailyLog,
            [prev.activeProfileId]: {
              ...(prev.dailyLog[prev.activeProfileId] ?? {}),
              [get()._getTodayKey()]: [],
            },
          },
          absorptionBlockedAt: null,
          pendingConflicts: [],
        })),
    }),
    {
      name:    'supplement-os-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Nur relevante Felder persistieren
      partialize: (state) => ({
        activeProfileId:    state.activeProfileId,
        dailyLog:           state.dailyLog,
        stock:              state.stock,
        cureStartDates:     state.cureStartDates,
        absorptionBlockedAt: state.absorptionBlockedAt,
      }),
    }
  )
);

export default useStore;
