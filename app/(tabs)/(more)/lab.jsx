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

import { getGroupedValues, getIntakeContext } from '../../../LabValues';
import { LAB_MARKERS, getLabMarker } from '../../../data/labMarkers';
import { canUseProFeature } from '../../../Entitlements';
import ProGate from '../../../components/ProGate';
import { useTranslation } from '../../../i18n';
import useStore from '../../../useStore';
import { colors, radius, space, surfaces, type } from '../../../theme';

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
  const updateLabValue = useStore((state) => state.updateLabValue);
  const deleteLabValue = useStore((state) => state.deleteLabValue);
  const intakeLogs = useStore((state) => state.intakeLogs);
  const getActiveSupplements = useStore((state) => state.getActiveSupplements);
  const entitlement = useStore((state) => state.entitlement);

  const supplements = getActiveSupplements();

  const [editingId, setEditingId] = useState(null);
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

  function startEdit(entry) {
    setEditingId(entry.id);
    setMarkerId(entry.markerId);
    setCustomName(entry.customName ?? '');
    setValue(String(entry.value));
    setUnit(entry.unit ?? '');
    setMeasuredAt(entry.dateKey);
    setLabName(entry.labName ?? '');
    setRefMin(entry.referenceMin === null || entry.referenceMin === undefined ? '' : String(entry.referenceMin));
    setRefMax(entry.referenceMax === null || entry.referenceMax === undefined ? '' : String(entry.referenceMax));
  }

  function clearForm() {
    setValue('');
    setLabName('');
    setRefMin('');
    setRefMax('');
    setCustomName('');
  }

  function cancelEdit() {
    clearForm();
    setEditingId(null);
  }

  function save() {
    const input = {
      markerId, customName, value, unit,
      measuredAt, labName, referenceMin: refMin, referenceMax: refMax,
    };
    const entry = editingId ? updateLabValue(editingId, input) : addLabValue(input);

    if (!entry) {
      Alert.alert(t('lab.new.invalid'));
      return;
    }

    clearForm();
    setEditingId(null);
  }

  function confirmDelete(id) {
    Alert.alert(t('lab.list.deleteConfirm'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteLabValue(id) },
    ]);
  }

  const grouped = getGroupedValues(labValues);

  // Laborwerte-Verlauf ist Pro (Entitlements.js). Nach den Hooks geprueft,
  // damit die Hook-Reihenfolge stabil bleibt.
  if (!canUseProFeature(entitlement).allowed) {
    return <ProGate screen />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{t('lab.kicker')}</Text>
      <Text style={styles.title}>{t('lab.title')}</Text>
      <Text style={styles.subtitle}>{t('lab.subtitle')}</Text>
      <Text style={styles.privacy}>{t('lab.privacy')}</Text>

      <Text style={styles.sectionTitle}>{t(editingId ? 'lab.edit.title' : 'lab.new.title')}</Text>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>{t('lab.new.marker')}</Text>
        <View style={styles.chipWrap}>
          {LAB_MARKERS.map((marker) => (
            <TouchableOpacity
              key={marker.id}
              style={[styles.chip, markerId === marker.id && styles.chipActive]}
              onPress={() => pickMarker(marker.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: markerId === marker.id }}
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
            <TextInput
              style={styles.input}
              value={customName}
              onChangeText={setCustomName}
              accessibilityLabel={t('lab.new.customName')}
            />
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
              accessibilityLabel={t('lab.new.value')}
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.fieldLabel}>{t('lab.new.unit')}</Text>
            <TextInput
              style={styles.input}
              value={unit}
              onChangeText={setUnit}
              accessibilityLabel={t('lab.new.unit')}
            />
          </View>
        </View>

        <Text style={styles.fieldLabel}>{t('lab.new.date')}</Text>
        <TextInput
          style={styles.input}
          value={measuredAt}
          onChangeText={setMeasuredAt}
          placeholder={t('lab.new.datePlaceholder')}
          placeholderTextColor={colors.inkFaint}
          accessibilityLabel={t('lab.new.date')}
        />

        <Text style={styles.fieldLabel}>{t('lab.new.labName')}</Text>
        <TextInput
          style={styles.input}
          value={labName}
          onChangeText={setLabName}
          accessibilityLabel={t('lab.new.labName')}
        />

        <Text style={styles.fieldLabel}>{t('lab.new.reference')}</Text>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextInput
              style={styles.input}
              value={refMin}
              onChangeText={setRefMin}
              keyboardType="decimal-pad"
              placeholder={t('lab.new.referenceMin')}
              placeholderTextColor={colors.inkFaint}
              accessibilityLabel={t('lab.new.referenceMin')}
              accessibilityHint={t('lab.new.referenceHint')}
            />
          </View>
          <View style={styles.rowItem}>
            <TextInput
              style={styles.input}
              value={refMax}
              onChangeText={setRefMax}
              keyboardType="decimal-pad"
              placeholder={t('lab.new.referenceMax')}
              placeholderTextColor={colors.inkFaint}
              accessibilityLabel={t('lab.new.referenceMax')}
              accessibilityHint={t('lab.new.referenceHint')}
            />
          </View>
        </View>
        <Text style={styles.fieldHint}>{t('lab.new.referenceHint')}</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={save} accessibilityRole="button">
          <Text style={styles.primaryButtonText}>{t(editingId ? 'lab.edit.save' : 'lab.new.save')}</Text>
        </TouchableOpacity>

        {editingId ? (
          <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit} accessibilityRole="button">
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        ) : null}
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

                      <View style={styles.actionRow}>
                        <Text
                          style={styles.actionLink}
                          onPress={() => startEdit(entry)}
                          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                        >
                          {t('lab.list.edit')}
                        </Text>
                        <Text
                          style={styles.actionLink}
                          onPress={() => confirmDelete(entry.id)}
                          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                        >
                          {t('lab.list.delete')}
                        </Text>
                      </View>
                    </View>
                  );
                })}
            </View>
          );
        })
      )}

      <Text style={styles.disclaimer}>{t('lab.disclaimer')}</Text>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push('/export')}
        accessibilityRole="link"
      >
        <Text style={styles.secondaryButtonText}>{t('export.screenTitle')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/menu')}
        accessibilityRole="link"
      >
        <Text style={styles.backButtonText}>{t('common.backToHome')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { ...surfaces.screen },
  content: { ...surfaces.content },
  kicker: { ...type.eyebrow, marginBottom: space.sm },
  title: { ...type.display },
  subtitle: { ...type.body, marginTop: space.md },
  privacy: { color: colors.accent, fontSize: 12, marginTop: space.sm, marginBottom: space.lg },
  sectionTitle: { ...type.heading, marginTop: space.md, marginBottom: space.md },
  card: { ...surfaces.card },
  emptyCard: { ...surfaces.card },
  emptyText: { ...type.small, lineHeight: 20 },
  fieldLabel: { ...type.label, marginTop: space.md, marginBottom: space.sm - 2 },
  fieldHint: { color: colors.inkMuted, fontSize: 11, lineHeight: 17, marginTop: space.sm },
  input: { ...surfaces.input },
  row: { flexDirection: 'row', gap: space.sm + 2 },
  rowItem: { flex: 1 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm - 2 },
  chip: { ...surfaces.chip, paddingHorizontal: 11, paddingVertical: space.sm - 2 },
  chipActive: { ...surfaces.chipActive },
  chipText: { color: colors.inkMuted, fontSize: 11, fontWeight: '700' },
  chipTextActive: { ...surfaces.chipTextActive },
  primaryButton: { ...surfaces.buttonPrimary, paddingVertical: 13, marginTop: space.md },
  primaryButtonText: { ...surfaces.buttonPrimaryText, fontSize: 14 },
  groupName: { color: colors.ink, fontSize: 15, fontWeight: '700', marginBottom: space.xs },
  entryRow: { borderTopWidth: 1, borderTopColor: colors.rule, paddingTop: space.sm + 2, marginTop: space.sm + 2 },
  entryHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  // Messwert in Serife: passt zum Laborbuch-Charakter des Screens.
  entryValue: { ...type.numeral, fontSize: 16 },
  entryDate: { color: colors.inkMuted, fontSize: 12 },
  entryMeta: { color: colors.inkMuted, fontSize: 12, marginTop: 3 },
  entryContext: { color: colors.inkFaint, fontSize: 11, lineHeight: 16, marginTop: space.xs },
  actionRow: { flexDirection: 'row', gap: space.md, marginTop: space.sm },
  // Tippflaeche 44 pt (CLAUDE.md Bedienregeln): Text traegt onPress direkt,
  // hitSlop allein reichte rechnerisch nicht.
  actionLink: { color: colors.alert, fontSize: 11, fontWeight: '700', minHeight: 44, verticalAlign: 'middle' },
  disclaimer: { ...type.tiny, lineHeight: 18, marginTop: space.sm, marginBottom: space.lg - 2 },
  cancelButton: { ...surfaces.buttonQuiet, paddingVertical: 13, marginTop: space.sm },
  cancelButtonText: { ...surfaces.buttonQuietText, fontSize: 14 },
  // Tippflaeche 44 pt (CLAUDE.md Bedienregeln).
  secondaryButton: {
    backgroundColor: colors.surface, borderColor: colors.accent, borderWidth: 1,
    borderRadius: radius.md, paddingVertical: 13, alignItems: 'center', marginBottom: space.sm + 2,
    minHeight: 44, justifyContent: 'center',
  },
  secondaryButtonText: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  backButton: { ...surfaces.buttonQuiet },
  backButtonText: { ...surfaces.buttonQuietText, fontSize: 15 },
});
