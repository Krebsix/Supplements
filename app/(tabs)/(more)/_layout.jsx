import React from 'react';
import { Stack } from 'expo-router';

import { useTranslation } from '../../../i18n';
import { stackScreenOptions } from '../../../components/navigationTheme';

export default function MoreLayout() {
  const { t } = useTranslation();

  return (
    <Stack screenOptions={stackScreenOptions(t)} initialRouteName="menu">
      <Stack.Screen name="menu" options={{ title: t('nav.home') }} />
      <Stack.Screen name="profile" options={{ title: t('nav.profile') }} />
      <Stack.Screen name="lab" options={{ title: t('nav.lab') }} />
      <Stack.Screen name="export" options={{ title: t('nav.export') }} />
      <Stack.Screen name="notifications" options={{ title: t('nav.notifications') }} />
      <Stack.Screen name="settings" options={{ title: t('nav.settings') }} />
    </Stack>
  );
}
