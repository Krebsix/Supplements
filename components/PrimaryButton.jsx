import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { space, surfaces } from '../theme';

export default function PrimaryButton({ title, onPress, variant = 'primary' }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, variant === 'secondary' ? styles.secondary : styles.primary]}
    >
      <Text style={[styles.text, variant === 'secondary' ? styles.secondaryText : styles.primaryText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: space.sm + 2,
  },
  primary: surfaces.buttonPrimary,
  secondary: surfaces.buttonQuiet,
  text: {
    fontSize: 15,
    fontWeight: '800',
  },
  primaryText: surfaces.buttonPrimaryText,
  secondaryText: surfaces.buttonQuietText,
});
