import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import CertificationPanel from '../../../components/CertificationPanel';
import LifeStagePicker from '../../../components/LifeStagePicker';
import SubstanceInsightCard from '../../../components/SubstanceInsightCard';
import SupplementResultCard from '../../../components/SupplementResultCard';
import { buildSubstanceProfile } from '../../../ReferenceCheck';
import { matchIngredients } from '../../../SubstanceMatcher';
import mockScanResult from '../../../data/mockScanResult';
import useStore from '../../../useStore';
import { useTranslation } from '../../../i18n';
import { colors, radius, space, surfaces, toneFor, type } from '../../../theme';

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

const cautionTone = toneFor('caution');

export default function ResultsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const saveScanResult = useStore(
    (state) => state.saveScanResult
  );
  const pendingScanResult = useStore(
    (state) => state.pendingScanResult
  );
  const setPendingScanResult = useStore(
    (state) => state.setPendingScanResult
  );
  const clearPendingScanResult = useStore(
    (state) => state.clearPendingScanResult
  );
  const activeLifeStageId = useStore((state) => state.activeLifeStageId);
  const setActiveLifeStage = useStore((state) => state.setActiveLifeStage);

  const isDemoFallback = !pendingScanResult;
  const result = pendingScanResult || mockScanResult;

  // Herkunft des Ergebnisses sichtbar machen (analysisMode aus dem Scan)
  const modeLabel =
    result?.analysisMode === 'vision'
      ? t('results.modeVision')
      : result?.analysisMode === 'barcode-off'
        ? t('results.modeBarcodeOff')
        : isDemoFallback || result?.analysisMode === 'demo-fallback'
          ? t('results.modeDemoFallback')
          : result?.analysisMode === 'mock'
            ? t('results.modeMock')
            : t('results.modeDefault');

  // Herkunfts-Hinweis (BarcodeLookup.js originCountryFromTags): zeigt nur,
  // was Open Food Facts als Verkaufsland fuehrt -- keine Herstellungsgarantie,
  // deshalb "auch verkauft in" statt "kommt aus".
  const origin = result?.origin ?? null;
  const originCountryName = origin
    ? origin.isDach
      ? t(`results.originNames.${origin.code}`)
      : origin.code
    : '';
  const originLabel = origin
    ? origin.isDach
      ? t('results.originDach', { country: originCountryName })
      : t('results.originOther', { country: originCountryName })
    : '';

  const brandDetected =
    hasText(result?.brand) && result.brand !== 'Demo Brand';

  const dosageAmount =
    result?.dosage?.amount ??
    result?.dosageAmount ??
    result?.amount ??
    '';

  const dosageUnit =
    result?.dosage?.unit ??
    result?.dosageUnit ??
    result?.unit ??
    '';

  const dosageDetected =
    String(dosageAmount).trim().length > 0 &&
    String(dosageUnit).trim().length > 0;

  const ingredientCount = Array.isArray(result?.detectedIngredients)
    ? result.detectedIngredients.filter(hasText).length
    : 0;

  const openCriticalCount =
    Number(!brandDetected) +
    Number(!dosageDetected) +
    Number(ingredientCount === 0);

  const reviewPointCount =
    openCriticalCount + Number(ingredientCount > 0);

  // Wirkstoff-Profile: strukturierte Details bevorzugen, sonst die Textliste
  const substanceProfiles = useMemo(() => {
    const source = Array.isArray(result?.ingredientDetails)
      ? result.ingredientDetails
      : Array.isArray(result?.detectedIngredients)
        ? result.detectedIngredients
        : [];

    return matchIngredients(source).map((match) =>
      buildSubstanceProfile(match, activeLifeStageId)
    );
  }, [result, activeLifeStageId]);

  const matchedCount = substanceProfiles.filter((p) => p.matched).length;

  function handleOpenReviewForm(extraParams = '') {
    if (!pendingScanResult) {
      const storedScan = saveScanResult({
        ...mockScanResult,
        analysisMode: 'demo-fallback',
      });

      setPendingScanResult(storedScan);
    }

    router.push(`/AddSupplement?fromScan=1${extraParams}`);
  }

  function handleRescan() {
    clearPendingScanResult();
    router.replace('/scanner');
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.kicker}>{t('results.kicker')}</Text>

          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>
              {modeLabel}
            </Text>
          </View>
        </View>

        {origin ? (
          <View
            style={styles.originBadge}
            accessibilityLabel={originLabel}
            accessibilityHint={t('results.originHint')}
          >
            <Text style={styles.originBadgeText}>{originLabel}</Text>
          </View>
        ) : null}

        <Text style={styles.title}>
          {t('results.title')}
        </Text>

        <Text style={styles.subtitle}>
          {t('results.subtitle')}
        </Text>
      </View>

      <View style={styles.reviewSummary}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryLabel}>{t('results.reviewStatusLabel')}</Text>
            <Text style={styles.summaryTitle}>
              {reviewPointCount === 1
                ? t('results.reviewPoint_one', { count: reviewPointCount })
                : t('results.reviewPoint_other', { count: reviewPointCount })}
            </Text>
          </View>

          <View
            style={[
              styles.summaryBadge,
              openCriticalCount === 0 && styles.summaryBadgeComplete,
            ]}
          >
            <Text
              style={[
                styles.summaryBadgeText,
                openCriticalCount === 0 &&
                  styles.summaryBadgeTextComplete,
              ]}
            >
              {openCriticalCount === 0
                ? t('results.summaryComplete')
                : t('results.summaryOpen', { count: openCriticalCount })}
            </Text>
          </View>
        </View>

        <Text style={styles.summaryText}>
          {openCriticalCount === 0
            ? t('results.summaryTextComplete')
            : t('results.summaryTextIncomplete')}
        </Text>

        {/* Offene Punkte einzeln, direkt nachtragbar: der Knopf springt in
            den Aufnehmen-Screen mit aufgeklappten Produktfeldern (?edit=1). */}
        {openCriticalCount > 0 ? (
          <>
            {!brandDetected ? (
              <Text style={styles.missingRow}>· {t('results.missing.brand')}</Text>
            ) : null}
            {!dosageDetected ? (
              <Text style={styles.missingRow}>· {t('results.missing.dosage')}</Text>
            ) : null}
            {ingredientCount === 0 ? (
              <Text style={styles.missingRow}>· {t('results.missing.ingredients')}</Text>
            ) : null}
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleOpenReviewForm('&edit=1')}
              activeOpacity={0.75}
              accessibilityRole="button"
            >
              <Text style={styles.completeButtonText}>{t('results.completeAction')}</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      <SupplementResultCard result={result} />

      {substanceProfiles.length > 0 ? (
        <View style={styles.substanceSection}>
          <Text style={styles.substanceKicker}>{t('results.substanceSectionKicker')}</Text>
          <Text style={styles.substanceTitle}>
            {matchedCount === 0
              ? t('results.substanceTitleNone')
              : matchedCount === 1
                ? t('results.substanceTitle_one', { count: matchedCount })
                : t('results.substanceTitle_other', { count: matchedCount })}
          </Text>
          <Text style={styles.substanceText}>
            {t('results.substanceText')}
          </Text>

          <View style={styles.pickerWrapper}>
            <LifeStagePicker
              value={activeLifeStageId}
              onChange={setActiveLifeStage}
            />
          </View>

          {substanceProfiles.map((profile, index) => (
            <SubstanceInsightCard
              key={`${profile.substanceId ?? 'unmatched'}-${index}`}
              profile={profile}
            />
          ))}
        </View>
      ) : null}

      {result?.analysisMode === 'vision' ? (
        <View style={styles.substanceSection}>
          <Text style={styles.substanceKicker}>{t('results.certKicker')}</Text>
          <Text style={styles.substanceTitle}>{t('results.certTitle')}</Text>
          <Text style={styles.substanceText}>
            {t('results.certText')}
          </Text>

          <CertificationPanel labels={result.detectedCertifications} />
        </View>
      ) : null}

      <View style={styles.nextStepCard}>
        <Text style={styles.nextStepKicker}>{t('results.nextStepKicker')}</Text>
        <Text style={styles.nextStepTitle}>
          {t('results.nextStepTitle')}
        </Text>
        <Text style={styles.nextStepText}>
          {t('results.nextStepText')}
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleOpenReviewForm}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>
            {t('results.primaryButton')}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleRescan}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryButtonText}>
          {t('results.rescanButton')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tertiaryButton}
        onPress={() => router.replace('/menu')}
        activeOpacity={0.75}
        accessibilityRole="button"
      >
        <Text style={styles.tertiaryButtonText}>
          {t('common.backToHome')}
        </Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        {t('results.disclaimer')}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: surfaces.screen,
  content: surfaces.content,
  heroCard: {
    ...surfaces.card,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    ...type.eyebrow,
  },
  modeBadge: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.xs + 1,
  },
  modeBadgeText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
  },
  // Herkunfts-Hinweis: neutrale Optik wie jede andere Metazeile, kein
  // Warn- oder Werbeton (gleiche Bauweise wie der OFF-Badge in
  // components/SupplementResultCard.jsx, search.jsx, brands.jsx).
  originBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm - 2,
    paddingVertical: 2,
    marginTop: space.sm,
  },
  originBadgeText: {
    ...type.tiny,
    fontSize: 10,
    lineHeight: 12,
  },
  title: {
    ...type.display,
    marginTop: space.md + 1,
  },
  subtitle: {
    ...type.body,
    marginTop: space.sm + 1,
  },
  reviewSummary: {
    backgroundColor: cautionTone.surface,
    borderColor: cautionTone.rule,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.md + 2,
    marginBottom: space.md + 2,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    ...type.label,
    color: cautionTone.ink,
  },
  summaryTitle: {
    ...type.heading,
    color: cautionTone.ink,
    marginTop: 3,
  },
  summaryBadge: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: space.sm + 1,
    paddingVertical: space.sm - 1,
  },
  summaryBadgeComplete: {
    backgroundColor: toneFor('affirm').surface,
  },
  summaryBadgeText: {
    color: cautionTone.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  summaryBadgeTextComplete: {
    color: toneFor('affirm').ink,
  },
  missingRow: {
    ...type.small,
    color: cautionTone.ink,
    marginTop: space.xs,
  },
  // Tippflaeche 44 pt (CLAUDE.md Bedienregeln).
  completeButton: {
    alignSelf: 'flex-start',
    marginTop: space.md,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    minHeight: 44,
    justifyContent: 'center',
  },
  completeButtonText: {
    ...type.small,
    color: colors.surface,
    fontWeight: '600',
  },
  summaryText: {
    color: cautionTone.ink,
    fontSize: 12,
    lineHeight: 18,
    marginTop: space.sm + 1,
  },
  substanceSection: {
    marginTop: space.lg + 2,
  },
  substanceKicker: {
    ...type.label,
    color: colors.accent,
  },
  substanceTitle: {
    ...type.heading,
    fontSize: 20,
    lineHeight: 26,
    marginTop: space.xs + 1,
  },
  substanceText: {
    ...type.body,
    marginTop: space.sm - 1,
    marginBottom: space.md + 2,
  },
  pickerWrapper: {
    marginBottom: space.xs,
  },
  nextStepCard: {
    ...surfaces.card,
    marginTop: space.md + 2,
    marginBottom: 0,
  },
  nextStepKicker: {
    ...type.label,
    color: colors.accent,
  },
  nextStepTitle: {
    ...type.heading,
    fontSize: 19,
    lineHeight: 25,
    marginTop: space.xs + 1,
  },
  nextStepText: {
    ...type.body,
    marginTop: space.sm - 1,
  },
  primaryButton: {
    ...surfaces.buttonPrimary,
    marginTop: space.md + 3,
  },
  primaryButtonText: {
    ...surfaces.buttonPrimaryText,
    fontSize: 14,
  },
  secondaryButton: {
    ...surfaces.buttonQuiet,
    marginTop: space.md - 1,
  },
  secondaryButtonText: {
    ...surfaces.buttonQuietText,
    fontSize: 14,
  },
  tertiaryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.xs,
  },
  tertiaryButtonText: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  disclaimer: {
    ...type.tiny,
    textAlign: 'center',
    marginTop: space.md + 3,
    paddingHorizontal: space.sm - 2,
  },
});
