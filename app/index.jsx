import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import AppHeader from '../components/AppHeader';
import FeatureCard from '../components/FeatureCard';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';

export default function Home() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <AppHeader
        title="Supplement Scanner"
        subtitle="Scanne Produkte, erkenne Wirkstoffe und prüfe Timing, Konflikte und Unsicherheiten strukturiert."
      />

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Produktanalyse statt Namensraten</Text>
        <Text style={styles.heroText}>
          Viele Supplements heißen anders als ihre eigentlichen Wirkstoffe. Die App wird deshalb auf Wirkstoff-Erkennung, Synonyme und klare Hinweise ausgelegt.
        </Text>
        <PrimaryButton title="Supplement scannen" onPress={() => router.push('/scanner')} />
        <PrimaryButton title="Manuell suchen" variant="secondary" onPress={() => router.push('/search')} />
      </View>

      <Text style={styles.sectionTitle}>Bereiche</Text>

      <FeatureCard
        icon="📅"
        title="Tagesplan"
        subtitle="Bestehende Einnahme-Slots, Konflikte und offene Supplements."
        onPress={() => router.push('/Dashboard')}
      />
      <FeatureCard
        icon="➕"
        title="Neues Supplement"
        subtitle="Manuellen Eintrag zum lokalen Inventar hinzufügen."
        onPress={() => router.push('/AddSupplement')}
      />
      <FeatureCard
        icon="🧾"
        title="Verlauf"
        subtitle="Letzte Analysen und gespeicherte Scan-Ergebnisse."
        onPress={() => router.push('/history')}
      />
      <FeatureCard
        icon="⚙️"
        title="Einstellungen"
        subtitle="App-Status, Benachrichtigungen und zukünftige Datenquellen."
        onPress={() => router.push('/settings')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: '#111827',
    borderColor: '#1f2937',
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginBottom: 24,
  },
  heroTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
  },
  heroText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
});
