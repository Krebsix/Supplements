import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import StatusBadge from '../components/StatusBadge';
import useStore from '../useStore';
import { formatSupplementDosage, formatSupplementName } from '../utils/supplementFormatting';

const EMPTY_LOGS = [];
const EMPTY_SUPPLEMENTS = [];

function toDateKey(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return new Date().toISOString().slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function formatHistoryDate(value) {
  if (!value) return 'Zeitpunkt nicht hinterlegt';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Zeitpunkt nicht lesbar';

  const todayKey = toDateKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toDateKey(yesterday);
  const entryKey = toDateKey(date);

  const dayLabel =
    entryKey === todayKey
      ? 'Heute'
      : entryKey === yesterdayKey
        ? 'Gestern'
        : date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });

  const timeLabel = date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${dayLabel} · ${timeLabel} Uhr`;
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
          <Text style={styles.summaryLabel}>Aktive Logs</Text>
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
        sortedLogs.map((log) => {
          const supplement = resolveSupplement(log, supplements);
          const supplementName = formatSupplementName(supplement, 'Unbekanntes Supplement');
          const dosage = formatLogDosage(log, supplement);
          const statusLabel = log.undoneAt ? 'Rückgängig' : 'Eingenommen';
          const sourceLabel = getSourceLabel(log.source);

          return (
            <View key={log.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTextWrap}>
                  <Text style={styles.name}>{supplementName}</Text>
                  <Text style={styles.date}>{formatHistoryDate(log.takenAt)}</Text>
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

              {log.slotId ? (
                <Text style={styles.metaText}>Slot: {log.slotId}</Text>
              ) : null}

              {log.undoneAt ? (
                <Text style={styles.metaText}>
                  Rückgängig gemacht: {formatHistoryDate(log.undoneAt)}
                </Text>
              ) : null}
            </View>
          );
        })
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
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
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
  metaText: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
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
