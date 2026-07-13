import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import SupplementResultCard from '../components/SupplementResultCard';
import mockScanResult from '../data/mockScanResult';
import useStore from '../useStore';

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export default function ResultsScreen() {
  const router = useRouter();

  const pendingScanResult = useStore(
    (state) => state.pendingScanResult
  );
  const setPendingScanResult = useStore(
    (state) => state.setPendingScanResult
  );
  const clearPendingScanResult = useStore(
    (state) => state.clearPendingScanResult
  );

  const isDemoFallback = !pendingScanResult;
  const result = pendingScanResult || mockScanResult;

  const brandDetected =
    hasText(result?.brand) && result.brand !== 'Demo Brand';

  const dosageAmount =
    result?.dosage?.amount ??
    result?.dosageAmount ??
    result?.amount ??
    '';

  const dosageUnit =
    result?.dosage?.unit ??
    result?.dosageUnit ??
    result?.unit ??
    '';

  const dosageDetected =
    String(dosageAmount).trim().length > 0 &&
    String(dosageUnit).trim().length > 0;

  const ingredientCount = Array.isArray(result?.detectedIngredients)
    ? result.detectedIngredients.filter(hasText).length
    : 0;

  const openCriticalCount =
    Number(!brandDetected) +
    Number(!dosageDetected) +
    Number(ingredientCount === 0);

  const reviewPointCount =
    openCriticalCount + Number(ingredientCount > 0);

  function handleOpenReviewForm() {
    if (!pendingScanResult) {
      setPendingScanResult(mockScanResult);
    }

    router.push('/AddSupplement?fromScan=1');
  }

  function handleRescan() {
    clearPendingScanResult();
    router.replace('/scanner');
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.kicker}>Analyse-Ergebnis</Text>

          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>
              {isDemoFallback ? 'Testanalyse' : 'Scan vorhanden'}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>
          Erst prüfen. Dann übernehmen.
        </Text>

        <Text style={styles.subtitle}>
          Die erkannten Angaben sind ein Arbeitsstand. Kontrolliere fehlende
          und unsichere Felder, bevor daraus ein Eintrag für deine persönliche
          Routine wird.
        </Text>
      </View>

      <View style={styles.reviewSummary}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryLabel}>Prüfstatus</Text>
            <Text style={styles.summaryTitle}>
              {reviewPointCount === 1
                ? '1 Prüfpunkt'
                : `${reviewPointCount} Prüfpunkte`}
            </Text>
          </View>

          <View
            style={[
              styles.summaryBadge,
              openCriticalCount === 0 && styles.summaryBadgeComplete,
            ]}
          >
            <Text
              style={[
                styles.summaryBadgeText,
                openCriticalCount === 0 &&
                  styles.summaryBadgeTextComplete,
              ]}
            >
              {openCriticalCount === 0
                ? 'Vollständig'
                : `${openCriticalCount} offen`}
            </Text>
          </View>
        </View>

        <Text style={styles.summaryText}>
          {openCriticalCount === 0
            ? 'Alle zentralen Felder sind vorhanden, müssen aber weiterhin mit dem Produktetikett abgeglichen werden.'
            : 'Mindestens eine zentrale Produktangabe fehlt. Die App übernimmt diese Information deshalb nicht automatisch.'}
        </Text>
      </View>

      <SupplementResultCard result={result} />

      <View style={styles.nextStepCard}>
        <Text style={styles.nextStepKicker}>Nächster Schritt</Text>
        <Text style={styles.nextStepTitle}>
          Angaben im Formular bestätigen
        </Text>
        <Text style={styles.nextStepText}>
          Im nächsten Bildschirm kannst du Name, Dosierung, Einheit und
          Tageszeit kontrollieren oder ergänzen. Erst das anschließende
          Speichern erstellt einen Routine-Eintrag.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleOpenReviewForm}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>
            Daten im Formular prüfen
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleRescan}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryButtonText}>
          Scan wiederholen
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tertiaryButton}
        onPress={() => router.replace('/')}
        activeOpacity={0.75}
        accessibilityRole="button"
      >
        <Text style={styles.tertiaryButtonText}>
          Zurück zur Startseite
        </Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Die Scan-Auswertung ersetzt keine medizinische, pharmazeutische oder
        individuelle fachliche Prüfung. Erkannte Angaben können unvollständig
        oder fehlerhaft sein.
      </Text>
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
    paddingTop: 22,
    paddingBottom: 48,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  modeBadge: {
    backgroundColor: '#ecfdf5',
    borderColor: '#99f6e4',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  modeBadgeText: {
    color: '#0f766e',
    fontSize: 10,
    fontWeight: '900',
  },
  title: {
    color: '#0f172a',
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginTop: 13,
  },
  subtitle: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 9,
  },
  reviewSummary: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: '#92400e',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  summaryTitle: {
    color: '#451a03',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 3,
  },
  summaryBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  summaryBadgeComplete: {
    backgroundColor: '#ccfbf1',
  },
  summaryBadgeText: {
    color: '#92400e',
    fontSize: 11,
    fontWeight: '900',
  },
  summaryBadgeTextComplete: {
    color: '#0f766e',
  },
  summaryText: {
    color: '#78350f',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  nextStepCard: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe4ee',
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginTop: 14,
  },
  nextStepKicker: {
    color: '#0f766e',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  nextStepTitle: {
    color: '#0f172a',
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '900',
    marginTop: 5,
  },
  nextStepText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
  primaryButton: {
    minHeight: 50,
    backgroundColor: '#0f766e',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginTop: 15,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 50,
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginTop: 11,
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '900',
  },
  tertiaryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  tertiaryButtonText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '800',
  },
  disclaimer: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 15,
    paddingHorizontal: 6,
  },
});
