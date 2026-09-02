import React from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, onDark, radius, space, surfaces, toneFor, type, weight } from '../../../theme';

import { getBlockMessage, isBlocked } from '../../../AbsorptionBlocker';
import { checkAllConflictsForSlot } from '../../../ConflictLogic';
import { formatBackupTime } from '../../../CloudBackup';
import { buildEntryGuidance } from '../../../ScheduleGuidance';
import { countOpen, findNextUp } from '../../../NextUp';
import { analyzeStack } from '../../../StackAnalyzer';
import { refillState } from '../../../StockForecast';
import { substanceIdsFromDetails } from '../../../SlotSuggestion';
import { getAdvisories } from '../../../data/lifeStageAdvisories';
import { getSubstance } from '../../../data/substances';
import DayArc from '../../../components/DayArc';
import FirstStepsCard from '../../../components/FirstStepsCard';
import Pictogram, { formForUnit } from '../../../components/Pictogram';
import ProductThumb from '../../../components/ProductThumb';
import SlotReason from '../../../components/SlotReason';
import { useTranslation } from '../../../i18n';
import useCloudBackupStore from '../../../useCloudBackupStore';
import useNotificationStore from '../../../useNotificationStore';
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

// Uhrzeit einer dokumentierten Einnahme fuer die Zeile "Dokumentiert um
// HH:MM". Ohne lesbaren Zeitstempel liefert sie null, die Zeile faellt
// dann auf den Text ohne Uhrzeit zurueck.
function formatLoggedTime(takenAt, language) {
  if (!takenAt) return null;
  const date = new Date(takenAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
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
  // Kennzahlen (summaryCard, metricGrid) stehen hinter einem Aufklapper
  // (Spec Entscheidung 3): Standard eingeklappt, damit die erste Flaeche
  // der Arbeitsfluss bleibt, nicht die Zahlenwand.
  const [summaryOpen, setSummaryOpen] = React.useState(false);
  // Slot-Liste eine Ebene tiefer (Spec-Iteration 2026-09-02): Standard zu.
  const [slotsOpen, setSlotsOpen] = React.useState(false);
  const insets = useSafeAreaInsets();
  const scrollRef = React.useRef(null);
  // Ziel-Positionen der Slot-Karten fuer den Sprung vom Tagesbogen.
  const slotPositionsRef = React.useRef({});

  // Heller Statusbar-Text, solange dieser Screen fokussiert ist — die
  // Petrol-Buehne liegt unter der Statusleiste. Beim Verlassen zurueck.
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle('light-content');
      return () => StatusBar.setBarStyle('dark-content');
    }, [])
  );

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
  const getPausedCuresToday = useStore((state) => state.getPausedCuresToday);
  const logIntake = useStore((state) => state.logIntake);
  const undoIntakeToday = useStore((state) => state.undoIntakeToday);
  const archiveUserSupplement = useStore((state) => state.archiveUserSupplement);
  const getStock = useStore((state) => state.getStock);
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
  const headerMeta = `${formatHeaderDate(language)} · ${t('dashboard.profileLabel', {
    profile: getProfileLabel(activeProfileId, t),
  })}`;
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
  // Regeln (Einnahme-Hinweise, Paar-Konflikte, Synergien). Die Map wird
  // bei der ueblichen Bestandsgroesse (einstellig bis niedrig
  // zweistellig) bei jedem Render neu berechnet, weil activeSupplements
  // selbst jedes Mal ein neues Array ist -- bei dieser Groessenordnung
  // unproblematisch.
  const guidanceBySupplementId = React.useMemo(() => {
    const map = new Map();
    for (const supplement of activeSupplements) {
      map.set(supplement.id, buildEntryGuidance(supplement, activeSupplements));
    }
    return map;
  }, [activeSupplements]);
  // Arbeitsfluss statt Kennzahlen-Wand (Spec Entscheidung 3): erste Flaeche
  // beantwortet "Was nehme ich als Naechstes?", nicht "Wie viel Prozent?".
  const nextUp = findNextUp(dailySchedule);
  const openTotal = countOpen(dailySchedule);
  // Tagesbogen (DayArc): Slot-Status aus dem Tagesplan — done, wenn alles
  // im Slot dokumentiert ist, next fuer den Als-Naechstes-Slot, sonst later.
  const arcSlots = visibleSchedule.map((item) => ({
    id: item.slot.id,
    time: item.slot.time,
    label: item.slot.label,
    status: item.supplements.every((supplement) => supplement.logged)
      ? 'done'
      : item.slot.id === nextUp?.slot.id
        ? 'next'
        : 'later',
  }));
  const arcStatusLabels = {
    done: t('dashboard.arc.done'),
    next: t('dashboard.arc.next'),
    later: t('dashboard.arc.later'),
  };

  const restSlots = visibleSchedule.filter((item) => item.slot.id !== nextUp?.slot.id);
  const restCount = restSlots.reduce((sum, item) => sum + item.supplements.length, 0);

  function scrollToSlot(slotId) {
    const jump = () => {
      const y = slotPositionsRef.current[slotId];
      if (typeof y === 'number' && scrollRef.current) {
        scrollRef.current.scrollTo({ y: Math.max(0, y - space.md), animated: true });
      }
    };
    if (slotId !== nextUp?.slot.id && !slotsOpen) {
      // Slots erst aufklappen, dann springen: Die Zielposition entsteht
      // erst im Layout nach dem Aufklappen.
      setSlotsOpen(true);
      setTimeout(jump, 300);
      return;
    }
    jump();
  }

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
  // sehen, bevor die Als-Naechstes-Karte einen Knopf anbietet.
  const situationalNotices = [
    lastRestore ? 'restored' : null,
    duplicateEntryCount > 0 ? 'cleanup' : null,
    blockerState.blocked ? 'blocker' : null,
    // Erinnerungen faktisch aus (Toggle aus ODER Systemerlaubnis fehlt),
    // obwohl Einnahmen geplant sind: Die App soll ans Nicht-Vergessen
    // erinnern koennen — der Weg dorthin darf nicht in Mehr verborgen
    // bleiben (Geraetetest 2026-09-02).
    scheduledToday > 0 && (!notificationsEnabled || !notificationPermission)
      ? 'reminders'
      : null,
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

  // Eine Eintrags-Zeile der Routine, unveraendert aus der Slot-Schleife
  // gezogen, damit die Als-Naechstes-Karte und die Slot-Karten dieselbe
  // Darstellung und dieselben Handler nutzen (kein zweiter Anzeigepfad).
  // slotId separat statt aus item.slot.id im Closure, weil diese Funktion
  // jetzt aus zwei Kontexten aufgerufen wird (Als-Naechstes-Karte, Slot-Schleife).
  function renderSupplementRow(supplement, slotId, hero = false) {
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
    // Weniger Text je Praeparat (Geraetetest 02.09.): In den Listen-
    // zeilen steht eingeklappt nur der Name — Dosierung, Zweck,
    // Zeitpunkt, Bestand und Erklaerungen liegen hinter dem Aufklapper
    // (eine Ebene, Spec-konform). Die Als-Naechstes-Karte (hero) zeigt
    // weiterhin alles: Dort faellt die Entscheidung.
    const showDepth = hero || detailsExpanded;
    const hasTruncatedMeta = supplementMeta.length > 42;
    const canExpandDetails = hero
      ? Boolean(supplementNotes) || hasTruncatedMeta
      : Boolean(
          supplementMeta ||
            supplementNotes ||
            supplementTiming ||
            stock?.currentUnits !== undefined
        );

    const loggedTime = supplement.logged
      ? formatLoggedTime(
          loggedToday.find((log) => log.userSupplementId === supplement.id)?.takenAt,
          language
        )
      : null;

    return (
      <View key={supplement.id} style={styles.supplementCard}>
        {/* Die ganze Textflaeche fuehrt zum Bearbeiten (Design-Review 02-B).
            Entfernen lebt eine Ebene tiefer im Bestand (inventory.jsx) —
            Spec-konform: Tiefe ist einen Tipp entfernt. Verschachtelte
            Touchables (Details-Schalter, SlotReason-Quellen) gewinnen den
            Tipp gegen die Flaeche. */}
        <TouchableOpacity
          style={styles.supplementTextWrap}
          onPress={() => router.push(`/AddSupplement?editId=${encodeURIComponent(supplement.id)}`)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${t('dashboard.edit')}: ${supplementName}`}
        >
          {/* Piktogramm je Zeile, Produkt-Vignette auf der Als-Naechstes-
              Karte (Design-Review 02-G/03). */}
          <View style={styles.rowLayout}>
          {hero ? (
            <ProductThumb supplement={routineSupplement} size={52} />
          ) : (
            <View style={styles.rowPictogramWrap}>
              <Pictogram form={formForUnit(routineSupplement.unit)} size={20} />
            </View>
          )}
          <View style={styles.rowBody}>
          <View style={styles.supplementHeaderRow}>
            <Text style={styles.supplementName}>{supplementName}</Text>
            <Feather name="chevron-right" size={18} color={colors.inkFaint} />
          </View>
          {showDepth && supplementMeta ? (
            <Text
              style={styles.supplementMeta}
              numberOfLines={detailsExpanded ? undefined : 1}
            >
              {supplementMeta}
            </Text>
          ) : null}

          {showDepth ? (
          <SlotReason
            guidance={
              guidanceBySupplementId.get(supplement.id) ?? {
                notes: [],
                conflicts: [],
                synergies: [],
              }
            }
            onOpenSubstance={(substanceId) =>
              router.push(`/search?substance=${substanceId}`)
            }
          />
          ) : null}

          {showDepth && stock?.currentUnits !== undefined ? (
            <Text style={styles.noteText}>
              {t('dashboard.stockNote', {
                amount: stock.currentUnits,
                unit: stock.unit || t('dashboard.stockUnitFallback'),
              })}
            </Text>
          ) : null}

          {showDepth && supplementTiming ? (
            <View style={styles.timingRow}>
              <Feather name="clock" size={14} color={colors.inkMuted} />
              <Text style={styles.timingText}>{supplementTiming}</Text>
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
              style={styles.noteToggleButton}
              // Tippflaeche 44 pt (CLAUDE.md Bedienregeln): hitSlop
              // allein reichte rechnerisch nicht.
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
          </View>
        </TouchableOpacity>

        {/* EINE Aktion pro Eintrag (Design-Review 02-B): offen = ein Button
            in voller Kartenbreite, dokumentiert = Haken + Uhrzeit +
            Rueckgaengig. Status steckt in Button bzw. Haken+Text, die
            fruehere OFFEN/DOKUMENTIERT-Pille ist damit Doppelung. */}
        {supplement.logged ? (
          <View style={styles.loggedRow}>
            <Feather name="check-circle" size={16} color={colors.affirm} />
            <Text style={styles.loggedText}>
              {loggedTime
                ? t('dashboard.loggedAtTime', { time: loggedTime })
                : t('dashboard.stateLogged')}
            </Text>
            <TouchableOpacity
              style={styles.undoButton}
              onPress={() => undoIntakeToday(supplement.id)}
              accessibilityRole="button"
            >
              <Text style={styles.undoButtonText}>{t('dashboard.undo')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.logButton}
            onPress={() => logIntake(supplement.id, { slotId })}
            accessibilityRole="button"
          >
            <Text style={styles.logButtonText}>{t('dashboard.logAction')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.screenWrap}>
      <ScrollView ref={scrollRef} style={styles.screen} contentContainerStyle={styles.content}>
      {/* Petrol-Buehne (Design-Review 02-F): dunkler Kopf mit Titel, Datum,
          Fortschritt und Tagesbogen. Voll-Bleed ueber negative Raender, die
          Safe Area uebernimmt der Screen selbst (nativer Header ist hier
          abgeschaltet). bounceFill faengt den iOS-Bounce oben in Petrol ab. */}
      <View style={styles.bounceFill} />
      <View style={[styles.stage, { paddingTop: insets.top + space.md }]}>
        <View style={styles.stageTopRow}>
          <View style={styles.stageTextWrap}>
            <Text style={styles.stageTitle}>{t('dashboard.title')}</Text>
            <Text style={styles.stageMeta}>{headerMeta}</Text>
            {scheduledToday > 0 ? (
              <Text style={styles.stageProgress}>
                {t('dashboard.summaryLine', { done: progress.done, total: progress.total })}
              </Text>
            ) : null}
          </View>
          {arcSlots.length > 0 ? (
            <DayArc slots={arcSlots} onPressSlot={scrollToSlot} statusLabels={arcStatusLabels} />
          ) : null}
        </View>
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

      {/* Arbeitsfluss statt Kennzahlen-Wand (Spec Entscheidung 3): die
          erste Flaeche beantwortet "Was nehme ich als Naechstes?". Zusaetzlich
          an visibleSchedule.length > 0 gebunden: Bei unvollstaendigem Timing
          spricht allein die emptyRoutineCard oben, sonst widerspricht sich
          der gruene "nichts geplant"-Haken mit dem Timing-Hinweis. */}
      {fullInventoryCount > 0 && visibleSchedule.length > 0 ? (
        nextUp ? (
          <View
            style={styles.nextUpCard}
            onLayout={(event) => {
              slotPositionsRef.current[nextUp.slot.id] = event.nativeEvent.layout.y;
            }}
          >
            <View style={styles.nextUpHeaderRow}>
              <Text style={styles.nextUpKicker}>
                {`${t('dashboard.nextUp.title')} · ${nextUp.slot.label}`}
              </Text>
              <Text style={styles.nextUpTime}>{nextUp.slot.time}</Text>
            </View>
            {nextUp.supplements.map((supplement) =>
              renderSupplementRow(supplement, nextUp.slot.id, true)
            )}
            {openTotal > nextUp.openCount ? (
              <Text style={styles.nextUpRemaining}>
                {t('dashboard.nextUp.remaining', { count: openTotal - nextUp.openCount })}
              </Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.nextUpCardDone}>
            <Feather name="check-circle" size={18} color={colors.affirm} />
            <Text style={styles.nextUpDoneText}>
              {t(scheduledToday > 0 ? 'dashboard.nextUp.allDone' : 'dashboard.nextUp.nothingPlanned')}
            </Text>
          </View>
        )
      ) : null}

      {/* Kennzahlen (Fortschritt, Prozent, Insight) hinter einer Zeile mit
          Aufklapper (Spec Entscheidung 3): Der Arbeitsfluss oben beantwortet
          "was jetzt", die Zahlen hier sind Kontext, kein Einstieg. */}
      {/* Fortschritt als Segment-Balken (Design-Review 02-G): ein Segment
          je geplanter Einnahme, gefuellt = dokumentiert. Die Textzeile
          darunter ist Pflicht — Status nie nur ueber Farbe. */}
      {fullInventoryCount > 0 && scheduledToday > 0 ? (
        <View style={styles.progressBlock}>
          <View style={styles.segmentRow}>
            {Array.from({ length: progress.total }, (_, index) => (
              <View
                key={index}
                style={[styles.segment, index < progress.done && styles.segmentFilled]}
              />
            ))}
          </View>
          <View style={styles.progressMetaRow}>
            <Text style={styles.progressMetaText}>
              {nextUp
                ? `${t('dashboard.summaryLine', { done: progress.done, total: progress.total })} · ${t('dashboard.nextUpAt', { time: nextUp.slot.time })}`
                : t('dashboard.summaryLine', { done: progress.done, total: progress.total })}
            </Text>
            <TouchableOpacity
              onPress={() => setSummaryOpen((value) => !value)}
              accessibilityRole="button"
              accessibilityState={{ expanded: summaryOpen }}
              style={styles.summaryToggle}
            >
              <Text style={styles.summaryToggleText}>
                {t(summaryOpen ? 'dashboard.summaryDetailsHide' : 'dashboard.summaryDetailsShow')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {summaryOpen ? (
        <>
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
              <Text style={styles.summaryInsightLabel}>{routineInsight.label}</Text>
              <Text style={styles.summaryInsightText}>{routineInsight.text}</Text>
            </View>

            <Text style={styles.lastActivity}>{formatLastLogged(lastLoggedAt, t, language)}</Text>
          </View>

          {/* Kacheln sind tappbar (Geraetetest 02.09.): jede fuehrt zu
              ihrem Ort — Bestand, Tagesplan-Slots, Verlauf, naechster
              offener Slot. */}
          <View style={styles.metricGrid}>
            <MetricCard
              label={t('dashboard.metricActiveRoutine')}
              value={String(fullInventoryCount)}
              onPress={() => router.push('/inventory')}
            />
            <MetricCard
              label={t('dashboard.metricScheduledToday')}
              value={String(scheduledToday)}
              onPress={
                visibleSchedule.length > 0
                  ? () => scrollToSlot(visibleSchedule[0].slot.id)
                  : undefined
              }
            />
            <MetricCard
              label={t('dashboard.metricLogged')}
              value={String(progress.done)}
              onPress={() => router.push('/history')}
            />
            <MetricCard
              label={t('dashboard.metricPending')}
              value={String(pendingToday)}
              onPress={nextUp ? () => scrollToSlot(nextUp.slot.id) : undefined}
            />
          </View>
        </>
      ) : null}

      {/* Kuratierte Karten (Spec-Iteration 2026-09-02): erscheinen nur,
          wenn sie etwas zu sagen haben — Auffaelligkeit, Lebensphase,
          Bestand knapp. Ziel ist immer der Ort mit der vollen Tiefe. */}
      {curatedCards.map((card) => renderCuratedCard(card))}

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

      {/* Slot-Liste eine Ebene tiefer (Spec-Iteration 2026-09-02): der
          Als-Naechstes-Slot steht oben in der Karte, der Rest liegt
          hinter diesem Aufklapper. */}
      {fullInventoryCount > 0 && restSlots.length > 0 ? (
        <TouchableOpacity
          style={styles.slotsToggleRow}
          onPress={() => setSlotsOpen((value) => !value)}
          accessibilityRole="button"
          accessibilityState={{ expanded: slotsOpen }}
        >
          <Text style={styles.slotsToggleTitle}>
            {t('dashboard.allTodayTitle', { count: restCount })}
          </Text>
          <Feather
            name={slotsOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.inkFaint}
          />
        </TouchableOpacity>
      ) : null}

      {slotsOpen && fullInventoryCount > 0 ? restSlots
        .map((item) => (
        <View
          key={item.slot.id}
          style={styles.slotCard}
          onLayout={(event) => {
            slotPositionsRef.current[item.slot.id] = event.nativeEvent.layout.y;
          }}
        >
          <View style={styles.slotHeader}>
            <View style={styles.slotHeaderText}>
              <Text style={styles.slotTitle}>{item.slot.label}</Text>
              <Text style={styles.slotTime}>
                {`${item.slot.time} · ${getSlotCountLabel(item.supplements.length, t)}`}
              </Text>
            </View>
          </View>

          {item.supplements.length === 0 ? (
            <View style={styles.emptySlot}>
              <Text style={styles.emptyText}>{t('dashboard.emptySlotText')}</Text>
            </View>
          ) : (
            item.supplements.map((supplement) => renderSupplementRow(supplement, item.slot.id))
          )}
        </View>
      )) : null}

      {/* Zugang zum vollstaendigen Bestand, unter den Slots statt darueber:
          Der Tagesplan zeigt zuerst, was heute ansteht — wer ein Praeparat
          ohne Einnahmezeitpunkt angelegt hat, findet es hier trotzdem. */}
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

      {/* Pruefhinweise nur, wenn es welche gibt (Design-Review 02-D):
          kein Dauer-Gruen — die Abwesenheit von Hinweisen braucht keine
          eigene Karte. */}
      {slotAlerts.length > 0 ? (
        <>
          <SectionHeading
            title={t('dashboard.sectionAlertsTitle')}
            subtitle={t('dashboard.sectionAlertsSubtitle')}
          />

          {slotAlerts.map((group) => (
            <View key={group.slot.id} style={styles.infoCard}>
              <Text style={styles.infoTitle}>{group.slot.label}</Text>
              {group.messages.map((message, index) => (
                <Text key={`${group.slot.id}-${index}`} style={styles.infoText}>
                  {message.message}
                </Text>
              ))}
            </View>
          ))}
        </>
      ) : null}

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

function MetricCard({ label, value, onPress }) {
  return (
    <TouchableOpacity
      style={styles.metricCard}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `${label}: ${value}` : undefined}
    >
      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{value}</Text>
        {onPress ? (
          <Feather name="chevron-right" size={16} color={colors.inkFaint} />
        ) : null}
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
    </TouchableOpacity>
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
  // Petrol-Buehne (Design-Review 02-F): Voll-Bleed ueber negative Raender
  // gegen das Content-Padding, unten -28, damit die erste Karte hineinragt.
  bounceFill: {
    position: 'absolute',
    top: -600,
    left: 0,
    right: 0,
    height: 600,
    backgroundColor: colors.accentInk,
  },
  stage: {
    marginTop: -space.lg,
    marginHorizontal: -space.lg,
    marginBottom: -28,
    paddingHorizontal: space.lg,
    paddingBottom: 28 + space.xl,
    backgroundColor: colors.accentInk,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  stageTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space.md,
  },
  stageTextWrap: { flex: 1 },
  stageTitle: { ...type.display, color: onDark.ink },
  stageMeta: { marginTop: space.sm, ...type.small, color: onDark.inkMuted },
  stageProgress: {
    marginTop: space.md,
    ...type.subheading,
    color: onDark.ink,
    fontVariant: ['tabular-nums'],
  },
  // Als-Naechstes-Karte (Spec Entscheidung 3): erste Routine-Flaeche,
  // beantwortet den Arbeitsfluss statt einer Kennzahl. Ohne Rahmen; der
  // weiche Schatten traegt das Hineinragen in die Buehne.
  nextUpCard: {
    ...surfaces.card,
    padding: space.lg,
    marginBottom: space.lg,
    shadowColor: colors.accentInk,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nextUpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.sm,
  },
  nextUpKicker: { ...type.eyebrow, color: colors.accent, flex: 1 },
  nextUpTime: { ...type.small, fontVariant: ['tabular-nums'] },
  nextUpRemaining: { ...type.small, marginTop: space.sm },
  nextUpCardDone: { ...surfaces.card, padding: space.lg, marginBottom: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  nextUpDoneText: { ...type.bodyStrong, color: colors.affirm },
  // Fortschritts-Balken mit Aufklapper (Design-Review 02-G): ersetzt die
  // Kennzahlen-Zeile im Immer-Sichtbaren.
  progressBlock: {
    marginBottom: space.md,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 8,
    backgroundColor: colors.rule,
  },
  segmentFilled: {
    backgroundColor: colors.accent,
  },
  progressMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  progressMetaText: {
    ...type.tiny,
    flexShrink: 1,
  },
  // Tippflaeche 44 pt (CLAUDE.md Bedienregeln).
  summaryToggle: {
    minHeight: 44,
    justifyContent: 'center',
  },
  summaryToggleText: {
    ...type.small,
    color: colors.accent,
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
  // Versal-Micro-Pille abgeschafft (Design-Review 01): type.eyebrow bleibt
  // das einzige Versal-Element, Labels sind normale Textzeilen.
  summaryInsightLabel: {
    ...type.small,
    fontWeight: weight.semibold,
    color: colors.ink,
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
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  // Aufklapp-Zeile der Slot-Liste.
  slotsToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    marginTop: space.md,
    marginBottom: space.sm,
  },
  slotsToggleTitle: {
    ...type.heading,
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
  // Eintrag als Spalte (Design-Review 02-B): Textflaeche oben, EINE
  // Aktion in voller Breite darunter — statt der 116-pt-Buttonspalte.
  supplementCard: {
    paddingTop: space.md,
    marginTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  supplementTextWrap: {
    minHeight: 44,
  },
  rowLayout: {
    flexDirection: 'row',
    gap: space.md,
  },
  rowPictogramWrap: {
    marginTop: 1,
  },
  rowBody: {
    flex: 1,
  },
  supplementHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  // Einnahmezeitpunkt als normale Textzeile mit Uhr-Icon statt Versal-Pille
  // (Design-Review 02-C).
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    marginTop: space.sm,
  },
  timingText: {
    ...type.small,
  },
  // Tippflaeche 44 pt (CLAUDE.md Bedienregeln): traegt den TouchableOpacity
  // von der noteText/noteToggle-Umschaltflaeche.
  noteToggleButton: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  noteToggle: {
    marginTop: space.sm,
    ...type.small,
    color: colors.accent,
  },
  // EINE Aktion pro Eintrag (Design-Review 02-B).
  logButton: {
    ...surfaces.buttonPrimary,
    marginTop: space.md,
  },
  logButtonText: {
    ...surfaces.buttonPrimaryText,
  },
  loggedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.sm,
    minHeight: 44,
  },
  loggedText: {
    ...type.small,
    color: colors.affirm,
    flex: 1,
  },
  undoButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: space.sm,
  },
  undoButtonText: {
    ...type.small,
    color: colors.accent,
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
