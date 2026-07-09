import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import StatusBadge from '../components/StatusBadge';
import { getSlotLabel } from '../TimingEngine';
import useStore from '../useStore';
import { formatSupplementDosage, formatSupplementName } from '../utils/supplementFormatting';

const EMPTY_LOGS = [];
const EMPTY_SUPPLEMENTS = [];

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

function formatHistoryGroupTitle(dateKey) {
  if (dateKey === 'unknown') return 'Ohne Datum';

  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return 'Ohne Datum';

  const todayKey = toDateKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toDateKey(yesterday);

  if (dateKey === todayKey) return 'Heute';
  if (dateKey === yesterdayKey) return 'Gestern';

  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatHistoryTime(value) {
  if (!value) return 'Zeitpunkt nicht hinterlegt';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Zeitpunkt nicht lesbar';

  return `${date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  })} Uhr`;
}

function formatHistoryDate(value) {
  if (!value) return 'Zeitpunkt nicht hinterlegt';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Zeitpunkt nicht lesbar';

  const entryKey = toDateKey(date);
  const dayLabel = formatHistoryGroupTitle(entryKey);

  return `${dayLabel} · ${formatHistoryTime(value)}`;
}

function formatLogDosage(log, supplement) {
  const logDosage = [log.amount, log.unit].filter(Boolean).join(' ').trim();

  if (logDosage) {
    return logDosage;
  }

  return formatSupplementDosage(supplement, 'Dosierung nicht hinterlegt');
}

function getSourceLabel(source) {
  if (source === 'dashboard') return 'Tagesplan';
  if (source === 'scan') return 'Scan';
  if (source === 'manual') return 'Manuell';
  if (source === 'legacy') return 'Importiert';
  return 'Routine';
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
      <Text style={styles.kicker}>Verlauf</Text>
      <Text style={styles.title}>Einnahmehistorie</Text>
      <Text style={styles.subtitle}>
        Übersicht der erfassten Einnahmen und rückgängig gemachten Einträge aus deiner lokalen Routine.
      </Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{activeLogs.length}</Text>
          <Text style={styles.summaryLabel}>Aktiv</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{undoneLogs.length}</Text>
          <Text style={styles.summaryLabel}>Rückgängig</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{sortedLogs.length}</Text>
          <Text style={styles.summaryLabel}>Gesamt</Text>
        </View>
      </View>

      {sortedLogs.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Noch keine Einnahmen erfasst</Text>
          <Text style={styles.emptyText}>
            Sobald du im Tagesplan ein Supplement als eingenommen markierst, erscheint der Eintrag hier in der Historie.
          </Text>
        </View>
      ) : (
        historyGroups.map((group) => (
          <View key={group.dateKey} style={styles.group}>
            <Text style={styles.groupTitle}>{formatHistoryGroupTitle(group.dateKey)}</Text>

            {group.logs.map((log) => {
              const supplement = resolveSupplement(log, supplements);
              const supplementName = formatSupplementName(supplement, 'Unbekanntes Supplement');
              const dosage = formatLogDosage(log, supplement);
              const statusLabel = log.undoneAt ? 'Rückgängig' : 'Eingenommen';
              const sourceLabel = getSourceLabel(log.source);
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
                      <Text style={styles.date}>{formatHistoryTime(log.takenAt)}</Text>
                    </View>
                    <StatusBadge label={statusLabel} tone={log.undoneAt ? 'warning' : 'good'} />
                  </View>

                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Dosierung</Text>
                      <Text style={styles.detailText}>{dosage}</Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Quelle</Text>
                      <Text style={styles.detailText}>{sourceLabel}</Text>
                    </View>
                  </View>

                  {showMetaPanel ? (
                    <View style={styles.metaPanel}>
                      {timingLabel ? (
                        <Text style={styles.metaText}>Timing: {timingLabel}</Text>
                      ) : null}

                      {log.undoneAt ? (
                        <Text style={styles.metaText}>
                          Rückgängig gemacht: {formatHistoryDate(log.undoneAt)}
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
        <Text style={styles.noticeTitle}>Hinweis</Text>
        <Text style={styles.noticeText}>
          Die Historie zeigt lokale Routine-Einträge. Sie ersetzt keine medizinische Bewertung und dient aktuell der persönlichen Nachvollziehbarkeit.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 44,
  },
  kicker: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#0f172a',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
  },
  summaryValue: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  summaryLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 34,
    backgroundColor: '#e2e8f0',
  },
  group: {
    marginTop: 4,
    marginBottom: 4,
  },
  groupTitle: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  cardUndone: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTextWrap: {
    flex: 1,
  },
  name: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '800',
  },
  date: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 5,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  detailLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  detailText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },
  metaPanel: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    gap: 5,
  },
  metaText: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  noticeCard: {
    backgroundColor: '#eef2f6',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    marginTop: 4,
  },
  noticeTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 7,
  },
  noticeText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
  },
});
