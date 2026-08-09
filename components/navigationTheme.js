/**
 * navigationTheme.js
 * Header- und Tab-Optionen fuer die Router-Navigation, gespeist aus den
 * Design-Tokens. Vorher lief der native Header auf den Tailwind-Werten
 * f8fafc/0f172a — also genau dem Standardlook, den theme.js bewusst
 * verlassen hat. Der Header ist auf jedem Screen sichtbar, deshalb gehoert
 * er als erstes auf die Palette "Papier und Tinte".
 *
 * Liegt in components/, nicht in app/: expo-router wuerde jede Datei in
 * app/ als Route interpretieren.
 */

import { colors, fonts } from '../theme';

export function stackScreenOptions(t) {
  return {
    headerStyle: { backgroundColor: colors.canvas },
    headerTintColor: colors.ink,
    headerShadowVisible: false,
    headerTitleAlign: 'center',
    headerTitleStyle: {
      color: colors.ink,
      // Serife wie die Screen-Ueberschriften: der Header gehoert zum
      // redaktionellen Erscheinungsbild, nicht zum Framework.
      fontFamily: fonts.display,
      fontSize: 17,
    },
    headerBackTitle: t('common.back'),
    contentStyle: { backgroundColor: colors.canvas },
  };
}

export const tabBarOptions = {
  tabBarActiveTintColor: colors.accent,
  tabBarInactiveTintColor: colors.inkFaint,
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: colors.rule,
    borderTopWidth: 1,
  },
  tabBarLabelStyle: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
  },
  headerShown: false,
};
