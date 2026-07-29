import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { radius, space, toneFor } from '../theme';

// Mapping von den bisherigen Tonnamen auf die Statusstufen aus theme.js.
// 'neutral' bleibt bewusst ohne Zuordnung — toneFor() faellt dann auf den
// gedeckten Default-Grauton zurueck.
const TONE_MAP = {
  good: 'affirm',
  warning: 'caution',
  danger: 'alert',
};

export default function StatusBadge({ label, tone = 'neutral' }) {
  const resolved = toneFor(TONE_MAP[tone]);

  return (
    <View style={[styles.badge, { backgroundColor: resolved.surface }]}>
      <Text style={[styles.text, { color: resolved.ink }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.md,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs + 2,
    marginRight: space.sm,
    marginBottom: space.sm,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
