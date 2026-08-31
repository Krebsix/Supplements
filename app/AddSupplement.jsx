import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { canAddSupplement, canUseProFeature } from '../Entitlements';
import { SLOT_ORDER } from '../TimingEngine';
import { adjustSlots, DEFAULT_SLOT, expandSlots, substanceIdsFromDetails, suggestPrimarySlot } from '../SlotSuggestion';
import FrequencyChips from '../components/FrequencyChips';
import ProductSummaryCard from '../components/ProductSummaryCard';
import ProGate from '../components/ProGate';
import SlotChips from '../components/SlotChips';
import { useTranslation } from '../i18n';
import { colors, radius, space, surfaces, type } from '../theme';
import useStore from '../useStore';
import { getDosageAmount, getDosageUnit } from '../utils/supplementFormatting';

// Einheiten-Chips fuer die manuelle Eingabe. Der gespeicherte Wert ist der
// deutsche Fachbegriff bzw. das Kuerzel, wie er bisher frei eingetippt
// wurde; nur das Label laeuft ueber i18n.
// Rundet Multiplikationsreste weg (0.1 * 3 = 0.30000000000000004).
const roundAmount = (value) => Math.round(value * 1000) / 1000;

const UNIT_OPTIONS = [
  { value: 'Kapsel', key: 'capsule' },
  { value: 'Tablette', key: 'tablet' },
  { value: 'mg', key: 'mg' },
  { value: 'Tropfen', key: 'drops' },
  { value: 'ml', key: 'ml' },
  { value: 'Portion', key: 'portion' },
];

/**
 * Screen "Aufnehmen": Produktkarte (oder Felder bei manueller Eingabe),
 * zwei Fragen (wie oft, wann), eingeklappt "Mehr Angaben", ein Knopf.
 * Vier Einstiege ueber Parameter: ?fromScan=1 (Katalog, Barcode, Foto),
 * ?editId=<id> (Bearbeiten), ohne Parameter manuell.
 *
 * Keine Fachlogik hier: Vorschlag und Slot-Ableitung kommen aus
 * SlotSuggestion.js, die Free-Grenze aus Entitlements.js.
 */
export default function AddSupplement() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  // Hoehe des nativen Modal-Headers, damit KeyboardAvoidingView auf iOS
  // die Tastatur nicht ueber den Header hinaus einblendet.
  const headerHeight = useHeaderHeight();

  const addUserSupplement = useStore((state) => state.addUserSupplement);
  const updateUserSupplement = useStore((state) => state.updateUserSupplement);
  const addSupplementFromPendingScan = useStore((state) => state.addSupplementFromPendingScan);
  const clearPendingScanResult = useStore((state) => state.clearPendingScanResult);
  const pendingScanResult = useStore((state) => state.pendingScanResult);
  const userSupplements = useStore((state) => state.userSupplements);
  const entitlement = useStore((state) => state.entitlement);
  const setStock = useStore((state) => state.setStock);
  const getStock = useStore((state) => state.getStock);

  const editIdParam = Array.isArray(params.editId) ? params.editId[0] : params.editId;
  const fromScanParam = Array.isArray(params.fromScan) ? params.fromScan[0] : params.fromScan;
  const editId = typeof editIdParam === 'string' && editIdParam.length > 0 ? editIdParam : null;
  const existingSupplement = editId
    ? userSupplements.find((supplement) => supplement.id === editId)
    : null;
  const fromScan = !editId && fromScanParam === '1' && Boolean(pendingScanResult);
  const isManual = !editId && !fromScan;

  // Produkt
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');
  const [unitOther, setUnitOther] = useState(false);
  // ?edit=1 (aus den Pruefpunkten des Scan-Ergebnisses): Produktfelder
  // direkt aufgeklappt, damit fehlende Angaben sofort nachgetragen werden.
  const editParam = Array.isArray(params.edit) ? params.edit[0] : params.edit;
  const [editingProduct, setEditingProduct] = useState(editParam === '1');

  // Zwei Fragen
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [selectedSlots, setSelectedSlots] = useState([DEFAULT_SLOT]);
  const [primarySlot, setPrimarySlot] = useState(DEFAULT_SLOT);
  const [reason, setReason] = useState(null);
  // Sobald die Nutzerin die Slot-Auswahl selbst antastet, darf der
  // Vorschlag sie nicht mehr ueberschreiben, auch wenn sich beim
  // Weitertippen des Namens der erkannte Wirkstoff aendert. Kein Reset
  // noetig: Der Screen wird je Aufruf neu gemountet.
  const [slotsTouched, setSlotsTouched] = useState(false);

  // Mehr Angaben
  const [moreOpen, setMoreOpen] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [packageUnits, setPackageUnits] = useState('');
  const [cureEnabled, setCureEnabled] = useState(false);
  const [cureOnDays, setCureOnDays] = useState('');
  const [cureOffDays, setCureOffDays] = useState('');
  const [notes, setNotes] = useState('');

  // Zutatenliste: beim Entwurf aus dem Scan/Katalog, beim Bearbeiten aus
  // dem Datensatz, bei manueller Eingabe aus Name/Menge/Einheit abgeleitet,
  // damit Matcher und Vorschlag den Namen versuchen koennen.
  const ingredientDetails = useMemo(() => {
    if (editId) {
      return Array.isArray(existingSupplement?.ingredientDetails) ? existingSupplement.ingredientDetails : [];
    }
    if (fromScan && Array.isArray(pendingScanResult?.ingredientDetails) && pendingScanResult.ingredientDetails.length > 0) {
      return pendingScanResult.ingredientDetails;
    }
    const trimmed = name.trim();
    if (!trimmed) return [];
    // Tagessummen-Konvention (StackAnalyzer): ingredientDetails zaehlen
    // EINMAL pro Tag. Katalog und Scan liefern die Menge je Tagesportion
    // (Naehrwerttabelle nach LMIV). Bei manueller Eingabe ist die Menge
    // "je Einnahme" — fuer die Tagessumme mal Haeufigkeit rechnen, sonst
    // wuerde 3x taeglich als ein Drittel gezaehlt und eine echte
    // Ueberschreitung bliebe unsichtbar. Nicht parsebare Mengen bleiben
    // unveraendert (keine erfundenen Werte).
    const numeric = Number(amount.trim().replace(',', '.'));
    const dailyAmount =
      Number.isFinite(numeric) && numeric > 0 && timesPerDay > 1
        ? String(roundAmount(numeric * timesPerDay))
        : amount.trim();
    return [{ name: trimmed, amount: dailyAmount, unit: unit.trim(), form: null }];
  }, [editId, existingSupplement, fromScan, pendingScanResult, name, amount, unit, timesPerDay]);

  // Bearbeiten: alles vorbelegen, kein Vorschlag, die gespeicherten Slots gelten.
  useEffect(() => {
    if (!existingSupplement) return;
    setName(existingSupplement.name || '');
    setAmount(getDosageAmount(existingSupplement, ''));
    const existingUnit = getDosageUnit(existingSupplement, '');
    setUnit(existingUnit);
    setUnitOther(Boolean(existingUnit) && !UNIT_OPTIONS.some((option) => option.value === existingUnit));
    const slots = Array.isArray(existingSupplement.timingSlots) && existingSupplement.timingSlots.length > 0
      ? existingSupplement.timingSlots
      : [DEFAULT_SLOT];
    setSelectedSlots(slots);
    setPrimarySlot(slots[0]);
    setTimesPerDay(Math.min(3, Math.max(1, slots.length)));
    setReason(null);
    setNotes(existingSupplement.notes || '');
    if (existingSupplement.cureConfig?.type === 'cycle') {
      setCureEnabled(true);
      setCureOnDays(String(existingSupplement.cureConfig.onDays ?? ''));
      setCureOffDays(String(existingSupplement.cureConfig.offDays ?? ''));
    } else {
      setCureEnabled(false);
      setCureOnDays('');
      setCureOffDays('');
    }
    const stock = getStock(existingSupplement.id);
    const price = Number(stock?.purchasePrice);
    const units = Number(stock?.packageUnits);
    setPurchasePrice(Number.isFinite(price) && price > 0 ? String(price) : '');
    setPackageUnits(Number.isFinite(units) && units > 0 ? String(units) : '');
    setMoreOpen(
      Boolean(existingSupplement.notes) ||
        existingSupplement.cureConfig?.type === 'cycle' ||
        (Number.isFinite(price) && price > 0) ||
        (Number.isFinite(units) && units > 0)
    );
  }, [existingSupplement, getStock]);

  // Entwurf aus Scan/Katalog: Name, Menge, Einheit uebernehmen; Warnhinweise
  // des Scans in die Notiz, damit sie nicht verloren gehen.
  useEffect(() => {
    if (!fromScan) return;
    setName(pendingScanResult.productName || pendingScanResult.name || '');
    const scannedAmount = pendingScanResult?.dosage?.amount ?? pendingScanResult?.dosageAmount ?? pendingScanResult?.amount ?? '';
    const scannedUnit = pendingScanResult?.dosage?.unit ?? pendingScanResult?.dosageUnit ?? pendingScanResult?.unit ?? '';
    setAmount(scannedAmount === null || scannedAmount === undefined ? '' : String(scannedAmount));
    setUnit(scannedUnit === null || scannedUnit === undefined ? '' : String(scannedUnit));
    const warnings = Array.isArray(pendingScanResult.warnings) ? pendingScanResult.warnings : [];
    setNotes(
      [
        warnings.length > 0 ? t('addSupplement.scan.warningsNote', { warnings: warnings.join('\n- ') }) : null,
        pendingScanResult.uncertaintyNote || null,
      ]
        .filter(Boolean)
        .join('\n\n')
    );
    // t absichtlich nicht in den Abhaengigkeiten: useTranslation() liefert
    // bei jedem Render eine neue Funktionsreferenz. Mit t in den Deps wuerde
    // dieser Effekt nach jedem Tastendruck (auch in anderen Feldern) erneut
    // feuern und Name/Menge/Einheit/Notiz auf die Scan-Werte zuruecksetzen,
    // sodass die Felder im Modus "Aendern" nicht editierbar waeren.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromScan, pendingScanResult]);

  // Vorschlag: sobald sich die erkannten Substanzen aendern (Entwurf geladen
  // oder manueller Name getippt). Nicht beim Bearbeiten.
  const substanceKey = useMemo(() => substanceIdsFromDetails(ingredientDetails).join('|'), [ingredientDetails]);
  useEffect(() => {
    if (editId) return;
    const suggestion = suggestPrimarySlot(substanceKey ? substanceKey.split('|') : []);
    setPrimarySlot(suggestion.slot);
    setReason(suggestion.reason);
    // Die Slot-AUSWAHL nur setzen, wenn die Nutzerin sie noch nicht selbst
    // angefasst hat: Sonst wuerde ein spaeter erkannter Wirkstoff (z. B.
    // beim Weitertippen des Namens) eine bewusste manuelle Wahl ueberschreiben.
    if (!slotsTouched) setSelectedSlots(expandSlots(suggestion.slot, timesPerDay));
    // timesPerDay absichtlich nicht in den Abhaengigkeiten: Die Haeufigkeit
    // hat ihren eigenen Handler, sonst wuerde jede Chip-Wahl den Vorschlag
    // neu setzen und eine manuelle Slot-Auswahl ueberschreiben.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, substanceKey]);

  // Ein verwaister Entwurf (Screen ohne fromScan geoeffnet) wird geraeumt.
  useEffect(() => {
    if (!fromScan && !editId && pendingScanResult) clearPendingScanResult();
  }, [clearPendingScanResult, editId, fromScan, pendingScanResult]);

  function handleTimesPerDay(count) {
    setTimesPerDay(count);
    // Frequenzwechsel respektiert eine manuelle Auswahl: Wurde schon
    // manuell an den Slots gedreht, passt adjustSlots die Auswahl an,
    // statt sie komplett neu aus dem Vorschlag zu bauen.
    setSelectedSlots((current) => (slotsTouched ? adjustSlots(current, primarySlot, count) : expandSlots(primarySlot, count)));
  }

  function toggleSlot(slotId) {
    setSlotsTouched(true);
    setSelectedSlots((current) => {
      const next = current.includes(slotId) ? current.filter((id) => id !== slotId) : [...current, slotId];
      return SLOT_ORDER.filter((id) => next.includes(id));
    });
  }

  function pickUnit(option) {
    if (option === 'other') {
      setUnitOther(true);
      setUnit('');
      return;
    }
    setUnitOther(false);
    setUnit(option.value);
  }

  /**
   * Kaufpreis und Packungsinhalt liegen im Bestand (stockBySupplementId),
   * dort rechnet die Kostenanalyse. Leere Felder loeschen den Wert, statt
   * einen alten Preis stehen zu lassen.
   */
  function persistPurchaseInfo(supplementId) {
    if (!supplementId) return;
    const priceText = purchasePrice.trim().replace(',', '.');
    const unitsText = packageUnits.trim();
    const price = Number(priceText);
    const units = Number.parseInt(unitsText, 10);
    const current = getStock(supplementId) ?? {};
    const next = { ...current };
    if (priceText && Number.isFinite(price) && price > 0) {
      next.purchasePrice = price;
      next.currency = current.currency || 'EUR';
    } else {
      delete next.purchasePrice;
    }
    if (unitsText && Number.isInteger(units) && units > 0) {
      next.packageUnits = units;
    } else {
      delete next.packageUnits;
    }
    if (Object.keys(next).length === 0 && Object.keys(current).length === 0) return;
    setStock(supplementId, next);
  }

  function handleSave() {
    if (!editId) {
      const activeCount = userSupplements.filter((supplement) => supplement.status !== 'archived').length;
      const gate = canAddSupplement(entitlement, activeCount);
      if (!gate.allowed) {
        Alert.alert(
          t('addSupplement.alert.limitTitle'),
          t('addSupplement.alert.limitMessage', { limit: gate.limit }),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('addSupplement.alert.limitAction'), onPress: () => router.push('/paywall') },
          ]
        );
        return;
      }
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert(t('addSupplement.alert.nameMissingTitle'), t('addSupplement.alert.nameMissingMessage'));
      return;
    }
    if (selectedSlots.length === 0) {
      Alert.alert(t('addSupplement.alert.slotMissingTitle'), t('addSupplement.alert.slotMissingMessage'));
      return;
    }

    let cureConfig = null;
    let cureStartDate = existingSupplement?.cureStartDate || null;
    if (cureEnabled) {
      const onDays = Number.parseInt(cureOnDays, 10);
      const offDays = Number.parseInt(cureOffDays, 10);
      if (!Number.isInteger(onDays) || onDays < 1 || !Number.isInteger(offDays) || offDays < 1) {
        Alert.alert(t('addSupplement.alert.cureInvalidTitle'), t('addSupplement.alert.cureInvalidMessage'));
        return;
      }
      cureConfig = { type: 'cycle', onDays, offDays };
      if (!cureStartDate) cureStartDate = new Date().toISOString();
    } else {
      cureStartDate = null;
    }

    // Felder, die der Screen nicht mehr zeigt, bleiben beim Bearbeiten
    // erhalten und bekommen beim Anlegen die bisherigen Standardwerte.
    const payload = {
      name: trimmedName,
      purpose: existingSupplement?.purpose || t('addSupplement.defaultPurpose'),
      category: existingSupplement?.category || t('addSupplement.defaultCategory'),
      timingSlots: selectedSlots,
      timingRaw: existingSupplement?.timingRaw || '',
      dosage: { amount: amount.trim(), unit: unit.trim() },
      ingredientDetails,
      childSafe: Boolean(existingSupplement?.childSafe),
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
        Alert.alert(t('addSupplement.alert.notFoundTitle'), t('addSupplement.alert.notFoundMessage'));
        return;
      }
      updateUserSupplement(editId, payload);
      persistPurchaseInfo(editId);
      router.back();
      return;
    }

    const created = fromScan
      ? addSupplementFromPendingScan(payload)
      : addUserSupplement({ ...payload, source: 'manual' });
    persistPurchaseInfo(created?.id);
    // Keine Bestaetigung per Alert: Der neue Eintrag im Tagesplan ist die
    // Bestaetigung.
    router.replace('/Dashboard');
  }

  const cureLocked = !canUseProFeature(entitlement).allowed && !cureEnabled;
  const showProductFields = isManual || editingProduct;
  const brand = fromScan && pendingScanResult?.brand && pendingScanResult.brand !== 'Demo Brand' ? pendingScanResult.brand : null;

  return (
    <KeyboardAvoidingView
      style={styles.screenWrap}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
    >
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t(editId ? 'addSupplement.title.edit' : 'addSupplement.title.new')}</Text>

        {showProductFields ? (
          <View style={styles.productFields}>
            <Field label={t('addSupplement.name.label')} value={name} onChangeText={setName} placeholder={t('addSupplement.name.placeholder')} autoFocus={isManual} />
            <View style={styles.row}>
              <View style={styles.rowField}>
                <Field label={t('addSupplement.amount.label')} value={amount} onChangeText={setAmount} placeholder={t('addSupplement.amount.placeholder')} keyboardType="decimal-pad" />
              </View>
            </View>
            <Text style={styles.label}>{t('addSupplement.unit.label')}</Text>
            <View style={styles.unitWrap}>
              {UNIT_OPTIONS.map((option) => {
                const active = !unitOther && unit === option.value;
                return (
                  <Pressable key={option.key} onPress={() => pickUnit(option)} style={[styles.unitChip, active && surfaces.chipActive]} accessibilityRole="button" accessibilityState={{ selected: active }}>
                    <Text style={[surfaces.chipText, active && surfaces.chipTextActive]}>{t(`addSupplement.unit.${option.key}`)}</Text>
                  </Pressable>
                );
              })}
              <Pressable onPress={() => pickUnit('other')} style={[styles.unitChip, unitOther && surfaces.chipActive]} accessibilityRole="button" accessibilityState={{ selected: unitOther }}>
                <Text style={[surfaces.chipText, unitOther && surfaces.chipTextActive]}>{t('addSupplement.unit.other')}</Text>
              </Pressable>
            </View>
            {unitOther ? (
              <TextInput style={styles.input} value={unit} onChangeText={setUnit} placeholder={t('addSupplement.unit.otherPlaceholder')} placeholderTextColor={colors.inkFaint} />
            ) : null}
          </View>
        ) : (
          <ProductSummaryCard
            name={name}
            brand={brand}
            ingredientDetails={ingredientDetails}
            dosage={{ amount, unit }}
            scanned={fromScan && pendingScanResult?.analysisMode === 'vision'}
            certifications={fromScan ? pendingScanResult?.certifications ?? [] : []}
            onEdit={() => setEditingProduct(true)}
          />
        )}

        <FrequencyChips value={timesPerDay} onChange={handleTimesPerDay} />
        <SlotChips selected={selectedSlots} onToggle={toggleSlot} reason={reason} showSuggestion={!editId} />

        <Pressable onPress={() => setMoreOpen((open) => !open)} style={styles.moreHeader} accessibilityRole="button" accessibilityState={{ expanded: moreOpen }}>
          <View style={styles.moreTitles}>
            <Text style={styles.moreTitle}>{t('addSupplement.more.title')}</Text>
            <Text style={styles.moreSubtitle}>{t('addSupplement.more.subtitle')}</Text>
          </View>
          <Feather name={moreOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.inkMuted} />
        </Pressable>

        {moreOpen ? (
          <View style={styles.moreBody}>
            <View style={styles.row}>
              <View style={styles.rowField}>
                <Field label={t('addSupplement.more.packageUnits')} value={packageUnits} onChangeText={setPackageUnits} placeholder={t('addSupplement.more.packageUnitsPlaceholder')} keyboardType="number-pad" />
              </View>
              <View style={styles.rowSpacer} />
              <View style={styles.rowField}>
                <Field label={t('addSupplement.more.price')} value={purchasePrice} onChangeText={setPurchasePrice} placeholder={t('addSupplement.more.pricePlaceholder')} keyboardType="decimal-pad" />
              </View>
            </View>

            {cureLocked ? (
              <ProGate />
            ) : (
              <View style={styles.switchRow}>
                <View style={styles.switchText}>
                  <Text style={styles.switchTitle}>{t('addSupplement.more.cure')}</Text>
                  <Text style={styles.switchSubtitle}>{t('addSupplement.more.cureSubtitle')}</Text>
                </View>
                <Switch
                  value={cureEnabled}
                  onValueChange={setCureEnabled}
                  trackColor={{ false: colors.rule, true: colors.accent }}
                  thumbColor={cureEnabled ? colors.surface : colors.canvas}
                  accessibilityLabel={t('addSupplement.more.cure')}
                />
              </View>
            )}
            {cureEnabled ? (
              <View style={styles.row}>
                <View style={styles.rowField}>
                  <Field label={t('addSupplement.more.cureOn')} value={cureOnDays} onChangeText={setCureOnDays} placeholder="21" keyboardType="number-pad" />
                </View>
                <View style={styles.rowSpacer} />
                <View style={styles.rowField}>
                  <Field label={t('addSupplement.more.cureOff')} value={cureOffDays} onChangeText={setCureOffDays} placeholder="7" keyboardType="number-pad" />
                </View>
              </View>
            ) : null}

            <Field label={t('addSupplement.more.notes')} value={notes} onChangeText={setNotes} placeholder={t('addSupplement.more.notesPlaceholder')} multiline />
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footerBar}>
        <Pressable style={styles.footerCancel} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('common.cancel')}>
          <Text style={surfaces.buttonQuietText}>{t('common.cancel')}</Text>
        </Pressable>
        <Pressable style={styles.footerConfirm} onPress={handleSave} accessibilityRole="button">
          <Text style={surfaces.buttonPrimaryText}>{t(editId ? 'addSupplement.save.edit' : 'addSupplement.save.new')}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({ label, multiline = false, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholderTextColor={colors.inkFaint}
        multiline={multiline}
        accessibilityLabel={label}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrap: { flex: 1, backgroundColor: colors.canvas },
  screen: { flex: 1 },
  content: { ...surfaces.content, paddingBottom: 120 },
  title: { ...type.heading, marginBottom: space.lg },
  productFields: { ...surfaces.card, padding: space.lg },
  field: { marginBottom: space.md },
  label: { ...type.label, marginBottom: space.xs },
  input: { ...surfaces.input },
  inputMultiline: { minHeight: 88, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  rowField: { flex: 1 },
  rowSpacer: { width: space.md },
  unitWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.md },
  unitChip: { ...surfaces.chip },
  moreHeader: { flexDirection: 'row', alignItems: 'center', marginTop: space.xl, paddingVertical: space.md, borderTopWidth: 1, borderTopColor: colors.rule },
  moreTitles: { flex: 1 },
  moreTitle: { ...type.bodyStrong },
  moreSubtitle: { ...type.small, marginTop: 2 },
  moreBody: { marginTop: space.sm },
  switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.md },
  switchText: { flex: 1, paddingRight: space.md },
  switchTitle: { ...type.bodyStrong },
  switchSubtitle: { ...type.small, marginTop: 2 },
  footerBar: {
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  footerCancel: { ...surfaces.buttonQuiet, flex: 1, alignItems: 'center' },
  footerConfirm: { ...surfaces.buttonPrimary, flex: 2, alignItems: 'center', borderRadius: radius.md },
});
