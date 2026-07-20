import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { shouldTriggerBlock } from './AbsorptionBlocker';
import { buildDailySchedule } from './TimingEngine';
import inventoryData from './inventory.json';

function createId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toDateKey(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return new Date().toISOString().slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function normalizeOptionalText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function normalizeDosage(dosage = {}) {
  return {
    amount: normalizeOptionalText(dosage?.amount),
    unit: normalizeOptionalText(dosage?.unit),
  };
}

function normalizeCaptureSummary(captureSummary) {
  if (!captureSummary || typeof captureSummary !== 'object') {
    return null;
  }

  const steps = Array.isArray(captureSummary.steps)
    ? captureSummary.steps
        .map((step) => ({
          id: normalizeOptionalText(step?.id),
          width: Number.isFinite(Number(step?.width))
            ? Number(step.width)
            : null,
          height: Number.isFinite(Number(step?.height))
            ? Number(step.height)
            : null,
          capturedAt:
            typeof step?.capturedAt === 'string'
              ? step.capturedAt
              : null,
        }))
        .filter((step) => step.id)
    : [];

  const completedCount = Number(captureSummary.completedCount);
  const requiredCount = Number(captureSummary.requiredCount);

  return {
    completedCount: Number.isFinite(completedCount)
      ? completedCount
      : steps.length,
    requiredCount: Number.isFinite(requiredCount)
      ? requiredCount
      : steps.length,
    steps,
  };
}

function normalizeScanResult(result = {}) {
  const source =
    result && typeof result === 'object'
      ? result
      : {};

  const {
    captureSummary: rawCaptureSummary,
    ...scanData
  } = source;

  const captureSummary =
    normalizeCaptureSummary(rawCaptureSummary);

  return {
    ...scanData,
    ...(captureSummary ? { captureSummary } : {}),
    id: scanData.id || createId('scan'),
    savedAt:
      scanData.savedAt || new Date().toISOString(),
  };
}

function normalizeUserSupplement(draft = {}) {
  const libraryId = draft.libraryId ?? (typeof draft.id === 'number' ? draft.id : null);
  const id = typeof draft.id === 'string' && draft.id.startsWith('user-') ? draft.id : createId('user');

  return {
    ...draft,
    id,
    libraryId,
    status: draft.status || 'active',
    source: draft.source || (draft.isCustom ? 'manual' : 'library'),
    dosage: normalizeDosage(draft.dosage),
    timingSlots: Array.isArray(draft.timingSlots) ? draft.timingSlots : [],
    conflictIds: Array.isArray(draft.conflictIds) ? draft.conflictIds : [],
    conflictTags: Array.isArray(draft.conflictTags) ? draft.conflictTags : [],
    synergyIds: Array.isArray(draft.synergyIds) ? draft.synergyIds : [],
    flags: draft.flags || {},
    createdAt: draft.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function getIntakeDecrement(stock) {
  const value = Number(stock?.decrementPerIntake);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function migratePersistedState(persistedState = {}) {
  const state = persistedState || {};
  const userSupplements = Array.isArray(state.userSupplements)
    ? state.userSupplements
    : Array.isArray(state._runtimeSupplements)
      ? state._runtimeSupplements.map((supplement) => normalizeUserSupplement({ ...supplement, source: supplement.source || 'manual' }))
      : [];

  const intakeLogs = Array.isArray(state.intakeLogs)
    ? state.intakeLogs
    : Array.isArray(state.logs)
      ? state.logs.map((log) => ({
          id: log.id || createId('log'),
          userSupplementId: log.userSupplementId || log.supplementId,
          libraryId: log.libraryId ?? null,
          profileId: log.profileId || state.activeProfileId || 'adult',
          slotId: log.slotId || null,
          dateKey: log.dateKey || toDateKey(log.timestamp || log.takenAt),
          takenAt: log.takenAt || log.timestamp || new Date().toISOString(),
          amount: normalizeOptionalText(log.amount),
          unit: normalizeOptionalText(log.unit),
          source: log.source || 'legacy',
          undoneAt: log.undoneAt || null,
        }))
      : [];

  return {
    ...state,
    userSupplements,
    intakeLogs,
    stockBySupplementId: state.stockBySupplementId || state.stocks || {},
    scanResults: state.scanResults || [],
    pendingScanResult: state.pendingScanResult || null,
    activeProfileId: state.activeProfileId || 'adult',
    absorptionBlockedAt: state.absorptionBlockedAt || null,
    settings: state.settings || {},
  };
}

export const useStore = create(
  persist(
    (set, get) => ({
      librarySupplements: inventoryData,
      userSupplements: [],
      intakeLogs: [],
      stockBySupplementId: {},
      scanResults: [],
      pendingScanResult: null,
      activeProfileId: 'adult',
      absorptionBlockedAt: null,
      settings: {},

      addUserSupplement: (draft) => {
        const supplement = normalizeUserSupplement(draft);
        set((state) => ({ userSupplements: [...state.userSupplements, supplement] }));
        return supplement;
      },
      updateUserSupplement: (id, patch) => set((state) => ({
        userSupplements: state.userSupplements.map((supplement) =>
          supplement.id === id ? { ...supplement, ...patch, updatedAt: new Date().toISOString() } : supplement
        ),
      })),
      pauseUserSupplement: (id) => get().updateUserSupplement(id, { status: 'paused' }),
      archiveUserSupplement: (id) => get().updateUserSupplement(id, { status: 'archived' }),
      getActiveSupplements: () => get().userSupplements.filter((supplement) => supplement.status === 'active'),
      getLibrarySupplementById: (id) => get().librarySupplements.find((supplement) => supplement.id === id),
      setPendingScanResult: (result) => set({ pendingScanResult: result }),
      clearPendingScanResult: () => set({ pendingScanResult: null }),
      saveScanResult: (result) => {
        const storedScan = normalizeScanResult(result);

        set((state) => ({
          scanResults: [
            storedScan,
            ...state.scanResults.filter(
              (scan) => scan.id !== storedScan.id
            ),
          ],
        }));

        return storedScan;
      },
      addSupplementFromPendingScan: (formData) => {
        const pending = get().pendingScanResult;
        const supplement = get().addUserSupplement({
          ...formData,
          source: pending ? 'scan' : formData?.source || 'manual',
          scanResultId: pending?.id || null,
        });
        if (pending) get().clearPendingScanResult();
        return supplement;
      },
      logIntake: (userSupplementId, options = {}) => {
        const supplement = get().userSupplements.find((item) => item.id === userSupplementId || item.libraryId === userSupplementId);
        if (!supplement) return null;
        userSupplementId = supplement.id;
        const now = new Date();
        const stock = get().stockBySupplementId[userSupplementId];
        const decrement = getIntakeDecrement(stock);
        const log = {
          id: createId('log'),
          userSupplementId,
          libraryId: supplement.libraryId ?? null,
          profileId: options.profileId || get().activeProfileId,
          slotId: options.slotId || supplement.timingSlots?.[0] || null,
          dateKey: options.dateKey || toDateKey(now),
          takenAt: options.takenAt || now.toISOString(),
          amount: normalizeOptionalText(
            options.amount ?? supplement.dosage?.amount
          ),
          unit: normalizeOptionalText(
            options.unit ?? supplement.dosage?.unit
          ),
          source: options.source || 'dashboard',
          undoneAt: null,
          stockDelta: Number.isFinite(Number(stock?.currentUnits)) ? decrement : 0,
        };
        set((state) => ({
          intakeLogs: [log, ...state.intakeLogs],
          stockBySupplementId: Number.isFinite(Number(stock?.currentUnits))
            ? { ...state.stockBySupplementId, [userSupplementId]: { ...stock, currentUnits: Math.max(0, Number(stock.currentUnits) - decrement) } }
            : state.stockBySupplementId,
          absorptionBlockedAt: shouldTriggerBlock(supplement) ? log.takenAt : state.absorptionBlockedAt,
        }));
        return log;
      },
      undoIntakeToday: (userSupplementId) => {
        const dateKey = toDateKey();
        const log = get().intakeLogs.find((item) => item.userSupplementId === userSupplementId && item.dateKey === dateKey && !item.undoneAt);
        if (!log) return null;
        const stock = get().stockBySupplementId[userSupplementId];
        set((state) => ({
          intakeLogs: state.intakeLogs.map((item) => item.id === log.id ? { ...item, undoneAt: new Date().toISOString() } : item),
          stockBySupplementId: Number.isFinite(Number(stock?.currentUnits)) && log.stockDelta > 0
            ? { ...state.stockBySupplementId, [userSupplementId]: { ...stock, currentUnits: Number(stock.currentUnits) + log.stockDelta } }
            : state.stockBySupplementId,
        }));
        return log;
      },
      clearIntakeLogs: () => set({
        intakeLogs: [],
        absorptionBlockedAt: null,
      }),
      getLoggedToday: (date = new Date()) => {
        const dateKey = toDateKey(date);
        return get().intakeLogs.filter((log) => log.dateKey === dateKey && !log.undoneAt);
      },
      getTodayProgress: (date = new Date()) => {
        const schedule = get().getTodaySchedule(date);
        const total = schedule.reduce((sum, slot) => sum + slot.supplements.length, 0);
        const done = schedule.reduce((sum, slot) => sum + slot.supplements.filter((supplement) => supplement.logged).length, 0);
        return { total, done, pending: Math.max(0, total - done), percent: total ? Math.round((done / total) * 100) : 0 };
      },
      getTodaySchedule: (date = new Date()) => {
        const loggedIds = get().getLoggedToday(date).map((log) => log.userSupplementId);
        return buildDailySchedule(loggedIds, get().activeProfileId, get().getActiveSupplements());
      },
      setStock: (userSupplementId, stockData) => set((state) => ({
        stockBySupplementId: { ...state.stockBySupplementId, [userSupplementId]: stockData },
      })),
      adjustStock: (userSupplementId, delta) => set((state) => {
        const stock = state.stockBySupplementId[userSupplementId];
        if (!stock || !Number.isFinite(Number(stock.currentUnits))) return state;
        return { stockBySupplementId: { ...state.stockBySupplementId, [userSupplementId]: { ...stock, currentUnits: Number(stock.currentUnits) + delta } } };
      }),
      getStock: (userSupplementId) => get().stockBySupplementId[userSupplementId] || null,

      // Backward-compatible aliases for older screens/services.
      inventory: inventoryData,
      getFullInventory: () => [...get().librarySupplements, ...get().userSupplements],
      addSupplement: (supplement) => get().addUserSupplement({ ...supplement, source: supplement.source || 'manual' }),
      logSupplement: (id) => get().logIntake(id),
      updateStock: (id, amount) => get().adjustStock(id, amount),
      getAbsorptionStatus: () => ({ absorptionBlockedAt: get().absorptionBlockedAt }),
    }),
    {
      name: 'supplement-os-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userSupplements: state.userSupplements,
        intakeLogs: state.intakeLogs,
        stockBySupplementId: state.stockBySupplementId,
        scanResults: state.scanResults,
        pendingScanResult: state.pendingScanResult,
        activeProfileId: state.activeProfileId,
        absorptionBlockedAt: state.absorptionBlockedAt,
        settings: state.settings,
      }),
      version: 1,
      migrate: (state) => migratePersistedState(state),
      merge: (persistedState, currentState) => ({ ...currentState, ...migratePersistedState(persistedState) }),
    }
  )
);

export default useStore;
