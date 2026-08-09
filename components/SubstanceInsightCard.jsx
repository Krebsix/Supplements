import React, { useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from '../i18n';
import { getStatusMeta } from '../ReferenceCheck';
import { colors, radius, space, surfaces, toneFor, type } from '../theme';

// Mapping von ReferenceCheck-Tonnamen auf die Statusstufen aus theme.js.
// 'neutral' und 'muted' landen absichtlich auf keinem bekannten Schluessel —
// toneFor() faellt dann auf den gedeckten Default-Grauton zurueck.
function referenceTone(tone) {
  if (tone === 'ok') return toneFor('affirm');
  if (tone === 'notice') return toneFor('caution');
  if (tone === 'warn') return toneFor('alert');
  return toneFor(tone);
}

// Mapping der Lebensphasen-Severity (data/lifeStageAdvisories.js) auf die
// gleichen gedeckten Statusstufen. "attention" ordnet sich unter "caution"
// ein, "increased" ist eine Mehrbedarfs-Info, keine Warnung — daher "affirm".
function advisoryTone(severity) {
  if (severity === 'contraindicated') return toneFor('contraindicated');
  if (severity === 'medical') return toneFor('medical');
  if (severity === 'attention') return toneFor('caution');
  if (severity === 'increased') return toneFor('affirm');
  return toneFor(severity);
}

/**
 * SubstanceInsightCard
 * Zeigt zu einem erkannten Wirkstoff: was er ist, wofuer er eingesetzt
 * wird, welche Form vorliegt und wie sich die Menge zum Referenzwert
 * der gewaehlten Lebensphase verhaelt.
 *
 * Enthaelt bewusst keine Fachlogik — die liegt in ReferenceCheck.js
 * und SubstanceMatcher.js.
 */
export default function SubstanceInsightCard({ profile }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();

  if (!profile) return null;

  // Nicht zugeordneter Wirkstoff: ehrlich als unbekannt kennzeichnen
  if (!profile.matched) {
    return (
      <View style={[styles.card, styles.cardUnmatched]}>
        <Text style={styles.unmatchedName}>
          {profile.label || t('components.insight.unnamedEntry')}
        </Text>
        <Text style={styles.unmatchedNote}>{profile.note}</Text>
      </View>
    );
  }

  const check = profile.referenceCheck;
  const statusMeta = check ? getStatusMeta(check.status) : null;
  const statusTone = statusMeta ? referenceTone(statusMeta.tone) : null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.category}>{profile.category}</Text>
          <Text style={styles.name}>{profile.name}</Text>
        </View>

        {statusMeta ? (
          <View
            style={[styles.statusBadge, { backgroundColor: statusTone.surface }]}
          >
            <Text style={[styles.statusBadgeText, { color: statusTone.ink }]}>
              {statusMeta.label}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.what}>{profile.what}</Text>

      {/* Lebensphasen-Hinweise stehen bewusst vor allem anderen —
          eine Kontraindikation darf nicht im Aufklappmenue verschwinden. */}
      {(profile.advisories ?? []).map((advisory, index) => {
        const tone = advisoryTone(advisory.severity);

        return (
          <View
            key={`${advisory.severity}-${index}`}
            style={[styles.advisory, { borderLeftColor: tone.ink }]}
          >
            <Text style={[styles.advisoryLabel, { color: tone.ink }]}>
              {advisory.meta.label}
            </Text>
            <Text style={styles.advisoryText}>{advisory.text}</Text>
          </View>
        );
      })}

      {check ? (
        <View
          style={[styles.referenceBox, { borderLeftColor: statusTone.ink }]}
        >
          <Text style={styles.referenceLabel}>
            {t('components.insight.referenceHeading')}
          </Text>
          <Text style={styles.referenceSummary}>{check.summary}</Text>

          {check.upperLimit !== null ? (
            <Text style={styles.referenceMeta}>
              {t('components.insight.referenceMeta', {
                reference: check.reference,
                unit: check.unit,
                upperLimit: check.upperLimit,
              })}
            </Text>
          ) : null}

          {check.upperLimitNote ? (
            <Text style={styles.referenceNote}>{check.upperLimitNote}</Text>
          ) : null}
        </View>
      ) : null}

      {profile.form ? (
        <View style={styles.formBox}>
          <View style={styles.formHeader}>
            <Text style={styles.formLabel}>
              {t('components.insight.formLabel')}
            </Text>
            <Text style={styles.formBio}>
              {t('components.insight.formBio', {
                bioavailability: profile.form.bioavailability,
              })}
            </Text>
          </View>
          <Text style={styles.formName}>{profile.form.name}</Text>
          <Text style={styles.formNote}>{profile.form.note}</Text>
        </View>
      ) : null}

      <Text style={styles.sectionLabel}>{t('components.insight.useCases')}</Text>
      {profile.useCases.slice(0, expanded ? undefined : 3).map((useCase) => (
        <View key={useCase.topic} style={styles.useCase}>
          <Text style={styles.useCaseTopic}>{useCase.topic}</Text>
          <Text style={styles.useCaseNote}>{useCase.note}</Text>
        </View>
      ))}

      {expanded ? (
        <>
          {profile.allForms.length > 1 ? (
            <>
              <Text style={styles.sectionLabel}>
                {t('components.insight.formsCompare')}
              </Text>
              {profile.allForms.map((form) => (
                <View key={form.name} style={styles.formRow}>
                  <View style={styles.formRowHeader}>
                    <Text style={styles.formRowName}>{form.name}</Text>
                    <Text style={styles.formRowBio}>{form.bioavailability}</Text>
                  </View>
                  <Text style={styles.formRowNote}>{form.note}</Text>
                </View>
              ))}
            </>
          ) : null}

          {profile.fatSoluble ? (
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>
                {t('components.insight.fatSolubleHint')}
              </Text>
            </View>
          ) : null}

          {profile.intakeGuidance ? (
            <View style={styles.intakeBox}>
              <Text style={styles.intakeLabel}>
                {t('components.insight.intake')}
              </Text>
              <Text style={styles.intakeText}>
                {profile.intakeGuidance.note}
              </Text>
            </View>
          ) : null}

          {profile.cautionNote ? (
            <View style={styles.cautionBox}>
              <Text style={styles.cautionLabel}>
                {t('components.insight.caution')}
              </Text>
              <Text style={styles.cautionText}>{profile.cautionNote}</Text>
            </View>
          ) : null}

          {profile.sources?.length > 0 ? (
            <View style={styles.sourcesBox}>
              <Text style={styles.sourcesLabel}>
                {t('components.insight.sources')}
              </Text>
              {profile.sources.map((source, index) => (
                <TouchableOpacity
                  key={`${source.label}-${index}`}
                  disabled={!source.url}
                  onPress={() => source.url && Linking.openURL(source.url)}
                  activeOpacity={0.7}
                  accessibilityRole={source.url ? 'link' : undefined}
                >
                  <Text
                    style={[styles.sourceText, source.url && styles.sourceTextLinked]}
                  >
                    {source.url ? '↗ ' : '· '}
                    {source.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </>
      ) : null}

      <TouchableOpacity
        style={styles.expandButton}
        onPress={() => setExpanded((value) => !value)}
        activeOpacity={0.75}
        accessibilityRole="button"
      >
        <Text style={styles.expandButtonText}>
          {expanded
            ? t('components.insight.showLess')
            : t('components.insight.showMore')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const cautionTone = toneFor('caution');
const alertTone = toneFor('alert');

const styles = StyleSheet.create({
  card: {
    ...surfaces.card,
  },
  cardUnmatched: {
    backgroundColor: colors.surfaceSunken,
    borderStyle: 'dashed',
  },
  unmatchedName: {
    ...type.bodyStrong,
  },
  unmatchedNote: {
    ...type.small,
    marginTop: space.xs + 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    paddingRight: space.sm + 2,
  },
  category: {
    ...type.label,
    color: colors.accent,
  },
  name: {
    ...type.heading,
    marginTop: 3,
  },
  statusBadge: {
    borderRadius: radius.md,
    paddingHorizontal: space.sm + 1,
    paddingVertical: space.xs,
    maxWidth: 132,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  what: {
    ...type.body,
    marginTop: space.sm + 1,
  },
  advisory: {
    backgroundColor: colors.surfaceSunken,
    borderLeftWidth: 3,
    borderRadius: radius.md,
    padding: space.sm + 3,
    marginTop: space.sm + 2,
  },
  advisoryLabel: {
    ...type.label,
  },
  advisoryText: {
    color: colors.ink,
    fontSize: 12,
    lineHeight: 18,
    marginTop: space.xs,
  },
  referenceBox: {
    backgroundColor: colors.surfaceSunken,
    borderLeftWidth: 3,
    borderRadius: radius.md,
    padding: space.md,
    marginTop: space.md + 1,
  },
  referenceLabel: {
    ...type.label,
    color: colors.inkMuted,
  },
  referenceSummary: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    marginTop: space.xs + 1,
  },
  referenceMeta: {
    ...type.small,
    marginTop: space.sm - 1,
    fontWeight: '700',
  },
  referenceNote: {
    ...type.small,
    marginTop: space.xs + 1,
  },
  formBox: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: space.md,
    marginTop: space.sm + 3,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formLabel: {
    ...type.label,
    color: colors.accent,
  },
  formBio: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  formName: {
    ...type.bodyStrong,
    marginTop: space.xs,
  },
  formNote: {
    color: colors.accentInk,
    fontSize: 12,
    lineHeight: 18,
    marginTop: space.xs,
  },
  sectionLabel: {
    ...type.label,
    color: colors.inkMuted,
    marginTop: space.lg - 1,
    marginBottom: space.sm - 1,
  },
  useCase: {
    marginBottom: space.sm + 1,
  },
  useCaseTopic: {
    ...type.bodyStrong,
    fontSize: 13,
  },
  useCaseNote: {
    ...type.small,
    marginTop: 2,
  },
  formRow: {
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    paddingTop: space.sm,
    marginBottom: space.sm,
  },
  formRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formRowName: {
    ...type.bodyStrong,
    fontSize: 13,
    flex: 1,
  },
  formRowBio: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  formRowNote: {
    ...type.small,
    marginTop: 3,
  },
  hintBox: {
    backgroundColor: cautionTone.surface,
    borderRadius: radius.md,
    padding: space.sm + 3,
    marginTop: space.sm + 2,
  },
  hintText: {
    color: cautionTone.ink,
    fontSize: 12,
    lineHeight: 18,
  },
  intakeBox: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: space.sm + 3,
    marginTop: space.sm + 2,
  },
  intakeLabel: {
    ...type.label,
    color: colors.accentInk,
  },
  intakeText: {
    color: colors.accentInk,
    fontSize: 12,
    lineHeight: 18,
    marginTop: space.xs,
  },
  cautionBox: {
    backgroundColor: alertTone.surface,
    borderRadius: radius.md,
    padding: space.sm + 3,
    marginTop: space.sm + 2,
  },
  cautionLabel: {
    ...type.label,
    color: alertTone.ink,
  },
  cautionText: {
    color: alertTone.ink,
    fontSize: 12,
    lineHeight: 18,
    marginTop: space.xs,
  },
  sourcesBox: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    padding: space.sm + 3,
    marginTop: space.sm + 2,
  },
  sourcesLabel: {
    ...type.label,
    color: colors.inkMuted,
    marginBottom: space.xs + 1,
  },
  sourceText: {
    ...type.small,
    marginTop: 3,
  },
  sourceTextLinked: {
    color: colors.accent,
    fontWeight: '700',
  },
  expandButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.sm,
  },
  expandButtonText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '900',
  },
});
