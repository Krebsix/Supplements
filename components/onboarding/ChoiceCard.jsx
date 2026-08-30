import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { border, colors, radius, space, type } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * ChoiceCard
 * ─────────────────────────────────────────────────────────────
 * Antippbare Auswahlkarte fuer Onboarding-Fragen mit genau einer Antwort
 * je Karte (Geschlecht, Schwangerschaft/Stillzeit). Skaliert beim
 * Antippen kurz herunter, mit Haptik, die nicht auf jedem Geraet
 * verfuegbar ist, deshalb in try/catch.
 */
export default function ChoiceCard({ title, subtitle, selected, onPress, icon }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 90 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 90 });
  };

  const handlePress = () => {
    try {
      Haptics.selectionAsync();
    } catch {
      // Haptik ist nicht auf jedem Geraet verfuegbar, kein Abbruch der Auswahl.
    }
    onPress?.();
  };

  return (
    <AnimatedPressable
      style={[styles.card, selected && styles.cardSelected, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={title}
    >
      {icon ? (
        <Feather
          name={icon}
          size={22}
          color={selected ? colors.accent : colors.inkMuted}
          style={styles.icon}
        />
      ) : null}

      <View style={styles.textBlock}>
        <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {selected ? (
        <Feather name="check" size={20} color={colors.accent} style={styles.check} />
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    marginBottom: space.sm,
    borderWidth: border.hairline,
    borderColor: colors.surface,
  },
  cardSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  icon: { marginRight: space.md },
  textBlock: { flex: 1 },
  title: { ...type.bodyStrong },
  titleSelected: { color: colors.accentInk },
  subtitle: { ...type.small, marginTop: 2 },
  check: { marginLeft: space.md },
});
