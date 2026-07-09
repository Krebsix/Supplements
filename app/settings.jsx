import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Einstellungen</Text>
      <Text style={styles.title}>Systemstatus und Datenquellen</Text>
      <Text style={styles.subtitle}>
        Basisbereich für App-Status, Benachrichtigungen und spätere Datenquellen.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Status</Text>
        <Text style={styles.cardTitle}>Benachrichtigungen</Text>
        <Text style={styles.cardText}>
          Die bestehende Notification-Logik bleibt erhalten. Der vollständige Settings-Screen wird in einer späteren Phase sauber angebunden.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Qualität</Text>
        <Text style={styles.cardTitle}>Analyse-Regeln</Text>
        <Text style={styles.cardText}>
          Später werden hier Datenquellen, Wirkstoff-Synonyme, Unsicherheitsregeln und Prüfstatus angezeigt.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Lokal</Text>
        <Text style={styles.cardTitle}>Inventar und Store</Text>
        <Text style={styles.cardText}>
          Das bestehende Inventar und der lokale Zustand bleiben unverändert erhalten.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 44,
  },
  kicker: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#0f172a',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  cardText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 21,
  },
});
