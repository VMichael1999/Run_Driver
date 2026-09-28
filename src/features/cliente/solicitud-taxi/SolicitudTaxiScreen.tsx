import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ClienteStackParamList } from '@navigation/types';
import { useTaxiStore } from '@store/useTaxiStore';
import { useRideDraftStore } from '@store/useRideDraftStore';
import { useAppTheme } from '@theme/useAppTheme';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';
import { calculateDistance, formatDistance, formatEta } from '@shared/utils/mapUtils';
import { getPlaceNameFromCoordinates } from '@shared/utils/locationUtils';
import {
  ServiceSelectionSheet,
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
    image: require('../../../../assets/servicios/Subasta.png'),
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
    image: require('../../../../assets/servicios/XLCAB GO.png'),
  },
  {
    id: 'confort',
    name: 'Confort',
    subtitle: 'Autos nuevos con aire acondicionado',
    price: 35.0,
    currency: 'S/',
    etaMinutes: 5,
    seats: 4,
    image: require('../../../../assets/servicios/Confort.png'),
  },
  {
    id: 'premium',
    name: 'Premium',
    subtitle: 'Sedanes ejecutivos de alta gama',
    price: 54.0,
    currency: 'S/',
    etaMinutes: 8,
    seats: 4,
    image: require('../../../../assets/servicios/Premiun.png'),
  },
  {
    id: 'xl',
    name: 'XL',
    subtitle: 'Camionetas y vans familiares',
    price: 64.0,
    currency: 'S/',
    etaMinutes: 10,
    seats: 6,
    image: require('../../../../assets/servicios/XL.png'),
  },
  {
    id: 'pet',
    name: 'Pet',
    subtitle: 'Viaja seguro con tu mascota',
    price: 48.0,
    currency: 'S/',
    etaMinutes: 7,
    seats: 4,
    image: require('../../../../assets/servicios/Pet.png'),
  },
  {
    id: 'espera_ahorra',
    name: 'Espera y Ahorra',
    subtitle: 'Tarifa reducida esperando unos minutos más',
    price: 42.0,
    currency: 'S/',
    etaMinutes: 6,
    seats: 4,
    image: require('../../../../assets/servicios/Espera y Ahorra.png'),
  },
];

export function SolicitudTaxiScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
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

  // Encuadrar ruta en el mapa
  useEffect(() => {
    if (!request?.origin || !request?.destination || isAuctionPickupMode) return;
    mapRef.current?.fitToCoordinates(
      [request.origin.position, request.destination.position, ...(request.routePoints ?? [])],
      {
        edgePadding: { top: insets.top + 70, right: 50, bottom: 350, left: 50 },
        animated: true,
      },
    );
  }, [request, insets.top, isAuctionPickupMode]);

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
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={LIMA_REGION}
        showsUserLocation
        showsMyLocationButton={false}
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
          <Marker coordinate={request.origin.position} title="Punto de partida">
            <View style={[styles.markerPin, { backgroundColor: theme.origin }]}>
              <View style={styles.markerInnerDot} />
            </View>
          </Marker>
        ) : null}

        {request?.destination && !isAuctionPickupMode ? (
          <Marker coordinate={request.destination.position} title="Destino">
            <View style={[styles.markerSquare, { backgroundColor: theme.destination }]}>
              <View style={styles.markerInnerSquare} />
            </View>
          </Marker>
        ) : null}

        {request?.routePoints && request.routePoints.length > 1 && !isAuctionPickupMode ? (
          <Polyline
            coordinates={request.routePoints}
            strokeWidth={4.5}
            strokeColor={theme.route}
          />
        ) : null}
      </MapView>

      {/* Botón flotante para retroceder */}
      <TouchableOpacity
        style={[
          styles.floatingBackBtn,
          {
            top: insets.top + Spacing.sm,
            backgroundColor: theme.surface,
            borderColor: theme.line,
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
        <Ionicons name="arrow-back" size={20} color={theme.text} />
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
    left: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  markerPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  markerInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  markerSquare: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  markerInnerSquare: {
    width: 8,
    height: 8,
    borderRadius: 1,
    backgroundColor: '#fff',
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
    backgroundColor: 'rgba(0,0,0,0.25)',
    marginTop: 2,
  },
});
