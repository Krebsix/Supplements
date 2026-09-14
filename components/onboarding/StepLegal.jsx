import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, space, type } from '../../theme';

/**
 * StepLegal
 * ─────────────────────────────────────────────────────────────
 * Satz mit zwei Links (Nutzungsbedingungen, Datenschutzerklaerung) als
 * antippbarer Text innerhalb des Satzes. Kein Haken: Der Knopf in der
 * Fusszeile ("Akzeptieren und weiter") ist die eigentliche Bestaetigung.
 *
 * `t('onboarding.legal.consent')` wird bewusst OHNE vars aufgerufen: Ohne
 * Werte laesst `interpolate()` die Platzhalter `{terms}`/`{privacy}` als
 * Text stehen (siehe i18n/runtime.js), genau darauf wird hier gesplittet,
 * um an ihrer Stelle antippbare Textstuecke einzusetzen.
 */
export default function StepLegal({ t, onOpenTerms, onOpenPrivacy }) {
  const sentence = t('onboarding.legal.consent');
  const parts = sentence.split(/(\{terms\}|\{privacy\})/);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('onboarding.legal.title')}</Text>
      <Text style={styles.text}>{t('onboarding.legal.text')}</Text>

      <Text style={styles.consent}>
        {parts.map((part, index) => {
          if (part === '{terms}') {
            return (
              <Text
                key={`terms-${index}`}
                style={styles.link}
                onPress={onOpenTerms}
                accessibilityRole="link"
              >
                {t('onboarding.legal.termsLink')}
              </Text>
            );
          }
          if (part === '{privacy}') {
            return (
              <Text
                key={`privacy-${index}`}
                style={styles.link}
                onPress={onOpenPrivacy}
                accessibilityRole="link"
              >
                {t('onboarding.legal.privacyLink')}
              </Text>
            );
          }
          return <Text key={`text-${index}`}>{part}</Text>;
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: space.xl },
  title: { ...type.heading, marginBottom: space.md },
  text: { ...type.body, marginBottom: space.lg },
  consent: { ...type.small },
  link: {
    ...type.small,
    color: colors.accent,
    textDecorationLine: 'underline',
  },
});
