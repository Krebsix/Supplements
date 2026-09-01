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

import { ALL_SECTIONS, EXPORT_SECTIONS, buildReport } from '../../../ExportBuilder';
import { useTranslation } from '../../../i18n';
import useStore from '../../../useStore';
import { colors, radius, space, surfaces, type } from '../../../theme';

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

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/menu')}>
        <Text style={styles.backButtonText}>{t('common.backToHome')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { ...surfaces.screen },
  content: { ...surfaces.content },
  kicker: { ...type.eyebrow, marginBottom: space.sm },
  title: { ...type.display },
  subtitle: { ...type.body, marginTop: space.md, marginBottom: space.sm },
  sectionTitle: { ...type.heading, marginTop: space.lg - 2, marginBottom: space.md },
  card: { ...surfaces.card, padding: space.sm - 2 },
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: space.sm + 2 },
  checkbox: {
    // Dynamic Type: minWidth/minHeight statt fester Groesse, damit die
    // Box mit dem Haekchen-Text mitwaechst statt es abzuschneiden.
    minWidth: 22, minHeight: 22, borderRadius: radius.sm,
    borderColor: colors.ruleStrong, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', marginRight: 11,
  },
  checkboxActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: colors.surface, fontSize: 13, fontWeight: '700' },
  checkLabel: { color: colors.ink, fontSize: 14, fontWeight: '600', flex: 1 },
  primaryButton: { ...surfaces.buttonPrimary },
  primaryButtonText: { ...surfaces.buttonPrimaryText },
  previewCard: { ...surfaces.card, padding: space.md, marginBottom: space.lg },
  // Monospace bleibt bewusst: das ist eine Textvorschau, keine Ueberschrift.
  previewText: {
    color: colors.inkMuted,
    fontSize: 11,
    lineHeight: 17,
    fontFamily: 'Courier',
  },
  backButton: { ...surfaces.buttonQuiet },
  backButtonText: { ...surfaces.buttonQuietText, fontSize: 15 },
});
