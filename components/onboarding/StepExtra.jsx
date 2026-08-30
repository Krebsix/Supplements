import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import LifeStagePicker from '../LifeStagePicker';
import { EXTRA_PREGNANCY } from '../../LifeStageResolver';
import { space, type } from '../../theme';
import ChoiceCard from './ChoiceCard';

const PREGNANCY_OPTIONS = [
  { id: EXTRA_PREGNANCY.NONE, key: 'onboarding.extra.none' },
  { id: EXTRA_PREGNANCY.PREGNANT, key: 'onboarding.extra.pregnant' },
  { id: EXTRA_PREGNANCY.BREASTFEEDING, key: 'onboarding.extra.breastfeeding' },
];

/**
 * StepExtra
 * ─────────────────────────────────────────────────────────────
 * Zusatzfrage, deren Inhalt von `resolved.needsExtra` abhaengt
 * (LifeStageResolver.js): 'pregnancy' bei Frauen zwischen 15 und 50,
 * 'reference' bei Divers/keine Angabe ab 18. `value` traegt beide
 * moeglichen Antworten gleichzeitig ({ extra, referenceOverride }),
 * `onChange` bekommt jeweils nur das geaenderte Feld als Patch.
 */
export default function StepExtra({ t, value, onChange, resolved }) {
  const needsExtra = resolved?.needsExtra ?? null;

  if (needsExtra === 'pregnancy') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('onboarding.extra.pregnancy.title')}</Text>
        <Text style={styles.why}>{t('onboarding.extra.pregnancy.why')}</Text>

        {PREGNANCY_OPTIONS.map((option) => (
          <ChoiceCard
            key={option.id}
            title={t(option.key)}
            selected={value?.extra === option.id}
            onPress={() => onChange({ extra: option.id })}
          />
        ))}
      </View>
    );
  }

  if (needsExtra === 'reference') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('onboarding.extra.reference.title')}</Text>
        <Text style={styles.why}>{t('onboarding.extra.reference.why')}</Text>

        <LifeStagePicker
          value={value?.referenceOverride ?? null}
          onChange={(referenceOverride) => onChange({ referenceOverride })}
        />
      </View>
    );
  }

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  title: { ...type.heading, marginBottom: space.sm },
  why: { ...type.small, marginBottom: space.lg },
});
