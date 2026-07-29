import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  CONFOUNDER,
  TRIAL_CONCLUSION,
  TRIAL_STATUS,
  evaluateTrial,
} from '../OutcomeTracker';
import {
  MIN_RATINGS_FOR_COMPARISON,
  OUTCOME_METRICS,
  SCALE_MAX,
  SCALE_MIN,
  TRIAL_DURATIONS,
  getOutcomeMetric,
} from '../data/outcomeMetrics';
import { useTranslation } from '../i18n';
import useStore from '../useStore';
import { colors, radius, space, surfaces, type } from '../theme';

const SCALE_LABEL_KEYS = [
  'outcome.scale.veryLow',
  'outcome.scale.low',
  'outcome.scale.mid',
  'outcome.scale.high',
  'outcome.scale.veryHigh',
];

/**
 * Wirkungskontrolle
 *
 * Die Auswertung stellt bewusst zwei Bloecke nebeneinander: was sich
 * veraendert hat und was dagegen spricht, das der Einnahme zuzuschreiben.
 * Der zweite Block ist der Grund, warum es diesen Screen gibt — ohne ihn
 * waere er ein Bestaetigungsautomat.
 */
export default function OutcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const trials = useStore((state) => state.trials);
  const trialRatings = useStore((state) => state.trialRatings);
  const intakeLogs = useStore((state) => state.intakeLogs);
  const startTrial = useStore((state) => state.startTrial);
  const addTrialRating = useStore((state) => state.addTrialRating);
  const concludeTrialById = useStore((state) => state.concludeTrialById);
  const deleteTrial = useStore((state) => state.deleteTrial);
  const getActiveSupplements = useStore((state) => state.getActiveSupplements);

  const supplements = getActiveSupplements();

  const [draftSupplement, setDraftSupplement] = useState(null);
  const [draftMetric, setDraftMetric] = useState(null);
  const [draftReason, setDraftReason] = useState('');
  const [draftBaseline, setDraftBaseline] = useState(null);
  const [draftDuration, setDraftDuration] = useState(28);

  const running = trials.filter((trial) => trial.status === TRIAL_STATUS.RUNNING);
  const finished = trials.filter((trial) => trial.status !== TRIAL_STATUS.RUNNING);

  const todayKey = new Date().toISOString().slice(0, 10);

  const evaluations = useMemo(() => {
    const map = {};
    for (const trial of trials) {
      map[trial.id] = evaluateTrial(trial, trialRatings, {
        intakeLogs,
        allTrials: trials,
      });
    }
    return map;
  }, [trials, trialRatings, intakeLogs]);

  function handleStart() {
    if (!draftSupplement || !draftMetric || draftBaseline === null) {
      Alert.alert(t('outcome.new.missingFields'));
      return;
    }

    startTrial({
      userSupplementId: draftSupplement.id,
      supplementName: draftSupplement.name,
      metricId: draftMetric,
      reason: draftReason,
      baselineValue: draftBaseline,
      durationDays: draftDuration,
    });

    setDraftSupplement(null);
    setDraftMetric(null);
    setDraftReason('');
    setDraftBaseline(null);
  }

  function confirmDelete(trialId) {
    Alert.alert(
      t('outcome.deleteConfirm.title'),
      t('outcome.deleteConfirm.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => deleteTrial(trialId) },
      ]
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{t('outcome.kicker')}</Text>
      <Text style={styles.title}>{t('outcome.title')}</Text>
      <Text style={styles.subtitle}>{t('outcome.subtitle')}</Text>

      <Text style={styles.sectionTitle}>{t('outcome.running.title')}</Text>

      {running.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('outcome.running.empty')}</Text>
        </View>
      ) : (
        running.map((trial) => (
          <TrialCard
            key={trial.id}
            trial={trial}
            evaluation={evaluations[trial.id]}
            hasRatedToday={trialRatings.some(
              (rating) => rating.trialId === trial.id && rating.dateKey === todayKey
            )}
            onRate={(value) => addTrialRating(trial.id, value)}
            onConclude={(conclusion) => concludeTrialById(trial.id, conclusion)}
            onDelete={() => confirmDelete(trial.id)}
            t={t}
          />
        ))
      )}

      <Text style={styles.sectionTitle}>{t('outcome.new.title')}</Text>

      {supplements.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('outcome.new.noSupplements')}</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>{t('outcome.new.selectSupplement')}</Text>
          <View style={styles.chipWrap}>
            {supplements.map((supplement) => (
              <TouchableOpacity
                key={supplement.id}
                style={[styles.chip, draftSupplement?.id === supplement.id && styles.chipActive]}
                onPress={() => setDraftSupplement(supplement)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, draftSupplement?.id === supplement.id && styles.chipTextActive]}>
                  {supplement.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>{t('outcome.new.selectMetric')}</Text>
          <View style={styles.chipWrap}>
            {OUTCOME_METRICS.map((metric) => (
              <TouchableOpacity
                key={metric.id}
                style={[styles.chip, draftMetric === metric.id && styles.chipActive]}
                onPress={() => setDraftMetric(metric.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, draftMetric === metric.id && styles.chipTextActive]}>
                  {t(metric.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>{t('outcome.new.reason')}</Text>
          <TextInput
            style={styles.input}
            value={draftReason}
            onChangeText={setDraftReason}
            placeholder={t('outcome.new.reasonPlaceholder')}
            placeholderTextColor={colors.inkFaint}
          />

          <Text style={styles.fieldLabel}>{t('outcome.new.baseline')}</Text>
          <ScalePicker
            value={draftBaseline}
            onChange={setDraftBaseline}
            metricId={draftMetric}
            t={t}
          />
          <Text style={styles.fieldHint}>{t('outcome.new.baselineHint')}</Text>

          <Text style={styles.fieldLabel}>{t('outcome.new.duration')}</Text>
          <View style={styles.chipWrap}>
            {TRIAL_DURATIONS.map((days) => (
              <TouchableOpacity
                key={days}
                style={[styles.chip, draftDuration === days && styles.chipActive]}
                onPress={() => setDraftDuration(days)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, draftDuration === days && styles.chipTextActive]}>
                  {t('outcome.new.durationDays', { days })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
            <Text style={styles.primaryButtonText}>{t('outcome.new.start')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {finished.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>{t('outcome.finished.title')}</Text>
          {finished.map((trial) => (
            <View key={trial.id} style={styles.finishedCard}>
              <Text style={styles.finishedName}>{trial.supplementName}</Text>
              <Text style={styles.finishedMeta}>
                {t(getOutcomeMetric(trial.metricId)?.labelKey ?? '')} ·{' '}
                {t(`outcome.finished.${trial.conclusion ?? 'unclear'}`)}
              </Text>
              <Text style={styles.deleteLink} onPress={() => confirmDelete(trial.id)}>
                {t('outcome.delete')}
              </Text>
            </View>
          ))}
        </>
      ) : null}

      <Text style={styles.disclaimer}>{t('outcome.disclaimer')}</Text>

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
        <Text style={styles.backButtonText}>{t('common.backToHome')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ScalePicker({ value, onChange, metricId, t }) {
  const metric = getOutcomeMetric(metricId);
  const hintKey = metric?.direction === 'lower-better'
    ? 'outcome.scale.hintLowerBetter'
    : 'outcome.scale.hintHigherBetter';

  const steps = [];
  for (let i = SCALE_MIN; i <= SCALE_MAX; i += 1) steps.push(i);

  return (
    <View>
      <View style={styles.scaleRow}>
        {steps.map((step) => (
          <TouchableOpacity
            key={step}
            style={[styles.scaleButton, value === step && styles.scaleButtonActive]}
            onPress={() => onChange(step)}
            activeOpacity={0.8}
            accessibilityRole="radio"
            accessibilityState={{ selected: value === step }}
            accessibilityLabel={t(SCALE_LABEL_KEYS[step - 1])}
          >
            <Text style={[styles.scaleNumber, value === step && styles.scaleNumberActive]}>
              {step}
            </Text>
            {/* Ziffern in Serife: die Skala ist zentrales Bedienelement,
                das soll sich abheben. */}
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.scaleHint}>{t(hintKey)}</Text>
    </View>
  );
}

function TrialCard({ trial, evaluation, hasRatedToday, onRate, onConclude, onDelete, t }) {
  const metric = getOutcomeMetric(trial.metricId);
  if (!evaluation) return null;

  return (
    <View style={[styles.card, evaluation.isDue && styles.cardDue]}>
      <View style={styles.trialHead}>
        <Text style={styles.trialName}>{trial.supplementName}</Text>
        {evaluation.isDue ? (
          <Text style={styles.dueBadge}>{t('outcome.dueBadge')}</Text>
        ) : null}
      </View>
      <Text style={styles.trialMetric}>{t(metric?.labelKey ?? '')}</Text>
      {trial.reason ? <Text style={styles.trialReason}>{trial.reason}</Text> : null}

      <Text style={styles.trialProgress}>
        {t('outcome.running.day', {
          current: Math.min(evaluation.elapsedDays + 1, trial.durationDays),
          total: trial.durationDays,
        })}
      </Text>

      <View style={styles.metaRow}>
        {evaluation.baseline !== null ? (
          <Text style={styles.metaItem}>
            {t('outcome.baselineWas', { value: evaluation.baseline })}
          </Text>
        ) : null}
        {evaluation.recentAverage !== null ? (
          <Text style={styles.metaItem}>
            {t('outcome.currentAverage', { value: evaluation.recentAverage })}
          </Text>
        ) : null}
        <Text style={styles.metaItem}>
          {t(evaluation.ratingCount === 1 ? 'outcome.ratingCount_one' : 'outcome.ratingCount_other', {
            count: evaluation.ratingCount,
          })}
        </Text>
      </View>

      {evaluation.adherence ? (
        <Text style={styles.metaItem}>
          {t('outcome.adherence', {
            days: evaluation.adherence.loggedDays,
            total: evaluation.adherence.elapsedDays,
            percent: evaluation.adherence.percent,
          })}
        </Text>
      ) : null}

      {/* Tagesbewertung */}
      <Text style={styles.fieldLabel}>
        {hasRatedToday ? t('outcome.running.rated') : t('outcome.running.rateToday')}
      </Text>
      <ScalePicker value={null} onChange={onRate} metricId={trial.metricId} t={t} />

      {/* Ergebnis */}
      <View style={styles.resultBlock}>
        <Text style={styles.blockTitle}>{t('outcome.result.title')}</Text>
        {evaluation.showComparison ? (
          <Text style={styles.resultText}>
            {t(`outcome.result.${evaluation.directionLabel}`, {
              change: Math.abs(evaluation.change),
            })}
          </Text>
        ) : (
          <Text style={styles.resultText}>
            {t('outcome.result.tooEarly', { needed: MIN_RATINGS_FOR_COMPARISON })}
          </Text>
        )}
      </View>

      {/* Stoerfaktoren — der eigentliche Zweck des Screens */}
      <View style={styles.confounderBlock}>
        <Text style={styles.blockTitle}>{t('outcome.confounders.title')}</Text>
        {evaluation.confounders.length === 0 ? (
          <Text style={styles.confounderText}>{t('outcome.confounders.none')}</Text>
        ) : (
          <>
            <Text style={styles.confounderIntro}>{t('outcome.confounders.intro')}</Text>
            {evaluation.confounders.map((confounder, index) => (
              <Text key={`${confounder.type}-${index}`} style={styles.confounderItem}>
                • {describeConfounder(confounder, t)}
              </Text>
            ))}
          </>
        )}
      </View>

      {evaluation.isDue ? (
        <View style={styles.dueBlock}>
          <Text style={styles.blockTitle}>{t('outcome.due.title')}</Text>
          <Text style={styles.confounderText}>{t('outcome.due.text')}</Text>
          <View style={styles.dueButtons}>
            <TouchableOpacity
              style={styles.dueButton}
              onPress={() => onConclude(TRIAL_CONCLUSION.CONTINUE)}
            >
              <Text style={styles.dueButtonText}>{t('outcome.due.continue')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dueButton}
              onPress={() => onConclude(TRIAL_CONCLUSION.STOP)}
            >
              <Text style={styles.dueButtonText}>{t('outcome.due.stop')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dueButton}
              onPress={() => onConclude(TRIAL_CONCLUSION.UNCLEAR)}
            >
              <Text style={styles.dueButtonText}>{t('outcome.due.unclear')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <Text style={styles.deleteLink} onPress={onDelete}>
        {t('outcome.delete')}
      </Text>
    </View>
  );
}

function describeConfounder(confounder, t) {
  switch (confounder.type) {
    case CONFOUNDER.PARALLEL_TRIALS:
      return t(
        confounder.count === 1
          ? 'outcome.confounder.parallelTrials_one'
          : 'outcome.confounder.parallelTrials_other',
        { count: confounder.count, names: confounder.names.join(', ') }
      );
    case CONFOUNDER.SHORT_DURATION:
      return t('outcome.confounder.shortDuration', { days: confounder.days });
    case CONFOUNDER.FEW_RATINGS:
      return t('outcome.confounder.fewRatings', {
        count: confounder.count,
        needed: confounder.needed,
      });
    case CONFOUNDER.LOW_ADHERENCE:
      return t('outcome.confounder.lowAdherence', { percent: confounder.percent });
    case CONFOUNDER.NO_BASELINE:
      return t('outcome.confounder.noBaseline');
    case CONFOUNDER.SMALL_CHANGE:
      return t('outcome.confounder.smallChange');
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  screen: { ...surfaces.screen },
  content: { ...surfaces.content },
  kicker: { ...type.eyebrow, marginBottom: space.sm },
  title: { ...type.display },
  subtitle: { ...type.body, marginTop: space.md, marginBottom: space.xl },
  sectionTitle: { ...type.heading, marginBottom: space.md, marginTop: space.sm },
  card: { ...surfaces.card, marginBottom: space.lg - 2 },
  cardDue: { borderColor: colors.caution, backgroundColor: colors.cautionSoft },
  emptyCard: { ...surfaces.card, marginBottom: space.lg - 2 },
  emptyText: { ...type.small, lineHeight: 20 },
  trialHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trialName: { ...type.bodyStrong, fontSize: 16, flex: 1 },
  dueBadge: { color: colors.caution, fontSize: 11, fontWeight: '900' },
  trialMetric: { color: colors.accent, fontSize: 13, fontWeight: '700', marginTop: 2 },
  trialReason: { color: colors.inkMuted, fontSize: 13, lineHeight: 19, marginTop: space.xs, fontStyle: 'italic' },
  trialProgress: { color: colors.inkMuted, fontSize: 12, fontWeight: '700', marginTop: space.sm },
  metaRow: { marginTop: space.xs + 2 },
  metaItem: { ...type.small, lineHeight: 18 },
  fieldLabel: { ...type.label, marginTop: space.lg - 2, marginBottom: space.sm - 1 },
  fieldHint: { ...type.small, lineHeight: 18, marginTop: space.sm },
  input: { ...surfaces.input },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm - 1 },
  chip: { ...surfaces.chip, paddingHorizontal: space.md, paddingVertical: space.sm - 1 },
  chipActive: { ...surfaces.chipActive },
  chipText: { ...surfaces.chipText },
  chipTextActive: { ...surfaces.chipTextActive },
  scaleRow: { flexDirection: 'row', gap: space.sm },
  scaleButton: {
    flex: 1,
    backgroundColor: colors.surfaceSunken,
    borderColor: colors.rule,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 11,
    alignItems: 'center',
  },
  scaleButtonActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  // Ziffern in Serife statt Systemschrift: die Skala ist die zentrale
  // Bedienhandlung des Screens, das wertet sie sichtbar auf.
  scaleNumber: { ...type.numeral, fontSize: 15 },
  scaleNumberActive: { color: colors.surface },
  scaleHint: { color: colors.inkFaint, fontSize: 11, marginTop: space.sm },
  primaryButton: { ...surfaces.buttonPrimary, marginTop: space.xl - 4 },
  primaryButtonText: { ...surfaces.buttonPrimaryText },
  blockTitle: { color: colors.ink, fontSize: 13, fontWeight: '800', marginBottom: 5 },
  resultBlock: {
    marginTop: space.lg, borderTopWidth: 1, borderTopColor: colors.rule, paddingTop: space.md,
  },
  resultText: { color: colors.inkMuted, fontSize: 13, lineHeight: 20 },
  confounderBlock: {
    marginTop: space.lg - 2, backgroundColor: colors.surfaceSunken, borderColor: colors.rule,
    borderWidth: 1, borderRadius: radius.lg, padding: space.md,
  },
  confounderIntro: { ...type.small, lineHeight: 18, marginBottom: space.sm - 2 },
  confounderText: { ...type.small, lineHeight: 18 },
  confounderItem: { color: colors.inkMuted, fontSize: 12, lineHeight: 19, marginTop: space.xs },
  dueBlock: {
    marginTop: space.lg - 2, backgroundColor: colors.surface, borderColor: colors.caution,
    borderWidth: 1, borderRadius: radius.lg, padding: space.md,
  },
  dueButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm - 1, marginTop: space.sm + 2 },
  dueButton: {
    backgroundColor: colors.surfaceSunken, borderColor: colors.rule, borderWidth: 1,
    borderRadius: radius.md, paddingHorizontal: 13, paddingVertical: space.sm,
  },
  dueButtonText: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  finishedCard: { ...surfaces.card, padding: space.md, marginBottom: space.sm + 2 },
  finishedName: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  finishedMeta: { color: colors.inkMuted, fontSize: 12, marginTop: 3 },
  deleteLink: { color: colors.alert, fontSize: 12, fontWeight: '700', marginTop: space.md },
  disclaimer: { ...type.tiny, lineHeight: 18, marginTop: space.lg - 2, marginBottom: space.lg },
  backButton: { ...surfaces.buttonQuiet },
  backButtonText: { ...surfaces.buttonQuietText, fontSize: 15 },
});
