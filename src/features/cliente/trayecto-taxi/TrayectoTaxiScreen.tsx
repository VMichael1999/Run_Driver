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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, type LatLng } from 'react-native-maps';
import type { ClienteStackParamList } from '@navigation/types';
import { useTaxiStore } from '@store/useTaxiStore';
import { CalificacionModal } from '@shared/components/card/CalificacionModal';
import { UserNetworkAvatar } from '@shared/components/avatar/UserNetworkAvatar';
import { LegacyImages } from '@shared/assets/legacyAssets';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLLAPSED_HEIGHT = 428;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.56;

type Nav = NativeStackNavigationProp<ClienteStackParamList, 'TrayectoTaxi'>;

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
  const { activeTrip, endTrip } = useTaxiStore();
  const [ratingVisible, setRatingVisible] = React.useState(false);
  const driver = activeTrip?.driver;
  const request = activeTrip?.request;
  const mapRef = React.useRef<MapView | null>(null);
  const sheetHeight = React.useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const currentHeightRef = React.useRef(COLLAPSED_HEIGHT);
  const dragStartHeightRef = React.useRef(COLLAPSED_HEIGHT);

  if (!activeTrip || !driver || !request) return null;

  const region = {
    latitude: request.origin.position.latitude,
    longitude: request.origin.position.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const routeCoords: LatLng[] = [
    request.origin.position,
    ...request.routePoints,
    request.destination.position,
  ];

  const fitRouteToMap = React.useCallback((activeSheetHeight?: number) => {
    if (!mapRef.current || routeCoords.length < 2) return;

    mapRef.current.fitToCoordinates(routeCoords, {
      edgePadding: {
        top: insets.top + 96,
        right: 56,
        bottom: Math.round((activeSheetHeight ?? currentHeightRef.current) + 84),
        left: 56,
      },
      animated: true,
    });
  }, [insets.top, routeCoords]);

  const animateSheet = React.useCallback((toValue: number) => {
    currentHeightRef.current = toValue;
    Animated.spring(sheetHeight, {
      toValue,
      useNativeDriver: false,
      tension: 90,
      friction: 14,
    }).start(() => {
      fitRouteToMap(toValue);
    });
  }, [fitRouteToMap, sheetHeight]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      fitRouteToMap(COLLAPSED_HEIGHT);
    }, 250);

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
            EXPANDED_HEIGHT,
          );
          sheetHeight.setValue(nextHeight);
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

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        <Marker coordinate={request.origin.position} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.originMarker}>
            <View style={styles.markerInnerDot} />
          </View>
        </Marker>
        <Marker coordinate={request.destination.position} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.destinationMarker}>
            <View style={styles.markerInnerDot} />
          </View>
        </Marker>
        {routeCoords.length > 1 ? (
          <Polyline coordinates={routeCoords} strokeColor="#111111" strokeWidth={5} />
        ) : null}
      </MapView>

      <TouchableOpacity
        style={[styles.sosButton, { top: insets.top + Spacing.md }]}
        onPress={() => Alert.alert('SOS', 'Opciones de ayuda pendientes de conectar.')}
        activeOpacity={0.85}
      >
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>

      <View pointerEvents="box-none" style={styles.floatingLayer}>
        <TouchableOpacity
          style={[styles.locateButton, { bottom: currentHeightRef.current + 24 }]}
          onPress={() => fitRouteToMap()}
          activeOpacity={0.85}
        >
          <Ionicons name="locate-outline" size={18} color="#42526b" />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.panel, { height: sheetHeight, paddingBottom: insets.bottom + Spacing.lg }]}>
        <View style={styles.etaBar}>
          <View style={styles.etaLeft}>
            <Ionicons name="hourglass-outline" size={16} color={Colors.white} />
            <Text style={styles.etaText}>El conductor llegara en</Text>
          </View>
          <View style={styles.etaChip}>
            <Text style={styles.etaChipText}>{driver.etaMinutes.toFixed(2)} min</Text>
          </View>
        </View>

        <View {...panResponder.panHandlers} style={styles.dragArea}>
          <View style={styles.handle} />
        </View>

        <ScrollView
          style={styles.panelScroll}
          contentContainerStyle={styles.panelScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentInset}>
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleCopy}>
                <Text style={styles.plateNumber}>{driver.vehiclePlate}</Text>
                <Text style={styles.vehicleMeta}>
                  {driver.vehicleModel} • {driver.vehicleColor}
                </Text>
              </View>
              <View style={styles.vehicleRight}>
                <Image source={LegacyImages.carEstandar} style={styles.vehicleImage} resizeMode="contain" />
                <View style={styles.vehicleSizePill}>
                  <Text style={styles.vehicleSizeText}>Tamano medio</Text>
                </View>
              </View>
            </View>

            <View style={styles.driverRow}>
              <View style={styles.driverInfo}>
                <View style={styles.driverAvatarColumn}>
                  <UserNetworkAvatar imageUrl={driver.imageUrl} radius={20} />
                  <View style={styles.ratingTag}>
                    <Ionicons name="star" size={11} color="#f5b301" />
                    <Text style={styles.ratingTagText}>{driver.rating.toFixed(1)}</Text>
                  </View>
                </View>
                <View style={styles.driverTextWrap}>
                  <Text style={styles.driverName}>{driver.driverName}</Text>
                  <Text style={styles.driverBadge}>Conductor mejor valorado</Text>
                </View>
              </View>
              <View style={styles.driverActions}>
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.85}>
                  <Ionicons name="call-outline" size={18} color={Colors.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.85}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.white} />
                  <View style={styles.notificationDot} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionDivider} />

          <View style={styles.routeDetailRow}>
            <View style={styles.routeIconColumn}>
              <View style={styles.routePinOutline} />
              <View style={styles.routeDashedLine} />
              <View style={styles.routePinSolid} />
            </View>
            <View style={styles.routeTextColumn}>
              <View style={styles.routeLineItem}>
                <Text style={styles.routeLabel}>Punto de inicio</Text>
                <Text style={styles.routeValue}>{request.origin.placeName}</Text>
              </View>
              <View style={styles.routeLineItem}>
                <Text style={styles.routeLabel}>Tu destino</Text>
                <Text style={styles.routeValue}>{request.destination.placeName}</Text>
              </View>
              <View style={styles.routeLineItem}>
                <Text style={styles.routeLabel}>Metodo de pago</Text>
                <View style={styles.paymentMethodRow}>
                  <Image
                    source={getPaymentMethodImage(request.paymentMethod.mode)}
                    style={styles.paymentMethodImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.routeValue}>{request.paymentMethod.mode}</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.endButton}
              onPress={() => setRatingVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.endButtonText}>Finalizar viaje</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

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
        vehicleImageSource={LegacyImages.carEstandar}
        onClose={() => setRatingVisible(false)}
        onSend={() => {
          setRatingVisible(false);
          endTrip();
          navigation.replace('ClienteHome');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dfe7f3',
  },
  sosButton: {
    position: 'absolute',
    right: Spacing.lg,
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: '#ff4d46',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  sosText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    color: Colors.white,
  },
  floatingLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  locateButton: {
    position: 'absolute',
    right: Spacing.lg,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  etaBar: {
    backgroundColor: '#07090d',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 0,
    marginBottom: 0,
    ...Shadow.md,
  },
  etaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  etaText: {
    color: Colors.white,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  etaChip: {
    backgroundColor: '#23272f',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  etaChipText: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: 12,
  },
  originMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  destinationMarker: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  markerInnerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 0,
    paddingTop: 2,
    ...Shadow.lg,
  },
  dragArea: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 6,
  },
  handle: {
    width: 58,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#d8deea',
  },
  panelScroll: {
    flex: 1,
  },
  panelScrollContent: {
    paddingBottom: 0,
  },
  contentInset: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: 10,
  },
  vehicleCard: {
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f6',
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  vehicleCopy: {
    flex: 1,
  },
  plateNumber: {
    color: '#09101d',
    fontFamily: FontFamily.bold,
    fontSize: 18,
    marginBottom: 2,
  },
  vehicleMeta: {
    color: '#4f5e77',
    fontFamily: FontFamily.regular,
    fontSize: 12,
  },
  vehicleRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 12,
  },
  vehicleImage: {
    width: 88,
    height: 40,
    marginBottom: 4,
  },
  vehicleSizePill: {
    backgroundColor: '#3146ff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  vehicleSizeText: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: 9,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  driverAvatarColumn: {
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  driverTextWrap: {
    flex: 1,
    paddingTop: 2,
  },
  driverName: {
    color: '#09101d',
    fontFamily: FontFamily.bold,
    fontSize: 16,
  },
  driverBadge: {
    marginTop: 2,
    color: '#6b7a90',
    fontFamily: FontFamily.regular,
    fontSize: 12,
  },
  driverActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
    paddingTop: 4,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a0c10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b30',
  },
  ratingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff6cf',
    borderRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 6,
  },
  ratingTagText: {
    color: '#775400',
    fontFamily: FontFamily.bold,
    fontSize: 11,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#eef2f7',
  },
  routeDetailRow: {
    flexDirection: 'row',
  },
  routeIconColumn: {
    alignItems: 'center',
    paddingTop: 6,
    marginRight: Spacing.sm,
  },
  routePinOutline: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 2,
    borderColor: '#111111',
    backgroundColor: Colors.white,
  },
  routeDashedLine: {
    width: 1,
    height: 34,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#c5ccd8',
    marginVertical: 4,
  },
  routePinSolid: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#111111',
  },
  routeTextColumn: {
    flex: 1,
    gap: 8,
  },
  routeLineItem: {
    paddingBottom: 0,
  },
  routeLabel: {
    color: '#8b98aa',
    fontFamily: FontFamily.regular,
    fontSize: 11,
    marginBottom: 1,
  },
  routeValue: {
    color: '#09101d',
    fontFamily: FontFamily.bold,
    fontSize: 13,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentMethodImage: {
    width: 22,
    height: 22,
  },
  endButton: {
    backgroundColor: '#ff4747',
    borderRadius: BorderRadius.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  endButtonText: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    color: Colors.white,
  },
});
