import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GENDERS } from '../../LifeStageResolver';
import { space, type } from '../../theme';
import ChoiceCard from './ChoiceCard';

/**
 * StepGender
 * Vier Optionen, eine Auswahl. Referenzwerte unterscheiden sich zwischen
 * Frauen und Maennern, deshalb wird gefragt.
 */
export default function StepGender({ t, value, onChange }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('onboarding.gender.title')}</Text>
      <Text style={styles.why}>{t('onboarding.gender.why')}</Text>

      {GENDERS.map((gender) => (
        <ChoiceCard
          key={gender}
          title={t(`onboarding.gender.${gender}`)}
          selected={value === gender}
          onPress={() => onChange(gender)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: space.xl },
  title: { ...type.heading, marginBottom: space.sm },
  why: { ...type.small, marginBottom: space.lg },
});
