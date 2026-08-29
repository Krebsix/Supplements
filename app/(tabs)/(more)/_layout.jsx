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
      <Stack.Screen name="subscription" options={{ title: t('nav.subscription') }} />
      <Stack.Screen name="account" options={{ title: t('nav.account') }} />
      <Stack.Screen
        name="account-recovery"
        options={{ title: t('account.recovery.kicker'), headerBackVisible: false, gestureEnabled: false }}
      />
      <Stack.Screen name="account-reset" options={{ title: t('account.reset.title') }} />
    </Stack>
  );
}
