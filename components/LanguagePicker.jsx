import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 13,
    marginBottom: 14,
  },
  containerCompact: {
    marginBottom: 10,
    paddingVertical: 10,
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
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 8,
  },
  chip: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 9,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#0f766e',
  },
  chipText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  chipTextActive: {
    color: '#ffffff',
  },
  chipSub: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  chipSubActive: {
    color: '#ccfbf1',
  },
  note: {
    color: '#64748b',
    fontSize: 11,
    lineHeight: 17,
    paddingHorizontal: 14,
    marginTop: 10,
  },
});
