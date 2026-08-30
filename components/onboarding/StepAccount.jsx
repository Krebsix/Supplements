import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { space, type } from '../../theme';

/**
 * StepAccount
 * ─────────────────────────────────────────────────────────────
 * Reiner Text, keine Auswahlkarte: Die eigentliche Entscheidung faellt in
 * der Fusszeile von app/onboarding.jsx ("Später ohne Konto" als
 * Primaerknopf, "Konto anlegen" als Quiet-Button). Dieser Schritt wird nur
 * gezeigt, wenn `!resolved.underage` (siehe buildSteps).
 */
export default function StepAccount({ t }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('onboarding.account.title')}</Text>
      <Text style={styles.text}>{t('onboarding.account.text')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  title: { ...type.heading, marginBottom: space.md },
  text: { ...type.body },
});
