/**
 * StackConflictResolver.js
 * ─────────────────────────────────────────────────────────────
 * Loesungsvorschlag zu einem dokumentierten Paar-Konflikt: ein anderer,
 * heute bereits genutzter Slot, in dem der Partner-Wirkstoff nicht
 * vorkommt.
 *
 * WARUM NICHT JEDER KONFLIKT EINEN VORSCHLAG BEKOMMT:
 * Von den sieben PAIR_RULES (data/interactions.js) sagen nur drei
 * unbedingt "wird zeitlich getrennt eingenommen" (Eisen/Calcium,
 * Eisen/Zink, Gruentee-EGCG/Eisen). Zwei sind ausdruecklich
 * dosisabhaengig ("bei ueblichen Dosen ist der Effekt gering") und
 * wuerden mit einem pauschalen Verschiebungs-Vorschlag mehr behaupten,
 * als die Quelle hergibt. Eine (Zink/Kupfer) betrifft ein langfristiges
 * Mengenverhaeltnis, keine Tageszeit. Eine (Eisen/Vitamin C) ist eine
 * Synergie -- die soll NICHT getrennt werden. Deshalb traegt jede Regel
 * ihr eigenes `alwaysSeparate: true`-Flag (editorisch gesetzt, siehe
 * data/interactions.js), statt die Trennung aus severity abzuleiten.
 *
 * Der Vorschlag ist wie SlotSuggestion.js eine Voreinstellung, keine
 * Anweisung: Er schlaegt vor, ERSETZT aber nichts von selbst. Angewandt
 * wird er nur, wenn die Nutzerin den Knopf antippt (Dashboard.jsx).
 */
import { SLOT_ORDER } from './TimingEngine';

/**
 * findSharedSlot(dailySchedule, supplementId, partnerSupplementId)
 * Der Slot HEUTE, in dem beide Praeparate gemeinsam auftauchen. Ein
 * Praeparat kann mehrfach am Tag stehen (2x/3x); der Konflikt betrifft
 * nur den Slot, in dem sich beide tatsaechlich ueberschneiden.
 */
function findSharedSlot(dailySchedule = [], supplementId, partnerSupplementId) {
  for (const item of dailySchedule) {
    const ids = (item.supplements ?? []).map((s) => s.id);
    if (ids.includes(supplementId) && ids.includes(partnerSupplementId)) {
      return item.slot.id;
    }
  }
  return null;
}

/**
 * suggestSeparationSlot({ dailySchedule, supplementId, partnerSupplementId })
 * => { slotId, label } | null
 *
 * Sucht einen anderen Slot, der HEUTE bereits genutzt wird (nicht leer
 * ist) und in dem der Partner-Wirkstoff nicht steht. Erfundene, im
 * Tagesplan gar nicht vorkommende Slots werden nie vorgeschlagen -- sonst
 * waere es eine neue Einnahmezeit, keine Verschiebung einer bestehenden.
 * Kein Alternativ-Slot vorhanden (Ein-Slot-Tag) => null, kein Vorschlag.
 */
export function suggestSeparationSlot({ dailySchedule = [], supplementId, partnerSupplementId } = {}) {
  if (!supplementId || !partnerSupplementId) return null;

  const sharedSlotId = findSharedSlot(dailySchedule, supplementId, partnerSupplementId);
  if (!sharedSlotId) return null;

  const bySlotId = new Map(dailySchedule.map((item) => [item.slot.id, item]));

  for (const slotId of SLOT_ORDER) {
    if (slotId === sharedSlotId) continue;
    const item = bySlotId.get(slotId);
    if (!item || (item.supplements ?? []).length === 0) continue;

    const partnerHere = item.supplements.some((s) => s.id === partnerSupplementId);
    if (partnerHere) continue;

    return { slotId, label: item.slot.label, fromSlotId: sharedSlotId };
  }

  return null;
}

/**
 * applySeparation(timingSlots, fromSlotId, toSlotId)
 * Ersetzt fromSlotId durch toSlotId in einer Slot-Liste, ohne Duplikate
 * und ohne die uebrigen Slots (bei 2x/3x-Praeparaten) anzufassen. Reine
 * Array-Funktion fuer den "Verschieben"-Knopf in Dashboard.jsx.
 */
export function applySeparation(timingSlots = [], fromSlotId, toSlotId) {
  const next = timingSlots.map((slot) => (slot === fromSlotId ? toSlotId : slot));
  return SLOT_ORDER.filter((id) => next.includes(id));
}
