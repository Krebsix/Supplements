/**
 * NotificationScheduler.js
 * ─────────────────────────────────────────────────────────────
 * Push-Engine für MySuplea.
 *
 * Verantwortlichkeiten:
 *  1. Permissions anfordern
 *  2. Tägliche Supplement-Alarme planen (slot-basiert)
 *  3. Intelligente Verschiebung (Nüchtern-Delay, Flohsamen-Block)
 *  4. Notification-Response-Handler → Bestand-Dekrement via Store
 *
 * Externe Abhängigkeiten:
 *  - expo-notifications
 *  - TimingEngine  (SLOT_ORDER, SLOTS)
 *  - useStore      (Zustand-Store)
 */

import * as Notifications from 'expo-notifications';
import { Platform }        from 'react-native';

import { SLOTS, SLOT_ORDER } from './TimingEngine';
import { BLOCK_DURATION_MS } from './AbsorptionBlocker';
import { refillState } from './StockForecast';
import { tr } from './i18n/runtime';
import { colors } from './theme';

// ─────────────────────────────────────────────────────────────
// KONSTANTEN
// ─────────────────────────────────────────────────────────────

/** Delay nach Nüchtern-Einnahme, bevor Frühstücks-Slot kommt */
export const FASTED_DELAY_MS   = 30 * 60 * 1000;  // 30 Min.

/** Channel-ID für Android */
const CHANNEL_ID = 'supplement-os-reminders';

/** Notification-Action-IDs */
export const ACTION_TAKEN     = 'SUPPLEMENT_TAKEN';
export const ACTION_SNOOZE    = 'SUPPLEMENT_SNOOZE';

// ─────────────────────────────────────────────────────────────
// SETUP & PERMISSIONS
// ─────────────────────────────────────────────────────────────

/**
 * Einmalig beim App-Start aufrufen.
 * Setzt Notification-Handler, Channel (Android) und Action-Buttons.
 */
export async function setupNotifications() {
  // Handler: Notification auch bei offener App anzeigen
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge:  false,
    }),
  });

  // Android Channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name:        tr('logic.notifications.channelName'),
      importance:  Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:  colors.accent,
    });
  }

  // Interaktive Buttons registrieren
  await Notifications.setNotificationCategoryAsync('supplement_reminder', [
    {
      identifier: ACTION_TAKEN,
      buttonTitle: tr('logic.notifications.actionTaken'),
      options: { isDestructive: false, opensAppToForeground: false },
    },
    {
      identifier: ACTION_SNOOZE,
      buttonTitle: tr('logic.notifications.actionSnooze'),
      options: { isDestructive: false, opensAppToForeground: false },
    },
  ]);

  // Nur den vorhandenen Status lesen, NICHT beim App-Start den
  // Systemdialog ausloesen. Die Abfrage passiert bewusst erst, wenn die
  // Nutzerin Erinnerungen aktiv einschaltet (Einstellungs-Screen).
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/** Fragt Push-Permission an und gibt Status zurück */
export async function requestPermissions() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─────────────────────────────────────────────────────────────
// SCHEDULE BUILDER
// ─────────────────────────────────────────────────────────────

/**
 * scheduleAllNotificationsForToday(userSlotTimes, profile, state, supplements)
 *
 * @param {Object} userSlotTimes  – { fasted: '06:30', morning: '07:00', ... }
 * @param {string} profile        – 'adult' | 'child'
 * @param {Object} state          – { loggedToday: string[], absorptionBlockedAt: string|null }
 * @param {Array}  supplements    – die zu erinnernden Praeparate (aktiver
 *                                  Nutzerbestand, Kur-Pausen bereits gefiltert)
 *
 * Cancelt alle bestehenden Alarme und plant die heutigen neu.
 *
 * Frueher wurde hier aus inventory.json geplant, also aus dem statischen
 * Katalog: Erinnerungen fuer Praeparate, die niemand erfasst hatte. Die
 * Liste kommt jetzt vom Aufrufer aus dem Nutzerbestand.
 */
export async function scheduleAllNotificationsForToday(
  userSlotTimes,
  profile = 'adult',
  state   = {},
  supplements = []
) {
  // Alle alten Alarme löschen
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now             = Date.now();
  const {
    loggedToday = [],
    absorptionBlockedAt = null,
    stocks = {},
    refillThresholdDays = 0,
    onRefillNotified = () => {},
  } = state;

  // Flohsamen-Sperre: falls aktiv, alle pending Slots shiften
  const absorptionEnd = absorptionBlockedAt
    ? new Date(absorptionBlockedAt).getTime() + BLOCK_DURATION_MS
    : null;

  const scheduledIds = [];

  for (const slotId of SLOT_ORDER) {
    const slotSupplements = supplements.filter(s => {
      const inSlot    = s.timingSlots?.includes(slotId);
      const notLogged = !loggedToday.includes(s.id);
      const childOk   = profile === 'adult' || s.childSafe;
      return inSlot && notLogged && childOk;
    });

    if (slotSupplements.length === 0) continue;

    // Basis-Zeit aus User-Einstellungen
    const baseTime = parseSlotTime(userSlotTimes[slotId], slotId);
    if (!baseTime || baseTime <= now) continue;

    // Intelligente Verschiebung berechnen
    let triggerTime = baseTime;

    // Flohsamen-Block: falls Absorption-Ende nach dem geplanten Slot liegt
    if (absorptionEnd && absorptionEnd > triggerTime) {
      triggerTime = absorptionEnd;
    }

    // Nüchtern-Delay: morning-Slot kommt 30 Min. nach fasted-Slot
    if (slotId === 'morning') {
      const fastedTime = parseSlotTime(userSlotTimes['fasted'], 'fasted');
      if (fastedTime) {
        const fastedPlusDelay = fastedTime + FASTED_DELAY_MS;
        if (fastedPlusDelay > triggerTime) {
          triggerTime = fastedPlusDelay;
        }
      }
    }

    // Notification planen
    for (const supplement of slotSupplements) {
      const notifId = await _scheduleOne(supplement, slotId, triggerTime);
      if (notifId) scheduledIds.push({ notifId, supplementId: supplement.id, slotId });
    }
  }

  // Nachfuell-Erinnerung: separat von den Slot-Alarmen, deshalb ein
  // eigener Durchlauf am Ende statt eine Verzweigung je Slot.
  await scheduleRefillReminders({
    supplements,
    stocks,
    thresholdDays: refillThresholdDays,
    onNotified: onRefillNotified,
    now: new Date(now),
  });

  return scheduledIds;
}

// ─────────────────────────────────────────────────────────────
// NACHFUELL-ERINNERUNG
// ─────────────────────────────────────────────────────────────

/**
 * scheduleRefillReminders({ supplements, stocks, thresholdDays, onNotified, now })
 *
 * Plant je Praeparat mit Bestandseintrag hoechstens eine Nachfuell-
 * Erinnerung, wenn StockForecast.refillState das als faellig und noch
 * nicht gemeldet einstuft (fuer heute 09:00, oder in einer Minute, wenn
 * 09:00 bereits vorbei ist), und meldet das ueber onNotified zurueck.
 * Ist ein Praeparat nicht mehr faellig, aber vorher gemeldet, wird
 * refillNotifiedAt ueber denselben Callback zurueckgesetzt (Reset-Regel) --
 * sonst wuerde eine neue Knappheit nach dem Auffuellen nie wieder gemeldet.
 *
 * Reine Iteration + Planung: die Entscheidung selbst liegt in
 * StockForecast.refillState (Node-testbar), hier steht nur noch, WIE eine
 * faellige Erinnerung geplant wird. Kein Zugriff auf useStore -- Bestand
 * und Rueckmelde-Funktion kommen als Argumente vom Aufrufer.
 */
export async function scheduleRefillReminders({
  supplements = [],
  stocks = {},
  thresholdDays = 0,
  onNotified = () => {},
  now = new Date(),
}) {
  for (const supplement of supplements) {
    const stock = stocks[supplement.id];
    if (!stock) continue;

    const forecast = refillState(stock, supplement, thresholdDays, now);

    if (forecast.notify) {
      const triggerDate = new Date(now);
      triggerDate.setHours(9, 0, 0, 0);
      if (triggerDate.getTime() <= now.getTime()) {
        triggerDate.setTime(now.getTime() + 60 * 1000);
      }

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: tr('logic.notifications.refillTitle'),
            body: tr('logic.notifications.refill', {
              name: supplement.name,
              days: forecast.daysLeft,
            }),
            data: {
              supplementId: supplement.id,
              action: 'refill',
            },
          },
          trigger: {
            date: triggerDate,
            channelId: CHANNEL_ID,
          },
        });
        onNotified(supplement.id, now.toISOString());
      } catch (err) {
        console.error(
          `[NotificationScheduler] Nachfuell-Erinnerung fuer ${supplement.name} fehlgeschlagen:`,
          err
        );
      }
    } else if (!forecast.due && stock.refillNotifiedAt) {
      onNotified(supplement.id, null);
    }
  }
}

// ─────────────────────────────────────────────────────────────
// EINZELNER ALARM
// ─────────────────────────────────────────────────────────────

async function _scheduleOne(supplement, slotId, triggerTimestamp) {
  const slot  = SLOTS[slotId];
  const stock = null; // wird im Response-Handler gelesen

  const dosageLabel = [
    supplement?.dosage?.amount,
    supplement?.dosage?.unit,
  ]
    .map((value) =>
      value === null || value === undefined
        ? ''
        : String(value).trim()
    )
    .filter(Boolean)
    // Als fehlend gekennzeichnet, nicht erfunden (siehe Harte Regeln).
    .join(' ') || tr('logic.notifications.noDosage');

  const purposeLabel =
    typeof supplement?.purpose === 'string' &&
    supplement.purpose.trim()
      ? supplement.purpose.trim()
      : tr('logic.notifications.noPurpose');

  try {
    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title:      `${slot?.emoji ?? '💊'} ${supplement.name}`,
        body:       `${dosageLabel} – ${purposeLabel}`,
        data: {
          supplementId: supplement.id,
          slotId,
          action: 'reminder',
        },
        categoryIdentifier: 'supplement_reminder',
        // iOS: Interaktive Buttons
        ...(Platform.OS === 'ios' && { sound: 'default' }),
      },
      trigger: {
        date:      new Date(triggerTimestamp),
        channelId: CHANNEL_ID,
      },
    });

    return notifId;
  } catch (err) {
    console.error(`[NotificationScheduler] Fehler bei ${supplement.name}:`, err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// FLOHSAMEN-BLOCK: alle heutigen Pending-Notifs verschieben
// ─────────────────────────────────────────────────────────────

/**
 * rescheduleAfterAbsorptionBlock(userSlotTimes, profile, state, supplements)
 *
 * Wird direkt nach dem Loggen von Flohsamenschalen (ID 43) aufgerufen.
 * Verschiebt alle noch nicht getriggerten Notifications um BLOCK_DURATION_MS.
 */
export async function rescheduleAfterAbsorptionBlock(
  userSlotTimes,
  profile,
  state,
  supplements = []
) {
  return scheduleAllNotificationsForToday(
    userSlotTimes,
    profile,
    {
      ...state,
      absorptionBlockedAt: new Date().toISOString(),
    },
    supplements
  );
}

// ─────────────────────────────────────────────────────────────
// SNOOZE
// ─────────────────────────────────────────────────────────────

/**
 * snoozeNotification(supplement, slotId, snoozeMinutes)
 * Schickt eine neue Notification in N Minuten. Erwartet das Praeparat
 * selbst, nicht nur die ID — der Aufrufer kennt den Bestand.
 */
export async function snoozeNotification(supplement, slotId, snoozeMinutes = 15) {
  if (!supplement) return null;

  const triggerTime = Date.now() + snoozeMinutes * 60_000;
  return _scheduleOne(supplement, slotId, triggerTime);
}

// ─────────────────────────────────────────────────────────────
// RESPONSE HANDLER (in App-Root registrieren)
// ─────────────────────────────────────────────────────────────

/**
 * createResponseHandler(store)
 *
 * Gibt einen Notification-Response-Listener zurück.
 * `store` = Referenz auf useStore (get() / setState()).
 *
 * In App.jsx aufrufen:
 *   const listener = createResponseHandler(useStore);
 *   return () => listener.remove();
 */
export function createResponseHandler(store) {
  return Notifications.addNotificationResponseReceivedListener(async (response) => {
    const { actionIdentifier, notification } = response;
    const data = notification.request.content.data;

    if (!data?.supplementId) return;

    // IDs des Nutzerbestands sind Strings ('user-...'). Ein Number()-Cast
    // wie frueher machte daraus NaN und der Log lief ins Leere.
    const supplementId = data.supplementId;

    if (actionIdentifier === ACTION_TAKEN) {
      // Eingenommen: loggen + Bestand -1
      store.getState().logSupplement(supplementId);
    }

    if (actionIdentifier === ACTION_SNOOZE) {
      const supplement = store
        .getState()
        .userSupplements.find(
          (item) => item.id === supplementId || item.libraryId === supplementId
        );
      await snoozeNotification(supplement, data.slotId, 15);
    }
  });
}

// ─────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────

/**
 * parseSlotTime('07:30', slotId)
 * Gibt Unix-Timestamp für heute zur angegebenen Uhrzeit zurück.
 * Gibt null zurück wenn kein Time-String übergeben wurde.
 */
export function parseSlotTime(timeStr, slotId) {
  if (!timeStr) return null;

  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
}

/**
 * getDefaultSlotTimes()
 * Fallback-Zeiten falls User noch keine Einstellungen gespeichert hat.
 */
export const DEFAULT_SLOT_TIMES = {
  fasted:     '06:30',
  morning:    '07:30',
  midday:     '13:00',
  pre_sport:  '16:30',
  post_sport: '18:00',
  evening:    '21:00',
};
