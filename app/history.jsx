import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import StatusBadge from '../components/StatusBadge';

const history = [
  { name: 'Magnesium Complex', date: 'Heute', status: '82% Sicherheit' },
  { name: 'Vitamin D3 + K2', date: 'Gestern', status: '76% Sicherheit' },
  { name: 'Omega 3', date: 'Demo', status: 'Unvollständig' },
];

export default function HistoryScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Verlauf</Text>
      <Text style={styles.title}>Letzte Produktanalysen</Text>
      <Text style={styles.subtitle}>
        Platzhalter für gespeicherte Scans und Produktanalysen. Die echte Verlauf-Logik bleibt unverändert und wird später sauber angebunden.
      </Text>

      {history.map((item) => (
        <View key={item.name} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTextWrap}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <StatusBadge label={item.status} tone={item.status === 'Unvollständig' ? 'warning' : 'good'} />
          </View>
        </View>
      ))}

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>Hinweis</Text>
        <Text style={styles.noticeText}>
          Dieser Bereich zeigt aktuell Demo-Einträge. Später werden hier echte Scan-Ergebnisse, Prüfstatus und Quellenhinweise angezeigt.
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTextWrap: {
    flex: 1,
  },
  name: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '800',
  },
  date: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 5,
  },
  noticeCard: {
    backgroundColor: '#eef2f6',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    marginTop: 4,
  },
  noticeTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 7,
  },
  noticeText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
  },
});
