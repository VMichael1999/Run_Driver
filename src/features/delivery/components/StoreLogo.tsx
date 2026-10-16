import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { FontFamily } from '@theme/fonts';
import type { Restaurant } from '../data/mock';

interface StoreLogoProps {
  logo: Restaurant['logo'];
  size?: number;
  radius?: number;
  fontSize?: number;
  style?: StyleProp<ViewStyle>;
}

/** Logo del local (.lg): cuadrado redondeado con sus iniciales. Por defecto 30 × 30, radio 9. */
export function StoreLogo({ logo, size = 30, radius = 9, fontSize = 11, style }: StoreLogoProps) {
  return (
    <View
      style={[
        styles.box,
        { width: size, height: size, borderRadius: radius, backgroundColor: logo.background },
        style,
      ]}
    >
      <Text style={[styles.text, { color: logo.color, fontSize, letterSpacing: fontSize * 0.02 }]}>
        {logo.initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FontFamily.bold,
  },
});
