import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';


import LifeStagePicker from '../../../components/LifeStagePicker';
import SubstanceInsightCard from '../../../components/SubstanceInsightCard';
import { buildSubstanceProfile } from '../../../ReferenceCheck';
import { matchIngredient } from '../../../SubstanceMatcher';
import { buildComplaintView, findComplaints } from '../../../ComplaintSearch';
import ComplaintCard from '../../../components/ComplaintCard';
import { substances } from '../../../data/substances';
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
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const activeLifeStageId = useStore((state) => state.activeLifeStageId);
  const setActiveLifeStage = useStore((state) => state.setActiveLifeStage);
  const activeSupplements = useStore((state) => state.getActiveSupplements());

  const results = useMemo(() => searchSubstances(query), [query]);

  // Ohne Mengenangabe zeigt die Karte Wissen und Referenzwert,
  // aber keinen Mengenabgleich — das ist hier korrekt.
  const profiles = useMemo(
    () =>
      results
        .map((substance) => matchIngredient({ name: substance.name }))
        .filter((match) => match?.matched)
        .map((match) => buildSubstanceProfile(match, activeLifeStageId)),
    [results, activeLifeStageId]
  );

  // Beschwerdebilder zuerst: Wer einen ganzen Satz eingibt, meint eine
  // Beschwerde und keinen Wirkstoffnamen.
  const complaintHits = useMemo(() => findComplaints(query), [query]);
  const complaintViews = useMemo(
    () => complaintHits.map((complaint) => buildComplaintView(complaint, activeSupplements)),
    [complaintHits, activeSupplements]
  );

  const hasQuery = query.trim().length >= 2;

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

      {!hasQuery ? (
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

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>
              {t('search.infoTitle', { count: substances.length })}
            </Text>
            <Text style={styles.infoText}>
              {t('search.infoText')}
            </Text>
          </View>
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
    fontSize: 29,
    lineHeight: 35,
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
