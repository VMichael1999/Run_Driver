import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

interface EarningsPeriod {
  label: string;
  amount: number;
  trips: number;
}

const DUMMY_EARNINGS: EarningsPeriod[] = [
  { label: 'Hoy', amount: 87.5, trips: 6 },
  { label: 'Esta semana', amount: 432.0, trips: 31 },
  { label: 'Este mes', amount: 1840.5, trips: 128 },
];

export function IngresosScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Text style={styles.header}>Mis ingresos</Text>
      <View style={styles.cards}>
        {DUMMY_EARNINGS.map((period) => (
          <View key={period.label} style={styles.card}>
            <Text style={styles.periodLabel}>{period.label}</Text>
            <Text style={styles.amount}>S/ {period.amount.toFixed(2)}</Text>
            <Text style={styles.trips}>{period.trips} viajes</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  header: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    color: Colors.primary,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  cards: { padding: Spacing.lg, gap: Spacing.md },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadow.sm,
  },
  periodLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: Colors.textSecondary, marginBottom: Spacing.sm },
  amount: { fontSize: FontSize['3xl'], fontFamily: FontFamily.bold, color: Colors.primary },
  trips: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: Colors.textSecondary, marginTop: Spacing.xs },
});
