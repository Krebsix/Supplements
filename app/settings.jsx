import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AppHeader from '../components/AppHeader';
import ScreenContainer from '../components/ScreenContainer';

export default function SettingsScreen() {
  return (
    <ScreenContainer>
      <AppHeader
        title="Einstellungen"
        subtitle="Basisbereich für App-Status, Benachrichtigungen und spätere Datenquellen."
      />

      <View style={styles.card}>
        <Text style={styles.title}>🔔 Benachrichtigungen</Text>
        <Text style={styles.text}>
          Die bestehende Notification-Logik bleibt erhalten. Der vollständige Settings-Screen wird in der nächsten Phase sauber angebunden.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>🧠 Analyse-Qualität</Text>
        <Text style={styles.text}>
          Später werden hier Datenquellen, Wirkstoff-Synonyme, Unsicherheitsregeln und Prüfstatus angezeigt.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>📦 Lokales Inventar</Text>
        <Text style={styles.text}>
          Das bestehende Inventar und der lokale Zustand bleiben unverändert erhalten.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderColor: '#1f2937',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  text: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 21,
  },
});
