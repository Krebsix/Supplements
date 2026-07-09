import React from 'react';
import { Stack } from 'expo-router';

export default function Layout() {
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
        headerBackTitle: 'Zurück',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Supplement OS',
        }}
      />

      <Stack.Screen
        name="Dashboard"
        options={{
          title: 'Tagesplan',
        }}
      />

      <Stack.Screen
        name="scanner"
        options={{
          title: 'Scanner',
        }}
      />

      <Stack.Screen
        name="results"
        options={{
          title: 'Analyse',
        }}
      />

      <Stack.Screen
        name="AddSupplement"
        options={{
          title: 'Supplement erfassen',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="settings"
        options={{
          title: 'Einstellungen',
        }}
      />

      <Stack.Screen
        name="history"
        options={{
          title: 'Verlauf',
        }}
      />

      <Stack.Screen
        name="search"
        options={{
          title: 'Suche',
        }}
      />
    </Stack>
  );
}
