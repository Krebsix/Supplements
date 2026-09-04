import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { extraQuestionFor } from '../../LifeStageResolver';
import { space, type } from '../../theme';
import StepName from './StepName';
import StepGender from './StepGender';
import StepBirthYear from './StepBirthYear';
import StepExtra from './StepExtra';
import StepLegal from './StepLegal';

/**
 * ScreenStart
 * Buendelt Anrede, Geschlecht, Geburtsjahr, Zusatzfrage (bedingt) und
 * den Rechtstext auf einer Flaeche. Ersetzt die fruehere Schrittfolge
 * Welcome/Legal/Name/Gender/BirthYear/Extra (Spec 2026-09-04, bewusste
 * Ausnahme von "eine Frage pro Screen" fuer den einmaligen Onboarding-
 * Flow). Die Zustimmung selbst passiert weiterhin ueber den Fusszeilen-
 * Knopf ("Akzeptieren und weiter"), StepLegal traegt nur Text+Links,
 * keinen eigenen Haken (siehe Kommentar in StepLegal.jsx).
 */
export default function ScreenStart({ t, answers, onChange, resolved, onOpenTerms, onOpenPrivacy }) {
  const questionKind = extraQuestionFor({ gender: answers.gender, birthYear: answers.birthYear });

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('onboarding.start.title')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.start.subtitle')}</Text>

      <StepName t={t} value={answers.displayName} onChange={(v) => onChange({ displayName: v })} />
      <StepGender t={t} value={answers.gender} onChange={(v) => onChange({ gender: v })} />
      <StepBirthYear
        t={t}
        value={answers.birthYear}
        onChange={(v) => onChange({ birthYear: v })}
        resolved={resolved}
      />
      {questionKind ? (
        <StepExtra
          t={t}
          questionKind={questionKind}
          value={{ extra: answers.extra, referenceOverride: answers.referenceOverride }}
          onChange={onChange}
        />
      ) : null}

      <StepLegal t={t} onOpenTerms={onOpenTerms} onOpenPrivacy={onOpenPrivacy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg },
  title: { ...type.display, marginBottom: space.sm },
  subtitle: { ...type.body, marginBottom: space.xl },
});
