import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  Share,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, type LatLng } from 'react-native-maps';
import { RoutePolyline } from '@shared/components/map/RoutePolyline';
import * as Haptics from 'expo-haptics';
import type { ClienteStackParamList } from '@navigation/types';
import { useRideDraftStore } from '@store/useRideDraftStore';
import { useTaxiStore } from '@store/useTaxiStore';
import { useTripHistoryStore } from '@store/useTripHistoryStore';
import { usePromotionsStore } from '@store/usePromotionsStore';
import { applyDiscount } from '@features/cliente/promociones/utils/descuentos';
import { useThemeStore } from '@store/useThemeStore';
import { CalificacionModal, type Calificacion } from '@shared/components/card/CalificacionModal';
import { UserNetworkAvatar } from '@shared/components/avatar/UserNetworkAvatar';
import { PlacaVehiculo } from '@shared/components/ui/PlacaVehiculo';
import { AppButton } from '@shared/components/ui/AppButton';
import { LegacyImages } from '@shared/assets/legacyAssets';
import { calculateBearing } from '@shared/utils/mapUtils';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { getMapStyle } from '@theme/mapStyles';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';


const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLLAPSED_HEIGHT = 440;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.62;

type Nav = NativeStackNavigationProp<ClienteStackParamList, 'TrayectoTaxi'>;
type TripPhase = 'arriving' | 'on_trip';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getPaymentMethodImage(mode: string) {
  switch (mode) {
    case 'Yape':
      return require('../../../../assets/payment/Yape.png');
    case 'Plin':
      return require('../../../../assets/payment/Plin.png');
    case 'Efectivo':
    default:
      return require('../../../../assets/payment/Efectivo.png');
  }
}

export function TrayectoTaxiScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const isDark = useThemeStore((state) => state.isDark);
  const { activeTrip, endTrip } = useTaxiStore();
  const resetDraft = useRideDraftStore((state) => state.resetDraft);
  const addCompletedTrip = useTripHistoryStore((state) => state.addCompletedTrip);
  const clearCoupon = usePromotionsStore((state) => state.clearCoupon);

  const [tripPhase, setTripPhase] = React.useState<TripPhase>('arriving');
  const [ratingVisible, setRatingVisible] = React.useState(false);

  const driver = activeTrip?.driver;
  const request = activeTrip?.request;
  const discount = activeTrip?.discount ?? null;
  const mapRef = React.useRef<MapView | null>(null);
  const allowTripExitRef = React.useRef(false);

  const sheetHeight = React.useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const currentHeightRef = React.useRef(COLLAPSED_HEIGHT);
  const dragStartHeightRef = React.useRef(COLLAPSED_HEIGHT);

  React.useEffect(() => {
    if (!activeTrip) {
      allowTripExitRef.current = false;
      return undefined;
    }

    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (allowTripExitRef.current) return;
      event.preventDefault();
    });

    return unsubscribe;
  }, [activeTrip, navigation]);

  const routeCoords: LatLng[] = React.useMemo(() => {
    if (!request) return [];
    return [
      request.origin.position,
      ...request.routePoints,
      request.destination.position,
    ];
  }, [request]);

  const fitRouteToMap = React.useCallback(
    (activeSheetHeight?: number) => {
      if (!mapRef.current || routeCoords.length < 2) return;

      mapRef.current.fitToCoordinates(routeCoords, {
        edgePadding: {
          top: insets.top + (tripPhase === 'on_trip' ? 120 : 64),
          right: 32,
          bottom: Math.round((activeSheetHeight ?? currentHeightRef.current) + 36),
          left: 32,
        },
        animated: true,
      });
    },
    [insets.top, routeCoords, tripPhase]
  );

  const animateSheet = React.useCallback(
    (toValue: number) => {
      currentHeightRef.current = toValue;
      Animated.spring(sheetHeight, {
        toValue,
        useNativeDriver: false,
        tension: 90,
        friction: 14,
      }).start(() => {
        fitRouteToMap(toValue);
      });
    },
    [fitRouteToMap, sheetHeight]
  );

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      fitRouteToMap(COLLAPSED_HEIGHT);
    }, 300);

    return () => clearTimeout(timeout);
  }, [fitRouteToMap]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 4,
        onPanResponderGrant: () => {
          dragStartHeightRef.current = currentHeightRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const nextHeight = clamp(
            dragStartHeightRef.current - gestureState.dy,
            COLLAPSED_HEIGHT,
            EXPANDED_HEIGHT
          );
          sheetHeight.setValue(nextHeight);
        },
        onPanResponderRelease: (_, gestureState) => {
          const projected = clamp(
            dragStartHeightRef.current - gestureState.dy,
            COLLAPSED_HEIGHT,
            EXPANDED_HEIGHT
          );
          const middle = (COLLAPSED_HEIGHT + EXPANDED_HEIGHT) / 2;
          const shouldExpand = gestureState.vy < -0.2 || projected > middle;
          animateSheet(shouldExpand ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT);
        },
        onPanResponderTerminate: () => {
          animateSheet(
            currentHeightRef.current > (COLLAPSED_HEIGHT + EXPANDED_HEIGHT) / 2
              ? EXPANDED_HEIGHT
              : COLLAPSED_HEIGHT
          );
        },
      }),
    [animateSheet, sheetHeight]
  );

  if (!activeTrip || !driver || !request) return null;

  const region = {
    latitude: request.origin.position.latitude,
    longitude: request.origin.position.longitude,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  };

  // Driver car position & bearing calculation
  const carPosition =
    tripPhase === 'arriving'
      ? request.routePoints[0] || {
          latitude: request.origin.position.latitude - 0.003,
          longitude: request.origin.position.longitude - 0.002,
        }
      : request.routePoints[Math.min(1, request.routePoints.length - 1)] ||
        request.destination.position;

  const targetCoord =
    tripPhase === 'arriving' ? request.origin.position : request.destination.position;
  const carBearing = calculateBearing(carPosition, targetCoord);

  // Safety SOS Handler
  const handleSOS = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Asistencia y Emergencia',
      'Elige una opción de ayuda. Tu seguridad es nuestra prioridad.',
      [
        {
          text: 'Llamar al 105 (Policía)',
          style: 'destructive',
          onPress: () => Linking.openURL('tel:105'),
        },
        {
          text: 'Llamar al 116 (Bomberos)',
          onPress: () => Linking.openURL('tel:116'),
        },
        {
          text: 'Compartir viaje con un contacto',
          onPress: handleShareTrip,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  // Share Trip Handler
  const handleShareTrip = async () => {
    Haptics.selectionAsync();
    try {
      await Share.share({
        message: `Sigue mi viaje en RunSubasta: Conductor ${driver.driverName}, auto ${driver.vehicleModel} (${driver.vehicleColor}), placa ${driver.vehiclePlate}. Destino: ${request.destination.placeName}.`,
      });
    } catch {
      // Ignorar si el usuario descarta compartir
    }
  };

  // Call Driver Handler
  const handleCallDriver = () => {
    Haptics.selectionAsync();
    if (driver.phone) {
      Linking.openURL(`tel:${driver.phone}`);
    } else {
      Alert.alert('Contacto', `Llamando al conductor ${driver.driverName}...`);
    }
  };

  // Chat with Driver Handler
  const handleChatDriver = () => {
    Haptics.selectionAsync();
    Alert.alert(
      'Mensaje al conductor',
      `Enviar mensaje rápido a ${driver.driverName}:`,
      [
        {
          text: 'Estoy en la puerta',
          onPress: () => Alert.alert('Mensaje enviado', 'El conductor fue notificado.'),
        },
        {
          text: 'Esperando en la esquina',
          onPress: () => Alert.alert('Mensaje enviado', 'El conductor fue notificado.'),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  // Cancel Trip Handler
  const handleCancelTrip = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Cancelar viaje',
      '¿Estás seguro de que deseas cancelar este viaje?',
      [
        { text: 'No, continuar', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => {
            allowTripExitRef.current = true;
            endTrip();
            resetDraft();
            navigation.replace('ClienteHome');
          },
        },
      ]
    );
  };

  // Switch Phase to In Trip
  const handleStartRide = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTripPhase('on_trip');
  };

  // End Trip & Open Rating
  const handleFinishRide = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRatingVisible(true);
  };

  // Complete Rating
  const handleRatingComplete = (_calificacion?: Calificacion) => {
    if (activeTrip) {
      addCompletedTrip(activeTrip);
      // El cupón es para un viaje: se gasta al terminarlo (si se cancela, sigue guardado).
      // Solo se borra si es el mismo que se usó, por si se aplicó otro durante el viaje.
      const usedCoupon = activeTrip.discount?.source === 'coupon' ? activeTrip.discount.label : null;
      if (usedCoupon && usePromotionsStore.getState().appliedCoupon?.code === usedCoupon) {
        clearCoupon();
      }
    }
    allowTripExitRef.current = true;
    setRatingVisible(false);
    endTrip();
    resetDraft();
    navigation.replace('ClienteHome');
  };

  // Polyline color: lime in dark/night mode, black/dark in day mode

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        customMapStyle={getMapStyle(isDark)}
      >
        {/* Marcador de Origen */}
        <Marker coordinate={request.origin.position} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[styles.originMarker, { backgroundColor: Colors.origin }]}>
            <View style={styles.markerInnerDot} />
          </View>
        </Marker>

        {/* Marcador de Destino */}
        <Marker coordinate={request.destination.position} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[styles.destinationMarker, { backgroundColor: Colors.destination }]}>
            <View style={styles.markerInnerDot} />
          </View>
        </Marker>

        {/* Auto del conductor con car_north.png rotado según el bearing */}
        <Marker
          coordinate={carPosition}
          anchor={{ x: 0.5, y: 0.5 }}
          rotation={carBearing}
          flat
        >
          <Image
            source={LegacyImages.carNorth}
            style={styles.carMarkerImage}
            resizeMode="contain"
          />
        </Marker>

        {/* Ruta trazada */}
        {routeCoords.length > 1 ? (
          <RoutePolyline coordinates={routeCoords} />
        ) : null}
      </MapView>

      {/* Barra superior flotante: SOS y Botón centrar */}
      <View
        pointerEvents="box-none"
        style={[styles.topHeader, { top: insets.top + Spacing.sm }]}
      >
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.surface, ...Shadow.raise }]}
          onPress={() => fitRouteToMap()}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Centrar mapa en la ruta"
        >
          <Ionicons name="locate-outline" size={20} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sosButton, { backgroundColor: Colors.danger, ...Shadow.raise }]}
          onPress={handleSOS}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Emergencia SOS, presiona para opciones de ayuda"
        >
          <Ionicons name="shield-checkmark" size={18} color={Colors.white} />
          <Text style={styles.sosButtonText}>SOS</Text>
        </TouchableOpacity>
      </View>

      {/* Pantalla 9 (En viaje): Banner flotante de destino y tiempo */}
      {tripPhase === 'on_trip' && (
        <View
          style={[
            styles.destinationBanner,
            {
              top: insets.top + 64,
              backgroundColor: theme.surface,
              borderColor: theme.divider,
              ...Shadow.sheet,
            },
          ]}
        >
          <View style={styles.bannerRow}>
            <View style={styles.bannerEtaWrap}>
              <Text style={[styles.bannerEtaTime, { color: theme.text }]}>
                Llegas en ~{driver.etaMinutes ? Math.round(driver.etaMinutes) : 15} min
              </Text>
              <Text style={[styles.bannerEtaDist, { color: theme.textMuted }]}>
                {driver.distanceKm ? `${driver.distanceKm.toFixed(1)} km` : '4.2 km'}
              </Text>
            </View>
            <View style={styles.bannerStatusPill}>
              <View style={[styles.liveDot, { backgroundColor: Colors.online }]} />
              <Text style={styles.bannerStatusText}>En viaje</Text>
            </View>
          </View>
          <Text style={[styles.bannerDestinationText, { color: theme.text }]} numberOfLines={1}>
            {request.destination.placeName}
          </Text>
        </View>
      )}

      {/* Panel Inferior Flotante (BottomSheet) */}
      <Animated.View
        style={[
          styles.panel,
          {
            height: sheetHeight,
            paddingBottom: insets.bottom + Spacing.md,
            backgroundColor: theme.surface,
            ...Shadow.sheet,
          },
        ]}
      >
        {/* Barra de estado / ETA superior */}
        <View
          style={[
            styles.statusHeaderBar,
            {
              backgroundColor: tripPhase === 'arriving' ? Colors.primary : Colors.secondary,
            },
          ]}
        >
          <View style={styles.statusHeaderLeft}>
            <Ionicons
              name={tripPhase === 'arriving' ? 'time-outline' : 'navigate-outline'}
              size={18}
              color={Colors.accentLime}
            />
            <Text style={styles.statusHeaderText}>
              {tripPhase === 'arriving'
                ? `Conductor en camino · Llega en ~${Math.round(driver.etaMinutes || 3)} min`
                : 'Trayecto en curso hacia destino'}
            </Text>
          </View>
          {tripPhase === 'arriving' && (
            <TouchableOpacity
              onPress={handleStartRide}
              style={styles.advancePill}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Iniciar recorrido, ya subí al auto"
            >
              <Text style={styles.advancePillText}>Subí al auto</Text>
            </TouchableOpacity>
          )}
        </View>

        <View {...panResponder.panHandlers} style={styles.dragArea}>
          <View style={[styles.handle, { backgroundColor: theme.divider }]} />
        </View>

        <ScrollView
          style={styles.panelScroll}
          contentContainerStyle={styles.panelScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Identificación del auto: PLACA GRANDE (ABC-123) */}
          <View style={[styles.vehicleSection, { borderBottomColor: theme.divider }]}>
            <PlacaVehiculo plate={driver.vehiclePlate} size="lg" />
            <View style={styles.vehicleInfoWrap}>
              <Text style={[styles.vehicleModelText, { color: theme.text }]} numberOfLines={1}>
                {driver.vehicleModel}
              </Text>
              <Text style={[styles.vehicleColorText, { color: theme.textMuted }]}>
                Color {driver.vehicleColor.toLowerCase()}
              </Text>
              <View style={styles.driverRatingInline}>
                <Ionicons name="star" size={13} color={Colors.star} />
                <Text style={[styles.driverRatingText, { color: theme.text }]}>
                  {driver.rating.toFixed(1)}
                </Text>
                <Text style={[styles.driverTripsText, { color: theme.textMuted }]}>
                  · 1,274 viajes
                </Text>
              </View>
            </View>
          </View>

          {/* Fila del Conductor */}
          <View style={styles.driverRow}>
            <View style={styles.driverInfoLeft}>
              <UserNetworkAvatar imageUrl={driver.imageUrl} radius={22} />
              <View style={styles.driverNameWrap}>
                <Text style={[styles.driverNameText, { color: theme.text }]}>
                  {driver.driverName}
                </Text>
                <Text style={[styles.driverSubtitle, { color: theme.textMuted }]}>
                  Conductor verificado
                </Text>
              </View>
            </View>

            {/* Acciones directas: Escribir / Llamar */}
            <View style={styles.driverActionsRight}>
              <TouchableOpacity
                style={[styles.circleActionBtn, { backgroundColor: theme.surfaceMuted }]}
                onPress={handleCallDriver}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Llamar al conductor"
              >
                <Ionicons name="call-outline" size={18} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.circleActionBtn, { backgroundColor: theme.surfaceMuted }]}
                onPress={handleChatDriver}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Enviar mensaje al conductor"
              >
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>


          {/* 3 Botones de acción (Escribir, Compartir viaje, SOS) */}
          <View style={styles.actionPillsRow}>
            <TouchableOpacity
              style={[styles.actionPill, { backgroundColor: theme.surfaceMuted }]}
              onPress={handleChatDriver}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Escribir al conductor"
            >
              <Ionicons name="chatbubble-outline" size={16} color={theme.text} />
              <Text style={[styles.actionPillText, { color: theme.text }]}>Escribir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionPill, { backgroundColor: theme.surfaceMuted }]}
              onPress={handleShareTrip}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Compartir viaje en tiempo real"
            >
              <Ionicons name="share-social-outline" size={16} color={theme.text} />
              <Text style={[styles.actionPillText, { color: theme.text }]}>Compartir viaje</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionPill, { backgroundColor: Colors.dangerSoft }]}
              onPress={handleSOS}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Emergencia SOS"
            >
              <Ionicons name="shield-outline" size={16} color={Colors.danger} />
              <Text style={[styles.actionPillText, { color: Colors.danger }]}>SOS</Text>
            </TouchableOpacity>
          </View>

          {/* Detalles de la tarifa y método de pago */}
          <View style={[styles.fareCard, { backgroundColor: theme.surfaceMuted }]}>
            <View style={styles.fareRow}>
              <View style={styles.fareLeft}>
                <Image
                  source={getPaymentMethodImage(request.paymentMethod.mode)}
                  style={styles.paymentIcon}
                  resizeMode="contain"
                />
                <Text style={[styles.paymentMethodName, { color: theme.text }]}>
                  {request.paymentMethod.mode}
                </Text>
              </View>
              <View style={styles.farePriceBlock}>
                {discount ? (
                  <Text style={[styles.farePriceBefore, { color: theme.textMuted }]}>
                    {request.paymentMethod.currency} {driver.price.toFixed(2)}
                  </Text>
                ) : null}
                <Text style={[styles.farePriceText, { color: theme.text }]}>
                  {request.paymentMethod.currency} {applyDiscount(driver.price, discount).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Botones de acción principales */}
          <View style={styles.footerButtons}>
            {tripPhase === 'on_trip' ? (
              <AppButton
                label="Finalizar viaje"
                variant="sig"
                size="md"
                onPress={handleFinishRide}
                accessibilityLabel="Finalizar viaje y calificar conductor"
              />
            ) : (
              <AppButton
                label="Ya estoy en el auto"
                variant="sig"
                size="md"
                onPress={handleStartRide}
                accessibilityLabel="Confirmar inicio del viaje"
              />
            )}

            <TouchableOpacity
              onPress={handleCancelTrip}
              style={styles.cancelTripButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Cancelar viaje"
            >
              <Text style={[styles.cancelTripText, { color: theme.textMuted }]}>
                Cancelar viaje
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Pantalla 10: Modal de Calificación */}
      <CalificacionModal
        visible={ratingVisible}
        user={{
          nombres: driver.driverName,
          cantViajes: 1274,
          imageUrl: driver.imageUrl,
          rol: 'conductor',
        }}
        vehicleModel={driver.vehicleModel}
        vehiclePlate={driver.vehiclePlate}
        origin={request.origin.placeName}
        destination={request.destination.placeName}
        paymentMethod={request.paymentMethod.mode}
        fareAmount={applyDiscount(driver.price, discount)}
        currency={request.paymentMethod.currency}
        durationMinutes={Math.round(driver.etaMinutes || 19)}
        vehicleImageSource={LegacyImages.carEstandar}
        onClose={() => handleRatingComplete()}
        onSend={(calificacion) => handleRatingComplete(calificacion)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  originMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadow.sm,
  },
  destinationMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadow.sm,
  },
  markerInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  carMarkerImage: {
    width: 38,
    height: 38,
  },
  topHeader: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: 22,
    gap: 6,
  },
  sosButtonText: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  destinationBanner: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    zIndex: 9,
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bannerEtaWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  bannerEtaTime: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
  },
  bannerEtaDist: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  bannerStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.onlineSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bannerStatusText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize['2xs'],
    color: Colors.online,
  },
  bannerDestinationText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    overflow: 'hidden',
  },
  statusHeaderBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statusHeaderText: {
    color: Colors.white,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
  },
  advancePill: {
    backgroundColor: Colors.accentLime,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  advancePillText: {
    color: Colors.onAccentLime,
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xs'],
  },
  dragArea: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
  },
  panelScroll: {
    flex: 1,
  },
  panelScrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  vehicleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.lg,
  },
  vehicleInfoWrap: {
    flex: 1,
  },
  vehicleModelText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
  },
  vehicleColorText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    marginTop: 1,
  },
  driverRatingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 3,
  },
  driverRatingText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  driverTripsText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  driverInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  driverNameWrap: {
    flex: 1,
  },
  driverNameText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
  },
  driverSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  driverActionsRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  circleActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPillsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  actionPillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
  },
  fareCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
  },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fareLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  paymentIcon: {
    width: 24,
    height: 24,
  },
  paymentMethodName: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
  farePriceBlock: {
    alignItems: 'flex-end',
  },
  farePriceBefore: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    textDecorationLine: 'line-through',
  },
  farePriceText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
  },
  footerButtons: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  cancelTripButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  cancelTripText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
});
