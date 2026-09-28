import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Shadow } from '@theme/spacing';

export interface StatusPillProps {
  label: string;
  status?: 'online' | 'offline' | 'danger' | 'warning' | 'pickup';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function StatusPill({ label, status = 'online', onPress, style }: StatusPillProps) {
  const theme = useAppTheme();

  const getDotColors = () => {
    switch (status) {
      case 'online':
        return { dot: theme.online, halo: theme.onlineSoft };
      case 'danger':
        return { dot: theme.danger, halo: theme.dangerSoft };
      case 'pickup':
        return { dot: theme.pickup, halo: theme.pickupSoft };
      case 'warning':
        return { dot: theme.warning, halo: theme.warningSoft };
      case 'offline':
      default:
        return { dot: theme.textMuted, halo: 'transparent' };
    }
  };

  const { dot, halo } = getDotColors();

  const content = (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface },
        Shadow.raise,
        style,
      ]}
    >
      <View style={[styles.dotHalo, { backgroundColor: halo }]}>
        <View style={[styles.dot, { backgroundColor: dot }]} />
      </View>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={label}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    gap: 8,
    alignSelf: 'flex-start',
  },
  dotHalo: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
});
