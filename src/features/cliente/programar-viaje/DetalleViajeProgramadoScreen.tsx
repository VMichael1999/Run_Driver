import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ClienteStackParamList } from '@navigation/types';
import type { Coordinates } from '@shared/types';
import { useScheduledTripsStore } from '@store/useScheduledTripsStore';
import { useThemeStore } from '@store/useThemeStore';
import { getRoutePolyline } from '@shared/services/googleMapsService';
import { RoutePolyline } from '@shared/components/map/RoutePolyline';
import { PageHeader } from '@shared/components/ui/PageHeader';
import { PaymentRow } from '@shared/components/ui/PaymentRow';
import { AppButton } from '@shared/components/ui/AppButton';
import { AppIcon } from '@shared/components/ui/AppIcon';
import { serviceImage } from '@features/cliente/solicitud-taxi/data/services';
import { MAX_EXTRA_STOPS } from '@features/cliente/solicitud-taxi/utils/routeRequest';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { getMapStyle } from '@theme/mapStyles';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Shadow } from '@theme/spacing';
import { ScheduledRouteRail } from './components/ScheduledRouteRail';
import { formatScheduledDate } from './components/ScheduledTripCard';

type Props = NativeStackScreenProps<ClienteStackParamList, 'DetalleViajeProgramado'>;

const MAP_HEIGHT = 240;

/**
 * Detalle de un viaje programado: mapa con la ruta, servicio, recorrido y pago. El origen y el
 * destino quedan fijos; se pueden agregar o quitar paradas y cambiar el método de pago.
 */
export function DetalleViajeProgramadoScreen({ navigation, route }: Props) {
  const { tripId } = route.params;
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const isDark = useThemeStore((s) => s.isDark);
  const trip = useScheduledTripsStore((s) => s.trips.find((t) => t.id === tripId));
  const updateTrip = useScheduledTripsStore((s) => s.updateTrip);
  const removeStop = useScheduledTripsStore((s) => s.removeStop);
  const cancelTrip = useScheduledTripsStore((s) => s.cancelTrip);
  const mapRef = React.useRef<MapView | null>(null);

  const tripStops = trip?.stops;
  const stops = React.useMemo(() => tripStops ?? [], [tripStops]);
  const origin = trip?.origin?.position;
  const destination = trip?.destination?.position;

  // Al cambiar las paradas se borra la ruta guardada; aquí se vuelve a trazar.
  React.useEffect(() => {
    if (!trip || trip.routePoints || !origin || !destination) return;
    const waypoints = stops.map((stop) => stop.position);
    let cancelled = false;
    void getRoutePolyline(origin, destination, waypoints)
      .catch((): Coordinates[] => [origin, ...waypoints, destination])
      .then((routePoints) => {
        if (!cancelled) updateTrip(trip.id, { routePoints });
      });
    return () => {
      cancelled = true;
    };
  }, [trip, origin, destination, stops, updateTrip]);

  const routeCoordinates = React.useMemo(() => {
    if (trip?.routePoints && trip.routePoints.length > 1) return trip.routePoints;
    return origin && destination ? [origin, ...stops.map((stop) => stop.position), destination] : [];
  }, [trip?.routePoints, origin, destination, stops]);

  React.useEffect(() => {
    if (routeCoordinates.length < 2) return;
    mapRef.current?.fitToCoordinates(routeCoordinates, {
      edgePadding: { top: 36, right: 36, bottom: 36, left: 36 },
      animated: true,
    });
  }, [routeCoordinates]);

  if (!trip) {
    return (
      <View style={[styles.screen, styles.pad, { backgroundColor: theme.background, paddingTop: insets.top + 10 }]}>
        <PageHeader title="Viaje programado" onBack={() => navigation.goBack()} />
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Este viaje ya no está programado. Puede que se haya cancelado o que ya empezó la búsqueda.
        </Text>
        <AppButton label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const image = trip.service ? serviceImage(trip.service.id) : undefined;
  const paymentMode = trip.paymentMode ?? 'Efectivo';

  const confirmCancel = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Cancelar viaje programado', '¿Quieres cancelar este viaje? No se buscará conductor.', [
      { text: 'No, mantener', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: () => {
          cancelTrip(trip.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[styles.pad, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 22 }]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title="Viaje programado" onBack={() => navigation.goBack()} />

        <View style={styles.dateRow}>
          <Text style={[styles.date, { color: theme.text }]}>{formatScheduledDate(trip.scheduledFor)}</Text>
          <View style={[styles.pill, { backgroundColor: theme.sig }]}>
            <AppIcon name="time" size="s" color={theme.onSig} />
            <Text style={[styles.pillText, { color: theme.onSig }]}>Programado</Text>
          </View>
        </View>

        {origin && destination ? (
          <View style={[styles.mapCard, { borderColor: theme.line }]}>
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFillObject}
              provider={PROVIDER_GOOGLE}
              customMapStyle={getMapStyle(isDark)}
              userInterfaceStyle={isDark ? 'dark' : 'light'}
              initialRegion={{
                latitude: (origin.latitude + destination.latitude) / 2,
                longitude: (origin.longitude + destination.longitude) / 2,
                latitudeDelta: Math.abs(origin.latitude - destination.latitude) * 1.8 + 0.01,
                longitudeDelta: Math.abs(origin.longitude - destination.longitude) * 1.8 + 0.01,
              }}
              onMapReady={() =>
                mapRef.current?.fitToCoordinates(routeCoordinates, {
                  edgePadding: { top: 36, right: 36, bottom: 36, left: 36 },
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
              accessibilityLabel={`Mapa de la ruta de ${trip.origin?.placeName ?? 'tu ubicación'} a ${
                trip.destination?.placeName ?? 'destino'
              }`}
            >
              <RoutePolyline coordinates={routeCoordinates} />
              <Marker coordinate={origin} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={[styles.marker, { backgroundColor: Colors.pinOrigin }]} />
              </Marker>
              {stops.map((stop, index) => (
                <Marker key={`stop-${index}`} coordinate={stop.position} anchor={{ x: 0.5, y: 0.5 }}>
                  <View style={[styles.stopMarker, { backgroundColor: theme.surface }]} />
                </Marker>
              ))}
              <Marker coordinate={destination} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={[styles.marker, { backgroundColor: Colors.pinDestination }]} />
              </Marker>
            </MapView>
          </View>
        ) : null}

        {trip.service ? (
          <View style={[styles.card, styles.serviceRow, { backgroundColor: theme.surface, borderColor: theme.line }]}>
            {image ? <Image source={image} style={styles.serviceImage} resizeMode="contain" /> : null}
            <View style={styles.flex}>
              <Text style={[styles.serviceName, { color: theme.text }]}>{trip.service.name}</Text>
              <Text style={[styles.meta, { color: theme.textMuted }]}>Precio fijo</Text>
            </View>
            <Text style={[styles.price, { color: theme.text }]}>
              {trip.service.currency} {trip.service.price.toFixed(2)}
            </Text>
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recorrido</Text>
          <ScheduledRouteRail
            origin={trip.origin}
            destination={trip.destination}
            stops={stops}
            onRemoveStop={(index) => removeStop(trip.id, index)}
            onAddStop={
              stops.length < MAX_EXTRA_STOPS
                ? () => navigation.navigate('SearchAddress', { target: 'extra-stop', scheduledTripId: trip.id })
                : undefined
            }
          />
          <Text style={[styles.meta, { color: theme.textMuted }]}>
            El punto de partida y el destino no se pueden cambiar. Si necesitas otros, cancela y programa uno nuevo.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Pago</Text>
          <PaymentRow
            mode={paymentMode}
            onPress={() => navigation.navigate('MetodosPago', { scheduledTripId: trip.id })}
          />
        </View>

        {trip.notes ? (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Nota para el conductor</Text>
            <Text style={[styles.body, { color: theme.text }]}>{trip.notes}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.cancel, { borderColor: theme.line }]}
          onPress={confirmCancel}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Cancelar viaje programado"
        >
          <Text style={[styles.cancelText, { color: theme.danger }]}>Cancelar viaje programado</Text>
        </TouchableOpacity>
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
  mapCard: {
    height: MAP_HEIGHT,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: Colors.pinRing,
    ...Shadow.sm,
  },
  stopMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: Colors.pinRing,
  },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serviceImage: {
    width: 74,
    height: 48,
  },
  serviceName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.bodyLg,
  },
  price: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  sectionTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  meta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
  },
  cancel: {
    height: 52,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.bodyLg,
  },
});
