import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import useStore from '../useStore';

const EMPTY_SUPPLEMENTS = [];

function formatSupplementValue(value, fallback) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const formattedValues = value
      .map((item) => formatSupplementValue(item, ''))
      .filter(Boolean);

    return formattedValues.length > 0 ? formattedValues.join(', ') : fallback;
  }

  if (typeof value === 'object') {
    if ('amount' in value || 'unit' in value) {
      const amount = value.amount ?? '';
      const unit = value.unit ?? '';

      return `${amount} ${unit}`.trim() || fallback;
    }

    return (
      value.label ||
      value.name ||
      value.title ||
      value.value ||
      fallback
    );
  }

  return fallback;
}

function getSupplementName(supplement) {
  return formatSupplementValue(
    supplement.name || supplement.supplementName || supplement.productName,
    'Unbenanntes Supplement'
  );
}

function getSupplementDosage(supplement) {
  return formatSupplementValue(
    supplement.dosage || supplement.dose || supplement.serving,
    'Dosierung nicht hinterlegt'
  );
}

function getSupplementPurpose(supplement) {
  return formatSupplementValue(
    supplement.purpose || supplement.goal || supplement.reason,
    'Zweck nicht hinterlegt'
  );
}

export default function SettingsScreen() {
  const userSupplements = useStore((state) => state.userSupplements) ?? EMPTY_SUPPLEMENTS;
  const updateUserSupplement = useStore((state) => state.updateUserSupplement);

  const archivedSupplements = userSupplements.filter(
    (supplement) => supplement.status === 'archived'
  );

  const handleRestoreSupplement = (supplement) => {
    const supplementName = getSupplementName(supplement);

    Alert.alert(
      'Supplement wiederherstellen?',
      `${supplementName} wird wieder in deine aktive Routine aufgenommen.`,
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Wiederherstellen',
          onPress: () => updateUserSupplement(supplement.id, { status: 'active' }),
        },
      ]
    );
  };

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

      <View style={styles.archiveSection}>
        <Text style={styles.sectionLabel}>Archiv</Text>
        <Text style={styles.sectionTitle}>Archivierte Supplements</Text>
        <Text style={styles.sectionText}>
          Hier erscheinen Supplements, die aus deiner aktiven Routine entfernt wurden. Sie bleiben erhalten und können wiederhergestellt werden.
        </Text>

        {archivedSupplements.length === 0 ? (
          <View style={styles.emptyArchiveCard}>
            <Text style={styles.emptyArchiveTitle}>Kein Archiv vorhanden</Text>
            <Text style={styles.emptyArchiveText}>
              Entfernte Supplements werden später hier angezeigt, ohne endgültig gelöscht zu werden.
            </Text>
          </View>
        ) : (
          archivedSupplements.map((supplement) => (
            <View key={supplement.id} style={styles.archiveCard}>
              <View style={styles.archiveHeader}>
                <View style={styles.archiveTitleGroup}>
                  <Text style={styles.archiveName}>{getSupplementName(supplement)}</Text>
                  <Text style={styles.archiveMeta}>{getSupplementDosage(supplement)}</Text>
                </View>

                <View style={styles.archiveBadge}>
                  <Text style={styles.archiveBadgeText}>Archiviert</Text>
                </View>
              </View>

              <View style={styles.archiveDetail}>
                <Text style={styles.archiveDetailLabel}>Zweck</Text>
                <Text style={styles.archiveDetailText}>{getSupplementPurpose(supplement)}</Text>
              </View>

              <Pressable
                onPress={() => handleRestoreSupplement(supplement)}
                style={({ pressed }) => [
                  styles.restoreButton,
                  pressed && styles.restoreButtonPressed,
                ]}
              >
                <Text style={styles.restoreButtonText}>Wiederherstellen</Text>
              </Pressable>
            </View>
          ))
        )}
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
  archiveSection: {
    marginTop: 14,
  },
  sectionLabel: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  sectionText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 14,
  },
  emptyArchiveCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  emptyArchiveTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyArchiveText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 21,
  },
  archiveCard: {
    backgroundColor: '#ffffff',
    borderColor: '#dbeafe',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  archiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  archiveTitleGroup: {
    flex: 1,
  },
  archiveName: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 5,
  },
  archiveMeta: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
  archiveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  archiveBadgeText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  archiveDetail: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  archiveDetailLabel: {
    color: '#0f766e',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  archiveDetailText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 21,
  },
  restoreButton: {
    backgroundColor: '#0f766e',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  restoreButtonPressed: {
    opacity: 0.82,
  },
  restoreButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});
