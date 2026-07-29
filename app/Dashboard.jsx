import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import TabBar from '../components/TabBar';

import { getBlockMessage, isBlocked } from '../AbsorptionBlocker';
import { checkAllConflictsForSlot } from '../ConflictLogic';
import { useTranslation } from '../i18n';
import useStore from '../useStore';
import {
  formatSupplementDosage,
  formatSupplementName,
  formatSupplementPurpose,
} from '../utils/supplementFormatting';

function formatLastLogged(lastLoggedAt, t) {
  if (!lastLoggedAt) return t('dashboard.lastActivityNone');

  const date = new Date(lastLoggedAt);
  if (Number.isNaN(date.getTime())) return t('dashboard.lastActivityInvalid');

  const formatted = date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  return t('dashboard.lastActivityLogged', { date: formatted });
}

function getProgressPercent(done, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((done / total) * 100));
}

function getSlotCountLabel(count, t) {
  if (count === 0) return t('dashboard.slotCountEmpty');
  if (count === 1) return t('dashboard.slotCount_one');
  return t('dashboard.slotCount_other', { count });
}

function normalizeRoutineName(name = '') {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getDuplicateGroups(supplements = [], t) {
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
        name: formatSupplementName(sorted[0], t('dashboard.unnamedEntry')),
        keep: sorted[0],
        duplicates: sorted.slice(1),
      };
    });
}

function getDuplicateCountLabel(count, t) {
  if (count === 1) return t('dashboard.duplicateCount_one');
  return t('dashboard.duplicateCount_other', { count });
}

function getProfileLabel(profileId, t) {
  if (profileId === 'adult') return t('dashboard.profileAdult');
  if (profileId === 'child') return t('dashboard.profileChild');
  return profileId || t('dashboard.profileDefault');
}

function getRoutineInsight(progress, t) {
  if (!progress.total) {
    return {
      label: t('dashboard.insightSetupLabel'),
      text: t('dashboard.insightSetupText'),
    };
  }

  if (progress.pending === 0) {
    return {
      label: t('dashboard.insightCompleteLabel'),
      text: t('dashboard.insightCompleteText'),
    };
  }

  return {
    label: t('dashboard.insightPendingLabel', { pending: progress.pending }),
    text: t('dashboard.insightPendingText'),
  };
}

export default function Dashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const [expandedNoteIds, setExpandedNoteIds] = React.useState(() => new Set());

  function toggleNoteExpanded(id) {
    setExpandedNoteIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
  const visibleSchedule = dailySchedule.filter((item) => item.supplements.length > 0);
  const progress = getTodayProgress();
  const fullInventoryCount = activeSupplements.length;
  const scheduledToday = progress.total;
  const pendingToday = progress.pending;
  const progressPercent = getProgressPercent(progress.done, progress.total);
  const routineInsight = getRoutineInsight(progress, t);
  const lastLoggedAt = loggedToday[0]?.takenAt;
  const blockerState = isBlocked(absorptionBlockedAt);
  const slotAlerts = dailySchedule
    .map((item) => {
      const messages = checkAllConflictsForSlot([], item.supplements);
      return messages.length ? { slot: item.slot, messages } : null;
    })
    .filter(Boolean);
  const duplicateGroups = getDuplicateGroups(activeSupplements, t);
  const duplicateSupplementsToArchive = duplicateGroups.reduce(
    (items, group) => [...items, ...group.duplicates],
    []
  );
  const duplicateEntryCount = duplicateSupplementsToArchive.length;
  const duplicateGroupNames = duplicateGroups.map((group) => group.name).join(', ');

  function handleArchiveSupplement(supplement) {
    const supplementName = formatSupplementName(supplement);

    Alert.alert(
      t('dashboard.archiveAlertTitle'),
      t('dashboard.archiveAlertMessage', { name: supplementName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('dashboard.remove'),
          style: 'destructive',
          onPress: () => archiveUserSupplement(supplement.id),
        },
      ]
    );
  }

  function handleArchiveDuplicateSupplements() {
    if (duplicateEntryCount === 0) return;

    Alert.alert(
      t('dashboard.cleanupAlertTitle'),
      t('dashboard.cleanupAlertMessage', {
        label: getDuplicateCountLabel(duplicateEntryCount, t),
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('dashboard.cleanupAlertConfirm'),
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
    <View style={styles.screenWrap}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.kickerRow}>
          <Text style={styles.kicker}>{t('dashboard.kicker')}</Text>
          <Text style={styles.profileLabel}>
            {t('dashboard.profileLabel', { profile: getProfileLabel(activeProfileId, t) })}
          </Text>
        </View>

        <Text style={styles.title}>{t('dashboard.title')}</Text>
        <Text style={styles.subtitle}>{t('dashboard.subtitle')}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          <View>
            <Text style={styles.summaryLabel}>{t('dashboard.summaryLabel')}</Text>
            <Text style={styles.summaryValue}>
              {progress.total > 0
                ? t('dashboard.summaryProgress', { done: progress.done, total: progress.total })
                : t('dashboard.summaryEmpty')}
            </Text>
          </View>

          <View style={styles.percentBadge}>
            <Text style={styles.percentText}>{progressPercent}%</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>

        <View style={styles.summaryInsightRow}>
          <Text style={styles.summaryInsightPill}>{routineInsight.label}</Text>
          <Text style={styles.summaryInsightText}>{routineInsight.text}</Text>
        </View>

        <Text style={styles.lastActivity}>{formatLastLogged(lastLoggedAt, t)}</Text>
      </View>

      {blockerState.blocked ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>{t('dashboard.noticeTitle')}</Text>
          <Text style={styles.noticeText}>{getBlockMessage(blockerState.remainingMinutes)}</Text>
        </View>
      ) : null}

      <View style={styles.metricGrid}>
        <MetricCard label={t('dashboard.metricActiveRoutine')} value={String(fullInventoryCount)} />
        <MetricCard label={t('dashboard.metricScheduledToday')} value={String(scheduledToday)} />
        <MetricCard label={t('dashboard.metricLogged')} value={String(progress.done)} />
        <MetricCard label={t('dashboard.metricPending')} value={String(pendingToday)} />
      </View>

      {duplicateEntryCount > 0 ? (
        <View style={styles.cleanupCard}>
          <Text style={styles.cleanupTitle}>{t('dashboard.cleanupTitle')}</Text>
          <Text style={styles.cleanupText}>
            {t('dashboard.cleanupText', {
              label: getDuplicateCountLabel(duplicateEntryCount, t),
            })}
          </Text>
          {duplicateGroupNames ? (
            <Text style={styles.cleanupMeta} numberOfLines={2}>
              {t('dashboard.cleanupMeta', { names: duplicateGroupNames })}
            </Text>
          ) : null}
          <TouchableOpacity style={styles.cleanupButton} onPress={handleArchiveDuplicateSupplements}>
            <Text style={styles.cleanupButtonText}>{t('dashboard.cleanupButton')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <SectionHeading
        title={t('dashboard.sectionRoutineTitle')}
        subtitle={t('dashboard.sectionRoutineSubtitle')}
      />

      {fullInventoryCount === 0 ? (
        <View style={styles.emptyRoutineCard}>
          <Text style={styles.emptyRoutineTitle}>{t('dashboard.emptyRoutineTitle')}</Text>
          <Text style={styles.emptyRoutineText}>{t('dashboard.emptyRoutineText')}</Text>
          <TouchableOpacity
            style={styles.emptyRoutineButton}
            onPress={() => router.push('/AddSupplement')}
          >
            <Text style={styles.emptyRoutineButtonText}>{t('dashboard.emptyRoutineButton')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {fullInventoryCount > 0 && visibleSchedule.length === 0 ? (
        <View style={styles.emptyRoutineCard}>
          <Text style={styles.emptyRoutineTitle}>{t('dashboard.timingIncompleteTitle')}</Text>
          <Text style={styles.emptyRoutineText}>{t('dashboard.timingIncompleteText')}</Text>
        </View>
      ) : null}

      {fullInventoryCount > 0 ? visibleSchedule.map((item) => (
        <View key={item.slot.id} style={styles.slotCard}>
          <View style={styles.slotHeader}>
            <View style={styles.slotHeaderText}>
              <Text style={styles.slotTitle}>{item.slot.label}</Text>
              <Text style={styles.slotTime}>{item.slot.time}</Text>
            </View>
            <View style={styles.slotStatusWrap}>
              <Text style={styles.slotCount}>{getSlotCountLabel(item.supplements.length, t)}</Text>
              <Text style={styles.slotStatus}>{t('dashboard.slotStatus')}</Text>
            </View>
          </View>

          {item.supplements.length === 0 ? (
            <View style={styles.emptySlot}>
              <Text style={styles.emptyText}>{t('dashboard.emptySlotText')}</Text>
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
              const supplementTiming = (
                routineSupplement.timingRaw || supplement.timingRaw || ''
              ).trim();
              const notesExpanded = expandedNoteIds.has(supplement.id);

              return (
                <View key={supplement.id} style={styles.supplementCard}>
                  <View style={styles.supplementTextWrap}>
                    <View style={styles.supplementHeaderRow}>
                      <Text style={styles.supplementName}>{supplementName}</Text>
                      <Text
                        style={[
                          styles.statePill,
                          supplement.logged ? styles.loggedPill : styles.pendingPill,
                        ]}
                      >
                        {supplement.logged ? t('dashboard.stateLogged') : t('dashboard.statePending')}
                      </Text>
                    </View>
                    {supplementMeta ? (
                      <Text style={styles.supplementMeta}>{supplementMeta}</Text>
                    ) : null}

                    {stock?.currentUnits !== undefined ? (
                      <Text style={styles.noteText}>
                        {t('dashboard.stockNote', {
                          amount: stock.currentUnits,
                          unit: stock.unit || t('dashboard.stockUnitFallback'),
                        })}
                      </Text>
                    ) : null}

                    {supplementTiming ? (
                      <View style={styles.timingPill}>
                        <Text style={styles.timingPillText}>
                          {t('dashboard.timingPrefix', { timing: supplementTiming })}
                        </Text>
                      </View>
                    ) : null}

                    {supplementNotes ? (
                      <TouchableOpacity
                        onPress={() => toggleNoteExpanded(supplement.id)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                      >
                        {notesExpanded ? (
                          <Text style={styles.noteText}>{supplementNotes}</Text>
                        ) : null}
                        <Text style={styles.noteToggle}>
                          {notesExpanded ? t('dashboard.noteHide') : t('dashboard.noteShow')}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <View style={styles.actionWrap}>
                    {supplement.logged ? (
                      <TouchableOpacity
                        style={styles.secondaryAction}
                        onPress={() => undoIntakeToday(supplement.id)}
                      >
                        <Text style={styles.secondaryActionText}>{t('dashboard.undo')}</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.primaryAction}
                        onPress={() => logIntake(supplement.id, { slotId: item.slot.id })}
                      >
                        <Text style={styles.primaryActionText}>{t('dashboard.logAction')}</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.secondaryAction}
                      onPress={() => router.push(`/AddSupplement?editId=${encodeURIComponent(supplement.id)}`)}
                    >
                      <Text style={styles.secondaryActionText}>{t('dashboard.edit')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dangerAction}
                      onPress={() => handleArchiveSupplement(supplement)}
                    >
                      <Text style={styles.dangerActionText}>{t('dashboard.remove')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      )) : null}

      <SectionHeading
        title={t('dashboard.sectionAlertsTitle')}
        subtitle={t('dashboard.sectionAlertsSubtitle')}
      />

      {slotAlerts.length === 0 ? (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t('dashboard.noAlertsTitle')}</Text>
          <Text style={styles.infoText}>{t('dashboard.noAlertsText')}</Text>
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
        <Text style={styles.disclaimerText}>{t('dashboard.disclaimer')}</Text>
      </View>
    </ScrollView>
      <TabBar active="today" />
    </View>
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
  screenWrap: { flex: 1, backgroundColor: '#f8fafc' },
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
  summaryInsightRow: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  summaryInsightPill: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: '#ECFDF5',
    color: '#0F766E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  summaryInsightText: {
    marginTop: 8,
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
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
  slotStatusWrap: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  slotCount: {
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    color: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '800',
  },
  slotStatus: {
    marginTop: 5,
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
  emptyRoutineCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 17,
    marginBottom: 12,
  },
  emptyRoutineTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 7,
  },
  emptyRoutineText: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
  },
  emptyRoutineButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#0F766E',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  emptyRoutineButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
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
  supplementHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  supplementName: {
    flex: 1,
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
  timingPill: {
    alignSelf: 'flex-start',
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  timingPillText: {
    color: '#0F766E',
    fontSize: 11,
    fontWeight: '800',
  },
  noteToggle: {
    marginTop: 5,
    color: '#0F766E',
    fontSize: 11,
    fontWeight: '800',
  },
  actionWrap: {
    minWidth: 116,
    alignItems: 'flex-end',
    gap: 8,
  },
  primaryAction: {
    minWidth: 116,
    borderRadius: 999,
    backgroundColor: '#0F766E',
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },
  secondaryAction: {
    minWidth: 116,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },
  dangerAction: {
    minWidth: 116,
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
