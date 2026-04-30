import React from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { LoginVerificacionProps } from '@navigation/types';
import { useOtpVerification } from './hooks/useOtpVerification';
import { LegacyImages } from '@shared/assets/legacyAssets';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';

const keypadRows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['back', '0', 'empty'],
] as const;

export function LoginVerificacionScreen({ route }: LoginVerificacionProps) {
  const insets = useSafeAreaInsets();
  const { phone, countryCode } = route.params;
  const { code, isLoading, error, setCode, submitCode } = useOtpVerification();

  const handleDigitPress = (digit: string) => {
    if (isLoading || code.length >= 4) return;
    setCode(`${code}${digit}`);
  };

  const handleBackspace = () => {
    if (isLoading || code.length === 0) return;
    setCode(code.slice(0, -1));
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.logoWrap}>
          <Image source={LegacyImages.logo} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.subtitle}>
          Ingresa el codigo de 4 digitos enviado a{'\n'}
          <Text style={styles.phone}>
            {countryCode} {phone}
          </Text>
        </Text>

        <View style={styles.otpRow}>
          {[0, 1, 2, 3].map((index) => {
            const digit = code[index];
            return (
              <View key={index} style={[styles.otpBox, digit && styles.otpBoxFilled]}>
                <Text style={styles.otpText}>{digit || ''}</Text>
              </View>
            );
          })}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : <View style={styles.errorPlaceholder} />}

        <View style={styles.keypad}>
          {keypadRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map((key) => {
                if (key === 'empty') {
                  return <View key={key} style={styles.keypadSpacer} />;
                }

                if (key === 'back') {
                  return (
                    <TouchableOpacity key={key} style={styles.backButton} onPress={handleBackspace} activeOpacity={0.75}>
                      <Ionicons name="backspace-outline" size={22} color={Colors.textPrimary} />
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.digitButton}
                    onPress={() => handleDigitPress(key)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.digitText}>{key}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, (code.length !== 4 || isLoading) && styles.verifyButtonDisabled]}
          onPress={submitCode}
          activeOpacity={0.85}
          disabled={code.length !== 4 || isLoading}
        >
          <Text style={styles.verifyButtonText}>{isLoading ? 'Verificando...' : 'Verificar'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.white },
  container: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    justifyContent: 'space-between',
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  logo: {
    width: 68,
    height: 68,
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  phone: {
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  otpBox: {
    width: 44,
    height: 50,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#d8dee8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  otpBoxFilled: {
    borderColor: '#8ea3bf',
    backgroundColor: '#eef4fb',
  },
  otpText: {
    fontSize: 22,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
  },
  error: {
    minHeight: 20,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  errorPlaceholder: {
    minHeight: 20,
    marginTop: Spacing.md,
  },
  keypad: {
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  digitButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#f3f6fa',
    borderWidth: 1,
    borderColor: '#dbe3ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    color: Colors.primary,
  },
  backButton: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadSpacer: {
    width: 54,
    height: 54,
  },
  verifyButton: {
    marginTop: Spacing.xl,
    minHeight: 50,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  verifyButtonDisabled: {
    opacity: 0.45,
  },
  verifyButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
  },
});
