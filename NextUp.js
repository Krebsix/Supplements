/**
 * NextUp.js
 * "Als Naechstes" fuer den Tagesplan (Spec 2026-08-31, Entscheidung 3):
 * Der erste Slot in Tagesreihenfolge, in dem noch etwas offen ist. Rein,
 * ohne Store und UI; die Tagesreihenfolge kommt bereits sortiert aus
 * buildDailySchedule (TimingEngine).
 *
 * Bewusst KEINE Uhrzeit-Logik: Auch ein verpasster Morgen-Slot bleibt
 * "als Naechstes", bis er dokumentiert oder uebersprungen ist
 * (Medisafe-Muster: aktiv bestaetigen statt still verfallen).
 */

const openOf = (item) =>
  Array.isArray(item?.supplements)
    ? item.supplements.filter((supplement) => supplement?.logged !== true)
    : [];

export function findNextUp(dailySchedule) {
  if (!Array.isArray(dailySchedule)) return null;
  for (const item of dailySchedule) {
    const open = openOf(item);
    if (open.length > 0) {
      return { slot: item.slot, supplements: open, openCount: open.length };
    }
  }
  return null;
}

export function countOpen(dailySchedule) {
  if (!Array.isArray(dailySchedule)) return 0;
  return dailySchedule.reduce((sum, item) => sum + openOf(item).length, 0);
}
