import { create } from 'zustand';
import inventoryData from './inventory.json';

export const useStore = create((set) => ({
  // Basis-Daten
  inventory: inventoryData,
  _runtimeSupplements: [], // Speicher für manuell hinzugefügte Supplements
  stocks: {}, // Format: { id: menge }
  logs: [], // Historie der Einnahmen

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

  // HELPER: Kombiniertes Inventar (Fixe Liste + Neue)
  getFullInventory: () => {
    return [...inventoryData, ...get()._runtimeSupplements];
  }
}));
