import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePaymentSelectionStore } from '@store/usePaymentSelectionStore';
import { PAYMENT_METHODS, type PaymentMethodId } from '@shared/data/paymentMethods';
import { AppCard, AppHeader, AppListRow, AppScreen, AppSectionTitle } from '@shared/components/ui';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { Spacing } from '@theme/spacing';

export function MetodosPagoScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const selectedId = usePaymentSelectionStore((s) => s.selectedId);
  const setSelected = usePaymentSelectionStore((s) => s.setSelected);

  const handleSelect = (id: PaymentMethodId) => {
    setSelected(id);
  };

  return (
    <AppScreen>
      <AppHeader title="Metodos de pago" />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
        showsVerticalScrollIndicator={false}
      >
        <AppSectionTitle>Otros metodos</AppSectionTitle>

        <AppCard padded={false} style={styles.section}>
          {PAYMENT_METHODS.map((method, index) => {
            const isSelected = selectedId === method.id;
            const isLast = index === PAYMENT_METHODS.length - 1;

            return (
              <AppListRow
                key={method.id}
                title={method.label}
                subtitle={method.description}
                showDivider={!isLast}
                onPress={() => handleSelect(method.id)}
                left={(
                  <View style={styles.iconWrap}>
                    <Image source={method.image} style={styles.icon} resizeMode="contain" />
                  </View>
                )}
                right={(
                  <View
                    style={[
                      styles.radio,
                      isSelected
                        ? { backgroundColor: theme.accent }
                        : { borderColor: theme.textDisabled, backgroundColor: 'transparent' },
                    ]}
                  >
                    {isSelected ? <Ionicons name="checkmark" size={16} color={Colors.white} /> : null}
                  </View>
                )}
                style={styles.row}
              />
            );
          })}
        </AppCard>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  section: {
    paddingHorizontal: Spacing.md,
  },
  row: {
    minHeight: 68,
  },
  iconWrap: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 40,
    height: 28,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
