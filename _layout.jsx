/**
 * _layout.jsx  (oder App.jsx)
 * ─────────────────────────────────────────────────────────────
 * Root-Komponente: Bootstrapped Notifications & verbindet
 * den Response-Handler mit dem Zustand-Store.
 *
 * ⚠️ Muss in expo-router als _layout.jsx im app/-Verzeichnis liegen.
 *    Oder als App.jsx bei Standard-Expo-Setup.
 */

import React, { useEffect, useRef } from 'react';
import { AppState }                 from 'react-native';
import * as Notifications           from 'expo-notifications';

import { setupNotifications, createResponseHandler } from '../src/notifications/NotificationScheduler';
import useStore                                       from '../src/store/useStore';
import useNotificationStore                           from '../src/store/useNotificationStore';
import { ABSORPTION_BLOCKER_ID }                      from '../src/logic/AbsorptionBlocker';

// ─────────────────────────────────────────────────────────────
export default function RootLayout({ children }) {
  const appState    = useRef(AppState.currentState);
  const listenerRef = useRef(null);

  const store              = useStore;
  const notifStore         = useNotificationStore;
  const {
    permissionGranted,
    checkAndRequestPermission,
    refreshSchedule,
    triggerAbsorptionReschedule,
  } = useNotificationStore();

  // ── 1. Setup beim ersten Mount ─────────────────────────
  useEffect(() => {
    (async () => {
      await setupNotifications();
      await checkAndRequestPermission();
      await _planToday();
    })();

    // Response-Handler registrieren (Button-Tap in Notification)
    listenerRef.current = createResponseHandler(store);

    return () => {
      listenerRef.current?.remove();
    };
  }, []);

  // ── 2. Re-plan wenn App in Vordergrund kommt ──────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        await _planToday();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  // ── 3. Haupt-Store Middleware: nach logSupplement
  //       notification neu planen & ggf. Flohsamen-Block auslösen ──
  useEffect(() => {
    const unsub = useStore.subscribe(
      (state) => state.lastLoggedId,
      async (lastLoggedId) => {
        if (!lastLoggedId) return;

        const { getLoggedToday, activeProfileId, getAbsorptionStatus } = useStore.getState();
        const { isBlocked }                                             = getAbsorptionStatus();
        const loggedToday                                               = getLoggedToday();

        if (lastLoggedId === ABSORPTION_BLOCKER_ID) {
          // Flohsamen → Komplett-Reschedule mit 2h-Block
          await triggerAbsorptionReschedule({
            loggedToday,
            profile: activeProfileId,
          });
        } else {
          // Normale Einnahme → Skip-Update (bereits geloggte Supplements raus)
          await refreshSchedule({
            loggedToday,
            absorptionBlockedAt: isBlocked ? useStore.getState().absorptionBlockedAt : null,
            profile:             activeProfileId,
          });
        }
      }
    );
    return unsub;
  }, []);

  return children;
}

// ─────────────────────────────────────────────────────────────
// Helper: Tagesplan auf Basis des aktuellen Store-States bauen
// ─────────────────────────────────────────────────────────────
async function _planToday() {
  const { getLoggedToday, activeProfileId, getAbsorptionStatus } =
    useStore.getState();
  const { refreshSchedule } = useNotificationStore.getState();
  const { absorptionBlockedAt }    = getAbsorptionStatus();

  await refreshSchedule({
    loggedToday:        getLoggedToday(),
    absorptionBlockedAt: absorptionBlockedAt ?? null,
    profile:            activeProfileId,
  });
}
