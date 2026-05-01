import React from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserNetworkAvatar } from '@shared/components/avatar/UserNetworkAvatar';
import { AppButton, AppCard, AppHeader, AppScreen, AppTextInput } from '@shared/components/ui';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing } from '@theme/spacing';
import { usePerfil } from './hooks/usePerfil';

export function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { profile, isLoading, error, update } = usePerfil();

  const [fullName, setFullName] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setEmail(profile.email);
    }
  }, [profile]);

  const handleSave = React.useCallback(async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      await update({ fullName: fullName.trim(), email: email.trim() });
      Alert.alert('Perfil actualizado', 'Tus cambios se guardaron correctamente.');
    } catch {
      Alert.alert('Error', 'No se pudo guardar el perfil. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  }, [email, fullName, profile, update]);

  if (isLoading) {
    return (
      <AppScreen contentStyle={styles.loadingContainer}>
        <ActivityIndicator color={theme.accent} />
      </AppScreen>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppScreen>
        <AppHeader title="Mi perfil" />
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarWrap}>
            <UserNetworkAvatar imageUrl={profile?.avatarUrl ?? ''} radius={44} />
            <Text style={[styles.phoneLabel, { color: theme.textMuted }]}>
              {profile?.countryCode} {profile?.phone}
            </Text>
          </View>

          <AppCard style={styles.formCard}>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>Nombre completo</Text>
            <AppTextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Tu nombre"
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Text style={[styles.fieldLabel, { color: theme.text }]}>Correo electronico</Text>
            <AppTextInput
              value={email}
              onChangeText={setEmail}
              placeholder="ejemplo@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <AppButton label="Guardar cambios" onPress={handleSave} loading={isSaving} style={styles.saveButton} />
          </AppCard>
        </ScrollView>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  phoneLabel: {
    marginTop: Spacing.sm,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  formCard: {
    gap: Spacing.md,
  },
  fieldLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  errorText: {
    color: Colors.error,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  saveButton: {
    marginTop: Spacing.sm,
  },
});
