import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import type { PassengerAlert } from '@shared/types';
import { useSolicitudes } from './hooks/useSolicitudes';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Nav = NativeStackNavigationProp<ConductorStackParamList, 'ConductorHome'>;

export function SolicitudesScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { solicitudes, isLoading } = useSolicitudes();

  const handlePress = (item: PassengerAlert) => {
    navigation.navigate('SolicitudesDetalle', { alertId: item.passengerName });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Solicitudes cercanas</Text>
      <FlatList
        data={solicitudes}
        keyExtractor={(item) => item.passengerName}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handlePress(item)} activeOpacity={0.85}>
            <View style={styles.cardHeader}>
              <Text style={styles.passengerName}>{item.passengerName}</Text>
              <Text style={styles.rating}>⭐ {item.rating}</Text>
            </View>
            <View style={styles.route}>
              <Text style={styles.routeLabel}>📍 {item.origin.placeName}</Text>
              <Text style={styles.routeArrow}>↓</Text>
              <Text style={styles.routeLabel}>🏁 {item.destination.placeName}</Text>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.payment}>💳 {item.paymentMethod.mode}</Text>
              {item.comment ? (
                <Text style={styles.comment} numberOfLines={1}>"{item.comment}"</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hay solicitudes en este momento</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  header: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    color: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  list: { padding: Spacing.lg, gap: Spacing.md },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  passengerName: { fontSize: FontSize.md, fontFamily: FontFamily.bold, color: Colors.textPrimary },
  rating: { fontSize: FontSize.md, fontFamily: FontFamily.bold, color: Colors.primary },
  route: { marginBottom: Spacing.sm },
  routeLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: Colors.textSecondary },
  routeArrow: { fontSize: FontSize.xs, color: Colors.textDisabled, marginLeft: Spacing.sm },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  payment: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: Colors.textSecondary },
  comment: { flex: 1, fontSize: FontSize.xs, fontFamily: FontFamily.italic, color: Colors.textDisabled },
  empty: { alignItems: 'center', marginTop: Spacing['5xl'] },
  emptyText: { fontSize: FontSize.md, fontFamily: FontFamily.regular, color: Colors.textSecondary },
});
