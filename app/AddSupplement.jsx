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
import { canAddSupplement, canUseProFeature } from '../Entitlements';
import ProGate from '../components/ProGate';
import useStore from '../useStore';
import { getDosageAmount, getDosageUnit } from '../utils/supplementFormatting';
import { useTranslation } from '../i18n';
import { colors, radius, space, surfaces, type } from '../theme';

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
  const entitlement = useStore((state) => state.entitlement);
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
  // Kur-Zyklus (CureManager.js): Die Oberflaeche bietet den ON/OFF-Typ an.
  // Der Stufen-Typ ('stepped') bleibt Fachlogik ohne Formular; er war
  // bisher nirgends erzeugbar, es gibt also keine Bestandsdaten.
  const [cureEnabled, setCureEnabled] = useState(false);
  const [cureOnDays, setCureOnDays] = useState('');
  const [cureOffDays, setCureOffDays] = useState('');

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

    if (existingSupplement.cureConfig?.type === 'cycle') {
      setCureEnabled(true);
      setCureOnDays(String(existingSupplement.cureConfig.onDays ?? ''));
      setCureOffDays(String(existingSupplement.cureConfig.offDays ?? ''));
    } else {
      setCureEnabled(false);
      setCureOnDays('');
      setCureOffDays('');
    }
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

  // Kur-Zyklen sind Pro (Entitlements.js). Gesperrt wird nur der
  // Einstieg: Ein bestehender Zyklus (cureEnabled aus den geladenen
  // Daten) bleibt sichtbar und bearbeitbar, damit gespeicherte Daten
  // nicht hinter dem Gate verschwinden.
  const cureLocked = !canUseProFeature(entitlement).allowed && !cureEnabled;

  function handleSave() {
    // 5-Praeparate-Grenze des Free-Tarifs (Entitlements.js). Gilt nur fuer
    // NEUE Eintraege — Bearbeiten bleibt immer moeglich, sonst kaeme
    // niemand mehr an seine bestehenden Daten. Solange PAYWALL_ENFORCED
    // aus ist, blockiert das nie.
    if (!editId) {
      const activeCount = userSupplements.filter(
        (supplement) => supplement.status !== 'archived'
      ).length;
      const gate = canAddSupplement(entitlement, activeCount);
      if (!gate.allowed) {
        Alert.alert(
          t('addSupplement.alert.limitTitle'),
          t('addSupplement.alert.limitMessage', { limit: gate.limit })
        );
        return;
      }
    }

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

    let cureConfig = null;
    let cureStartDate = existingSupplement?.cureStartDate || null;

    if (cureEnabled) {
      const onDays = Number.parseInt(cureOnDays, 10);
      const offDays = Number.parseInt(cureOffDays, 10);

      if (!Number.isInteger(onDays) || onDays < 1 || !Number.isInteger(offDays) || offDays < 1) {
        Alert.alert(
          t('addSupplement.alert.cureInvalidTitle'),
          t('addSupplement.alert.cureInvalidMessage')
        );
        return;
      }

      cureConfig = { type: 'cycle', onDays, offDays };
      // Startdatum bleibt beim Bearbeiten erhalten, sonst beginnt der
      // Zyklus mit dem Speichern.
      if (!cureStartDate) cureStartDate = new Date().toISOString();
    } else {
      cureStartDate = null;
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
      cureConfig,
      cureStartDate,
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
          trackColor={{ false: colors.rule, true: colors.accent }}
          thumbColor={childSafe ? colors.surface : colors.canvas}
        />
      </View>

      {cureLocked ? (
        <ProGate />
      ) : (
        <View style={styles.switchCard}>
          <View style={styles.switchTextWrap}>
            <Text style={styles.switchTitle}>{t('addSupplement.cureTitle')}</Text>
            <Text style={styles.switchSubtitle}>
              {t('addSupplement.cureSubtitle')}
            </Text>
          </View>
          <Switch
            value={cureEnabled}
            onValueChange={setCureEnabled}
            trackColor={{ false: colors.rule, true: colors.accent }}
            thumbColor={cureEnabled ? colors.surface : colors.canvas}
            accessibilityLabel={t('addSupplement.cureTitle')}
          />
        </View>
      )}

      {cureEnabled ? (
        <View style={styles.row}>
          <View style={styles.rowField}>
            <FormField
              label={t('addSupplement.cureOnLabel')}
              helper={t('addSupplement.cureOnHelper')}
              value={cureOnDays}
              onChangeText={setCureOnDays}
              placeholder="21"
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.rowSpacer} />
          <View style={styles.rowField}>
            <FormField
              label={t('addSupplement.cureOffLabel')}
              helper={t('addSupplement.cureOffHelper')}
              value={cureOffDays}
              onChangeText={setCureOffDays}
              placeholder="7"
              keyboardType="number-pad"
            />
          </View>
        </View>
      ) : null}

      <FormField
        label={t('addSupplement.notesLabel')}
        helper={t('addSupplement.notesHelper')}
        value={notes}
        onChangeText={setNotes}
        placeholder={t('addSupplement.notesPlaceholder')}
        multiline
      />

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSave}
        accessibilityRole="button"
        accessibilityLabel={primaryButtonLabel}
      >
        <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
      </TouchableOpacity>

      {/* Das Modal war bisher nur per Geste verlassbar: ein expliziter
          Abbrechen-Weg gehoert zu jedem Formular. */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={t('common.cancel')}
      >
        <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
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
        placeholderTextColor={colors.inkFaint}
        style={[styles.input, multiline ? styles.inputMultiline : null]}
        // Ohne Label liest der Screenreader nur den eingetragenen Wert vor.
        accessibilityLabel={label}
        accessibilityHint={helper || undefined}
      />
      {helper ? <Text style={styles.inputHelper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: surfaces.screen,
  content: surfaces.content,
  heroCard: {
    ...surfaces.card,
    marginBottom: 0,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    ...type.eyebrow,
  },
  modePill: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    paddingHorizontal: space.sm + 1,
    paddingVertical: space.xs + 1,
  },
  modePillText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '900',
  },
  trustCard: {
    marginTop: space.md + 2,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    padding: space.lg - 3,
  },
  trustTitle: {
    ...type.bodyStrong,
    fontSize: 14,
  },
  trustText: {
    marginTop: space.xs + 1,
    color: colors.accentInk,
    fontSize: 13,
    lineHeight: 19,
  },
  title: {
    marginTop: space.md,
    ...type.display,
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    marginTop: space.sm + 2,
    ...type.body,
    fontSize: 15,
    lineHeight: 23,
  },
  helperText: {
    marginTop: space.xs,
    marginBottom: space.sm,
    ...type.small,
  },
  field: {
    marginTop: space.lg,
  },
  label: {
    marginBottom: space.sm,
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    ...surfaces.input,
    paddingVertical: space.md,
    fontSize: 15,
  },
  inputHelper: {
    marginTop: space.xs + 2,
    ...type.small,
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
    width: space.md,
  },
  section: {
    marginTop: space.xl - 2,
    ...surfaces.card,
    marginBottom: 0,
  },
  sectionTitle: {
    ...type.heading,
    fontSize: 16,
  },
  sectionSubtitle: {
    marginTop: space.sm - 2,
    ...type.body,
    fontSize: 13,
  },
  slotWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: space.md,
    gap: space.sm,
  },
  slotChip: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: space.sm + 5,
    paddingVertical: space.sm + 1,
  },
  slotChipIdle: {
    backgroundColor: colors.surfaceSunken,
    borderColor: colors.rule,
  },
  slotChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  slotChipText: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  slotChipTextSelected: {
    color: colors.surface,
  },
  selectedSlotSummary: {
    marginTop: space.md,
    backgroundColor: colors.surfaceSunken,
    borderColor: colors.rule,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
  },
  selectedSlotSummaryText: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHint: {
    marginTop: space.md,
    ...type.body,
    fontSize: 13,
  },
  switchCard: {
    marginTop: space.lg + 2,
    ...surfaces.card,
    marginBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTextWrap: {
    flex: 1,
    paddingRight: space.md + 2,
  },
  switchTitle: {
    ...type.bodyStrong,
    fontSize: 15,
  },
  switchSubtitle: {
    marginTop: space.xs,
    ...type.body,
    fontSize: 13,
  },
  primaryButton: {
    ...surfaces.buttonPrimary,
    marginTop: space.xl,
  },
  primaryButtonText: {
    ...surfaces.buttonPrimaryText,
  },
  cancelButton: {
    ...surfaces.buttonQuiet,
    marginTop: space.sm + 2,
  },
  cancelButtonText: {
    ...surfaces.buttonQuietText,
  },
});
