/**
 * runCoalesced.js
 * ─────────────────────────────────────────────────────────────
 * createCoalescedRunner(fn) buendelt mehrere schnelle Aufrufe derselben
 * asynchronen Funktion zu hoechstens einem laufenden Durchlauf plus GENAU
 * EINEM Nachlauf danach.
 *
 * WARUM DAS NOETIG IST (konkreter Anlass):
 * NotificationScheduler.scheduleAllNotificationsForToday cancelt am Anfang
 * ALLE geplanten Notifications und plant danach neu. useNotificationStore
 * ruft das ueber refreshNotificationSchedule() nach jeder relevanten
 * Aenderung auf (Einnahme, Bestand, Flohsamen-Sperre, Schwellen-Aenderung).
 * Setzt die Nachfuell-Erinnerung waehrend eines laufenden Durchlaufs SYNCHRON
 * einen geplanten Zeitpunkt in useStore (markRefillNotified -> set()), lauft
 * der Store-Subscriber in app/_layout.jsx sofort erneut auf und riefe ohne
 * diesen Guard einen VERSCHACHTELTEN zweiten Durchlauf auf -- dessen
 * Cancel-all wuerde die soeben vom aeusseren Durchlauf geplanten
 * Notifications wieder loeschen, noch bevor der aeussere Durchlauf fertig
 * ist.
 *
 * Der Runner laesst waehrend eines laufenden Durchlaufs keinen zweiten zu,
 * merkt sich aber, dass danach NOCH EINMAL durchlaufen werden muss (mit dem
 * dann aktuellen Zustand, nicht mit veralteten Werten von vorhin) -- und
 * wiederholt das, bis waehrend eines Durchlaufs kein weiterer Aufruf mehr
 * dazukam.
 *
 * fn() nimmt bewusst keine Argumente: Jeder Aufruf soll den JEWEILS
 * aktuellen Zustand lesen (z. B. aus useStore.getState()), nicht die
 * Argumente eines fruehen Aufrufs aus dem Burst weiterreichen.
 */
export function createCoalescedRunner(fn) {
  let running = false;
  let pending = false;
  let currentRun = null;

  return function runCoalesced() {
    if (running) {
      pending = true;
      return currentRun;
    }

    running = true;
    currentRun = (async () => {
      let result;
      do {
        pending = false;
        result = await fn();
      } while (pending);
      return result;
    })().finally(() => {
      running = false;
      currentRun = null;
    });

    return currentRun;
  };
}
