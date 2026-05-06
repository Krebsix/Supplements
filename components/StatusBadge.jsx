import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function StatusBadge({ label, tone = 'neutral' }) {
  return (
    <View style={[styles.badge, styles[tone] || styles.neutral]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  neutral: {
    backgroundColor: '#334155',
  },
  good: {
    backgroundColor: '#134e4a',
  },
  warning: {
    backgroundColor: '#78350f',
  },
  danger: {
    backgroundColor: '#7f1d1d',
  },
  text: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
});
