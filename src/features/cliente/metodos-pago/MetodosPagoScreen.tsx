import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { usePaymentSelectionStore } from '@store/usePaymentSelectionStore';
import { PAYMENT_METHODS, type PaymentMethodId } from '@shared/data/paymentMethods';
import { AppHeader, AppScreen } from '@shared/components/ui';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Spacing, Shadow } from '@theme/spacing';

export function MetodosPagoScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const selectedId = usePaymentSelectionStore((s) => s.selectedId);
  const setSelected = usePaymentSelectionStore((s) => s.setSelected);

  const handleSelect = (id: PaymentMethodId) => {
    Haptics.selectionAsync();
    setSelected(id);
  };

  return (
    <AppScreen>
      <AppHeader title="Métodos de pago" />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          El que elijas se usará en tus próximos viajes. Puedes cambiarlo antes de pedir.
        </Text>

        <View
          style={styles.cardBox}
          accessibilityRole="radiogroup"
          accessibilityLabel="Opciones de métodos de pago"
        >
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedId === method.id;

            return (
              <TouchableOpacity
                key={method.id}
                onPress={() => handleSelect(method.id)}
                activeOpacity={0.8}
                style={[
                  styles.paymentCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: isSelected ? Colors.accentLime : theme.divider,
                  },
                  isSelected && styles.paymentCardSelected,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`${method.label}: ${method.description}${isSelected ? ', seleccionado' : ''}`}
              >
                <View style={styles.iconContainer}>
                  <Image
                    source={method.image}
                    style={styles.paymentLogo}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.textContainer}>
                  <Text style={[styles.methodTitle, { color: theme.text }]}>
                    {method.label}
                  </Text>
                  <Text style={[styles.methodDescription, { color: theme.textMuted }]}>
                    {method.description}
                  </Text>
                </View>

                <View
                  style={[
                    styles.radioIndicator,
                    {
                      borderColor: isSelected ? Colors.accentLime : theme.divider,
                      backgroundColor: isSelected ? Colors.accentLime : 'transparent',
                    },
                  ]}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={14} color={Colors.onAccentLime} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  cardBox: {
    gap: Spacing.md,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  paymentCardSelected: {
    borderWidth: 2,
    ...Shadow.raise,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#F7F8F9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  paymentLogo: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
  },
  methodTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    marginBottom: 2,
  },
  methodDescription: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  radioIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
