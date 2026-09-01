import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { colors } from '../theme';

/**
 * Duoton-Piktogramm der Darreichungsform (Design-Review 2026-09-01, 03):
 * Flaeche accentSoft, Kontur accent, ein Detailstrich. Reine Darstellung,
 * props rein, kein Store-Zugriff. Fallback bei unbekannter Form: Tablette.
 */

// Ordnet die Einheit eines Praeparats (AddSupplement UNIT_OPTIONS plus
// Freitext) einer der vier Formen zu. Read-only auf vorhandenen Feldern.
export function formForUnit(unit = '') {
  const value = String(unit).trim().toLowerCase();
  if (value.startsWith('kapsel') || value.startsWith('softgel')) return 'kapsel';
  if (value.startsWith('tropfen') || value === 'ml') return 'tropfen';
  if (
    value === 'portion' ||
    value === 'g' ||
    value.startsWith('pulver') ||
    value.startsWith('beutel') ||
    value.startsWith('messl')
  ) {
    return 'pulver';
  }
  return 'tablette';
}

export default function Pictogram({ form = 'tablette', size = 24 }) {
  const stroke = colors.accent;
  const fill = colors.accentSoft;
  const common = { stroke, strokeWidth: 1.6, fill };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {form === 'kapsel' ? (
        // Rotierte Rounded-Rect mit Mittelnaht.
        <>
          <Rect x={7} y={4} width={10} height={16} rx={5} {...common} transform="rotate(-32 12 12)" />
          <Line
            x1={7.5}
            y1={12}
            x2={16.5}
            y2={12}
            stroke={stroke}
            strokeWidth={1.6}
            transform="rotate(-32 12 12)"
          />
        </>
      ) : null}
      {form === 'tropfen' ? (
        // Tropfen mit innerem Lichtbogen.
        <>
          <Path
            d="M12 3 C12 3 5.5 11 5.5 15.5 A6.5 6.5 0 0 0 18.5 15.5 C18.5 11 12 3 12 3 Z"
            {...common}
            strokeLinejoin="round"
          />
          <Path
            d="M8.8 15.5 A3.2 3.2 0 0 0 12 18.7"
            stroke={stroke}
            strokeWidth={1.6}
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : null}
      {form === 'pulver' ? (
        // Pulver-Tuete mit Falzlinie.
        <>
          <Path d="M7.5 4.5 H16.5 L18.5 19.5 H5.5 Z" {...common} strokeLinejoin="round" />
          <Line x1={7} y1={8.5} x2={17} y2={8.5} stroke={stroke} strokeWidth={1.6} />
        </>
      ) : null}
      {form !== 'kapsel' && form !== 'tropfen' && form !== 'pulver' ? (
        // Tablette: Kreis mit Bruchrille. Auch der Fallback.
        <>
          <Circle cx={12} cy={12} r={8} {...common} />
          <Line x1={5} y1={12} x2={19} y2={12} stroke={stroke} strokeWidth={1.6} />
        </>
      ) : null}
    </Svg>
  );
}
