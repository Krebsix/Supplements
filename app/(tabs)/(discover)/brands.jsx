import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  listCatalogBrandSections,
  productsForBrand,
  seedEntryToScanDraft,
} from '../../../SeedCatalog';
import useStore from '../../../useStore';
import { useTranslation } from '../../../i18n';
import { colors, space, surfaces, type } from '../../../theme';

// Marken-Register: zeigt, welche Marken der kuratierte Katalog bereits
// kennt — als Verzeichnis eines Nachschlagewerks, nach Vertriebsweg
// gruppiert. Bewusst ohne jede Wertung (Projektregel: keine
// Qualitaets-Rankings von Marken); sortiert wird alphabetisch.
export default function BrandsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeBrand, setActiveBrand] = useState(null);

  const saveScanResult = useStore((state) => state.saveScanResult);
  const setPendingScanResult = useStore((state) => state.setPendingScanResult);

  const sections = useMemo(() => listCatalogBrandSections(), []);
  const brandProducts = useMemo(
    () => (activeBrand ? productsForBrand(activeBrand.brand) : []),
    [activeBrand]
  );

  // Katalog-Eintrag als Scan-Entwurf uebernehmen: derselbe Pfad wie die
  // Namenssuche im Scanner, inklusive Herkunfts-Kennzeichnung und
  // Klassen-Hinweisen (seedEntryToScanDraft).
  function handlePickProduct(entry) {
    const storedScan = saveScanResult(seedEntryToScanDraft(entry));
    setPendingScanResult(storedScan);
    router.push('/results');
  }

  function countLabel(count) {
    return count === 1
      ? t('brands.count_one')
      : t('brands.count_other', { count });
  }

  return (
    <View style={styles.screenWrap}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!activeBrand ? (
          <>
            <Text style={styles.kicker}>{t('brands.kicker')}</Text>
            <Text style={styles.title}>{t('brands.title')}</Text>
            <Text style={styles.subtitle}>{t('brands.subtitle')}</Text>

            {sections.map((section) => (
              <View key={section.id}>
                <Text style={styles.sectionLabel}>
                  {t(`brands.section.${section.id}`)}
                </Text>
                <View style={styles.registerCard}>
                  {section.brands.map((entry, index) => (
                    <TouchableOpacity
                      key={entry.brand}
                      style={[
                        styles.registerRow,
                        index === 0 && styles.registerRowFirst,
                      ]}
                      onPress={() => setActiveBrand(entry)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                    >
                      <Text style={styles.registerName}>{entry.brand}</Text>
                      <View style={styles.registerMeta}>
                        <Text style={styles.registerCount}>
                          {entry.productCount}
                        </Text>
                        <Feather
                          name="chevron-right"
                          size={16}
                          color={colors.inkFaint}
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.registerBack}
              onPress={() => setActiveBrand(null)}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <Feather name="chevron-left" size={16} color={colors.accent} />
              <Text style={styles.registerBackText}>
                {t('brands.registerAll')}
              </Text>
            </TouchableOpacity>

            <Text style={styles.registerHeading}>{activeBrand.brand}</Text>
            {activeBrand.brandOwner ? (
              <Text style={styles.ownerText}>
                {t('brands.owner', { name: activeBrand.brandOwner })}
              </Text>
            ) : null}
            <Text style={styles.resultCount}>
              {countLabel(brandProducts.length)}
            </Text>
            <Text style={styles.hintText}>{t('brands.productHint')}</Text>

            {brandProducts.map((entry, index) => {
              const meta = [entry.category, entry.doseForm]
                .filter(Boolean)
                .join(' · ');
              return (
                <TouchableOpacity
                  key={`${entry.name}-${index}`}
                  style={styles.entryRowCard}
                  onPress={() => handlePickProduct(entry)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                >
                  <View style={styles.entryTextWrap}>
                    <Text style={styles.registerName}>{entry.name}</Text>
                    {meta ? (
                      <Text style={styles.entrySummary} numberOfLines={1}>
                        {meta}
                      </Text>
                    ) : null}
                  </View>
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={colors.inkFaint}
                  />
                </TouchableOpacity>
              );
            })}
          </>
        )}

        <Text style={styles.disclaimer}>{t('brands.disclaimer')}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrap: surfaces.screen,
  screen: surfaces.screen,
  content: {
    paddingHorizontal: space.xl - 2,
    paddingTop: space.xl + 4,
    paddingBottom: 48,
  },
  kicker: {
    ...type.eyebrow,
  },
  title: {
    ...type.display,
    marginTop: space.sm,
  },
  subtitle: {
    ...type.body,
    marginTop: space.sm,
    marginBottom: space.lg + 2,
  },
  sectionLabel: {
    ...type.label,
    color: colors.inkMuted,
    marginTop: space.md,
    marginBottom: space.sm + 2,
  },
  registerCard: {
    ...surfaces.card,
    paddingVertical: 2,
    marginBottom: space.sm,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.md + 1,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  registerRowFirst: {
    borderTopWidth: 0,
  },
  registerName: {
    ...type.subheading,
  },
  registerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerCount: {
    ...type.small,
    color: colors.inkFaint,
    marginRight: space.sm - 2,
    fontVariant: ['tabular-nums'],
  },
  registerBack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space.sm,
  },
  registerBackText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 2,
  },
  registerHeading: {
    ...type.heading,
    marginBottom: space.xs,
  },
  ownerText: {
    ...type.small,
    color: colors.inkMuted,
    marginBottom: space.xs,
  },
  resultCount: {
    ...type.label,
    color: colors.inkMuted,
    marginBottom: space.xs,
  },
  hintText: {
    ...type.small,
    color: colors.inkMuted,
    marginBottom: space.md,
  },
  entryRowCard: {
    ...surfaces.card,
    paddingVertical: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.sm,
  },
  entryTextWrap: {
    flex: 1,
    marginRight: space.sm,
  },
  entrySummary: {
    ...type.small,
    marginTop: 2,
  },
  disclaimer: {
    ...type.tiny,
    textAlign: 'center',
    marginTop: space.md + 2,
    paddingHorizontal: space.sm - 2,
  },
});
