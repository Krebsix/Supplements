import { create } from 'zustand';
import inventoryData from './inventory.json';

function isSameCalendarDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export const useStore = create((set, get) => ({
  // Basis-Daten
  inventory: inventoryData,
  _runtimeSupplements: [], // Speicher für manuell hinzugefügte Supplements
  stocks: {}, // Format: { id: menge }
  logs: [], // Historie der Einnahmen
  activeProfileId: 'adult',
  absorptionBlockedAt: null,

  // AKTION: Supplement einnehmen
  logSupplement: (id) => set((state) => {
    const currentStock = state.stocks[id] || 0;
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      supplementId: id,
      timestamp: new Date().toISOString(),
    };

    return {
      stocks: { ...state.stocks, [id]: Math.max(0, currentStock - 1) },
      logs: [newLog, ...state.logs],
      lastLoggedAt: new Date().toISOString()
    };
  }),

  // AKTION: Neues Supplement hinzufügen (Schritt 2 Patch)
  addSupplement: (supplement) => set((state) => ({
    _runtimeSupplements: [...(state._runtimeSupplements || []), {
      ...supplement,
      id: `custom-${Date.now()}`, // Eindeutige ID für neue Einträge
      isCustom: true
    }]
  })),

  // AKTION: Bestand auffüllen
  updateStock: (id, amount) => set((state) => ({
    stocks: { ...state.stocks, [id]: (state.stocks[id] || 0) + amount }
  })),

  // HELPER: Bereits heute geloggte Supplement-IDs
  getLoggedToday: () => {
    const today = new Date();
    return get().logs
      .filter((log) => {
        const timestamp = new Date(log.timestamp);
        return !Number.isNaN(timestamp.getTime()) && isSameCalendarDay(timestamp, today);
      })
      .map((log) => log.supplementId);
  },

  // HELPER: Minimaler Status für abhängige Notification-Logik
  getAbsorptionStatus: () => ({
    absorptionBlockedAt: get().absorptionBlockedAt,
  }),

  // HELPER: Kombiniertes Inventar (Fixe Liste + Neue)
  getFullInventory: () => {
    return [...inventoryData, ...get()._runtimeSupplements];
  },
}));

export default useStore;
