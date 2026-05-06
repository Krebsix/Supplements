import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import AppHeader from '../components/AppHeader';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';

const examples = ['Magnesium', 'Vitamin D', 'Omega 3', 'Zink', 'Eisen'];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  return (
    <ScreenContainer>
      <AppHeader
        title="Manuelle Suche"
        subtitle="Suche nach Produktnamen oder direkt nach Wirkstoffen. Später wird hier eine Synonym- und Wirkstoffdatenbank angebunden."
      />

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="z. B. Magnesium Complex"
        placeholderTextColor="#64748b"
        style={styles.input}
      />

      <Text style={styles.label}>Beispiele</Text>
      <View style={styles.chips}>
        {examples.map((item) => (
          <TouchableOpacity key={item} style={styles.chip} onPress={() => setQuery(item)}>
            <Text style={styles.chipText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <PrimaryButton title="Analyse anzeigen" onPress={() => router.push('/results')} />
      <PrimaryButton title="Zurück zur Startseite" variant="secondary" onPress={() => router.push('/')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#111827',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 16,
    color: '#f8fafc',
    fontSize: 16,
    padding: 16,
    marginBottom: 20,
  },
  label: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 22,
  },
  chip: {
    backgroundColor: '#1e293b',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },
});
