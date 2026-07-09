import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import SupplementResultCard from '../components/SupplementResultCard';
import mockScanResult from '../data/mockScanResult';
import useStore from '../useStore';

export default function ResultsScreen() {
  const router = useRouter();
  const pendingScanResult = useStore((state) => state.pendingScanResult);
  const result = pendingScanResult || mockScanResult;
  const displayResult = {
    ...result,
    brand: result.brand === 'Demo Brand' ? 'Marke nicht erkannt' : result.brand,
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Analyse-Ergebnis</Text>
      <Text style={styles.title}>Scan prüfen und bestätigen</Text>
      <Text style={styles.subtitle}>
        Vorläufiges Analyse-Ergebnis. Prüfe Produktname, Marke, Dosierung und Inhaltsstoffe bewusst, bevor du den Eintrag in deine Routine übernimmst.
      </Text>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>Prüfhinweis</Text>
        <Text style={styles.noticeText}>
          Dieses Ergebnis ist keine medizinische Bewertung. Produktname, Dosierung und Inhaltsstoffe müssen vor dem Speichern bewusst geprüft werden.
        </Text>
      </View>

      <SupplementResultCard result={displayResult} />

      <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/AddSupplement?fromScan=1')}>
        <Text style={styles.primaryButtonText}>Als Supplement hinzufügen</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/')}>
        <Text style={styles.secondaryButtonText}>Zurück zur Startseite</Text>
      </TouchableOpacity>
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
    marginBottom: 16,
  },
  noticeCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  noticeTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  noticeText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    backgroundColor: '#0f766e',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
  },
});
