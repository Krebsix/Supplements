import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

import { onDark } from '../theme';

/**
 * Tagesbogen (Design-Review 2026-09-01, 03): Einnahme-Slots als Punkte auf
 * einem Sonnenbogen, Uhrzeit 8 bis 20 Uhr auf 0 bis 180 Grad. Reine
 * Darstellung fuer die dunkle Petrol-Buehne (onDark-Toene), props rein.
 *
 * status je Slot: 'done' (gefuellter Punkt mit Haken), 'next' (Akzent-
 * Ring), 'later' (gedaempfter Ring). Die Zeit-Labels sind SVG-Text und
 * skalieren nicht mit Dynamic Type — bewusst: Im Bogen ist Umbruch
 * unmoeglich, dieselbe Information steht als Text in den Slot-Karten.
 * Jeder Punkt traegt eine unsichtbare 44-pt-Tippflaeche mit
 * accessibilityLabel; der Tipp springt zur Slot-Karte.
 */
const WIDTH = 150;
const HEIGHT = 104;
const CX = WIDTH / 2;
const CY = 82;
const R = 58;

function fractionForTime(time = '') {
  const [hourText, minuteText] = String(time).split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const hours = (Number.isFinite(hour) ? hour : 12) + (Number.isFinite(minute) ? minute / 60 : 0);
  return Math.min(1, Math.max(0, (hours - 8) / 12));
}

export default function DayArc({ slots = [], onPressSlot, statusLabels = {} }) {
  const points = slots.map((slot) => {
    const f = fractionForTime(slot.time);
    return {
      ...slot,
      x: CX - R * Math.cos(Math.PI * f),
      y: CY - R * Math.sin(Math.PI * f),
    };
  });

  return (
    <View style={styles.wrap}>
      <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Path
          d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
          stroke={onDark.rule}
          strokeWidth={2}
          fill="none"
        />
        {points.map((point) => (
          <React.Fragment key={point.id}>
            {point.status === 'done' ? (
              <>
                <Circle cx={point.x} cy={point.y} r={7} fill={onDark.accent} />
                <Path
                  d={`M ${point.x - 3} ${point.y} L ${point.x - 0.8} ${point.y + 2.4} L ${point.x + 3.2} ${point.y - 2.2}`}
                  stroke={onDark.checkInk}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </>
            ) : (
              <Circle
                cx={point.x}
                cy={point.y}
                r={5}
                stroke={point.status === 'next' ? onDark.accent : onDark.rule}
                strokeWidth={point.status === 'next' ? 2.4 : 2}
                fill="none"
              />
            )}
            <SvgText
              x={point.x}
              y={Math.min(HEIGHT - 2, point.y + 18)}
              fontSize={10}
              fill={onDark.inkMuted}
              textAnchor="middle"
            >
              {point.time}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
      {onPressSlot
        ? points.map((point) => (
            <TouchableOpacity
              key={`tap-${point.id}`}
              style={[styles.tap, { left: point.x - 22, top: point.y - 22 }]}
              onPress={() => onPressSlot(point.id)}
              accessibilityRole="button"
              accessibilityLabel={`${point.label}, ${point.time}, ${statusLabels[point.status] ?? ''}`}
            />
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: WIDTH,
    height: HEIGHT,
  },
  // Tippflaeche 44 pt (CLAUDE.md Bedienregeln) je Bogen-Punkt.
  tap: {
    position: 'absolute',
    width: 44,
    height: 44,
  },
});
