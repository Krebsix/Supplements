/**
 * useNotificationStore.js
 * ─────────────────────────────────────────────────────────────
 * Zustand-Slice für Notification-Einstellungen & Scheduling-State.
 * Persistiert via AsyncStorage – getrennt vom Haupt-Store,
 * damit Notification-Settings eigenständig commits-bar sind.
 */

import { create }                     from 'zustand';
import { persist, createJSONStorage }  from 'zustand/middleware';
import AsyncStorage                    from '@react-native-async-storage/async-storage';

import * as Notifications from 'expo-notifications';

import {
  DEFAULT_SLOT_TIMES,
  scheduleAllNotificationsForToday,
  snoozeNotification,
  requestPermissions,
} from './NotificationScheduler';

async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('[useNotificationStore] cancelAll fehlgeschlagen', error);
  }
}

// ─────────────────────────────────────────────────────────────
const useNotificationStore = create(
  persist(
    (set, get) => ({

      // ── Einstellungen ─────────────────────────────────────
      /** Vom User konfigurierte Slot-Zeiten */
      slotTimes:           { ...DEFAULT_SLOT_TIMES },

      /** Notifications global ein/ausschalten */
      notificationsEnabled: true,

      /**
       * Ab wie vielen verbleibenden Tagen eine Nachfuell-Erinnerung kommt.
       * 0 schaltet die Erinnerung aus. Erlaubte Werte: 0 | 3 | 5 | 7.
       */
      refillThresholdDays: 5,

      /** Erlaubnis-Status */
      permissionGranted:   false,

      /** IDs der heute geplanten Notifications { notifId, supplementId, slotId }[] */
      scheduledToday:      [],

      // ── Einstellungen mutieren ────────────────────────────
      setSlotTime: (slotId, timeStr) =>
        set(prev => ({
          slotTimes: { ...prev.slotTimes, [slotId]: timeStr },
        })),

      resetSlotTimes: () =>
        set({ slotTimes: { ...DEFAULT_SLOT_TIMES } }),

      setNotificationsEnabled: (val) =>
        set({ notificationsEnabled: val }),

      setRefillThresholdDays: (days) =>
        set({ refillThresholdDays: days }),

      // ── Permission ───────────────────────────────────────
      checkAndRequestPermission: async () => {
        const granted = await requestPermissions();
        set({ permissionGranted: granted });
        return granted;
      },

      // ── Haupt-Aktion: Tagesplan neu berechnen ────────────
      /**
       * refreshSchedule({ loggedToday, absorptionBlockedAt, profile })
       *
       * Aufrufen:
       *  - beim App-Start
       *  - nach jeder Einnahme (logSupplement)
       *  - wenn User Zeiten in Settings ändert
       */
      refreshSchedule: async ({
        loggedToday = [],
        absorptionBlockedAt = null,
        profile = 'adult',
        supplements = [],
        refillSupplements = supplements,
        stocks = {},
        onRefillNotified = () => {},
      } = {}) => {
        const { notificationsEnabled, permissionGranted, slotTimes, refillThresholdDays } = get();
        if (!notificationsEnabled || !permissionGranted) {
          // Abgeschaltet heisst abgeschaltet: bestehende Alarme raeumen,
          // sonst feuern Erinnerungen aus der Zeit davor weiter.
          await cancelAllNotifications();
          set({ scheduledToday: [] });
          return [];
        }

        const scheduled = await scheduleAllNotificationsForToday(
          slotTimes,
          profile,
          {
            loggedToday,
            absorptionBlockedAt,
            stocks,
            refillThresholdDays,
            onRefillNotified,
          },
          supplements,
          refillSupplements
        );

        set({ scheduledToday: scheduled });
        return scheduled;
      },

      // ── Snooze ────────────────────────────────────────────
      snooze: async (supplement, slotId, minutes = 15) => {
        return snoozeNotification(supplement, slotId, minutes);
      },

      // ── Debug-Helfer ──────────────────────────────────────
      getScheduleSummary: () => {
        const { scheduledToday, slotTimes } = get();
        return {
          totalScheduled: scheduledToday.length,
          slotTimes,
          scheduled:      scheduledToday,
        };
      },
    }),
    {
      name:    'supplement-os-notifications',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        slotTimes:            state.slotTimes,
        notificationsEnabled: state.notificationsEnabled,
        permissionGranted:    state.permissionGranted,
        refillThresholdDays:  state.refillThresholdDays,
      }),
    }
  )
);

export default useNotificationStore;

// ─────────────────────────────────────────────────────────────
// Bruecke zum Haupt-Store.
// Sammelt alles ein, was die Planung braucht (heutige Logs, aktiver
// Bestand ohne Kur-Pausen, Flohsamen-Sperre) und stoesst refreshSchedule
// an. Liegt hier und nicht im Haupt-Store, damit useStore.js frei von
// expo-notifications bleibt (Node-Tests buendeln useStore-Abhaengigkeiten).
// ─────────────────────────────────────────────────────────────

import useStore from './useStore';
import { isDueToday } from './CureManager';
import { createCoalescedRunner } from './runCoalesced';

async function runRefreshScheduleOnce() {
  const main = useStore.getState();
  const loggedToday = main
    .getLoggedToday()
    .map((log) => log.userSupplementId);
  const allActive = main.getActiveSupplements();
  // dueSupplements fuer die Slot-Planung: waehrend der Kur-Pause bekommt ein
  // Praeparat keine Einnahme-Erinnerung. allActive (ungefiltert) fuer die
  // Nachfuell-Planung: der Bestand sinkt auch in der Pause nicht wieder auf
  // ueber die Schwelle, also braucht ein knappes Praeparat die Nachfuell-
  // Pruefung unabhaengig vom Kur-Status (siehe scheduleAllNotificationsForToday).
  const dueSupplements = allActive.filter((supplement) =>
    isDueToday(supplement.cureConfig, supplement.cureStartDate)
  );

  return useNotificationStore.getState().refreshSchedule({
    loggedToday,
    absorptionBlockedAt: main.absorptionBlockedAt,
    profile: main.activeProfileId,
    supplements: dueSupplements,
    refillSupplements: allActive,
    stocks: main.stockBySupplementId,
    onRefillNotified: main.markRefillNotified,
  });
}

/**
 * refreshNotificationSchedule()
 *
 * Einziger Trichter, ueber den app/_layout.jsx UND die Einstellungs-Screens
 * den Tagesplan neu planen -- deshalb hier mit createCoalescedRunner
 * gebuendelt (siehe runCoalesced.js fuer den konkreten Re-Entrancy-Fall):
 * scheduleAllNotificationsForToday cancelt am Anfang ALLE geplanten
 * Notifications. Setzt eine Nachfuell-Erinnerung waehrend eines laufenden
 * Durchlaufs synchron einen neuen Zeitpunkt (markRefillNotified -> set()),
 * loest das in app/_layout.jsx denselben Subscriber erneut aus. Ohne
 * Buendelung wuerde dessen verschachtelter Durchlauf per Cancel-all die
 * gerade erst vom aeusseren Durchlauf geplanten Notifications wieder
 * loeschen, noch bevor dieser fertig ist.
 */
export const refreshNotificationSchedule = createCoalescedRunner(runRefreshScheduleOnce);
