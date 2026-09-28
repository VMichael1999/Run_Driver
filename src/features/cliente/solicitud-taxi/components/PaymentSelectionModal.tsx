import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

export type SupportedPaymentMode = 'Efectivo' | 'Yape' | 'Plin';

interface PaymentOption {
  id: SupportedPaymentMode;
  label: string;
  subtitle: string;
  image: ReturnType<typeof require>;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'Efectivo',
    label: 'Efectivo',
    subtitle: 'Paga directo al conductor al finalizar',
    image: require('../../../../../assets/payment/efectivo.png'),
  },
  {
    id: 'Yape',
    label: 'Yape',
    subtitle: 'Paga escaneando el código QR del conductor',
    image: require('../../../../../assets/payment/yape.png'),
  },
  {
    id: 'Plin',
    label: 'Plin',
    subtitle: 'Transfiere con tu app bancaria al finalizar',
    image: require('../../../../../assets/payment/plin.png'),
  },
];

interface PaymentSelectionModalProps {
  visible: boolean;
  selectedMode: SupportedPaymentMode;
  onSelectMode: (mode: SupportedPaymentMode) => void;
  onClose: () => void;
}

export function PaymentSelectionModal({
  visible,
  selectedMode,
  onSelectMode,
  onClose,
}: PaymentSelectionModalProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, paddingBottom: Math.max(insets.bottom, Spacing.lg) },
            Shadow.sheet,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.line }]} />
          <Text style={[styles.title, { color: theme.text }]}>Método de pago</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Elige cómo deseas pagar tu viaje al llegar a tu destino
          </Text>

          <View style={styles.list}>
            {PAYMENT_OPTIONS.map((item) => {
              const isSelected = selectedMode === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.optionRow,
                    {
                      borderColor: isSelected ? theme.primary : theme.line,
                      backgroundColor: isSelected ? theme.surfaceMuted : theme.surface,
                    },
                  ]}
                  onPress={() => {
                    onSelectMode(item.id);
                    onClose();
                  }}
                  activeOpacity={0.8}
                  accessible
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Método de pago ${item.label}`}
                >
                  <Image source={item.image} style={styles.logo} resizeMode="contain" />
                  <View style={styles.textWrap}>
                    <Text style={[styles.optionLabel, { color: theme.text }]}>{item.label}</Text>
                    <Text style={[styles.optionSubtitle, { color: theme.textMuted }]}>
                      {item.subtitle}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      { borderColor: isSelected ? theme.primary : theme.line },
                      isSelected && { borderWidth: 7, borderColor: theme.primary },
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.scrim,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: -8,
  },
  list: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    gap: Spacing.md,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md - 1,
  },
  optionSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
});
