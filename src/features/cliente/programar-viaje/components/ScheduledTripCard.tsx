import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { serviceImage } from '@features/cliente/solicitud-taxi/data/services';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Shadow } from '@theme/spacing';
import { AppIcon } from '@shared/components/ui/AppIcon';
import type { ScheduledTrip } from '../types';
import { ScheduledRouteRail } from './ScheduledRouteRail';

interface ScheduledTripCardProps {
  trip: ScheduledTrip;
  onPress: (trip: ScheduledTrip) => void;
}

/** "Lun 28 sep, 10:46" */
export function formatScheduledDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date
    .toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })
    .replace(/\./g, '');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${day.charAt(0).toUpperCase()}${day.slice(1)}, ${hour}:${minute}`;
}

/** Tarjeta de un viaje programado, con la misma estructura que las de "Mis viajes". */
export function ScheduledTripCard({ trip, onPress }: ScheduledTripCardProps) {
  const theme = useAppTheme();
  const image = trip.service ? serviceImage(trip.service.id) : undefined;
  const price = trip.service ? `${trip.service.currency} ${trip.service.price.toFixed(2)}` : '';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surface }]}
      onPress={() => onPress(trip)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Viaje programado para el ${formatScheduledDate(trip.scheduledFor)}${
        trip.service ? `, ${trip.service.name}, ${price}` : ''
      }. Ver detalle`}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.date, { color: theme.text }]}>{formatScheduledDate(trip.scheduledFor)}</Text>
        <View style={[styles.pill, { backgroundColor: theme.sig }]}>
          <AppIcon name="time" size="s" color={theme.onSig} />
          <Text style={[styles.pillText, { color: theme.onSig }]}>Programado</Text>
        </View>
      </View>

      {trip.service ? (
        <View style={styles.serviceRow}>
          {image ? <Image source={image} style={styles.serviceImage} resizeMode="contain" /> : null}
          <View style={styles.flex}>
            <Text style={[styles.serviceName, { color: theme.text }]}>{trip.service.name}</Text>
            <Text style={[styles.meta, { color: theme.textMuted }]}>
              Pagas con {trip.paymentMode ?? 'Efectivo'}
            </Text>
          </View>
        </View>
      ) : null}

      <ScheduledRouteRail origin={trip.origin} destination={trip.destination} stops={trip.stops ?? []} />

      <View style={[styles.divider, { backgroundColor: theme.line }]} />

      <View style={styles.footerRow}>
        <Text style={[styles.price, { color: theme.text }]}>{price}</Text>
        <View style={styles.detailLink}>
          <Text style={[styles.detailText, { color: theme.textMuted }]}>Ver detalle</Text>
          <AppIcon name="chev" size="s" color={theme.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: 16,
    gap: 14,
    ...Shadow.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  date: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.caption,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serviceImage: {
    width: 64,
    height: 42,
  },
  flex: {
    flex: 1,
  },
  serviceName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.bodyLg,
  },
  meta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
  },
  divider: {
    height: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.caption,
  },
});
