import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';


import LifeStagePicker from '../../../components/LifeStagePicker';
import SubstanceInsightCard from '../../../components/SubstanceInsightCard';
import { buildSubstanceProfile } from '../../../ReferenceCheck';
import { matchIngredient } from '../../../SubstanceMatcher';
import { buildComplaintView, findComplaints } from '../../../ComplaintSearch';
import ComplaintCard from '../../../components/ComplaintCard';
import { getSubstance, substances } from '../../../data/substances';
import { listCatalogBrandSections } from '../../../SeedCatalog';
import useStore from '../../../useStore';
import { useTranslation } from '../../../i18n';
import { colors, radius, space, surfaces, type } from '../../../theme';

// Bewusst nicht uebersetzt: die Chips fuettern die Suche direkt gegen die
// (vorerst deutsche) Wirkstoff-Datenbank. Eine Uebersetzung wuerde die
// Treffer in anderen Sprachen veraendern statt nur die Oberflaeche.
const examples = ['Magnesium', 'Vitamin D', 'Omega 3', 'Zink', 'Eisen'];

// Freitextsuche ueber Name, Synonyme und Anwendungsgebiete —
// damit auch "Kraempfe" oder "Schlaf" zu Treffern fuehrt.
function searchSubstances(query) {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];

  return substances.filter((substance) => {
    const haystack = [
      substance.name,
      ...(substance.synonyms ?? []),
      ...(substance.useCases ?? []).map((useCase) => useCase.topic),
      substance.category,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(needle);
  });
}

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  // In der Kategorie-Ansicht ist immer nur ein Eintrag aufgeklappt:
  // kompakte Zeilen halten die Uebersicht, die Vollkarte kommt auf Tipp.
  const [expandedSubstanceId, setExpandedSubstanceId] = useState(null);

  // Tipp auf einen Hinweis oder Konflikt im Tagesplan (SlotReason.jsx)
  // fuehrt hierher mit ?substance=<id>. Der Parameter fuellt die
  // Freitextsuche mit dem Klarnamen -- so oeffnet sich das
  // Wirkstoff-Profil ueber denselben Weg wie eine normale Suche, statt
  // einen zweiten Anzeigepfad zu pflegen.
  const substanceParam = Array.isArray(params.substance) ? params.substance[0] : params.substance;
  useEffect(() => {
    if (!substanceParam) return;
    const substance = getSubstance(substanceParam);
    if (!substance?.name) return;
    setQuery(substance.name);
    setActiveCategory(null);
  }, [substanceParam]);

  const activeLifeStageId = useStore((state) => state.activeLifeStageId);
  const setActiveLifeStage = useStore((state) => state.setActiveLifeStage);
  const activeSupplements = useStore((state) => state.getActiveSupplements());

  const results = useMemo(() => searchSubstances(query), [query]);

  // Register: alle Kategorien mit Bestandszahl, alphabetisch — wie das
  // Verzeichnis eines Nachschlagewerks, nicht wie eine Chip-Wolke.
  const categories = useMemo(() => {
    const counts = new Map();
    for (const substance of substances) {
      if (!substance.category) continue;
      counts.set(substance.category, (counts.get(substance.category) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }, []);

  // Marken-Register: Kennzahlen fuer die Einstiegszeile. Zeigt, wie viele
  // Marken und Produkte der kuratierte Katalog bereits kennt.
  const brandStats = useMemo(() => {
    const sections = listCatalogBrandSections();
    let brands = 0;
    let products = 0;
    for (const section of sections) {
      brands += section.brands.length;
      for (const entry of section.brands) products += entry.productCount;
    }
    return { brands, products };
  }, []);

  const categoryResults = useMemo(() => {
    if (!activeCategory) return [];
    return substances
      .filter((substance) => substance.category === activeCategory)
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }, [activeCategory]);

  // Ohne Mengenangabe zeigt die Karte Wissen und Referenzwert,
  // aber keinen Mengenabgleich — das ist hier korrekt. Die Freitextsuche
  // hat Vorrang vor dem Kategorie-Register.
  const hasQuery = query.trim().length >= 2;
  const profileSource = hasQuery ? results : categoryResults;
  const profiles = useMemo(
    () =>
      profileSource
        .map((substance) => matchIngredient({ name: substance.name }))
        .filter((match) => match?.matched)
        .map((match) => buildSubstanceProfile(match, activeLifeStageId)),
    [profileSource, activeLifeStageId]
  );

  // Beschwerdebilder zuerst: Wer einen ganzen Satz eingibt, meint eine
  // Beschwerde und keinen Wirkstoffnamen.
  const complaintHits = useMemo(() => findComplaints(query), [query]);
  const complaintViews = useMemo(
    () => complaintHits.map((complaint) => buildComplaintView(complaint, activeSupplements)),
    [complaintHits, activeSupplements]
  );

  return (
    <View style={styles.screenWrap}>
      <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.kicker}>{t('search.kicker')}</Text>
      <Text style={styles.title}>{t('search.title')}</Text>
      <Text style={styles.subtitle}>
        {t('search.subtitle')}
      </Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t('search.placeholder')}
        placeholderTextColor={colors.inkFaint}
        style={styles.input}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={t('search.placeholder')}
      />

      {!hasQuery && !activeCategory ? (
        <>
          <Text style={styles.label}>{t('search.frequentLabel')}</Text>
          <View style={styles.chips}>
            {examples.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.chip}
                onPress={() => setQuery(item)}
                activeOpacity={0.8}
                accessibilityRole="button"
              >
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Kategorien als Register eines Nachschlagewerks: vertikale
              Zeilen mit Bestandszahl und Haarlinien statt Chip-Wolke. */}
          <Text style={styles.label}>{t('search.categoriesLabel')}</Text>
          <View style={styles.registerCard}>
            {categories.map((entry, index) => (
              <TouchableOpacity
                key={entry.name}
                style={[
                  styles.registerRow,
                  index === 0 && styles.registerRowFirst,
                ]}
                onPress={() => {
                  setActiveCategory(entry.name);
                  setExpandedSubstanceId(null);
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
              >
                <Text style={styles.registerName}>{entry.name}</Text>
                <View style={styles.registerMeta}>
                  <Text style={styles.registerCount}>{entry.count}</Text>
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={colors.inkFaint}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Einstieg ins Marken-Register: welche Marken der Katalog
              bereits kennt, als eigene Verzeichnis-Seite. */}
          <TouchableOpacity
            style={styles.brandsLink}
            onPress={() => router.push('/brands')}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <View style={styles.brandsLinkTextWrap}>
              <Text style={styles.registerName}>
                {t('search.brandsLinkTitle')}
              </Text>
              <Text style={styles.entrySummary}>
                {t('search.brandsLinkText', {
                  brands: brandStats.brands,
                  products: brandStats.products,
                })}
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.inkFaint} />
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>
              {t('search.infoTitle', { count: substances.length })}
            </Text>
            <Text style={styles.infoText}>
              {t('search.infoText')}
            </Text>
          </View>
        </>
      ) : !hasQuery && activeCategory ? (
        <>
          <TouchableOpacity
            style={styles.registerBack}
            onPress={() => setActiveCategory(null)}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Feather name="chevron-left" size={16} color={colors.accent} />
            <Text style={styles.registerBackText}>
              {t('search.registerAll')}
            </Text>
          </TouchableOpacity>

          <Text style={styles.registerHeading}>{activeCategory}</Text>
          <Text style={styles.resultCount}>
            {t('search.hits', { count: profiles.length })}
          </Text>

          <LifeStagePicker
            value={activeLifeStageId}
            onChange={setActiveLifeStage}
          />

          {profiles.map((profile) => {
            const expanded = expandedSubstanceId === profile.substanceId;
            return (
              <View key={profile.substanceId}>
                <TouchableOpacity
                  style={styles.entryRowCard}
                  onPress={() =>
                    setExpandedSubstanceId(expanded ? null : profile.substanceId)
                  }
                  activeOpacity={0.7}
                  accessibilityRole="button"
                >
                  <View style={styles.entryTextWrap}>
                    <Text style={styles.registerName}>{profile.name}</Text>
                    {!expanded ? (
                      <Text style={styles.entrySummary} numberOfLines={2}>
                        {profile.what}
                      </Text>
                    ) : null}
                  </View>
                  <Feather
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.inkFaint}
                  />
                </TouchableOpacity>
                {expanded ? <SubstanceInsightCard profile={profile} /> : null}
              </View>
            );
          })}
        </>
      ) : complaintViews.length === 0 && profiles.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>{t('search.emptyTitle')}</Text>
          <Text style={styles.emptyText}>
            {t('search.emptyText', { query: query.trim() })}
          </Text>
        </View>
      ) : (
        <>
          {/* Beschwerdebilder stehen vor den Wirkstoffen: Wer einen ganzen
              Satz eingibt, sucht eine Einordnung und keine Stoffliste. */}
          {complaintViews.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>
                {t('search.complaintSectionTitle')}
              </Text>

              {complaintViews.map((view) => (
                <ComplaintCard key={view.id} view={view} />
              ))}
            </>
          ) : null}

          {profiles.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>
                {t('search.substanceSectionTitle')}
              </Text>

              <LifeStagePicker
                value={activeLifeStageId}
                onChange={setActiveLifeStage}
              />

              <Text style={styles.resultCount}>
                {t('search.hits', { count: profiles.length })}
              </Text>

              {profiles.map((profile) => (
                <SubstanceInsightCard key={profile.substanceId} profile={profile} />
              ))}
            </>
          ) : null}
        </>
      )}

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push('/menu')}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryButtonText}>{t('common.backToHome')}</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        {t('search.disclaimer')}
      </Text>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrap: surfaces.screen,
  screen: surfaces.screen,
  // Trennt die Beschwerde-Antwort von den Wirkstoff-Treffern
  sectionLabel: { ...type.label, marginTop: space.md, marginBottom: space.sm },
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
  input: {
    ...surfaces.input,
    fontSize: 16,
    padding: space.lg - 1,
    marginBottom: space.lg + 2,
  },
  label: {
    ...type.label,
    color: colors.inkMuted,
    marginBottom: space.sm + 2,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: space.xl - 2,
  },
  chip: {
    ...surfaces.chip,
    marginRight: space.sm,
    marginBottom: space.sm,
  },
  chipText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  registerCard: {
    ...surfaces.card,
    paddingVertical: 2,
    marginBottom: space.lg,
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
  entryRowCard: {
    ...surfaces.card,
    paddingVertical: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.sm,
  },
  brandsLink: {
    ...surfaces.card,
    paddingVertical: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.lg,
  },
  brandsLinkTextWrap: {
    flex: 1,
    marginRight: space.sm,
  },
  entryTextWrap: {
    flex: 1,
    marginRight: space.sm,
  },
  entrySummary: {
    ...type.small,
    marginTop: 2,
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
  infoBox: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    padding: space.lg - 2,
    marginBottom: space.lg,
  },
  infoTitle: {
    ...type.subheading,
  },
  infoText: {
    color: colors.accentInk,
    fontSize: 12,
    lineHeight: 19,
    marginTop: space.sm - 2,
  },
  emptyBox: {
    ...surfaces.card,
  },
  emptyTitle: {
    ...type.subheading,
  },
  emptyText: {
    ...type.body,
    marginTop: space.sm - 2,
  },
  resultCount: {
    ...type.label,
    color: colors.inkMuted,
    marginBottom: space.sm + 2,
  },
  secondaryButton: {
    ...surfaces.buttonQuiet,
    marginTop: space.sm + 2,
  },
  secondaryButtonText: {
    ...surfaces.buttonQuietText,
  },
  disclaimer: {
    ...type.tiny,
    textAlign: 'center',
    marginTop: space.md + 2,
    paddingHorizontal: space.sm - 2,
  },
});
