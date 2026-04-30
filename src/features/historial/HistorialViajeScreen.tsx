import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackAppBar } from '@shared/components/appbar/BackAppBar';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';
import { formatDate } from '@shared/utils/dateUtils';

interface TripHistoryItem {
  id: string;
  origin: string;
  destination: string;
  date: Date;
  price: number;
  paymentMode: string;
}

const DUMMY_HISTORY: TripHistoryItem[] = [
  { id: '1', origin: 'Miraflores', destination: 'San Borja', date: new Date(), price: 12.5, paymentMode: 'Efectivo' },
  { id: '2', origin: 'San Isidro', destination: 'Surco', date: new Date(Date.now() - 86400000), price: 18.0, paymentMode: 'Yape' },
];

export function HistorialViajeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <BackAppBar title="Historial de viajes" />
      <FlatList
        data={DUMMY_HISTORY}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.date}>{formatDate(item.date)}</Text>
              <Text style={styles.price}>S/ {item.price.toFixed(2)}</Text>
            </View>
            <Text style={styles.route}>📍 {item.origin}</Text>
            <Text style={styles.route}>🏁 {item.destination}</Text>
            <Text style={styles.payment}>💳 {item.paymentMode}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tienes viajes registrados</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  list: { padding: Spacing.lg, gap: Spacing.sm },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  date: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: Colors.textSecondary },
  price: { fontSize: FontSize.md, fontFamily: FontFamily.bold, color: Colors.primary },
  route: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: Colors.textPrimary, marginBottom: 2 },
  payment: { fontSize: FontSize.xs, fontFamily: FontFamily.regular, color: Colors.textSecondary, marginTop: Spacing.sm },
  empty: { alignItems: 'center', marginTop: Spacing['5xl'] },
  emptyText: { fontSize: FontSize.md, fontFamily: FontFamily.regular, color: Colors.textSecondary },
});
