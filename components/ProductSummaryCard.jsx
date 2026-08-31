import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { certificationById } from '../data/certifications';
import { useTranslation } from '../i18n';
import { colors, space, surfaces, type } from '../theme';

/**
 * Produktkarte oben auf dem Screen "Aufnehmen": zeigt, was die App schon
 * weiss (Name, Marke, Inhaltsstoffe je Portion). "Aendern" klappt im
 * Screen die Felder auf. Beim Foto-Scan steht eine Pruefzeile darueber.
 */
export default function ProductSummaryCard({
  name,
  brand,
  ingredientDetails = [],
  dosage,
  scanned = false,
  onEdit,
  certifications = [],
}) {
  const { t } = useTranslation();
  const details = Array.isArray(ingredientDetails)
    ? ingredientDetails.filter((detail) => detail?.name).slice(0, 4)
    : [];
  const detailLine = details
    .map((detail) => {
      const amount = [detail.amount, detail.unit].filter(Boolean).join(' ');
      const form = detail.form ? ` (${detail.form})` : '';
      return amount ? `${amount} ${detail.name}${form}` : `${detail.name}${form}`;
    })
    .join(' · ');
  const dosageLine =
    dosage?.amount && dosage?.unit ? `${dosage.amount} ${dosage.unit}` : null;

  return (
    <View>
      {scanned ? <Text style={styles.scanHint}>{t('addSupplement.scanHint')}</Text> : null}
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titles}>
            <Text style={styles.name}>{name}</Text>
            {brand ? <Text style={styles.brand}>{brand}</Text> : null}
          </View>
          {onEdit ? (
            <Pressable
              onPress={onEdit}
              style={styles.edit}
              accessibilityRole="button"
              // Tippflaeche 44 pt (CLAUDE.md Bedienregeln): hitSlop=8 reichte
              // bei ~20 pt Inhalt nicht aus.
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            >
              <Text style={styles.editText}>{t('addSupplement.product.change')}</Text>
              <Feather name="edit-2" size={14} color={colors.accent} />
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.details}>
          {detailLine || dosageLine || t('addSupplement.product.noDetails')}
        </Text>
        {/* Belegte Siegel-Referenzen (data/seedProducts.json): nur mit
            Quelle erfasst, deskriptiv formuliert, Antippen oeffnet sie. */}
        {(Array.isArray(certifications) ? certifications : [])
          .map((cert) => ({ cert, meta: certificationById(cert.id) }))
          .filter((item) => item.meta)
          .map(({ cert, meta }) => (
            <Pressable
              key={`${cert.id}-${cert.level}`}
              onPress={() => cert.sourceUrl && Linking.openURL(cert.sourceUrl)}
              accessibilityRole={cert.sourceUrl ? 'link' : undefined}
              // Tippflaeche 44 pt (CLAUDE.md Bedienregeln): hitSlop=6 reichte
              // bei ~20 pt Inhalt nicht aus.
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            >
              <Text style={styles.certLine}>
                {t(
                  cert.level === 'law'
                    ? 'addSupplement.product.cert.law'
                    : cert.level === 'brand'
                      ? 'addSupplement.product.cert.brand'
                      : 'addSupplement.product.cert.product',
                  { name: meta.name, date: String(cert.checkedAt ?? '').slice(0, 7) }
                )}
              </Text>
            </Pressable>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scanHint: { ...type.small, marginBottom: space.sm },
  card: { ...surfaces.card, padding: space.lg },
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  titles: { flex: 1, paddingRight: space.md },
  name: { ...type.subheading },
  brand: { ...type.small, marginTop: 2 },
  edit: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  editText: { ...type.small, color: colors.accent },
  details: { ...type.body, marginTop: space.sm },
  certLine: { ...type.small, color: colors.accent, marginTop: space.sm },
});
