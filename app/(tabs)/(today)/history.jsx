import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import StatusBadge from '../../../components/StatusBadge';
import { getSlotLabel } from '../../../TimingEngine';
import useStore from '../../../useStore';
import { formatSupplementDosage, formatSupplementName } from '../../../utils/supplementFormatting';
import { useTranslation } from '../../../i18n';
import { colors, radius, space, surfaces, toneFor, type } from '../../../theme';

const EMPTY_LOGS = [];
const EMPTY_SUPPLEMENTS = [];
const cautionTone = toneFor('caution');

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

  const supplements = [...userSupplements, ...librarySupplements];
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
    fontWeight: '800',
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
