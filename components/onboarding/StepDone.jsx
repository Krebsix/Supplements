import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { radius, space, type } from '../../theme';

/**
 * StepDone
 * ─────────────────────────────────────────────────────────────
 * Letzter Schritt. Nutzt den Namen aus StepName, wenn vorhanden, sonst den
 * namenlosen Titel. Der eigentliche Abschluss (finish()) haengt am
 * "Weiter"-Knopf in der Fusszeile, nicht an dieser Ansicht selbst.
 */
export default function StepDone({ t, value: displayName }) {
  const name = (displayName ?? '').trim();
  const title = name
    ? t('onboarding.done.title', { name })
    : t('onboarding.done.titleNoName');

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        accessibilityRole="image"
        accessibilityLabel={t('onboarding.logoAlt')}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{t('onboarding.done.text')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: {
    width: 56,
    height: 56,
    borderRadius: radius.lg + 4,
    marginBottom: space.xl,
  },
  title: { ...type.display, marginBottom: space.md, textAlign: 'center' },
  text: { ...type.body, textAlign: 'center' },
});
