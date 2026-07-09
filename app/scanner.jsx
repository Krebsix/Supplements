import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import mockScanResult from '../data/mockScanResult';
import useStore from '../useStore';

export default function ScannerScreen() {
  const router = useRouter();
  const saveScanResult = useStore((state) => state.saveScanResult);
  const setPendingScanResult = useStore((state) => state.setPendingScanResult);

  function handleMockScan() {
    saveScanResult(mockScanResult);
    setPendingScanResult(mockScanResult);
    router.push('/results');
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Scanner</Text>
      <Text style={styles.title}>Produktdaten erfassen</Text>
      <Text style={styles.subtitle}>
        Der echte Kamera-Scanner folgt später. In dieser Phase prüfen wir Navigation, Ergebnislogik und ein ruhiges klinisches Layout.
      </Text>

      <View style={styles.scanBox}>
        <View style={styles.scanFrame}>
          <View style={styles.scanLine} />
        </View>
        <Text style={styles.scanTitle}>Scan-Bereich vorbereitet</Text>
        <Text style={styles.scanText}>
          Dieser Bereich bereitet den späteren Foto-, Label- und Wirkstoff-Scan vor. Aktuell nutzt die App ein stabiles Test-Ergebnis zur sicheren Ablaufprüfung.
        </Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleMockScan}>
        <Text style={styles.primaryButtonText}>Scan simulieren</Text>
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
    marginBottom: 20,
  },
  scanBox: {
    minHeight: 300,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginBottom: 18,
  },
  scanFrame: {
    width: 92,
    height: 92,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#99f6e4',
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  scanLine: {
    width: 52,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#0f766e',
  },
  scanTitle: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '800',
  },
  scanText: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#0f766e',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
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
