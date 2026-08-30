import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  FadeOutLeft,
  FadeOutRight,
  SlideInLeft,
  SlideInRight,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useTranslation } from '../../i18n';
import { colors, radius, space, surfaces } from '../../theme';

/**
 * OnboardingShell
 * ─────────────────────────────────────────────────────────────
 * Traegt Kopfzeile (Zurueck-Pfeil, Fortschrittsbalken), den animierten
 * Inhalt eines Schritts und eine feste Fusszeile mit den Knoepfen.
 *
 * Der Inhalt bekommt `key={step}`: Wechselt der Schritt, montiert
 * Reanimated einen neuen `Animated.View` und laesst den alten mit einer
 * Exit-Animation abtreten. `direction` bestimmt, aus welcher Richtung der
 * neue Inhalt kommt, `onboarding.jsx` (Task 4) setzt sie beim Weiter- bzw.
 * Zurueck-Wechsel.
 */
export default function OnboardingShell({
  step,
  total,
  direction,
  canGoBack,
  onBack,
  footer,
  children,
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  const progress = useSharedValue(total > 0 ? step / total : 0);

  useEffect(() => {
    const target = total > 0 ? step / total : 0;
    progress.value = withSpring(target, { damping: 18, stiffness: 120 });
  }, [step, total, progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, progress.value)) * 100}%`,
  }));

  let entering;
  let exiting;
  if (reducedMotion) {
    entering = FadeIn.duration(150);
    exiting = FadeOut.duration(120);
  } else if (direction === 'back') {
    entering = SlideInLeft.duration(220).easing(Easing.out(Easing.cubic));
    exiting = FadeOutRight.duration(180);
  } else {
    entering = SlideInRight.duration(220).easing(Easing.out(Easing.cubic));
    exiting = FadeOutLeft.duration(180);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.backSlot}>
          {canGoBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={space.sm}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.back')}
            >
              <Feather name="chevron-left" size={28} color={colors.ink} />
            </Pressable>
          ) : null}
        </View>

        <View
          style={styles.progressTrack}
          accessibilityRole="progressbar"
          accessibilityLabel={t('onboarding.progress', { step, total })}
        >
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </View>

      <View style={styles.contentWrapper}>
        <Animated.View
          key={step}
          entering={entering}
          exiting={exiting}
          style={styles.content}
        >
          {children}
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
        {footer}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { ...surfaces.screen, flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.md,
    gap: space.md,
  },
  backSlot: { width: 28, alignItems: 'flex-start' },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.rule,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
  },
  contentWrapper: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
});
