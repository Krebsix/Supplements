import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import useNotificationStore from '../../useNotificationStore';
import { colors, radius, space, toneFor, type } from '../../theme';

const SLOT_IDS = ['morning', 'midday', 'evening'];
const cautionTone = toneFor('caution');

// Uhrzeit-String ('HH:MM') und natives Date fuer den Picker sind zwei
// verschiedene Formen derselben Information; hier und zurueck.
function timeStringToDate(timeStr) {
  const [hours, minutes] = String(timeStr || '07:30').split(':').map(Number);
  const date = new Date();
  date.setHours(Number.isFinite(hours) ? hours : 7, Number.isFinite(minutes) ? minutes : 30, 0, 0);
  return date;
}

function dateToTimeString(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * StepRoutineTimes
 * ─────────────────────────────────────────────────────────────
 * Drei Zeiten (morgens, mittags, abends) plus Erinnerungs-Schalter. Beide
 * haengen direkt an useNotificationStore, nicht an `answers`: Es sind
 * eigene Einstellungen, keine Onboarding-Antworten. `value` traegt hier
 * nur das lokale `permissionDenied`-Flag aus app/onboarding.jsx (gesetzt,
 * wenn die Systemerlaubnis beim Weiter-Tippen verweigert wurde).
 */
export default function StepRoutineTimes({ t, value: permissionDenied }) {
  const slotTimes = useNotificationStore((state) => state.slotTimes);
  const notificationsEnabled = useNotificationStore((state) => state.notificationsEnabled);
  const setSlotTime = useNotificationStore((state) => state.setSlotTime);
  const setNotificationsEnabled = useNotificationStore((state) => state.setNotificationsEnabled);

  const [editingSlot, setEditingSlot] = useState(null);

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      // Der Android-Dialog schliesst sich selbst; bei Abbruch liefert das
      // Event kein "set" und kein selectedDate.
      const slot = editingSlot;
      setEditingSlot(null);
      if (event?.type === 'set' && selectedDate && slot) {
        setSlotTime(slot, dateToTimeString(selectedDate));
      }
      return;
    }
    if (selectedDate && editingSlot) {
      setSlotTime(editingSlot, dateToTimeString(selectedDate));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('onboarding.routine.title')}</Text>
      <Text style={styles.text}>{t('onboarding.routine.text')}</Text>

      <View style={styles.group}>
        {SLOT_IDS.map((slot, index) => (
          <View key={slot}>
            <Pressable
              style={styles.row}
              onPress={() => setEditingSlot(slot)}
              accessibilityRole="button"
              accessibilityLabel={`${t(`onboarding.routine.${slot}`)} ${slotTimes[slot] ?? ''}`}
            >
              <Text style={styles.rowLabel}>{t(`onboarding.routine.${slot}`)}</Text>
              <Text style={styles.rowValue}>{slotTimes[slot] ?? ''}</Text>
            </Pressable>
            {index < SLOT_IDS.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{t('onboarding.routine.reminders')}</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: colors.rule, true: colors.accent }}
          thumbColor={notificationsEnabled ? colors.surface : colors.canvas}
          accessibilityLabel={t('onboarding.routine.reminders')}
        />
      </View>
      <Text style={styles.hint}>{t('onboarding.routine.remindersHint')}</Text>

      {permissionDenied ? (
        <Text style={styles.deniedHint}>{t('onboarding.routine.permissionDenied')}</Text>
      ) : null}

      {editingSlot && Platform.OS === 'ios' ? (
        <Modal
          transparent
          animationType="fade"
          visible
          onRequestClose={() => setEditingSlot(null)}
        >
          <Pressable style={styles.backdrop} onPress={() => setEditingSlot(null)}>
            {/* Eigener Pressable ohne Wirkung: faengt den Tipp auf der
                Karte ab, damit er nicht als "Backdrop getippt" durchreicht. */}
            <Pressable style={styles.pickerSheet} onPress={() => {}}>
              <DateTimePicker
                value={timeStringToDate(slotTimes[editingSlot])}
                mode="time"
                display="spinner"
                onChange={handleChange}
              />
              {/* Ausdruecklicher Schliess-Knopf zusaetzlich zum
                  Backdrop-Tipp: nicht jede Nutzerin versucht, neben das
                  Sheet zu tippen. Kein eigener i18n-Schluessel dafuer, "Fertig"
                  faellt hier mit derselben Bedeutung wie ueberall sonst
                  ("Weiter") zusammen. */}
              <Pressable
                style={styles.pickerDone}
                onPress={() => setEditingSlot(null)}
                accessibilityRole="button"
                accessibilityLabel={t('onboarding.next')}
              >
                <Text style={styles.pickerDoneText}>{t('onboarding.next')}</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      {editingSlot && Platform.OS === 'android' ? (
        <DateTimePicker
          value={timeStringToDate(slotTimes[editingSlot])}
          mode="time"
          display="default"
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  title: { ...type.heading, marginBottom: space.sm },
  text: { ...type.small, marginBottom: space.lg },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: space.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.md + 2,
    minHeight: 48,
  },
  rowLabel: { ...type.bodyStrong },
  rowValue: { ...type.body, color: colors.accent },
  divider: {
    height: 1,
    backgroundColor: colors.rule,
    marginLeft: space.lg,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  switchLabel: { ...type.bodyStrong },
  hint: { ...type.tiny, marginTop: space.sm },
  deniedHint: {
    ...type.small,
    color: cautionTone.ink,
    backgroundColor: cautionTone.surface,
    borderRadius: radius.md,
    padding: space.md,
    marginTop: space.md,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: space.xl,
    alignItems: 'center',
  },
  pickerDone: {
    paddingVertical: space.sm,
    paddingHorizontal: space.xl,
  },
  pickerDoneText: { ...type.bodyStrong, color: colors.accent },
});
