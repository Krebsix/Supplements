// Agribische Wissensdatenbank für Supplement-Recherche
export const researchData = {
  "magnesium": {
    defaultSlot: "NIGHT",
    instruction: "Fördert die Entspannung. Am besten 30-60 Min. vor dem Schlafen.",
    conflicts: ["Calcium"]
  },
  "vitamin d": {
    defaultSlot: "MORNING",
    instruction: "Fettlöslich. Muss unbedingt zu einer Mahlzeit mit gesundem Fett genommen werden.",
    conflicts: []
  },
  "nmn": {
    defaultSlot: "WAKEUP",
    instruction: "Auf nüchternen Magen für maximale Bioverfügbarkeit.",
    conflicts: []
  },
  "omega 3": {
    defaultSlot: "LUNCH",
    instruction: "Zu einer fettreichen Mahlzeit einnehmen.",
    conflicts: []
  },
  "zink": {
    defaultSlot: "NIGHT",
    instruction: "Nicht zusammen mit Kaffee oder Vollkornprodukten (Phytate hemmen Aufnahme).",
    conflicts: ["Kupfer", "Eisen"]
  },
  "eisen": {
    defaultSlot: "WAKEUP",
    instruction: "Mindestens 30 Min. vor dem Frühstück. Vitamin C verbessert die Aufnahme.",
    conflicts: ["Kaffee", "Tee", "Milchprodukte"]
  },
  "flohsamen": {
    defaultSlot: "WAKEUP",
    instruction: "ACHTUNG: Blockiert die Aufnahme anderer Mittel für 2 Stunden. Viel Wasser trinken!",
    isBlocker: true
  }
};
