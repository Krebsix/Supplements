import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { secureStorage } from './secureStorage';

import { shouldTriggerBlock } from './AbsorptionBlocker';
import { getCureStatusLabel, isDueToday } from './CureManager';
import {
  addCredits,
  applyVisionScan,
  setTier,
} from './Entitlements';
import {
  concludeTrial,
  createRating,
  createTrial,
  TRIAL_STATUS,
} from './OutcomeTracker';
import { createLabValue, updateLabValue } from './LabValues';
import { buildDailySchedule } from './TimingEngine';
import { setActiveLanguage } from './i18n/runtime';
import inventoryData from './inventory.json';
import {
  applyOnboardingCompletion,
  createId,
  EMPTY_PROFILE,
  INITIAL_USER_STATE,
  normalizeProfile,
  normalizeUserSupplement,
} from './storeLogic';

// Re-export: bestehende Importe aus './useStore' bleiben gueltig. Die
// eigentlichen Definitionen liegen in storeLogic.js (rein, Node-testbar).
export { EMPTY_PROFILE, INITIAL_USER_STATE };

function toDateKey(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return new Date().toISOString().slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function normalizeOptionalText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
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
    activeLifeStageId: state.activeLifeStageId || 'adult-woman',
    language: state.language || 'de',
    // Bestandsdaten aus aelteren Versionen kennen kein Profil — normalize
    // liefert dann ein leeres, aber vollstaendiges Objekt.
    profile: normalizeProfile(state.profile),
    trials: Array.isArray(state.trials) ? state.trials : [],
    labValues: Array.isArray(state.labValues) ? state.labValues : [],
    trialRatings: Array.isArray(state.trialRatings) ? state.trialRatings : [],
    absorptionBlockedAt: state.absorptionBlockedAt || null,
    settings: state.settings || {},
    // Bestandsdaten kennen weder Onboarding noch Einwilligungen: Beides
    // bleibt leer, dadurch durchlaufen auch Bestandsnutzerinnen einmal das
    // Onboarding (aktive Lebensphasen-Wahl + Datenschutz-Kenntnisnahme).
    onboardingCompletedAt: state.onboardingCompletedAt || null,
    consents: {
      scanUpload: state.consents?.scanUpload || null,
      privacyVersion: state.consents?.privacyVersion || null,
      termsVersion: state.consents?.termsVersion || null,
    },
    // Bestandsdaten kennen keine Onboarding-Flags: Default aus dem
    // Ausgangszustand, ueberschrieben von dem, was tatsaechlich persistiert
    // wurde (falls vorhanden).
    onboarding: { ...INITIAL_USER_STATE.onboarding, ...(state.onboarding || {}) },
    entitlement: { ...INITIAL_USER_STATE.entitlement, ...(state.entitlement || {}) },
  };
}

export const useStore = create(
  persist(
    (set, get) => ({
      librarySupplements: inventoryData,
      ...INITIAL_USER_STATE,
      // Oberflaechensprache (siehe i18n/). Deutsch ist die Pflegesprache,
      // deshalb auch der Startwert. Bewusst nicht Teil von
      // INITIAL_USER_STATE: Die Sprachwahl ist eine Geraeteeinstellung,
      // kein Nutzerdatum, und ueberlebt deshalb resetAllData().
      language: 'de',

      // Abschluss des Onboardings. Die eigentliche Zustands-Ueberfuehrung
      // steckt in applyOnboardingCompletion (storeLogic.js, rein und
      // getestet); der Store ruft sie nur noch auf.
      completeOnboarding: (input) => set((state) => applyOnboardingCompletion(state, input)),

      giveScanConsent: () =>
        set((state) => ({
          consents: { ...state.consents, scanUpload: new Date().toISOString() },
        })),

      revokeScanConsent: () =>
        set((state) => ({
          consents: { ...state.consents, scanUpload: null },
        })),

      // Zentraler Loeschweg: setzt saemtliche Nutzerdaten auf den
      // Ausgangszustand zurueck. Danach greift das Onboarding-Gate wieder.
      resetAllData: () => set({ ...INITIAL_USER_STATE }),

      // Erfolgreichen KI-Scan aus der richtigen Quelle verbrauchen
      // (Freikontingent → Fair Use → Credits, siehe Entitlements.js).
      consumeVisionScan: () =>
        set((state) => ({ entitlement: applyVisionScan(state.entitlement) })),

      grantScanCredits: (count) =>
        set((state) => ({ entitlement: addCredits(state.entitlement, count) })),

      setEntitlementTier: (tier) =>
        set((state) => ({ entitlement: setTier(state.entitlement, tier) })),

      // Backup einspielen (siehe BackupManager.js). Ersetzt den gesamten
      // Bestand; die Daten laufen durch dieselbe Normalisierung wie beim
      // Laden aus dem Speicher, damit auch aeltere Backups sauber ankommen.
      importBackup: (data) => {
        const migrated = migratePersistedState(data);
        const next = {};
        for (const field of Object.keys(INITIAL_USER_STATE)) {
          next[field] = migrated[field];
        }
        // Der Tier kommt NIE aus der Backup-Datei: Kaufrechte werden ueber
        // den Store-Restore (IAP) nachgewiesen, sonst waere ein editiertes
        // Backup ein Pro-Freischalter. Zaehlerstaende werden uebernommen.
        next.entitlement = {
          ...next.entitlement,
          tier: get().entitlement?.tier === 'pro' ? 'pro' : 'free',
        };
        set(next);
        if (data?.language === 'de' || data?.language === 'en') {
          get().setLanguage(data.language);
        }
      },

      setActiveLifeStage: (lifeStageId) =>
        set({ activeLifeStageId: lifeStageId }),

      updateProfile: (patch) =>
        set((state) => ({ profile: normalizeProfile({ ...state.profile, ...patch }) })),

      toggleProfileEntry: (field, value) =>
        set((state) => {
          const current = Array.isArray(state.profile?.[field]) ? state.profile[field] : [];
          const next = current.includes(value)
            ? current.filter((entry) => entry !== value)
            : [...current, value];
          return { profile: normalizeProfile({ ...state.profile, [field]: next }) };
        }),

      clearProfile: () => set({ profile: normalizeProfile({}) }),

      startTrial: (input) => {
        const trial = createTrial(input);
        set((state) => ({ trials: [trial, ...state.trials] }));
        return trial;
      },

      addTrialRating: (trialId, value, note = '', date = new Date()) => {
        const rating = createRating(trialId, value, note, date);
        if (!rating) return null;

        set((state) => ({
          // Pro Tag nur eine Bewertung: Wer nachmittags korrigiert, meint
          // eine Korrektur, keinen zweiten Messpunkt.
          trialRatings: [
            rating,
            ...state.trialRatings.filter(
              (entry) => !(entry.trialId === trialId && entry.dateKey === rating.dateKey)
            ),
          ],
        }));
        return rating;
      },

      concludeTrialById: (trialId, conclusion) =>
        set((state) => ({
          trials: state.trials.map((trial) =>
            trial.id === trialId ? concludeTrial(trial, conclusion) : trial
          ),
        })),

      deleteTrial: (trialId) =>
        set((state) => ({
          trials: state.trials.filter((trial) => trial.id !== trialId),
          trialRatings: state.trialRatings.filter((rating) => rating.trialId !== trialId),
        })),

      getRunningTrials: () =>
        get().trials.filter((trial) => trial.status === TRIAL_STATUS.RUNNING),

      addLabValue: (input) => {
        const entry = createLabValue(input);
        if (!entry) return null;
        set((state) => ({ labValues: [entry, ...state.labValues] }));
        return entry;
      },

      deleteLabValue: (id) =>
        set((state) => ({ labValues: state.labValues.filter((entry) => entry.id !== id) })),

      updateLabValue: (id, input) => {
        const next = updateLabValue(get().labValues, id, input);
        if (next === get().labValues) return null;
        set({ labValues: next });
        return next.find((entry) => entry.id === id) ?? null;
      },

      getTrialRatings: (trialId) =>
        get().trialRatings.filter((rating) => rating.trialId === trialId),

      setLanguage: (language) => {
        // Fachlogik-Module lesen die Sprache aus i18n/runtime, weil sie
        // keinen Hook nutzen koennen. Der Store bleibt die Quelle und
        // spiegelt seinen Wert dorthin.
        setActiveLanguage(language);
        set({ language });
      },

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
        // Strukturierte Zutatenliste vom Scan-Entwurf uebernehmen, falls
        // das Formular selbst keine mitbringt: Ohne sie faellt
        // StackAnalyzer.extractPositions auf eine einzelne, aus dem
        // Produktnamen geratene Position zurueck -- Wechselwirkungen und
        // Einnahme-Hinweise (ScheduleGuidance.js) blieben dann unsichtbar.
        const ingredientDetails = Array.isArray(formData?.ingredientDetails)
          ? formData.ingredientDetails
          : Array.isArray(pending?.ingredientDetails)
            ? pending.ingredientDetails
            : [];
        const supplement = get().addUserSupplement({
          ...formData,
          ingredientDetails,
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
        // Kur-Pausentage (CureManager): Was heute in der OFF-Phase ist,
        // gehoert nicht in die Slots. Es verschwindet aber nicht still,
        // sondern erscheint ueber getPausedCuresToday() als eigener Block.
        const dueSupplements = get()
          .getActiveSupplements()
          .filter((supplement) =>
            isDueToday(supplement.cureConfig, supplement.cureStartDate)
          );
        return buildDailySchedule(loggedIds, get().activeProfileId, dueSupplements);
      },

      // Aktive Supplements, deren Kur heute pausiert, samt Status-Text.
      getPausedCuresToday: () =>
        get()
          .getActiveSupplements()
          .filter(
            (supplement) =>
              supplement.cureConfig &&
              !isDueToday(supplement.cureConfig, supplement.cureStartDate)
          )
          .map((supplement) => ({
            supplement,
            statusLabel: getCureStatusLabel(
              supplement.cureConfig,
              supplement.cureStartDate
            ),
          })),
      setStock: (userSupplementId, stockData) => set((state) => ({
        stockBySupplementId: { ...state.stockBySupplementId, [userSupplementId]: stockData },
      })),
      adjustStock: (userSupplementId, delta) => set((state) => {
        const stock = state.stockBySupplementId[userSupplementId];
        if (!stock || !Number.isFinite(Number(stock.currentUnits))) return state;
        return { stockBySupplementId: { ...state.stockBySupplementId, [userSupplementId]: { ...stock, currentUnits: Number(stock.currentUnits) + delta } } };
      }),
      getStock: (userSupplementId) => get().stockBySupplementId[userSupplementId] || null,

      // Markiert, dass die Nachfuell-Erinnerung fuer diesen Bestand bereits
      // ausgeloest wurde (iso) bzw. setzt sie zurueck (null), wenn der
      // Bestand nicht mehr faellig ist -- siehe StockForecast.refillState.
      // No-op ohne vorhandenen Bestandseintrag: ein Praeparat ohne Bestand
      // hat auch keine Erinnerung, die zurueckgesetzt werden muesste.
      markRefillNotified: (userSupplementId, iso) => set((state) => {
        const stock = state.stockBySupplementId[userSupplementId];
        if (!stock) return state;
        return {
          stockBySupplementId: {
            ...state.stockBySupplementId,
            [userSupplementId]: { ...stock, refillNotifiedAt: iso },
          },
        };
      }),

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
      // Verschluesselt im Ruhezustand: Der Store enthaelt Laborwerte und
      // Medikamentengruppen (Art. 9 DSGVO). Siehe secureStorage.js.
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        userSupplements: state.userSupplements,
        intakeLogs: state.intakeLogs,
        stockBySupplementId: state.stockBySupplementId,
        scanResults: state.scanResults,
        pendingScanResult: state.pendingScanResult,
        activeProfileId: state.activeProfileId,
        activeLifeStageId: state.activeLifeStageId,
        language: state.language,
        profile: state.profile,
        trials: state.trials,
        trialRatings: state.trialRatings,
        labValues: state.labValues,
        absorptionBlockedAt: state.absorptionBlockedAt,
        settings: state.settings,
        onboardingCompletedAt: state.onboardingCompletedAt,
        consents: state.consents,
        onboarding: state.onboarding,
        entitlement: state.entitlement,
      }),
      version: 1,
      migrate: (state) => migratePersistedState(state),
      merge: (persistedState, currentState) => ({ ...currentState, ...migratePersistedState(persistedState) }),
      // Nach dem Laden aus dem Speicher die Sprache an die Fachlogik-Module
      // durchreichen — sonst laufen sie bis zur ersten Umschaltung auf
      // Deutsch weiter, obwohl die Oberflaeche bereits englisch ist.
      onRehydrateStorage: () => (state) => {
        if (state?.language) setActiveLanguage(state.language);
      },
    }
  )
);

export default useStore;
