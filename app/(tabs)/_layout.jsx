import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

import AddSupplementSheet from '../../components/AddSupplementSheet';
import { useTranslation } from '../../i18n';
import { tabBarOptions } from '../../components/navigationTheme';
import { colors, onDark, radius } from '../../theme';

/**
 * Die fuenf Hauptbereiche als echte Router-Tabs (Bedienkonzept-Spec
 * Entscheidung 1, umgesetzt 2026-09-01): Heute · Bestand · Hinzufuegen ·
 * Wissen · Mehr. Jeder Bereich hat seinen eigenen Stack, Scrollposition
 * und Unterseiten bleiben beim Wechsel erhalten.
 *
 * Hinzufuegen ist keine Route, sondern die EINE zentrale Taste
 * (MyTherapy-Muster): Sie oeffnet das bekannte Sheet mit den drei Wegen
 * Scannen / Suchen / Manuell. Der Scanner behaelt seine Routen in der
 * versteckten (scan)-Gruppe (href: null) — /scanner bleibt aus Sheet,
 * Onboarding und Ersteinrichtung erreichbar, nur der Dauerplatz in der
 * Tab-Leiste ist weg: Nach der Einrichtungswoche ist Scannen ein
 * seltener Vorgang.
 *
 * Icons: Feather aus @expo/vector-icons — gebuendelt, kein Font-Download.
 */

// Zentrale Hinzufuegen-Taste: gefuelltes, moderat gerundetes Quadrat —
// bewusst keine Vollrund-Pille (Projektregel). Ersetzt die ganze
// Tab-Zelle, deshalb eigene Tippflaeche statt tabBarIcon.
function AddTabButton({ label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.addWrap}
    >
      <View style={styles.addSquare}>
        <Feather name="plus" size={26} color={onDark.ink} />
      </View>
    </Pressable>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const [addOpen, setAddOpen] = useState(false);

  const icon = (name) => ({ color, size }) => (
    <Feather name={name} size={size ?? 20} color={color} />
  );

  return (
    <>
      <Tabs screenOptions={tabBarOptions}>
        <Tabs.Screen
          name="(today)"
          options={{ title: t('tabs.today'), tabBarIcon: icon('sun') }}
        />
        <Tabs.Screen
          name="(inventory)"
          options={{ title: t('tabs.inventory'), tabBarIcon: icon('archive') }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: t('tabs.add'),
            tabBarButton: () => (
              <AddTabButton label={t('tabs.add')} onPress={() => setAddOpen(true)} />
            ),
          }}
        />
        <Tabs.Screen
          name="(discover)"
          options={{ title: t('tabs.learn'), tabBarIcon: icon('book-open') }}
        />
        <Tabs.Screen
          name="(more)"
          options={{ title: t('tabs.more'), tabBarIcon: icon('menu') }}
        />
        {/* Versteckte Scan-Gruppe: kein Tab, die Routen /scanner und
            /results bleiben gueltig. */}
        <Tabs.Screen name="(scan)" options={{ href: null }} />
      </Tabs>

      <AddSupplementSheet visible={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  // Tippflaeche 44 pt (CLAUDE.md Bedienregeln).
  addWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  addSquare: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
