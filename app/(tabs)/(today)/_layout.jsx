import React from 'react';
import { Stack } from 'expo-router';

import { useTranslation } from '../../../i18n';
import { stackScreenOptions } from '../../../components/navigationTheme';

export default function TodayLayout() {
  const { t } = useTranslation();

  return (
    <Stack screenOptions={stackScreenOptions(t)} initialRouteName="Dashboard">
      <Stack.Screen name="Dashboard" options={{ title: t('nav.dashboard') }} />
      <Stack.Screen name="history" options={{ title: t('nav.history') }} />
    </Stack>
  );
}
