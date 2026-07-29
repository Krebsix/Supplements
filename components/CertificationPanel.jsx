import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { KIND_LABELS, matchCertifications } from '../data/certifications';
import { useTranslation } from '../i18n';

/**
 * CertificationPanel
 * Zeigt erkannte Pruefsiegel als Fakten: was das Siegel prueft, wer es
 * vergibt und was es ausdruecklich NICHT abdeckt.
 *
 * Bewusst ohne Herstellerbewertung und ohne Gesamtnote — die App
 * bewertet keine Marken, sie macht Pruefbares sichtbar.
 */
export default function CertificationPanel({ labels }) {
  const [expandedId, setExpandedId] = useState(null);
  const { t } = useTranslation();

  const { matched, unknown } = matchCertifications(labels);

  if (matched.length === 0 && unknown.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>
          {t('components.certification.emptyTitle')}
        </Text>
        <Text style={styles.emptyText}>
          {t('components.certification.emptyText')}
        </Text>
      </View>
    );
  }

  return (
    <View>
      {matched.map((cert) => {
        const isOpen = expandedId === cert.id;

        return (
          <TouchableOpacity
            key={cert.id}
            style={styles.card}
            onPress={() => setExpandedId(isOpen ? null : cert.id)}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.kind}>{KIND_LABELS[cert.kind]}</Text>
                <Text style={styles.name}>{cert.name}</Text>
              </View>
              <Text style={styles.toggle}>{isOpen ? '−' : '+'}</Text>
            </View>

            <Text style={styles.what} numberOfLines={isOpen ? undefined : 2}>
              {cert.what}
            </Text>

            {isOpen ? (
              <>
                <View style={styles.scopeBox}>
                  <Text style={styles.scopeLabel}>
                    {t('components.certification.scopeLabel')}
                  </Text>
                  <Text style={styles.scopeText}>{cert.scope}</Text>
                </View>
                <Text style={styles.issuer}>
                  {t('components.certification.issuer', { issuer: cert.issuer })}
                </Text>
              </>
            ) : null}
          </TouchableOpacity>
        );
      })}

      {unknown.length > 0 ? (
        <View style={styles.unknownCard}>
          <Text style={styles.unknownLabel}>
            {t('components.certification.unknownLabel')}
          </Text>
          <Text style={styles.unknownText}>
            {unknown.join(' · ')}
          </Text>
          <Text style={styles.unknownNote}>
            {t('components.certification.unknownNote')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
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
  kind: {
    color: '#0f766e',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  name: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 3,
  },
  toggle: {
    color: '#0f766e',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  what: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },
  scopeBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 11,
    marginTop: 11,
  },
  scopeLabel: {
    color: '#92400e',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  scopeText: {
    color: '#78350f',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  issuer: {
    color: '#64748b',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 9,
  },
  emptyCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 18,
    padding: 15,
  },
  emptyTitle: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '900',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  unknownCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
  },
  unknownLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  unknownText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 5,
  },
  unknownNote: {
    color: '#64748b',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },
});
