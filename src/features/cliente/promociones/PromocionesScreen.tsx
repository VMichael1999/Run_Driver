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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ClienteStackParamList } from '@navigation/types';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';
import { usePromociones } from './hooks/usePromociones';

type Nav = NativeStackNavigationProp<ClienteStackParamList, 'Promociones'>;

export function PromocionesScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.85}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promociones</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.couponCard}>
          <Text style={styles.couponTitle}>Codigo promocional</Text>
          {appliedCoupon ? (
            <View style={styles.appliedRow}>
              <View style={styles.appliedInfo}>
                <Text style={styles.appliedCode}>{appliedCoupon.code}</Text>
                <Text style={styles.appliedDescription}>
                  {appliedCoupon.description} ({appliedCoupon.discountPercent}% off)
                </Text>
              </View>
              <TouchableOpacity onPress={removeCoupon} activeOpacity={0.85}>
                <Ionicons name="close-circle" size={26} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="Ej. RUN10"
                placeholderTextColor={Colors.textDisabled}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.applyButton, !code.trim() && styles.applyButtonDisabled]}
                onPress={handleApply}
                disabled={!code.trim() || isApplying}
                activeOpacity={0.85}
              >
                {isApplying ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.applyButtonText}>Aplicar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <Text style={styles.sectionTitle}>Promociones activas</Text>

        {isLoading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : promotions.length === 0 ? (
          <Text style={styles.emptyText}>No hay promociones disponibles.</Text>
        ) : (
          promotions.map((promotion) => (
            <View key={promotion.id} style={styles.promotionCard}>
              <View style={styles.promoBadge}>
                <Text style={styles.promoBadgeText}>{promotion.discountPercent}% off</Text>
              </View>
              <Text style={styles.promoTitle}>{promotion.title}</Text>
              <Text style={styles.promoDescription}>{promotion.description}</Text>
              <Text style={styles.promoValid}>Valido hasta {promotion.validUntil}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7fb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.primary,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  headerTitle: { color: Colors.white, fontFamily: FontFamily.bold, fontSize: FontSize.lg },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.md },
  couponCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  couponTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  inputRow: { flexDirection: 'row', gap: Spacing.sm },
  input: {
    flex: 1,
    backgroundColor: '#eef2f7',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  applyButtonDisabled: { opacity: 0.5 },
  applyButtonText: { color: Colors.white, fontFamily: FontFamily.bold, fontSize: FontSize.sm },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7ec',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  appliedInfo: { flex: 1 },
  appliedCode: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.success },
  appliedDescription: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary },
  errorText: { color: Colors.error, fontFamily: FontFamily.regular, fontSize: FontSize.sm, marginTop: Spacing.sm },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  promotionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: 4,
    ...Shadow.sm,
  },
  promoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  promoBadgeText: { color: Colors.white, fontFamily: FontFamily.bold, fontSize: 11 },
  promoTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.textPrimary },
  promoDescription: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary },
  promoValid: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textDisabled, marginTop: 4 },
});
