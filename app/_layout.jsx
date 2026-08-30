import React, { useEffect, useState } from 'react';
import { Alert, AppState } from 'react-native';
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
import { ACCOUNT_STATUS } from '../AccountStore';
import { useAccountStore } from '../useAccountStore';
import { usePurchaseStore } from '../usePurchaseStore';
import { BACKUP_DATA_FIELDS } from '../BackupManager';
import { formatBackupTime } from '../CloudBackup';
import { useCloudBackupStore } from '../useCloudBackupStore';

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

  // Konto-Session wiederherstellen, danach die Kaufschicht mit der
  // (moeglicherweise vorhandenen) userId initialisieren. Beides wartet auf
  // "hydrated": Die Kaufschicht schreibt ihren Status ueber apply() ins
  // Entitlement von useStore (setEntitlement); useStore.persist ueberschreibt
  // das Entitlement beim Hydrieren mit dem gespeicherten Stand (merge in
  // useStore.js). Liefe dieser Effekt VOR dem Hydrate, koennte ein von der
  // Kaufschicht bereits gesetztes tier: 'pro' vom nachkommenden Hydrate
  // still wieder verworfen werden. useAccountStore.initialize() ist
  // idempotent (ensureListening-Sperre, restoreSession erneut auszufuehren
  // ist unschaedlich), ein Aufruf innerhalb dieses gegateten Effekts ist
  // also unproblematisch.
  useEffect(() => {
    if (!hydrated) return;

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
  }, [hydrated]);

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
        state.absorptionBlockedAt !== previous.absorptionBlockedAt ||
        state.stockBySupplementId !== previous.stockBySupplementId
      ) {
        refreshNotificationSchedule().catch(() => {});
      }
    });

    // Cloud-Backup: jede Aenderung an Backup-Feldern plant einen Upload
    // (gebuendelt im Store). importBackup ist im Store stummgeschaltet.
    const unsubscribeBackup = useStore.subscribe((state, previous) => {
      if (BACKUP_DATA_FIELDS.some((field) => state[field] !== previous[field])) {
        useCloudBackupStore.getState().scheduleUpload();
      }
    });
    // Beim Zurueckkehren in den Vordergrund offene Aenderungen nachholen.
    const appState = AppState.addEventListener('change', (next) => {
      if (next === 'active' && useCloudBackupStore.getState().dirty) {
        useCloudBackupStore.getState().scheduleUpload();
      }
    });

    return () => {
      responseListener?.remove();
      unsubscribe();
      unsubscribeBackup();
      appState.remove();
    };
  }, [hydrated, onboarded]);

  // Start mit Session und Schluessel: pruefen, ob ein anderes Geraet
  // geschrieben hat (Dialog) oder unser Stand hochgeladen werden muss.
  // Wartet zusaetzlich auf das Rehydrieren des Cloud-Backup-Stores: ohne
  // das saehe hasLocalData() im Store einen leeren Zustand und 'restore'
  // wuerde lokale Daten ueberschreiben, bzw. lastUploadedAt waere noch
  // null und loeste einen unnoetigen Dialog aus.
  const accountStatus = useAccountStore((state) => state.status);
  const accountDataKey = useAccountStore((state) => state.dataKey);
  useEffect(() => {
    if (!hydrated || !onboarded) return;
    if (accountStatus !== ACCOUNT_STATUS.SIGNED_IN || !accountDataKey) return;
    (async () => {
      await useCloudBackupStore.persist.rehydrate();
      await useCloudBackupStore.getState().checkOnLogin();
    })().catch((error) => console.error('[Layout] Cloud-Backup-Abgleich', error));
  }, [hydrated, onboarded, accountStatus, accountDataKey]);

  // Dialog: Server-Stand und lokaler Stand passen nicht zusammen, die
  // Nutzerin muss waehlen.
  const pendingDecision = useCloudBackupStore((state) => state.pendingDecision);
  const language = useStore((state) => state.language);
  useEffect(() => {
    if (!pendingDecision) return;
    const { remote, counts } = pendingDecision;
    Alert.alert(
      t('account.cloud.decisionTitle'),
      t('account.cloud.decisionText', {
        time: formatBackupTime(remote.exported_at, language),
        device: remote.device_label || '',
        supplements: counts.supplements,
        labValues: counts.labValues,
      }),
      [
        { text: t('account.cloud.decisionUpload'), onPress: () => useCloudBackupStore.getState().resolveDecision('upload') },
        { text: t('account.cloud.decisionRestore'), onPress: () => useCloudBackupStore.getState().resolveDecision('restore') },
      ],
      { cancelable: false }
    );
  }, [pendingDecision, language, t]);

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
        <Stack.Screen
          name="paywall"
          options={{ title: t('paywall.kicker'), presentation: 'modal' }}
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
