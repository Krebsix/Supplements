import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { getGroupedValues, getIntakeContext } from '../LabValues';
import { LAB_MARKERS, getLabMarker } from '../data/labMarkers';
import { useTranslation } from '../i18n';
import useStore from '../useStore';

/**
 * Laborwerte
 *
 * Erfassen und Verlauf. Die App bewertet hier bewusst nichts: kein "zu
 * niedrig", keine Ampelfarbe, kein eigener Referenzbereich. Angezeigt wird
 * nur, was eingetragen wurde — inklusive des Referenzbereichs aus dem
 * Befund, wenn er erfasst ist.
 */
export default function LabScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const labValues = useStore((state) => state.labValues);
  const addLabValue = useStore((state) => state.addLabValue);
  const deleteLabValue = useStore((state) => state.deleteLabValue);
  const intakeLogs = useStore((state) => state.intakeLogs);
  const getActiveSupplements = useStore((state) => state.getActiveSupplements);

  const supplements = getActiveSupplements();

  const [markerId, setMarkerId] = useState('ferritin');
  const [customName, setCustomName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState(getLabMarker('ferritin')?.commonUnit ?? '');
  const [measuredAt, setMeasuredAt] = useState(new Date().toISOString().slice(0, 10));
  const [labName, setLabName] = useState('');
  const [refMin, setRefMin] = useState('');
  const [refMax, setRefMax] = useState('');

  function pickMarker(id) {
    setMarkerId(id);
    // Einheit als Vorschlag nachziehen, aber nur wenn das Feld noch nicht
    // von Hand geaendert wurde — sonst ueberschreibt die Auswahl eine
    // bewusst gesetzte Einheit.
    const suggestion = getLabMarker(id)?.commonUnit ?? '';
    if (suggestion) setUnit(suggestion);
  }

  function save() {
    const entry = addLabValue({
      markerId, customName, value, unit,
      measuredAt, labName, referenceMin: refMin, referenceMax: refMax,
    });

    if (!entry) {
      Alert.alert(t('lab.new.invalid'));
      return;
    }

    setValue('');
    setLabName('');
    setRefMin('');
    setRefMax('');
    setCustomName('');
  }

  function confirmDelete(id) {
    Alert.alert(t('lab.list.deleteConfirm'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteLabValue(id) },
    ]);
  }

  const grouped = getGroupedValues(labValues);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{t('lab.kicker')}</Text>
      <Text style={styles.title}>{t('lab.title')}</Text>
      <Text style={styles.subtitle}>{t('lab.subtitle')}</Text>
      <Text style={styles.privacy}>{t('lab.privacy')}</Text>

      <Text style={styles.sectionTitle}>{t('lab.new.title')}</Text>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>{t('lab.new.marker')}</Text>
        <View style={styles.chipWrap}>
          {LAB_MARKERS.map((marker) => (
            <TouchableOpacity
              key={marker.id}
              style={[styles.chip, markerId === marker.id && styles.chipActive]}
              onPress={() => pickMarker(marker.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, markerId === marker.id && styles.chipTextActive]}>
                {t(marker.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {markerId === 'other' ? (
          <>
            <Text style={styles.fieldLabel}>{t('lab.new.customName')}</Text>
            <TextInput style={styles.input} value={customName} onChangeText={setCustomName} />
          </>
        ) : null}

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.fieldLabel}>{t('lab.new.value')}</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.fieldLabel}>{t('lab.new.unit')}</Text>
            <TextInput style={styles.input} value={unit} onChangeText={setUnit} />
          </View>
        </View>

        <Text style={styles.fieldLabel}>{t('lab.new.date')}</Text>
        <TextInput
          style={styles.input}
          value={measuredAt}
          onChangeText={setMeasuredAt}
          placeholder={t('lab.new.datePlaceholder')}
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.fieldLabel}>{t('lab.new.labName')}</Text>
        <TextInput style={styles.input} value={labName} onChangeText={setLabName} />

        <Text style={styles.fieldLabel}>{t('lab.new.reference')}</Text>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextInput
              style={styles.input}
              value={refMin}
              onChangeText={setRefMin}
              keyboardType="decimal-pad"
              placeholder={t('lab.new.referenceMin')}
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View style={styles.rowItem}>
            <TextInput
              style={styles.input}
              value={refMax}
              onChangeText={setRefMax}
              keyboardType="decimal-pad"
              placeholder={t('lab.new.referenceMax')}
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>
        <Text style={styles.fieldHint}>{t('lab.new.referenceHint')}</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={save}>
          <Text style={styles.primaryButtonText}>{t('lab.new.save')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{t('lab.list.title')}</Text>

      {grouped.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('lab.list.empty')}</Text>
        </View>
      ) : (
        grouped.map((group) => {
          const marker = getLabMarker(group.markerId);
          const name = group.customName || t(marker?.labelKey ?? group.markerId);

          return (
            <View key={group.markerId} style={styles.card}>
              <Text style={styles.groupName}>{name}</Text>

              {group.entries
                .slice()
                .reverse()
                .map((entry) => {
                  const context = getIntakeContext(entry, supplements, intakeLogs);

                  return (
                    <View key={entry.id} style={styles.entryRow}>
                      <View style={styles.entryHead}>
                        <Text style={styles.entryValue}>
                          {entry.value} {entry.unit}
                        </Text>
                        <Text style={styles.entryDate}>{entry.dateKey}</Text>
                      </View>

                      <Text style={styles.entryMeta}>
                        {entry.referenceMin !== null || entry.referenceMax !== null
                          ? t('lab.list.referenceGiven', {
                              min: entry.referenceMin ?? '',
                              max: entry.referenceMax ?? '',
                            })
                          : t('lab.list.noReference')}
                        {entry.labName ? ` · ${entry.labName}` : ''}
                      </Text>

                      {context.length > 0 ? (
                        <Text style={styles.entryContext}>
                          {t('lab.list.intakeContext', {
                            names: context.map((item) => item.name).join(', '),
                          })}
                        </Text>
                      ) : null}

                      <Text style={styles.deleteLink} onPress={() => confirmDelete(entry.id)}>
                        {t('lab.list.delete')}
                      </Text>
                    </View>
                  );
                })}
            </View>
          );
        })
      )}

      <Text style={styles.disclaimer}>{t('lab.disclaimer')}</Text>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/export')}>
        <Text style={styles.secondaryButtonText}>{t('export.screenTitle')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
        <Text style={styles.backButtonText}>{t('common.backToHome')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 44 },
  kicker: {
    color: '#0f766e', fontSize: 13, fontWeight: '800',
    letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8,
  },
  title: { color: '#0f172a', fontSize: 26, lineHeight: 32, fontWeight: '800' },
  subtitle: { color: '#475569', fontSize: 14, lineHeight: 21, marginTop: 10 },
  privacy: { color: '#0f766e', fontSize: 12, marginTop: 8, marginBottom: 18 },
  sectionTitle: { color: '#0f172a', fontSize: 16, fontWeight: '800', marginTop: 12, marginBottom: 10 },
  card: {
    backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderWidth: 1,
    borderRadius: 18, padding: 16, marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderWidth: 1,
    borderRadius: 18, padding: 16, marginBottom: 12,
  },
  emptyText: { color: '#64748b', fontSize: 13, lineHeight: 20 },
  fieldLabel: {
    color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 0.7,
    textTransform: 'uppercase', marginTop: 12, marginBottom: 6,
  },
  fieldHint: { color: '#64748b', fontSize: 11, lineHeight: 17, marginTop: 6 },
  input: {
    backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderWidth: 1,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: '#0f172a',
  },
  row: { flexDirection: 'row', gap: 10 },
  rowItem: { flex: 1 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', borderWidth: 1,
    borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6,
  },
  chipActive: { backgroundColor: '#0f766e', borderColor: '#0f766e' },
  chipText: { color: '#475569', fontSize: 11, fontWeight: '700' },
  chipTextActive: { color: '#ffffff' },
  primaryButton: {
    backgroundColor: '#0f766e', borderRadius: 999,
    paddingVertical: 13, alignItems: 'center', marginTop: 18,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  groupName: { color: '#0f172a', fontSize: 15, fontWeight: '800', marginBottom: 4 },
  entryRow: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10, marginTop: 10 },
  entryHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  entryValue: { color: '#0f172a', fontSize: 16, fontWeight: '800' },
  entryDate: { color: '#64748b', fontSize: 12 },
  entryMeta: { color: '#64748b', fontSize: 12, marginTop: 3 },
  entryContext: { color: '#94a3b8', fontSize: 11, lineHeight: 16, marginTop: 4 },
  deleteLink: { color: '#dc2626', fontSize: 11, fontWeight: '700', marginTop: 8 },
  disclaimer: { color: '#64748b', fontSize: 12, lineHeight: 18, marginTop: 8, marginBottom: 16 },
  secondaryButton: {
    backgroundColor: '#ffffff', borderColor: '#0f766e', borderWidth: 1,
    borderRadius: 999, paddingVertical: 13, alignItems: 'center', marginBottom: 10,
  },
  secondaryButtonText: { color: '#0f766e', fontSize: 14, fontWeight: '800' },
  backButton: {
    backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', borderWidth: 1,
    borderRadius: 999, paddingVertical: 14, alignItems: 'center',
  },
  backButtonText: { color: '#0f172a', fontSize: 15, fontWeight: '800' },
});
