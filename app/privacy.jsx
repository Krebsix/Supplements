import React from 'react';
import { StyleSheet, Text } from 'react-native';

import LegalSections from '../components/LegalSections';
import { PRIVACY_SECTIONS, PRIVACY_VERSION } from '../data/legalContent';
import { useTranslation } from '../i18n';
import { space, type } from '../theme';

// Datenschutzerklaerung. Liegt bewusst auf Wurzel-Ebene ausserhalb des
// Onboarding-Gates: Sie muss lesbar sein, BEVOR jemand dem Start zustimmt.
export default function PrivacyScreen() {
  const { t } = useTranslation();

  return (
    <LegalSections
      sections={PRIVACY_SECTIONS}
      footer={
        <Text style={styles.version}>
          {t('legal.version')}: {PRIVACY_VERSION}
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  version: { ...type.tiny, marginTop: space.sm, textAlign: 'center' },
});
