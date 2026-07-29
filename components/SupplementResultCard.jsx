import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../i18n';

// Schluessel statt fertiger Labels — die Uebersetzung passiert erst beim
// Rendern, damit ReviewRow die aktuelle Sprache ueber t() bekommt.
const FIELD_STATES = {
  detected: {
    labelKey: 'components.result.fieldStateDetected',
    badgeStyle: 'detectedBadge',
    textStyle: 'detectedBadgeText',
  },
  review: {
    labelKey: 'components.result.fieldStateReview',
    badgeStyle: 'reviewBadge',
    textStyle: 'reviewBadgeText',
  },
  missing: {
    labelKey: 'components.result.fieldStateMissing',
    badgeStyle: 'missingBadge',
    textStyle: 'missingBadgeText',
  },
};

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function ReviewRow({ t, label, value, state = 'review', helper }) {
  const stateConfig = FIELD_STATES[state] || FIELD_STATES.review;

  return (
    <View style={styles.reviewRow}>
      <View style={styles.reviewRowContent}>
        <Text style={styles.reviewLabel}>{label}</Text>
        <Text style={styles.reviewValue}>{value}</Text>
        {helper ? <Text style={styles.reviewHelper}>{helper}</Text> : null}
      </View>

      <View style={[styles.stateBadge, styles[stateConfig.badgeStyle]]}>
        <Text style={[styles.stateBadgeText, styles[stateConfig.textStyle]]}>
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe4ee',
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  identityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  identityText: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    color: '#0f766e',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  product: {
    color: '#0f172a',
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
  },
  brand: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 5,
  },
  scanBadge: {
    backgroundColor: '#ecfdf5',
    borderColor: '#99f6e4',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  scanBadgeText: {
    color: '#0f766e',
    fontSize: 11,
    fontWeight: '900',
  },
  confidenceCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    marginTop: 18,
  },
  confidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confidenceTitle: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
  },
  confidenceValue: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '900',
  },
  confidenceStatus: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 5,
  },
  confidenceExplanation: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },
  section: {
    marginTop: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
  },
  sectionHint: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionDescription: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  reviewList: {
    marginTop: 11,
  },
  reviewRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    marginBottom: 9,
  },
  reviewRowContent: {
    flex: 1,
    paddingRight: 10,
  },
  reviewLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  reviewValue: {
    color: '#0f172a',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    marginTop: 3,
  },
  reviewHelper: {
    color: '#64748b',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  stateBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  stateBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  detectedBadge: {
    backgroundColor: '#ccfbf1',
  },
  detectedBadgeText: {
    color: '#0f766e',
  },
  reviewBadge: {
    backgroundColor: '#fef3c7',
  },
  reviewBadgeText: {
    color: '#92400e',
  },
  missingBadge: {
    backgroundColor: '#fee2e2',
  },
  missingBadgeText: {
    color: '#b91c1c',
  },
  ingredientWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 11,
  },
  ingredientChip: {
    backgroundColor: '#f0fdfa',
    borderColor: '#99f6e4',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginRight: 7,
    marginBottom: 7,
  },
  ingredientText: {
    color: '#115e59',
    fontSize: 12,
    fontWeight: '800',
  },
  warningList: {
    marginTop: 11,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    marginBottom: 9,
  },
  warningNumber: {
    width: 25,
    height: 25,
    borderRadius: 9,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  warningNumberText: {
    color: '#92400e',
    fontSize: 11,
    fontWeight: '900',
  },
  warningText: {
    flex: 1,
    color: '#78350f',
    fontSize: 12,
    lineHeight: 18,
  },
  emptyBox: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 15,
    padding: 13,
    marginTop: 10,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
  },
  timingCard: {
    backgroundColor: '#eef2ff',
    borderColor: '#c7d2fe',
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    marginTop: 20,
  },
  timingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timingTitle: {
    color: '#1e1b4b',
    fontSize: 14,
    fontWeight: '900',
  },
  suggestionBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  suggestionBadgeText: {
    color: '#4338ca',
    fontSize: 10,
    fontWeight: '900',
  },
  timingText: {
    color: '#3730a3',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 9,
  },
  timingFootnote: {
    color: '#6366f1',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
  uncertaintyCard: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  uncertaintyTitle: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 5,
  },
  uncertaintyText: {
    color: '#64748b',
    fontSize: 11,
    lineHeight: 17,
  },
});
