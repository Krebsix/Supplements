import React from 'react';
import { Stack } from 'expo-router';

import { useTranslation } from '../../../i18n';
import { stackScreenOptions } from '../../../components/navigationTheme';

export default function DiscoverLayout() {
  const { t } = useTranslation();

  return (
    <Stack screenOptions={stackScreenOptions(t)} initialRouteName="search">
      <Stack.Screen name="search" options={{ title: t('nav.search') }} />
      <Stack.Screen name="brands" options={{ title: t('nav.brands') }} />
    </Stack>
  );
}
