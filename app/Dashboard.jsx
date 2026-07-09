import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getBlockMessage, isBlocked } from '../AbsorptionBlocker';
import { checkAllConflictsForSlot } from '../ConflictLogic';
import useStore from '../useStore';
import {
  formatSupplementDosage,
  formatSupplementName,
  formatSupplementPurpose,
} from '../utils/supplementFormatting';

function formatLastLogged(lastLoggedAt) {
  if (!lastLoggedAt) return 'Heute noch keine Einnahme erfasst.';

  const date = new Date(lastLoggedAt);
  if (Number.isNaN(date.getTime())) return 'Letzte Aktivität konnte nicht gelesen werden.';

  return `Letzte Aktivität: ${date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function getProgressPercent(done, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((done / total) * 100));
}

function getSlotCountLabel(count) {
  if (count === 0) return 'Keine Einträge';
  if (count === 1) return '1 Eintrag';
  return `${count} Einträge`;
}

function normalizeRoutineName(name = '') {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getDuplicateGroups(supplements = []) {
  const groupsByName = supplements.reduce((groups, supplement) => {
    const key = normalizeRoutineName(formatSupplementName(supplement, ''));
    if (!key) return groups;

    return {
      ...groups,
      [key]: [...(groups[key] || []), supplement],
    };
  }, {});

  return Object.values(groupsByName)
    .filter((group) => group.length > 1)
    .map((group) => {
      const sorted = [...group].sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return aTime - bTime;
      });

      return {
        name: formatSupplementName(sorted[0], 'Unbenannter Eintrag'),
        keep: sorted[0],
        duplicates: sorted.slice(1),
      };
    });
}

function getDuplicateCountLabel(count) {
  if (count === 1) return '1 zusätzlicher Eintrag';
  return `${count} zusätzliche Einträge`;
}

export default function Dashboard() {
  const router = useRouter();
  const activeProfileId = useStore((state) => state.activeProfileId);
  const absorptionBlockedAt = useStore((state) => state.absorptionBlockedAt);
  const getActiveSupplements = useStore((state) => state.getActiveSupplements);
  const getLoggedToday = useStore((state) => state.getLoggedToday);
  const getTodayProgress = useStore((state) => state.getTodayProgress);
  const getTodaySchedule = useStore((state) => state.getTodaySchedule);
  const logIntake = useStore((state) => state.logIntake);
  const undoIntakeToday = useStore((state) => state.undoIntakeToday);
  const archiveUserSupplement = useStore((state) => state.archiveUserSupplement);
  const getStock = useStore((state) => state.getStock);

  // Subscribe to changing store slices so the dashboard re-renders after intake/stock/user-supplement updates.
  const intakeLogs = useStore((state) => state.intakeLogs);
  const userSupplements = useStore((state) => state.userSupplements);
  const stockBySupplementId = useStore((state) => state.stockBySupplementId);
  void intakeLogs;
  void userSupplements;
  void stockBySupplementId;

  const loggedToday = getLoggedToday();
  const activeSupplements = getActiveSupplements();
  const dailySchedule = getTodaySchedule();
  const progress = getTodayProgress();
  const fullInventoryCount = activeSupplements.length;
  const scheduledToday = progress.total;
  const pendingToday = progress.pending;
  const progressPercent = getProgressPercent(progress.done, progress.total);
  const lastLoggedAt = loggedToday[0]?.takenAt;
  const blockerState = isBlocked(absorptionBlockedAt);
  const slotAlerts = dailySchedule
    .map((item) => {
      const messages = checkAllConflictsForSlot([], item.supplements);
      return messages.length ? { slot: item.slot, messages } : null;
    })
    .filter(Boolean);
  const duplicateGroups = getDuplicateGroups(activeSupplements);
  const duplicateSupplementsToArchive = duplicateGroups.reduce(
    (items, group) => [...items, ...group.duplicates],
    []
  );
  const duplicateEntryCount = duplicateSupplementsToArchive.length;
  const duplicateGroupNames = duplicateGroups.map((group) => group.name).join(', ');

  function handleArchiveSupplement(supplement) {
    const supplementName = formatSupplementName(supplement);

    Alert.alert(
      'Aus Routine entfernen',
      `${supplementName} wird aus der aktiven Routine entfernt. Der Eintrag wird archiviert und nicht dauerhaft gelöscht.`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Entfernen',
          style: 'destructive',
          onPress: () => archiveUserSupplement(supplement.id),
        },
      ]
    );
  }

  function handleArchiveDuplicateSupplements() {
    if (duplicateEntryCount === 0) return;

    Alert.alert(
      'Mehrfache Einträge bereinigen',
      `${getDuplicateCountLabel(duplicateEntryCount)} werden archiviert. Je Supplement-Name bleibt ein aktiver Eintrag in deiner Routine erhalten.`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Bereinigen',
          style: 'destructive',
          onPress: () => {
            duplicateSupplementsToArchive.forEach((supplement) => {
              archiveUserSupplement(supplement.id);
            });
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.kickerRow}>
          <Text style={styles.kicker}>Supplement OS</Text>
          <Text style={styles.profileLabel}>Profil {activeProfileId}</Text>
        </View>

        <Text style={styles.title}>Tagesplan</Text>
        <Text style={styles.subtitle}>
          Übersicht deiner heutigen Supplement-Routine.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          <View>
            <Text style={styles.summaryLabel}>Status heute</Text>
            <Text style={styles.summaryValue}>
              {progress.done} von {progress.total} erledigt
            </Text>
          </View>

          <View style={styles.percentBadge}>
            <Text style={styles.percentText}>{progressPercent}%</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>

        <Text style={styles.lastActivity}>{formatLastLogged(lastLoggedAt)}</Text>
      </View>

      {blockerState.blocked ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Einnahmehinweis aktiv</Text>
          <Text style={styles.noticeText}>{getBlockMessage(blockerState.remainingMinutes)}</Text>
        </View>
      ) : null}

      <View style={styles.metricGrid}>
        <MetricCard label="Aktiv" value={String(fullInventoryCount)} />
        <MetricCard label="Geplant" value={String(scheduledToday)} />
        <MetricCard label="Erledigt" value={String(progress.done)} />
        <MetricCard label="Offen" value={String(pendingToday)} />
      </View>

      {duplicateEntryCount > 0 ? (
        <View style={styles.cleanupCard}>
          <Text style={styles.cleanupTitle}>Mehrfache Routine-Einträge erkannt</Text>
          <Text style={styles.cleanupText}>
            {getDuplicateCountLabel(duplicateEntryCount)} mit gleichem Namen. Du kannst die zusätzlichen Einträge archivieren; je Name bleibt ein aktiver Eintrag erhalten.
          </Text>
          {duplicateGroupNames ? (
            <Text style={styles.cleanupMeta} numberOfLines={2}>
              Betroffen: {duplicateGroupNames}
            </Text>
          ) : null}
          <TouchableOpacity style={styles.cleanupButton} onPress={handleArchiveDuplicateSupplements}>
            <Text style={styles.cleanupButtonText}>Duplikate archivieren</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <SectionHeading
        title="Routine"
        subtitle="Nach Einnahmezeit sortiert."
      />

      {dailySchedule.map((item) => (
        <View key={item.slot.id} style={styles.slotCard}>
          <View style={styles.slotHeader}>
            <View style={styles.slotHeaderText}>
              <Text style={styles.slotTitle}>{item.slot.label}</Text>
              <Text style={styles.slotTime}>{item.slot.time}</Text>
            </View>
            <Text style={styles.slotCount}>{getSlotCountLabel(item.supplements.length)}</Text>
          </View>

          {item.supplements.length === 0 ? (
            <View style={styles.emptySlot}>
              <Text style={styles.emptyText}>Für diesen Zeitraum ist nichts geplant.</Text>
            </View>
          ) : (
            item.supplements.map((supplement) => {
              const routineSupplement =
                activeSupplements.find((entry) => entry.id === supplement.id) ?? supplement;
              const stock = getStock(supplement.id);
              const supplementName = formatSupplementName(routineSupplement);
              const supplementMeta = [
                formatSupplementDosage(routineSupplement, ''),
                formatSupplementPurpose(routineSupplement, ''),
              ].filter(Boolean).join(' · ');
              const supplementNotes = routineSupplement.notes || supplement.notes;

              return (
                <View key={supplement.id} style={styles.supplementCard}>
                  <View style={styles.supplementTextWrap}>
                    <Text style={styles.supplementName}>{supplementName}</Text>
                    {supplementMeta ? (
                      <Text style={styles.supplementMeta}>{supplementMeta}</Text>
                    ) : null}

                    {stock?.currentUnits !== undefined ? (
                      <Text style={styles.noteText}>
                        Bestand: {stock.currentUnits} {stock.unit || 'Einheiten'}
                      </Text>
                    ) : null}

                    {supplementNotes ? (
                      <Text style={styles.noteText}>{supplementNotes}</Text>
                    ) : null}
                  </View>

                  <View style={styles.actionWrap}>
                    <Text
                      style={[
                        styles.statePill,
                        supplement.logged ? styles.loggedPill : styles.pendingPill,
                      ]}
                    >
                      {supplement.logged ? 'Erledigt' : 'Offen'}
                    </Text>

                    {supplement.logged ? (
                      <TouchableOpacity
                        style={styles.secondaryAction}
                        onPress={() => undoIntakeToday(supplement.id)}
                      >
                        <Text style={styles.secondaryActionText}>Rückgängig</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.primaryAction}
                        onPress={() => logIntake(supplement.id, { slotId: item.slot.id })}
                      >
                        <Text style={styles.primaryActionText}>Eingenommen</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.secondaryAction}
                      onPress={() => router.push(`/AddSupplement?editId=${encodeURIComponent(supplement.id)}`)}
                    >
                      <Text style={styles.secondaryActionText}>Bearbeiten</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dangerAction}
                      onPress={() => handleArchiveSupplement(supplement)}
                    >
                      <Text style={styles.dangerActionText}>Entfernen</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      ))}

      <SectionHeading
        title="Hinweise"
        subtitle="Allgemeine organisatorische Hinweise."
      />

      {slotAlerts.length === 0 ? (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Keine zusätzlichen Hinweise</Text>
          <Text style={styles.infoText}>
            Für den aktuellen Tagesplan liegen derzeit keine weiteren organisatorischen Hinweise vor.
          </Text>
        </View>
      ) : (
        slotAlerts.map((group) => (
          <View key={group.slot.id} style={styles.infoCard}>
            <Text style={styles.infoTitle}>{group.slot.label}</Text>
            {group.messages.map((message, index) => (
              <Text key={`${group.slot.id}-${index}`} style={styles.infoText}>
                {message.message}
              </Text>
            ))}
          </View>
        ))
      )}

      <View style={styles.disclaimerCard}>
        <Text style={styles.disclaimerText}>
          Supplement OS unterstützt die Organisation deiner Routine. Die Hinweise sind allgemein und ersetzen keine medizinische Beratung.
        </Text>
      </View>
    </ScrollView>
  );
}

function SectionHeading({ title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

function MetricCard({ label, value }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  kickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kicker: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  profileLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    marginTop: 12,
    color: '#0F172A',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  subtitle: {
    marginTop: 6,
    color: '#64748B',
    fontSize: 15,
    lineHeight: 21,
  },
  summaryCard: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  summaryLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  summaryValue: {
    marginTop: 7,
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
  },
  percentBadge: {
    minWidth: 68,
    borderRadius: 16,
    backgroundColor: '#EEF6F7',
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },
  percentText: {
    color: '#0F766E',
    fontSize: 20,
    fontWeight: '800',
  },
  progressTrack: {
    height: 7,
    marginTop: 18,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: 7,
    borderRadius: 999,
    backgroundColor: '#0F766E',
  },
  lastActivity: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
  noticeCard: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 15,
  },
  noticeTitle: {
    color: '#9A3412',
    fontSize: 14,
    fontWeight: '800',
  },
  noticeText: {
    marginTop: 6,
    color: '#C2410C',
    fontSize: 13,
    lineHeight: 19,
  },
  metricGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  metricValue: {
    color: '#0F172A',
    fontSize: 26,
    fontWeight: '800',
  },
  metricLabel: {
    marginTop: 6,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
  cleanupCard: {
    marginTop: 2,
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 15,
  },
  cleanupTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  cleanupText: {
    marginTop: 7,
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
  },
  cleanupMeta: {
    marginTop: 7,
    color: '#64748B',
    fontSize: 12,
    lineHeight: 17,
  },
  cleanupButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#0F766E',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cleanupButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeader: {
    marginTop: 12,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
  slotCard: {
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 15,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  slotHeaderText: {
    flex: 1,
  },
  slotTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
  },
  slotTime: {
    marginTop: 3,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  slotCount: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  emptySlot: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 11,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  supplementCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 13,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  supplementTextWrap: {
    flex: 1,
  },
  supplementName: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  supplementMeta: {
    marginTop: 4,
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
  noteText: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 12,
    lineHeight: 17,
  },
  actionWrap: {
    minWidth: 104,
    alignItems: 'flex-end',
    gap: 8,
  },
  primaryAction: {
    minWidth: 104,
    borderRadius: 999,
    backgroundColor: '#0F766E',
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },
  secondaryAction: {
    minWidth: 104,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },
  dangerAction: {
    minWidth: 104,
    borderRadius: 999,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  secondaryActionText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
  },
  dangerActionText: {
    color: '#9A3412',
    fontSize: 12,
    fontWeight: '800',
  },
  statePill: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: '800',
  },
  loggedPill: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  pendingPill: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
  },
  infoCard: {
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 15,
  },
  infoTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  infoText: {
    marginTop: 7,
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
  },
  disclaimerCard: {
    marginTop: 2,
    borderRadius: 16,
    backgroundColor: '#EEF2F6',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 13,
  },
  disclaimerText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
  },
});
