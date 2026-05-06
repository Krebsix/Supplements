import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

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
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  primary: {
    backgroundColor: '#14b8a6',
  },
  secondary: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  text: {
    fontSize: 15,
    fontWeight: '800',
  },
  primaryText: {
    color: '#042f2e',
  },
  secondaryText: {
    color: '#e2e8f0',
  },
});
