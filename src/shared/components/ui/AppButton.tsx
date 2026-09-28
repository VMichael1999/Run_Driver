import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius } from '@theme/spacing';

export interface AppButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'sig' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export function AppButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  icon,
  style,
  labelStyle,
  accessibilityLabel,
}: AppButtonProps) {
  const theme = useAppTheme();
  const isSmall = size === 'sm';

  const getVariantStyles = () => {
    switch (variant) {
      case 'sig':
        return {
          bg: theme.sig,
          fg: theme.onSig,
          border: 'transparent',
          indicator: theme.onSig,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          fg: theme.text,
          border: theme.line,
          indicator: theme.text,
        };
      case 'danger':
        return {
          bg: theme.danger,
          fg: Colors.white,
          border: 'transparent',
          indicator: Colors.white,
        };
      case 'primary':
      default:
        return {
          bg: theme.primary,
          fg: theme.onPrimary,
          border: 'transparent',
          indicator: theme.onPrimary,
        };
    }
  };

  const { bg, fg, border, indicator } = getVariantStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSmall ? styles.buttonSm : styles.buttonMd,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: variant === 'ghost' ? 1.5 : 0,
        },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={indicator} size="small" />
      ) : (
        <View style={styles.contentWrap}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text
            style={[
              styles.label,
              isSmall ? styles.labelSm : styles.labelMd,
              { color: fg },
              labelStyle,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonMd: {
    height: 56,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.xl,
  },
  buttonSm: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.lg,
  },
  disabled: {
    opacity: 0.45,
  },
  contentWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FontFamily.semibold,
    textAlign: 'center',
  },
  labelMd: {
    fontSize: FontSize.lg - 1, // 17px
  },
  labelSm: {
    fontSize: FontSize.md - 1, // 15px
  },
});
