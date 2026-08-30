import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';

import { isNetworkError } from '../../../AccountLogic';
import { routeAfterAccount } from '../../../FirstSteps';
import { useTranslation } from '../../../i18n';
import { colors, radius, space, surfaces, type } from '../../../theme';
import useAccountStore from '../../../useAccountStore';
import useCloudBackupStore from '../../../useCloudBackupStore';
import useStore from '../../../useStore';

/**
 * Einmalige Anzeige des Recovery-Keys.
 *
 * Fall A (Signup): Der Key gehoert zum vorbereiteten Bundle. Erst nach
 * aktiver Bestaetigung ruft der Screen confirmSignUp(); Abbruch loescht
 * das Bundle, beim Server ist nichts passiert.
 *
 * Fall B (Reset ohne Key): Das Konto hat schon einen neuen Schluessel;
 * hier wird nur der neue Key gezeigt, Bestaetigung raeumt ihn weg.
 *
 * Zurueck-Geste und Header-Back sind im Stack deaktiviert; Verlassen nur
 * ueber die zwei Knoepfe.
 */
export default function AccountRecoveryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const busy = useAccountStore((state) => state.busy);
  const pendingSignUp = useAccountStore((state) => state.pendingSignUp);
  const pendingRecoveryKeyText = useAccountStore((state) => state.pendingRecoveryKeyText);
  const confirmSignUp = useAccountStore((state) => state.confirmSignUp);
  const cancelSignUp = useAccountStore((state) => state.cancelSignUp);
  const clearPendingRecoveryKey = useAccountStore((state) => state.clearPendingRecoveryKey);
  const setAccountEmailPending = useStore((state) => state.setAccountEmailPending);

  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const isReset = !pendingSignUp && Boolean(pendingRecoveryKeyText);
  const keyText = pendingSignUp?.bundle.recoveryKeyText ?? pendingRecoveryKeyText ?? null;

  // Kein Key vorhanden (z. B. Neustart mitten im Ablauf): zurueck. Im
  // Effekt, nicht im Render, sonst navigiert der Router waehrend des
  // Aufbaus.
  useEffect(() => {
    if (!keyText) router.replace('/account');
  }, [keyText, router]);

  if (!keyText) return null;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(keyText);
    setCopied(true);
  };

  const handleCancel = () => {
    cancelSignUp();
    router.replace('/account');
  };

  const handleConfirm = async () => {
    if (isReset) {
      clearPendingRecoveryKey();
      router.replace('/account');
      return;
    }
    try {
      const email = pendingSignUp.email;
      const result = await confirmSignUp();
      // Bestaetigung ausstehend: merken, die Ersteinrichtung zeigt den
      // Stand am Konto-Schritt an. Weiter geht es trotzdem sofort.
      setAccountEmailPending(result.needsConfirmation ? email : null);
      if (result.needsConfirmation) {
        Alert.alert(t('account.confirmMail.title'), t('account.confirmMail.text', { email }));
      } else {
        // Erst jetzt besteht eine Session: Abgleich mit dem Server-Stand
        // (kann Praeparate holen), dann die Weiche.
        await useCloudBackupStore.getState().checkOnLogin().catch(() => 'none');
      }
      router.replace(
        routeAfterAccount({ supplementCount: useStore.getState().getActiveSupplements().length })
      );
    } catch (error) {
      Alert.alert(
        t('account.error.title'),
        isNetworkError(error) ? t('account.error.offline') : t('account.error.generic', { message: error?.message ?? '' })
      );
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{t('account.recovery.kicker')}</Text>
      <Text style={styles.title}>{t(isReset ? 'account.recovery.newTitle' : 'account.recovery.title')}</Text>
      <Text style={styles.body}>{t(isReset ? 'account.recovery.newText' : 'account.recovery.text')}</Text>

      <View style={styles.keyBox}>
        <Text style={styles.keyText} selectable accessibilityLabel={t('account.recovery.kicker')}>
          {keyText}
        </Text>
      </View>

      <Pressable onPress={handleCopy} style={styles.quietButton} accessibilityRole="button">
        <Text style={styles.quietButtonText}>
          {t(copied ? 'account.recovery.copied' : 'account.recovery.copy')}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setSaved((value) => !value)}
        style={styles.checkboxRow}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: saved }}
      >
        <View style={[styles.checkbox, saved ? styles.checkboxChecked : null]} />
        <Text style={styles.checkboxLabel}>{t('account.recovery.checkbox')}</Text>
      </Pressable>

      <Pressable
        onPress={handleConfirm}
        disabled={!saved || busy}
        style={[styles.primaryButton, !saved || busy ? styles.buttonDisabled : null]}
        accessibilityRole="button"
      >
        {busy ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={styles.primaryButtonText}>
            {t(isReset ? 'account.recovery.done' : 'account.recovery.confirm')}
          </Text>
        )}
      </Pressable>

      {isReset ? null : (
        <Pressable onPress={handleCancel} disabled={busy} style={styles.quietButton} accessibilityRole="button">
          <Text style={styles.quietButtonText}>{t('account.recovery.cancel')}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { ...surfaces.screen },
  content: { ...surfaces.content },
  kicker: { ...type.eyebrow, marginBottom: space.sm },
  title: { ...type.display, marginBottom: space.sm },
  body: { ...type.body, marginBottom: space.lg },
  keyBox: {
    ...surfaces.card,
    backgroundColor: colors.surfaceSunken,
    marginBottom: space.md,
  },
  keyText: {
    ...type.numeral,
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    color: colors.ink,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.lg },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.ruleStrong,
    marginRight: space.md,
  },
  checkboxChecked: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkboxLabel: { ...type.body, flex: 1, color: colors.ink },
  primaryButton: { ...surfaces.buttonPrimary, marginTop: space.lg },
  primaryButtonText: { ...surfaces.buttonPrimaryText },
  buttonDisabled: { opacity: 0.4 },
  quietButton: { ...surfaces.buttonQuiet, marginTop: space.md },
  quietButtonText: { ...surfaces.buttonQuietText },
});
