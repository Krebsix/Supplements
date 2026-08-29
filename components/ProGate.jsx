/**
 * components/ProGate.jsx
 * Hinweiskarte fuer gesperrte Pro-Bereiche.
 *
 * Die Entscheidung, OB gesperrt wird, faellt in Entitlements.js
 * (canUseProFeature) — hier steht nur die Darstellung. Solange
 * PAYWALL_ENFORCED aus ist, rendert kein Screen diese Karte; sie liegt
 * bereit, damit die Paywall-Aktivierung keine UI-Arbeit mehr braucht.
 *
 * `screen`-Variante fuer ganze Pro-Screens (Wirkungskontrolle,
 * Laborwerte), Standard-Variante fuer Abschnitte innerhalb freier
 * Screens (Kostenanalyse, Kur-Zyklen).
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useTranslation } from '../i18n';
import { colors, radius, space, surfaces, type } from '../theme';

export default function ProGate({ screen = false }) {
  const { t } = useTranslation();
  const router = useRouter();

  const card = (
    <View style={styles.card}>
      <Text style={styles.label}>{t('proGate.label')}</Text>
      <Text style={styles.title}>{t('proGate.title')}</Text>
      <Text style={styles.text}>{t('proGate.text')}</Text>
      <Pressable
        onPress={() => router.push('/paywall')}
        style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{t('proGate.action')}</Text>
      </Pressable>
    </View>
  );

  if (!screen) return card;
  return <View style={[surfaces.screen, styles.screenPad]}>{card}</View>;
}

const styles = StyleSheet.create({
  screenPad: { paddingHorizontal: space.xl, paddingTop: space.xxl },
  card: { ...surfaces.card, borderColor: colors.ruleStrong },
  label: { ...type.eyebrow, marginBottom: space.sm },
  title: { ...type.heading, marginBottom: space.xs },
  text: { ...type.body },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.md,
  },
  buttonText: { fontWeight: '600', color: colors.surface, fontSize: 15 },
  buttonPressed: { opacity: 0.72 },
});
