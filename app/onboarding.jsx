import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import LifeStagePicker from '../components/LifeStagePicker';
import { PRIVACY_VERSION } from '../data/legalContent';
import { useTranslation } from '../i18n';
import { useStore } from '../useStore';
import { colors, radius, space, surfaces, type } from '../theme';

/**
 * Erster Start.
 *
 * Zwei Dinge passieren hier, beide bewusst VOR der ersten Nutzung:
 *
 * 1. Die Lebensphase wird aktiv gewaehlt — ohne Vorauswahl. Frueher
 *    startete die App still als "erwachsene Frau"; fuer alle anderen
 *    Nutzergruppen waren die Referenzwerte damit vom ersten Tag an falsch.
 * 2. Die Datenschutzerklaerung wird zur Kenntnis genommen. Die Einwilligung
 *    zur Foto-Uebertragung ist hier ausdruecklich NICHT dabei — sie wird
 *    erst vor dem ersten Scan eingeholt, dort, wo sie verstaendlich ist.
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const completeOnboarding = useStore((state) => state.completeOnboarding);

  const [lifeStageId, setLifeStageId] = useState(null);
  const [showRequiredHint, setShowRequiredHint] = useState(false);

  const handleStart = () => {
    if (!lifeStageId) {
      setShowRequiredHint(true);
      return;
    }
    completeOnboarding({ lifeStageId, privacyVersion: PRIVACY_VERSION });
    router.replace('/Dashboard');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>{t('onboarding.eyebrow')}</Text>
      <Text style={styles.title}>{t('onboarding.title')}</Text>
      <Text style={styles.intro}>{t('onboarding.intro')}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('onboarding.lifeStage.title')}</Text>
        <Text style={styles.cardBody}>{t('onboarding.lifeStage.why')}</Text>
        <LifeStagePicker value={lifeStageId} onChange={(id) => {
          setLifeStageId(id);
          setShowRequiredHint(false);
        }} />
        {showRequiredHint ? (
          <Text style={styles.requiredHint}>{t('onboarding.lifeStage.required')}</Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('onboarding.privacy.title')}</Text>
        <Text style={styles.cardBody}>{t('onboarding.privacy.summary')}</Text>
        <TouchableOpacity
          onPress={() => router.push('/privacy')}
          accessibilityRole="link"
          accessibilityLabel={t('onboarding.privacy.link')}
        >
          <Text style={styles.link}>{t('onboarding.privacy.link')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/imprint')}
          accessibilityRole="link"
          accessibilityLabel={t('onboarding.imprint.link')}
        >
          <Text style={styles.link}>{t('onboarding.imprint.link')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.confirmNote}>{t('onboarding.confirm')}</Text>

      <TouchableOpacity
        style={[styles.startButton, !lifeStageId && styles.startButtonDisabled]}
        onPress={handleStart}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ disabled: !lifeStageId }}
        accessibilityLabel={t('onboarding.start')}
      >
        <Text style={styles.startButtonText}>{t('onboarding.start')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: surfaces.screen,
  content: { ...surfaces.content, paddingTop: 72 },
  eyebrow: { ...type.eyebrow, marginBottom: space.sm },
  title: { ...type.display, marginBottom: space.md },
  intro: { ...type.body, marginBottom: space.xl },
  card: surfaces.card,
  cardTitle: { ...type.heading, marginBottom: space.sm },
  cardBody: { ...type.body, marginBottom: space.md },
  requiredHint: { ...type.small, color: colors.caution, marginTop: space.sm },
  link: {
    ...type.bodyStrong,
    color: colors.accent,
    paddingVertical: space.sm,
    textDecorationLine: 'underline',
  },
  confirmNote: { ...type.small, marginTop: space.sm, marginBottom: space.md },
  startButton: { ...surfaces.buttonPrimary, marginTop: space.sm },
  startButtonDisabled: { opacity: 0.5, borderRadius: radius.md },
  startButtonText: surfaces.buttonPrimaryText,
});
