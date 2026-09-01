import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../theme';
import Pictogram, { formForUnit } from './Pictogram';

/**
 * Produkt-Vignette der Als-Naechstes-Karte (Design-Review 2026-09-01, 03).
 *
 * Packungsfotos werden bisher nirgends persistiert (der Scanner legt keine
 * Bild-URI am Praeparat ab), deshalb gibt es hier NUR den Piktogramm-
 * Fallback auf surfaceSunken — niemals Stock- oder Platzhalterbilder.
 * TODO: Sobald ein Foto-Feld am Praeparat existiert, hier das echte Bild
 * zeigen. Die Persistenz selbst waere Fachlogik und gehoert nicht in
 * diesen Design-Umbau.
 */
export default function ProductThumb({ supplement, size = 52 }) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Pictogram form={formForUnit(supplement?.unit)} size={Math.round(size * 0.55)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
