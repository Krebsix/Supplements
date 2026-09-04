import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { space, type } from '../../theme';
import ChoiceCard from './ChoiceCard';

const OPTIONS = [
  { id: 'scan', key: 'onboarding.first.scan', icon: 'camera' },
  { id: 'search', key: 'onboarding.first.search', icon: 'search' },
  { id: 'later', key: 'onboarding.first.later', icon: 'clock' },
];

/**
 * StepRoutineFirst
 * ─────────────────────────────────────────────────────────────
 * Was als Naechstes passiert: scannen, suchen oder spaeter. Steuert in
 * app/onboarding.jsx sowohl das Wortlaut-Detail als auch das Sprungziel
 * nach Abschluss (finish()).
 */
export default function StepRoutineFirst({ t, value, onChange }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('onboarding.first.title')}</Text>
      <Text style={styles.text}>{t('onboarding.first.text')}</Text>

      {OPTIONS.map((option) => (
        <ChoiceCard
          key={option.id}
          title={t(option.key)}
          icon={option.icon}
          selected={value === option.id}
          onPress={() => onChange(option.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: space.xl },
  title: { ...type.heading, marginBottom: space.sm },
  text: { ...type.small, marginBottom: space.lg },
});
