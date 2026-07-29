import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { space, type } from '../theme';
import { useTranslation } from '../i18n';

export default function AppHeader({ title, subtitle }) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>{t('components.header.kicker')}</Text>
      <Text style={type.display}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: space.xxl - 8,
  },
  kicker: {
    ...type.eyebrow,
    marginBottom: space.sm,
  },
  subtitle: {
    ...type.body,
    marginTop: space.md - 2,
  },
});
