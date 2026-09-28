import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius } from '@theme/spacing';
import { AppIcon } from './AppIcon';

interface PageHeaderProps {
  title: string;
  onBack: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Encabezado de pantalla del diseño (.hdr): botón volver con borde y título de 24. */
export function PageHeader({ title, onBack, style }: PageHeaderProps) {
  const theme = useAppTheme();
  return (
    <View style={[styles.hdr, style]}>
      <TouchableOpacity
        style={[styles.back, { backgroundColor: theme.surface, borderColor: theme.line }]}
        onPress={onBack}
        activeOpacity={0.8}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        accessibilityRole="button"
        accessibilityLabel="Volver"
      >
        <AppIcon name="back" color={theme.text} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text }]} accessibilityRole="header" numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hdr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flexShrink: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    letterSpacing: -0.48,
  },
});
