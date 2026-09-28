import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';

export interface PriceStepperProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  step?: number;
  currency?: string;
  style?: StyleProp<ViewStyle>;
}

export function PriceStepper({
  value,
  onChange,
  min = 5,
  max = 100,
  step = 1,
  currency = 'S/',
  style,
}: PriceStepperProps) {
  const theme = useAppTheme();

  const handleDecrement = () => {
    if (value > min) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(Math.max(min, value - step));
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(Math.min(max, value + step));
    }
  };

  const isMin = value <= min;
  const isMax = value >= max;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.stepButton,
          { borderColor: theme.line, backgroundColor: theme.surface },
          isMin && styles.buttonDisabled,
        ]}
        onPress={handleDecrement}
        disabled={isMin}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Disminuir precio a ${Math.max(min, value - step)} Soles`}
      >
        <Text style={[styles.stepIcon, { color: theme.text }, isMin && { color: theme.textMuted }]}>−</Text>
      </TouchableOpacity>

      <View style={styles.valueWrap}>
        <Text style={[styles.currency, { color: theme.textMuted }]}>{currency}</Text>
        <Text style={[styles.value, { color: theme.text }]}>{value.toFixed(0)}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.stepButton,
          { borderColor: theme.line, backgroundColor: theme.surface },
          isMax && styles.buttonDisabled,
        ]}
        onPress={handleIncrement}
        disabled={isMax}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Aumentar precio a ${Math.min(max, value + step)} Soles`}
      >
        <Text style={[styles.stepIcon, { color: theme.text }, isMax && { color: theme.textMuted }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
  },
  stepButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  stepIcon: {
    fontFamily: FontFamily.medium,
    fontSize: 28,
    lineHeight: 32,
  },
  valueWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
  },
  currency: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize['2xl'],
  },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['6xl'],
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
});
