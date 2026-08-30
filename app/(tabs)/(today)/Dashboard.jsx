import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';


import { colors, radius, space, surfaces, toneFor, type } from '../../../theme';

import { getBlockMessage, isBlocked } from '../../../AbsorptionBlocker';
import { checkAllConflictsForSlot } from '../../../ConflictLogic';
import { buildEntryGuidance } from '../../../ScheduleGuidance';
import SlotReason from '../../../components/SlotReason';
import { useTranslation } from '../../../i18n';
import useStore from '../../../useStore';
import {
  formatSupplementDosage,
  formatSupplementName,
  formatSupplementPurpose,
} from '../../../utils/supplementFormatting';

function formatLastLogged(lastLoggedAt, t, language = 'de') {
  if (!lastLoggedAt) return t('dashboard.lastActivityNone');

  const date = new Date(lastLoggedAt);
  if (Number.isNaN(date.getTime())) return t('dashboard.lastActivityInvalid');

  const formatted = date.toLocaleString(language === 'de' ? 'de-DE' : 'en-GB', {
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

function getGreetingKey(hour) {
  if (hour < 11) return 'dashboard.greeting.morning';
  if (hour < 18) return 'dashboard.greeting.day';
  return 'dashboard.greeting.evening';
}

function getGreetingText(displayName, t) {
  const greeting = t(getGreetingKey(new Date().getHours()));
  return displayName
    ? t('dashboard.greetingName', { greeting, name: displayName })
    : t('dashboard.greetingPlain', { greeting });
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
  const { t, language } = useTranslation();
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
  const displayName = useStore((state) => state.profile?.displayName);
  const absorptionBlockedAt = useStore((state) => state.absorptionBlockedAt);
  const getActiveSupplements = useStore((state) => state.getActiveSupplements);
  const getLoggedToday = useStore((state) => state.getLoggedToday);
  const getTodayProgress = useStore((state) => state.getTodayProgress);
  const getTodaySchedule = useStore((state) => state.getTodaySchedule);
  const getPausedCuresToday = useStore((state) => state.getPausedCuresToday);
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
  const pausedCures = getPausedCuresToday();
  const visibleSchedule = dailySchedule.filter((item) => item.supplements.length > 0);
  const progress = getTodayProgress();
  const fullInventoryCount = activeSupplements.length;
  const scheduledToday = progress.total;
  const pendingToday = progress.pending;
  const progressPercent = getProgressPercent(progress.done, progress.total);
  const routineInsight = getRoutineInsight(progress, t);
  const greetingText = getGreetingText(displayName, t);
  const lastLoggedAt = loggedToday[0]?.takenAt;
  const blockerState = isBlocked(absorptionBlockedAt);
  const slotAlerts = dailySchedule
    .map((item) => {
      const messages = checkAllConflictsForSlot([], item.supplements);
      return messages.length ? { slot: item.slot, messages } : null;
    })
    .filter(Boolean);
  // Erklaerung je Eintrag (SlotReason): einmal je aktivem Praeparat
  // berechnet statt in der Zeilen-Schleife, sonst wuerde ein Hook in
  // einer .map()-Schleife stehen (Rules of Hooks). buildEntryGuidance ist
  // reine Fachlogik aus ScheduleGuidance.js, ausschliesslich belegte
  // Regeln (Einnahme-Hinweise, Paar-Konflikte).
  const guidanceBySupplementId = React.useMemo(() => {
    const map = new Map();
    for (const supplement of activeSupplements) {
      map.set(supplement.id, buildEntryGuidance(supplement, activeSupplements));
    }
    return map;
  }, [activeSupplements]);
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
        <Text style={styles.greeting}>{greetingText}</Text>
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

        <Text style={styles.lastActivity}>{formatLastLogged(lastLoggedAt, t, language)}</Text>
      </View>

      {blockerState.blocked ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>{t('dashboard.noticeTitle')}</Text>
          <Text style={styles.noticeText}>{getBlockMessage(blockerState.remainingMinutes)}</Text>
        </View>
      ) : null}

      {/* Zugang zum vollstaendigen Bestand, direkt unter der Tagesuebersicht.
          Der Tagesplan zeigt nur, was heute ansteht — wer ein Praeparat
          ohne Einnahmezeitpunkt angelegt hat, fand es vorher gar nicht
          wieder. */}
      <TouchableOpacity
        style={styles.inventoryCard}
        onPress={() => router.push('/inventory')}
        activeOpacity={0.8}
        accessibilityRole="link"
      >
        <View style={styles.inventoryTextWrap}>
          <Text style={styles.inventoryLabel}>{t('dashboard.inventoryLabel')}</Text>
          <Text style={styles.inventoryValue}>
            {fullInventoryCount === 1
              ? t('dashboard.inventoryCount_one')
              : t('dashboard.inventoryCount_other', { count: fullInventoryCount })}
          </Text>
        </View>
        <Text style={styles.inventoryChevron}>›</Text>
      </TouchableOpacity>

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
          <TouchableOpacity
            style={styles.cleanupButton}
            onPress={handleArchiveDuplicateSupplements}
            accessibilityRole="button"
          >
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
            accessibilityRole="link"
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

      {/* Kur-Pausen erscheinen als eigener Block statt still aus den Slots
          zu verschwinden: Wer heute nichts nimmt, soll sehen, warum. */}
      {pausedCures.length > 0 ? (
        <View style={styles.pausedCureCard}>
          <Text style={styles.pausedCureTitle}>{t('dashboard.curePausedTitle')}</Text>
          {pausedCures.map(({ supplement, statusLabel }) => (
            <View key={supplement.id} style={styles.pausedCureRow}>
              <Text style={styles.pausedCureName}>
                {formatSupplementName(supplement)}
              </Text>
              {statusLabel ? (
                <Text style={styles.pausedCureStatus}>{statusLabel}</Text>
              ) : null}
            </View>
          ))}
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
              const detailsExpanded = expandedNoteIds.has(supplement.id);
              // In der taeglichen Routine zaehlt die Liste, nicht der
              // Steckbrief: Dosierung und Anwendungsgebiet stehen
              // eingeklappt auf einer Zeile. Aufgeklappt wird, wer es
              // wissen will. Der Schalter erscheint nur, wenn es etwas zu
              // sehen gibt — eine Notiz oder eine Zeile, die abgeschnitten
              // waere.
              const hasTruncatedMeta = supplementMeta.length > 42;
              const canExpandDetails =
                Boolean(supplementNotes) || hasTruncatedMeta;

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
                      <Text
                        style={styles.supplementMeta}
                        numberOfLines={detailsExpanded ? undefined : 1}
                      >
                        {supplementMeta}
                      </Text>
                    ) : null}

                    <SlotReason
                      guidance={
                        guidanceBySupplementId.get(supplement.id) ?? { notes: [], conflicts: [] }
                      }
                      onOpenSubstance={(substanceId) =>
                        router.push(`/search?substance=${substanceId}`)
                      }
                    />

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

                    {canExpandDetails ? (
                      <TouchableOpacity
                        onPress={() => toggleNoteExpanded(supplement.id)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={
                          detailsExpanded ? t('dashboard.noteHide') : t('dashboard.noteShow')
                        }
                      >
                        {detailsExpanded && supplementNotes ? (
                          <Text style={styles.noteText}>{supplementNotes}</Text>
                        ) : null}
                        <Text style={styles.noteToggle}>
                          {detailsExpanded ? t('dashboard.noteHide') : t('dashboard.noteShow')}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <View style={styles.actionWrap}>
                    {supplement.logged ? (
                      <TouchableOpacity
                        style={styles.secondaryAction}
                        onPress={() => undoIntakeToday(supplement.id)}
                        accessibilityRole="button"
                      >
                        <Text style={styles.secondaryActionText}>{t('dashboard.undo')}</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.primaryAction}
                        onPress={() => logIntake(supplement.id, { slotId: item.slot.id })}
                        accessibilityRole="button"
                      >
                        <Text style={styles.primaryActionText}>{t('dashboard.logAction')}</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.secondaryAction}
                      onPress={() => router.push(`/AddSupplement?editId=${encodeURIComponent(supplement.id)}`)}
                      accessibilityRole="link"
                    >
                      <Text style={styles.secondaryActionText}>{t('dashboard.edit')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dangerAction}
                      onPress={() => handleArchiveSupplement(supplement)}
                      accessibilityRole="button"
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
        <View style={styles.allClearCard}>
          <Text style={styles.allClearTitle}>{t('dashboard.noAlertsTitle')}</Text>
          <Text style={styles.allClearText}>{t('dashboard.noAlertsText')}</Text>
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
  screenWrap: { ...surfaces.screen },
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    ...surfaces.content,
  },
  header: {
    marginBottom: space.lg,
  },
  greeting: {
    ...type.bodyStrong,
    marginBottom: space.sm,
  },
  kickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Bereichsmarke ueber dem Seitentitel — dafuer ist type.eyebrow gedacht.
  kicker: {
    ...type.eyebrow,
  },
  profileLabel: {
    ...type.small,
  },
  title: {
    marginTop: space.md,
    ...type.display,
  },
  subtitle: {
    marginTop: space.sm,
    ...type.body,
  },
  summaryCard: {
    ...surfaces.card,
    padding: space.xl,
    marginBottom: 0,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: space.lg,
  },
  summaryLabel: {
    ...type.label,
  },
  summaryValue: {
    marginTop: space.sm,
    ...type.numeral,
  },
  percentBadge: {
    minWidth: 68,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    alignItems: 'center',
  },
  percentText: {
    ...type.numeral,
    color: colors.accent,
  },
  progressTrack: {
    height: 7,
    marginTop: space.xl,
    borderRadius: radius.md,
    backgroundColor: colors.rule,
    overflow: 'hidden',
  },
  progressFill: {
    height: 7,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
  summaryInsightRow: {
    marginTop: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSunken,
    padding: space.md,
  },
  summaryInsightPill: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    color: colors.accent,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  summaryInsightText: {
    marginTop: space.sm,
    ...type.body,
  },
  lastActivity: {
    marginTop: space.md,
    ...type.small,
  },
  // Absorptionssperre: ein Hinweis zum Timing, kein Alarm — daher 'notice'.
  noticeCard: {
    marginTop: space.md,
    borderRadius: radius.lg,
    backgroundColor: toneFor('notice').surface,
    borderWidth: 1,
    borderColor: toneFor('notice').rule,
    padding: space.lg,
  },
  noticeTitle: {
    ...type.subheading,
    color: toneFor('notice').ink,
  },
  noticeText: {
    marginTop: space.sm,
    ...type.body,
    color: toneFor('notice').ink,
  },
  inventoryCard: {
    ...surfaces.card,
    marginTop: space.md,
    marginBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.accentSoft,
  },
  inventoryTextWrap: { flex: 1 },
  inventoryLabel: {
    ...type.label,
    color: colors.accent,
  },
  inventoryValue: {
    ...type.subheading,
    marginTop: 2,
  },
  inventoryChevron: {
    ...type.display,
    color: colors.accent,
    marginLeft: space.md,
  },
  metricGrid: {
    marginTop: space.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    ...surfaces.card,
    padding: space.lg,
  },
  metricValue: {
    ...type.numeral,
    fontSize: 26,
  },
  metricLabel: {
    marginTop: space.sm,
    ...type.small,
    fontWeight: '600',
  },
  cleanupCard: {
    marginTop: space.xs,
    ...surfaces.card,
    borderColor: colors.ruleStrong,
  },
  cleanupTitle: {
    ...type.subheading,
  },
  cleanupText: {
    marginTop: space.sm,
    ...type.body,
  },
  cleanupMeta: {
    marginTop: space.sm,
    ...type.small,
  },
  cleanupButton: {
    marginTop: space.md,
    alignSelf: 'flex-start',
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  cleanupButtonText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeader: {
    marginTop: space.md,
    marginBottom: space.md,
  },
  sectionTitle: {
    ...type.heading,
  },
  sectionSubtitle: {
    marginTop: space.xs,
    ...type.small,
  },
  slotCard: {
    ...surfaces.card,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: space.md,
    gap: space.md,
  },
  slotHeaderText: {
    flex: 1,
  },
  slotTitle: {
    ...type.subheading,
  },
  slotTime: {
    marginTop: space.xs,
    ...type.small,
    fontWeight: '600',
  },
  slotStatusWrap: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  slotCount: {
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
    color: colors.ink,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    fontSize: 12,
    fontWeight: '800',
  },
  slotStatus: {
    marginTop: space.xs,
    ...type.label,
  },
  emptySlot: {
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    paddingTop: space.md,
  },
  emptyText: {
    ...type.body,
  },
  emptyRoutineCard: {
    ...surfaces.card,
    padding: space.lg,
  },
  pausedCureCard: {
    ...surfaces.card,
    backgroundColor: colors.surfaceSunken,
  },
  pausedCureTitle: {
    ...type.label,
    marginBottom: space.sm,
  },
  pausedCureRow: {
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    paddingTop: space.sm + 2,
    marginTop: space.sm + 2,
  },
  pausedCureName: {
    ...type.bodyStrong,
  },
  pausedCureStatus: {
    ...type.small,
    marginTop: space.xs,
  },
  emptyRoutineTitle: {
    ...type.subheading,
    marginBottom: space.sm,
  },
  emptyRoutineText: {
    ...type.body,
  },
  emptyRoutineButton: {
    marginTop: space.lg,
    alignSelf: 'flex-start',
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  emptyRoutineButtonText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '900',
  },
  supplementCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.md,
    paddingTop: space.md,
    marginTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  supplementTextWrap: {
    flex: 1,
  },
  supplementHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  supplementName: {
    flex: 1,
    ...type.bodyStrong,
    fontSize: 16,
    lineHeight: 21,
  },
  supplementMeta: {
    marginTop: space.xs,
    ...type.body,
  },
  noteText: {
    marginTop: space.xs,
    ...type.small,
  },
  timingPill: {
    ...surfaces.chip,
    alignSelf: 'flex-start',
    marginTop: space.sm,
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  timingPillText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  noteToggle: {
    marginTop: space.sm,
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  actionWrap: {
    minWidth: 116,
    alignItems: 'flex-end',
    gap: space.sm,
  },
  primaryAction: {
    minWidth: 116,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    alignItems: 'center',
  },
  secondaryAction: {
    minWidth: 116,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderColor: colors.ruleStrong,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    alignItems: 'center',
  },
  // Entfernen-Aktion: ein Hinweis vor destruktivem Schritt, kein Alarmrot.
  dangerAction: {
    minWidth: 116,
    borderRadius: radius.md,
    backgroundColor: toneFor('notice').surface,
    borderWidth: 1,
    borderColor: toneFor('notice').rule,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    alignItems: 'center',
  },
  primaryActionText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '800',
  },
  secondaryActionText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  dangerActionText: {
    color: toneFor('notice').ink,
    fontSize: 12,
    fontWeight: '800',
  },
  statePill: {
    overflow: 'hidden',
    borderRadius: radius.md,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    fontSize: 11,
    fontWeight: '800',
  },
  loggedPill: {
    backgroundColor: toneFor('ok').surface,
    color: toneFor('ok').ink,
  },
  pendingPill: {
    backgroundColor: colors.surfaceSunken,
    color: colors.inkMuted,
  },
  // Konflikthinweise pro Slot — ein Konflikt ist ein Hinweis ('notice').
  infoCard: {
    marginBottom: space.md,
    borderRadius: radius.lg,
    backgroundColor: toneFor('notice').surface,
    borderWidth: 1,
    borderColor: toneFor('notice').rule,
    padding: space.lg,
  },
  infoTitle: {
    ...type.subheading,
    color: toneFor('notice').ink,
  },
  infoText: {
    marginTop: space.sm,
    ...type.body,
    color: toneFor('notice').ink,
  },
  // "Keine Konflikte" — entlastende Rueckmeldung, daher 'ok'.
  allClearCard: {
    marginBottom: space.md,
    borderRadius: radius.lg,
    backgroundColor: toneFor('ok').surface,
    borderWidth: 1,
    borderColor: toneFor('ok').rule,
    padding: space.lg,
  },
  allClearTitle: {
    ...type.subheading,
    color: toneFor('ok').ink,
  },
  allClearText: {
    marginTop: space.sm,
    ...type.body,
    color: toneFor('ok').ink,
  },
  disclaimerCard: {
    marginTop: space.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
    padding: space.md,
  },
  disclaimerText: {
    ...type.small,
  },
});
