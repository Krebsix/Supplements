import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { radius, space, type } from '../../theme';

/**
 * StepWelcome
 * Erster Schritt: Logo, ein Satz, keine Frage.
 */
export default function StepWelcome({ t }) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        accessibilityRole="image"
        accessibilityLabel={t('onboarding.logoAlt')}
      />
      <Text style={styles.eyebrow}>{t('onboarding.welcome.eyebrow')}</Text>
      <Text style={styles.title}>{t('onboarding.welcome.title')}</Text>
      <Text style={styles.text}>{t('onboarding.welcome.text')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.lg + 6,
    marginBottom: space.xl,
  },
  eyebrow: { ...type.eyebrow, marginBottom: space.sm },
  title: { ...type.display, marginBottom: space.md },
  text: { ...type.body },
});
