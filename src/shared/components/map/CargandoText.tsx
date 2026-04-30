import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@theme/colors';
import { Shadow, BorderRadius, Spacing } from '@theme/spacing';
import { FontFamily, FontSize } from '@theme/fonts';

interface Props {
  text?: string;
}

export function CargandoText({ text = 'Cargando..' }: Props) {
  return (
    <View style={[styles.container, Shadow.sm]}>
      <View style={styles.bar} />
      <Text style={styles.text}>{text}</Text>
      <View style={styles.bar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundItemLight,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bar: {
    height: 2,
    width: 120,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    opacity: 0.6,
  },
  text: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
  },
});
