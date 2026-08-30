import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import AddSupplementChooser from '../../../components/AddSupplementChooser';
import AddSupplementSheet from '../../../components/AddSupplementSheet';
import { SLOTS } from '../../../TimingEngine';
import useStore from '../../../useStore';
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

  const userSupplements = useStore((state) => state.userSupplements);
  const archiveUserSupplement = useStore((state) => state.archiveUserSupplement);
  const updateUserSupplement = useStore((state) => state.updateUserSupplement);

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

        {totalCount === 0 ? (
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

        {active.map((supplement) => {
          const slotLabels = (supplement.timingSlots ?? [])
            .map((slotId) => SLOTS[slotId]?.label)
            .filter(Boolean)
            .join(' · ');
          const dosage = formatSupplementDosage(supplement, '');
          const paused = supplement.status === 'paused';

          return (
            <View key={supplement.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardName}>{formatSupplementName(supplement)}</Text>
                {paused ? (
                  <Text style={styles.pausedPill}>{t('inventory.paused')}</Text>
                ) : null}
              </View>

              {dosage ? <Text style={styles.cardMeta}>{dosage}</Text> : null}

              {slotLabels ? (
                <Text style={styles.cardSlots}>{slotLabels}</Text>
              ) : (
                <Text style={styles.cardMissing}>{t('inventory.noSlotBadge')}</Text>
              )}

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    router.push(
                      `/AddSupplement?editId=${encodeURIComponent(supplement.id)}`
                    )
                  }
                  accessibilityRole="link"
                >
                  <Text style={styles.actionText}>{t('inventory.edit')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    updateUserSupplement(supplement.id, {
                      status: paused ? 'active' : 'paused',
                    })
                  }
                  accessibilityRole="button"
                >
                  <Text style={styles.actionText}>
                    {paused ? t('inventory.resume') : t('inventory.pause')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleArchive(supplement)}
                  accessibilityRole="button"
                >
                  <Text style={styles.actionDanger}>{t('inventory.archive')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {archived.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>
              {t('inventory.archivedSection', { count: archived.length })}
            </Text>
            {archived.map((supplement) => (
              <View key={supplement.id} style={styles.archivedRow}>
                <Text style={styles.archivedName} numberOfLines={1}>
                  {formatSupplementName(supplement)}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    updateUserSupplement(supplement.id, { status: 'active' })
                  }
                  accessibilityRole="button"
                >
                  <Text style={styles.actionText}>{t('inventory.restore')}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        ) : null}

        {totalCount > 0 ? (
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
  card: { ...surfaces.card },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: { ...type.subheading, flex: 1 },
  pausedPill: {
    ...type.tiny,
    color: cautionTone.ink,
    backgroundColor: cautionTone.surface,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  cardMeta: { ...type.small, marginTop: space.xs },
  cardSlots: { ...type.small, color: colors.accent, marginTop: space.xs },
  cardMissing: {
    ...type.small,
    color: cautionTone.ink,
    marginTop: space.xs,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: space.md,
    gap: space.lg,
  },
  actionButton: { paddingVertical: space.xs },
  actionText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  actionDanger: {
    color: colors.alert,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    ...type.label,
    marginTop: space.lg,
    marginBottom: space.sm,
  },
  archivedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.md - 2,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  archivedName: {
    ...type.small,
    flex: 1,
    marginRight: space.md,
  },
  primaryButton: { ...surfaces.buttonPrimary },
  primaryButtonText: { ...surfaces.buttonPrimaryText },
  addButton: {
    ...surfaces.buttonQuiet,
    marginTop: space.lg,
  },
  addButtonText: { ...surfaces.buttonQuietText },
});
