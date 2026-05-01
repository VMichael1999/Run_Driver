import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton, AppCard, AppHeader, AppScreen, AppSectionTitle, AppTextInput } from '@shared/components/ui';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';
import { usePromociones } from './hooks/usePromociones';

export function PromocionesScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { promotions, isLoading, error, appliedCoupon, applyCoupon, removeCoupon } = usePromociones();

  const [code, setCode] = React.useState<string>('');
  const [isApplying, setIsApplying] = React.useState<boolean>(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setIsApplying(true);
    try {
      const result = await applyCoupon(code);
      if (result.ok) setCode('');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppScreen>
        <AppHeader title="Promociones" />
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
          keyboardShouldPersistTaps="handled"
        >
          <AppCard>
            <Text style={[styles.couponTitle, { color: theme.text }]}>Codigo promocional</Text>
            {appliedCoupon ? (
              <View style={[styles.appliedRow, { backgroundColor: theme.surfaceSoft }]}>
                <View style={styles.appliedInfo}>
                  <Text style={styles.appliedCode}>{appliedCoupon.code}</Text>
                  <Text style={[styles.appliedDescription, { color: theme.textMuted }]}>
                    {appliedCoupon.description} ({appliedCoupon.discountPercent}% off)
                  </Text>
                </View>
                <TouchableOpacity onPress={removeCoupon} activeOpacity={0.85}>
                  <Ionicons name="close-circle" size={26} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.inputRow}>
                <AppTextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="Ej. RUN10"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  inputStyle={styles.couponInput}
                />
                <AppButton
                  label="Aplicar"
                  onPress={handleApply}
                  disabled={!code.trim()}
                  loading={isApplying}
                  style={styles.applyButton}
                  labelStyle={styles.applyButtonText}
                />
              </View>
            )}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </AppCard>

          <AppSectionTitle>Promociones activas</AppSectionTitle>

          {isLoading ? (
            <ActivityIndicator color={theme.accent} />
          ) : promotions.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay promociones disponibles.</Text>
          ) : (
            promotions.map((promotion) => (
              <AppCard key={promotion.id} style={styles.promotionCard}>
                <View style={styles.promoBadge}>
                  <Text style={styles.promoBadgeText}>{promotion.discountPercent}% off</Text>
                </View>
                <Text style={[styles.promoTitle, { color: theme.text }]}>{promotion.title}</Text>
                <Text style={[styles.promoDescription, { color: theme.textMuted }]}>{promotion.description}</Text>
                <Text style={[styles.promoValid, { color: theme.textDisabled }]}>Valido hasta {promotion.validUntil}</Text>
              </AppCard>
            ))
          )}
        </ScrollView>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  couponTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  couponInput: {
    flex: 1,
    fontFamily: FontFamily.bold,
    letterSpacing: 1,
  },
  applyButton: {
    minWidth: 90,
    borderRadius: BorderRadius.md,
  },
  applyButtonText: {
    fontSize: FontSize.sm,
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  appliedInfo: {
    flex: 1,
  },
  appliedCode: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.success,
  },
  appliedDescription: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  errorText: {
    color: Colors.error,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  promotionCard: {
    gap: 4,
  },
  promoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  promoBadgeText: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: 11,
  },
  promoTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  promoDescription: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  promoValid: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    marginTop: 4,
  },
});
