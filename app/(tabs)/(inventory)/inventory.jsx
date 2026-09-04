import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import AddSupplementChooser from '../../../components/AddSupplementChooser';
import AddSupplementSheet from '../../../components/AddSupplementSheet';
import { SLOTS } from '../../../TimingEngine';
import { refillState } from '../../../StockForecast';
import useStore from '../../../useStore';
import useNotificationStore from '../../../useNotificationStore';
import {
  formatSupplementDosage,
  formatSupplementName,
} from '../../../utils/supplementFormatting';
import { useTranslation } from '../../../i18n';
import { colors, radius, space, surfaces, toneFor, type } from '../../../theme';

/**
 * Mein Bestand
 *
 * WARUM ES DIESEN SCREEN GIBT:
 * Angelegte Praeparate waren bisher nur ueber den Tagesplan zu sehen — und
 * der zeigt sie nach Einnahmezeitpunkt sortiert. Wer keinen Zeitpunkt
 * gewaehlt hat, dessen Praeparat tauchte NIRGENDS auf, obwohl es
 * gespeichert war. Genau das ist im Geraetetest passiert.
 *
 * Dieser Screen ist deshalb die vollstaendige Liste: alles, was angelegt
 * wurde, unabhaengig von Zeitpunkt, Kur-Pause oder Tagesplan. Er sortiert
 * die Eintraege ohne Zeitpunkt nach oben und benennt den Grund, statt sie
 * still verschwinden zu lassen.
 *
 * PHASE 2 DER WEBSITE-ANGLEICHUNG: kompakte Zeilen statt grosser Karten
 * (eine gruppierte Liste im iOS-Einstellungen-Muster, siehe
 * surfaces.listGroup/listDivider in theme.js). Antippen einer Zeile
 * oeffnet direkt das Bearbeiten, darunter bleibt eine kompakte
 * Aktionsleiste fuer Pausieren/Archivieren bzw. Wiederherstellen, weil
 * der Bearbeiten-Screen (AddSupplement.jsx) nicht Teil dieser Aenderung
 * ist und diese Aktionen sonst nirgends erreichbar waeren.
 */

const cautionTone = toneFor('caution');

function matchesQuery(supplement, needle) {
  if (!needle) return true;
  const haystack = [
    supplement?.name,
    supplement?.purpose,
    supplement?.category,
    supplement?.notes,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}

export default function InventoryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [filter, setFilter] = useState('active'); // 'active' | 'archived'

  const userSupplements = useStore((state) => state.userSupplements);
  const archiveUserSupplement = useStore((state) => state.archiveUserSupplement);
  const updateUserSupplement = useStore((state) => state.updateUserSupplement);
  const stockBySupplementId = useStore((state) => state.stockBySupplementId);
  const refillThresholdDays = useNotificationStore((state) => state.refillThresholdDays);

  const needle = query.trim().toLowerCase();

  const { active, archived, withoutSlot } = useMemo(() => {
    const all = Array.isArray(userSupplements) ? userSupplements : [];
    const matching = all.filter((supplement) => matchesQuery(supplement, needle));

    const notArchived = matching.filter((s) => s.status !== 'archived');
    const missingSlot = notArchived.filter(
      (s) => !Array.isArray(s.timingSlots) || s.timingSlots.length === 0
    );

    // Eintraege ohne Einnahmezeitpunkt zuerst: Sie fehlen im Tagesplan und
    // sind der haeufigste Grund, ein Praeparat "verloren" zu glauben.
    const sorted = [...notArchived].sort((a, b) => {
      const aMissing = !a.timingSlots?.length;
      const bMissing = !b.timingSlots?.length;
      if (aMissing !== bMissing) return aMissing ? -1 : 1;
      return formatSupplementName(a, '').localeCompare(formatSupplementName(b, ''));
    });

    return {
      active: sorted,
      archived: matching.filter((s) => s.status === 'archived'),
      withoutSlot: missingSlot.length,
    };
  }, [userSupplements, needle]);

  const totalCount = (Array.isArray(userSupplements) ? userSupplements : []).filter(
    (s) => s.status !== 'archived'
  ).length;

  // Ob es ueberhaupt etwas anzulegen gibt, unabhaengig von der Suche: nur
  // dann lohnen sich die Filterchips. `totalCount` allein reicht nicht, das
  // zaehlt nur Aktive, ein Bestand nur aus Archiv-Eintraegen waere sonst
  // "leer".
  const hasAnyRecords = (Array.isArray(userSupplements) ? userSupplements : []).length > 0;

  function handleRestore(supplement) {
    updateUserSupplement(supplement.id, { status: 'active' });
  }

  function handleArchive(supplement) {
    Alert.alert(
      t('inventory.archiveTitle'),
      t('inventory.archiveMessage', { name: formatSupplementName(supplement) }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('inventory.archiveConfirm'),
          style: 'destructive',
          onPress: () => archiveUserSupplement(supplement.id),
        },
      ]
    );
  }

  function goToEdit(supplement) {
    router.push(`/AddSupplement?editId=${encodeURIComponent(supplement.id)}`);
  }

  return (
    <View style={styles.screenWrap}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>{t('inventory.kicker')}</Text>
        <Text style={styles.title}>{t('inventory.title')}</Text>
        <Text style={styles.subtitle}>
          {totalCount === 1
            ? t('inventory.subtitle_one')
            : t('inventory.subtitle_other', { count: totalCount })}
        </Text>

        {hasAnyRecords ? (
          <View style={styles.filterChips}>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'active' && styles.filterChipActive]}
              onPress={() => setFilter('active')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === 'active' }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === 'active' && styles.filterChipTextActive,
                ]}
              >
                {t('inventory.filter.active', { count: active.length })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'archived' && styles.filterChipActive]}
              onPress={() => setFilter('archived')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === 'archived' }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === 'archived' && styles.filterChipTextActive,
                ]}
              >
                {t('inventory.filter.archived', { count: archived.length })}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {totalCount > 4 ? (
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('inventory.searchPlaceholder')}
            placeholderTextColor={colors.inkFaint}
            style={styles.search}
            autoCorrect={false}
            accessibilityLabel={t('inventory.searchPlaceholder')}
          />
        ) : null}

        {withoutSlot > 0 ? (
          <View style={styles.hintCard}>
            <Text style={styles.hintTitle}>
              {withoutSlot === 1
                ? t('inventory.noSlotTitle_one')
                : t('inventory.noSlotTitle_other', { count: withoutSlot })}
            </Text>
            <Text style={styles.hintText}>{t('inventory.noSlotText')}</Text>
          </View>
        ) : null}

        {!hasAnyRecords ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{t('inventory.emptyTitle')}</Text>
            <Text style={styles.emptyText}>{t('inventory.emptyText')}</Text>
            <AddSupplementChooser
              onScan={() => router.push('/scanner')}
              onSearch={() => router.push('/search')}
              onManual={() => router.push('/AddSupplement')}
            />
          </View>
        ) : null}

        {filter === 'active' ? (
          <>
            {active.length === 0 && hasAnyRecords ? (
              <Text style={styles.filterEmptyText}>
                {t('inventory.filter.emptyActive')}
              </Text>
            ) : null}

            {active.length > 0 ? (
              <View style={styles.group}>
                {active.map((supplement, index) => {
                  const slotLabels = (supplement.timingSlots ?? [])
                    .map((slotId) => SLOTS[slotId]?.label)
                    .filter(Boolean)
                    .join(' · ');
                  const dosage = formatSupplementDosage(supplement, '');
                  const paused = supplement.status === 'paused';
                  const stock = stockBySupplementId?.[supplement.id];
                  const forecast = stock
                    ? refillState(stock, supplement, refillThresholdDays)
                    : null;
                  const showRefill = forecast && forecast.daysLeft !== null;

                  // Subzeile: Dosis · Slots (oder Hinweis auf fehlenden
                  // Zeitpunkt) · Pausiert-Status. Der Nachfuell-Hinweis
                  // steht bewusst NICHT hier drin, sondern als eigene
                  // Zeile darunter, weil er faellig werden kann und dann
                  // eigenen Wortlaut braucht statt nur Farbe.
                  const subline = [
                    dosage,
                    slotLabels || t('inventory.noSlotBadge'),
                    paused ? t('inventory.paused') : null,
                  ]
                    .filter(Boolean)
                    .join(' · ');

                  return (
                    <View key={supplement.id}>
                      <Pressable
                        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                        onPress={() => goToEdit(supplement)}
                        accessibilityRole="button"
                        accessibilityLabel={`${formatSupplementName(supplement)}. ${subline}`}
                        accessibilityHint={t('inventory.edit')}
                      >
                        <View style={styles.iconTile}>
                          <Feather name="disc" size={18} color={colors.accent} />
                        </View>
                        <View style={styles.rowText}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            {formatSupplementName(supplement)}
                          </Text>
                          {subline ? (
                            <Text style={styles.rowSub} numberOfLines={2}>
                              {subline}
                            </Text>
                          ) : null}
                        </View>
                        <Feather name="chevron-right" size={18} color={colors.inkFaint} />
                      </Pressable>

                      {showRefill ? (
                        <View
                          style={[styles.refillLine, forecast.due && styles.refillLineDue]}
                        >
                          <Feather
                            name={forecast.due ? 'alert-circle' : 'clock'}
                            size={13}
                            color={forecast.due ? cautionTone.ink : colors.inkFaint}
                          />
                          <Text
                            style={[styles.refillText, forecast.due && styles.refillTextDue]}
                          >
                            {forecast.due
                              ? t('inventory.refillDue', { days: forecast.daysLeft })
                              : t('inventory.refillIn', { days: forecast.daysLeft })}
                          </Text>
                        </View>
                      ) : null}

                      <View style={styles.actionsStrip}>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() =>
                            updateUserSupplement(supplement.id, {
                              status: paused ? 'active' : 'paused',
                            })
                          }
                          accessibilityRole="button"
                        >
                          <Text style={styles.actionBtnText}>
                            {paused ? t('inventory.resume') : t('inventory.pause')}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => handleArchive(supplement)}
                          accessibilityRole="button"
                        >
                          <Text style={styles.actionBtnDanger}>{t('inventory.archive')}</Text>
                        </TouchableOpacity>
                      </View>

                      {index < active.length - 1 ? <View style={styles.divider} /> : null}
                    </View>
                  );
                })}
              </View>
            ) : null}
          </>
        ) : null}

        {filter === 'archived' ? (
          <>
            {archived.length === 0 ? (
              <Text style={styles.filterEmptyText}>
                {t('inventory.filter.emptyArchived')}
              </Text>
            ) : null}

            {archived.length > 0 ? (
              <View style={styles.group}>
                {/* Archivierte Eintraege zeigen weder Einnahmezeitpunkt
                    noch Reichweiten-Prognose noch Pausiert-Status: Sie
                    laufen nicht mehr im Tagesplan mit, diese Angaben
                    waeren erfundene Aktualitaet. Einzige Aktion ist
                    Wiederherstellen. */}
                {archived.map((supplement, index) => {
                  const dosage = formatSupplementDosage(supplement, '');

                  return (
                    <View key={supplement.id}>
                      <Pressable
                        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                        onPress={() => goToEdit(supplement)}
                        accessibilityRole="button"
                        accessibilityLabel={formatSupplementName(supplement)}
                        accessibilityHint={t('inventory.edit')}
                      >
                        <View style={styles.iconTile}>
                          <Feather name="disc" size={18} color={colors.accent} />
                        </View>
                        <View style={styles.rowText}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            {formatSupplementName(supplement)}
                          </Text>
                          {dosage ? (
                            <Text style={styles.rowSub} numberOfLines={2}>
                              {dosage}
                            </Text>
                          ) : null}
                        </View>
                        <Feather name="chevron-right" size={18} color={colors.inkFaint} />
                      </Pressable>

                      <View style={styles.actionsStrip}>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => handleRestore(supplement)}
                          accessibilityRole="button"
                        >
                          <Text style={styles.actionBtnText}>{t('inventory.restore')}</Text>
                        </TouchableOpacity>
                      </View>

                      {index < archived.length - 1 ? <View style={styles.divider} /> : null}
                    </View>
                  );
                })}
              </View>
            ) : null}
          </>
        ) : null}

        {hasAnyRecords ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setSheetVisible(true)}
            accessibilityRole="button"
          >
            <Text style={styles.addButtonText}>{t('inventory.addButton')}</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <AddSupplementSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrap: surfaces.screen,
  screen: surfaces.screen,
  content: surfaces.content,
  kicker: { ...type.eyebrow },
  title: { ...type.display, marginTop: space.sm },
  subtitle: { ...type.body, marginTop: space.sm, marginBottom: space.lg },
  search: {
    ...surfaces.input,
    marginBottom: space.md,
  },
  hintCard: {
    backgroundColor: cautionTone.surface,
    borderColor: cautionTone.rule,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.md + 2,
    marginBottom: space.md,
  },
  hintTitle: {
    ...type.bodyStrong,
    color: cautionTone.ink,
  },
  hintText: {
    color: cautionTone.ink,
    fontSize: 12,
    lineHeight: 18,
    marginTop: space.xs,
  },
  emptyCard: { ...surfaces.card },
  emptyTitle: { ...type.heading },
  emptyText: { ...type.body, marginTop: space.sm, marginBottom: space.md },

  // Gruppierte Liste im iOS-Einstellungen-Muster (siehe menu.jsx): ein
  // Block mit Haarlinie, Zeilen durch listDivider getrennt.
  group: { ...surfaces.listGroup },
  row: {
    ...surfaces.listRow,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  rowPressed: { backgroundColor: colors.surfaceSunken },
  iconTile: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowTitle: { ...type.bodyStrong },
  rowSub: { ...type.tiny, marginTop: 2 },

  // Nachfuell-Hinweis: eigene Zeile mit Wortlaut statt reinem Farbwechsel
  // (Bedienregeln, CLAUDE.md: Status nie nur ueber Farbe).
  refillLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  refillLineDue: {
    backgroundColor: cautionTone.surface,
    paddingVertical: space.xs,
  },
  refillText: { ...type.tiny, color: colors.inkFaint },
  refillTextDue: { color: cautionTone.ink, fontWeight: '600' },

  // Kompakte Aktionsleiste unterhalb der Zeile: Pausieren/Ins Archiv
  // bzw. Wiederherstellen bleiben so erreichbar, ohne den Bearbeiten-
  // Screen anfassen zu muessen (der ist nicht Teil dieser Aenderung).
  actionsStrip: {
    flexDirection: 'row',
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
    gap: space.lg,
  },
  actionBtn: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: space.xs,
  },
  actionBtnText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnDanger: {
    color: colors.alert,
    fontSize: 13,
    fontWeight: '700',
  },
  divider: { ...surfaces.listDivider },

  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: space.md,
  },
  filterChip: {
    ...surfaces.chip,
    marginRight: space.sm,
    marginBottom: space.sm,
  },
  filterChipText: {
    ...surfaces.chipText,
  },
  filterChipActive: surfaces.chipActive,
  filterChipTextActive: surfaces.chipTextActive,
  filterEmptyText: {
    ...type.small,
    marginBottom: space.md,
  },
  addButton: {
    ...surfaces.buttonQuiet,
    marginTop: space.lg,
  },
  addButtonText: { ...surfaces.buttonQuietText },
});
