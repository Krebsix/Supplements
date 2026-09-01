import React from 'react';
import { Stack } from 'expo-router';

import { useTranslation } from '../../../i18n';
import { stackScreenOptions } from '../../../components/navigationTheme';

export default function TodayLayout() {
  const { t } = useTranslation();

  return (
    <Stack screenOptions={stackScreenOptions(t)} initialRouteName="Dashboard">
      {/* Kein nativer Header: Der Tagesplan traegt die Petrol-Buehne als
          eigenen Kopf inklusive Safe Area (Design-Review 2026-09-01, 02-F). */}
      <Stack.Screen name="Dashboard" options={{ title: t('nav.dashboard'), headerShown: false }} />
      <Stack.Screen name="inventory" options={{ title: t('nav.inventory') }} />
      <Stack.Screen name="history" options={{ title: t('nav.history') }} />
    </Stack>
  );
}
