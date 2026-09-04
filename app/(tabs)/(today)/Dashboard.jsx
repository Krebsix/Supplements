import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, space, surfaces, toneFor, type } from '../../../theme';

import { getBlockMessage, isBlocked } from '../../../AbsorptionBlocker';
import { checkAllConflictsForSlot } from '../../../ConflictLogic';
import { formatBackupTime } from '../../../CloudBackup';
import { findNextUp } from '../../../NextUp';
import { buildEntryGuidance } from '../../../ScheduleGuidance';
import { applySeparation } from '../../../StackConflictResolver';
import { analyzeStack } from '../../../StackAnalyzer';
import { refillState } from '../../../StockForecast';
import { substanceIdsFromDetails } from '../../../SlotSuggestion';
import { getAdvisories } from '../../../data/lifeStageAdvisories';
import { getSubstance } from '../../../data/substances';
import FirstStepsCard from '../../../components/FirstStepsCard';
import SlotReason from '../../../components/SlotReason';
import { useTranslation } from '../../../i18n';
import useCloudBackupStore from '../../../useCloudBackupStore';
import useNotificationStore from '../../../useNotificationStore';
import useStore from '../../../useStore';
import { formatSupplementDosage, formatSupplementName } from '../../../utils/supplementFormatting';

// Kopf-Metazeile (Design-Review 2026-09-01, 02-A): ein Datum, ein Profil,
// sonst nichts. Begruessung, Kicker und Untertitel sind entfallen — der
// Titel beantwortet die Frage des Screens, der Rest war Deko.
function formatHeaderDate(language) {
  return new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// Namen fuer die kuratierten Kartentexte kompakt halten: maximal drei,
// Rest als Anzahl.
function joinNames(names = []) {
  const shown = names.slice(0, 3).join(', ');
  const more = names.length - 3;
  return more > 0 ? `${shown} +${more}` : shown;
}

function getProfileLabel(profileId, t) {
  if (profileId === 'adult') return t('dashboard.profileAdult');
  if (profileId === 'child') return t('dashboard.profileChild');
  return profileId || t('dashboard.profileDefault');
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

// Zeitgruppen-Kopf der Checkliste: Slot-Name plus Uhrzeit, wie bisher in
// den Slot-Karten ("Morgens · 07:00"), jetzt als Mono-Eyebrow-Zeile
// (type.eyebrow, Task A).
function slotHeading(slot) {
  return `${slot.label} · ${slot.time}`;
}

export default function Dashboard() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();
  // Welche Zeilen ihre Einnahme-Hinweise/Konflikt-Erklaerung aufgeklappt
  // zeigen (SlotReason), Pattern unveraendert aus der Buehnen-Fassung
  // uebernommen: Standard zu, Tiefe ist einen Tipp entfernt.
  const [expandedNoteIds, setExpandedNoteIds] = React.useState(() => new Set());

  const activeProfileId = useStore((state) => state.activeProfileId);
  const absorptionBlockedAt = useStore((state) => state.absorptionBlockedAt);
  const getActiveSupplements = useStore((state) => state.getActiveSupplements);
  const getTodayProgress = useStore((state) => state.getTodayProgress);
  const getTodaySchedule = useStore((state) => state.getTodaySchedule);
  const getPausedCuresToday = useStore((state) => state.getPausedCuresToday);
  const logIntake = useStore((state) => state.logIntake);
  const undoIntakeToday = useStore((state) => state.undoIntakeToday);
  const archiveUserSupplement = useStore((state) => state.archiveUserSupplement);
  const updateUserSupplement = useStore((state) => state.updateUserSupplement);
  const lastRestore = useCloudBackupStore((state) => state.lastRestore);
  const dismissRestoreNotice = useCloudBackupStore((state) => state.dismissRestoreNotice);
  const notificationsEnabled = useNotificationStore((state) => state.notificationsEnabled);
  const notificationPermission = useNotificationStore((state) => state.permissionGranted);
  const activeLifeStageId = useStore((state) => state.activeLifeStageId);
  const refillThresholdDays = useNotificationStore((state) => state.refillThresholdDays);

  // Subscribe to changing store slices so the dashboard re-renders after intake/stock/user-supplement updates.
  const intakeLogs = useStore((state) => state.intakeLogs);
  const userSupplements = useStore((state) => state.userSupplements);
  const stockBySupplementId = useStore((state) => state.stockBySupplementId);
  void userSupplements;
  void stockBySupplementId;

  const activeSupplements = getActiveSupplements();
  const dailySchedule = getTodaySchedule();
  const pausedCures = getPausedCuresToday();
  const visibleSchedule = dailySchedule.filter((item) => item.supplements.length > 0);
  const progress = getTodayProgress();
  const fullInventoryCount = activeSupplements.length;
  const headerMeta = `${formatHeaderDate(language)} · ${t('dashboard.profileLabel', {
    profile: getProfileLabel(activeProfileId, t),
  })}`;
  const blockerState = isBlocked(absorptionBlockedAt);
  // Slot-Konflikt-Hinweise (ConflictLogic.js): unveraendert aus der Buehnen-
  // Fassung uebernommen, jetzt inline unter der jeweiligen Zeitgruppe statt
  // in einer eigenen Sektion am Seitenende (Behalten-Vorgabe: an die neuen
  // Zeitgruppen haengen, wo sie vorher am Slot hingen).
  const slotAlerts = dailySchedule
    .map((item) => {
      const messages = checkAllConflictsForSlot([], item.supplements);
      return messages.length ? { slot: item.slot, messages } : null;
    })
    .filter(Boolean);

  function alertsForSlot(slotId) {
    return slotAlerts.find((entry) => entry.slot.id === slotId) ?? null;
  }

  // Erklaerung je Eintrag (SlotReason), unveraendert aus der Buehnen-Fassung
  // uebernommen (Finding Task B: war komplett aus der App verschwunden).
  // Einmal je aktivem Praeparat berechnet statt in der Zeilen-Schleife,
  // sonst wuerde ein Hook in einer .map()-Schleife stehen (Rules of Hooks).
  // buildEntryGuidance ist reine Fachlogik aus ScheduleGuidance.js,
  // ausschliesslich belegte Regeln (Einnahme-Hinweise, Paar-Konflikte,
  // Synergien).
  const guidanceBySupplementId = React.useMemo(() => {
    const map = new Map();
    for (const supplement of activeSupplements) {
      map.set(supplement.id, buildEntryGuidance(supplement, activeSupplements, dailySchedule));
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSupplements, dailySchedule]);

  function toggleNoteExpanded(id) {
    setExpandedNoteIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Verschiebungs-Vorschlag anwenden (StackConflictResolver.js): ersetzt
  // nur den betroffenen Slot, andere Slots eines 2x/3x-Praeparats bleiben.
  function handleApplyMove(supplement, conflict) {
    if (!conflict?.move) return;
    const nextSlots = applySeparation(
      supplement.timingSlots ?? [],
      conflict.move.fromSlotId,
      conflict.move.slotId
    );
    updateUserSupplement(supplement.id, { timingSlots: nextSlots });
  }

  // Checkliste statt Arbeitsfluss-Karte (Redesign Phase 2, Task B): "als
  // Naechstes" bestimmt nur noch, welche Zeitgruppe als JETZT markiert wird
  // und in welcher Gruppe der Nehmen-Button erscheint. Faellig ist nichts
  // mehr, sobald findNextUp() null liefert (alles dokumentiert).
  const nextUp = findNextUp(dailySchedule);

  // Kuratierte Karten (Spec-Iteration 2026-09-02): nur bei Aussage,
  // maximal drei, Prioritaet Auffaelligkeit > Lebensphase > Bestand.
  // Inhalte ausschliesslich aus bestehender Fachlogik.
  const curatedCards = React.useMemo(() => {
    const cards = [];

    const stack = analyzeStack(activeSupplements, activeLifeStageId);
    const overLimit = (stack.totals ?? []).filter(
      (entry) => entry.referenceCheck?.status === 'above_limit'
    );
    if (overLimit.length > 0) {
      cards.push({ key: 'stack', names: overLimit.map((entry) => entry.name) });
    }

    const advisoryHits = [];
    const seenSubstances = new Set();
    for (const supplement of activeSupplements) {
      for (const id of substanceIdsFromDetails(supplement.ingredientDetails)) {
        if (seenSubstances.has(id)) continue;
        seenSubstances.add(id);
        if (getAdvisories(id, activeLifeStageId).length > 0) {
          advisoryHits.push({ id, name: getSubstance(id)?.name ?? id });
        }
      }
    }
    if (advisoryHits.length > 0) {
      cards.push({ key: 'advisory', hits: advisoryHits });
    }

    const low = activeSupplements
      .map((supplement) => {
        const stock = stockBySupplementId?.[supplement.id];
        if (!stock) return null;
        const forecast = refillState(stock, supplement, refillThresholdDays);
        return forecast.due
          ? { name: formatSupplementName(supplement), daysLeft: forecast.daysLeft }
          : null;
      })
      .filter(Boolean);
    if (low.length > 0) {
      cards.push({ key: 'refill', items: low });
    }

    return cards.slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSupplements, stockBySupplementId, activeLifeStageId, refillThresholdDays]);

  function renderCuratedCard(card) {
    if (card.key === 'stack') {
      return (
        <TouchableOpacity
          key="curated-stack"
          style={[styles.curatedCard, { borderLeftColor: toneFor('notice').ink }]}
          onPress={() => router.push('/analysis')}
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <View style={styles.curatedTextWrap}>
            <Text style={styles.curatedTitle}>{t('dashboard.curated.stackTitle')}</Text>
            <Text style={styles.curatedText}>
              {t('dashboard.curated.stackText', { names: joinNames(card.names) })}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.inkFaint} />
        </TouchableOpacity>
      );
    }
    if (card.key === 'advisory') {
      return (
        <TouchableOpacity
          key="curated-advisory"
          style={[styles.curatedCard, { borderLeftColor: colors.accent }]}
          onPress={() => router.push(`/search?substance=${card.hits[0].id}`)}
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <View style={styles.curatedTextWrap}>
            <Text style={styles.curatedTitle}>{t('dashboard.curated.advisoryTitle')}</Text>
            <Text style={styles.curatedText}>
              {t('dashboard.curated.advisoryText', {
                names: joinNames(card.hits.map((hit) => hit.name)),
              })}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.inkFaint} />
        </TouchableOpacity>
      );
    }
    const minDays = Math.min(...card.items.map((item) => item.daysLeft));
    return (
      <TouchableOpacity
        key="curated-refill"
        style={[styles.curatedCard, { borderLeftColor: colors.ruleStrong }]}
        onPress={() => router.push('/inventory')}
        accessibilityRole="button"
        activeOpacity={0.7}
      >
        <View style={styles.curatedTextWrap}>
          <Text style={styles.curatedTitle}>{t('dashboard.curated.refillTitle')}</Text>
          <Text style={styles.curatedText}>
            {t('dashboard.curated.refillText', {
              names: joinNames(card.items.map((item) => item.name)),
              days: Number.isFinite(minDays) ? minDays : '?',
            })}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.inkFaint} />
      </TouchableOpacity>
    );
  }
  const duplicateGroups = getDuplicateGroups(activeSupplements, t);
  const duplicateSupplementsToArchive = duplicateGroups.reduce(
    (items, group) => [...items, ...group.duplicates],
    []
  );
  const duplicateEntryCount = duplicateSupplementsToArchive.length;
  const duplicateGroupNames = duplicateGroups.map((group) => group.name).join(', ');

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

  // Situative Hinweise in fester Reihenfolge; der erste wird zur Karte,
  // alle weiteren zur kompakten Zeile (Design-Review 02-D). Die Sperre
  // steht bewusst dabei: Wer gerade nichts dokumentieren kann, soll das
  // sehen, bevor die Checkliste einen Nehmen-Button anbietet.
  const situationalNotices = [
    lastRestore ? 'restored' : null,
    duplicateEntryCount > 0 ? 'cleanup' : null,
    blockerState.blocked ? 'blocker' : null,
    // Erinnerungen faktisch aus (Toggle aus ODER Systemerlaubnis fehlt),
    // obwohl Einnahmen geplant sind: Die App soll ans Nicht-Vergessen
    // erinnern koennen — der Weg dorthin darf nicht in Mehr verborgen
    // bleiben (Geraetetest 2026-09-02).
    progress.total > 0 && (!notificationsEnabled || !notificationPermission) ? 'reminders' : null,
  ].filter(Boolean);

  function renderSituationalNotice(kind, compact) {
    if (kind === 'restored') {
      if (compact) {
        return (
          <View key={kind} style={styles.compactNoticeRow}>
            <Text style={styles.compactNoticeText}>{t('dashboard.restored.title')}</Text>
            <TouchableOpacity
              onPress={dismissRestoreNotice}
              accessibilityRole="button"
              style={styles.compactNoticeAction}
            >
              <Text style={styles.compactNoticeActionText}>{t('dashboard.restored.dismiss')}</Text>
            </TouchableOpacity>
          </View>
        );
      }
      return (
        <View key={kind} style={styles.restoredCard}>
          <Text style={styles.restoredTitle}>{t('dashboard.restored.title')}</Text>
          <Text style={styles.restoredText}>
            {t('dashboard.restored.text', {
              time: formatBackupTime(lastRestore.exportedAt, language),
              device: lastRestore.deviceLabel,
              supplements: lastRestore.counts.supplements,
              labValues: lastRestore.counts.labValues,
            })}
          </Text>
          <TouchableOpacity
            onPress={dismissRestoreNotice}
            accessibilityRole="button"
            style={styles.restoredButton}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          >
            <Text style={styles.restoredButtonText}>{t('dashboard.restored.dismiss')}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (kind === 'cleanup') {
      if (compact) {
        return (
          <TouchableOpacity
            key={kind}
            style={styles.compactNoticeRow}
            onPress={handleArchiveDuplicateSupplements}
            accessibilityRole="button"
          >
            <Text style={styles.compactNoticeText}>{t('dashboard.cleanupTitle')}</Text>
            <Text style={styles.compactNoticeActionText}>{t('dashboard.cleanupButton')}</Text>
          </TouchableOpacity>
        );
      }
      return (
        <View key={kind} style={styles.cleanupCard}>
          <Text style={styles.cleanupTitle}>{t('dashboard.cleanupTitle')}</Text>
          <Text style={styles.cleanupText}>
            {t('dashboard.cleanupText', {
              label: getDuplicateCountLabel(duplicateEntryCount, t),
            })}
          </Text>
          {duplicateGroupNames ? (
            // Dynamic Type: kein numberOfLines-Limit, das nennt die
            // tatsaechlichen Praeparatnamen der Duplikate.
            <Text style={styles.cleanupMeta}>
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
      );
    }
    if (kind === 'reminders') {
      if (compact) {
        return (
          <TouchableOpacity
            key={kind}
            style={styles.compactNoticeRow}
            onPress={() => router.push('/notifications')}
            accessibilityRole="button"
          >
            <Text style={styles.compactNoticeText}>{t('dashboard.remindersOff.title')}</Text>
            <Text style={styles.compactNoticeActionText}>{t('dashboard.remindersOff.action')}</Text>
          </TouchableOpacity>
        );
      }
      return (
        <TouchableOpacity
          key={kind}
          style={styles.reminderCard}
          onPress={() => router.push('/notifications')}
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <View style={styles.reminderTextWrap}>
            <Text style={styles.reminderTitle}>{t('dashboard.remindersOff.title')}</Text>
            <Text style={styles.reminderText}>{t('dashboard.remindersOff.text')}</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.inkFaint} />
        </TouchableOpacity>
      );
    }
    // 'blocker': Absorptionssperre.
    if (compact) {
      return (
        <View key={kind} style={styles.compactNoticeRow}>
          <Feather name="clock" size={14} color={toneFor('notice').ink} />
          <Text style={[styles.compactNoticeText, styles.compactNoticeTextNotice]}>
            {getBlockMessage(blockerState.remainingMinutes)}
          </Text>
        </View>
      );
    }
    return (
      <View key={kind} style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>{t('dashboard.noticeTitle')}</Text>
        <Text style={styles.noticeText}>{getBlockMessage(blockerState.remainingMinutes)}</Text>
      </View>
    );
  }

  function handleUndo(supplement) {
    undoIntakeToday(supplement.id);
  }

  // Eine Checklisten-Zeile: Haken-Kreis, Name, optional Dosierung, und der
  // Nehmen-Button nur in der JETZT-Zeitgruppe. Dokumentierte Zeilen sind
  // durchgestrichen UND gedimmt UND tragen das gefuellte Haken-Icon, damit
  // der Status nie allein ueber Farbe transportiert wird (Bedienregeln).
  // Ohne eigenes Touchable fuer offene, nicht faellige Zeilen: Es gibt dort
  // nichts zu tippen, das ist keine vergessene Aktion.
  //
  // Info-Symbol (Finding Task B): Einnahme-Hinweise, Paar-Konflikte und
  // Synergien (SlotReason/ScheduleGuidance.js) waren mit der Buehne
  // komplett aus der App verschwunden, nicht nur versteckt. Die Zeile
  // bleibt kompakt (Bedienregel "Tiefe ist einen Tipp entfernt"): Nur wenn
  // ueberhaupt eine Erklaerung hinterlegt ist, erscheint ein Feather-
  // Info-Icon; Antippen klappt SlotReason darunter auf, inklusive des
  // "Verschieben"-Vorschlags bei alwaysSeparate-Konflikten.
  function renderChecklistRow(supplement, slotId, isNow) {
    const name = formatSupplementName(supplement);
    const dosage = formatSupplementDosage(supplement, '');
    const logged = supplement.logged;
    const RowWrap = logged ? TouchableOpacity : View;
    const rowWrapProps = logged
      ? {
          onPress: () => handleUndo(supplement),
          activeOpacity: 0.6,
          accessibilityRole: 'button',
          accessibilityLabel: `${t('dashboard.undo')}: ${name}`,
        }
      : {};

    const guidance = guidanceBySupplementId.get(supplement.id) ?? {
      notes: [],
      conflicts: [],
      synergies: [],
    };
    const hasGuidance =
      guidance.notes.length > 0 || guidance.conflicts.length > 0 || guidance.synergies.length > 0;
    const detailsExpanded = expandedNoteIds.has(supplement.id);

    return (
      <View key={supplement.id}>
        <RowWrap style={styles.row} {...rowWrapProps}>
          <Feather
            name={logged ? 'check-circle' : 'circle'}
            size={22}
            color={logged ? colors.affirm : colors.ruleStrong}
          />
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, logged && styles.rowTitleDone]}>{name}</Text>
            {dosage ? <Text style={[styles.rowSub, logged && styles.rowSubDone]}>{dosage}</Text> : null}
          </View>
          {hasGuidance ? (
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => toggleNoteExpanded(supplement.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={detailsExpanded ? t('dashboard.noteHide') : t('dashboard.noteShow')}
              // Tippflaeche 44 pt (CLAUDE.md Bedienregeln): hitSlop
              // allein reicht rechnerisch nicht.
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="info" size={18} color={colors.inkFaint} />
            </TouchableOpacity>
          ) : null}
          {isNow && !logged ? (
            <TouchableOpacity
              style={styles.nehmenButton}
              onPress={() => logIntake(supplement.id, { slotId })}
              accessibilityRole="button"
              accessibilityLabel={`${t('dashboard.logAction')}: ${name}`}
            >
              <Text style={styles.nehmenButtonText}>{t('dashboard.logAction')}</Text>
            </TouchableOpacity>
          ) : null}
        </RowWrap>
        {hasGuidance && detailsExpanded ? (
          <View style={styles.guidanceWrap}>
            <SlotReason
              guidance={guidance}
              onOpenSubstance={(substanceId) => router.push(`/search?substance=${substanceId}`)}
              onApplyMove={(conflict) => handleApplyMove(supplement, conflict)}
            />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.screenWrap}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + space.lg }]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('dashboard.title')}</Text>
          <Text style={styles.meta}>
            {progress.total > 0 ? (
              <>
                {headerMeta}{' · '}
                <Text style={styles.metaCount}>
                  {t('dashboard.takenCount', { done: progress.done, total: progress.total })}
                </Text>
              </>
            ) : (
              headerMeta
            )}
          </Text>
        </View>

        {/* Situative Hinweise (Design-Review 02-D): maximal EINE Karte,
            alles Weitere als kompakte Zeile — der Einstieg gehoert dem
            Arbeitsfluss, nicht einem Stapel Zustandskarten. */}
        {situationalNotices.map((kind, index) => renderSituationalNotice(kind, index > 0))}

        {fullInventoryCount === 0 ? <FirstStepsCard /> : null}

        {fullInventoryCount > 0 && visibleSchedule.length === 0 ? (
          <View style={styles.emptyRoutineCard}>
            <Text style={styles.emptyRoutineTitle}>{t('dashboard.timingIncompleteTitle')}</Text>
            <Text style={styles.emptyRoutineText}>{t('dashboard.timingIncompleteText')}</Text>
          </View>
        ) : null}

        {/* Checkliste (Redesign Phase 2, Task B): flache Zeitgruppen statt
            Als-Naechstes-Karte und Slot-Aufklapper. Jede Gruppe zeigt ALLE
            heutigen Eintraege des Slots, offen und dokumentiert; nur die
            JETZT-Gruppe (findNextUp) bekommt den Nehmen-Button. */}
        {fullInventoryCount > 0 && visibleSchedule.length > 0 ? (
          <View style={styles.checklist}>
            {visibleSchedule.map((item) => {
              const isNow = nextUp?.slot.id === item.slot.id;
              const alerts = alertsForSlot(item.slot.id);
              return (
                <View key={item.slot.id} style={styles.slotGroup}>
                  <Text style={[styles.slotLabel, isNow && styles.slotLabelNow]}>
                    {slotHeading(item.slot)}
                    {isNow ? t('dashboard.nowSuffix') : ''}
                  </Text>
                  {item.supplements.map((supplement) =>
                    renderChecklistRow(supplement, item.slot.id, isNow)
                  )}
                  {alerts ? (
                    <View style={styles.conflictNotice}>
                      {alerts.messages.map((message, index) => (
                        <Text
                          key={`${item.slot.id}-${index}`}
                          style={[styles.conflictText, index > 0 && styles.conflictTextSpacing]}
                        >
                          {message.message}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Kuratierte Karten (Spec-Iteration 2026-09-02): erscheinen nur,
            wenn sie etwas zu sagen haben — Auffaelligkeit, Lebensphase,
            Bestand knapp. Ziel ist immer der Ort mit der vollen Tiefe. */}
        {curatedCards.map((card) => renderCuratedCard(card))}

        {/* Verlauf-Einstieg (Spec-Iteration 2026-09-04): feste Zeile statt
            kuratierter Karte, da sie nicht von Auffaelligkeit abhaengt.
            Nur sichtbar, wenn es ueberhaupt etwas zu zeigen gibt (mind. ein
            Log ODER ein Praeparat im Bestand): eine brandneue Nutzerin ohne
            beides landete sonst von der Erste-Schritte-Karte direkt auf
            einem Verlauf mit "0 % Einnahme-Treue" und sieben leeren Balken
            (Review-Fund 2026-09-04, Inkonsistenz zu inventory.jsx's
            hasAnyRecords-Wache). */}
        {intakeLogs.length > 0 || fullInventoryCount > 0 ? (
          <TouchableOpacity
            style={styles.historyLink}
            onPress={() => router.push('/history')}
            activeOpacity={0.7}
            accessibilityRole="link"
          >
            <Feather name="bar-chart-2" size={18} color={colors.accent} />
            <Text style={styles.historyLinkText}>{t('dashboard.historyLink')}</Text>
            <Feather name="chevron-right" size={18} color={colors.inkFaint} />
          </TouchableOpacity>
        ) : null}

        {/* Kur-Pausen erscheinen als eigener Block statt still aus den Slots
            zu verschwinden: Wer heute nichts nimmt, soll sehen, warum. */}
        {pausedCures.length > 0 ? (
          <View style={styles.pausedCureCard}>
            <Text style={styles.pausedCureTitle}>{t('dashboard.curePausedTitle')}</Text>
            {pausedCures.map(({ supplement, statusLabel }) => (
              <View key={supplement.id} style={styles.pausedCureRow}>
                <Text style={styles.pausedCureName}>{formatSupplementName(supplement)}</Text>
                {statusLabel ? <Text style={styles.pausedCureStatus}>{statusLabel}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Zugang zum vollstaendigen Bestand: Der Tagesplan zeigt zuerst,
            was heute ansteht — wer ein Praeparat ohne Einnahmezeitpunkt
            angelegt hat, findet es hier trotzdem. */}
        <TouchableOpacity
          style={styles.inventoryRow}
          onPress={() => router.push('/inventory')}
          activeOpacity={0.7}
          accessibilityRole="link"
        >
          <View style={styles.inventoryTextWrap}>
            <Text style={styles.inventoryTitle}>{t('dashboard.inventoryLabel')}</Text>
            <Text style={styles.inventorySub}>
              {fullInventoryCount === 1
                ? t('dashboard.inventoryCount_one')
                : t('dashboard.inventoryCount_other', { count: fullInventoryCount })}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.inkFaint} />
        </TouchableOpacity>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>{t('dashboard.disclaimer')}</Text>
        </View>
      </ScrollView>
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
  title: { ...type.display },
  meta: {
    marginTop: space.sm,
    ...type.small,
  },
  metaCount: {
    ...type.small,
    fontWeight: '600',
    color: colors.ink,
  },
  // Checkliste (Redesign Phase 2, Task B): flache Zeitgruppen mit
  // Mono-Eyebrow-Label, keine Karten-Umrandung je Gruppe, harte Haarlinie
  // je Zeile (Website-Look statt Karten-Stapel).
  checklist: {
    marginBottom: space.md,
  },
  slotGroup: {
    marginBottom: space.lg,
  },
  slotLabel: {
    ...type.eyebrow,
    marginBottom: space.sm,
  },
  slotLabelNow: {
    ...type.eyebrowAccent,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 44,
    paddingVertical: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    ...type.bodyStrong,
    fontSize: 16,
    lineHeight: 21,
  },
  rowTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.inkFaint,
  },
  rowSub: {
    marginTop: 2,
    ...type.small,
  },
  rowSubDone: {
    color: colors.inkFaint,
  },
  // Info-Icon fuer den SlotReason-Aufklapper (Finding Task B): kein Ersatz
  // fuer eine eigene Karte, nur ein leiser Hinweis, dass es zu diesem
  // Praeparat eine belegte Erklaerung gibt.
  infoButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidanceWrap: {
    marginLeft: 34,
    paddingBottom: space.sm,
  },
  nehmenButton: {
    ...surfaces.buttonPrimary,
    minHeight: 44,
    paddingHorizontal: space.lg,
  },
  nehmenButtonText: {
    ...surfaces.buttonPrimaryText,
    fontSize: 15,
  },
  // Slot-Konflikt-Hinweise (ConflictLogic.js), jetzt unter der jeweiligen
  // Zeitgruppe statt in einer eigenen Sektion am Seitenende.
  conflictNotice: {
    marginTop: space.sm,
    borderRadius: radius.md,
    backgroundColor: toneFor('notice').surface,
    borderWidth: 1,
    borderColor: toneFor('notice').rule,
    padding: space.md,
  },
  conflictText: {
    ...type.small,
    color: toneFor('notice').ink,
  },
  conflictTextSpacing: {
    marginTop: space.xs,
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
  // Bestand als normale weisse Listenzeile (Design-Review 02-D): kein
  // Farbteppich mehr, der Feather-Chevron ersetzt das Text-Zeichen.
  inventoryRow: {
    ...surfaces.card,
    marginTop: space.md,
    marginBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 48,
  },
  inventoryTextWrap: { flex: 1 },
  inventoryTitle: {
    ...type.bodyStrong,
  },
  inventorySub: {
    ...type.small,
    marginTop: 2,
  },
  // Verlauf-Einstieg (Spec-Iteration 2026-09-04): feste Zeile, keine
  // kuratierte Karte, deshalb kein surfaces.card-Rahmen.
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 44,
    paddingVertical: space.sm,
    marginBottom: space.md,
  },
  historyLinkText: {
    ...type.body,
    flex: 1,
    color: colors.accent,
  },
  cleanupCard: {
    marginTop: space.xs,
    ...surfaces.card,
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
    // Tippflaeche 44 pt (CLAUDE.md Bedienregeln).
    minHeight: 44,
    justifyContent: 'center',
  },
  cleanupButtonText: {
    ...surfaces.buttonPrimaryText,
  },
  // Kompakte Zeile fuer nachrangige situative Hinweise (Design-Review 02-D).
  compactNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 44,
    marginBottom: space.sm,
  },
  compactNoticeText: {
    ...type.small,
    flex: 1,
  },
  compactNoticeTextNotice: {
    color: toneFor('notice').ink,
  },
  compactNoticeAction: {
    minHeight: 44,
    justifyContent: 'center',
  },
  compactNoticeActionText: {
    ...type.small,
    color: colors.accent,
  },
  // Erinnerungen-aus-Hinweis: normale Karte, ganze Flaeche tappbar.
  reminderCard: {
    ...surfaces.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  reminderTextWrap: { flex: 1 },
  reminderTitle: {
    ...type.bodyStrong,
  },
  reminderText: {
    ...type.small,
    marginTop: space.xs,
  },
  restoredCard: { ...surfaces.card, backgroundColor: colors.affirmSoft, padding: space.lg, marginBottom: space.lg },
  restoredTitle: { ...type.bodyStrong, color: colors.affirm },
  restoredText: { ...type.small, marginTop: space.xs },
  restoredButton: { alignSelf: 'flex-start', marginTop: space.sm },
  restoredButtonText: { ...type.small, color: colors.accent },
  // Kuratierte Karten (Spec-Iteration 2026-09-02).
  curatedCard: {
    ...surfaces.card,
    borderLeftWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  curatedTextWrap: { flex: 1 },
  curatedTitle: {
    ...type.bodyStrong,
  },
  curatedText: {
    ...type.small,
    marginTop: space.xs,
  },
  emptyRoutineCard: {
    ...surfaces.card,
    padding: space.lg,
  },
  emptyRoutineTitle: {
    ...type.subheading,
    marginBottom: space.sm,
  },
  emptyRoutineText: {
    ...type.body,
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
