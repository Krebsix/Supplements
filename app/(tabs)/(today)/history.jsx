import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import StatusBadge from '../../../components/StatusBadge';
import { calculateOverallAdherence } from '../../../OutcomeTracker';
import { getSlotLabel } from '../../../TimingEngine';
import useStore from '../../../useStore';
import { formatSupplementDosage, formatSupplementName } from '../../../utils/supplementFormatting';
import { useTranslation } from '../../../i18n';
import { colors, radius, space, surfaces, toneFor, type } from '../../../theme';

const EMPTY_LOGS = [];
const EMPTY_SUPPLEMENTS = [];
const cautionTone = toneFor('caution');

// Zeitraeume fuer die Einnahme-Treue-Kennzahl. "all" hat keine feste
// Fensterbreite, die Tage werden ab dem ersten Log gezaehlt
// (daysSinceFirstLog).
const PERIODS = { week: 7, month: 30, all: null };

function toDateKey(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(value.getTime())) {
    const fallback = new Date();
    return [
      fallback.getFullYear(),
      String(fallback.getMonth() + 1).padStart(2, '0'),
      String(fallback.getDate()).padStart(2, '0'),
    ].join('-');
  }

  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, '0'),
    String(value.getDate()).padStart(2, '0'),
  ].join('-');
}

function getLogDateKey(log) {
  if (!log?.takenAt) return 'unknown';

  const date = new Date(log.takenAt);
  if (Number.isNaN(date.getTime())) return 'unknown';

  return toDateKey(date);
}

function formatHistoryGroupTitle(dateKey, t) {
  if (dateKey === 'unknown') return t('history.group.noDate');

  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return t('history.group.noDate');

  const todayKey = toDateKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toDateKey(yesterday);

  if (dateKey === todayKey) return t('history.group.today');
  if (dateKey === yesterdayKey) return t('history.group.yesterday');

  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatHistoryTime(value, t) {
  if (!value) return t('history.time.missing');

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t('history.time.unreadable');

  return t('history.time.withSuffix', {
    time: date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  });
}

function formatHistoryDate(value, t) {
  if (!value) return t('history.time.missing');

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t('history.time.unreadable');

  const entryKey = toDateKey(date);
  const dayLabel = formatHistoryGroupTitle(entryKey, t);

  return `${dayLabel} · ${formatHistoryTime(value, t)}`;
}

function formatLogDosage(log, supplement, t) {
  const logDosage = [log.amount, log.unit].filter(Boolean).join(' ').trim();

  if (logDosage) {
    return logDosage;
  }

  return formatSupplementDosage(supplement, t('history.dosage.missing'));
}

function getSourceLabel(source, t) {
  if (source === 'dashboard') return t('history.source.dashboard');
  if (source === 'scan') return t('history.source.scan');
  if (source === 'manual') return t('history.source.manual');
  if (source === 'legacy') return t('history.source.legacy');
  return t('history.source.default');
}

function getTimingLabel(slotId) {
  if (!slotId) return null;
  return getSlotLabel(slotId);
}

function groupLogsByDate(logs) {
  return logs.reduce((groups, log) => {
    const dateKey = getLogDateKey(log);
    const existingGroup = groups.find((group) => group.dateKey === dateKey);

    if (existingGroup) {
      existingGroup.logs.push(log);
      return groups;
    }

    return [...groups, { dateKey, logs: [log] }];
  }, []);
}

function daysSinceFirstLog(logs) {
  if (!logs.length) return 1;

  const firstKey = logs.reduce(
    (min, log) => (log.dateKey && log.dateKey < min ? log.dateKey : min),
    logs[0].dateKey || toDateKey()
  );
  const first = new Date(`${firstKey}T00:00:00`);
  if (Number.isNaN(first.getTime())) return 1;

  const diff = Math.floor((Date.now() - first.getTime()) / 86400000) + 1;
  return Math.max(1, diff);
}

function resolveSupplement(log, supplements) {
  return supplements.find((supplement) => (
    supplement.id === log.userSupplementId ||
    supplement.libraryId === log.libraryId ||
    supplement.id === log.libraryId
  ));
}

export default function HistoryScreen() {
  const { t } = useTranslation();
  const intakeLogs = useStore((state) => state.intakeLogs) ?? EMPTY_LOGS;
  const userSupplements = useStore((state) => state.userSupplements) ?? EMPTY_SUPPLEMENTS;
  const librarySupplements = useStore((state) => state.librarySupplements) ?? EMPTY_SUPPLEMENTS;
  const [period, setPeriod] = useState('week');

  const supplements = [...userSupplements, ...librarySupplements];

  const periodDays = PERIODS[period] ?? daysSinceFirstLog(intakeLogs);
  const adherence = calculateOverallAdherence(intakeLogs, periodDays || 1, new Date());

  const last7Days = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      const key = toDateKey(day);
      const count = intakeLogs.filter((log) => log.dateKey === key && !log.undoneAt).length;
      days.push({ key, count, isToday: i === 0 });
    }

    return days;
  }, [intakeLogs]);
  const sortedLogs = [...intakeLogs].sort((a, b) => {
    const aTime = new Date(a.takenAt || 0).getTime();
    const bTime = new Date(b.takenAt || 0).getTime();

    return bTime - aTime;
  });

  const activeLogs = sortedLogs.filter((log) => !log.undoneAt);
  const undoneLogs = sortedLogs.filter((log) => log.undoneAt);
  const historyGroups = groupLogsByDate(sortedLogs);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{t('history.kicker')}</Text>
      <Text style={styles.title}>{t('history.title')}</Text>
      <Text style={styles.subtitle}>
        {t('history.subtitle')}
      </Text>

      <View style={styles.chips}>
        {Object.keys(PERIODS).map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.chip, period === key && styles.chipActive]}
            onPress={() => setPeriod(key)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: period === key }}
          >
            <Text style={[styles.chipText, period === key && styles.chipTextActive]}>
              {t(`history.period.${key}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.adherenceCard}>
        <Text style={styles.adherenceLabel}>{t('history.adherence.label')}</Text>
        <Text style={styles.adherenceValue}>
          {t('history.adherence.percent', { percent: adherence.percent })}
        </Text>

        <View style={styles.barsRow}>
          {last7Days.map((day) => (
            <View key={day.key} style={styles.barColumn}>
              <View
                style={[
                  styles.bar,
                  { height: Math.max(4, Math.min(64, day.count * 20)) },
                  day.isToday ? styles.barToday : day.count === 0 ? styles.barEmpty : null,
                ]}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{activeLogs.length}</Text>
          <Text style={styles.summaryLabel}>{t('history.summary.active')}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{undoneLogs.length}</Text>
          <Text style={styles.summaryLabel}>{t('history.summary.undone')}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{sortedLogs.length}</Text>
          <Text style={styles.summaryLabel}>{t('history.summary.total')}</Text>
        </View>
      </View>

      {sortedLogs.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t('history.empty.title')}</Text>
          <Text style={styles.emptyText}>
            {t('history.empty.text')}
          </Text>
        </View>
      ) : (
        historyGroups.map((group) => (
          <View key={group.dateKey} style={styles.group}>
            <Text style={styles.groupTitle}>{formatHistoryGroupTitle(group.dateKey, t)}</Text>

            {group.logs.map((log) => {
              const supplement = resolveSupplement(log, supplements);
              const supplementName = formatSupplementName(supplement, t('history.supplement.unknown'));
              const dosage = formatLogDosage(log, supplement, t);
              const statusLabel = log.undoneAt ? t('history.status.undone') : t('history.status.taken');
              const sourceLabel = getSourceLabel(log.source, t);
              const timingLabel = getTimingLabel(log.slotId);
              const showMetaPanel = timingLabel || log.undoneAt;

              return (
                <View
                  key={log.id ?? `${log.userSupplementId}-${log.takenAt ?? 'unknown'}`}
                  style={[styles.card, log.undoneAt ? styles.cardUndone : null]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTextWrap}>
                      <Text style={styles.name}>{supplementName}</Text>
                      <Text style={styles.date}>{formatHistoryTime(log.takenAt, t)}</Text>
                    </View>
                    <StatusBadge label={statusLabel} tone={log.undoneAt ? 'warning' : 'good'} />
                  </View>

                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{t('history.detail.dosage')}</Text>
                      <Text style={styles.detailText}>{dosage}</Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{t('history.detail.source')}</Text>
                      <Text style={styles.detailText}>{sourceLabel}</Text>
                    </View>
                  </View>

                  {showMetaPanel ? (
                    <View style={styles.metaPanel}>
                      {timingLabel ? (
                        <Text style={styles.metaText}>
                          {t('history.meta.timing', { timing: timingLabel })}
                        </Text>
                      ) : null}

                      {log.undoneAt ? (
                        <Text style={styles.metaText}>
                          {t('history.meta.undoneAt', { date: formatHistoryDate(log.undoneAt, t) })}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))
      )}

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>{t('history.notice.title')}</Text>
        <Text style={styles.noticeText}>
          {t('history.notice.text')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: surfaces.screen,
  content: surfaces.content,
  kicker: {
    ...type.eyebrow,
    marginBottom: space.sm,
  },
  title: {
    ...type.display,
  },
  subtitle: {
    ...type.body,
    marginTop: space.sm + 2,
    marginBottom: space.xl - 2,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: space.md,
  },
  chip: {
    ...surfaces.chip,
    marginRight: space.sm,
    marginBottom: space.sm,
  },
  chipText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  chipActive: surfaces.chipActive,
  chipTextActive: surfaces.chipTextActive,
  adherenceCard: {
    ...surfaces.card,
    borderColor: colors.ruleStrong,
    marginBottom: space.lg,
  },
  adherenceLabel: {
    ...type.small,
    marginBottom: space.xs,
  },
  adherenceValue: {
    ...type.display,
    marginBottom: space.md,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 64,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
  },
  barToday: {
    backgroundColor: colors.accent,
  },
  barEmpty: {
    backgroundColor: colors.rule,
  },
  summaryCard: {
    ...surfaces.card,
    borderColor: colors.ruleStrong,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
  },
  summaryValue: {
    ...type.numeral,
    fontSize: 22,
    textAlign: 'center',
  },
  summaryLabel: {
    ...type.small,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: space.xs,
  },
  summaryDivider: {
    width: 1,
    height: 34,
    backgroundColor: colors.rule,
  },
  group: {
    marginTop: space.xs,
    marginBottom: space.xs,
  },
  groupTitle: {
    ...type.label,
    color: colors.inkMuted,
    letterSpacing: 1,
    marginTop: space.sm + 2,
    marginBottom: space.sm,
  },
  card: {
    ...surfaces.card,
    borderColor: colors.ruleStrong,
  },
  cardUndone: {
    backgroundColor: cautionTone.surface,
    borderColor: cautionTone.rule,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.sm + 2,
  },
  cardTextWrap: {
    flex: 1,
  },
  name: {
    ...type.bodyStrong,
    fontSize: 17,
  },
  date: {
    color: colors.inkMuted,
    fontSize: 13,
    marginTop: space.xs + 1,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: space.sm + 2,
    marginTop: space.md + 2,
  },
  detailItem: {
    flex: 1,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    padding: space.md,
  },
  detailLabel: {
    ...type.label,
    color: colors.inkMuted,
    marginBottom: space.xs + 1,
  },
  detailText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  metaPanel: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    padding: space.md,
    marginTop: space.md + 2,
    gap: space.xs + 1,
  },
  metaText: {
    color: colors.inkMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  emptyCard: {
    ...surfaces.card,
  },
  emptyTitle: {
    ...type.subheading,
  },
  emptyText: {
    ...type.body,
    marginTop: space.sm - 1,
  },
  noticeCard: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.lg,
    padding: space.md + 3,
    marginTop: space.xs,
  },
  noticeTitle: {
    ...type.subheading,
    marginBottom: space.sm - 1,
  },
  noticeText: {
    ...type.body,
    fontSize: 13,
  },
});
