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
import type { AuthStackParamList } from '@navigation/types';
import { useLogin } from './hooks/useLogin';
import { RoundedButton } from '@shared/components/button/RoundedButton';
import { CountryBottomSheet } from './components/CountryBottomSheet';
import { TermsPoliciesCard } from './components/TermsPoliciesCard';
import { paises } from '@data/paises';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius } from '@theme/spacing';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [countrySheetVisible, setCountrySheetVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(paises[0]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { phone, countryCode, isLoading, error, setPhone, submitPhone } = useLogin();

  const handleSubmit = async () => {
    if (!termsAccepted) return;
    const success = await submitPhone();
    if (success) {
      navigation.navigate('LoginVerificacion', {
        phone,
        countryCode: selectedCountry.code || countryCode,
      });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + Spacing['3xl'], paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Introduce tu numero de telefono</Text>
        <Text style={styles.subtitle}>Te enviaremos un codigo de verificacion a tu numero de telefono</Text>

        <View style={styles.phoneRow}>
          <TouchableOpacity style={styles.countryPicker} activeOpacity={0.8} onPress={() => setCountrySheetVisible(true)}>
            <Text style={styles.countryFlag}>🇵🇪</Text>
            <Text style={styles.countryCode}>{selectedCountry.code}</Text>
            <Text style={styles.countryChevron}>⌄</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.phoneInput}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={9}
            placeholder="999 999 999"
            placeholderTextColor={Colors.textDisabled}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.checkboxRow} onPress={() => setTermsAccepted((v) => !v)} activeOpacity={0.7}>
          <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
            {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.termsLabel}>Acepto continuar con este numero</Text>
        </TouchableOpacity>

        <RoundedButton
          label="Enviar codigo"
          onPress={handleSubmit}
          disabled={!termsAccepted || phone.length < 7}
          loading={isLoading}
          style={styles.button}
        />

        <View style={styles.termsCard}>
          <TermsPoliciesCard
            onTerminos={() => Alert.alert('Terminos', 'Contenido pendiente de migrar.')}
            onPoliticas={() => Alert.alert('Politicas', 'Contenido pendiente de migrar.')}
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
  flex: { flex: 1, backgroundColor: Colors.white },
  container: { paddingHorizontal: Spacing['2xl'], flexGrow: 1 },
  title: {
    fontSize: FontSize['3xl'],
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing['3xl'],
    textAlign: 'center',
  },
  phoneRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.divider,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  countryPicker: {
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.divider,
    backgroundColor: Colors.backgroundLight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryFlag: { marginRight: Spacing.xs, fontSize: 16 },
  countryCode: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
  },
  countryChevron: {
    marginLeft: Spacing.xs,
    color: Colors.textSecondary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    fontFamily: FontFamily.regular,
    color: Colors.textPrimary,
  },
  error: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
  },
  termsLabel: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    flex: 1,
  },
  button: { marginTop: Spacing.md },
  termsCard: { marginTop: Spacing.lg },
});
