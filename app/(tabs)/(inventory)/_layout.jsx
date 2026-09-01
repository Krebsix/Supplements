import React from 'react';
import { Stack } from 'expo-router';

import { useTranslation } from '../../../i18n';
import { stackScreenOptions } from '../../../components/navigationTheme';

/**
 * Bestand-Tab (Bedienkonzept-Spec Entscheidung 1): Bestandsliste plus die
 * frueheren Analyse-Inhalte — Tagessummen-Check (analysis) und
 * Wirkungskontrolle (outcome). Beantwortet die eine Frage: Was habe ich,
 * reicht es, passt die Tagessumme?
 */
export default function InventoryLayout() {
  const { t } = useTranslation();

  return (
    <Stack screenOptions={stackScreenOptions(t)} initialRouteName="inventory">
      <Stack.Screen name="inventory" options={{ title: t('nav.inventory') }} />
      <Stack.Screen name="analysis" options={{ title: t('nav.analysis') }} />
      <Stack.Screen name="outcome" options={{ title: t('nav.outcome') }} />
    </Stack>
  );
}
