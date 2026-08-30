import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { colors, space, type } from '../../theme';

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 100;
const MAX_YEAR = CURRENT_YEAR - 4;
const DEFAULT_YEAR = 1990;

const YEARS = Array.from(
  { length: MAX_YEAR - MIN_YEAR + 1 },
  (_, index) => MIN_YEAR + index
);

/**
 * StepBirthYear
 * ─────────────────────────────────────────────────────────────
 * Rad-Picker fuer das Geburtsjahr, vorgewaehlt 1990. Den Startwert setzt
 * app/onboarding.jsx bereits im initialen `answers`-State (DEFAULT_BIRTH_YEAR),
 * `value` ist hier also nie null; `selectedValue={value ?? DEFAULT_YEAR}`
 * bleibt als Absicherung stehen, falls das je nicht mehr gilt.
 */
export default function StepBirthYear({ t, value, onChange, resolved }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('onboarding.birthYear.title')}</Text>
      <Text style={styles.why}>{t('onboarding.birthYear.why')}</Text>

      <Picker
        selectedValue={value ?? DEFAULT_YEAR}
        onValueChange={onChange}
        style={styles.picker}
      >
        {YEARS.map((year) => (
          <Picker.Item key={year} label={String(year)} value={year} />
        ))}
      </Picker>

      {resolved?.tooYoung ? (
        <Text style={styles.tooYoungHint}>{t('onboarding.birthYear.tooYoung')}</Text>
      ) : null}
      {!resolved?.tooYoung && resolved?.underage ? (
        <Text style={styles.underageHint}>{t('onboarding.birthYear.underage')}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  title: { ...type.heading, marginBottom: space.sm },
  why: { ...type.small, marginBottom: space.md },
  // Kein Eingabefeld-Look: das native Rad ignoriert Rahmen und Polsterung
  // von surfaces.input ohnehin, ein schlichter Container sitzt in der
  // Karte wie das System-Rad.
  picker: { height: 180, paddingVertical: space.sm },
  tooYoungHint: { ...type.small, color: colors.alert, marginTop: space.md },
  underageHint: { ...type.small, color: colors.caution, marginTop: space.md },
});
