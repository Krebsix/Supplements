import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SLOTS, SLOT_ORDER } from '../../../TimingEngine';
import useNotificationStore, {
  refreshNotificationSchedule,
} from '../../../useNotificationStore';
import { useTranslation } from '../../../i18n';
import { colors, space, surfaces, toneFor, type } from '../../../theme';

const cautionTone = toneFor('caution');

// Gueltige Uhrzeit im 24-Stunden-Format, z. B. 7:30 oder 21:05.
const TIME_PATTERN = /^([01]?\d|2[0-3]):[0-5]\d$/;

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const slotTimes = useNotificationStore((state) => state.slotTimes);
  const notificationsEnabled = useNotificationStore(
    (state) => state.notificationsEnabled
  );
  const permissionGranted = useNotificationStore(
    (state) => state.permissionGranted
  );
  const setNotificationsEnabled = useNotificationStore(
    (state) => state.setNotificationsEnabled
  );
  const setSlotTime = useNotificationStore((state) => state.setSlotTime);
  const resetSlotTimes = useNotificationStore((state) => state.resetSlotTimes);
  const checkAndRequestPermission = useNotificationStore(
    (state) => state.checkAndRequestPermission
  );

  const [draftTimes, setDraftTimes] = useState({ ...slotTimes });

  const handleToggle = async (value) => {
    setNotificationsEnabled(value);
    if (value) {
      // Der Systemdialog kommt erst hier, beim bewussten Einschalten.
      await checkAndRequestPermission();
    }
    await refreshNotificationSchedule();
  };

  const handleSave = async () => {
    for (const slotId of SLOT_ORDER) {
      const value = (draftTimes[slotId] || '').trim();
      if (!TIME_PATTERN.test(value)) {
        Alert.alert(
          t('notifications.timeInvalid', { value: value || '?' }),
          SLOTS[slotId]?.label || slotId
        );
        return;
      }
    }

    for (const slotId of SLOT_ORDER) {
      setSlotTime(slotId, draftTimes[slotId].trim());
    }
    await refreshNotificationSchedule();
    Alert.alert(
      t('notifications.saved.title'),
      t('notifications.saved.message')
    );
  };

  const handleReset = async () => {
    resetSlotTimes();
    const next = useNotificationStore.getState().slotTimes;
    setDraftTimes({ ...next });
    await refreshNotificationSchedule();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{t('notifications.kicker')}</Text>
      <Text style={styles.title}>{t('notifications.title')}</Text>
      <Text style={styles.subtitle}>{t('notifications.subtitle')}</Text>

      <View style={styles.switchCard}>
        <View style={styles.switchTextWrap}>
          <Text style={styles.switchTitle}>{t('notifications.enableTitle')}</Text>
          <Text style={styles.switchSubtitle}>
            {t('notifications.enableSubtitle')}
          </Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: colors.rule, true: colors.accent }}
          thumbColor={notificationsEnabled ? colors.surface : colors.canvas}
          accessibilityLabel={t('notifications.enableTitle')}
        />
      </View>

      {notificationsEnabled && !permissionGranted ? (
        <View style={styles.permissionCard}>
          <Text style={styles.permissionText}>
            {t('notifications.permissionDenied')}
          </Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('notifications.timesTitle')}</Text>
        <Text style={styles.cardText}>{t('notifications.timesSubtitle')}</Text>

        {SLOT_ORDER.map((slotId) => (
          <View key={slotId} style={styles.timeRow}>
            <Text style={styles.timeLabel}>{SLOTS[slotId]?.label || slotId}</Text>
            <TextInput
              value={draftTimes[slotId] ?? ''}
              onChangeText={(value) =>
                setDraftTimes((current) => ({ ...current, [slotId]: value }))
              }
              placeholder="07:30"
              placeholderTextColor={colors.inkFaint}
              keyboardType="numbers-and-punctuation"
              style={styles.timeInput}
              accessibilityLabel={SLOTS[slotId]?.label || slotId}
            />
          </View>
        ))}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel={t('notifications.saveButton')}
        >
          <Text style={styles.saveButtonText}>{t('notifications.saveButton')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          accessibilityRole="button"
          accessibilityLabel={t('notifications.resetButton')}
        >
          <Text style={styles.resetButtonText}>{t('notifications.resetButton')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: surfaces.screen,
  content: surfaces.content,
  kicker: { ...type.eyebrow, marginBottom: space.sm },
  title: { ...type.display, fontSize: 30, lineHeight: 36 },
  subtitle: {
    ...type.body,
    marginTop: space.sm + 2,
    marginBottom: space.xl - 2,
  },
  card: surfaces.card,
  cardTitle: { ...type.heading, marginBottom: space.sm },
  cardText: { ...type.body, marginBottom: space.md },
  switchCard: {
    ...surfaces.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTextWrap: { flex: 1, paddingRight: space.md + 2 },
  switchTitle: { ...type.bodyStrong, fontSize: 15 },
  switchSubtitle: { marginTop: space.xs, ...type.body, fontSize: 13 },
  permissionCard: {
    backgroundColor: cautionTone.surface,
    borderColor: cautionTone.rule,
    borderWidth: 1,
    borderRadius: 6,
    padding: space.md,
    marginBottom: space.md,
  },
  permissionText: { color: cautionTone.ink, fontSize: 13, lineHeight: 19 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    paddingVertical: space.sm + 2,
  },
  timeLabel: { ...type.bodyStrong },
  timeInput: {
    ...surfaces.input,
    minWidth: 92,
    textAlign: 'center',
  },
  saveButton: { ...surfaces.buttonPrimary, marginTop: space.md + 2 },
  saveButtonText: surfaces.buttonPrimaryText,
  resetButton: { ...surfaces.buttonQuiet, marginTop: space.sm + 2 },
  resetButtonText: surfaces.buttonQuietText,
});
