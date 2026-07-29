import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ALL_SECTIONS, EXPORT_SECTIONS, buildReport } from '../ExportBuilder';
import { useTranslation } from '../i18n';
import useStore from '../useStore';

const SECTION_ORDER = [
  { id: EXPORT_SECTIONS.SUPPLEMENTS, labelKey: 'export.section.supplements' },
  { id: EXPORT_SECTIONS.TOTALS, labelKey: 'export.section.totals' },
  { id: EXPORT_SECTIONS.PROFILE, labelKey: 'export.section.profile' },
  { id: EXPORT_SECTIONS.LAB, labelKey: 'export.section.lab' },
  { id: EXPORT_SECTIONS.OUTCOMES, labelKey: 'export.section.outcomes' },
  { id: EXPORT_SECTIONS.ADHERENCE, labelKey: 'export.section.adherence' },
];

/**
 * Bericht fuer Praxis oder Apotheke
 *
 * Die Auswahl der Abschnitte ist bewusst der erste Schritt und nicht in
 * den Einstellungen versteckt: Was hier hineinkommt, verlaesst unter
 * Umstaenden das Geraet. Gesundheitsdaten sollen nicht mitwandern, nur
 * weil sie in der App liegen — deshalb sind Profil und Laborwerte
 * standardmaessig abgewaehlt.
 */
export default function ExportScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const supplements = useStore((state) => state.getActiveSupplements());
  const intakeLogs = useStore((state) => state.intakeLogs);
  const trials = useStore((state) => state.trials);
  const trialRatings = useStore((state) => state.trialRatings);
  const labValues = useStore((state) => state.labValues);
  const profile = useStore((state) => state.profile);
  const lifeStageId = useStore((state) => state.activeLifeStageId);

  const [selected, setSelected] = useState([
    EXPORT_SECTIONS.SUPPLEMENTS,
    EXPORT_SECTIONS.TOTALS,
    EXPORT_SECTIONS.ADHERENCE,
  ]);

  const report = useMemo(
    () =>
      buildReport(
        { supplements, intakeLogs, trials, trialRatings, labValues, profile, lifeStageId },
        { sections: selected }
      ),
    [supplements, intakeLogs, trials, trialRatings, labValues, profile, lifeStageId, selected]
  );

  function toggle(sectionId) {
    setSelected((current) =>
      current.includes(sectionId)
        ? current.filter((entry) => entry !== sectionId)
        : [...current, sectionId]
    );
  }

  async function shareReport() {
    // Share statt Clipboard: Die Nutzerin sieht das Systemdialog und
    // entscheidet dort, wohin der Bericht geht.
    try {
      await Share.share({ message: report });
    } catch {
      // Abbruch durch die Nutzerin ist kein Fehler.
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{t('export.kicker')}</Text>
      <Text style={styles.title}>{t('export.screenTitle')}</Text>
      <Text style={styles.subtitle}>{t('export.screenSubtitle')}</Text>

      <Text style={styles.sectionTitle}>{t('export.sections')}</Text>

      <View style={styles.card}>
        {SECTION_ORDER.map((section) => {
          const isActive = selected.includes(section.id);
          return (
            <TouchableOpacity
              key={section.id}
              style={styles.checkRow}
              onPress={() => toggle(section.id)}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isActive }}
            >
              <View style={[styles.checkbox, isActive && styles.checkboxActive]}>
                {isActive ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={styles.checkLabel}>{t(section.labelKey)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={shareReport}>
        <Text style={styles.primaryButtonText}>{t('export.copy')}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>{t('export.preview')}</Text>
      <View style={styles.previewCard}>
        <Text style={styles.previewText}>{report}</Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
        <Text style={styles.backButtonText}>{t('common.backToHome')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 44 },
  kicker: {
    color: '#0f766e', fontSize: 13, fontWeight: '800',
    letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8,
  },
  title: { color: '#0f172a', fontSize: 26, lineHeight: 32, fontWeight: '800' },
  subtitle: { color: '#475569', fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 8 },
  sectionTitle: { color: '#0f172a', fontSize: 16, fontWeight: '800', marginTop: 14, marginBottom: 10 },
  card: {
    backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderWidth: 1,
    borderRadius: 18, padding: 6, marginBottom: 14,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 10 },
  checkbox: {
    width: 22, height: 22, borderRadius: 7,
    borderColor: '#cbd5e1', borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', marginRight: 11,
  },
  checkboxActive: { backgroundColor: '#0f766e', borderColor: '#0f766e' },
  checkmark: { color: '#ffffff', fontSize: 13, fontWeight: '900' },
  checkLabel: { color: '#0f172a', fontSize: 14, fontWeight: '600', flex: 1 },
  primaryButton: {
    backgroundColor: '#0f766e', borderRadius: 999,
    paddingVertical: 14, alignItems: 'center',
  },
  primaryButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  previewCard: {
    backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderWidth: 1,
    borderRadius: 16, padding: 14, marginBottom: 16,
  },
  previewText: {
    color: '#334155',
    fontSize: 11,
    lineHeight: 17,
    fontFamily: 'Courier',
  },
  backButton: {
    backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', borderWidth: 1,
    borderRadius: 999, paddingVertical: 14, alignItems: 'center',
  },
  backButtonText: { color: '#0f172a', fontSize: 15, fontWeight: '800' },
});
