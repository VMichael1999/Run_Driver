import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { RoutePolyline } from '@shared/components/map/RoutePolyline';
import { PageHeader } from '@shared/components/ui/PageHeader';
import { PlacaVehiculo } from '@shared/components/ui/PlacaVehiculo';
import { PaymentRow } from '@shared/components/ui/PaymentRow';
import { AppButton } from '@shared/components/ui/AppButton';
import { useThemeStore } from '@store/useThemeStore';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { getMapStyle } from '@theme/mapStyles';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Shadow } from '@theme/spacing';
import { TripTimeline } from './components/TripTimeline';
import { TripStatusPill } from './components/TripStatusPill';
import { useTripById } from './hooks/useTripHistory';
import type { TripHistoryItem } from './types';

type DetalleRoute = RouteProp<{ DetalleViaje: { tripId: string } }, 'DetalleViaje'>;

const MAP_HEIGHT = 200;

function formatTripDate(date: Date): string {
  const text = date.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${text.charAt(0).toUpperCase()}${text.slice(1).replace(/\./g, '')} · ${hour}:${minute}`;
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

const money = (currency: string, amount: number) => `${currency} ${amount.toFixed(2)}`;

/** Mapa estático con la ruta del viaje, encuadrado al tamaño de la tarjeta. */
function TripRouteMap({ trip }: { trip: TripHistoryItem }) {
  const theme = useAppTheme();
  const isDark = useThemeStore((s) => s.isDark);
  const mapRef = React.useRef<MapView | null>(null);
  const route = trip.route;
  if (!route) return null;
  const coordinates = route.points.length > 1 ? route.points : [route.origin, route.destination];

  return (
    <View style={[styles.mapCard, { borderColor: theme.line }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        customMapStyle={getMapStyle(isDark)}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
        initialRegion={{
          latitude: (route.origin.latitude + route.destination.latitude) / 2,
          longitude: (route.origin.longitude + route.destination.longitude) / 2,
          latitudeDelta: Math.abs(route.origin.latitude - route.destination.latitude) * 1.8 + 0.01,
          longitudeDelta: Math.abs(route.origin.longitude - route.destination.longitude) * 1.8 + 0.01,
        }}
        onMapReady={() =>
          mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: { top: 32, right: 32, bottom: 32, left: 32 },
            animated: false,
          })
        }
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        showsCompass={false}
        accessible
        accessibilityLabel={`Mapa de la ruta de ${trip.pickup.address || trip.pickup.label} a ${
          trip.dropoff?.address ?? 'destino'
        }`}
      >
        <RoutePolyline coordinates={coordinates} />
        <Marker coordinate={route.origin} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[styles.marker, { backgroundColor: Colors.origin }]}>
            <View style={styles.markerDot} />
          </View>
        </Marker>
        <Marker coordinate={route.destination} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[styles.marker, { backgroundColor: Colors.destination }]}>
            <View style={styles.markerDot} />
          </View>
        </Marker>
      </MapView>
    </View>
  );
}

/** Detalle de un viaje del historial: ruta, conductor y auto, recorrido y lo que se pagó. */
export function DetalleViajeScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<DetalleRoute>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const trip = useTripById(params.tripId);

  if (!trip) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background, paddingTop: insets.top + 10 }]}>
        <View style={styles.pad}>
          <PageHeader title="Detalle del viaje" onBack={() => navigation.goBack()} />
          <Text style={[styles.body, { color: theme.textMuted }]}>
            No encontramos este viaje. Puede que ya no esté en tu historial.
          </Text>
          <AppButton label="Volver a mis viajes" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  const isCancelled = trip.status === 'cancelled';
  const discountAmount = trip.originalPrice !== undefined ? trip.originalPrice - trip.price : 0;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[styles.pad, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 22 }]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title="Detalle del viaje" onBack={() => navigation.goBack()} />

        <View style={styles.dateRow}>
          <Text style={[styles.date, { color: theme.text }]}>{formatTripDate(trip.date)}</Text>
          <TripStatusPill status={trip.status} />
        </View>

        <TripRouteMap trip={trip} />

        {/* Conductor y auto */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <View style={styles.driverRow}>
            <View style={[styles.avatar, { backgroundColor: theme.text }]}>
              <Text style={[styles.avatarText, { color: theme.surface }]}>{initials(trip.driver.name)}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={[styles.name, { color: theme.text }]}>{trip.driver.name}</Text>
              <Text style={[styles.meta, { color: theme.textMuted }]}>
                {trip.driver.yearsAtCompany} {trip.driver.yearsAtCompany === 1 ? 'año' : 'años'} ·{' '}
                {trip.driver.rideCount} viajes
              </Text>
            </View>
          </View>
          {trip.vehicle ? (
            <View style={[styles.vehicleRow, { borderTopColor: theme.line }]}>
              <Text style={[styles.body, styles.flex, { color: theme.text }]}>
                {trip.vehicle.model} · {trip.vehicle.color.toLowerCase()}
              </Text>
              <PlacaVehiculo plate={trip.vehicle.plate} size="sm" />
            </View>
          ) : null}
        </View>

        {/* Recorrido */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recorrido</Text>
          <TripTimeline pickup={trip.pickup} dropoff={trip.dropoff} extraStop={trip.extraStop} />
        </View>

        {/* Pago */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Pago</Text>
          {isCancelled ? (
            <>
              <View style={styles.priceRow}>
                <Text style={[styles.body, { color: theme.textMuted }]}>Tarifa acordada</Text>
                <Text style={[styles.body, { color: theme.text }]}>{money(trip.currency, trip.price)}</Text>
              </View>
              <Text style={[styles.meta, { color: theme.textMuted }]}>El viaje se canceló antes de terminar.</Text>
            </>
          ) : (
            <>
              {trip.discount && trip.originalPrice !== undefined ? (
                <>
                  <View style={styles.priceRow}>
                    <Text style={[styles.body, { color: theme.textMuted }]}>Tarifa</Text>
                    <Text style={[styles.body, { color: theme.text }]}>
                      {money(trip.currency, trip.originalPrice)}
                    </Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={[styles.body, styles.flex, { color: theme.online }]} numberOfLines={1}>
                      Descuento ({trip.discount.source === 'coupon' ? `${trip.discount.label}, ` : ''}
                      {trip.discount.percent} %)
                    </Text>
                    <Text style={[styles.body, { color: theme.online }]}>
                      − {money(trip.currency, discountAmount)}
                    </Text>
                  </View>
                </>
              ) : null}
              {trip.tip ? (
                <View style={styles.priceRow}>
                  <Text style={[styles.body, { color: theme.textMuted }]}>Propina</Text>
                  <Text style={[styles.body, { color: theme.text }]}>{money(trip.currency, trip.tip)}</Text>
                </View>
              ) : null}
              <View style={styles.priceRow}>
                <Text style={[styles.total, { color: theme.text }]}>Pagaste</Text>
                <Text style={[styles.total, { color: theme.text }]}>
                  {money(trip.currency, trip.price + (trip.tip ?? 0))}
                </Text>
              </View>
            </>
          )}
          {trip.paymentMode ? <PaymentRow mode={trip.paymentMode} /> : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  pad: {
    paddingHorizontal: 18,
    gap: 16,
  },
  flex: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  date: {
    flex: 1,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
  },
  mapCard: {
    height: MAP_HEIGHT,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  marker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadow.sm,
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  name: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.bodyLg,
  },
  meta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  total: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lead,
  },
});
