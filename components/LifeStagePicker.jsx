import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LIFE_STAGES, getLifeStage } from '../data/referenceValues';

/**
 * LifeStagePicker
 * Auswahl der Lebensphase fuer den Referenzwert-Abgleich.
 * Referenzwerte unterscheiden sich stark zwischen Kind, Schwangerschaft,
 * Menopause und hoeherem Alter — ohne diese Auswahl waere der Abgleich
 * nicht aussagekraeftig.
 */
export default function LifeStagePicker({ value, onChange }) {
  const active = getLifeStage(value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Referenzwerte für</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {LIFE_STAGES.map((stage) => {
          const isActive = stage.id === value;

          return (
            <TouchableOpacity
              key={stage.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onChange(stage.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {stage.short}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {active?.note ? (
        <Text style={styles.note}>{active.note}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 13,
    marginBottom: 14,
  },
  label: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 14,
    marginBottom: 9,
  },
  chipRow: {
    paddingHorizontal: 14,
    gap: 7,
  },
  chip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: '#0f766e',
  },
  chipText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  note: {
    color: '#64748b',
    fontSize: 11,
    lineHeight: 17,
    paddingHorizontal: 14,
    marginTop: 10,
  },
});
