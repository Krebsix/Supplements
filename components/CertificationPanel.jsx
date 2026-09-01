import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { KIND_LABELS, matchCertifications } from '../data/certifications';
import {
  localizeCertification,
  localizeCertificationKind,
} from '../data/localize';
import { colors, radius, space, surfaces, toneFor, type } from '../theme';
import { useTranslation } from '../i18n';

const cautionTone = toneFor('caution');

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
      {matched.map((rawCert) => {
        const cert = localizeCertification(rawCert);
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
                <Text style={styles.kind}>
                  {localizeCertificationKind(cert.kind, KIND_LABELS[cert.kind])}
                </Text>
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
    ...surfaces.card,
    marginBottom: space.sm + 2,
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
  kind: {
    ...type.label,
    color: colors.accent,
  },
  name: {
    ...type.heading,
    marginTop: 3,
  },
  toggle: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  what: {
    ...type.body,
    marginTop: space.sm - 1,
  },
  scopeBox: {
    backgroundColor: cautionTone.surface,
    borderRadius: radius.md,
    padding: space.sm + 3,
    marginTop: space.sm + 3,
  },
  scopeLabel: {
    ...type.label,
    color: cautionTone.ink,
  },
  scopeText: {
    color: cautionTone.ink,
    fontSize: 12,
    lineHeight: 18,
    marginTop: space.xs,
  },
  issuer: {
    ...type.small,
    marginTop: space.sm + 1,
  },
  emptyCard: {
    ...surfaces.card,
    borderStyle: 'dashed',
    marginBottom: 0,
  },
  emptyTitle: {
    ...type.subheading,
  },
  emptyText: {
    ...type.body,
    marginTop: space.xs + 1,
  },
  unknownCard: {
    ...surfaces.card,
  },
  unknownLabel: {
    ...type.label,
  },
  unknownText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
    marginTop: space.xs + 1,
  },
  unknownNote: {
    ...type.small,
    marginTop: space.xs + 2,
  },
});
