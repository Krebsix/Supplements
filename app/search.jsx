import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import LifeStagePicker from '../components/LifeStagePicker';
import SubstanceInsightCard from '../components/SubstanceInsightCard';
import { buildSubstanceProfile } from '../ReferenceCheck';
import { matchIngredient } from '../SubstanceMatcher';
import { substances } from '../data/substances';
import useStore from '../useStore';

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
  const [query, setQuery] = useState('');

  const activeLifeStageId = useStore((state) => state.activeLifeStageId);
  const setActiveLifeStage = useStore((state) => state.setActiveLifeStage);

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

  const hasQuery = query.trim().length >= 2;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.kicker}>Wirkstoff-Datenbank</Text>
      <Text style={styles.title}>Nachschlagen statt raten.</Text>
      <Text style={styles.subtitle}>
        Suche nach einem Wirkstoff oder nach einem Anwendungsgebiet — etwa
        „Krämpfe“, „Schlaf“ oder „Immunsystem“.
      </Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="z. B. Magnesium oder Krämpfe"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        autoCorrect={false}
        returnKeyType="search"
      />

      {!hasQuery ? (
        <>
          <Text style={styles.label}>Häufig gesucht</Text>
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
              {substances.length} Wirkstoffe hinterlegt
            </Text>
            <Text style={styles.infoText}>
              Zu jedem Wirkstoff: Anwendungsgebiete, Unterschiede zwischen den
              chemischen Formen und der Abgleich mit öffentlichen
              Referenzwerten je Lebensphase.
            </Text>
          </View>
        </>
      ) : profiles.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Kein Treffer</Text>
          <Text style={styles.emptyText}>
            „{query.trim()}“ ist in der Wirkstoff-Datenbank noch nicht
            hinterlegt. Die Datenbank wird laufend erweitert.
          </Text>
        </View>
      ) : (
        <>
          <LifeStagePicker
            value={activeLifeStageId}
            onChange={setActiveLifeStage}
          />

          <Text style={styles.resultCount}>
            {profiles.length === 1
              ? '1 Treffer'
              : `${profiles.length} Treffer`}
          </Text>

          {profiles.map((profile) => (
            <SubstanceInsightCard key={profile.substanceId} profile={profile} />
          ))}
        </>
      )}

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push('/')}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryButtonText}>Zurück zur Startseite</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Die Angaben dienen der Einordnung und ersetzen keine medizinische oder
        pharmazeutische Beratung.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 48,
  },
  kicker: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0f172a',
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginTop: 8,
  },
  subtitle: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 18,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 16,
    color: '#0f172a',
    fontSize: 16,
    padding: 15,
    marginBottom: 18,
  },
  label: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  chip: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
  },
  infoBox: {
    backgroundColor: '#f0fdfa',
    borderColor: '#99f6e4',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
  },
  infoText: {
    color: '#0f766e',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  resultCount: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  secondaryButton: {
    minHeight: 50,
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '900',
  },
  disclaimer: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 6,
  },
});
