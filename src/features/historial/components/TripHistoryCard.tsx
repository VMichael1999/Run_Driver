import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserNetworkAvatar } from '@shared/components/avatar/UserNetworkAvatar';
import type { TripHistoryItem } from '../types';
import { TripTimeline } from './TripTimeline';
import { TripStatusPill } from './TripStatusPill';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

interface Props {
  trip: TripHistoryItem;
  onPressMenu?: (trip: TripHistoryItem) => void;
}

function formatTripDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleDateString('es-PE', { month: 'short' }).replace('.', '');
  const year = date.getFullYear();
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${hour}:${minute}`;
}

export function TripHistoryCard({ trip, onPressMenu }: Props) {
  const theme = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.dateLabel, { color: theme.text }]}>{formatTripDate(trip.date)}</Text>
        <TouchableOpacity
          onPress={() => onPressMenu?.(trip)}
          activeOpacity={0.85}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="ellipsis-vertical" size={18} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.driverRow}>
        <UserNetworkAvatar imageUrl={trip.driver.avatarUrl} radius={22} />
        <View style={styles.driverInfo}>
          <Text style={[styles.driverName, { color: theme.text }]}>{trip.driver.name}</Text>
          <Text style={[styles.driverMeta, { color: theme.textMuted }]}>Antiguedad: {trip.driver.yearsAtCompany} ano</Text>
          <Text style={[styles.driverMeta, { color: theme.textMuted }]}>Viajes: {trip.driver.rideCount}</Text>
        </View>
      </View>

      <TripTimeline pickup={trip.pickup} dropoff={trip.dropoff} extraStop={trip.extraStop} />

      <View style={[styles.divider, { backgroundColor: theme.divider }]} />

      <View style={styles.footerRow}>
        <Text style={[styles.priceLabel, { color: theme.text }]}>
          {trip.currency} {trip.price.toFixed(2)}
        </Text>
        <TripStatusPill status={trip.status} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  driverInfo: { flex: 1 },
  driverName: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.textPrimary },
  driverMeta: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textSecondary },
  divider: {
    height: 1,
    backgroundColor: '#eef2f7',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
});
