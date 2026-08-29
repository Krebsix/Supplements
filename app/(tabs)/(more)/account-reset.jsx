import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { RECOVERY_KEY_INVALID, isNetworkError } from '../../../AccountLogic';
import { useTranslation } from '../../../i18n';
import { colors, space, surfaces, type } from '../../../theme';
import useAccountStore from '../../../useAccountStore';

const MIN_PASSWORD_LENGTH = 10;

/**
 * Neues Passwort nach dem Reset-Link. Mit Recovery-Key bleibt der
 * Datenschluessel erhalten; ohne wird nach Rueckfrage ein neuer erzeugt
 * und einmalig angezeigt (account-recovery.jsx, Fall B).
 */
export default function AccountResetScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const busy = useAccountStore((state) => state.busy);
  const completePasswordReset = useAccountStore((state) => state.completePasswordReset);

  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [formError, setFormError] = useState(null);

  const run = async (keyText) => {
    try {
      const result = await completePasswordReset(password, keyText);
      setPassword('');
      setPasswordRepeat('');
      if (result.recoveryKeyText) {
        router.replace('/account-recovery');
      } else {
        Alert.alert(t('account.reset.done'));
        router.replace('/account');
      }
    } catch (error) {
      if (isNetworkError(error)) {
        Alert.alert(t('account.error.title'), t('account.error.offline'));
      } else if (error?.code === RECOVERY_KEY_INVALID) {
        // Nur DIESER Code heisst wirklich "Key passt nicht". Ein Fehler
        // danach (Passwort-Policy bei updateUser, saveKeyRecord) traegt ihn
        // nicht und darf nicht als falscher Key beschriftet werden.
        setFormError(t('account.reset.wrongKey'));
      } else {
        Alert.alert(t('account.error.title'), t('account.error.generic', { message: error?.message ?? '' }));
      }
    }
  };

  const handleSubmit = () => {
    if (password.length < MIN_PASSWORD_LENGTH) return setFormError(t('account.error.passwordShort'));
    if (password !== passwordRepeat) return setFormError(t('account.error.passwordMismatch'));
    setFormError(null);

    const keyText = recoveryKey.trim();
    if (keyText) return run(keyText);

    return Alert.alert(t('account.reset.withoutKeyTitle'), t('account.reset.withoutKeyText'), [
      { text: t('account.delete.cancel'), style: 'cancel' },
      { text: t('account.reset.withoutKeyConfirm'), style: 'destructive', onPress: () => run('') },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>{t('account.kicker')}</Text>
        <Text style={styles.title}>{t('account.reset.title')}</Text>
        <Text style={styles.body}>{t('account.reset.text')}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>{t('account.field.password')}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
            accessibilityLabel={t('account.field.password')}
          />
          <Text style={styles.hint}>{t('account.hint.password')}</Text>

          <Text style={styles.label}>{t('account.field.passwordRepeat')}</Text>
          <TextInput
            style={styles.input}
            value={passwordRepeat}
            onChangeText={setPasswordRepeat}
            secureTextEntry
            textContentType="newPassword"
            accessibilityLabel={t('account.field.passwordRepeat')}
          />

          <Text style={styles.label}>{t('account.reset.field.recoveryKey')}</Text>
          <TextInput
            style={styles.input}
            value={recoveryKey}
            onChangeText={setRecoveryKey}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder={t('account.reset.recoveryPlaceholder')}
            placeholderTextColor={colors.inkFaint}
            accessibilityLabel={t('account.reset.field.recoveryKey')}
          />

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Pressable
            onPress={handleSubmit}
            disabled={busy}
            style={({ pressed }) => [styles.primaryButton, pressed || busy ? styles.buttonPressed : null]}
            accessibilityRole="button"
          >
            {busy ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.primaryButtonText}>{t('account.reset.action')}</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { ...surfaces.screen },
  content: { ...surfaces.content },
  kicker: { ...type.eyebrow, marginBottom: space.sm },
  title: { ...type.display, marginBottom: space.sm },
  body: { ...type.body, marginBottom: space.lg },
  card: { ...surfaces.card },
  label: { ...type.label, marginTop: space.md, marginBottom: space.xs },
  input: { ...surfaces.input },
  hint: { ...type.tiny, marginTop: space.sm },
  formError: { ...type.small, color: colors.alert, marginTop: space.md },
  primaryButton: { ...surfaces.buttonPrimary, marginTop: space.lg },
  primaryButtonText: { ...surfaces.buttonPrimaryText },
  buttonPressed: { opacity: 0.6 },
});
