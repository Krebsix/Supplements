import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../i18n';
import { colors, radius, space, surfaces, toneFor, type } from '../theme';

// Schluessel statt fertiger Labels — die Uebersetzung passiert erst beim
// Rendern, damit ReviewRow die aktuelle Sprache ueber t() bekommt.
// Die Feldzustaende nutzen die gleichen gedeckten Statusstufen wie der
// Rest der App: "detected" = affirm, "review" = caution, "missing" = alert.
const FIELD_STATES = {
  detected: {
    labelKey: 'components.result.fieldStateDetected',
    tone: 'affirm',
  },
  review: {
    labelKey: 'components.result.fieldStateReview',
    tone: 'caution',
  },
  missing: {
    labelKey: 'components.result.fieldStateMissing',
    tone: 'alert',
  },
};

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function ReviewRow({ t, label, value, state = 'review', helper }) {
  const stateConfig = FIELD_STATES[state] || FIELD_STATES.review;
  const tone = toneFor(stateConfig.tone);

  return (
    <View style={styles.reviewRow}>
      <View style={styles.reviewRowContent}>
        <Text style={styles.reviewLabel}>{label}</Text>
        <Text style={styles.reviewValue}>{value}</Text>
        {helper ? <Text style={styles.reviewHelper}>{helper}</Text> : null}
      </View>

      <View style={[styles.stateBadge, { backgroundColor: tone.surface }]}>
        <Text style={[styles.stateBadgeText, { color: tone.ink }]}>
          {t(stateConfig.labelKey)}
        </Text>
      </View>
    </View>
  );
}

export default function SupplementResultCard({ result }) {
  const { t } = useTranslation();

  const productNameDetected =
    hasText(result?.productName) || hasText(result?.name);

  const productName = productNameDetected
    ? result.productName || result.name
    : t('components.result.productNameMissing');

  const brandDetected =
    hasText(result?.brand) && result.brand !== 'Demo Brand';

  const brand = brandDetected
    ? result.brand
    : t('components.result.brandMissing');

  const ingredients = Array.isArray(result?.detectedIngredients)
    ? result.detectedIngredients.filter(hasText)
    : [];

  const warnings = Array.isArray(result?.warnings)
    ? result.warnings.filter(hasText)
    : [];

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

  const dosage = dosageDetected
    ? `${dosageAmount} ${dosageUnit}`
    : t('components.result.dosageMissing');

  const numericConfidence = Number(result?.confidence);
  const confidenceAvailable = Number.isFinite(numericConfidence);

  const confidenceLabel = !confidenceAvailable
    ? t('components.result.confidenceNone')
    : numericConfidence >= 90
      ? t('components.result.confidenceHigh')
      : numericConfidence >= 75
        ? t('components.result.confidenceReview')
        : t('components.result.confidenceManual');

  return (
    <View style={styles.card}>
      <View style={styles.identityHeader}>
        <View style={styles.identityText}>
          <Text style={styles.eyebrow}>
            {t('components.result.identityEyebrow')}
          </Text>
          <Text style={styles.product}>{productName}</Text>
          <Text style={styles.brand}>{brand}</Text>
        </View>

        <View style={styles.scanBadge}>
          <Text style={styles.scanBadgeText}>
            {t('components.result.scanBadge')}
          </Text>
        </View>
      </View>

      <View style={styles.confidenceCard}>
        <View style={styles.confidenceHeader}>
          <Text style={styles.confidenceTitle}>
            {t('components.result.confidenceTitle')}
          </Text>

          <Text style={styles.confidenceValue}>
            {confidenceAvailable ? `${numericConfidence}%` : '–'}
          </Text>
        </View>

        <Text style={styles.confidenceStatus}>{confidenceLabel}</Text>

        <Text style={styles.confidenceExplanation}>
          {t('components.result.confidenceExplanation')}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('components.result.reviewSectionTitle')}
          </Text>
          <Text style={styles.sectionHint}>
            {t('components.result.reviewSectionHint')}
          </Text>
        </View>

        <View style={styles.reviewList}>
          <ReviewRow
            t={t}
            label={t('components.result.fieldProductName')}
            value={productName}
            state={productNameDetected ? 'detected' : 'missing'}
            helper={
              productNameDetected
                ? t('components.result.helperProductNameDetected')
                : t('components.result.helperProductNameMissing')
            }
          />

          <ReviewRow
            t={t}
            label={t('components.result.fieldBrand')}
            value={brand}
            state={brandDetected ? 'detected' : 'missing'}
            helper={
              brandDetected
                ? t('components.result.helperBrandDetected')
                : t('components.result.helperBrandMissing')
            }
          />

          <ReviewRow
            t={t}
            label={t('components.result.fieldDosage')}
            value={dosage}
            state={dosageDetected ? 'review' : 'missing'}
            helper={
              dosageDetected
                ? t('components.result.helperDosageDetected')
                : t('components.result.helperDosageMissing')
            }
          />

          <ReviewRow
            t={t}
            label={t('components.result.fieldIngredients')}
            value={
              ingredients.length === 1
                ? t('components.result.ingredientsCount_one')
                : t('components.result.ingredientsCount_other', {
                    count: ingredients.length,
                  })
            }
            state={ingredients.length > 0 ? 'review' : 'missing'}
            helper={
              ingredients.length > 0
                ? t('components.result.helperIngredientsDetected')
                : t('components.result.helperIngredientsMissing')
            }
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('components.result.ingredientsSectionTitle')}
        </Text>
        <Text style={styles.sectionDescription}>
          {t('components.result.ingredientsSectionDescription')}
        </Text>

        {ingredients.length > 0 ? (
          <View style={styles.ingredientWrap}>
            {ingredients.map((ingredient) => (
              <View key={ingredient} style={styles.ingredientChip}>
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              {t('components.result.ingredientsEmpty')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('components.result.warningsSectionTitle')}
        </Text>

        {warnings.length > 0 ? (
          <View style={styles.warningList}>
            {warnings.map((warning, index) => (
              <View key={`${warning}-${index}`} style={styles.warningCard}>
                <View style={styles.warningNumber}>
                  <Text style={styles.warningNumberText}>{index + 1}</Text>
                </View>

                <Text style={styles.warningText}>{warning}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              {t('components.result.warningsEmpty')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.timingCard}>
        <View style={styles.timingHeader}>
          <Text style={styles.timingTitle}>
            {t('components.result.timingTitle')}
          </Text>

          <View style={styles.suggestionBadge}>
            <Text style={styles.suggestionBadgeText}>
              {t('components.result.timingBadge')}
            </Text>
          </View>
        </View>

        <Text style={styles.timingText}>
          {hasText(result?.timingSuggestion)
            ? result.timingSuggestion
            : t('components.result.timingEmpty')}
        </Text>

        <Text style={styles.timingFootnote}>
          {t('components.result.timingFootnote')}
        </Text>
      </View>

      {hasText(result?.uncertaintyNote) ? (
        <View style={styles.uncertaintyCard}>
          <Text style={styles.uncertaintyTitle}>
            {t('components.result.uncertaintyTitle')}
          </Text>
          <Text style={styles.uncertaintyText}>
            {result.uncertaintyNote}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const warningTone = toneFor('caution');

const styles = StyleSheet.create({
  card: {
    ...surfaces.card,
    marginBottom: 0,
  },
  identityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  identityText: {
    flex: 1,
    paddingRight: space.md,
  },
  eyebrow: {
    ...type.eyebrow,
    marginBottom: space.sm - 2,
  },
  product: {
    ...type.display,
    fontSize: 23,
    lineHeight: 29,
  },
  brand: {
    color: colors.inkMuted,
    fontSize: 14,
    marginTop: space.xs + 1,
  },
  scanBadge: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.xs + 2,
  },
  scanBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '900',
  },
  confidenceCard: {
    backgroundColor: colors.surfaceSunken,
    borderColor: colors.rule,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.lg - 1,
    marginTop: space.lg + 2,
  },
  confidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confidenceTitle: {
    ...type.bodyStrong,
    fontSize: 13,
  },
  confidenceValue: {
    ...type.numeral,
    fontSize: 22,
  },
  confidenceStatus: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '900',
    marginTop: space.xs + 1,
  },
  confidenceExplanation: {
    ...type.small,
    marginTop: space.sm - 1,
  },
  section: {
    marginTop: space.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...type.heading,
  },
  sectionHint: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionDescription: {
    ...type.small,
    marginTop: space.xs + 2,
  },
  reviewList: {
    marginTop: space.sm + 2,
  },
  reviewRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSunken,
    borderColor: colors.rule,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.md + 1,
    marginBottom: space.sm + 1,
  },
  reviewRowContent: {
    flex: 1,
    paddingRight: space.sm + 2,
  },
  reviewLabel: {
    ...type.label,
    color: colors.inkMuted,
  },
  reviewValue: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    marginTop: 3,
  },
  reviewHelper: {
    ...type.small,
    marginTop: space.xs,
  },
  stateBadge: {
    borderRadius: radius.md,
    paddingHorizontal: space.sm + 1,
    paddingVertical: space.xs + 1,
  },
  stateBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  ingredientWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: space.sm + 2,
  },
  ingredientChip: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.rule,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.sm + 3,
    paddingVertical: space.sm - 1,
    marginRight: space.sm - 1,
    marginBottom: space.sm - 1,
  },
  ingredientText: {
    color: colors.accentInk,
    fontSize: 12,
    fontWeight: '800',
  },
  warningList: {
    marginTop: space.sm + 2,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: warningTone.surface,
    borderColor: warningTone.rule,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.md + 1,
    marginBottom: space.sm + 1,
  },
  warningNumber: {
    width: 25,
    height: 25,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.sm + 2,
  },
  warningNumberText: {
    color: warningTone.ink,
    fontSize: 11,
    fontWeight: '900',
  },
  warningText: {
    flex: 1,
    color: warningTone.ink,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyBox: {
    backgroundColor: colors.surfaceSunken,
    borderColor: colors.rule,
    borderWidth: 1,
    borderRadius: radius.lg - 2,
    padding: space.md + 1,
    marginTop: space.sm + 1,
  },
  emptyText: {
    ...type.small,
  },
  timingCard: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.rule,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.lg - 1,
    marginTop: space.xl + 2,
  },
  timingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timingTitle: {
    color: colors.accentInk,
    fontSize: 14,
    fontWeight: '900',
  },
  suggestionBadge: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: space.sm + 1,
    paddingVertical: space.xs + 1,
  },
  suggestionBadgeText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '900',
  },
  timingText: {
    color: colors.accentInk,
    fontSize: 13,
    lineHeight: 19,
    marginTop: space.sm + 1,
  },
  timingFootnote: {
    color: colors.accent,
    fontSize: 11,
    lineHeight: 16,
    marginTop: space.sm,
  },
  uncertaintyCard: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.lg,
    padding: space.md + 2,
    marginTop: space.md,
  },
  uncertaintyTitle: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: space.xs + 1,
  },
  uncertaintyText: {
    ...type.small,
    fontSize: 11,
    lineHeight: 17,
  },
});
