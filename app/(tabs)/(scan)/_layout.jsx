import React from 'react';
import { Stack } from 'expo-router';

import { useTranslation } from '../../../i18n';
import { stackScreenOptions } from '../../../components/navigationTheme';

export default function ScanLayout() {
  const { t } = useTranslation();

  return (
    <Stack screenOptions={stackScreenOptions(t)} initialRouteName="scanner">
      <Stack.Screen name="scanner" options={{ title: t('nav.scanner') }} />
      <Stack.Screen name="results" options={{ title: t('nav.results') }} />
    </Stack>
  );
}
