import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import type { AuthStackParamList } from '@navigation/types';
import { useLogin } from './hooks/useLogin';
import { AppButton } from '@shared/components/ui/AppButton';
import { CountryBottomSheet } from './components/CountryBottomSheet';
import { TermsPoliciesCard } from './components/TermsPoliciesCard';
import { paises } from '@data/paises';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [countrySheetVisible, setCountrySheetVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(paises[0]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { phone, countryCode, isLoading, error, setPhone, submitPhone } = useLogin();

  const handleSubmit = async () => {
    if (!termsAccepted) return;
    Haptics.selectionAsync();
    const success = await submitPhone();
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('LoginVerificacion', {
        phone,
        countryCode: selectedCountry.code || countryCode,
      });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const toggleTerms = () => {
    Haptics.selectionAsync();
    setTermsAccepted((v) => !v);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + Spacing['2xl'],
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text }]}>
          Introduce tu número de teléfono
        </Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Te enviaremos un código de verificación a tu número de teléfono.
        </Text>

        <View
          style={[
            styles.phoneRow,
            { backgroundColor: theme.surface, borderColor: theme.divider },
          ]}
        >
          <TouchableOpacity
            style={[styles.countryPicker, { backgroundColor: theme.surfaceMuted, borderRightColor: theme.divider }]}
            activeOpacity={0.8}
            onPress={() => setCountrySheetVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`País seleccionado: ${selectedCountry.value}, código ${selectedCountry.code}`}
          >
            <Text style={styles.countryFlag}>🇵🇪</Text>
            <Text style={[styles.countryCode, { color: theme.text }]}>
              {selectedCountry.code}
            </Text>
            <Text style={[styles.countryChevron, { color: theme.textMuted }]}>⌄</Text>
          </TouchableOpacity>

          <TextInput
            style={[styles.phoneInput, { color: theme.text }]}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={9}
            placeholder="999 999 999"
            placeholderTextColor={theme.textDisabled}
            accessibilityLabel="Número de teléfono"
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={toggleTerms}
          activeOpacity={0.7}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: termsAccepted }}
          accessibilityLabel="Acepto continuar con este número"
        >
          <View
            style={[
              styles.checkbox,
              { borderColor: termsAccepted ? Colors.accentLime : theme.divider },
              termsAccepted && { backgroundColor: Colors.accentLime },
            ]}
          >
            {termsAccepted && (
              <Text style={[styles.checkmark, { color: Colors.onAccentLime }]}>✓</Text>
            )}
          </View>
          <Text style={[styles.termsLabel, { color: theme.textMuted }]}>
            Acepto continuar con este número
          </Text>
        </TouchableOpacity>

        <AppButton
          label="Enviar código"
          variant="sig"
          size="md"
          onPress={handleSubmit}
          disabled={!termsAccepted || phone.length < 7}
          loading={isLoading}
          style={styles.button}
          accessibilityLabel="Enviar código de verificación"
        />

        <View style={styles.termsCard}>
          <TermsPoliciesCard
            onTerminos={() =>
              Alert.alert(
                'Términos de uso',
                'Al utilizar RunSubasta aceptas las condiciones del servicio de transporte en Lima.'
              )
            }
            onPoliticas={() =>
              Alert.alert(
                'Política de privacidad',
                'Tus datos y ubicación se protegen bajo la Ley de Protección de Datos Personales del Perú.'
              )
            }
          />
        </View>
      </ScrollView>

      <CountryBottomSheet
        visible={countrySheetVisible}
        countries={paises}
        onClose={() => setCountrySheetVisible(false)}
        onSelect={setSelectedCountry}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    paddingHorizontal: Spacing['2xl'],
    flexGrow: 1,
  },
  title: {
    fontSize: FontSize['3xl'],
    fontFamily: FontFamily.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    marginBottom: Spacing['2xl'],
    textAlign: 'center',
    lineHeight: 20,
  },
  phoneRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    height: 54,
    ...Shadow.sm,
  },
  countryPicker: {
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    borderRightWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryFlag: {
    marginRight: Spacing.xs,
    fontSize: FontSize.lg,
  },
  countryCode: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
  },
  countryChevron: {
    marginLeft: Spacing.xs,
    fontSize: FontSize.sm,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
  },
  error: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  checkmark: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
  },
  termsLabel: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    flex: 1,
  },
  button: {
    marginTop: Spacing.xs,
  },
  termsCard: {
    marginTop: Spacing['2xl'],
    paddingHorizontal: Spacing.md,
  },
});
