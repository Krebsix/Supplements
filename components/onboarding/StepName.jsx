import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, space, surfaces, type } from '../../theme';

const MAX_NAME_LENGTH = 40;

/**
 * StepName
 * Vorname, optional. "Ueberspringen" kommt gleichwertig aus der Fusszeile.
 */
export default function StepName({ t, value, onChange }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('onboarding.name.title')}</Text>
      <TextInput
        style={styles.input}
        value={value ?? ''}
        onChangeText={onChange}
        placeholder={t('onboarding.name.field')}
        placeholderTextColor={colors.inkFaint}
        autoFocus
        textContentType="givenName"
        maxLength={MAX_NAME_LENGTH}
        accessibilityLabel={t('onboarding.name.field')}
      />
      <Text style={styles.hint}>{t('onboarding.name.hint')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: space.xl },
  title: { ...type.heading, marginBottom: space.lg },
  input: { ...surfaces.input, marginBottom: space.sm },
  hint: { ...type.small },
});
