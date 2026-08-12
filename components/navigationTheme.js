/**
 * navigationTheme.js
 * Header- und Tab-Optionen fuer die Router-Navigation, gespeist aus den
 * Design-Tokens.
 *
 * Der Header ist auf jedem Screen sichtbar und faellt deshalb sofort auf,
 * wenn er nicht zur Plattform passt. Er laeuft jetzt auf der Systemschrift
 * und den Systemgrautoenen — also auf dem, was iOS ueberall sonst auch
 * zeigt (siehe theme.js).
 *
 * Liegt in components/, nicht in app/: expo-router wuerde jede Datei in
 * app/ als Route interpretieren.
 */

import { colors, weight } from '../theme';

export function stackScreenOptions(t) {
  return {
    headerStyle: { backgroundColor: colors.canvas },
    headerTintColor: colors.accent,
    headerShadowVisible: false,
    headerTitleAlign: 'center',
    headerTitleStyle: {
      color: colors.ink,
      // Keine fontFamily: das ist die Systemschrift, also SF Pro auf iOS.
      fontWeight: weight.semibold,
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
    borderTopWidth: 0.5,
  },
  tabBarLabelStyle: {
    fontWeight: weight.medium,
    fontSize: 11,
  },
  headerShown: false,
};
