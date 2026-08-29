import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

import { useTranslation } from '../../i18n';
import { colors, space, surfaces, type } from '../../theme';
import useAccountStore from '../../useAccountStore';

/**
 * Ziel der Bestaetigungs- und Reset-Links. Liest Tokens aus der URL,
 * setzt die Session und leitet weiter: type=recovery zum Reset-Screen,
 * sonst zum Konto. Die eigentliche Verarbeitung liegt in AccountLogic.
 *
 * Liegt ausserhalb des Onboarding-Gates (siehe app/_layout.jsx): Der
 * Link wird auf dem Geraet geoeffnet, auf dem das Konto angelegt wurde,
 * das Onboarding ist also durch. Falls nicht, faengt das Gate die
 * anschliessende Navigation ab.
 */
export default function AuthCallbackScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const url = Linking.useURL();
  const handled = useRef(false);
  const handleAuthCallback = useAccountStore((state) => state.handleAuthCallback);

  useEffect(() => {
    if (!url || handled.current) return;
    handled.current = true;

    handleAuthCallback(url)
      .then((type) => router.replace(type === 'recovery' ? '/account-reset' : '/account'))
      .catch((error) => {
        Alert.alert(t('account.callback.errorTitle'), error?.message ?? '');
        router.replace('/account');
      });
  }, [url, handleAuthCallback, router, t]);

  return (
    <View style={styles.screen}>
      <ActivityIndicator color={colors.accent} />
      <Text style={styles.text}>{t('account.callback.title')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { ...surfaces.screen, justifyContent: 'center', alignItems: 'center' },
  text: { ...type.body, marginTop: space.md },
});
