import React from 'react';
import { StyleSheet, Text } from 'react-native';

import LegalSections from '../components/LegalSections';
import { TERMS_SECTIONS, TERMS_VERSION } from '../data/legalContent';
import { useTranslation } from '../i18n';
import { space, type } from '../theme';

// Nutzungsbedingungen. Wie Datenschutz und Impressum ausserhalb der
// Onboarding- und Auth-Gates: Sie sollen ohne Umwege lesbar sein, auch
// bevor jemand ein Konto anlegt oder die App zum ersten Mal startet.
export default function TermsScreen() {
  const { t } = useTranslation();

  return (
    <LegalSections
      sections={TERMS_SECTIONS}
      footer={
        <Text style={styles.version}>
          {t('legal.version')}: {TERMS_VERSION}
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  version: { ...type.tiny, marginTop: space.sm, textAlign: 'center' },
});
