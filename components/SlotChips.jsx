import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SLOT_ORDER, getSlot } from '../TimingEngine';
import { useTranslation } from '../i18n';
import { colors, space, surfaces, type } from '../theme';

/**
 * Frage 2 auf dem Screen "Aufnehmen": Tages-Slots als Chips, ohne Emojis,
 * darunter die Begruendung des Vorschlags (SlotSuggestion.js) oder der
 * Hinweis "Standard". Mehrfachauswahl; die Mindestzahl 1 prueft der Screen.
 */
export default function SlotChips({ selected = [], onToggle, reason = null, showSuggestion = true }) {
  const { t } = useTranslation();
  const sourceLabel = reason?.sources?.[0]?.label ?? '';

  return (
    <View style={styles.block}>
      <Text style={styles.title}>{t('addSupplement.slot.title')}</Text>
      <View style={styles.wrap}>
        {SLOT_ORDER.map((slotId) => {
          const slot = getSlot(slotId);
          const active = selected.includes(slotId);
          return (
            <Pressable
              key={slotId}
              onPress={() => onToggle(slotId)}
              style={[styles.chip, active && surfaces.chipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${slot.label}, ${slot.time}`}
            >
              <Text style={[surfaces.chipText, active && surfaces.chipTextActive]}>{slot.label}</Text>
              <Text style={[styles.time, active && surfaces.chipTextActive]}>{slot.time}</Text>
            </Pressable>
          );
        })}
      </View>
      {showSuggestion ? (
        <Text style={styles.reason}>
          {reason
            ? t('addSupplement.slot.suggestion', { text: reason.text, source: sourceLabel })
            : t('addSupplement.slot.default')}
        </Text>
      ) : null}
      {selected.length === 0 ? <Text style={styles.warning}>{t('addSupplement.slot.none')}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: space.xl },
  title: { ...type.subheading, marginBottom: space.md },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { ...surfaces.chip, alignItems: 'center' },
  time: { ...type.tiny, marginTop: 2 },
  reason: { ...type.small, marginTop: space.md },
  warning: { ...type.small, color: colors.caution, marginTop: space.sm },
});
