import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { space, type } from '../../theme';
import StepRoutineTimes from './StepRoutineTimes';
import StepRoutineFirst from './StepRoutineFirst';

/**
 * ScreenRoutine
 * Buendelt Einnahmezeiten und erstes Praeparat. Das Konto-Angebot
 * (frueher StepAccount als Pflichtschritt) ist jetzt nur noch ein Link
 * in der Fusszeile, siehe app/onboarding.jsx (Task 10).
 */
export default function ScreenRoutine({ t, answers, onChange, permissionDenied }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('onboarding.routine.title')}</Text>

      <StepRoutineTimes t={t} value={permissionDenied} />
      <StepRoutineFirst
        t={t}
        value={answers.firstAction}
        onChange={(v) => onChange({ firstAction: v })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg },
  title: { ...type.display, marginBottom: space.xl },
});
