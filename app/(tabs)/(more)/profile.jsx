import React, { useMemo } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { checkProfileAgainstStack, summarizeProfileFindings } from '../../../ProfileCheck';
import { MEDICATION_CLASSES } from '../../../data/medicationClasses';
import { localizeMedicationClass } from '../../../data/localize';
import { useTranslation } from '../../../i18n';
import useStore from '../../../useStore';
import { colors, radius, space, surfaces, toneFor, type } from '../../../theme';

/**
 * Profil-Screen
 *
 * Zeigt, wo in den hinterlegten Quellen etwas zu einer angegebenen
 * Medikamentengruppe steht — mit woertlichem Zitat und Quellenlink.
 *
 * Bewusst KEINE Bewertung der persoenlichen Situation: Die App kennt
 * weder Praeparat noch Dosis noch Befund. Deshalb ueberall "die Quelle
 * sagt", nie "bei dir ist".
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const profile = useStore((state) => state.profile);
  const toggleProfileEntry = useStore((state) => state.toggleProfileEntry);
  const clearProfile = useStore((state) => state.clearProfile);
  const getActiveSupplements = useStore((state) => state.getActiveSupplements);

  const supplements = getActiveSupplements();
  const selected = profile?.medicationClasses ?? [];

  const findings = useMemo(
    () => checkProfileAgainstStack(profile, supplements),
    [profile, supplements]
  );
  const summary = summarizeProfileFindings(findings);

  const emptyKey = selected.length === 0
    ? 'profile.findings.emptyNoSelection'
    : supplements.length === 0
      ? 'profile.findings.emptyNoStack'
      : 'profile.findings.empty';

  function confirmReset() {
    Alert.alert(
      t('profile.resetConfirm.title'),
      t('profile.resetConfirm.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('profile.resetConfirm.confirm'), style: 'destructive', onPress: clearProfile },
      ]
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{t('profile.kicker')}</Text>
      <Text style={styles.title}>{t('profile.title')}</Text>
      <Text style={styles.subtitle}>{t('profile.subtitle')}</Text>

      <View style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>{t('profile.privacy.title')}</Text>
        <Text style={styles.privacyText}>{t('profile.privacy.text')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('profile.medications.title')}</Text>
        <Text style={styles.cardHint}>{t('profile.medications.hint')}</Text>

        <View style={styles.chipWrap}>
          {MEDICATION_CLASSES.map((rawEntry) => {
            const entry = localizeMedicationClass(rawEntry);
            const isActive = selected.includes(entry.id);
            return (
              <TouchableOpacity
                key={entry.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => toggleProfileEntry('medicationClasses', entry.id)}
                activeOpacity={0.8}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isActive }}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {entry.label}
                </Text>
                <Text style={[styles.chipExample, isActive && styles.chipExampleActive]}>
                  {entry.examples}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selected.length > 0 ? (
          <TouchableOpacity style={styles.resetButton} onPress={confirmReset}>
            <Text style={styles.resetButtonText}>{t('profile.reset')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>{t('profile.findings.title')}</Text>

      {findings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t(emptyKey)}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.countLine}>
            {t(summary.total === 1 ? 'profile.findings.count_one' : 'profile.findings.count_other', {
              count: summary.total,
            })}
          </Text>

          {findings.map((finding, index) => (
            <FindingCard
              key={`${finding.substanceId}-${finding.medicationClassId}-${index}`}
              finding={finding}
              t={t}
            />
          ))}

          <Text style={styles.disclaimer}>{t('profile.findings.disclaimer')}</Text>
        </>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/menu')}>
        <Text style={styles.backButtonText}>{t('common.backToHome')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function FindingCard({ finding, t }) {
  const tone = toneFor(finding.severity);

  return (
    <View style={[styles.findingCard, { borderColor: tone.rule, backgroundColor: tone.surface }]}>
      <View style={styles.findingHead}>
        <Text style={styles.findingSubstance}>{finding.substanceName}</Text>
        <Text style={[styles.findingSeverity, { color: tone.ink }]}>
          {t(`profile.severity.${finding.severity}`)}
        </Text>
      </View>

      <Text style={styles.findingClass}>{finding.medicationClassLabel}</Text>

      <Text style={styles.quoteLabel}>{t('profile.findings.quoteLabel')}</Text>
      {/* Woertliches Zitat aus der Quelle — bewusst nicht paraphrasiert,
          damit die Aussage nachpruefbar bleibt. */}
      <Text style={styles.quote}>“{finding.quote}”</Text>

      <Text style={styles.inProducts}>
        {t('profile.findings.inProducts', { products: finding.productNames.join(', ') })}
      </Text>

      {finding.sources.length > 0 ? (
        <View style={styles.sourceWrap}>
          <Text style={styles.sourceLabel}>{t('profile.findings.sources')}</Text>
          {finding.sources.map((source, index) => (
            <Text
              key={`${source.label}-${index}`}
              style={[styles.sourceItem, source.url && styles.sourceLink]}
              onPress={source.url ? () => Linking.openURL(source.url) : undefined}
            >
              {source.label}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { ...surfaces.screen },
  content: { ...surfaces.content },
  kicker: { ...type.eyebrow, marginBottom: space.sm },
  title: { ...type.display },
  subtitle: { ...type.body, marginTop: space.md, marginBottom: space.lg },
  privacyCard: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.rule,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.lg,
  },
  privacyTitle: { color: colors.accent, fontSize: 13, fontWeight: '800', marginBottom: space.xs },
  privacyText: { ...type.small, lineHeight: 19 },
  card: { ...surfaces.card, marginBottom: space.xxl - space.sm },
  cardTitle: { ...type.subheading },
  cardHint: { ...type.small, marginTop: space.sm, marginBottom: space.lg },
  chipWrap: { gap: space.sm },
  chip: { ...surfaces.chip, borderRadius: radius.lg, paddingHorizontal: 13, paddingVertical: space.md - 2 },
  chipActive: { ...surfaces.chipActive },
  chipText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  chipTextActive: { ...surfaces.chipTextActive },
  chipExample: { ...type.tiny, marginTop: 2 },
  chipExampleActive: { color: colors.accentSoft },
  resetButton: { marginTop: space.md, alignSelf: 'flex-start' },
  resetButtonText: { color: colors.alert, fontSize: 13, fontWeight: '700' },
  sectionTitle: { ...type.heading, marginBottom: space.md },
  countLine: { ...type.small, fontWeight: '700', marginBottom: space.md },
  emptyCard: { ...surfaces.card, marginBottom: space.xl - 2 },
  emptyText: { ...type.small, lineHeight: 20 },
  findingCard: { borderWidth: 1, borderRadius: radius.lg, padding: space.lg - 1, marginBottom: space.md },
  findingHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  findingSubstance: { ...type.bodyStrong, fontSize: 15, flex: 1, paddingRight: space.sm },
  findingSeverity: { fontSize: 11, fontWeight: '800', textAlign: 'right', flexShrink: 0, maxWidth: 130 },
  findingClass: { color: colors.inkMuted, fontSize: 12, fontWeight: '700', marginTop: 3 },
  quoteLabel: { ...type.label, marginTop: space.md, marginBottom: space.xs },
  quote: { ...type.quote, fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
  inProducts: { ...type.small, marginTop: space.md },
  sourceWrap: { marginTop: space.md, borderTopWidth: 1, borderTopColor: colors.rule, paddingTop: space.sm },
  sourceLabel: { ...type.label, marginBottom: 3 },
  sourceItem: { color: colors.inkMuted, fontSize: 11, lineHeight: 17 },
  sourceLink: { color: colors.accent, textDecorationLine: 'underline' },
  disclaimer: { ...type.tiny, lineHeight: 18, marginTop: space.sm, marginBottom: space.lg },
  backButton: { ...surfaces.buttonQuiet },
  backButtonText: { ...surfaces.buttonQuietText, fontSize: 15 },
});
