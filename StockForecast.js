/**
 * StockForecast.js
 * ─────────────────────────────────────────────────────────────
 * Reine Prognose-Logik fuer die Nachfuell-Erinnerung: Wie viele
 * Einheiten verbraucht ein Praeparat pro Tag, wie viele Tage reicht der
 * Bestand noch, und ist eine Erinnerung faellig?
 *
 * Bewusst ohne Nebenwirkungen und ohne Abhaengigkeit von useStore oder
 * expo-notifications: Nur so ist die Entscheidungslogik in Node testbar.
 * Der Scheduler (NotificationScheduler.js) ruft refillState() nur noch
 * auf und plant, entscheidet aber nichts selbst.
 */

/**
 * dailyUnits(supplement, stock) => number
 * Anzahl belegter Einnahme-Slots mal Einheiten je Einnahme. Ohne Slots
 * verbraucht ein Praeparat rechnerisch nichts (0), auch wenn es einen
 * Bestand hat -- es kann ja nicht automatisch eingeplant zaehlen.
 */
export function dailyUnits(supplement, stock) {
  const slotCount = Array.isArray(supplement?.timingSlots)
    ? supplement.timingSlots.length
    : 0;
  if (slotCount === 0) return 0;

  const perIntake = Number(stock?.decrementPerIntake);
  const decrement = Number.isFinite(perIntake) && perIntake > 0 ? perIntake : 1;

  return slotCount * decrement;
}

/**
 * daysLeft(stock, supplement) => number | null
 * null, wenn kein Bestand erfasst ist (currentUnits fehlt) -- eine nicht
 * erfasste Menge ist etwas anderes als "reicht fuer 0 Tage".
 */
export function daysLeft(stock, supplement) {
  const currentUnits = Number(stock?.currentUnits);
  if (!Number.isFinite(currentUnits)) return null;

  const perDay = dailyUnits(supplement, stock);
  if (perDay <= 0) return null;

  return Math.floor(currentUnits / perDay);
}

/**
 * refillState(stock, supplement, thresholdDays, now) => { daysLeft, due, notify, plannedAt }
 *
 * due: Bestand ist erfasst, verbraucht sich taeglich und reicht nur noch
 * fuer hoechstens thresholdDays Tage. thresholdDays <= 0 schaltet die
 * Erinnerung aus (nie faellig).
 *
 * refillNotifiedAt ist die GEPLANTE Ausloesezeit der Erinnerung (ISO), kein
 * "wurde gesendet"-Flag. Grund: NotificationScheduler.scheduleAllNotifications-
 * ForToday cancelt am Anfang ALLE geplanten Notifications, auch bei jedem
 * erneuten Durchlauf (z. B. ausgeloest durch eine andere Aenderung). Waere
 * refillNotifiedAt ein reines Sende-Flag, wuerde ein solcher erneuter
 * Durchlauf die gerade erst geplante, aber noch nicht ausgeloeste
 * Erinnerung wegcancein und NIE neu planen, weil das Flag ja schon gesetzt
 * war -- die Erinnerung verschwindet dann kommentarlos. Mit dem geplanten
 * Zeitpunkt als Wert kann der Aufrufer stattdessen erkennen: liegt der
 * geplante Zeitpunkt noch in der Zukunft, MUSS nach einem Cancel-all neu
 * geplant werden (moeglichst mit demselben Zeitpunkt, siehe
 * NotificationScheduler.scheduleRefillReminders).
 *
 * notify: faellig UND (noch nichts geplant ODER der geplante Zeitpunkt
 * liegt noch in der Zukunft). Liegt der geplante Zeitpunkt in der
 * Vergangenheit, ist die Erinnerung bereits ausgeloest worden -- kein
 * erneutes Planen noetig, bis sie durch die Reset-Regel wieder freigegeben
 * wird.
 *
 * Reset-Regel liegt bewusst NICHT hier: der Aufrufer prueft
 * `!due && stock.refillNotifiedAt` und setzt refillNotifiedAt selbst
 * zurueck -- refillState bleibt eine reine Leseabfrage ohne Zustand.
 */
export function refillState(stock, supplement, thresholdDays, now = new Date()) {
  const remaining = daysLeft(stock, supplement);
  const threshold = Number(thresholdDays);

  const due =
    Number.isFinite(threshold) &&
    threshold > 0 &&
    remaining !== null &&
    remaining <= threshold;

  const plannedAt = stock?.refillNotifiedAt ?? null;
  const notify =
    due && (!plannedAt || new Date(plannedAt).getTime() > now.getTime());

  return { daysLeft: remaining, due, notify, plannedAt };
}
