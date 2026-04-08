/**
 * NotificationSettings.jsx
 * ─────────────────────────────────────────────────────────────
 * Settings-Screen: User konfiguriert seine Tages-Zeiten pro Slot.
 * Benutzt NativeWind für Styling.
 */

import React, { useState } from 'react';
import {
  View, Text, Switch, ScrollView,
  TouchableOpacity, TextInput, Alert,
} from 'react-native';

import useNotificationStore from '../store/useNotificationStore';
import useStore             from '../store/useStore';
import { SLOTS, SLOT_ORDER } from '../logic/TimingEngine';

// ─────────────────────────────────────────────────────────────
export default function NotificationSettings() {
  const {
    slotTimes,
    notificationsEnabled,
    permissionGranted,
    setSlotTime,
    setNotificationsEnabled,
    checkAndRequestPermission,
    resetSlotTimes,
    refreshSchedule,
    getScheduleSummary,
  } = useNotificationStore();

  const { getLoggedToday, activeProfileId, getAbsorptionStatus } = useStore();

  const [saving, setSaving] = useState(false);

  // ── Speichern & Neuplanung ──────────────────────────────
  async function handleSave() {
    setSaving(true);
    try {
      if (!permissionGranted) {
        const granted = await checkAndRequestPermission();
        if (!granted) {
          Alert.alert(
            'Berechtigung fehlt',
            'Bitte erlaube Benachrichtigungen in den iOS/Android-Einstellungen.'
          );
          setSaving(false);
          return;
        }
      }

      const { absorptionBlockedAt } = getAbsorptionStatus();
      await refreshSchedule({
        loggedToday:        getLoggedToday(),
        absorptionBlockedAt,
        profile:            activeProfileId,
      });

      const summary = getScheduleSummary();
      Alert.alert(
        '✅ Gespeichert',
        `${summary.totalScheduled} Alarme für heute geplant.`
      );
    } finally {
      setSaving(false);
    }
  }

  // ── Zeit-Validierung ────────────────────────────────────
  function handleTimeChange(slotId, raw) {
    // Erlaubt: "HH:MM" Format
    const clean = raw.replace(/[^0-9:]/g, '');
    setSlotTime(slotId, clean);
  }

  function isValidTime(str) {
    return /^\d{2}:\d{2}$/.test(str);
  }

  // ─────────────────────────────────────────────────────────
  return (
    <ScrollView className="flex-1 bg-zinc-950 px-4 pt-6">

      {/* Header */}
      <Text className="text-white text-2xl font-bold mb-1">
        🔔 Benachrichtigungen
      </Text>
      <Text className="text-zinc-400 text-sm mb-6">
        Lege deine persönlichen Tageszeiten fest. Die App plant Alarme
        automatisch – inklusive Nüchtern-Delay und Flohsamen-Sperre.
      </Text>

      {/* Master Toggle */}
      <View className="flex-row items-center justify-between bg-zinc-900 rounded-xl px-4 py-3 mb-6">
        <View>
          <Text className="text-white font-semibold">Alarme aktiviert</Text>
          <Text className="text-zinc-400 text-xs">
            {permissionGranted ? '✅ Berechtigung erteilt' : '⚠️ Berechtigung fehlt'}
          </Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: '#3f3f46', true: '#4ade80' }}
          thumbColor={notificationsEnabled ? '#fff' : '#71717a'}
        />
      </View>

      {/* Slot-Zeit-Konfiguration */}
      <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
        Tages-Slots konfigurieren
      </Text>

      {SLOT_ORDER.map((slotId) => {
        const slot  = SLOTS[slotId];
        const time  = slotTimes[slotId] ?? '';
        const valid = isValidTime(time);

        return (
          <View
            key={slotId}
            className="flex-row items-center justify-between bg-zinc-900 rounded-xl px-4 py-3 mb-2"
          >
            {/* Slot-Info */}
            <View className="flex-1">
              <Text className="text-white font-medium">
                {slot.emoji}  {slot.label}
              </Text>
              <Text className="text-zinc-500 text-xs">{slot.time}</Text>
            </View>

            {/* Zeit-Input */}
            <View className="flex-row items-center gap-2">
              <TextInput
                className={`w-20 text-center rounded-lg px-2 py-2 text-base font-mono ${
                  valid ? 'bg-zinc-800 text-white' : 'bg-red-950 text-red-400'
                }`}
                value={time}
                onChangeText={(v) => handleTimeChange(slotId, v)}
                placeholder="HH:MM"
                placeholderTextColor="#52525b"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            </View>
          </View>
        );
      })}

      {/* Intelligenz-Hinweise */}
      <View className="mt-4 mb-3 bg-zinc-900 rounded-xl p-4 gap-2">
        <Text className="text-zinc-300 font-semibold mb-1">⚡ Automatische Logik</Text>
        <RuleRow
          emoji="🌅"
          title="Nüchtern-Delay"
          desc="Morgen-Alarme kommen 30 Min. nach Nüchtern-Einnahme"
        />
        <RuleRow
          emoji="🚫"
          title="Flohsamen-Sperre"
          desc="Alle Vitalstoffe werden 120 Min. verzögert nach Flohsamen"
        />
        <RuleRow
          emoji="✅"
          title="Auto-Skip"
          desc="Bereits eingenommene Supplements werden nicht mehr alarmiert"
        />
      </View>

      {/* Buttons */}
      <TouchableOpacity
        className="bg-green-500 rounded-xl py-4 items-center mt-4"
        onPress={handleSave}
        disabled={saving}
      >
        <Text className="text-white font-bold text-base">
          {saving ? 'Wird geplant…' : '💾 Speichern & Alarme planen'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-zinc-800 rounded-xl py-3 items-center mt-2 mb-12"
        onPress={() => {
          resetSlotTimes();
          Alert.alert('Zurückgesetzt', 'Standard-Zeiten wiederhergestellt.');
        }}
      >
        <Text className="text-zinc-400 text-sm">Zeiten zurücksetzen</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
function RuleRow({ emoji, title, desc }) {
  return (
    <View className="flex-row items-start gap-2">
      <Text className="text-base">{emoji}</Text>
      <View className="flex-1">
        <Text className="text-zinc-200 text-sm font-medium">{title}</Text>
        <Text className="text-zinc-500 text-xs">{desc}</Text>
      </View>
    </View>
  );
}
