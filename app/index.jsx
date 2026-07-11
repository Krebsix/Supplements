import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Supplement OS</Text>
      <Text style={styles.title}>Scannen. Prüfen. In Routine überführen.</Text>
      <Text style={styles.subtitle}>
        Dein strukturierter Workspace für Supplement-Daten, Tagesroutine, Verlauf und spätere Scanner-Qualität.
      </Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Klinischer Workflow</Text>
        <Text style={styles.heroTitle}>Erfassen, validieren, dokumentieren.</Text>
        <Text style={styles.heroText}>
          Supplement OS priorisiert belastbare Einträge: erst klare Produktdaten, dann Routine-Logik, später echte Scanner-Intelligenz.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/scanner')}>
          <Text style={styles.primaryButtonText}>Produkt scannen</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/search')}>
          <Text style={styles.secondaryButtonText}>Manuell erfassen</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.trustCard}>
        <Text style={styles.trustLabel}>Produktprinzip</Text>

        <TrustItem
          title="Datenqualität vor Automatisierung"
          text="Scanner- und manuelle Einträge sollen nachvollziehbar bleiben, bevor sie Routine-Logik beeinflussen."
        />

        <TrustItem
          title="Archiv statt Datenverlust"
          text="Entfernte Supplements bleiben wiederherstellbar, damit Verlauf und Kontext erhalten bleiben."
        />

        <TrustItem
          title="Allgemeine Hinweise"
          text="Die App organisiert und dokumentiert. Sie ersetzt keine medizinische Beratung."
        />
      </View>

      <Text style={styles.sectionTitle}>Workflow</Text>

      <NavCard
        index="01"
        title="Tagesplan"
        subtitle="Heute geplante Einnahmen, dokumentierte Routinen, offene Einträge und organisatorische Prüfhinweise."
        onPress={() => router.push('/Dashboard')}
      />

      <NavCard
        index="02"
        title="Neues Supplement"
        subtitle="Manuellen Eintrag mit Dosierung, Timing und Zweck sauber in die aktive Routine aufnehmen."
        onPress={() => router.push('/AddSupplement')}
      />

      <NavCard
        index="03"
        title="Verlauf"
        subtitle="Dokumentierte Einnahmen, Routine-Aktivität und frühere Einträge nachvollziehen."
        onPress={() => router.push('/history')}
      />

      <NavCard
        index="04"
        title="Einstellungen"
        subtitle="Archiv, lokale Daten, Systemstatus und spätere Datenquellen verwalten."
        onPress={() => router.push('/settings')}
      />
    </ScrollView>
  );
}

function TrustItem({ title, text }) {
  return (
    <View style={styles.trustItem}>
      <Text style={styles.trustItemTitle}>{title}</Text>
      <Text style={styles.trustItemText}>{text}</Text>
    </View>
  );
}

function NavCard({ index, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.navCard} onPress={onPress}>
      <View style={styles.navIndexWrap}>
        <Text style={styles.navIndex}>{index}</Text>
      </View>
      <View style={styles.navTextWrap}>
        <Text style={styles.navTitle}>{title}</Text>
        <Text style={styles.navSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
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
  heroCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  heroLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: {
    color: '#0f172a',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
  },
  heroText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#0f766e',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
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
  trustCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 24,
  },
  trustLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  trustItem: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    marginTop: 12,
  },
  trustItemTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  trustItemText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  navIndexWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ecfdf5',
    borderColor: '#ccfbf1',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  navIndex: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '900',
  },
  navTextWrap: {
    flex: 1,
  },
  navTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
  },
  navSubtitle: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
});
