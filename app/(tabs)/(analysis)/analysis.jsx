import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';


import { colors, radius, space, surfaces, toneFor, type } from '../../../theme';

import { analyzeCosts, findSharedGoals } from '../../../CostAnalyzer';
import { canUseProFeature } from '../../../Entitlements';
import { findPairInteractions } from '../../../InteractionCheck';
import ProGate from '../../../components/ProGate';
import { analyzeStack, getStackWarnings } from '../../../StackAnalyzer';
import { getOutcomeMetric } from '../../../data/outcomeMetrics';
import { useTranslation } from '../../../i18n';
import useStore from '../../../useStore';

/**
 * Analyse
 *
 * Bringt drei Sichten zusammen, die einzeln wenig aussagen:
 *   - was ueber ALLE Produkte zusammen pro Tag zusammenkommt
 *   - was das kostet
 *   - was davon je ueberprueft wurde
 *
 * Die dritte Frage ist die unbequeme und deshalb die wichtigste.
 */
export default function AnalysisScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const lifeStageId = useStore((state) => state.activeLifeStageId);
  const intakeLogs = useStore((state) => state.intakeLogs);
  const trials = useStore((state) => state.trials);
  const stockBySupplementId = useStore((state) => state.stockBySupplementId);
  const setStock = useStore((state) => state.setStock);
  const getActiveSupplements = useStore((state) => state.getActiveSupplements);
  const entitlement = useStore((state) => state.entitlement);

  const supplements = getActiveSupplements();

  const stack = useMemo(
    () => analyzeStack(supplements, lifeStageId),
    [supplements, lifeStageId]
  );
  const warnings = useMemo(() => getStackWarnings(stack), [stack]);

  // Paar-Wechselwirkungen ueber die Substanzen des aktiven Bestands
  // (InteractionCheck.js): Aufnahme-Hemmung und Synergien, quellenbelegt.
  const interactions = useMemo(
    () =>
      findPairInteractions(
        (stack?.totals ?? []).map((entry) => entry.substanceId)
      ),
    [stack]
  );

  const costs = useMemo(
    () => analyzeCosts(supplements, stockBySupplementId, { intakeLogs, trials }),
    [supplements, stockBySupplementId, intakeLogs, trials]
  );

  const sharedGoals = useMemo(() => findSharedGoals(trials), [trials]);

  const criticalTotals = stack.totals.filter(
    (entry) => entry.referenceCheck?.status === 'above_limit'
  );

  return (
    <View style={styles.screenWrap}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{t('analysis.kicker')}</Text>
      <Text style={styles.title}>{t('analysis.title')}</Text>
      <Text style={styles.subtitle}>{t('analysis.subtitle')}</Text>

      {/* ── Tagessummen ─────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>{t('analysis.totals.title')}</Text>
      <Text style={styles.sectionHint}>{t('analysis.totals.subtitle')}</Text>

      {stack.totals.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('analysis.totals.empty')}</Text>
        </View>
      ) : (
        <>
          {warnings
            .filter((warning) => warning.level !== 'info')
            .map((warning) => (
              <View
                key={warning.substanceId}
                style={[styles.warnCard, warning.level === 'critical' && styles.warnCardCritical]}
              >
                <Text
                  style={[
                    styles.warnText,
                    warning.level === 'critical' && styles.warnTextCritical,
                  ]}
                >
                  {warning.text}
                </Text>
              </View>
            ))}

          {criticalTotals.length === 0 ? (
            <Text style={styles.allClear}>{t('analysis.totals.allClear')}</Text>
          ) : null}

          {stack.totals.map((entry) => (
            <View key={entry.substanceId} style={styles.totalRow}>
              <View style={styles.totalHead}>
                <Text style={styles.totalName}>{entry.name}</Text>
                <Text style={styles.totalAmount}>
                  {entry.totalMin === entry.totalMax
                    ? `${entry.totalMax} ${entry.unit}`
                    : `${entry.totalMin}–${entry.totalMax} ${entry.unit}`}
                </Text>
              </View>
              <Text style={styles.totalMeta}>
                {t(
                  entry.sources.length === 1
                    ? 'analysis.totals.fromProducts_one'
                    : 'analysis.totals.fromProducts_other',
                  { count: entry.sources.length }
                )}
                {entry.hasConvertedAmounts ? ` · ${t('analysis.totals.converted')}` : ''}
              </Text>
            </View>
          ))}

          {stack.unresolved.length > 0 ? (
            <Text style={styles.unresolvedNote}>
              {t(
                stack.unresolved.length === 1
                  ? 'analysis.totals.unresolved_one'
                  : 'analysis.totals.unresolved_other',
                { count: stack.unresolved.length }
              )}
            </Text>
          ) : null}
        </>
      )}

      {/* ── Wechselwirkungen im Bestand ─────────────────────── */}
      {interactions.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>
            {t('analysis.interactions.title')}
          </Text>
          {interactions.map((rule) => {
            const tone = toneFor(rule.severity === 'synergy' ? 'affirm' : rule.severity);
            return (
              <View
                key={`${rule.a}-${rule.b}`}
                style={[
                  styles.interactionCard,
                  { backgroundColor: tone.surface, borderColor: tone.rule },
                ]}
              >
                <Text style={[styles.interactionTitle, { color: tone.ink }]}>
                  {rule.aName} + {rule.bName}
                </Text>
                <Text style={[styles.interactionText, { color: tone.ink }]}>
                  {rule.note}
                </Text>
                {rule.sources?.[0]?.label ? (
                  <Text style={styles.interactionSource}>
                    {rule.sources[0].label}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </>
      ) : null}

      {/* ── Kosten ──────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>{t('analysis.cost.title')}</Text>

      {/* Kostenanalyse ist Pro (Entitlements.js); die Stack-Analyse
          darueber bleibt in jedem Tier frei. */}
      {!canUseProFeature(entitlement).allowed ? (
        <ProGate />
      ) : costs.items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('analysis.cost.empty')}</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.bigNumber}>
            {t('analysis.cost.perMonth', {
              amount: costs.totalPerMonth,
              currency: costs.currency,
            })}
          </Text>
          <Text style={styles.smallNumber}>
            {t('analysis.cost.perDay', {
              amount: costs.totalPerDay,
              currency: costs.currency,
            })}
          </Text>

          {costs.items.map((item) => (
            <View key={item.supplementId} style={styles.costRow}>
              <View style={styles.costTextWrap}>
                <Text style={styles.costName}>{item.supplementName}</Text>
                <Text style={styles.costStatus}>
                  {t(`analysis.status.${toStatusKey(item.reviewStatus)}`)}
                  {item.isEstimated ? ` · ${t('analysis.cost.isEstimate')}` : ''}
                </Text>
              </View>
              <Text style={styles.costValue}>
                {item.costPerMonth} {item.currency}
              </Text>
            </View>
          ))}

          {costs.estimatedCount > 0 ? (
            <Text style={styles.footnote}>
              {t(
                costs.estimatedCount === 1
                  ? 'analysis.cost.estimated_one'
                  : 'analysis.cost.estimated_other',
                { count: costs.estimatedCount }
              )}
            </Text>
          ) : null}
        </View>
      )}

      {costs.withoutPrice.length > 0 ? (
        <PriceEditor
          entries={costs.withoutPrice}
          onSave={(supplementId, purchasePrice, packageUnits) =>
            setStock(supplementId, {
              ...(stockBySupplementId[supplementId] ?? {}),
              purchasePrice,
              packageUnits,
              currency: 'EUR',
            })
          }
          t={t}
        />
      ) : null}

      {/* ── Nie ueberprueft ─────────────────────────────────── */}
      {costs.items.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>{t('analysis.unreviewed.title')}</Text>
          {costs.neverReviewed.count === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t('analysis.unreviewed.allReviewed')}</Text>
            </View>
          ) : (
            <View style={styles.reviewCard}>
              <Text style={styles.reviewText}>
                {t(
                  costs.neverReviewed.count === 1
                    ? 'analysis.unreviewed.text_one'
                    : 'analysis.unreviewed.text_other',
                  {
                    count: costs.neverReviewed.count,
                    amount: costs.neverReviewed.perMonth,
                    currency: costs.currency,
                    names: costs.neverReviewed.names.join(', '),
                  }
                )}
              </Text>
              <Text style={styles.reviewHint}>{t('analysis.unreviewed.hint')}</Text>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => router.push('/outcome')}
                accessibilityRole="link"
              >
                <Text style={styles.linkButtonText}>{t('analysis.unreviewed.goToOutcome')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : null}

      {/* ── Gleiches Ziel ───────────────────────────────────── */}
      {sharedGoals.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>{t('analysis.sharedGoals.title')}</Text>
          <View style={styles.card}>
            {sharedGoals.map((goal) => (
              <Text key={goal.metricId} style={styles.sharedGoalItem}>
                {t('analysis.sharedGoals.entry', {
                  metric: t(getOutcomeMetric(goal.metricId)?.labelKey ?? goal.metricId),
                  names: goal.names.join(', '),
                })}
              </Text>
            ))}
            <Text style={styles.footnote}>{t('analysis.sharedGoals.hint')}</Text>
          </View>
        </>
      ) : null}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/menu')}
        accessibilityRole="link"
      >
        <Text style={styles.backButtonText}>{t('common.backToHome')}</Text>
      </TouchableOpacity>
    </ScrollView>
    </View>
  );
}

function toStatusKey(status) {
  switch (status) {
    case 'reviewed-continue': return 'reviewedContinue';
    case 'reviewed-stop': return 'reviewedStop';
    case 'reviewed-unclear': return 'reviewedUnclear';
    case 'running': return 'running';
    default: return 'neverReviewed';
  }
}

function PriceEditor({ entries, onSave, t }) {
  const [openId, setOpenId] = useState(null);
  const [price, setPrice] = useState('');
  const [units, setUnits] = useState('');

  function save(supplementId) {
    const parsedPrice = Number(String(price).replace(',', '.'));
    const parsedUnits = Number(units);
    if (!Number.isFinite(parsedPrice) || !Number.isFinite(parsedUnits)) return;

    onSave(supplementId, parsedPrice, parsedUnits);
    setOpenId(null);
    setPrice('');
    setUnits('');
  }

  return (
    <View style={styles.card}>
      <Text style={styles.priceTitle}>{t('analysis.price.title')}</Text>
      <Text style={styles.footnote}>
        {t(
          entries.length === 1
            ? 'analysis.cost.withoutPrice_one'
            : 'analysis.cost.withoutPrice_other',
          {
            count: entries.length,
            names: entries.map((entry) => entry.supplementName).join(', '),
          }
        )}
      </Text>

      <View style={styles.chipWrap}>
        {entries.map((entry) => (
          <TouchableOpacity
            key={entry.supplementId}
            style={[styles.chip, openId === entry.supplementId && styles.chipActive]}
            onPress={() => setOpenId(entry.supplementId)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: openId === entry.supplementId }}
          >
            <Text
              style={[styles.chipText, openId === entry.supplementId && styles.chipTextActive]}
            >
              {entry.supplementName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {openId ? (
        <View style={styles.priceForm}>
          <Text style={styles.fieldLabel}>{t('analysis.price.purchasePrice')}</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholder="19,90"
            placeholderTextColor={colors.inkFaint}
            accessibilityLabel={t('analysis.price.purchasePrice')}
          />
          <Text style={styles.fieldLabel}>{t('analysis.price.packageUnits')}</Text>
          <TextInput
            style={styles.input}
            value={units}
            onChangeText={setUnits}
            keyboardType="number-pad"
            placeholder="120"
            placeholderTextColor={colors.inkFaint}
            accessibilityLabel={t('analysis.price.packageUnits')}
          />
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => save(openId)}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>{t('analysis.price.save')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrap: { ...surfaces.screen },
  screen: { ...surfaces.screen },
  content: { ...surfaces.content },
  kicker: {
    ...type.eyebrow,
    marginBottom: space.sm,
  },
  title: { ...type.display },
  subtitle: { ...type.body, marginTop: space.md, marginBottom: space.xl },
  sectionTitle: { ...type.heading, marginTop: space.lg, marginBottom: space.sm },
  interactionCard: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.sm,
  },
  interactionTitle: {
    ...type.subheading,
  },
  interactionText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: space.xs,
  },
  interactionSource: {
    ...type.tiny,
    marginTop: space.sm - 2,
  },
  sectionHint: { ...type.small, marginBottom: space.md },
  card: { ...surfaces.card },
  emptyCard: { ...surfaces.card },
  emptyText: { ...type.body },
  // Warnungen aus dem Stack-Abgleich: 'notice' ist der Normalfall,
  // 'critical' (StackAnalyzer-Level) wird darueber gelegt.
  warnCard: {
    backgroundColor: toneFor('notice').surface,
    borderColor: toneFor('notice').rule,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.sm,
  },
  warnCardCritical: {
    backgroundColor: toneFor('critical').surface,
    borderColor: toneFor('critical').rule,
  },
  warnText: {
    ...type.body,
    color: toneFor('notice').ink,
    fontWeight: '600',
  },
  warnTextCritical: { color: toneFor('critical').ink },
  allClear: {
    color: toneFor('ok').ink,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: space.sm,
  },
  totalRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    marginBottom: space.sm,
  },
  totalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalName: { ...type.bodyStrong, fontSize: 14, flex: 1 },
  totalAmount: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  totalMeta: { ...type.small, fontSize: 11, marginTop: space.xs },
  unresolvedNote: { ...type.tiny, fontSize: 12, marginTop: space.xs, marginBottom: space.sm },
  bigNumber: { ...type.numeral },
  smallNumber: { ...type.small, marginTop: space.xs, marginBottom: space.md },
  costRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: colors.rule, paddingTop: space.sm, marginTop: space.sm,
  },
  costTextWrap: { flex: 1, paddingRight: space.md },
  costName: { ...type.bodyStrong, fontSize: 13 },
  costStatus: { ...type.tiny, marginTop: 1 },
  costValue: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  footnote: { ...type.tiny, lineHeight: 17, marginTop: space.md },
  // Nie ueberprueft: ein Hinweis zum Nachschauen, kein Alarm.
  reviewCard: {
    backgroundColor: toneFor('notice').surface,
    borderColor: toneFor('notice').rule,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
  },
  reviewText: {
    ...type.body,
    color: toneFor('notice').ink,
    fontWeight: '600',
  },
  reviewHint: { marginTop: space.sm, ...type.small },
  linkButton: {
    ...surfaces.buttonPrimary,
    paddingVertical: space.md,
    marginTop: space.md,
  },
  linkButtonText: { ...surfaces.buttonPrimaryText, fontSize: 13 },
  sharedGoalItem: { ...type.body, lineHeight: 20 },
  priceTitle: { ...type.subheading },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  chip: { ...surfaces.chip },
  chipActive: { ...surfaces.chipActive },
  chipText: { ...surfaces.chipText },
  chipTextActive: { ...surfaces.chipTextActive },
  priceForm: { marginTop: space.lg },
  fieldLabel: {
    ...type.label,
    marginTop: space.md,
    marginBottom: space.sm,
  },
  input: { ...surfaces.input },
  primaryButton: {
    ...surfaces.buttonPrimary,
    paddingVertical: space.md,
    marginTop: space.lg,
  },
  primaryButtonText: { ...surfaces.buttonPrimaryText },
  backButton: {
    ...surfaces.buttonQuiet,
    marginTop: space.md,
  },
  backButtonText: { ...surfaces.buttonQuietText, fontSize: 15 },
});
