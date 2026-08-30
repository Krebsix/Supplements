import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../i18n';
import { space, surfaces, type } from '../theme';

const OPTIONS = [1, 2, 3];

/** Frage 1 auf dem Screen "Aufnehmen": 1x, 2x oder 3x am Tag. */
export default function FrequencyChips({ value = 1, onChange }) {
  const { t } = useTranslation();
  return (
    <View style={styles.block}>
      <Text style={styles.title}>{t('addSupplement.frequency.title')}</Text>
      <View style={styles.row}>
        {OPTIONS.map((count) => {
          const active = value === count;
          return (
            <Pressable
              key={count}
              onPress={() => onChange(count)}
              style={[styles.chip, active && surfaces.chipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[surfaces.chipText, active && surfaces.chipTextActive]}>
                {t('addSupplement.frequency.times', { count })}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: space.xl },
  title: { ...type.subheading, marginBottom: space.md },
  row: { flexDirection: 'row', gap: space.sm },
  chip: { ...surfaces.chip, minWidth: 64, alignItems: 'center' },
});
