import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';

interface CountdownButtonProps {
  label: string;
  onPress: () => void;
  /** Momento (Date.now()) en que empezó a correr el tiempo. */
  startedAt: number;
  durationMs: number;
  /** Se llama una vez cuando el relleno llega a cero. */
  onExpire?: () => void;
  /** 'sig': lima intenso sobre lima tenue. 'neutral': gris sobre superficie (para acciones secundarias). */
  tone?: 'sig' | 'neutral';
  disabled?: boolean;
  height?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * Botón cuyo fondo es la cuenta regresiva: el color intenso se vacía de derecha a izquierda
 * sobre el mismo color tenue. Reemplaza a la barra de progreso separada.
 */
export function CountdownButton({
  label,
  onPress,
  startedAt,
  durationMs,
  onExpire,
  tone = 'sig',
  disabled = false,
  height = 42,
  style,
  accessibilityLabel,
}: CountdownButtonProps) {
  const theme = useAppTheme();
  const progress = useSharedValue(1);

  React.useEffect(() => {
    const remaining = Math.max(0, durationMs - (Date.now() - startedAt));
    progress.value = remaining / durationMs;
    progress.value = withTiming(0, { duration: remaining, easing: Easing.linear }, (finished) => {
      if (finished && onExpire) runOnJS(onExpire)();
    });
    return () => cancelAnimation(progress);
    // onExpire se omite a propósito: cambiarlo no debe reiniciar el tiempo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, durationMs, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  const colors =
    tone === 'sig'
      ? { track: theme.sig, trackOpacity: 0.35, fill: theme.sig, text: theme.onSig, border: 'transparent' }
      : { track: theme.surface, trackOpacity: 1, fill: theme.line, text: theme.text, border: theme.line };

  return (
    <TouchableOpacity
      style={[styles.button, { height, borderColor: colors.border }, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.track, opacity: colors.trackOpacity }]} />
      <Animated.View style={[styles.fill, { backgroundColor: colors.fill }, fillStyle]} />
      <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  disabled: {
    opacity: 0.6,
  },
});
