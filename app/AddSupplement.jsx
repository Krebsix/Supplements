import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { SLOTS, SLOT_ORDER } from '../TimingEngine';
import useStore from '../useStore';

export default function AddSupplement() {
  const router = useRouter();
  const addSupplement = useStore((state) => state.addSupplement);
  const inventory = useStore((state) => state.inventory);

  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');
  const [timingRaw, setTimingRaw] = useState('');
  const [notes, setNotes] = useState('');
  const [childSafe, setChildSafe] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const categoryExamples = Array.from(
    new Set(inventory.map((supplement) => supplement.category).filter(Boolean))
  ).slice(0, 6);

  function toggleSlot(slotId) {
    setSelectedSlots((current) => {
      const next = current.includes(slotId)
        ? current.filter((id) => id !== slotId)
        : [...current, slotId];

      return SLOT_ORDER.filter((id) => next.includes(id));
    });
  }

  function handleSave() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert('Name fehlt', 'Bitte gib mindestens einen Namen fuer das Supplement ein.');
      return;
    }

    if (selectedSlots.length === 0) {
      Alert.alert('Slot fehlt', 'Bitte waehle mindestens einen Tages-Slot aus.');
      return;
    }

    const derivedTimingRaw =
      timingRaw.trim() ||
      selectedSlots
        .map((slotId) => SLOTS[slotId]?.label ?? slotId)
        .join(' / ');

    addSupplement({
      name: trimmedName,
      purpose: purpose.trim() || 'Benutzerdefiniert',
      category: category.trim() || 'Benutzerdefiniert',
      timingSlots: selectedSlots,
      timingRaw: derivedTimingRaw,
      dosage: {
        amount: amount.trim() || '1',
        unit: unit.trim() || 'Kapsel',
      },
      childSafe,
      conflictIds: [],
      conflictTags: [],
      synergyIds: [],
      stock: null,
      cureConfig: null,
      notes: notes.trim(),
    });

    Alert.alert(
      'Gespeichert',
      'Das Supplement wurde als manueller Eintrag hinzugefuegt.',
      [{ text: 'Zurueck', onPress: () => router.back() }]
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Neues Supplement</Text>
      <Text style={styles.subtitle}>
        Manueller Eintrag auf Basis des bestehenden Store-Schemas. Kein Scanner, keine
        Bildanalyse und keine automatische Produkterkennung in diesem Schritt.
      </Text>

      <FormField
        label="Name"
        value={name}
        onChangeText={setName}
        placeholder="z. B. Magnesium Bisglycinat"
      />

      <FormField
        label="Zweck"
        value={purpose}
        onChangeText={setPurpose}
        placeholder="z. B. Schlaf, Regeneration, Fokus"
      />

      <FormField
        label="Kategorie"
        value={category}
        onChangeText={setCategory}
        placeholder="z. B. Mineralien"
      />

      {categoryExamples.length > 0 ? (
        <Text style={styles.helperText}>
          Beispiele aus dem aktuellen Inventar: {categoryExamples.join(', ')}
        </Text>
      ) : null}

      <View style={styles.row}>
        <View style={styles.rowField}>
          <FormField
            label="Dosierung"
            value={amount}
            onChangeText={setAmount}
            placeholder="z. B. 300"
          />
        </View>
        <View style={styles.rowSpacer} />
        <View style={styles.rowField}>
          <FormField
            label="Einheit"
            value={unit}
            onChangeText={setUnit}
            placeholder="mg"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tages-Slots</Text>
        <Text style={styles.sectionSubtitle}>
          Waehle einen oder mehrere Slots, damit der Eintrag im Tagesplan auftaucht.
        </Text>
        <View style={styles.slotWrap}>
          {SLOT_ORDER.map((slotId) => {
            const selected = selectedSlots.includes(slotId);
            const slot = SLOTS[slotId];

            return (
              <TouchableOpacity
                key={slotId}
                onPress={() => toggleSlot(slotId)}
                style={[styles.slotChip, selected ? styles.slotChipSelected : styles.slotChipIdle]}
              >
                <Text style={[styles.slotChipText, selected ? styles.slotChipTextSelected : null]}>
                  {slot.emoji} {slot.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FormField
        label="Anzeige fuer Timing"
        value={timingRaw}
        onChangeText={setTimingRaw}
        placeholder="Optional: eigener Freitext fuer den Einnahmezeitpunkt"
      />

      <View style={styles.switchCard}>
        <View style={styles.switchTextWrap}>
          <Text style={styles.switchTitle}>Kindersicher markiert</Text>
          <Text style={styles.switchSubtitle}>
            Entspricht dem bestehenden `childSafe` Feld im Store.
          </Text>
        </View>
        <Switch
          value={childSafe}
          onValueChange={setChildSafe}
          trackColor={{ false: '#3f3f46', true: '#4ade80' }}
          thumbColor={childSafe ? '#ffffff' : '#d4d4d8'}
        />
      </View>

      <FormField
        label="Notizen"
        value={notes}
        onChangeText={setNotes}
        placeholder="Optional: Hinweise zur Einnahme oder Herkunft"
        multiline
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
        <Text style={styles.primaryButtonText}>Supplement speichern</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function FormField({ label, multiline = false, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor="#71717a"
        style={[styles.input, multiline ? styles.inputMultiline : null]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 8,
    color: '#a1a1aa',
    fontSize: 15,
    lineHeight: 22,
  },
  helperText: {
    marginTop: -4,
    marginBottom: 12,
    color: '#71717a',
    fontSize: 12,
    lineHeight: 18,
  },
  field: {
    marginTop: 16,
  },
  label: {
    marginBottom: 8,
    color: '#f4f4f5',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272a',
    backgroundColor: '#18181b',
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rowField: {
    flex: 1,
  },
  rowSpacer: {
    width: 12,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    color: '#f4f4f5',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    marginTop: 6,
    color: '#71717a',
    fontSize: 13,
    lineHeight: 18,
  },
  slotWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  slotChip: {
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  slotChipIdle: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  slotChipSelected: {
    backgroundColor: '#1d4ed8',
    borderColor: '#3b82f6',
  },
  slotChipText: {
    color: '#d4d4d8',
    fontSize: 13,
    fontWeight: '600',
  },
  slotChipTextSelected: {
    color: '#eff6ff',
  },
  switchCard: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    backgroundColor: '#18181b',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  switchTitle: {
    color: '#f4f4f5',
    fontSize: 15,
    fontWeight: '700',
  },
  switchSubtitle: {
    marginTop: 4,
    color: '#71717a',
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
