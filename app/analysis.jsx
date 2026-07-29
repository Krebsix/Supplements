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

import TabBar from '../components/TabBar';

import { analyzeCosts, findSharedGoals } from '../CostAnalyzer';
import { analyzeStack, getStackWarnings } from '../StackAnalyzer';
import { getOutcomeMetric } from '../data/outcomeMetrics';
import { useTranslation } from '../i18n';
import useStore from '../useStore';

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

  const supplements = getActiveSupplements();

  const stack = useMemo(
    () => analyzeStack(supplements, lifeStageId),
    [supplements, lifeStageId]
  );
  const warnings = useMemo(() => getStackWarnings(stack), [stack]);

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

      {/* ── Kosten ──────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>{t('analysis.cost.title')}</Text>

      {costs.items.length === 0 ? (
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

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
        <Text style={styles.backButtonText}>{t('common.backToHome')}</Text>
      </TouchableOpacity>
    </ScrollView>
      <TabBar active="analysis" />
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
            placeholderTextColor="#94a3b8"
          />
          <Text style={styles.fieldLabel}>{t('analysis.price.packageUnits')}</Text>
          <TextInput
            style={styles.input}
            value={units}
            onChangeText={setUnits}
            keyboardType="number-pad"
            placeholder="120"
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity style={styles.primaryButton} onPress={() => save(openId)}>
            <Text style={styles.primaryButtonText}>{t('analysis.price.save')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrap: { flex: 1, backgroundColor: '#f8fafc' },
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 44 },
  kicker: {
    color: '#0f766e', fontSize: 13, fontWeight: '800',
    letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8,
  },
  title: { color: '#0f172a', fontSize: 26, lineHeight: 32, fontWeight: '800' },
  subtitle: { color: '#475569', fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 20 },
  sectionTitle: { color: '#0f172a', fontSize: 16, fontWeight: '800', marginTop: 14, marginBottom: 6 },
  sectionHint: { color: '#64748b', fontSize: 12, lineHeight: 18, marginBottom: 10 },
  card: {
    backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderWidth: 1,
    borderRadius: 18, padding: 16, marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderWidth: 1,
    borderRadius: 18, padding: 16, marginBottom: 12,
  },
  emptyText: { color: '#64748b', fontSize: 13, lineHeight: 20 },
  warnCard: {
    backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1,
    borderRadius: 16, padding: 13, marginBottom: 10,
  },
  warnCardCritical: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  warnText: { color: '#b45309', fontSize: 13, lineHeight: 19, fontWeight: '600' },
  warnTextCritical: { color: '#dc2626' },
  allClear: { color: '#0f766e', fontSize: 13, lineHeight: 19, marginBottom: 10 },
  totalRow: {
    backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderWidth: 1,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 8,
  },
  totalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalName: { color: '#0f172a', fontSize: 14, fontWeight: '700', flex: 1 },
  totalAmount: { color: '#0f172a', fontSize: 14, fontWeight: '800' },
  totalMeta: { color: '#64748b', fontSize: 11, marginTop: 2 },
  unresolvedNote: { color: '#94a3b8', fontSize: 12, marginTop: 4, marginBottom: 6 },
  bigNumber: { color: '#0f172a', fontSize: 22, fontWeight: '800' },
  smallNumber: { color: '#64748b', fontSize: 13, marginTop: 2, marginBottom: 12 },
  costRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 9, marginTop: 9,
  },
  costTextWrap: { flex: 1, paddingRight: 10 },
  costName: { color: '#0f172a', fontSize: 13, fontWeight: '700' },
  costStatus: { color: '#94a3b8', fontSize: 11, marginTop: 1 },
  costValue: { color: '#0f172a', fontSize: 13, fontWeight: '800' },
  footnote: { color: '#94a3b8', fontSize: 11, lineHeight: 17, marginTop: 10 },
  reviewCard: {
    backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1,
    borderRadius: 18, padding: 16, marginBottom: 12,
  },
  reviewText: { color: '#b45309', fontSize: 13, lineHeight: 20, fontWeight: '600' },
  reviewHint: { color: '#64748b', fontSize: 12, lineHeight: 18, marginTop: 8 },
  linkButton: {
    backgroundColor: '#0f766e', borderRadius: 999,
    paddingVertical: 11, alignItems: 'center', marginTop: 12,
  },
  linkButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  sharedGoalItem: { color: '#475569', fontSize: 13, lineHeight: 20 },
  priceTitle: { color: '#0f172a', fontSize: 14, fontWeight: '800' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
  chip: {
    backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', borderWidth: 1,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7,
  },
  chipActive: { backgroundColor: '#0f766e', borderColor: '#0f766e' },
  chipText: { color: '#475569', fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: '#ffffff' },
  priceForm: { marginTop: 14 },
  fieldLabel: {
    color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 0.7,
    textTransform: 'uppercase', marginTop: 10, marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderWidth: 1,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: '#0f172a',
  },
  primaryButton: {
    backgroundColor: '#0f766e', borderRadius: 999,
    paddingVertical: 13, alignItems: 'center', marginTop: 14,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  backButton: {
    backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', borderWidth: 1,
    borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 10,
  },
  backButtonText: { color: '#0f172a', fontSize: 15, fontWeight: '800' },
});
