import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '@theme/colors';
import { FontFamily } from '@theme/fonts';
import { BorderRadius } from '@theme/spacing';

export interface PlacaVehiculoProps {
  plate: string;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

/**
 * Normaliza cualquier formato de placa a la convención peruana (ABC-123).
 * Si tiene 6 caracteres alfanuméricos seguidos, inserta el guión.
 */
function normalizePlate(raw: string): string {
  const clean = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length === 6) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  if (raw.includes('-')) {
    const parts = raw.split('-');
    if (parts.length === 2 && parts[0].length === 3) {
      return `${parts[0].toUpperCase()}-${parts[1].slice(0, 3).toUpperCase()}`;
    }
  }
  return raw.toUpperCase();
}

export function PlacaVehiculo({ plate, size = 'md', style }: PlacaVehiculoProps) {
  const formatted = normalizePlate(plate);
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        isSmall && styles.containerSm,
        isLarge && styles.containerLg,
        style,
      ]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Placa de vehículo ${formatted}`}
    >
      <View style={[styles.headerStrip, isLarge && styles.headerStripLg]}>
        <Text style={[styles.headerText, isLarge && styles.headerTextLg]}>PERÚ</Text>
      </View>
      <View style={[styles.plateNumberWrap, isLarge && styles.plateNumberWrapLg]}>
        <Text
          style={[
            styles.plateText,
            isSmall && styles.plateTextSm,
            isLarge && styles.plateTextLg,
          ]}
        >
          {formatted}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 84,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    alignSelf: 'flex-start',
  },
  containerSm: {
    minWidth: 70,
    borderWidth: 1.2,
  },
  containerLg: {
    minWidth: 140,
    borderWidth: 2,
    borderRadius: 9,
  },
  headerStrip: {
    backgroundColor: Colors.plateBlue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 1,
  },
  headerStripLg: {
    paddingVertical: 2,
  },
  headerText: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: 7.5,
    letterSpacing: 2,
  },
  headerTextLg: {
    fontSize: 10,
    letterSpacing: 2.5,
  },
  plateNumberWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  plateNumberWrapLg: {
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  plateText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.primary,
    letterSpacing: 1.2,
    fontVariant: ['tabular-nums'],
  },
  plateTextSm: {
    fontSize: 13,
    letterSpacing: 0.8,
  },
  plateTextLg: {
    fontSize: 26,
    letterSpacing: 2,
  },
});
