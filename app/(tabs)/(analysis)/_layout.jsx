import React from 'react';
import { Stack } from 'expo-router';

import { useTranslation } from '../../../i18n';
import { stackScreenOptions } from '../../../components/navigationTheme';

export default function AnalysisLayout() {
  const { t } = useTranslation();

  return (
    <Stack screenOptions={stackScreenOptions(t)} initialRouteName="analysis">
      <Stack.Screen name="analysis" options={{ title: t('nav.analysis') }} />
      <Stack.Screen name="outcome" options={{ title: t('nav.outcome') }} />
    </Stack>
  );
}
