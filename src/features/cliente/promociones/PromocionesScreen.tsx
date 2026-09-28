import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { AppHeader, AppScreen } from '@shared/components/ui';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Spacing, Shadow } from '@theme/spacing';
import { usePromociones } from './hooks/usePromociones';

export function PromocionesScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { promotions, isLoading, error, appliedCoupon, applyCoupon, removeCoupon } =
    usePromociones();

  const [code, setCode] = React.useState<string>('');
  const [isApplying, setIsApplying] = React.useState<boolean>(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    Haptics.selectionAsync();
    setIsApplying(true);
    try {
      const result = await applyCoupon(code);
      if (result.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCode('');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemove = () => {
    Haptics.selectionAsync();
    removeCoupon();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppScreen>
        <AppHeader title="Promociones" />

        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + Spacing['2xl'] },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Sección de ingreso de código */}
          <View style={styles.sectionWrap}>
            <Text style={[styles.sectionHeading, { color: theme.text }]}>
              ¿Tienes un código?
            </Text>

            <View
              style={[
                styles.couponInputRow,
                { backgroundColor: theme.surface, borderColor: theme.divider },
              ]}
            >
              <Ionicons
                name="pricetag-outline"
                size={18}
                color={Colors.online}
                style={styles.inputIcon}
              />
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="Ej. RUN10"
                placeholderTextColor={theme.textDisabled}
                autoCapitalize="characters"
                autoCorrect={false}
                style={[styles.inputField, { color: theme.text }]}
                accessibilityLabel="Código promocional"
              />
              <TouchableOpacity
                onPress={handleApply}
                disabled={!code.trim() || isApplying}
                activeOpacity={0.8}
                style={[
                  styles.applyBtn,
                  {
                    backgroundColor: code.trim() ? Colors.accentLime : theme.surfaceMuted,
                    opacity: isApplying ? 0.7 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Aplicar código promocional"
              >
                {isApplying ? (
                  <ActivityIndicator size="small" color={Colors.onAccentLime} />
                ) : (
                  <Text
                    style={[
                      styles.applyBtnText,
                      { color: code.trim() ? Colors.onAccentLime : theme.textDisabled },
                    ]}
                  >
                    Aplicar
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Mensaje de cupón aplicado */}
            {appliedCoupon ? (
              <View
                style={[
                  styles.appliedBanner,
                  { backgroundColor: Colors.onlineSoft, borderColor: Colors.online },
                ]}
              >
                <Ionicons name="checkmark-circle" size={18} color={Colors.online} />
                <View style={styles.appliedTextWrap}>
                  <Text style={[styles.appliedTitle, { color: Colors.online }]}>
                    {appliedCoupon.code} aplicado
                  </Text>
                  <Text style={[styles.appliedDesc, { color: theme.textMuted }]}>
                    {appliedCoupon.description} ({appliedCoupon.discountPercent} % menos)
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleRemove}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Quitar código aplicado"
                  style={styles.removeCouponBtn}
                >
                  <Ionicons name="close-circle" size={20} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Error al aplicar cupón */}
            {error ? (
              <View style={[styles.errorBanner, { backgroundColor: Colors.dangerSoft }]}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.danger} />
                <Text style={[styles.errorText, { color: Colors.danger }]}>{error}</Text>
              </View>
            ) : null}
          </View>

          {/* Sección de promociones activas */}
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>
                Activas para ti
              </Text>
              <View style={[styles.countBadge, { backgroundColor: theme.surfaceMuted }]}>
                <Text style={[styles.countBadgeText, { color: theme.textMuted }]}>
                  {promotions.length}
                </Text>
              </View>
            </View>

            {isLoading ? (
              <ActivityIndicator color={Colors.accentLime} style={styles.loader} />
            ) : promotions.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
                <Ionicons name="gift-outline" size={32} color={theme.textDisabled} />
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  No hay promociones disponibles por ahora.
                </Text>
              </View>
            ) : (
              <View style={styles.promotionsList}>
                {promotions.map((promo) => (
                  <View
                    key={promo.id}
                    style={[
                      styles.promoCard,
                      { backgroundColor: theme.surface, borderColor: theme.divider },
                    ]}
                  >
                    {/* Badge de porcentaje */}
                    <View
                      style={[
                        styles.percentBadge,
                        { backgroundColor: Colors.accentLime },
                      ]}
                    >
                      <Text style={styles.percentText}>{promo.discountPercent} %</Text>
                    </View>

                    <View style={styles.promoContent}>
                      <Text style={[styles.promoTitle, { color: theme.text }]}>
                        {promo.title}
                      </Text>
                      <Text style={[styles.promoDescription, { color: theme.textMuted }]}>
                        {promo.description}
                      </Text>
                      <Text style={[styles.promoValidity, { color: Colors.online }]}>
                        {promo.id === 'p-001'
                          ? 'Se aplica solo al pedir'
                          : 'Hoy aplica en Lima'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
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
    paddingTop: Spacing.sm,
    gap: Spacing.xl,
  },
  sectionWrap: {
    gap: Spacing.sm,
  },
  sectionHeading: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  countBadgeText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    paddingLeft: Spacing.md,
    paddingRight: 6,
    height: 52,
    ...Shadow.sm,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  inputField: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    letterSpacing: 0.5,
  },
  applyBtn: {
    paddingHorizontal: Spacing.md,
    height: 40,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  appliedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
    marginTop: 4,
  },
  appliedTextWrap: {
    flex: 1,
  },
  appliedTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  appliedDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    marginTop: 1,
  },
  removeCouponBtn: {
    padding: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    marginTop: 4,
  },
  errorText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  loader: {
    marginVertical: Spacing.xl,
  },
  emptyCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  promotionsList: {
    gap: Spacing.md,
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  percentBadge: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.onAccentLime,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    marginBottom: 2,
  },
  promoDescription: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 16,
    marginBottom: 4,
  },
  promoValidity: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize['2xs'],
    fontStyle: 'italic',
  },
});
