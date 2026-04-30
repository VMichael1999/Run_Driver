import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '@theme/colors';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ExpandedCard({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
});
