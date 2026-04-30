import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  PanResponder,
  Modal,
  Pressable,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, type LatLng, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ClienteStackParamList } from '@navigation/types';
import type { Coordinates, DriverAlert, LocationMarker } from '@shared/types';
import { getRoutePolyline } from '@shared/services/googleMapsService';
import { getPlaceNameFromCoordinates } from '@shared/utils/locationUtils';
import { useRideDraftStore } from '@store/useRideDraftStore';
import { useTaxiStore } from '@store/useTaxiStore';
import { LegacyImages } from '@shared/assets/legacyAssets';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Nav = NativeStackNavigationProp<ClienteStackParamList, 'SolicitudTaxi'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLLAPSED_HEIGHT = 400;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.78;

type ServiceVehicle = DriverAlert & {
  serviceImage: any;
  seatsLabel: string;
};

const paymentOptions = [
  {
    id: 'efectivo',
    label: 'Efectivo',
    image: require('../../../../assets/payment/Efectivo.png'),
  },
  {
    id: 'yape',
    label: 'Yape',
    image: require('../../../../assets/payment/Yape.png'),
  },
  {
    id: 'plin',
    label: 'Plin',
    image: require('../../../../assets/payment/Plin.png'),
  },
] as const;

const vehicles: ServiceVehicle[] = [
  {
    driverName: 'Conductora',
    phone: '+51 949568228',
    rating: 4.9,
    vehiclePlate: 'XLCAB GO',
    vehicleModel: 'XLCAB GO',
    vehicleColor: 'Azul',
    imageUrl: 'https://i.pravatar.cc/100?img=45',
    price: 25.5,
    currency: 'S/',
    etaMinutes: 4,
    distanceKm: 1.0,
    serviceImage: require('../../../../assets/servicios/XLCAB GO.png'),
    seatsLabel: '4 asientos',
  },
  {
    driverName: 'Conductora',
    phone: '+51 949568228',
    rating: 4.7,
    vehiclePlate: 'CONFORT',
    vehicleModel: 'CONFORT',
    vehicleColor: 'Plata',
    imageUrl: 'https://i.pravatar.cc/100?img=18',
    price: 35.0,
    currency: 'S/',
    etaMinutes: 5,
    distanceKm: 1.2,
    serviceImage: require('../../../../assets/servicios/Confort.png'),
    seatsLabel: '4 asientos',
  },
  {
    driverName: 'Conductora',
    phone: '+51 949568228',
    rating: 5.0,
    vehiclePlate: 'ESPERA Y AHORRA',
    vehicleModel: 'ESPERA Y AHORRA',
    vehicleColor: 'Negro',
    imageUrl: 'https://i.pravatar.cc/100?img=11',
    price: 42.0,
    currency: 'S/',
    etaMinutes: 6,
    distanceKm: 1.6,
    serviceImage: require('../../../../assets/servicios/Espera y Ahorra.png'),
    seatsLabel: '4 asientos',
  },
  {
    driverName: 'Conductora',
    phone: '+51 949568228',
    rating: 4.8,
    vehiclePlate: 'PET',
    vehicleModel: 'PET',
    vehicleColor: 'Blanco',
    imageUrl: 'https://i.pravatar.cc/100?img=8',
    price: 48.0,
    currency: 'S/',
    etaMinutes: 7,
    distanceKm: 2.0,
    serviceImage: require('../../../../assets/servicios/Pet.png'),
    seatsLabel: '4 asientos',
  },
  {
    driverName: 'Conductora',
    phone: '+51 949568228',
    rating: 4.8,
    vehiclePlate: 'PREMIUN',
    vehicleModel: 'PREMIUN',
    vehicleColor: 'Blanco',
    imageUrl: 'https://i.pravatar.cc/100?img=8',
    price: 54.0,
    currency: 'S/',
    etaMinutes: 8,
    distanceKm: 2.3,
    serviceImage: require('../../../../assets/servicios/Premiun.png'),
    seatsLabel: '4 asientos',
  },
  {
    driverName: 'Conductora',
    phone: '+51 949568228',
    rating: 4.8,
    vehiclePlate: 'SUBASTA',
    vehicleModel: 'SUBASTA',
    vehicleColor: 'Blanco',
    imageUrl: 'https://i.pravatar.cc/100?img=8',
    price: 58.0,
    currency: 'S/',
    etaMinutes: 9,
    distanceKm: 2.5,
    serviceImage: require('../../../../assets/servicios/Subasta.png'),
    seatsLabel: '4 asientos',
  },
  {
    driverName: 'Conductora',
    phone: '+51 949568228',
    rating: 4.8,
    vehiclePlate: 'XL',
    vehicleModel: 'XL',
    vehicleColor: 'Blanco',
    imageUrl: 'https://i.pravatar.cc/100?img=8',
    price: 64.0,
    currency: 'S/',
    etaMinutes: 10,
    distanceKm: 2.8,
    serviceImage: require('../../../../assets/servicios/XL.png'),
    seatsLabel: '6 asientos',
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatFare(value: number) {
  return value.toFixed(2);
}

export function SolicitudTaxiScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { request, setRequest, acceptOffer, clearRequest } = useTaxiStore();
  const setOrigin = useRideDraftStore((s) => s.setOrigin);
  const setDestination = useRideDraftStore((s) => s.setDestination);
  const setRoutePoints = useRideDraftStore((s) => s.setRoutePoints);
  const setComment = useRideDraftStore((s) => s.setComment);
  const [selectedVehicle, setSelectedVehicle] = React.useState(vehicles[0].vehiclePlate);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<(typeof paymentOptions)[number]>(paymentOptions[0]);
  const [paymentSheetVisible, setPaymentSheetVisible] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [draftDate, setDraftDate] = React.useState(new Date());
  const [calendarVisible, setCalendarVisible] = React.useState(false);
  const [notesVisible, setNotesVisible] = React.useState(false);
  const [tripNotes, setTripNotes] = React.useState('');
  const [auctionFare, setAuctionFare] = React.useState(0);
  const [auctionFareText, setAuctionFareText] = React.useState('0.00');
  const [auctionFareVisible, setAuctionFareVisible] = React.useState(false);
  const [isAuctionPickupMode, setIsAuctionPickupMode] = React.useState(false);
  const [auctionDriver, setAuctionDriver] = React.useState<DriverAlert | null>(null);
  const [selectedPickupPoint, setSelectedPickupPoint] = React.useState<Coordinates | null>(null);
  const [selectedPickupAddress, setSelectedPickupAddress] = React.useState('Punto de partida seleccionado');
  const [isConfirmingPickup, setIsConfirmingPickup] = React.useState(false);
  const mapRef = React.useRef<MapView | null>(null);
  const pickupPinLift = React.useRef(new Animated.Value(0)).current;
  const sheetHeight = React.useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const currentHeightRef = React.useRef(COLLAPSED_HEIGHT);
  const dragStartHeightRef = React.useRef(COLLAPSED_HEIGHT);
  const isExpandedRef = React.useRef(false);
  const scrollAtTopRef = React.useRef(true);
  const [scrollEnabled, setScrollEnabled] = React.useState(false);
  const scrollEnabledRef = React.useRef(false);
  // Vehicles reorder only applied when sheet is expanded
  const [appliedSelectedVehicle, setAppliedSelectedVehicle] = React.useState(vehicles[0].vehiclePlate);
  const selectedVehicleRef = React.useRef(vehicles[0].vehiclePlate);
  const orderedVehicles = React.useMemo(() => {
    const selected = vehicles.find((vehicle) => vehicle.vehiclePlate === appliedSelectedVehicle);
    const rest = vehicles.filter((vehicle) => vehicle.vehiclePlate !== appliedSelectedVehicle);
    return selected ? [selected, ...rest] : vehicles;
  }, [appliedSelectedVehicle]);

  React.useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const animateSheet = React.useCallback((toValue: number) => {
    currentHeightRef.current = toValue;
    const expanded = toValue >= EXPANDED_HEIGHT;
    isExpandedRef.current = expanded;
    scrollEnabledRef.current = expanded;
    setScrollEnabled(expanded);
    // Apply reorder with slide animation on both expand and collapse
    LayoutAnimation.configureNext({
      duration: 320,
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.scaleY },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
    });
    setAppliedSelectedVehicle(selectedVehicleRef.current);
    Animated.spring(sheetHeight, {
      toValue,
      useNativeDriver: false,
      tension: 90,
      friction: 14,
    }).start();
  }, [sheetHeight]);

  const animatePickupPin = React.useCallback((toValue: number) => {
    Animated.timing(pickupPinLift, {
      toValue,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [pickupPinLift]);

  const resolvePickupAddress = React.useCallback(async (region: Region) => {
    try {
      const placeName = await getPlaceNameFromCoordinates(region.latitude, region.longitude);
      setSelectedPickupAddress(placeName);
    } catch {
      setSelectedPickupAddress('Punto de partida seleccionado');
    }
  }, []);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const isVertical =
            Math.abs(gestureState.dy) > 8 &&
            Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
          if (!isVertical) return false;
          // Scroll cedido: expandido y scroll deshabilitado
          if (!scrollEnabledRef.current && isExpandedRef.current) {
            if (gestureState.dy > 0) return true; // colapsar
            // Usuario quiere scrollear hacia arriba → re-habilitar scroll
            scrollEnabledRef.current = true;
            setScrollEnabled(true);
            return false;
          }
          // Expandir: sheet no está al tope
          return !isExpandedRef.current;
        },
        onPanResponderGrant: () => {
          dragStartHeightRef.current = currentHeightRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const nextHeight = clamp(
            dragStartHeightRef.current - gestureState.dy,
            COLLAPSED_HEIGHT,
            EXPANDED_HEIGHT,
          );
          sheetHeight.setValue(nextHeight);
          isExpandedRef.current = nextHeight >= EXPANDED_HEIGHT;
          if (nextHeight >= EXPANDED_HEIGHT) { scrollEnabledRef.current = true; setScrollEnabled(true); }
          else if (nextHeight <= COLLAPSED_HEIGHT) { scrollEnabledRef.current = false; setScrollEnabled(false); }
        },
        onPanResponderRelease: (_, gestureState) => {
          const projected = clamp(
            dragStartHeightRef.current - gestureState.dy,
            COLLAPSED_HEIGHT,
            EXPANDED_HEIGHT,
          );
          const middle = (COLLAPSED_HEIGHT + EXPANDED_HEIGHT) / 2;
          const shouldExpand = gestureState.vy < -0.2 || projected > middle;
          animateSheet(shouldExpand ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT);
        },
        onPanResponderTerminate: () => {
          animateSheet(currentHeightRef.current > (COLLAPSED_HEIGHT + EXPANDED_HEIGHT) / 2 ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT);
        },
      }),
    [animateSheet, sheetHeight],
  );

  const handleExitToHome = React.useCallback(() => {
    if (isAuctionPickupMode) {
      setIsAuctionPickupMode(false);
      setAuctionDriver(null);
      setSelectedPickupPoint(null);
      setSelectedPickupAddress('Punto de partida seleccionado');
      animateSheet(COLLAPSED_HEIGHT);
      return;
    }

    clearRequest();
    setDestination(null);
    setRoutePoints([]);
    setComment('');
    navigation.popToTop();
  }, [animateSheet, clearRequest, isAuctionPickupMode, navigation, setComment, setDestination, setRoutePoints]);

  const handleBook = () => {
    const selected = vehicles.find((vehicle) => vehicle.vehiclePlate === selectedVehicle) || vehicles[0];
    if (selected.vehiclePlate === 'SUBASTA') {
      const driver = { ...selected, price: auctionFare };
      setAuctionDriver(driver);
      setSelectedPickupPoint(request?.origin.position ?? null);
      setSelectedPickupAddress(request?.origin.placeName ?? 'Punto de partida seleccionado');
      setIsAuctionPickupMode(true);
      return;
    }

    acceptOffer(selected);
    navigation.replace('TrayectoTaxi');
  };

  const handleMapRegionChange = React.useCallback(() => {
    if (!isAuctionPickupMode) return;
    animatePickupPin(-16);
  }, [animatePickupPin, isAuctionPickupMode]);

  const handleMapRegionChangeComplete = React.useCallback((nextRegion: Region) => {
    if (!isAuctionPickupMode) return;
    setSelectedPickupPoint({
      latitude: nextRegion.latitude,
      longitude: nextRegion.longitude,
    });
    animatePickupPin(0);
    void resolvePickupAddress(nextRegion);
  }, [animatePickupPin, isAuctionPickupMode, resolvePickupAddress]);

  const handleConfirmAuctionPickup = React.useCallback(async () => {
    if (!request || !auctionDriver || isConfirmingPickup) return;

    setIsConfirmingPickup(true);
    const pickupPoint = selectedPickupPoint ?? request.origin.position;
    const nextOrigin: LocationMarker = {
      position: pickupPoint,
      placeName: selectedPickupAddress,
    };

    if (!selectedPickupAddress || selectedPickupAddress === 'Punto de partida seleccionado') {
      try {
        nextOrigin.placeName = await getPlaceNameFromCoordinates(pickupPoint.latitude, pickupPoint.longitude);
      } catch {
        nextOrigin.placeName = request.origin.placeName;
      }
    }

    let nextRoutePoints = request.routePoints;
    try {
      nextRoutePoints = await getRoutePolyline(pickupPoint, request.destination.position);
    } catch {
      nextRoutePoints = [pickupPoint, request.destination.position];
    }

    setOrigin(nextOrigin);
    setRoutePoints(nextRoutePoints);
    setRequest({
      ...request,
      origin: nextOrigin,
      routePoints: nextRoutePoints,
    });
    acceptOffer(auctionDriver);
    setIsConfirmingPickup(false);
    setIsAuctionPickupMode(false);
    navigation.replace('TrayectoTaxi');
  }, [
    acceptOffer,
    auctionDriver,
    isConfirmingPickup,
    navigation,
    request,
    selectedPickupAddress,
    selectedPickupPoint,
    setOrigin,
    setRequest,
    setRoutePoints,
  ]);

  const updateAuctionFare = React.useCallback((delta: number) => {
    const typedFare = Number(auctionFareText.replace(',', '.'));
    const baseFare = auctionFareVisible && Number.isFinite(typedFare) ? typedFare : auctionFare;
    const nextFare = Math.max(0, Number((baseFare + delta).toFixed(2)));
    setAuctionFare(nextFare);
    setAuctionFareText(formatFare(nextFare));
  }, [auctionFare, auctionFareText, auctionFareVisible]);

  const openAuctionFareSheet = React.useCallback(() => {
    setSelectedVehicle('SUBASTA');
    setAuctionFareText(formatFare(auctionFare));
    setAuctionFareVisible(true);
  }, [auctionFare]);

  const confirmAuctionFare = React.useCallback(() => {
    const normalized = Number(auctionFareText.replace(',', '.'));
    const nextFare = Number.isFinite(normalized) ? Math.max(0, normalized) : 0;
    setAuctionFare(nextFare);
    setAuctionFareText(formatFare(nextFare));
    setAuctionFareVisible(false);
  }, [auctionFareText]);

  const region = request
    ? {
        latitude: request.origin.position.latitude,
        longitude: request.origin.position.longitude,
        latitudeDelta: 0.025,
        longitudeDelta: 0.025,
      }
    : {
        latitude: -11.9897,
        longitude: -77.0666,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      };

  const focusAuctionPickupMap = React.useCallback(() => {
    if (!mapRef.current || !request) return;

    mapRef.current.animateToRegion(
      {
        latitude: request.origin.position.latitude,
        longitude: request.origin.position.longitude,
        latitudeDelta: 0.007,
        longitudeDelta: 0.007,
      },
      520,
    );
  }, [request]);

  const fitRouteToMap = React.useCallback(() => {
    if (!mapRef.current || !request) return;

    const coords: LatLng[] = [
      request.origin.position,
      request.destination.position,
      ...request.routePoints,
    ];

    if (coords.length < 2) return;

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: isAuctionPickupMode
        ? { top: 90, right: 48, bottom: 210, left: 48 }
        : { top: 180, right: 48, bottom: 420, left: 48 },
      animated: true,
    });
  }, [isAuctionPickupMode, request]);

  React.useEffect(() => {
    if (!request) return;

    const timeout = setTimeout(() => {
      if (isAuctionPickupMode) {
        focusAuctionPickupMap();
        return;
      }

      fitRouteToMap();
    }, 250);

    return () => clearTimeout(timeout);
  }, [fitRouteToMap, focusAuctionPickupMap, isAuctionPickupMode, request]);

  const openCalendar = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: 'date',
        display: 'spinner',
        minimumDate: new Date(),
        onChange: (event, nextDate) => {
          if (event.type === 'set' && nextDate) {
            setSelectedDate(nextDate);
            setDraftDate(nextDate);
          }
        },
      });
      return;
    }

    setDraftDate(selectedDate);
    setCalendarVisible(true);
  };

  const handleDateChange = (event: DateTimePickerEvent, nextDate?: Date) => {
    if (!nextDate) {
      setCalendarVisible(false);
      return;
    }

    if (Platform.OS === 'ios') {
      setDraftDate(nextDate);
      return;
    }

    if (event.type === 'set') {
      setSelectedDate(nextDate);
      setDraftDate(nextDate);
    }

    setCalendarVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapArea}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          onRegionChange={handleMapRegionChange}
          onRegionChangeComplete={handleMapRegionChangeComplete}
          showsUserLocation={isAuctionPickupMode}
          showsMyLocationButton={false}
        >
          {request && !isAuctionPickupMode ? (
            <Marker coordinate={request.origin.position} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.originMarker}>
                <View style={styles.markerInnerDot} />
              </View>
            </Marker>
          ) : null}
          {request && !isAuctionPickupMode ? (
            <Marker coordinate={request.destination.position} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.destinationMarker}>
                <View style={styles.markerInnerDot} />
              </View>
            </Marker>
          ) : null}
          {request && request.routePoints.length > 1 ? (
            <Polyline coordinates={request.routePoints} strokeColor="#111111" strokeWidth={5} />
          ) : null}
        </MapView>

        {isAuctionPickupMode ? (
          <View pointerEvents="none" style={styles.auctionPickupMarkerWrap}>
            <Animated.View style={[styles.auctionPickupPinWrap, { transform: [{ translateY: pickupPinLift }] }]}>
              <View style={styles.auctionPickupMarker}>
                <View style={styles.auctionPickupMarkerDot} />
              </View>
              <View style={styles.auctionPickupStem} />
            </Animated.View>
            <View style={styles.auctionPickupShadowDot} />
          </View>
        ) : null}

        {!isAuctionPickupMode ? (
          <View style={[styles.routeCard, styles.routeCardTop]}>
            <View style={styles.routeRow}>
              <View style={styles.routeDotGreen} />
              <Text numberOfLines={1} style={styles.routeText}>
                {request?.origin.placeName || 'Fairfax Drive Newark, NJ 07...'}
              </Text>
            </View>

            <View style={styles.routeDivider} />

            <View style={styles.routeRow}>
              <View style={styles.routeDotRed} />
              <Text numberOfLines={1} style={styles.routeText}>
                {request?.destination.placeName || '3963 Mattson Street Portland...'}
              </Text>
              <View style={styles.routeActionWrap}>
                <Ionicons name="add" size={18} color="#334155" />
              </View>
            </View>
          </View>
        ) : null}

        {!isAuctionPickupMode ? <View style={styles.expandFab}>
          <Ionicons name="scan-outline" size={20} color="#1f2a44" />
        </View> : null}

        <TouchableOpacity
          style={[
            styles.mapActionButton,
            isAuctionPickupMode ? styles.auctionBackFab : styles.backFab,
            isAuctionPickupMode && { bottom: Math.max(insets.bottom, Spacing.md) + 170 },
          ]}
          onPress={handleExitToHome}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={22} color="#1f2a44" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.mapActionButton,
            isAuctionPickupMode ? styles.auctionCenterFab : styles.centerRouteFab,
            isAuctionPickupMode && { bottom: Math.max(insets.bottom, Spacing.md) + 170 },
          ]}
          onPress={isAuctionPickupMode ? focusAuctionPickupMap : fitRouteToMap}
          activeOpacity={0.85}
        >
          <Ionicons name={isAuctionPickupMode ? 'locate-outline' : 'navigate'} size={22} color="#334155" />
        </TouchableOpacity>
      </View>

      {!isAuctionPickupMode ? <Animated.View {...panResponder.panHandlers} style={[styles.sheet, { height: sheetHeight }]}>
        <View style={styles.dragArea}>
          <View style={styles.handle} />
        </View>

        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>ELIGE UN VEHICULO</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={openCalendar} activeOpacity={0.85}>
              <Ionicons name="calendar-outline" size={18} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => setNotesVisible(true)} activeOpacity={0.85}>
              <Ionicons name="create-outline" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={[
            styles.vehicleList,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
          bounces={false}
          overScrollMode="never"
          onScroll={(e) => {
            scrollAtTopRef.current = e.nativeEvent.contentOffset.y <= 0;
          }}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(e) => {
            // Lista llegó al tope con momentum → cede al PanResponder para siguiente drag
            if (e.nativeEvent.contentOffset.y <= 0 && isExpandedRef.current) {
              scrollEnabledRef.current = false;
              setScrollEnabled(false);
            }
          }}
          onScrollEndDrag={(e) => {
            // Usuario soltó el dedo en el tope sin momentum → cede al PanResponder
            if (e.nativeEvent.contentOffset.y <= 0 && isExpandedRef.current) {
              scrollEnabledRef.current = false;
              setScrollEnabled(false);
            }
          }}
        >
          {orderedVehicles.map((item, index) => {
            const active = selectedVehicle === item.vehiclePlate;
            const isAuction = item.vehiclePlate === 'SUBASTA';
            return (
              <TouchableOpacity
                key={item.vehiclePlate}
                style={[styles.vehicleCard, active && styles.vehicleCardActive]}
                onPress={() => {
                  selectedVehicleRef.current = item.vehiclePlate;
                  setSelectedVehicle(item.vehiclePlate);
                }}
                activeOpacity={0.88}
              >
                <View style={styles.vehicleContentRow}>
                  <View style={styles.vehicleTextWrap}>
                    <View style={styles.vehicleTitleRow}>
                      <Text style={styles.vehicleName}>{item.vehicleModel}</Text>
                      {index === 0 ? <Ionicons name="information-circle" size={16} color="#1d5fa8" /> : null}
                    </View>
                    <Text style={styles.vehicleMeta}>{item.seatsLabel}</Text>
                    <View style={styles.vehicleBottomRow}>
                      <Text style={styles.vehiclePrice}>
                        {item.currency}
                        {isAuction ? formatFare(auctionFare) : item.price.toFixed(2)}
                      </Text>
                      <View style={styles.timeWrap}>
                        <Ionicons name="radio-button-off-outline" size={14} color="#0f172a" />
                        <Text style={styles.vehicleEta}>1-{item.etaMinutes} min</Text>
                      </View>
                    </View>
                  </View>
                  <Image source={item.serviceImage} style={styles.vehicleImage} resizeMode="contain" />
                </View>
                {isAuction && active ? (
                  <View style={styles.auctionControls}>
                    <TouchableOpacity
                      style={[styles.auctionStepButton, auctionFare <= 0 && styles.auctionStepButtonDisabled]}
                      onPress={() => updateAuctionFare(-0.5)}
                      activeOpacity={0.82}
                      disabled={auctionFare <= 0}
                    >
                      <Text style={[styles.auctionStepText, auctionFare <= 0 && styles.auctionStepTextDisabled]}>- 0.50</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.auctionFareButton} onPress={openAuctionFareSheet} activeOpacity={0.82}>
                      <Text style={styles.auctionFareText}>
                        {item.currency} {formatFare(auctionFare)}
                      </Text>
                      <Ionicons name="create-outline" size={14} color="#64748b" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.auctionStepButton} onPress={() => updateAuctionFare(0.5)} activeOpacity={0.82}>
                      <Text style={styles.auctionStepText}>+ 0.50</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={[styles.staticFooter, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
          <TouchableOpacity style={styles.insuranceBanner} activeOpacity={0.9}>
            <View style={styles.insuranceLeft}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#7c2d12" />
              <Text style={styles.insuranceText}>Asegura tus viajes por solo S/15</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#7c2d12" />
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.paymentRow} onPress={() => setPaymentSheetVisible(true)} activeOpacity={0.85}>
              <Image source={selectedPaymentMethod.image} style={styles.paymentMethodIcon} resizeMode="contain" />
              <View style={styles.paymentTextWrap}>
                <Text style={styles.paymentLabel}>Metodo de pago</Text>
                <Text style={styles.paymentText}>{selectedPaymentMethod.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#334155" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.bookButton} onPress={handleBook} activeOpacity={0.88}>
              <Text style={styles.bookButtonText}>RESERVAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View> : null}

      {isAuctionPickupMode ? (
        <View style={[styles.auctionPickupPanel, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
          <Text style={styles.auctionPickupTitle}>Confirmar punto de origen</Text>
          <View style={styles.auctionPickupDivider} />
          <Text style={styles.auctionPickupHelper}>Desplaza el mapa para establecer tu punto de origen.</Text>
          <TouchableOpacity
            style={[styles.auctionPickupConfirmButton, isConfirmingPickup && styles.auctionPickupConfirmButtonDisabled]}
            onPress={handleConfirmAuctionPickup}
            activeOpacity={0.88}
            disabled={isConfirmingPickup}
          >
            <Text style={styles.auctionPickupConfirmText}>{isConfirmingPickup ? 'CONFIRMANDO...' : 'CONFIRMAR'}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Modal
        visible={paymentSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentSheetVisible(false)}
      >
        <Pressable style={styles.paymentSheetBackdrop} onPress={() => setPaymentSheetVisible(false)} />
        <View style={[styles.paymentSheet, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
          <View style={styles.paymentSheetHandle} />
          <Text style={styles.paymentSheetTitle}>Metodo de pago</Text>

          {paymentOptions.map((option) => {
            const active = selectedPaymentMethod.id === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.paymentOptionCard, active && styles.paymentOptionCardActive]}
                onPress={() => {
                  setSelectedPaymentMethod(option);
                  setPaymentSheetVisible(false);
                }}
                activeOpacity={0.88}
              >
                <Image source={option.image} style={styles.paymentOptionImage} resizeMode="contain" />
                <Text style={styles.paymentOptionText}>{option.label}</Text>
                {active ? <Ionicons name="checkmark-circle" size={22} color="#1d5fa8" /> : <Ionicons name="ellipse-outline" size={20} color="#94a3b8" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={calendarVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setCalendarVisible(false)}
        >
          <Pressable style={styles.overlayBackdrop} onPress={() => setCalendarVisible(false)}>
            <Pressable
              style={[styles.calendarSheet, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}
              onPress={(event) => event.stopPropagation()}
            >
              <View style={styles.calendarActions}>
                <TouchableOpacity onPress={() => setCalendarVisible(false)} activeOpacity={0.85}>
                  <Text style={styles.calendarActionText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedDate(draftDate);
                    setCalendarVisible(false);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.calendarActionText}>Listo</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={draftDate}
                mode="date"
                display="spinner"
                minimumDate={new Date()}
                locale="es-ES"
                themeVariant="light"
                onChange={handleDateChange}
                style={styles.cupertinoPicker}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      <Modal
        visible={notesVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotesVisible(false)}
      >
        <Pressable style={styles.notesBackdrop} onPress={() => setNotesVisible(false)} />
        <KeyboardAvoidingView
          style={styles.notesKeyboardLayer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
          keyboardVerticalOffset={0}
        >
          <View style={[styles.paymentSheet, styles.notesSheet, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
            <View style={styles.paymentSheetHandle} />
            <Text style={styles.paymentSheetTitle}>Notas del viaje</Text>
            <Text style={styles.notesHelperText}>Agrega una indicacion para el conductor.</Text>
            <TextInput
              value={tripNotes}
              onChangeText={setTripNotes}
              placeholder="Ejemplo: estoy en la puerta principal."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
              style={styles.notesInput}
            />
            <TouchableOpacity style={styles.saveNotesButton} onPress={() => setNotesVisible(false)} activeOpacity={0.88}>
              <Text style={styles.saveNotesButtonText}>Guardar nota</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={auctionFareVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAuctionFareVisible(false)}
      >
        <Pressable style={styles.overlayBackdrop} onPress={() => setAuctionFareVisible(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.auctionKeyboardLayer}
          >
            <Pressable
              style={[styles.auctionSheet, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}
              onPress={(event) => event.stopPropagation()}
            >
              <View style={styles.paymentSheetHandle} />
              <Text style={styles.auctionSheetTitle}>Propón una tarifa de viaje</Text>
              <Text style={styles.auctionSheetText}>Puedes modificar la tarifa sugerida</Text>

              <View style={styles.auctionSheetControls}>
                <TouchableOpacity
                  style={[styles.auctionStepButton, styles.auctionSheetStepButton, auctionFare <= 0 && styles.auctionStepButtonDisabled]}
                  onPress={() => updateAuctionFare(-0.5)}
                  activeOpacity={0.82}
                  disabled={auctionFare <= 0}
                >
                  <Text style={[styles.auctionStepText, auctionFare <= 0 && styles.auctionStepTextDisabled]}>- 0.50</Text>
                </TouchableOpacity>

                <View style={styles.auctionInputWrap}>
                  <Text style={styles.auctionInputCurrency}>S/</Text>
                  <TextInput
                    value={auctionFareText}
                    onChangeText={setAuctionFareText}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                    style={styles.auctionInput}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.auctionStepButton, styles.auctionSheetStepButton]}
                  onPress={() => updateAuctionFare(0.5)}
                  activeOpacity={0.82}
                >
                  <Text style={styles.auctionStepText}>+ 0.50</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.auctionConfirmButton} onPress={confirmAuctionFare} activeOpacity={0.88}>
                <Text style={styles.auctionConfirmButtonText}>CONFIRMAR</Text>
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7fb' },
  mapArea: {
    flex: 1,
    position: 'relative',
  },
  routeCard: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    ...Shadow.md,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
  },
  routeDivider: {
    height: 1,
    backgroundColor: '#e8edf5',
    marginVertical: 4,
    marginLeft: 18,
    marginRight: 18,
  },
  routeCardTop: {
    top: 58,
  },
  routeDotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: Spacing.sm,
  },
  routeDotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: Spacing.sm,
  },
  routeText: {
    flex: 1,
    color: '#334155',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  routeActionWrap: {
    width: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  expandFab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: 22,
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  mapActionButton: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  backFab: {
    left: Spacing.lg,
    bottom: COLLAPSED_HEIGHT + 18,
  },
  centerRouteFab: {
    right: Spacing.lg,
    bottom: COLLAPSED_HEIGHT + 18,
  },
  auctionBackFab: {
    left: Spacing.lg,
  },
  auctionCenterFab: {
    right: Spacing.lg,
  },
  auctionPickupMarkerWrap: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 64,
    height: 82,
    marginLeft: -32,
    marginTop: -58,
    alignItems: 'center',
  },
  auctionPickupPinWrap: {
    alignItems: 'center',
  },
  auctionPickupMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  auctionPickupMarkerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.white,
  },
  auctionPickupStem: {
    width: 4,
    height: 24,
    backgroundColor: '#111111',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    marginTop: -2,
    zIndex: -1,
  },
  auctionPickupShadowDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.38,
    shadowRadius: 0,
    elevation: 1,
  },
  originMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  destinationMarker: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  markerInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: Spacing.lg,
    paddingTop: 0,
    ...Shadow.lg,
  },
  auctionPickupPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    paddingTop: Spacing.md,
  },
  auctionPickupTitle: {
    color: '#111827',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  auctionPickupDivider: {
    height: 1,
    backgroundColor: '#eef2f7',
  },
  auctionPickupHelper: {
    color: '#334155',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  auctionPickupConfirmButton: {
    minHeight: 56,
    marginHorizontal: Spacing.lg,
    borderRadius: 10,
    backgroundColor: '#1d5fa8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  auctionPickupConfirmButtonDisabled: {
    opacity: 0.72,
  },
  auctionPickupConfirmText: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  dragArea: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  handle: {
    width: 56,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#d7dee9',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    color: '#334155',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    letterSpacing: 0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1f2a44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  vehicleList: {
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  vehicleCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: Spacing.md,
    alignItems: 'stretch',
    backgroundColor: '#ffffff',
  },
  vehicleCardActive: {
    borderColor: '#60a5fa',
    backgroundColor: '#eff6ff',
  },
  vehicleTextWrap: {
    flex: 1,
  },
  vehicleContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  vehicleName: {
    color: '#1f2a44',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  vehicleMeta: {
    color: '#64748b',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  vehicleBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  auctionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  auctionStepButton: {
    flex: 1,
    minWidth: 0,
    height: 42,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadow.sm,
  },
  auctionStepButtonDisabled: {
    backgroundColor: '#f8fafc',
    borderColor: '#edf2f7',
  },
  auctionStepText: {
    color: '#334155',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  auctionStepTextDisabled: {
    color: '#cbd5e1',
  },
  auctionFareButton: {
    flex: 1.35,
    minWidth: 0,
    height: 42,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    borderColor: '#dbeafe',
    ...Shadow.sm,
  },
  auctionFareText: {
    color: '#1f2a44',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  vehiclePrice: {
    color: '#1d5fa8',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    marginRight: Spacing.md,
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicleEta: {
    color: '#0f172a',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  vehicleImage: {
    width: 104,
    height: 64,
    marginLeft: Spacing.md,
  },
  insuranceBanner: {
    backgroundColor: '#ffbe3b',
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insuranceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insuranceText: {
    color: '#7c2d12',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  staticFooter: {
    backgroundColor: Colors.white,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#eef2f7',
    gap: Spacing.md,
  },
  paymentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingRight: 4,
  },
  paymentMethodIcon: {
    width: 28,
    height: 28,
  },
  paymentTextWrap: {
    flex: 1,
  },
  paymentLabel: {
    color: '#64748b',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    marginBottom: 1,
  },
  paymentText: {
    color: '#334155',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  paymentSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
  },
  notesKeyboardLayer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  notesBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  overlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    justifyContent: 'flex-end',
  },
  auctionKeyboardLayer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  auctionSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  auctionSheetTitle: {
    color: '#1f2a44',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
  },
  auctionSheetText: {
    color: '#64748b',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    marginTop: -8,
  },
  auctionSheetControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  auctionSheetStepButton: {
    flex: 0,
    minWidth: 104,
  },
  auctionInputWrap: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  auctionInputCurrency: {
    color: '#1f2a44',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
  },
  auctionInput: {
    minWidth: 72,
    color: '#1f2a44',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    paddingVertical: 0,
    textAlign: 'center',
  },
  auctionConfirmButton: {
    backgroundColor: '#1d5fa8',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  auctionConfirmButtonText: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  calendarSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  calendarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  calendarActionText: {
    color: '#1d5fa8',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  cupertinoPicker: {
    backgroundColor: Colors.white,
  },
  paymentSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  notesSheet: {
    flexShrink: 1,
    maxHeight: SCREEN_HEIGHT * 0.48,
  },
  paymentSheetHandle: {
    alignSelf: 'center',
    width: 56,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#d7dee9',
    marginBottom: Spacing.sm,
  },
  paymentSheetTitle: {
    color: '#1f2a44',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
  },
  paymentOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: '#ffffff',
  },
  paymentOptionCardActive: {
    borderColor: '#60a5fa',
    backgroundColor: '#eff6ff',
  },
  paymentOptionImage: {
    width: 52,
    height: 52,
    marginRight: Spacing.md,
  },
  paymentOptionText: {
    flex: 1,
    color: '#1f2a44',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  notesHelperText: {
    color: '#64748b',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    marginTop: -4,
  },
  notesInput: {
    minHeight: 128,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: '#1f2a44',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    backgroundColor: '#f8fbff',
  },
  saveNotesButton: {
    backgroundColor: '#1d5fa8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveNotesButtonText: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  bookButton: {
    backgroundColor: '#1d5fa8',
    borderRadius: 10,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: 14,
    minWidth: 156,
    alignItems: 'center',
  },
  bookButtonText: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    letterSpacing: 0.4,
  },
});
