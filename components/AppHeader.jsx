import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AppHeader({ title, subtitle }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>Supplement OS</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 22,
  },
  kicker: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#f8fafc',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  subtitle: {
    marginTop: 10,
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
  },
});
