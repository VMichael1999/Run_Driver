import React from 'react';
import { TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '@theme/colors';

interface Props {
  onPress?: () => void;
  size?: number;
  color?: string;
  style?: ViewStyle;
  children: React.ReactNode;
}

export function CircleButton({ onPress, size = 58, color = Colors.white, style, children }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.base, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
