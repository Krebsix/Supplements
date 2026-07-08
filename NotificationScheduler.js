/**
 * NotificationScheduler.js
 * ─────────────────────────────────────────────────────────────
 * Push-Engine für Supplement OS.
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

import inventory from './inventory.json';

// TODO Phase 2: Notifications nur aus userSupplements mit status === 'active' planen, nicht direkt aus inventory.json.
import { SLOTS, SLOT_ORDER } from './TimingEngine';
import { BLOCK_DURATION_MS } from './AbsorptionBlocker';

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
      name:        'Supplement-Erinnerungen',
      importance:  Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:  '#4ade80',
    });
  }

  // Interaktive Buttons registrieren
  await Notifications.setNotificationCategoryAsync('supplement_reminder', [
    {
      identifier: ACTION_TAKEN,
      buttonTitle: '✅ Eingenommen',
      options: { isDestructive: false, opensAppToForeground: false },
    },
    {
      identifier: ACTION_SNOOZE,
      buttonTitle: '⏰ +15 Min.',
      options: { isDestructive: false, opensAppToForeground: false },
    },
  ]);

  return requestPermissions();
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
 * scheduleAllNotificationsForToday(userSlotTimes, profile, state)
 *
 * @param {Object} userSlotTimes  – { fasted: '06:30', morning: '07:00', ... }
 * @param {string} profile        – 'adult' | 'child'
 * @param {Object} state          – { loggedToday: number[], absorptionBlockedAt: string|null }
 *
 * Cancelt alle bestehenden Alarme und plant die heutigen neu.
 * Ruft _buildSlotTime() auf, um Delays zu berücksichtigen.
 */
export async function scheduleAllNotificationsForToday(
  userSlotTimes,
  profile = 'adult',
  state   = {}
) {
  // Alle alten Alarme löschen
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now             = Date.now();
  const { loggedToday = [], absorptionBlockedAt = null } = state;

  // Flohsamen-Sperre: falls aktiv, alle pending Slots shiften
  const absorptionEnd = absorptionBlockedAt
    ? new Date(absorptionBlockedAt).getTime() + BLOCK_DURATION_MS
    : null;

  const scheduledIds = [];

  for (const slotId of SLOT_ORDER) {
    const slotSupplements = inventory.filter(s => {
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

  return scheduledIds;
}

// ─────────────────────────────────────────────────────────────
// EINZELNER ALARM
// ─────────────────────────────────────────────────────────────

async function _scheduleOne(supplement, slotId, triggerTimestamp) {
  const slot  = SLOTS[slotId];
  const stock = null; // wird im Response-Handler gelesen

  try {
    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title:      `${slot?.emoji ?? '💊'} ${supplement.name}`,
        body:       `${supplement.dosage.amount} ${supplement.dosage.unit} – ${supplement.purpose}`,
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
 * rescheduleAfterAbsorptionBlock(userSlotTimes, profile, state)
 *
 * Wird direkt nach dem Loggen von Flohsamenschalen (ID 43) aufgerufen.
 * Verschiebt alle noch nicht getriggerten Notifications um BLOCK_DURATION_MS.
 */
export async function rescheduleAfterAbsorptionBlock(
  userSlotTimes,
  profile,
  state
) {
  console.log('[NotificationScheduler] Flohsamen-Block aktiv – rescheduling...');
  return scheduleAllNotificationsForToday(userSlotTimes, profile, {
    ...state,
    absorptionBlockedAt: new Date().toISOString(),
  });
}

// ─────────────────────────────────────────────────────────────
// SNOOZE
// ─────────────────────────────────────────────────────────────

/**
 * snoozeNotification(supplementId, slotId, snoozeMinutes)
 * Schickt eine neue Notification in N Minuten.
 */
export async function snoozeNotification(supplementId, slotId, snoozeMinutes = 15) {
  const supplement = inventory.find(s => s.id === supplementId);
  if (!supplement) return;

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

    const supplementId = Number(data.supplementId);

    if (actionIdentifier === ACTION_TAKEN) {
      // ✅ Eingenommen: loggen + Bestand -1
      const result = store.getState().logSupplement(supplementId);
      console.log(`[NotifHandler] Eingenommen: ${supplementId}`, result);
    }

    if (actionIdentifier === ACTION_SNOOZE) {
      // ⏰ Snooze: neue Notification in 15 Min.
      await snoozeNotification(supplementId, data.slotId, 15);
      console.log(`[NotifHandler] Snoozed: ${supplementId}`);
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
