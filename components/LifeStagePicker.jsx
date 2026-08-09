import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { localizeLifeStage } from '../data/localize';
import { LIFE_STAGES, getLifeStage } from '../data/referenceValues';
import { useTranslation } from '../i18n';
import { colors, radius, space, surfaces, type } from '../theme';

/**
 * LifeStagePicker
 * Auswahl der Lebensphase fuer den Referenzwert-Abgleich.
 * Referenzwerte unterscheiden sich stark zwischen Kind, Schwangerschaft,
 * Menopause und hoeherem Alter — ohne diese Auswahl waere der Abgleich
 * nicht aussagekraeftig.
 */
export default function LifeStagePicker({ value, onChange }) {
  const { t } = useTranslation();
  const active = value ? localizeLifeStage(getLifeStage(value)) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('lifeStage.referenceFor')}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {LIFE_STAGES.map((rawStage) => {
          const stage = localizeLifeStage(rawStage);
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
    backgroundColor: colors.surface,
    borderColor: colors.rule,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: space.md + 1,
    marginBottom: space.lg - 2,
  },
  label: {
    ...type.label,
    paddingHorizontal: space.lg - 2,
    marginBottom: space.sm + 1,
  },
  chipRow: {
    paddingHorizontal: space.lg - 2,
    gap: space.sm - 1,
  },
  chip: {
    ...surfaces.chip,
  },
  chipActive: {
    ...surfaces.chipActive,
  },
  chipText: {
    ...surfaces.chipText,
  },
  chipTextActive: {
    ...surfaces.chipTextActive,
  },
  note: {
    ...type.small,
    paddingHorizontal: space.lg - 2,
    marginTop: space.sm + 2,
  },
});
