import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { LoginVerificacionProps } from '@navigation/types';
import { useOtpVerification } from './hooks/useOtpVerification';
import { AppButton } from '@shared/components/ui/AppButton';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Spacing, Shadow } from '@theme/spacing';

const RESEND_SECONDS = 30;

const keypadRows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['back', '0', 'empty'],
] as const;

export function LoginVerificacionScreen({ route, navigation }: LoginVerificacionProps) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { phone, countryCode } = route.params;
  const { code, isLoading, error, setCode, submitCode } = useOtpVerification();

  const [resendSeconds, setResendSeconds] = React.useState(RESEND_SECONDS);
  const shakeAnim = React.useRef(new Animated.Value(0)).current;

  // Countdown para reenviar código
  React.useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSeconds]);

  // Auto-submit al completar los 4 dígitos
  React.useEffect(() => {
    if (code.length === 4) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      void submitCode();
    }
  }, [code]);

  // Shake animation cuando hay error
  React.useEffect(() => {
    if (!error) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [error]);

  const handleDigitPress = (digit: string) => {
    if (isLoading || code.length >= 4) return;
    Haptics.selectionAsync();
    setCode(`${code}${digit}`);
  };

  const handleBackspace = () => {
    if (isLoading || code.length === 0) return;
    Haptics.selectionAsync();
    setCode(code.slice(0, -1));
  };

  const handleResend = () => {
    if (resendSeconds > 0) return;
    Haptics.selectionAsync();
    setResendSeconds(RESEND_SECONDS);
    setCode('');
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom + Spacing.md,
          backgroundColor: theme.background,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.surfaceMuted }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Volver a la pantalla anterior"
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Logo oficial de RunSubasta (negro y lima) */}
      <View style={styles.logoWrap}>
        <Image
          source={require('../../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Textos */}
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: theme.text }]}>Verificación</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Ingresa el código enviado a{' '}
          <Text style={[styles.phone, { color: theme.text }]}>
            {countryCode} {phone}
          </Text>
        </Text>
      </View>

      {/* Cajas OTP */}
      <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
        {[0, 1, 2, 3].map((index) => {
          const digit = code[index];
          const isActive = index === code.length && !isLoading;
          const hasError = !!error;
          return (
            <View
              key={index}
              style={[
                styles.otpBox,
                {
                  backgroundColor: theme.surface,
                  borderColor: hasError
                    ? Colors.danger
                    : isActive
                    ? Colors.accentLime
                    : digit
                    ? theme.text
                    : theme.divider,
                },
                isActive && styles.otpBoxActive,
              ]}
            >
              {digit ? (
                <View style={[styles.otpDot, { backgroundColor: theme.text }]} />
              ) : isActive ? (
                <View style={[styles.otpCursor, { backgroundColor: Colors.accentLime }]} />
              ) : null}
            </View>
          );
        })}
      </Animated.View>

      {/* Error / Reenviar */}
      <View style={styles.feedbackRow}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <TouchableOpacity
            onPress={handleResend}
            disabled={resendSeconds > 0}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={
              resendSeconds > 0
                ? `Reenviar código disponible en ${resendSeconds} segundos`
                : 'Reenviar código de verificación'
            }
          >
            <Text
              style={[
                styles.resendText,
                { color: resendSeconds > 0 ? theme.textDisabled : theme.text },
              ]}
            >
              {resendSeconds > 0
                ? `Reenviar código en ${resendSeconds}s`
                : '¿No recibiste el código? Reenviar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Teclado numérico */}
      <View style={styles.keypad}>
        {keypadRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key) => {
              if (key === 'empty') {
                return <View key={key} style={styles.keypadSpacer} />;
              }

              if (key === 'back') {
                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.keyBtn}
                    onPress={handleBackspace}
                    activeOpacity={0.6}
                    accessibilityRole="button"
                    accessibilityLabel="Borrar dígito"
                  >
                    <Ionicons name="backspace-outline" size={24} color={theme.text} />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.keyBtn,
                    styles.digitBtn,
                    { backgroundColor: theme.surface },
                  ]}
                  onPress={() => handleDigitPress(key)}
                  activeOpacity={0.7}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel={`Dígito ${key}`}
                >
                  <Text style={[styles.digitText, { color: theme.text }]}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Botón verificar */}
      <View style={styles.verifyWrap}>
        <AppButton
          label="Verificar"
          variant="sig"
          size="md"
          onPress={submitCode}
          disabled={code.length !== 4}
          loading={isLoading}
          accessibilityLabel="Verificar código OTP"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
  },
  textBlock: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: 4,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontFamily: FontFamily.bold,
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
  },
  phone: {
    fontFamily: FontFamily.bold,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  otpBox: {
    width: 54,
    height: 58,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  otpBoxActive: {
    borderWidth: 2,
  },
  otpDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  otpCursor: {
    width: 2,
    height: 20,
    borderRadius: 1,
  },
  feedbackRow: {
    alignItems: 'center',
    minHeight: 28,
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  resendText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  keypad: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  keyBtn: {
    width: 68,
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitBtn: {
    ...Shadow.sm,
  },
  digitText: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
  },
  keypadSpacer: {
    width: 68,
    height: 52,
  },
  verifyWrap: {
    paddingHorizontal: Spacing.sm,
  },
});
