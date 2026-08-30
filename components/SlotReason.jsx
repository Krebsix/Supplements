import React from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTranslation } from '../i18n';
import { colors, space, toneFor, type } from '../theme';

// Kuerzt eine Regel- oder Hinweis-Formulierung auf den ersten Satz: Der
// vollstaendige Text samt Quelle steht im Wirkstoff-Profil bzw. im
// Zitat-Dialog (siehe openQuote unten), hier reicht die Kernaussage.
function firstSentence(text = '') {
  const cut = text.indexOf('. ');
  return cut === -1 ? text : text.slice(0, cut + 1);
}

// Kuerzel aus dem hinterlegten Quellentext, z. B. "NIH ODS" aus
// "NIH ODS: Iron Fact Sheet for Health Professionals".
function sourceLabel(sources) {
  const label = sources?.[0]?.label;
  if (!label) return '';
  const cut = label.indexOf(':');
  return cut === -1 ? label : label.slice(0, cut);
}

/**
 * SlotReason
 * ─────────────────────────────────────────────────────────────
 * Zeigt zu einem Tagesplan-Eintrag, warum ein Einnahme-Hinweis, ein
 * Konflikt oder eine foerderliche Kombination (Synergie) mit einem
 * anderen Praeparat hinterlegt ist. Kommt ausschliesslich aus belegten
 * Regeln (ScheduleGuidance.buildEntryGuidance) -- kein generierter Text.
 * Rendert nichts, wenn alle drei Listen leer sind.
 *
 * Tippen auf eine Notiz-Zeile oeffnet den betroffenen Wirkstoff in der
 * Suche (onOpenSubstance). Tippen auf eine Konflikt- oder Synergie-Zeile
 * oeffnet stattdessen einen Dialog mit dem vollstaendigen Regeltext und
 * der Quellenangabe -- der gekuerzte Zeilentext nennt nur den ersten
 * Satz, das vollstaendige Zitat gehoert an diese Stelle, nicht in die
 * Wirkstoffsuche (die kennt Paar-Regeln zwischen zwei Praeparaten nicht).
 */
export default function SlotReason({ guidance, onOpenSubstance }) {
  const { t } = useTranslation();
  const notes = guidance?.notes ?? [];
  const conflicts = guidance?.conflicts ?? [];
  const synergies = guidance?.synergies ?? [];

  if (notes.length === 0 && conflicts.length === 0 && synergies.length === 0) return null;

  function openQuote(entry) {
    const fullSourceLabel = entry.sources?.[0]?.label ?? '';
    const url = entry.sources?.[0]?.url ?? null;
    const message = fullSourceLabel ? `${entry.text}\n\n${fullSourceLabel}` : entry.text;

    const buttons = [{ text: t('common.cancel'), style: 'cancel' }];
    if (url) {
      buttons.push({
        text: t('dashboard.reason.openSource'),
        onPress: () => {
          Linking.openURL(url).catch(() => {});
        },
      });
    }

    Alert.alert(entry.partnerSupplementName, message, buttons);
  }

  return (
    <View style={styles.wrap}>
      {notes.map((note) => {
        const source = sourceLabel(note.sources);
        return (
          <TouchableOpacity
            key={note.substanceId}
            style={styles.row}
            onPress={() => onOpenSubstance?.(note.substanceId)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityHint={t('dashboard.reason.sourceHint')}
          >
            <Text style={styles.text}>
              {firstSentence(note.text)}
              {source ? <Text style={styles.source}> · {source}</Text> : null}
            </Text>
          </TouchableOpacity>
        );
      })}

      {conflicts.map((conflict) => {
        const tone = toneFor(conflict.severity);
        const source = sourceLabel(conflict.sources);
        return (
          <TouchableOpacity
            key={`${conflict.substanceId}-${conflict.partnerSubstanceId}`}
            style={styles.row}
            onPress={() => openQuote(conflict)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityHint={t('dashboard.reason.sourceHint')}
          >
            <Feather name="alert-circle" size={13} color={tone.ink} style={styles.icon} />
            <Text style={[styles.text, { color: tone.ink }]}>
              {t('dashboard.reason.conflict', { partner: conflict.partnerSupplementName })}{' '}
              {firstSentence(conflict.text)}
              {source ? <Text style={styles.source}> · {source}</Text> : null}
            </Text>
          </TouchableOpacity>
        );
      })}

      {synergies.map((synergy) => {
        const source = sourceLabel(synergy.sources);
        return (
          <TouchableOpacity
            key={`${synergy.substanceId}-${synergy.partnerSubstanceId}`}
            style={styles.row}
            onPress={() => openQuote(synergy)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityHint={t('dashboard.reason.sourceHint')}
          >
            <Feather name="plus-circle" size={13} color={colors.affirm} style={styles.icon} />
            <Text style={[styles.text, { color: colors.affirm }]}>
              {t('dashboard.reason.synergy', { partner: synergy.partnerSupplementName })}{' '}
              {firstSentence(synergy.text)}
              {source ? <Text style={styles.source}> · {source}</Text> : null}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: space.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: space.xs,
  },
  icon: {
    marginTop: 3,
    marginRight: space.xs,
  },
  text: {
    flex: 1,
    ...type.small,
    color: colors.inkMuted,
  },
  source: {
    ...type.tiny,
  },
});
