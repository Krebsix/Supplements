import React from 'react';
import { Stack } from 'expo-router';

import { useTranslation } from './i18n';

export default function Layout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#f8fafc' },
        headerTintColor: '#0f172a',
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerTitleStyle: {
          color: '#0f172a',
          fontSize: 17,
          fontWeight: '800',
        },
        headerBackTitle: t('common.back'),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('nav.home'),
        }}
      />

      <Stack.Screen
        name="Dashboard"
        options={{
          title: t('nav.dashboard'),
        }}
      />

      <Stack.Screen
        name="scanner"
        options={{
          title: t('nav.scanner'),
        }}
      />

      <Stack.Screen
        name="results"
        options={{
          title: t('nav.results'),
        }}
      />

      <Stack.Screen
        name="AddSupplement"
        options={{
          title: t('nav.addSupplement'),
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="profile"
        options={{
          title: t('nav.profile'),
        }}
      />

      <Stack.Screen
        name="analysis"
        options={{
          title: t('nav.analysis'),
        }}
      />

      <Stack.Screen
        name="outcome"
        options={{
          title: t('nav.outcome'),
        }}
      />

      <Stack.Screen
        name="lab"
        options={{
          title: t('nav.lab'),
        }}
      />

      <Stack.Screen
        name="export"
        options={{
          title: t('nav.export'),
        }}
      />

      <Stack.Screen
        name="settings"
        options={{
          title: t('nav.settings'),
        }}
      />

      <Stack.Screen
        name="history"
        options={{
          title: t('nav.history'),
        }}
      />

      <Stack.Screen
        name="search"
        options={{
          title: t('nav.search'),
        }}
      />
    </Stack>
  );
}
