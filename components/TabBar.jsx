import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useTranslation } from '../i18n';
import { colors, space } from '../theme';

/**
 * TabBar
 * Dauerhaft sichtbare Navigation zwischen den fuenf Hauptbereichen.
 *
 * WARUM KEINE ECHTEN EXPO-ROUTER-TABS:
 * Dafuer muessten alle Screens in eine (tabs)-Gruppe wandern und saemtliche
 * Routen-Pfade mitgezogen werden. Das ist mechanisch machbar, aber ohne
 * Test auf dem Geraet ein Risiko fuer die gesamte Navigation. Diese
 * Variante erreicht dasselbe — die Bereiche sind ueberall mit einem Tipp
 * erreichbar — ohne die Router-Struktur anzufassen.
 *
 * Der Unterschied in der Praxis: Beim Wechsel geht die Scrollposition des
 * verlassenen Bereichs verloren, weil kein eigener Navigations-Stack je
 * Tab existiert. Fuer diese App ist das verschmerzbar; wenn es stoert, ist
 * der Umstieg auf echte Tabs ein abgegrenzter naechster Schritt.
 *
 * `active` bekommt der aufrufende Screen mit, statt den Pfad selbst zu
 * ermitteln: Die Screens kennen ihre Rolle ohnehin, und so bleibt die
 * Komponente frei von Annahmen ueber die Routen.
 */
export default function TabBar({ active }) {
  const router = useRouter();
  const { t } = useTranslation();

  const tabs = [
    { id: 'today', route: '/Dashboard', icon: '☀️', labelKey: 'tabs.today' },
    { id: 'discover', route: '/search', icon: '🔍', labelKey: 'tabs.discover' },
    { id: 'scan', route: '/scanner', icon: '📷', labelKey: 'tabs.scan' },
    { id: 'analysis', route: '/analysis', icon: '📊', labelKey: 'tabs.analysis' },
    { id: 'more', route: '/', icon: '☰', labelKey: 'tabs.more' },
  ];

  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => {
              if (!isActive) router.push(tab.route);
            }}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={t(tab.labelKey)}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
              {t(tab.labelKey)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopColor: colors.rule,
    borderTopWidth: 1,
    paddingTop: space.sm,
    // Auf iOS liegt unten die Home-Indikator-Leiste — ohne den Zuschlag
    // klebt die Beschriftung darauf. Safe-Area-Wert, kein Theme-Abstand.
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  icon: { fontSize: 19, opacity: 0.45 },
  iconActive: { opacity: 1 },
  label: {
    color: colors.inkFaint,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  labelActive: { color: colors.accent, fontWeight: '900' },
});
