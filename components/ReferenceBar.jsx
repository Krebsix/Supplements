import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, toneFor, type } from '../theme';

/**
 * ReferenceBar (Bedienkonzept-Spec Entscheidung 4, Phase 3b):
 * zeigt eine Menge relativ zu drei Ebenen als Balken —
 * D-A-CH-/EFSA-Referenzwert (dünner Strich), BfR-Höchstmenge je
 * Tagesdosis eines Präparats (Akzent-Strich) und EFSA-Obergrenze UL
 * (kräftiger Strich im Caution-Ton).
 *
 * Reine Darstellung, props rein:
 *   amount      die gezeigte Menge (Zahl); null/ungültig → rendert nichts
 *   reference   Referenzwert oder null
 *   bfrMax      BfR-Höchstmenge oder null (nur bei gleicher Einheit
 *               übergeben — die Prüfung macht der Aufrufer)
 *   upperLimit  EFSA-UL oder null
 *   fillColor   Füllfarbe aus toneFor(status) des Aufrufers
 *   legend      PFLICHT-Textzeile unter dem Balken (Status nie nur über
 *               Farbe); der Aufrufer baut sie lokalisiert und formatiert
 *
 * Cronometer-Muster, an unsere Regeln angepasst: gedeckte Töne, kein
 * Alarmrot, der Balken ergänzt den Text und ersetzt ihn nie.
 */
export default function ReferenceBar({
  amount,
  reference = null,
  bfrMax = null,
  upperLimit = null,
  fillColor,
  legend = '',
}) {
  if (!Number.isFinite(amount) || amount < 0) return null;
  const anchors = [reference, bfrMax, upperLimit].filter(
    (value) => Number.isFinite(value) && value > 0
  );
  if (anchors.length === 0) return null;

  // Skala: das Maximum aus Menge und Ankerwerten, mit Luft, damit der
  // äusserste Marker nicht am Rand klebt.
  const scaleMax = Math.max(amount, ...anchors) * 1.08;
  const pct = (value) => Math.min(100, Math.max(0, (value / scaleMax) * 100));

  const marker = (value, color, key, strong = false) =>
    Number.isFinite(value) && value > 0 ? (
      <View
        key={key}
        style={[
          styles.marker,
          strong && styles.markerStrong,
          { left: `${pct(value)}%`, backgroundColor: color },
        ]}
      />
    ) : null;

  return (
    <View style={styles.wrap} accessible accessibilityLabel={legend || undefined}>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${pct(amount)}%`, backgroundColor: fillColor ?? colors.accent },
          ]}
        />
        {marker(reference, colors.ink, 'reference')}
        {marker(bfrMax, colors.accent, 'bfrMax')}
        {marker(upperLimit, toneFor('caution').ink, 'upperLimit', true)}
      </View>
      {legend ? <Text style={styles.legend}>{legend}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: space.sm,
    marginBottom: space.xs,
  },
  track: {
    height: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.rule,
    overflow: 'visible',
  },
  fill: {
    height: 8,
    borderRadius: radius.sm,
  },
  marker: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 12,
    borderRadius: 1,
  },
  markerStrong: {
    width: 3,
    top: -3,
    height: 14,
  },
  legend: {
    ...type.tiny,
    marginTop: space.xs + 1,
    fontVariant: ['tabular-nums'],
  },
});
