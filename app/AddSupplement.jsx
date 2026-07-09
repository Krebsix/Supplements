import React, { useEffect, useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';

import { SLOTS, SLOT_ORDER } from '../TimingEngine';
import useStore from '../useStore';

export default function AddSupplement() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const addUserSupplement = useStore((state) => state.addUserSupplement);
  const addSupplementFromPendingScan = useStore((state) => state.addSupplementFromPendingScan);
  const pendingScanResult = useStore((state) => state.pendingScanResult);
  const inventory = useStore((state) => state.librarySupplements);

  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');
  const [timingRaw, setTimingRaw] = useState('');
  const [notes, setNotes] = useState('');
  const [childSafe, setChildSafe] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const fromScan = params.fromScan === '1' && pendingScanResult;


  useEffect(() => {
    if (!fromScan) return;

    setName(pendingScanResult.productName || pendingScanResult.name || '');
    setPurpose('Aus Scan bestaetigt');
    setCategory('Scan');
    setAmount('1');
    setUnit('Portion');
    setTimingRaw(pendingScanResult.timingSuggestion || '');
    setNotes([
      pendingScanResult.brand ? `Marke: ${pendingScanResult.brand}` : null,
      Array.isArray(pendingScanResult.detectedIngredients)
        ? `Erkannte Inhaltsstoffe: ${pendingScanResult.detectedIngredients.join(', ')}`
        : null,
      pendingScanResult.uncertaintyNote || null,
    ].filter(Boolean).join('\n'));
    setSelectedSlots(['evening']);
  }, [fromScan, pendingScanResult]);

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

    const payload = {
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
    };

    if (fromScan) {
      addSupplementFromPendingScan(payload);
    } else {
      addUserSupplement({ ...payload, source: 'manual' });
    }

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
        Manueller Eintrag oder bestaetigtes Mock-Scan-Ergebnis. Kein medizinischer Rat; pruefe Dosierung, Quellen und Hinweise vor Nutzung.
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
                  {slot.label}
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
          trackColor={{ false: '#cbd5e1', true: '#0f766e' }}
          thumbColor={childSafe ? '#ffffff' : '#f8fafc'}
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
    backgroundColor: '#f8fafc',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 44,
  },
  title: {
    color: '#0f172a',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 10,
    color: '#475569',
    fontSize: 15,
    lineHeight: 23,
  },
  helperText: {
    marginTop: 4,
    marginBottom: 8,
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
  },
  field: {
    marginTop: 16,
  },
  label: {
    marginBottom: 8,
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
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
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    marginTop: 6,
    color: '#64748b',
    fontSize: 13,
    lineHeight: 19,
  },
  slotWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  slotChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  slotChipIdle: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
  slotChipSelected: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  slotChipText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
  },
  slotChipTextSelected: {
    color: '#ffffff',
  },
  switchCard: {
    marginTop: 18,
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTextWrap: {
    flex: 1,
    paddingRight: 14,
  },
  switchTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
  },
  switchSubtitle: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    marginTop: 22,
    backgroundColor: '#0f766e',
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
