import React, { useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getStatusMeta } from '../ReferenceCheck';

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

  if (!profile) return null;

  // Nicht zugeordneter Wirkstoff: ehrlich als unbekannt kennzeichnen
  if (!profile.matched) {
    return (
      <View style={[styles.card, styles.cardUnmatched]}>
        <Text style={styles.unmatchedName}>{profile.label || 'Unbenannter Eintrag'}</Text>
        <Text style={styles.unmatchedNote}>{profile.note}</Text>
      </View>
    );
  }

  const check = profile.referenceCheck;
  const statusMeta = check ? getStatusMeta(check.status) : null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.category}>{profile.category}</Text>
          <Text style={styles.name}>{profile.name}</Text>
        </View>

        {statusMeta ? (
          <View
            style={[styles.statusBadge, { borderColor: statusMeta.hex }]}
          >
            <Text style={[styles.statusBadgeText, { color: statusMeta.hex }]}>
              {statusMeta.label}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.what}>{profile.what}</Text>

      {/* Lebensphasen-Hinweise stehen bewusst vor allem anderen —
          eine Kontraindikation darf nicht im Aufklappmenue verschwinden. */}
      {(profile.advisories ?? []).map((advisory, index) => (
        <View
          key={`${advisory.severity}-${index}`}
          style={[
            styles.advisory,
            { borderLeftColor: advisory.meta.hex },
          ]}
        >
          <Text style={[styles.advisoryLabel, { color: advisory.meta.hex }]}>
            {advisory.meta.label}
          </Text>
          <Text style={styles.advisoryText}>{advisory.text}</Text>
        </View>
      ))}

      {check ? (
        <View
          style={[
            styles.referenceBox,
            { borderLeftColor: statusMeta.hex },
          ]}
        >
          <Text style={styles.referenceLabel}>Abgleich mit Referenzwert</Text>
          <Text style={styles.referenceSummary}>{check.summary}</Text>

          {check.upperLimit !== null ? (
            <Text style={styles.referenceMeta}>
              Referenzwert {check.reference} {check.unit} · Obergrenze{' '}
              {check.upperLimit} {check.unit} pro Tag
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
            <Text style={styles.formLabel}>Erkannte Form</Text>
            <Text style={styles.formBio}>
              Aufnahme: {profile.form.bioavailability}
            </Text>
          </View>
          <Text style={styles.formName}>{profile.form.name}</Text>
          <Text style={styles.formNote}>{profile.form.note}</Text>
        </View>
      ) : null}

      <Text style={styles.sectionLabel}>Anwendungsgebiete</Text>
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
              <Text style={styles.sectionLabel}>Formen im Vergleich</Text>
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
                Fettlöslich — die Aufnahme ist zu einer Mahlzeit mit Fett
                deutlich besser.
              </Text>
            </View>
          ) : null}

          {profile.cautionNote ? (
            <View style={styles.cautionBox}>
              <Text style={styles.cautionLabel}>Zu beachten</Text>
              <Text style={styles.cautionText}>{profile.cautionNote}</Text>
            </View>
          ) : null}

          {profile.sources?.length > 0 ? (
            <View style={styles.sourcesBox}>
              <Text style={styles.sourcesLabel}>Quellen</Text>
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
          {expanded ? 'Weniger anzeigen' : 'Formen und Hinweise anzeigen'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  cardUnmatched: {
    backgroundColor: '#f8fafc',
    borderStyle: 'dashed',
  },
  unmatchedName: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '800',
  },
  unmatchedNote: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    paddingRight: 10,
  },
  category: {
    color: '#0f766e',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  name: {
    color: '#0f172a',
    fontSize: 19,
    fontWeight: '900',
    marginTop: 3,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    maxWidth: 132,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  what: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 9,
  },
  advisory: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    borderRadius: 12,
    padding: 11,
    marginTop: 10,
  },
  advisoryLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  advisoryText: {
    color: '#334155',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  referenceBox: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    borderRadius: 12,
    padding: 12,
    marginTop: 13,
  },
  referenceLabel: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  referenceSummary: {
    color: '#0f172a',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    marginTop: 5,
  },
  referenceMeta: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 7,
    fontWeight: '700',
  },
  referenceNote: {
    color: '#64748b',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  formBox: {
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    padding: 12,
    marginTop: 11,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formLabel: {
    color: '#0f766e',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  formBio: {
    color: '#0f766e',
    fontSize: 11,
    fontWeight: '800',
  },
  formName: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  formNote: {
    color: '#0f766e',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  sectionLabel: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginTop: 15,
    marginBottom: 7,
  },
  useCase: {
    marginBottom: 9,
  },
  useCaseTopic: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
  },
  useCaseNote: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  formRow: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
    marginBottom: 8,
  },
  formRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formRowName: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  formRowBio: {
    color: '#0f766e',
    fontSize: 11,
    fontWeight: '800',
  },
  formRowNote: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  hintBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 11,
    marginTop: 10,
  },
  hintText: {
    color: '#92400e',
    fontSize: 12,
    lineHeight: 18,
  },
  cautionBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 11,
    marginTop: 10,
  },
  cautionLabel: {
    color: '#b91c1c',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  cautionText: {
    color: '#991b1b',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  sourcesBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 11,
    marginTop: 10,
  },
  sourcesLabel: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  sourceText: {
    color: '#64748b',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },
  sourceTextLinked: {
    color: '#0f766e',
    fontWeight: '700',
  },
  expandButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  expandButtonText: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '900',
  },
});
