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
import { getDosageAmount, getDosageUnit } from '../utils/supplementFormatting';
import { useTranslation } from '../i18n';

export default function AddSupplement() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const addUserSupplement = useStore((state) => state.addUserSupplement);
  const updateUserSupplement = useStore((state) => state.updateUserSupplement);
  const addSupplementFromPendingScan = useStore((state) => state.addSupplementFromPendingScan);
  const clearPendingScanResult = useStore((state) => state.clearPendingScanResult);
  const pendingScanResult = useStore((state) => state.pendingScanResult);
  const userSupplements = useStore((state) => state.userSupplements);
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

  const editIdParam = Array.isArray(params.editId) ? params.editId[0] : params.editId;
  const fromScanParam = Array.isArray(params.fromScan) ? params.fromScan[0] : params.fromScan;
  const editId = typeof editIdParam === 'string' && editIdParam.length > 0 ? editIdParam : null;
  const existingSupplement = editId
    ? userSupplements.find((supplement) => supplement.id === editId)
    : null;
  const fromScan = !editId && fromScanParam === '1' && pendingScanResult;

  useEffect(() => {
    if (!existingSupplement) return;

    setName(existingSupplement.name || '');
    setPurpose(existingSupplement.purpose || '');
    setCategory(existingSupplement.category || '');
    setAmount(getDosageAmount(existingSupplement, ''));
    setUnit(getDosageUnit(existingSupplement, ''));
    setTimingRaw(existingSupplement.timingRaw || '');
    setNotes(existingSupplement.notes || '');
    setChildSafe(Boolean(existingSupplement.childSafe));
    setSelectedSlots(Array.isArray(existingSupplement.timingSlots) ? existingSupplement.timingSlots : []);
  }, [existingSupplement]);

  useEffect(() => {
    if (!fromScan) return;

    const scannedAmount =
      pendingScanResult?.dosage?.amount ??
      pendingScanResult?.dosageAmount ??
      pendingScanResult?.amount ??
      '';

    const scannedUnit =
      pendingScanResult?.dosage?.unit ??
      pendingScanResult?.dosageUnit ??
      pendingScanResult?.unit ??
      '';

    const recognizedBrand =
      pendingScanResult.brand &&
      pendingScanResult.brand !== 'Demo Brand'
        ? pendingScanResult.brand
        : null;

    const recognizedIngredients =
      Array.isArray(pendingScanResult.detectedIngredients) &&
      pendingScanResult.detectedIngredients.length > 0
        ? pendingScanResult.detectedIngredients
        : [];

    const scanWarnings = Array.isArray(pendingScanResult.warnings)
      ? pendingScanResult.warnings
      : [];

    setName(
      pendingScanResult.productName ||
        pendingScanResult.name ||
        ''
    );
    setPurpose(t('addSupplement.scan.purpose'));
    setCategory(t('addSupplement.scan.category'));
    setAmount(
      scannedAmount === null || scannedAmount === undefined
        ? ''
        : String(scannedAmount)
    );
    setUnit(
      scannedUnit === null || scannedUnit === undefined
        ? ''
        : String(scannedUnit)
    );
    setTimingRaw('');
    setNotes(
      [
        recognizedBrand ? t('addSupplement.scan.brandNote', { brand: recognizedBrand }) : null,
        recognizedIngredients.length > 0
          ? t('addSupplement.scan.ingredientsNote', {
              ingredients: recognizedIngredients.join(', '),
            })
          : null,
        pendingScanResult.timingSuggestion
          ? t('addSupplement.scan.timingNote', { timing: pendingScanResult.timingSuggestion })
          : null,
        scanWarnings.length > 0
          ? t('addSupplement.scan.warningsNote', { warnings: scanWarnings.join('\n- ') })
          : null,
        pendingScanResult.uncertaintyNote || null,
      ]
        .filter(Boolean)
        .join('\n\n')
    );
    setSelectedSlots([]);
  }, [fromScan, pendingScanResult]);

  useEffect(() => {
    if (!fromScan && !editId && pendingScanResult) {
      clearPendingScanResult();
    }
  }, [clearPendingScanResult, editId, fromScan, pendingScanResult]);

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

  const screenTitle = editId
    ? t('addSupplement.screenTitle.edit')
    : fromScan
      ? t('addSupplement.screenTitle.scan')
      : t('addSupplement.screenTitle.manual');

  const screenSubtitle = editId
    ? t('addSupplement.screenSubtitle.edit')
    : fromScan
      ? t('addSupplement.screenSubtitle.scan')
      : t('addSupplement.screenSubtitle.manual');

  const primaryButtonLabel = editId
    ? t('addSupplement.primaryButton.edit')
    : fromScan
      ? t('addSupplement.primaryButton.scan')
      : t('addSupplement.primaryButton.manual');

  const modeLabel = editId
    ? t('addSupplement.modeLabel.edit')
    : fromScan
      ? t('addSupplement.modeLabel.scan')
      : t('addSupplement.modeLabel.manual');

  const modePillLabel = editId
    ? t('addSupplement.modePill.edit')
    : fromScan
      ? t('addSupplement.modePill.scan')
      : t('addSupplement.modePill.manual');

  const trustCopy = fromScan
    ? t('addSupplement.trustCopy.scan')
    : editId
      ? t('addSupplement.trustCopy.edit')
      : t('addSupplement.trustCopy.manual');

  const selectedSlotLabels = selectedSlots
    .map((slotId) => SLOTS[slotId]?.label)
    .filter(Boolean)
    .join(' · ');

  function handleSave() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert(
        t('addSupplement.alert.nameMissingTitle'),
        t('addSupplement.alert.nameMissingMessage')
      );
      return;
    }

    if (selectedSlots.length === 0) {
      Alert.alert(
        t('addSupplement.alert.slotMissingTitle'),
        t('addSupplement.alert.slotMissingMessage')
      );
      return;
    }

    const derivedTimingRaw =
      timingRaw.trim() ||
      selectedSlots
        .map((slotId) => SLOTS[slotId]?.label ?? slotId)
        .join(' / ');

    const payload = {
      name: trimmedName,
      purpose: purpose.trim() || t('addSupplement.defaultPurpose'),
      category: category.trim() || t('addSupplement.defaultCategory'),
      timingSlots: selectedSlots,
      timingRaw: derivedTimingRaw,
      dosage: {
        amount: amount.trim(),
        unit: unit.trim(),
      },
      childSafe,
      conflictIds: [],
      conflictTags: [],
      synergyIds: [],
      stock: null,
      cureConfig: null,
      notes: notes.trim(),
    };

    if (editId) {
      if (!existingSupplement) {
        Alert.alert(
          t('addSupplement.alert.notFoundTitle'),
          t('addSupplement.alert.notFoundMessage')
        );
        return;
      }

      updateUserSupplement(editId, payload);

      Alert.alert(
        t('addSupplement.alert.updatedTitle'),
        t('addSupplement.alert.updatedMessage'),
        [{ text: t('addSupplement.alert.goToDashboard'), onPress: () => router.replace('/Dashboard') }]
      );
      return;
    }

    if (fromScan) {
      addSupplementFromPendingScan(payload);
    } else {
      addUserSupplement({ ...payload, source: 'manual' });
    }

    Alert.alert(
      t('addSupplement.alert.savedTitle'),
      fromScan
        ? t('addSupplement.alert.savedScanMessage')
        : t('addSupplement.alert.savedManualMessage'),
      [{ text: t('addSupplement.alert.goToDashboard'), onPress: () => router.replace('/Dashboard') }]
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.kicker}>{modeLabel}</Text>
          <View style={styles.modePill}>
            <Text style={styles.modePillText}>{modePillLabel}</Text>
          </View>
        </View>
        <Text style={styles.title}>{screenTitle}</Text>
        <Text style={styles.subtitle}>{screenSubtitle}</Text>
      </View>

      <View style={styles.trustCard}>
        <Text style={styles.trustTitle}>{t('addSupplement.trustTitle')}</Text>
        <Text style={styles.trustText}>{trustCopy}</Text>
      </View>

      <FormField
        label={t('addSupplement.nameLabel')}
        helper={t('addSupplement.nameHelper')}
        value={name}
        onChangeText={setName}
        placeholder={t('addSupplement.namePlaceholder')}
      />

      <FormField
        label={t('addSupplement.purposeLabel')}
        helper={t('addSupplement.purposeHelper')}
        value={purpose}
        onChangeText={setPurpose}
        placeholder={t('addSupplement.purposePlaceholder')}
      />

      <FormField
        label={t('addSupplement.categoryLabel')}
        helper={t('addSupplement.categoryHelper')}
        value={category}
        onChangeText={setCategory}
        placeholder={t('addSupplement.categoryPlaceholder')}
      />

      {categoryExamples.length > 0 ? (
        <Text style={styles.helperText}>
          {t('addSupplement.categoryExamples', { examples: categoryExamples.join(', ') })}
        </Text>
      ) : null}

      <View style={styles.row}>
        <View style={styles.rowField}>
          <FormField
            label={t('addSupplement.amountLabel')}
            helper={t('addSupplement.amountHelper')}
            value={amount}
            onChangeText={setAmount}
            placeholder={t('addSupplement.amountPlaceholder')}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.rowSpacer} />
        <View style={styles.rowField}>
          <FormField
            label={t('addSupplement.unitLabel')}
            helper={t('addSupplement.unitHelper')}
            value={unit}
            onChangeText={setUnit}
            placeholder={t('addSupplement.unitPlaceholder')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('addSupplement.routineSectionTitle')}</Text>
        <Text style={styles.sectionSubtitle}>
          {t('addSupplement.routineSectionSubtitle')}
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

        {selectedSlotLabels ? (
          <View style={styles.selectedSlotSummary}>
            <Text style={styles.selectedSlotSummaryText}>
              {t('addSupplement.selectedSlots', { slots: selectedSlotLabels })}
            </Text>
          </View>
        ) : (
          <Text style={styles.sectionHint}>{t('addSupplement.noSlotSelected')}</Text>
        )}
      </View>

      <FormField
        label={t('addSupplement.timingLabel')}
        helper={t('addSupplement.timingHelper')}
        value={timingRaw}
        onChangeText={setTimingRaw}
        placeholder={t('addSupplement.timingPlaceholder')}
      />

      <View style={styles.switchCard}>
        <View style={styles.switchTextWrap}>
          <Text style={styles.switchTitle}>{t('addSupplement.childSafeTitle')}</Text>
          <Text style={styles.switchSubtitle}>
            {t('addSupplement.childSafeSubtitle')}
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
        label={t('addSupplement.notesLabel')}
        helper={t('addSupplement.notesHelper')}
        value={notes}
        onChangeText={setNotes}
        placeholder={t('addSupplement.notesPlaceholder')}
        multiline
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
        <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function FormField({ label, helper, multiline = false, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor="#71717a"
        style={[styles.input, multiline ? styles.inputMultiline : null]}
      />
      {helper ? <Text style={styles.inputHelper}>{helper}</Text> : null}
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
    paddingTop: 22,
    paddingBottom: 44,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  modePill: {
    backgroundColor: '#ecfdf5',
    borderColor: '#99f6e4',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  modePillText: {
    color: '#0f766e',
    fontSize: 11,
    fontWeight: '900',
  },
  trustCard: {
    marginTop: 14,
    backgroundColor: '#f0fdfa',
    borderColor: '#99f6e4',
    borderWidth: 1,
    borderRadius: 20,
    padding: 15,
  },
  trustTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '900',
  },
  trustText: {
    marginTop: 5,
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
  },
  title: {
    marginTop: 12,
    color: '#0f172a',
    fontSize: 28,
    lineHeight: 34,
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
  inputHelper: {
    marginTop: 6,
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
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
  selectedSlotSummary: {
    marginTop: 12,
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectedSlotSummaryText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHint: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 13,
    lineHeight: 19,
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
