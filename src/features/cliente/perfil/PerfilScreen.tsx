import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { UserNetworkAvatar } from '@shared/components/avatar/UserNetworkAvatar';
import {
  AppButton,
  AppCard,
  AppHeader,
  AppScreen,
  AppTextInput,
} from '@shared/components/ui';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Spacing, Shadow } from '@theme/spacing';
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
    Haptics.selectionAsync();
    setIsSaving(true);
    try {
      await update({ fullName: fullName.trim(), email: email.trim() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Perfil actualizado', 'Tus cambios se guardaron correctamente.');
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'No se pudo guardar el perfil. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  }, [email, fullName, profile, update]);

  if (isLoading) {
    return (
      <AppScreen contentStyle={styles.loadingContainer}>
        <ActivityIndicator color={Colors.accentLime} size="large" />
      </AppScreen>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppScreen>
        <AppHeader title="Mi perfil" />
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + Spacing['2xl'] },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar y teléfono */}
          <View style={styles.avatarWrap}>
            <View style={[styles.avatarBorder, { borderColor: Colors.accentLime }]}>
              <UserNetworkAvatar imageUrl={profile?.avatarUrl ?? ''} radius={44} />
            </View>
            <Text style={[styles.userNameHeading, { color: theme.text }]}>
              {profile?.fullName || 'Pasajero Run Rider'}
            </Text>
            <Text style={[styles.phoneLabel, { color: theme.textMuted }]}>
              {profile?.countryCode} {profile?.phone}
            </Text>
          </View>

          {/* Formulario de perfil */}
          <AppCard style={styles.formCard}>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>
              Nombre completo
            </Text>
            <AppTextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Tu nombre y apellido"
              autoCapitalize="words"
              returnKeyType="next"
              accessibilityLabel="Nombre completo"
            />

            <Text style={[styles.fieldLabel, { color: theme.text }]}>
              Correo electrónico
            </Text>
            <AppTextInput
              value={email}
              onChangeText={setEmail}
              placeholder="ejemplo@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
              accessibilityLabel="Correo electrónico"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <AppButton
              label="Guardar cambios"
              variant="sig"
              size="md"
              onPress={handleSave}
              loading={isSaving}
              style={styles.saveButton}
              accessibilityLabel="Guardar cambios de perfil"
            />
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
    gap: Spacing.xs,
  },
  avatarBorder: {
    borderWidth: 2.5,
    borderRadius: 50,
    padding: 3,
    marginBottom: Spacing.xs,
  },
  userNameHeading: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
  },
  phoneLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  formCard: {
    gap: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  fieldLabel: {
    fontFamily: FontFamily.semibold,
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
