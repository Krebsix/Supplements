import React from 'react';
import { Tabs } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

import { useTranslation } from '../../i18n';
import { tabBarOptions } from '../../components/navigationTheme';

/**
 * Die fuenf Hauptbereiche als echte Router-Tabs: eigener Stack je Bereich,
 * Scrollposition und Unterseiten bleiben beim Wechsel erhalten. Ersetzt
 * die manuell eingebundene TabBar-Komponente, die nur auf fuenf von
 * dreizehn Screens lag.
 *
 * Icons: Feather aus @expo/vector-icons — gebuendelt, kein Font-Download.
 * Die Emoji-Icons davor waren das eine Element, das dem redaktionellen
 * Erscheinungsbild widersprach.
 */
export default function TabsLayout() {
  const { t } = useTranslation();

  const icon = (name) => ({ color, size }) => (
    <Feather name={name} size={size ?? 20} color={color} />
  );

  return (
    <Tabs screenOptions={tabBarOptions}>
      <Tabs.Screen
        name="(today)"
        options={{ title: t('tabs.today'), tabBarIcon: icon('sun') }}
      />
      <Tabs.Screen
        name="(discover)"
        options={{ title: t('tabs.discover'), tabBarIcon: icon('search') }}
      />
      <Tabs.Screen
        name="(scan)"
        options={{ title: t('tabs.scan'), tabBarIcon: icon('camera') }}
      />
      <Tabs.Screen
        name="(analysis)"
        options={{ title: t('tabs.analysis'), tabBarIcon: icon('bar-chart-2') }}
      />
      <Tabs.Screen
        name="(more)"
        options={{ title: t('tabs.more'), tabBarIcon: icon('menu') }}
      />
    </Tabs>
  );
}
