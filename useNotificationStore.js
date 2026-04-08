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

import {
  DEFAULT_SLOT_TIMES,
  scheduleAllNotificationsForToday,
  rescheduleAfterAbsorptionBlock,
  snoozeNotification,
  requestPermissions,
} from '../notifications/NotificationScheduler';

// ─────────────────────────────────────────────────────────────
const useNotificationStore = create(
  persist(
    (set, get) => ({

      // ── Einstellungen ─────────────────────────────────────
      /** Vom User konfigurierte Slot-Zeiten */
      slotTimes:           { ...DEFAULT_SLOT_TIMES },

      /** Notifications global ein/ausschalten */
      notificationsEnabled: true,

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
      refreshSchedule: async ({ loggedToday = [], absorptionBlockedAt = null, profile = 'adult' } = {}) => {
        const { notificationsEnabled, permissionGranted, slotTimes } = get();
        if (!notificationsEnabled || !permissionGranted) return;

        const scheduled = await scheduleAllNotificationsForToday(
          slotTimes,
          profile,
          { loggedToday, absorptionBlockedAt }
        );

        set({ scheduledToday: scheduled });
        return scheduled;
      },

      // ── Flohsamen-Block auslösen ──────────────────────────
      /**
       * triggerAbsorptionReschedule({ loggedToday, profile })
       * Direkt nach Loggen von ID 43 aufrufen.
       */
      triggerAbsorptionReschedule: async ({ loggedToday = [], profile = 'adult' } = {}) => {
        const { notificationsEnabled, permissionGranted, slotTimes } = get();
        if (!notificationsEnabled || !permissionGranted) return;

        const scheduled = await rescheduleAfterAbsorptionBlock(
          slotTimes,
          profile,
          { loggedToday, absorptionBlockedAt: new Date().toISOString() }
        );

        set({ scheduledToday: scheduled });
        return scheduled;
      },

      // ── Snooze ────────────────────────────────────────────
      snooze: async (supplementId, slotId, minutes = 15) => {
        return snoozeNotification(supplementId, slotId, minutes);
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
      }),
    }
  )
);

export default useNotificationStore;
