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
  /** Decimales que se muestran (2 para montos como 24.00). */
  decimals?: number;
  style?: StyleProp<ViewStyle>;
}

export function PriceStepper({
  value,
  onChange,
  min = 5,
  max = 100,
  step = 1,
  currency = 'S/',
  decimals = 0,
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
          { borderColor: theme.line },
          isMin && styles.buttonDisabled,
        ]}
        onPress={handleDecrement}
        disabled={isMin}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Bajar a ${currency} ${Math.max(min, value - step).toFixed(decimals)}`}
      >
        <Text style={[styles.stepIcon, { color: theme.text }, isMin && { color: theme.textMuted }]}>−</Text>
      </TouchableOpacity>

      <View style={styles.valueWrap} accessibilityLiveRegion="polite">
        <Text style={[styles.currency, { color: theme.text }]}>{currency}</Text>
        <Text style={[styles.value, { color: theme.text }]}>{value.toFixed(decimals)}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.stepButton,
          { borderColor: theme.line },
          isMax && styles.buttonDisabled,
        ]}
        onPress={handleIncrement}
        disabled={isMax}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Subir a ${currency} ${Math.min(max, value + step).toFixed(decimals)}`}
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
    gap: 8,
    width: '100%',
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
    fontSize: FontSize.glyph,
    lineHeight: 30,
  },
  // Ancho mínimo fijo: General Sans no tiene cifras tabulares y el número no debe saltar al cambiar.
  valueWrap: {
    flex: 1,
    minWidth: 150,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
  },
  currency: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.title,
  },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['6xl'],
    letterSpacing: -1.4,
  },
});
