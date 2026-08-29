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

import { ACCOUNT_STATUS } from '../../../AccountStore';
import { isNetworkError, PROVIDERS } from '../../../AccountLogic';
import { useTranslation } from '../../../i18n';
import { colors, radius, space, surfaces, type } from '../../../theme';
import useAccountStore from '../../../useAccountStore';

const MIN_PASSWORD_LENGTH = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Konto-Screen. Zwei Zustaende: ohne Konto (Formular fuer Anmelden oder
 * Anlegen) und angemeldet (E-Mail, Schluesselstatus, Abmelden, Loeschen).
 * Keine Fachlogik hier: Validierung der Eingaben ja, alles andere macht
 * der Store.
 */
export default function AccountScreen() {
  const { t } = useTranslation();
  const status = useAccountStore((state) => state.status);

  if (status === ACCOUNT_STATUS.UNKNOWN) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return status === ACCOUNT_STATUS.SIGNED_IN ? <SignedInView t={t} /> : <AuthForm t={t} />;
}

// Fehler aus Supabase in eine Nutzermeldung uebersetzen. Login-Fehler
// bleiben absichtlich einheitlich (keine Unterscheidung E-Mail/Passwort).
function describeError(t, error, { credentials = false } = {}) {
  if (isNetworkError(error)) return t('account.error.offline');
  if (credentials) return t('account.error.credentials');
  return t('account.error.generic', { message: error?.message ?? '' });
}

function AuthForm({ t }) {
  const router = useRouter();
  const busy = useAccountStore((state) => state.busy);
  const prepareSignUp = useAccountStore((state) => state.prepareSignUp);
  const signIn = useAccountStore((state) => state.signIn);
  const requestPasswordReset = useAccountStore((state) => state.requestPasswordReset);

  const [mode, setMode] = useState('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [formError, setFormError] = useState(null);

  const emailProvider = PROVIDERS.find((p) => p.id === 'email' && p.available);
  if (!emailProvider) return null;

  const validate = () => {
    if (!EMAIL_PATTERN.test(email.trim())) return t('account.error.emailInvalid');
    if (password.length < MIN_PASSWORD_LENGTH) return t('account.error.passwordShort');
    if (mode === 'signUp' && password !== passwordRepeat) return t('account.error.passwordMismatch');
    return null;
  };

  const handleSubmit = async () => {
    const problem = validate();
    setFormError(problem);
    if (problem) return;

    try {
      if (mode === 'signUp') {
        await prepareSignUp(email, password);
        setPassword('');
        setPasswordRepeat('');
        router.push('/account-recovery');
      } else {
        await signIn(email, password);
        setPassword('');
      }
    } catch (error) {
      Alert.alert(t('account.error.title'), describeError(t, error, { credentials: mode === 'signIn' }));
    }
  };

  const handleForgot = () => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      setFormError(t('account.error.emailInvalid'));
      return;
    }
    Alert.alert(t('account.forgot.title'), t('account.forgot.text'), [
      { text: t('account.delete.cancel'), style: 'cancel' },
      {
        text: t('account.forgot.action'),
        onPress: async () => {
          try {
            await requestPasswordReset(email);
            Alert.alert(t('account.forgot.title'), t('account.forgot.sent', { email: email.trim() }));
          } catch (error) {
            Alert.alert(t('account.error.title'), describeError(t, error));
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>{t('account.kicker')}</Text>
        <Text style={styles.title}>{t('account.title.anonymous')}</Text>
        <Text style={styles.intro}>{t('account.intro')}</Text>

        <View style={styles.segment}>
          {['signIn', 'signUp'].map((value) => {
            const active = mode === value;
            return (
              <Pressable
                key={value}
                onPress={() => { setMode(value); setFormError(null); }}
                style={[styles.segmentItem, active ? styles.segmentItemActive : null]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.segmentText, active ? styles.segmentTextActive : null]}>
                  {t(value === 'signIn' ? 'account.mode.signIn' : 'account.mode.signUp')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t('account.field.email')}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            accessibilityLabel={t('account.field.email')}
          />

          <Text style={styles.label}>{t('account.field.password')}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType={mode === 'signUp' ? 'newPassword' : 'password'}
            accessibilityLabel={t('account.field.password')}
          />
          {mode === 'signUp' ? (
            <>
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
            </>
          ) : null}

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
              <Text style={styles.primaryButtonText}>
                {t(mode === 'signUp' ? 'account.action.continue' : 'account.action.signIn')}
              </Text>
            )}
          </Pressable>
          {busy && mode === 'signUp' ? <Text style={styles.hint}>{t('account.busy.deriving')}</Text> : null}

          {mode === 'signIn' ? (
            <Pressable onPress={handleForgot} style={styles.quietButton} accessibilityRole="button">
              <Text style={styles.quietButtonText}>{t('account.action.forgot')}</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SignedInView({ t }) {
  const email = useAccountStore((state) => state.email);
  const dataKey = useAccountStore((state) => state.dataKey);
  const busy = useAccountStore((state) => state.busy);
  const signOut = useAccountStore((state) => state.signOut);
  const deleteAccount = useAccountStore((state) => state.deleteAccount);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert(t('account.error.title'), describeError(t, error));
    }
  };

  const handleDelete = () => {
    Alert.alert(t('account.delete.confirmTitle'), t('account.delete.confirmText'), [
      { text: t('account.delete.cancel'), style: 'cancel' },
      {
        text: t('account.delete.confirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount();
            Alert.alert(t('account.delete.done'));
          } catch (error) {
            Alert.alert(t('account.error.title'), describeError(t, error));
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{t('account.kicker')}</Text>
      <Text style={styles.title}>{t('account.signedIn.title')}</Text>

      <View style={styles.card}>
        <Text style={styles.bodyStrong}>{t('account.signedIn.as', { email: email ?? '' })}</Text>
        <Text style={styles.body}>
          {t(dataKey ? 'account.signedIn.keyReady' : 'account.signedIn.keyLocked')}
        </Text>
        <Text style={styles.hint}>{t('account.signedIn.recoveryNote')}</Text>
        <Text style={styles.hint}>{t('account.signedIn.syncNote')}</Text>

        <Pressable
          onPress={handleSignOut}
          disabled={busy}
          style={({ pressed }) => [styles.quietButton, pressed ? styles.buttonPressed : null]}
          accessibilityRole="button"
        >
          <Text style={styles.quietButtonText}>{t('account.action.signOut')}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.bodyStrong}>{t('account.delete.title')}</Text>
        <Text style={styles.body}>{t('account.delete.text')}</Text>
        <Pressable
          onPress={handleDelete}
          disabled={busy}
          style={({ pressed }) => [styles.dangerButton, pressed ? styles.buttonPressed : null]}
          accessibilityRole="button"
        >
          <Text style={styles.dangerButtonText}>{t('account.delete.title')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { ...surfaces.screen },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { ...surfaces.content },
  kicker: { ...type.eyebrow, marginBottom: space.sm },
  title: { ...type.display, marginBottom: space.sm },
  intro: { ...type.body, marginBottom: space.lg },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    padding: 2,
    marginBottom: space.lg,
  },
  segmentItem: { flex: 1, paddingVertical: space.sm, borderRadius: radius.sm, alignItems: 'center' },
  segmentItemActive: { backgroundColor: colors.surface },
  segmentText: { ...type.small, color: colors.inkMuted },
  segmentTextActive: { color: colors.ink, fontWeight: '600' },
  card: { ...surfaces.card, marginBottom: space.lg },
  label: { ...type.label, marginTop: space.md, marginBottom: space.xs },
  input: { ...surfaces.input },
  hint: { ...type.tiny, marginTop: space.sm },
  body: { ...type.body, marginTop: space.sm },
  bodyStrong: { ...type.bodyStrong },
  formError: { ...type.small, color: colors.alert, marginTop: space.md },
  primaryButton: { ...surfaces.buttonPrimary, marginTop: space.lg },
  primaryButtonText: { ...surfaces.buttonPrimaryText },
  quietButton: { ...surfaces.buttonQuiet, marginTop: space.md },
  quietButtonText: { ...surfaces.buttonQuietText },
  dangerButton: {
    ...surfaces.buttonQuiet,
    marginTop: space.md,
  },
  dangerButtonText: { ...surfaces.buttonQuietText, color: colors.alert },
  buttonPressed: { opacity: 0.6 },
});
