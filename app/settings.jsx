import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import useStore from '../useStore';
import {
  formatSupplementDosage as getSupplementDosage,
  formatSupplementName as getSupplementName,
  formatSupplementPurpose as getSupplementPurpose,
} from '../utils/supplementFormatting';

const EMPTY_SUPPLEMENTS = [];
const EMPTY_LOGS = [];

export default function SettingsScreen() {
  const userSupplements =
    useStore((state) => state.userSupplements) ?? EMPTY_SUPPLEMENTS;
  const intakeLogs = useStore((state) => state.intakeLogs) ?? EMPTY_LOGS;
  const updateUserSupplement = useStore(
    (state) => state.updateUserSupplement
  );
  const clearIntakeLogs = useStore((state) => state.clearIntakeLogs);

  const archivedSupplements = userSupplements.filter(
    (supplement) => supplement.status === 'archived'
  );
  const activeSupplements = userSupplements.filter(
    (supplement) => supplement.status !== 'archived'
  ).length;
  const activeIntakeLogs = intakeLogs.filter((log) => !log.undoneAt).length;
  const undoneIntakeLogs = intakeLogs.filter((log) => log.undoneAt).length;

  const handleClearIntakeLogs = () => {
    if (intakeLogs.length === 0) {
      Alert.alert(
        'Keine Einnahmehistorie vorhanden',
        'Auf diesem Gerät sind aktuell keine dokumentierten Einnahmen gespeichert.'
      );
      return;
    }

    Alert.alert(
      'Lokale Einnahmehistorie löschen?',
      `Gelöscht werden ${intakeLogs.length} dokumentierte Einnahmen einschließlich rückgängig gemachter Einträge.\n\nErhalten bleiben deine Supplements, archivierten Supplements, Scanner-Ergebnisse und Bestände.`,
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Historie löschen',
          style: 'destructive',
          onPress: clearIntakeLogs,
        },
      ]
    );
  };

  const handleRestoreSupplement = (supplement) => {
    const supplementName = getSupplementName(supplement);

    Alert.alert(
      'Supplement wiederherstellen?',
      `${supplementName} wird aus dem Archiv entfernt und wieder als aktives Supplement geführt.`,
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Wiederherstellen',
          onPress: () =>
            updateUserSupplement(supplement.id, { status: 'active' }),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Einstellungen</Text>
      <Text style={styles.title}>App-Status und lokale Daten</Text>
      <Text style={styles.subtitle}>
        Prüfe deinen lokalen Datenbestand, verwalte die Einnahmehistorie und
        stelle archivierte Supplements wieder her.
      </Text>

      <View style={styles.statusCard}>
        <Text style={styles.cardLabel}>Lokaler Status</Text>
        <Text style={styles.cardTitle}>Datenbestand auf diesem Gerät</Text>
        <Text style={styles.cardText}>
          Diese Übersicht zeigt den aktuell in der App gespeicherten Zustand.
        </Text>

        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>{activeSupplements}</Text>
            <Text style={styles.statusLabel}>Aktiv</Text>
          </View>

          <View style={styles.statusDivider} />

          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>
              {archivedSupplements.length}
            </Text>
            <Text style={styles.statusLabel}>Archiviert</Text>
          </View>

          <View style={styles.statusDivider} />

          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>{intakeLogs.length}</Text>
            <Text style={styles.statusLabel}>Dokumentiert</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Datenhaltung</Text>
        <Text style={styles.cardTitle}>Lokale Datenverwaltung</Text>
        <Text style={styles.cardText}>
          Supplements, Archiv, Scanner-Ergebnisse, Bestände und
          Einnahmehistorie werden aktuell im lokalen App-Zustand verwaltet.
          Änderungen in diesem Bereich betreffen ausschließlich die jeweils
          ausdrücklich genannte Datenkategorie.
        </Text>

        <View style={styles.trustNotice}>
          <Text style={styles.trustNoticeTitle}>Kontrollierte Änderungen</Text>
          <Text style={styles.trustNoticeText}>
            Destruktive Aktionen werden vor der Ausführung bestätigt.
            Archivierte Supplements bleiben erhalten und können
            wiederhergestellt werden.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Datenhygiene</Text>
        <Text style={styles.cardTitle}>Lokale Einnahmehistorie</Text>
        <Text style={styles.cardText}>
          Hier kannst du ausschließlich die auf diesem Gerät dokumentierten
          Einnahmen entfernen.
        </Text>

        <View style={styles.historyStats}>
          <View style={styles.historyStat}>
            <Text style={styles.historyStatValue}>{activeIntakeLogs}</Text>
            <Text style={styles.historyStatLabel}>Einnahmen</Text>
          </View>

          <View style={styles.historyStat}>
            <Text style={styles.historyStatValue}>{undoneIntakeLogs}</Text>
            <Text style={styles.historyStatLabel}>Rückgängig</Text>
          </View>

          <View style={styles.historyStat}>
            <Text style={styles.historyStatValue}>{intakeLogs.length}</Text>
            <Text style={styles.historyStatLabel}>Gesamt</Text>
          </View>
        </View>

        <View style={styles.scopeBox}>
          <View style={styles.scopeRow}>
            <Text style={styles.scopeLabel}>Wird gelöscht</Text>
            <Text style={styles.scopeText}>
              Dokumentierte Einnahmen und rückgängig gemachte Einträge
            </Text>
          </View>

          <View style={styles.scopeSeparator} />

          <View style={styles.scopeRow}>
            <Text style={styles.scopeLabel}>Bleibt erhalten</Text>
            <Text style={styles.scopeText}>
              Supplements, Archiv, Scanner-Ergebnisse und Bestände
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleClearIntakeLogs}
          style={({ pressed }) => [
            styles.dangerButton,
            pressed ? styles.dangerButtonPressed : null,
          ]}
        >
          <Text style={styles.dangerButtonText}>
            Lokale Einnahmehistorie löschen
          </Text>
        </Pressable>
      </View>

      <View style={styles.archiveSection}>
        <Text style={styles.sectionLabel}>Archiv</Text>
        <Text style={styles.sectionTitle}>Archivierte Supplements</Text>
        <Text style={styles.sectionText}>
          Archivierte Supplements sind nicht endgültig gelöscht. Ihre
          gespeicherten Angaben bleiben erhalten und können wieder als aktive
          Supplements geführt werden.
        </Text>

        {archivedSupplements.length === 0 ? (
          <View style={styles.emptyArchiveCard}>
            <Text style={styles.emptyArchiveTitle}>Archiv ist leer</Text>
            <Text style={styles.emptyArchiveText}>
              Aktuell sind keine Supplements archiviert. Aus der aktiven
              Routine entfernte Supplements werden hier sicher aufbewahrt.
            </Text>
          </View>
        ) : (
          archivedSupplements.map((supplement) => (
            <View key={supplement.id} style={styles.archiveCard}>
              <View style={styles.archiveHeader}>
                <View style={styles.archiveTitleGroup}>
                  <Text style={styles.archiveName}>
                    {getSupplementName(supplement)}
                  </Text>
                  <Text style={styles.archiveMeta}>
                    {getSupplementDosage(supplement)}
                  </Text>
                </View>

                <View style={styles.archiveBadge}>
                  <Text style={styles.archiveBadgeText}>Archiviert</Text>
                </View>
              </View>

              <View style={styles.archiveDetail}>
                <Text style={styles.archiveDetailLabel}>
                  Gespeicherter Zweck
                </Text>
                <Text style={styles.archiveDetailText}>
                  {getSupplementPurpose(supplement)}
                </Text>
              </View>

              <View style={styles.archiveTrustRow}>
                <Text style={styles.archiveTrustLabel}>Datenstatus</Text>
                <Text style={styles.archiveTrustText}>
                  Angaben bleiben lokal erhalten
                </Text>
              </View>

              <Pressable
                onPress={() => handleRestoreSupplement(supplement)}
                style={({ pressed }) => [
                  styles.restoreButton,
                  pressed ? styles.restoreButtonPressed : null,
                ]}
              >
                <Text style={styles.restoreButtonText}>
                  Aus Archiv wiederherstellen
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeLabel}>Allgemeiner Hinweis</Text>
        <Text style={styles.noticeTitle}>Dokumentation statt Diagnose</Text>
        <Text style={styles.noticeText}>
          Die App unterstützt die strukturierte Erfassung und Organisation von
          Supplements. Sie ersetzt keine medizinische Beratung, Diagnose oder
          Behandlung.
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
  statusCard: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
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
  statusGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 16,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  statusValue: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '900',
  },
  statusLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  statusDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e2e8f0',
  },
  trustNotice: {
    backgroundColor: '#f0fdfa',
    borderColor: '#ccfbf1',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
  },
  trustNoticeTitle: {
    color: '#115e59',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 5,
  },
  trustNoticeText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 20,
  },
  historyStats: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 16,
    marginBottom: 14,
  },
  historyStat: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  historyStatValue: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '900',
  },
  historyStatLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  scopeBox: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  scopeRow: {
    gap: 4,
  },
  scopeLabel: {
    color: '#9a3412',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  scopeText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
  },
  scopeSeparator: {
    height: 1,
    backgroundColor: '#fed7aa',
    marginVertical: 10,
  },
  dangerButton: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  dangerButtonPressed: {
    opacity: 0.72,
  },
  dangerButtonText: {
    color: '#be123c',
    fontSize: 14,
    fontWeight: '900',
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
    borderColor: '#ccfbf1',
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
    marginBottom: 10,
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
  archiveTrustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  archiveTrustLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  archiveTrustText: {
    flex: 1,
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
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
  noticeCard: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
  },
  noticeLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: 7,
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
    lineHeight: 20,
  },
});
