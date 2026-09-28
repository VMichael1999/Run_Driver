import React, { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useAppTheme } from '@theme/useAppTheme';

export interface AuctionProgressBarProps {
  progress?: number; // 0 a 1
  durationMs?: number; // si se pasa durationMs, anima de 1 a 0 automáticamente
  color?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function AuctionProgressBar({
  progress = 1,
  durationMs,
  color,
  height = 4,
  style,
}: AuctionProgressBarProps) {
  const theme = useAppTheme();
  const barColor = color ?? theme.sig;
  const animatedProgress = useSharedValue(progress);

  useEffect(() => {
    if (durationMs && durationMs > 0) {
      animatedProgress.value = 1;
      animatedProgress.value = withTiming(0, {
        duration: durationMs,
        easing: Easing.linear,
      });
    } else {
      animatedProgress.value = withTiming(Math.max(0, Math.min(1, progress)), {
        duration: 250,
      });
    }
  }, [durationMs, progress, animatedProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: theme.line, borderRadius: height },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.bar,
          { height, backgroundColor: barColor, borderRadius: height },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
  },
});
