import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@theme/colors';
import { Shadow, BorderRadius, Spacing } from '@theme/spacing';
import { FontFamily, FontSize } from '@theme/fonts';

export function MapaCargandoText() {
  return (
    <View style={[styles.container, Shadow.sm]}>
      <Text style={styles.text}>Cargando..</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundItemLight,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  text: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
});
