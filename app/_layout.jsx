import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useTranslation } from '../i18n';
import { useStore } from '../useStore';
import useNotificationStore, {
  refreshNotificationSchedule,
} from '../useNotificationStore';
import {
  createResponseHandler,
  setupNotifications,
} from '../NotificationScheduler';
import { stackScreenOptions } from '../components/navigationTheme';
import { useAccountStore } from '../useAccountStore';
import { usePurchaseStore } from '../usePurchaseStore';

/**
 * Wurzel-Layout.
 *
 * Die Tab-Bereiche liegen in der (tabs)-Gruppe und bringen ihre eigenen
 * Stacks samt Header mit. Hier oben bleiben nur die Ebenen, die ueber den
 * Tabs liegen: das Erfassen-Modal und das Onboarding.
 *
 * ONBOARDING-GATE: Solange die Lebensphase nicht aktiv gewaehlt und die
 * Datenschutzerklaerung nicht zur Kenntnis genommen wurde, ist nur die
 * Onboarding-Route erreichbar. Frueher setzte der Store still
 * "erwachsene Frau" als Lebensphase — fuer alle anderen Nutzergruppen
 * waren damit die Referenzwerte vom ersten Tag an falsch.
 */
function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(() => useStore.persist.hasHydrated());

  useEffect(() => {
    const unsubscribe = useStore.persist.onFinishHydration(() => setHydrated(true));
    return unsubscribe;
  }, []);

  return hydrated;
}

export default function Layout() {
  const { t } = useTranslation();
  const hydrated = useStoreHydrated();

  // Konto-Session wiederherstellen. Laeuft parallel zum Store-Hydrate und
  // blockiert nichts: Die App ist ohne Konto voll nutzbar. Die Kaufschicht
  // startet ERST danach, mit der (moeglicherweise vorhandenen) userId aus
  // dem Konto-Restore, damit ein bestehendes Abo sofort verknuepft wird.
  useEffect(() => {
    useAccountStore
      .getState()
      .initialize()
      .then(() =>
        usePurchaseStore
          .getState()
          .initialize(useAccountStore.getState().userId)
          .catch((error) => console.error('[Layout] Kaufschicht', error))
      )
      .catch((error) => console.error('[Layout] Konto-Initialisierung fehlgeschlagen', error));
  }, []);

  // Keine eigenen Schriften mehr: Die App laeuft auf der Systemschrift
  // (SF Pro auf iOS, Roboto auf Android). Das spart den Font-Download beim
  // Start und laesst die Oberflaeche zur Plattform gehoeren — siehe die
  // Begruendung in theme.js.
  const onboardingCompletedAt = useStore((state) => state.onboardingCompletedAt);

  // Bis der Speicher gelesen ist, nichts entscheiden: sonst blitzt fuer
  // Bestandsnutzerinnen kurz das Onboarding auf.
  const onboarded = Boolean(onboardingCompletedAt);

  // Erinnerungen verdrahten: Handler und Kanal registrieren, danach den
  // Tagesplan planen und bei jeder relevanten Aenderung (Einnahme, Bestand,
  // Flohsamen-Sperre) neu planen. Der Permission-Dialog kommt hier NICHT,
  // sondern erst beim bewussten Einschalten im Erinnerungs-Screen.
  useEffect(() => {
    if (!hydrated || !onboarded) return undefined;

    let responseListener = null;

    setupNotifications()
      .then((granted) => {
        useNotificationStore.setState({ permissionGranted: granted });
        return refreshNotificationSchedule();
      })
      .catch((error) =>
        console.error('[Layout] Notification-Setup fehlgeschlagen', error)
      );

    responseListener = createResponseHandler(useStore);

    const unsubscribe = useStore.subscribe((state, previous) => {
      if (
        state.intakeLogs !== previous.intakeLogs ||
        state.userSupplements !== previous.userSupplements ||
        state.absorptionBlockedAt !== previous.absorptionBlockedAt
      ) {
        refreshNotificationSchedule().catch(() => {});
      }
    });

    return () => {
      responseListener?.remove();
      unsubscribe();
    };
  }, [hydrated, onboarded]);

  if (!hydrated) return null;

  return (
    <Stack screenOptions={stackScreenOptions(t)}>
      <Stack.Protected guard={onboarded}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="AddSupplement"
          options={{ title: t('nav.addSupplement'), presentation: 'modal' }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!onboarded}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>
      {/* Rechtstexte bewusst ausserhalb beider Gates: Die Datenschutz-
          erklaerung muss lesbar sein, BEVOR jemand im Onboarding zustimmt. */}
      <Stack.Screen name="privacy" options={{ title: t('nav.privacy') }} />
      <Stack.Screen name="imprint" options={{ title: t('nav.imprint') }} />
      <Stack.Screen name="terms" options={{ title: t('nav.terms') }} />
      {/* Ziel der Konto-Mails (Bestaetigung, Passwort-Reset). Ausserhalb
          der Gates, damit ein Link die App auch dann oeffnet, wenn der
          Store noch entscheidet. */}
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
    </Stack>
  );
}
