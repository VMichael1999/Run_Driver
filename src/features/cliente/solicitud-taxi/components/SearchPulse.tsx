import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '@theme/useAppTheme';
import { AppIcon } from '@shared/components/ui/AppIcon';

/** Una onda lima que se expande y se desvanece; `delay` escalona las tres ondas. */
function PulseRing({ active, delay }: { active: boolean; delay: number }) {
  const theme = useAppTheme();
  const t = useSharedValue(0);

  React.useEffect(() => {
    cancelAnimation(t);
    t.value = 0;
    if (active) {
      t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }), -1, false));
    }
  }, [active, delay, t]);

  const style = useAnimatedStyle(() => ({
    opacity: active ? 0.9 * (1 - t.value) : 0,
    transform: [{ scale: 0.35 + t.value * 0.65 }],
  }));

  return <Animated.View style={[styles.ring, { borderColor: theme.sig }, style]} />;
}

/** Ondas alrededor del rayo, que vibra cada tanto mientras se busca. Sin movimiento si el sistema lo pide. */
export function SearchPulse({ active }: { active: boolean }) {
  const theme = useAppTheme();
  const reduceMotion = useReducedMotion();
  const animate = active && !reduceMotion;
  const wiggle = useSharedValue(0);

  React.useEffect(() => {
    cancelAnimation(wiggle);
    wiggle.value = 0;
    if (!animate) return;
    wiggle.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 60 }),
        withTiming(12, { duration: 90 }),
        withTiming(-8, { duration: 80 }),
        withTiming(8, { duration: 80 }),
        withTiming(0, { duration: 60 }),
        withDelay(1300, withTiming(0, { duration: 0 })),
      ),
      -1,
      false,
    );
  }, [animate, wiggle]);

  const boltStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${wiggle.value}deg` }] }));

  return (
    <View style={styles.pulse} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <PulseRing active={animate} delay={0} />
      <PulseRing active={animate} delay={800} />
      <PulseRing active={animate} delay={1600} />
      <Animated.View style={[styles.bolt, { backgroundColor: theme.sig }, boltStyle]}>
        <AppIcon name="bolt" color={theme.onSig} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  pulse: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
  },
  bolt: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
