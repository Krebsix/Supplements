import React, { useEffect } from 'react';
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
 * Rad-Picker fuer das Geburtsjahr, vorgewaehlt 1990. Ruft `onChange(1990)`
 * beim ersten Rendern auf, wenn noch kein Wert vorliegt, damit
 * `app/onboarding.jsx` von Anfang an einen Wert zum Aufloesen der
 * Referenzgruppe hat (siehe LifeStageResolver.js).
 */
export default function StepBirthYear({ t, value, onChange, resolved }) {
  useEffect(() => {
    if (value === null || value === undefined) {
      onChange(DEFAULT_YEAR);
    }
    // Nur beim ersten Rendern des Schritts pruefen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
