import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import type { PaymentMode } from '@shared/types';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius } from '@theme/spacing';
import { AppIcon } from './AppIcon';

const PAYMENT_LOGOS: Record<PaymentMode, ReturnType<typeof require>> = {
  Efectivo: require('../../../../assets/payment/Efectivo.png'),
  Yape: require('../../../../assets/payment/Yape.png'),
  Plin: require('../../../../assets/payment/Plin.png'),
};

interface PaymentRowProps {
  mode: PaymentMode;
  /** Texto principal; por defecto el nombre del método. */
  label?: string;
  /** Texto a la derecha. Con `onPress` y sin `trailing` se muestra "Cambiar ›". */
  trailing?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Fila de método de pago del diseño (.payrow): logo, texto y acción a la derecha. */
export function PaymentRow({ mode, label, trailing, onPress, style }: PaymentRowProps) {
  const theme = useAppTheme();
  const text = label ?? mode;
  const showChange = !!onPress && trailing === undefined;

  return (
    <TouchableOpacity
      style={[styles.row, { borderColor: theme.line }, style]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={onPress ? `Método de pago: ${text}. Cambiar` : `${text}${trailing ? ` ${trailing}` : ''}`}
    >
      <Image source={PAYMENT_LOGOS[mode] ?? PAYMENT_LOGOS.Efectivo} style={styles.logo} resizeMode="contain" />
      <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>
        {text}
      </Text>
      {showChange || trailing ? (
        <View style={styles.trailing}>
          <Text style={[styles.trailingText, { color: theme.textMuted }]}>{trailing ?? 'Cambiar'}</Text>
          {showChange ? <AppIcon name="chev" size="s" color={theme.textMuted} /> : null}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
  },
  label: {
    flexShrink: 1,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  trailing: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trailingText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
});
