import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AppHeader from '../components/AppHeader';
import ScreenContainer from '../components/ScreenContainer';
import StatusBadge from '../components/StatusBadge';

const history = [
  { name: 'Magnesium Complex', date: 'Heute', status: '82% Sicherheit' },
  { name: 'Vitamin D3 + K2', date: 'Gestern', status: '76% Sicherheit' },
  { name: 'Omega 3', date: 'Demo', status: 'Unvollständig' },
];

export default function HistoryScreen() {
  return (
    <ScreenContainer>
      <AppHeader
        title="Verlauf"
        subtitle="Platzhalter für letzte Scans und gespeicherte Produktanalysen."
      />

      {history.map((item) => (
        <View key={item.name} style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.date}>{item.date}</Text>
          <StatusBadge label={item.status} tone={item.status === 'Unvollständig' ? 'warning' : 'good'} />
        </View>
      ))}
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
  name: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '800',
  },
  date: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },
});
