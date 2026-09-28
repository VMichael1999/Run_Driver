import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { RoutePolyline } from '@shared/components/map/RoutePolyline';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ClienteStackParamList } from '@navigation/types';
import { useTaxiStore } from '@store/useTaxiStore';
import { useThemeStore } from '@store/useThemeStore';
import { AppIcon } from '@shared/components/ui/AppIcon';
import { getMapStyle } from '@theme/mapStyles';
import { useRideDraftStore } from '@store/useRideDraftStore';
import { useScheduledTripsStore } from '@store/useScheduledTripsStore';
import { applyDiscount } from '@features/cliente/promociones/utils/descuentos';
import { useDescuentoVigente } from '@features/cliente/promociones/hooks/useDescuentoVigente';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { BorderRadius, Shadow } from '@theme/spacing';
import { getPlaceNameFromCoordinates } from '@shared/utils/locationUtils';
import {
  ServiceSelectionSheet,
  useServiceSheetHeights,
  AuctionFareSheet,
  getAuctionRange,
  AuctionOffersView,
  AuctionPickupSheet,
  TripNotesModal,
  TripScheduleModal,
  RouteStopsCard,
  RideSearchView,
  useAuctionSimulation,
  SEARCH_WINDOW_SECONDS,
} from './components';
import { MAX_EXTRA_STOPS, buildTaxiRequest, routeKey, tripDistanceKm } from './utils/routeRequest';
import { VEHICLE_SERVICES } from './data/services';

type Nav = NativeStackNavigationProp<ClienteStackParamList, 'SolicitudTaxi'>;

/** Servicio con el que va directo la tarjeta "Viaje" del inicio. */
const DEFAULT_RIDE_SERVICE_ID = 'confort';
/** Servicio con el que va directo la tarjeta "Programar" del inicio. */
const DEFAULT_SCHEDULE_SERVICE_ID = 'espera_ahorra';
/** Simulación: tiempo hasta que un conductor toma un viaje de precio fijo. */
const RIDE_MATCH_DELAY_MS = 4500;
/** Un viaje se programa con al menos esta anticipación. */
const MIN_SCHEDULE_AHEAD_MS = 15 * 60 * 1000;

const ORIGIN_PIN = require('../../../../assets/legacy/images/location_origen.png');
const DESTINATION_PIN = require('../../../../assets/legacy/images/location_destino.png');

const LIMA_REGION: Region = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export function SolicitudTaxiScreen() {
  const navigation = useNavigation<Nav>();
  const autoSearchServiceId = useRoute<RouteProp<ClienteStackParamList, 'SolicitudTaxi'>>().params?.autoSearchServiceId;
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const isDark = useThemeStore((s) => s.isDark);
  // Se fija al aceptar el viaje; el conductor cobra su precio y la diferencia la pone la empresa.
  const discount = useDescuentoVigente();
  const mapRef = useRef<MapView | null>(null);

  // Stores
  const request = useTaxiStore((s) => s.request);
  const acceptOffer = useTaxiStore((s) => s.acceptOffer);
  const paymentMethod = useRideDraftStore((s) => s.paymentMethod);
  const tripNotes = useRideDraftStore((s) => s.comment);
  const setTripNotes = useRideDraftStore((s) => s.setComment);
  const entryMode = useRideDraftStore((s) => s.entryMode);
  const draftOrigin = useRideDraftStore((s) => s.origin);
  const draftDestination = useRideDraftStore((s) => s.destination);
  const extraStops = useRideDraftStore((s) => s.extraStops);
  const removeExtraStop = useRideDraftStore((s) => s.removeExtraStop);
  const setRequest = useTaxiStore((s) => s.setRequest);
  const scheduleTrip = useScheduledTripsStore((s) => s.scheduleTrip);

  // Subasta simulation
  const auction = useAuctionSimulation();

  // Estados locales de selección
  // "Viaje" muestra solo Confort y "Programar" solo Espera y Ahorra, hasta que se pide ver los demás.
  const [showAllServices, setShowAllServices] = useState(false);
  const isScheduleMode = entryMode === 'schedule';
  const isRideMode = entryMode === 'ride' && !showAllServices;
  const isSingleService = (entryMode === 'ride' || isScheduleMode) && !showAllServices;
  const isAuctionEntry = entryMode === 'auction';
  const [selectedServiceId, setSelectedServiceId] = useState(
    autoSearchServiceId ??
      (entryMode === 'ride' ? DEFAULT_RIDE_SERVICE_ID : isScheduleMode ? DEFAULT_SCHEDULE_SERVICE_ID : 'subasta'),
  );
  // Búsqueda de conductor de un viaje de precio fijo (id del servicio pedido).
  const [rideSearchServiceId, setRideSearchServiceId] = useState<string | null>(autoSearchServiceId ?? null);
  const [routeCardHeight, setRouteCardHeight] = useState(0);
  // Con un solo servicio la hoja es más baja; se usa el alto de una fila (62) para el mapa.
  const sheetHeights = useServiceSheetHeights(
    isSingleService ? 62 : undefined,
    Boolean(discount),
  );
  const [auctionFare, setAuctionFare] = useState(25);
  const [auctionFareVisible, setAuctionFareVisible] = useState(false);
  const [isAuctionPickupMode, setIsAuctionPickupMode] = useState(false);
  const [isAuctionRequestMode, setIsAuctionRequestMode] = useState(false);
  const [searchStartedAt, setSearchStartedAt] = useState(0);
  const [autoAccept, setAutoAccept] = useState(false);

  // Modales
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

  // Afinamiento de punto de recogida
  const [pickupPoint, setPickupPoint] = useState(request?.origin.position ?? LIMA_REGION);
  const [pickupAddress, setPickupAddress] = useState(request?.origin.placeName ?? 'Punto de partida');
  const [isResolvingPickup, setIsResolvingPickup] = useState(false);
  const [isConfirmingPickup, setIsConfirmingPickup] = useState(false);
  const pinLift = useRef(new Animated.Value(0)).current;

  const stops = request?.stops ?? [];
  const sheetServices = isSingleService
    ? VEHICLE_SERVICES.filter((s) => s.id === (isScheduleMode ? DEFAULT_SCHEDULE_SERVICE_ID : DEFAULT_RIDE_SERVICE_ID))
    : isScheduleMode
    ? VEHICLE_SERVICES.filter((s) => !s.isAuction)
    : VEHICLE_SERVICES;

  // Distancia y tiempo calculados
  const distanceKm = request?.origin && request?.destination
    ? tripDistanceKm(request.origin, request.destination, stops)
    : 6.1;
  const durationMin = Math.round(distanceKm * 2.8);
  const auctionBaseFare = Math.round(distanceKm * 2.8 + 8);
  const shortName = (placeName?: string) => placeName?.split(',')[0]?.trim() ?? '';
  const auctionRouteLabel = request?.origin && request?.destination
    ? `${shortName(request.origin.placeName)} → ${shortName(request.destination.placeName)}`
    : undefined;
  const openPaymentMethods = () => navigation.navigate('MetodosPago', { forRide: true });

  // Al cambiar origen, destino o paradas desde la tarjeta superior, se recalcula la ruta.
  const draftRouteKey = routeKey(draftOrigin, draftDestination, extraStops);
  const requestRouteKey = routeKey(request?.origin, request?.destination, request?.stops);
  useEffect(() => {
    if (!draftOrigin || !draftDestination || draftRouteKey === requestRouteKey) return;
    let cancelled = false;
    void buildTaxiRequest({
      origin: draftOrigin,
      destination: draftDestination,
      stops: extraStops,
      paymentMethod,
      comment: tripNotes,
    }).then((next) => {
      if (!cancelled) setRequest(next);
    });
    return () => {
      cancelled = true;
    };
    // Solo interesa el recorrido; el resto de la solicitud se toma tal como está al recalcular.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftRouteKey, requestRouteKey]);

  const editOrigin = () => navigation.navigate('SearchAddress', { target: 'origin', editing: true });
  const editDestination = () => navigation.navigate('SearchAddress', { target: 'destination', editing: true });
  const addStop =
    extraStops.length < MAX_EXTRA_STOPS
      ? () => navigation.navigate('SearchAddress', { target: 'extra-stop', editing: true })
      : undefined;
  const renderRouteCard = (variant: 'floating' | 'inline') => (
    <RouteStopsCard
      origin={draftOrigin ?? request?.origin}
      destination={draftDestination ?? request?.destination}
      stops={extraStops}
      durationMin={durationMin}
      onEditOrigin={editOrigin}
      onEditDestination={editDestination}
      onAddStop={addStop}
      onRemoveStop={removeExtraStop}
      variant={variant}
    />
  );

  // Animación del pin en pickup mode
  const animatePin = useCallback((toValue: number) => {
    Animated.timing(pinLift, {
      toValue,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [pinLift]);

  // Al salir de la solicitud, lo que se configuró para este viaje (nota) se descarta:
  // la próxima búsqueda empieza de cero.
  useEffect(() => () => setTripNotes(''), [setTripNotes]);

  // Encuadra la ruta en el espacio del mapa que deja libre la hoja inferior.
  const lastDragFitRef = useRef(0);
  const fitRoute = useCallback(
    (sheetHeight: number, settled = true) => {
      if (!request?.origin || !request?.destination || isAuctionPickupMode) return;
      // Durante el arrastre se reencuadra sin animación y como máximo cada 120 ms, para que las
      // animaciones no se encadenen; al soltar, un único encuadre animado.
      if (!settled) {
        const now = Date.now();
        if (now - lastDragFitRef.current < 120) return;
        lastDragFitRef.current = now;
      }
      mapRef.current?.fitToCoordinates(
        [
          request.origin.position,
          request.destination.position,
          ...(request.stops ?? []).map((stop) => stop.position),
          ...(request.routePoints ?? []),
        ],
        {
          // mapPadding ya reserva la altura mínima de la hoja; aquí solo se suma lo que crece al arrastrarla.
          // Arriba se deja libre la tarjeta de origen, paradas y destino.
          edgePadding: {
            top: 24 + routeCardHeight,
            right: 40,
            bottom: Math.max(0, sheetHeight - sheetHeights.collapsed) + 16,
            left: 40,
          },
          animated: settled,
        },
      );
    },
    [request, isAuctionPickupMode, sheetHeights.collapsed, routeCardHeight],
  );

  useEffect(() => {
    fitRoute(sheetHeights.collapsed);
  }, [fitRoute, sheetHeights.collapsed]);

  // Submit desde el sheet de selección de servicio
  const handleServiceSubmit = () => {
    const selected = VEHICLE_SERVICES.find((s) => s.id === selectedServiceId) ?? VEHICLE_SERVICES[0];
    if (selected.isAuction) {
      // Empieza en el mínimo sugerido, donde los conductores suelen responder.
      setAuctionFare(getAuctionRange(auctionBaseFare).suggestedMin);
      setAuctionFareVisible(true);
    } else if (isScheduleMode) {
      setScheduleModalVisible(true);
    } else {
      setRideSearchServiceId(selected.id);
    }
  };

  // Simulación: pasado un momento, un conductor toma el viaje de precio fijo.
  useEffect(() => {
    if (!rideSearchServiceId) return;
    const service = VEHICLE_SERVICES.find((s) => s.id === rideSearchServiceId) ?? VEHICLE_SERVICES[1];
    const timer = setTimeout(() => {
      acceptOffer({
        driverName: 'Conductor asignado',
        phone: '+51 999 888 777',
        rating: 4.9,
        vehiclePlate: 'ABC-123',
        vehicleModel: service.name,
        vehicleColor: 'Plata',
        imageUrl: 'https://i.pravatar.cc/100?img=11',
        price: service.price,
        currency: service.currency,
        etaMinutes: service.etaMinutes,
        distanceKm: 1.2,
      }, discount);
      navigation.replace('TrayectoTaxi');
    }, RIDE_MATCH_DELAY_MS);
    return () => clearTimeout(timer);
    // El descuento queda fijado al empezar la búsqueda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rideSearchServiceId]);

  const handleCancelRideSearch = () => {
    Alert.alert('Cancelar solicitud', '¿Quieres dejar de buscar conductor?', [
      { text: 'Seguir buscando', style: 'cancel' },
      { text: 'Cancelar solicitud', style: 'destructive', onPress: () => setRideSearchServiceId(null) },
    ]);
  };

  // Tarjeta "Subasta" del inicio: se abre directo la pantalla para proponer el precio.
  const openedAuctionEntryRef = useRef(false);
  useEffect(() => {
    if (!isAuctionEntry || openedAuctionEntryRef.current || !request) return;
    openedAuctionEntryRef.current = true;
    setSelectedServiceId('subasta');
    setAuctionFare(getAuctionRange(auctionBaseFare).suggestedMin);
    setAuctionFareVisible(true);
  }, [isAuctionEntry, request, auctionBaseFare]);

  // Si se entró por "Subasta", cerrar su pantalla es salir de la solicitud.
  const closeAuctionFare = useCallback(() => {
    if (isAuctionEntry) navigation.goBack();
    else setAuctionFareVisible(false);
  }, [isAuctionEntry, navigation]);

  // Al salir de la recogida o cancelar la búsqueda, "Subasta" vuelve a su pantalla de precio.
  const leavePickupMode = () => {
    setIsAuctionPickupMode(false);
    if (isAuctionEntry) setAuctionFareVisible(true);
  };

  const handleScheduleConfirm = (date: Date) => {
    if (date.getTime() - Date.now() < MIN_SCHEDULE_AHEAD_MS) {
      Alert.alert('Hora no válida', 'Programa el viaje con al menos 15 minutos de anticipación.');
      return;
    }
    const service = VEHICLE_SERVICES.find((s) => s.id === selectedServiceId && !s.isAuction)
      ?? VEHICLE_SERVICES.find((s) => s.id === DEFAULT_SCHEDULE_SERVICE_ID)!;
    scheduleTrip({
      origin: request?.origin ?? null,
      destination: request?.destination ?? null,
      stops: request?.stops,
      routePoints: request?.routePoints,
      service: { id: service.id, name: service.name, price: service.price, currency: service.currency },
      paymentMode: paymentMethod.mode,
      scheduledFor: date.getTime(),
      notes: tripNotes || undefined,
    });
    const when = date.toLocaleString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    Alert.alert('Viaje programado', `Buscaremos tu ${service.name} el ${when}`, [
      {
        text: 'Ver viajes programados',
        onPress: () => navigation.reset({ index: 1, routes: [{ name: 'ClienteHome' }, { name: 'ProgramarViaje' }] }),
      },
    ]);
  };

  // Confirmar tarifa en la pantalla de Subasta
  const handleConfirmAuctionFare = (fare: number) => {
    setAuctionFare(fare);
    setAuctionFareVisible(false);
    setIsAuctionPickupMode(true);
  };

  // Lanza (o relanza) la búsqueda: descarta las ofertas anteriores y reinicia la ventana de 30 s.
  const startAuctionSearch = (fare: number) => {
    setAuctionFare(fare);
    setSearchStartedAt(Date.now());
    auction.startSimulation(fare);
  };

  // Confirmar punto de partida y lanzar subasta
  const handleConfirmPickup = async () => {
    setIsConfirmingPickup(true);
    try {
      setIsAuctionPickupMode(false);
      setIsAuctionRequestMode(true);
      startAuctionSearch(auctionFare);
    } finally {
      setIsConfirmingPickup(false);
    }
  };

  // Cancelar subasta
  const handleCancelAuction = () => {
    Alert.alert(
      'Cancelar solicitud',
      '¿Quieres cancelar la solicitud? Se descartan las ofertas y el precio que cambiaste.',
      [
        { text: 'Seguir buscando', style: 'cancel' },
        {
          text: 'Cancelar solicitud',
          style: 'destructive',
          onPress: () => {
            auction.reset();
            setIsAuctionRequestMode(false);
            setAutoAccept(false);
            // Lo editado durante la búsqueda no se conserva: la próxima vez parte del precio base.
            setAuctionFare(getAuctionRange(auctionBaseFare).suggestedMin);
            if (isAuctionEntry) setAuctionFareVisible(true);
          },
        },
      ],
    );
  };

  // Aceptar oferta recibida
  const handleAcceptOffer = (offerId: string) => {
    const offer = auction.offers.find((o) => o.id === offerId);
    if (!offer) return;
    auction.acceptOffer(offerId);
    acceptOffer(offer.driver, discount);
    setIsAuctionRequestMode(false);
    navigation.replace('TrayectoTaxi');
  };

  // Aceptación automática: la primera oferta que iguala exactamente el precio pedido se acepta sola.
  useEffect(() => {
    if (!autoAccept || !isAuctionRequestMode) return;
    const match = auction.offers.find((o) => Math.abs(o.driver.price - auctionFare) < 0.01);
    if (match) handleAcceptOffer(match.id);
    // handleAcceptOffer se recrea en cada render; lo que dispara la revisión son las ofertas y el switch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAccept, auction.offers, auctionFare, isAuctionRequestMode]);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Mapa central con la ruta */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        customMapStyle={getMapStyle(isDark)}
        // En modo recogida el pin fijo está en el centro de la pantalla, así que no se desplaza el centro del mapa.
        mapPadding={isAuctionPickupMode ? { top: 0, right: 0, bottom: 0, left: 0 } : { top: insets.top + 8, right: 0, bottom: sheetHeights.collapsed, left: 0 }}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
        initialRegion={LIMA_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        onRegionChange={() => {
          if (isAuctionPickupMode) animatePin(-16);
        }}
        onRegionChangeComplete={(region) => {
          if (isAuctionPickupMode) {
            setPickupPoint(region);
            animatePin(0);
            setIsResolvingPickup(true);
            void getPlaceNameFromCoordinates(region.latitude, region.longitude)
              .then(setPickupAddress)
              .catch(() => setPickupAddress('Ubicación seleccionada'))
              .finally(() => setIsResolvingPickup(false));
          }
        }}
      >
        {request?.origin && !isAuctionPickupMode ? (
          <Marker coordinate={request.origin.position} anchor={{ x: 0.5, y: 1 }} title="Punto de partida">
            <Image source={ORIGIN_PIN} style={styles.mapPin} resizeMode="contain" />
          </Marker>
        ) : null}

        {!isAuctionPickupMode
          ? stops.map((stop, index) => (
              <Marker
                key={`stop-${index}`}
                coordinate={stop.position}
                anchor={{ x: 0.5, y: 0.5 }}
                title={`Parada ${index + 1}`}
              >
                <View style={[styles.stopMarker, { backgroundColor: theme.surface, borderColor: Colors.pinRing }]}>
                  <View style={[styles.stopMarkerDot, { backgroundColor: theme.text }]} />
                </View>
              </Marker>
            ))
          : null}

        {request?.destination && !isAuctionPickupMode ? (
          <Marker coordinate={request.destination.position} anchor={{ x: 0.5, y: 1 }} title="Destino">
            <Image source={DESTINATION_PIN} style={styles.mapPin} resizeMode="contain" />
          </Marker>
        ) : null}

        {request?.routePoints && request.routePoints.length > 1 && !isAuctionPickupMode ? (
          <RoutePolyline coordinates={request.routePoints} />
        ) : null}
      </MapView>

      {/* Botón flotante para retroceder; la pantalla de Subasta tiene el suyo */}
      {!auctionFareVisible ? (
        <TouchableOpacity
          style={[
            styles.floatingBackBtn,
            {
              top: insets.top + 6,
              backgroundColor: theme.surface,
            },
            Shadow.raise,
          ]}
          onPress={() => {
            if (rideSearchServiceId) {
              handleCancelRideSearch();
            } else if (isAuctionRequestMode) {
              handleCancelAuction();
            } else if (isAuctionPickupMode) {
              leavePickupMode();
            } else {
              navigation.goBack();
            }
          }}
          activeOpacity={0.8}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <AppIcon name="back" color={theme.text} />
        </TouchableOpacity>
      ) : null}

      {/* Origen, paradas y destino; tocar un punto lo cambia */}
      {!isAuctionPickupMode && !isAuctionRequestMode && !rideSearchServiceId ? (
        <View
          style={[styles.routeCardWrap, { top: insets.top + 6 }]}
          onLayout={(e) => setRouteCardHeight(e.nativeEvent.layout.height)}
        >
          {renderRouteCard('floating')}
        </View>
      ) : null}

      {/* Pin interactivo en modo pickup */}
      {isAuctionPickupMode ? (
        <View pointerEvents="none" style={styles.centerPinWrap}>
          <Animated.View style={{ transform: [{ translateY: pinLift }] }}>
            <View style={[styles.pickupPinHead, { backgroundColor: theme.primary }]}>
              <View style={[styles.pickupPinDot, { backgroundColor: isDark ? theme.onPrimary : theme.sig }]} />
            </View>
            <View style={[styles.pickupPinStem, { backgroundColor: theme.primary }]} />
          </Animated.View>
          <View style={styles.pickupPinShadow} />
        </View>
      ) : null}

      {/* Capa de interfaz según modo activo */}
      {rideSearchServiceId ? (
        (() => {
          const service = VEHICLE_SERVICES.find((s) => s.id === rideSearchServiceId) ?? VEHICLE_SERVICES[1];
          return (
            <RideSearchView
              serviceName={service.name}
              serviceImage={service.image}
              price={applyDiscount(service.price, discount)}
              currency={service.currency}
              origin={request?.origin}
              destination={request?.destination}
              stops={stops}
              paymentMode={paymentMethod.mode}
              onCancel={handleCancelRideSearch}
            />
          );
        })()
      ) : isAuctionRequestMode ? (
        <AuctionOffersView
          offers={auction.offers}
          requestedFare={auctionFare}
          searchStartedAt={searchStartedAt}
          searchWindowSeconds={SEARCH_WINDOW_SECONDS}
          minFare={getAuctionRange(auctionBaseFare).trackMin}
          maxFare={getAuctionRange(auctionBaseFare).trackMax}
          onAcceptOffer={handleAcceptOffer}
          onRejectOffer={auction.rejectOffer}
          onExpireOffer={auction.expireOffer}
          onRestartSearch={startAuctionSearch}
          serviceName="Subasta"
          serviceImage={VEHICLE_SERVICES[0].image}
          originName={request?.origin.placeName ?? 'Tu ubicación'}
          destinationName={request?.destination.placeName ?? ''}
          paymentMode={paymentMethod.mode}
          discount={discount}
          autoAccept={autoAccept}
          onToggleAutoAccept={setAutoAccept}
          onCancelRequest={handleCancelAuction}
        />
      ) : isAuctionPickupMode ? (
        <AuctionPickupSheet
          address={pickupAddress}
          isResolving={isResolvingPickup}
          isConfirming={isConfirmingPickup}
          onConfirmPickup={() => void handleConfirmPickup()}
          onCancel={leavePickupMode}
        />
      ) : (
        <ServiceSelectionSheet
          key={isSingleService ? 'single' : 'all'}
          services={sheetServices}
          title={isRideMode ? 'Tu viaje' : isScheduleMode ? 'Programa tu viaje' : undefined}
          submitLabel={
            isScheduleMode
              ? `Elegir fecha y hora · ${sheetServices.find((s) => s.id === selectedServiceId)?.name ?? 'Espera y Ahorra'}`
              : undefined
          }
          onShowAllServices={isSingleService ? () => setShowAllServices(true) : undefined}
          selectedId={selectedServiceId}
          onSelectService={setSelectedServiceId}
          paymentMethod={paymentMethod}
          onOpenPayment={openPaymentMethods}
          tripNotes={tripNotes}
          onOpenNotes={() => setNotesModalVisible(true)}
          distanceKm={distanceKm}
          durationMin={durationMin}
          onSubmit={handleServiceSubmit}
          onSchedulePress={
            isScheduleMode || VEHICLE_SERVICES.find((s) => s.id === selectedServiceId)?.isAuction
              ? undefined
              : () => setScheduleModalVisible(true)
          }
          discount={discount}
          onHeightChange={fitRoute}
        />
      )}

      {/* Modales desacoplados */}
      <AuctionFareSheet
        visible={auctionFareVisible}
        fare={auctionFare}
        baseFare={auctionBaseFare}
        routeLabel={auctionRouteLabel}
        routeDistance={`${distanceKm.toFixed(1)} km`}
        routeCard={renderRouteCard('inline')}
        paymentMode={paymentMethod.mode}
        discount={discount}
        onOpenPayment={openPaymentMethods}
        onChangeFare={setAuctionFare}
        onConfirm={handleConfirmAuctionFare}
        onClose={closeAuctionFare}
      />

      <TripNotesModal
        visible={notesModalVisible}
        initialNotes={tripNotes}
        onSave={setTripNotes}
        onClose={() => setNotesModalVisible(false)}
      />

      <TripScheduleModal
        visible={scheduleModalVisible}
        initialDate={new Date(Date.now() + 30 * 60 * 1000)}
        minimumDate={new Date(Date.now() + MIN_SCHEDULE_AHEAD_MS)}
        onConfirm={handleScheduleConfirm}
        onClose={() => setScheduleModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  floatingBackBtn: {
    position: 'absolute',
    left: 12,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    // Por encima de la capa de ofertas y su degradado.
    zIndex: 40,
  },
  routeCardWrap: {
    position: 'absolute',
    // A la derecha del botón de volver (12 + 44 + 8).
    left: 64,
    right: 12,
    zIndex: 30,
  },
  stopMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopMarkerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  mapPin: {
    width: 28,
    height: 35,
  },
  centerPinWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -16,
    marginTop: -50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pickupPinHead: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  pickupPinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pickupPinStem: {
    width: 3,
    height: 12,
    marginTop: -1,
    borderRadius: 1.5,
    alignSelf: 'center',
  },
  pickupPinShadow: {
    width: 12,
    height: 4,
    borderRadius: 6,
    backgroundColor: Colors.scrimSoft,
    marginTop: 2,
  },
});
