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

import { checkProfileAgainstStack, summarizeProfileFindings } from '../ProfileCheck';
import { MEDICATION_CLASSES } from '../data/medicationClasses';
import { useTranslation } from '../i18n';
import useStore from '../useStore';

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
          {MEDICATION_CLASSES.map((entry) => {
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

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
        <Text style={styles.backButtonText}>{t('common.backToHome')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const SEVERITY_STYLE = {
  contraindicated: { hex: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  medical: { hex: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  attention: { hex: '#0f766e', bg: '#f0fdfa', border: '#ccfbf1' },
};

function FindingCard({ finding, t }) {
  const tone = SEVERITY_STYLE[finding.severity] ?? SEVERITY_STYLE.attention;

  return (
    <View style={[styles.findingCard, { borderColor: tone.border, backgroundColor: tone.bg }]}>
      <View style={styles.findingHead}>
        <Text style={styles.findingSubstance}>{finding.substanceName}</Text>
        <Text style={[styles.findingSeverity, { color: tone.hex }]}>
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
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 44 },
  kicker: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: { color: '#0f172a', fontSize: 26, lineHeight: 32, fontWeight: '800' },
  subtitle: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 18,
  },
  privacyCard: {
    backgroundColor: '#ecfdf5',
    borderColor: '#ccfbf1',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  privacyTitle: { color: '#0f766e', fontSize: 13, fontWeight: '800', marginBottom: 4 },
  privacyText: { color: '#475569', fontSize: 13, lineHeight: 19 },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 22,
  },
  cardTitle: { color: '#0f172a', fontSize: 16, fontWeight: '800' },
  cardHint: { color: '#64748b', fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 14 },
  chipWrap: { gap: 8 },
  chip: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  chipActive: { backgroundColor: '#0f766e', borderColor: '#0f766e' },
  chipText: { color: '#0f172a', fontSize: 14, fontWeight: '700' },
  chipTextActive: { color: '#ffffff' },
  chipExample: { color: '#94a3b8', fontSize: 11, lineHeight: 16, marginTop: 2 },
  chipExampleActive: { color: '#ccfbf1' },
  resetButton: { marginTop: 14, alignSelf: 'flex-start' },
  resetButtonText: { color: '#dc2626', fontSize: 13, fontWeight: '700' },
  sectionTitle: { color: '#0f172a', fontSize: 16, fontWeight: '800', marginBottom: 10 },
  countLine: { color: '#64748b', fontSize: 13, fontWeight: '700', marginBottom: 10 },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  emptyText: { color: '#64748b', fontSize: 13, lineHeight: 20 },
  findingCard: { borderWidth: 1, borderRadius: 18, padding: 15, marginBottom: 12 },
  findingHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  findingSubstance: { color: '#0f172a', fontSize: 15, fontWeight: '800', flex: 1, paddingRight: 8 },
  findingSeverity: { fontSize: 11, fontWeight: '800', textAlign: 'right', flexShrink: 0, maxWidth: 130 },
  findingClass: { color: '#475569', fontSize: 12, fontWeight: '700', marginTop: 3 },
  quoteLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 4,
  },
  quote: { color: '#0f172a', fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
  inProducts: { color: '#64748b', fontSize: 12, lineHeight: 18, marginTop: 10 },
  sourceWrap: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 8 },
  sourceLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  sourceItem: { color: '#64748b', fontSize: 11, lineHeight: 17 },
  sourceLink: { color: '#0f766e', textDecorationLine: 'underline' },
  disclaimer: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 18,
  },
  backButton: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backButtonText: { color: '#0f172a', fontSize: 15, fontWeight: '800' },
});
