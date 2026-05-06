import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import AppHeader from '../components/AppHeader';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';

export default function ScannerScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <AppHeader
        title="Scanner"
        subtitle="Der Kamera-Scanner wird später ergänzt. In dieser Phase testen wir zuerst Navigation, Ergebnislogik und Layout."
      />

      <View style={styles.scanBox}>
        <Text style={styles.scanIcon}>📷</Text>
        <Text style={styles.scanTitle}>Scan-Platzhalter</Text>
        <Text style={styles.scanText}>
          Später erkennt dieser Bereich Produktfoto, Label, Wirkstoffe und Dosierungen.
        </Text>
      </View>

      <PrimaryButton title="Scan simulieren" onPress={() => router.push('/results')} />
      <PrimaryButton title="Zurück zur Startseite" variant="secondary" onPress={() => router.push('/')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scanBox: {
    minHeight: 280,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginBottom: 18,
  },
  scanIcon: {
    fontSize: 54,
    marginBottom: 16,
  },
  scanTitle: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '800',
  },
  scanText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
});
