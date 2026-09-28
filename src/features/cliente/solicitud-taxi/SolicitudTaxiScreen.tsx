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
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ClienteStackParamList } from '@navigation/types';
import { useTaxiStore } from '@store/useTaxiStore';
import { useThemeStore } from '@store/useThemeStore';
import { AppIcon } from '@shared/components/ui/AppIcon';
import { MapStyleLight, MapStyleNight } from '@theme/mapStyles';
import { useRideDraftStore } from '@store/useRideDraftStore';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { BorderRadius, Shadow } from '@theme/spacing';
import { calculateDistance } from '@shared/utils/mapUtils';
import { getPlaceNameFromCoordinates } from '@shared/utils/locationUtils';
import {
  ServiceSelectionSheet,
  useServiceSheetHeights,
  type VehicleServiceOption,
  AuctionFareSheet,
  AuctionOffersView,
  AuctionPickupSheet,
  PaymentSelectionModal,
  TripNotesModal,
  TripScheduleModal,
  useAuctionSimulation,
} from './components';

type Nav = NativeStackNavigationProp<ClienteStackParamList, 'SolicitudTaxi'>;

const ORIGIN_PIN = require('../../../../assets/legacy/images/location_origen.png');
const DESTINATION_PIN = require('../../../../assets/legacy/images/location_destino.png');

const LIMA_REGION: Region = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const VEHICLE_SERVICES: VehicleServiceOption[] = [
  {
    id: 'subasta',
    name: 'Subasta',
    subtitle: 'Tú propones el precio',
    price: 0,
    currency: 'S/',
    etaMinutes: 4,
    seats: 4,
    image: require('../../../../assets/servicios/recorte/subasta.png'),
    isAuction: true,
  },
  {
    id: 'xlcab_go',
    name: 'XLCAB GO',
    subtitle: 'Rápido y económico',
    price: 25.5,
    currency: 'S/',
    etaMinutes: 4,
    seats: 4,
    image: require('../../../../assets/servicios/recorte/xlcab-go.png'),
  },
  {
    id: 'confort',
    name: 'Confort',
    subtitle: 'Autos nuevos con aire acondicionado',
    price: 35.0,
    currency: 'S/',
    etaMinutes: 5,
    seats: 4,
    image: require('../../../../assets/servicios/recorte/confort.png'),
  },
  {
    id: 'premium',
    name: 'Premium',
    subtitle: 'Sedanes ejecutivos de alta gama',
    price: 54.0,
    currency: 'S/',
    etaMinutes: 8,
    seats: 4,
    image: require('../../../../assets/servicios/recorte/premium.png'),
  },
  {
    id: 'xl',
    name: 'XL',
    subtitle: 'Camionetas y vans familiares',
    price: 64.0,
    currency: 'S/',
    etaMinutes: 10,
    seats: 6,
    image: require('../../../../assets/servicios/recorte/xl.png'),
  },
  {
    id: 'pet',
    name: 'Pet',
    subtitle: 'Viaja seguro con tu mascota',
    price: 48.0,
    currency: 'S/',
    etaMinutes: 7,
    seats: 4,
    image: require('../../../../assets/servicios/recorte/pet.png'),
  },
  {
    id: 'espera_ahorra',
    name: 'Espera y Ahorra',
    subtitle: 'Tarifa reducida esperando unos minutos más',
    price: 42.0,
    currency: 'S/',
    etaMinutes: 6,
    seats: 4,
    image: require('../../../../assets/servicios/recorte/espera-ahorra.png'),
  },
];

export function SolicitudTaxiScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const isDark = useThemeStore((s) => s.isDark);
  const sheetHeights = useServiceSheetHeights();
  const mapRef = useRef<MapView | null>(null);

  // Stores
  const request = useTaxiStore((s) => s.request);
  const acceptOffer = useTaxiStore((s) => s.acceptOffer);
  const paymentMethod = useRideDraftStore((s) => s.paymentMethod);
  const setPaymentMethod = useRideDraftStore((s) => s.setPaymentMethod);
  const tripNotes = useRideDraftStore((s) => s.comment);
  const setTripNotes = useRideDraftStore((s) => s.setComment);

  // Subasta simulation
  const auction = useAuctionSimulation();

  // Estados locales de selección
  const [selectedServiceId, setSelectedServiceId] = useState('subasta');
  const [auctionFare, setAuctionFare] = useState(25);
  const [auctionFareVisible, setAuctionFareVisible] = useState(false);
  const [isAuctionPickupMode, setIsAuctionPickupMode] = useState(false);
  const [isAuctionRequestMode, setIsAuctionRequestMode] = useState(false);

  // Modales
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

  // Afinamiento de punto de recogida
  const [pickupPoint, setPickupPoint] = useState(request?.origin.position ?? LIMA_REGION);
  const [pickupAddress, setPickupAddress] = useState(request?.origin.placeName ?? 'Punto de partida');
  const [isResolvingPickup, setIsResolvingPickup] = useState(false);
  const [isConfirmingPickup, setIsConfirmingPickup] = useState(false);
  const pinLift = useRef(new Animated.Value(0)).current;

  // Distancia y tiempo calculados
  const distanceKm = request?.origin && request?.destination
    ? calculateDistance(request.origin.position, request.destination.position)
    : 6.1;
  const durationMin = Math.round(distanceKm * 2.8);

  // Animación del pin en pickup mode
  const animatePin = useCallback((toValue: number) => {
    Animated.timing(pinLift, {
      toValue,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [pinLift]);

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
        [request.origin.position, request.destination.position, ...(request.routePoints ?? [])],
        {
          // mapPadding ya reserva la altura mínima de la hoja; aquí solo se suma lo que crece al arrastrarla.
          edgePadding: { top: 24, right: 40, bottom: Math.max(0, sheetHeight - sheetHeights.collapsed) + 16, left: 40 },
          animated: settled,
        },
      );
    },
    [request, isAuctionPickupMode, sheetHeights.collapsed],
  );

  useEffect(() => {
    fitRoute(sheetHeights.collapsed);
  }, [fitRoute, sheetHeights.collapsed]);

  // Submit desde el sheet de selección de servicio
  const handleServiceSubmit = () => {
    const selected = VEHICLE_SERVICES.find((s) => s.id === selectedServiceId) ?? VEHICLE_SERVICES[0];
    if (selected.isAuction) {
      setAuctionFareVisible(true);
    } else {
      acceptOffer({
        driverName: 'Conductor asignado',
        phone: '+51 999 888 777',
        rating: 4.9,
        vehiclePlate: 'ABC-123',
        vehicleModel: selected.name,
        vehicleColor: 'Plata',
        imageUrl: 'https://i.pravatar.cc/100?img=11',
        price: selected.price,
        currency: selected.currency,
        etaMinutes: selected.etaMinutes,
        distanceKm: 1.2,
      });
      navigation.replace('TrayectoTaxi');
    }
  };

  // Confirmar tarifa en el modal de Subasta
  const handleConfirmAuctionFare = (fare: number) => {
    setAuctionFare(fare);
    setAuctionFareVisible(false);
    setIsAuctionPickupMode(true);
  };

  // Confirmar punto de partida y lanzar subasta
  const handleConfirmPickup = async () => {
    setIsConfirmingPickup(true);
    try {
      setIsAuctionPickupMode(false);
      setIsAuctionRequestMode(true);
      auction.startSimulation(auctionFare);
    } finally {
      setIsConfirmingPickup(false);
    }
  };

  // Cancelar subasta
  const handleCancelAuction = () => {
    Alert.alert(
      'Cancelar búsqueda',
      '¿Deseas cancelar la subasta actual?',
      [
        { text: 'Continuar buscando', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => {
            auction.stopSimulation();
            setIsAuctionRequestMode(false);
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
    acceptOffer(offer.driver);
    setIsAuctionRequestMode(false);
    navigation.replace('TrayectoTaxi');
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Mapa central con la ruta */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        customMapStyle={isDark ? MapStyleNight : MapStyleLight}
        // En modo recogida el pin fijo está en el centro de la pantalla, así que no se desplaza el centro del mapa.
        mapPadding={isAuctionPickupMode ? { top: 0, right: 0, bottom: 0, left: 0 } : { top: insets.top + 8, right: 0, bottom: sheetHeights.collapsed, left: 0 }}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
        initialRegion={LIMA_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsPointsOfInterest={false}
        showsBuildings={false}
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

        {request?.destination && !isAuctionPickupMode ? (
          <Marker coordinate={request.destination.position} anchor={{ x: 0.5, y: 1 }} title="Destino">
            <Image source={DESTINATION_PIN} style={styles.mapPin} resizeMode="contain" />
          </Marker>
        ) : null}

        {request?.routePoints && request.routePoints.length > 1 && !isAuctionPickupMode ? (
          <>
            {/* strokeColors además de strokeColor: en iOS con Google Maps solo strokeColors pinta la línea. */}
            <Polyline
              coordinates={request.routePoints}
              strokeWidth={10}
              strokeColor={theme.routeCase}
              strokeColors={[theme.routeCase]}
              lineJoin="round"
            />
            <Polyline
              coordinates={request.routePoints}
              strokeWidth={5}
              strokeColor={theme.route}
              strokeColors={[theme.route]}
              lineJoin="round"
            />
          </>
        ) : null}
      </MapView>

      {/* Botón flotante para retroceder */}
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
          if (isAuctionRequestMode) {
            handleCancelAuction();
          } else if (isAuctionPickupMode) {
            setIsAuctionPickupMode(false);
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

      {/* Pin interactivo en modo pickup */}
      {isAuctionPickupMode ? (
        <View pointerEvents="none" style={styles.centerPinWrap}>
          <Animated.View style={{ transform: [{ translateY: pinLift }] }}>
            <View style={[styles.pickupPinHead, { backgroundColor: theme.primary }]}>
              <View style={[styles.pickupPinDot, { backgroundColor: theme.sig }]} />
            </View>
            <View style={[styles.pickupPinStem, { backgroundColor: theme.primary }]} />
          </Animated.View>
          <View style={styles.pickupPinShadow} />
        </View>
      ) : null}

      {/* Capa de interfaz según modo activo */}
      {isAuctionRequestMode ? (
        <AuctionOffersView
          status={auction.status === 'completed' ? 'completed' : 'searching'}
          offers={auction.offers}
          currentFare={auctionFare}
          onAcceptOffer={handleAcceptOffer}
          onRejectOffer={auction.rejectOffer}
          onCancelAuction={handleCancelAuction}
          onRaiseFare={() => setAuctionFare((prev) => prev + 1)}
        />
      ) : isAuctionPickupMode ? (
        <AuctionPickupSheet
          address={pickupAddress}
          isResolving={isResolvingPickup}
          isConfirming={isConfirmingPickup}
          onConfirmPickup={() => void handleConfirmPickup()}
          onCancel={() => setIsAuctionPickupMode(false)}
        />
      ) : (
        <ServiceSelectionSheet
          services={VEHICLE_SERVICES}
          selectedId={selectedServiceId}
          onSelectService={setSelectedServiceId}
          paymentMethod={paymentMethod}
          onOpenPayment={() => setPaymentModalVisible(true)}
          tripNotes={tripNotes}
          onOpenNotes={() => setNotesModalVisible(true)}
          distanceKm={distanceKm}
          durationMin={durationMin}
          onSubmit={handleServiceSubmit}
          onSchedulePress={() => setScheduleModalVisible(true)}
          onHeightChange={fitRoute}
        />
      )}

      {/* Modales desacoplados */}
      <AuctionFareSheet
        visible={auctionFareVisible}
        fare={auctionFare}
        baseFare={Math.round(distanceKm * 2.8 + 8)}
        onChangeFare={setAuctionFare}
        onConfirm={handleConfirmAuctionFare}
        onClose={() => setAuctionFareVisible(false)}
      />

      <PaymentSelectionModal
        visible={paymentModalVisible}
        selectedMode={paymentMethod.mode}
        onSelectMode={(mode) => setPaymentMethod({ ...paymentMethod, mode })}
        onClose={() => setPaymentModalVisible(false)}
      />

      <TripNotesModal
        visible={notesModalVisible}
        initialNotes={tripNotes}
        onSave={setTripNotes}
        onClose={() => setNotesModalVisible(false)}
      />

      <TripScheduleModal
        visible={scheduleModalVisible}
        onConfirm={() => {
          Alert.alert('Viaje programado', 'Tu viaje ha sido programado con éxito.');
        }}
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
    zIndex: 15,
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
