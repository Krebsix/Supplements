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
 *
 * Eigener Bildschirmtitel (`onboarding.routineScreen.title`), NICHT
 * `onboarding.routine.title`: Letzteres ist der interne Titel von
 * StepRoutineTimes und wuerde sonst doppelt untereinander erscheinen,
 * einmal als Screen-Ueberschrift, einmal als Block-Ueberschrift des
 * ersten Kindes.
 */
export default function ScreenRoutine({ t, answers, onChange, permissionDenied }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('onboarding.routineScreen.title')}</Text>

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
  // Siehe ScreenStart.jsx: horizontale und obere Polsterung kommt bereits
  // von OnboardingShell.styles.content, hier nur noch der untere Abstand.
  content: { paddingBottom: space.lg },
  title: { ...type.display, marginBottom: space.xl },
});
