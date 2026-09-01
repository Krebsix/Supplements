import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radius, space, surfaces, type } from '../theme';
import { useTranslation } from '../i18n';

/**
 * LanguagePicker
 * Umschaltung zwischen Deutsch und Englisch.
 *
 * Die Sprache liegt im zustand-Store und wird mitpersistiert, die Auswahl
 * ueberlebt also den App-Neustart. Weil der Store die Quelle ist, rendern
 * alle Screens sofort neu — kein Reload noetig.
 *
 * Aufbau bewusst wie LifeStagePicker: gleiche Chips, gleiche Abstaende.
 * Zwei Einstellungen, die beide beeinflussen, wie die App spricht, sollen
 * nicht unterschiedlich aussehen.
 */
export default function LanguagePicker({ compact = false }) {
  const { t, language, setLanguage, languages } = useTranslation();

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Text style={styles.label}>{t('language.title')}</Text>

      <View style={styles.chipRow}>
        {languages.map((entry) => {
          const isActive = entry.code === language;

          return (
            <TouchableOpacity
              key={entry.code}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setLanguage(entry.code)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={entry.label}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {entry.short}
              </Text>
              <Text style={[styles.chipSub, isActive && styles.chipSubActive]}>
                {entry.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!compact ? <Text style={styles.note}>{t('language.hint')}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: space.md + 1,
    marginBottom: space.lg - 2,
  },
  containerCompact: {
    marginBottom: space.md - 2,
    paddingVertical: space.md - 2,
  },
  label: {
    ...type.label,
    paddingHorizontal: space.lg - 2,
    marginBottom: space.sm + 1,
  },
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: space.lg - 2,
    gap: space.sm,
  },
  chip: {
    flex: 1,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.lg - 4,
    paddingHorizontal: space.md + 1,
    paddingVertical: space.sm + 1,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.accent,
  },
  chipText: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chipTextActive: {
    color: colors.surface,
  },
  chipSub: {
    color: colors.inkFaint,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  chipSubActive: {
    color: colors.accentSoft,
  },
  note: {
    ...type.small,
    paddingHorizontal: space.lg - 2,
    marginTop: space.sm + 2,
  },
});
