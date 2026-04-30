import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ClienteStackParamList } from '@navigation/types';
import { BackAppBar } from '@shared/components/appbar/BackAppBar';
import { getRoutePolyline } from '@shared/services/googleMapsService';
import { useRideDraftStore } from '@store/useRideDraftStore';
import { useFavoriteAddressesStore } from '@store/useFavoriteAddressesStore';
import { useTaxiStore } from '@store/useTaxiStore';
import { getCurrentLocationMarker, getPlaceNameFromCoordinates } from '@shared/utils/locationUtils';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';

type Props = NativeStackScreenProps<ClienteStackParamList, 'SelectAddressOnMap'>;

const LIMA_REGION: Region = {
  latitude: -11.9897,
  longitude: -77.0666,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export function SelectAddressOnMapScreen({ route, navigation }: Props) {
  const target = route.params.target;
  const saveFavorite = route.params.saveFavorite === true;
  const origin = useRideDraftStore((s) => s.origin);
  const setOrigin = useRideDraftStore((s) => s.setOrigin);
  const setDestination = useRideDraftStore((s) => s.setDestination);
  const addExtraStop = useRideDraftStore((s) => s.addExtraStop);
  const setRoutePoints = useRideDraftStore((s) => s.setRoutePoints);
  const paymentMethod = useRideDraftStore((s) => s.paymentMethod);
  const comment = useRideDraftStore((s) => s.comment);
  const addFavorite = useFavoriteAddressesStore((s) => s.addFavorite);
  const setRequest = useTaxiStore((s) => s.setRequest);
  const mapRef = React.useRef<MapView | null>(null);

  const initialRegion = React.useMemo<Region>(() => {
    return origin
      ? {
          latitude: origin.position.latitude,
          longitude: origin.position.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }
      : LIMA_REGION;
  }, [origin]);

  const [selectedRegion, setSelectedRegion] = React.useState<Region>(initialRegion);
  const [selectedAddress, setSelectedAddress] = React.useState('Buscando direccion...');
  const [isResolving, setIsResolving] = React.useState(false);
  const [isConfirming, setIsConfirming] = React.useState(false);
  const pinLift = React.useRef(new Animated.Value(0)).current;

  const animatePin = React.useCallback((toValue: number) => {
    Animated.timing(pinLift, {
      toValue,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [pinLift]);

  const resolveAddress = React.useCallback(async (region: Region) => {
    setIsResolving(true);
    try {
      const placeName = await getPlaceNameFromCoordinates(region.latitude, region.longitude);
      setSelectedAddress(placeName);
    } catch {
      setSelectedAddress('Ubicacion seleccionada');
    } finally {
      setIsResolving(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;

    void (async () => {
      if (origin) {
        setSelectedRegion(initialRegion);
        setSelectedAddress(origin.placeName);
        return;
      }

      const currentLocation = await getCurrentLocationMarker();
      if (!active || !currentLocation) {
        await resolveAddress(initialRegion);
        return;
      }

      const nextRegion = {
        latitude: currentLocation.position.latitude,
        longitude: currentLocation.position.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setSelectedRegion(nextRegion);
      setSelectedAddress(currentLocation.placeName);
      mapRef.current?.animateToRegion(nextRegion, 250);
    })();

    return () => {
      active = false;
    };
  }, [initialRegion, origin, resolveAddress]);

  const confirmSelection = async () => {
    const selectedLocation = {
      placeName: selectedAddress,
      position: {
        latitude: selectedRegion.latitude,
        longitude: selectedRegion.longitude,
      },
    };

    setIsConfirming(true);
    try {
      if (saveFavorite) {
        addFavorite(selectedLocation);
        navigation.popToTop();
        return;
      }

      if (target === 'origin') {
        setOrigin(selectedLocation);
        setRoutePoints([]);
        navigation.goBack();
        return;
      }

      if (target === 'extra-stop') {
        addExtraStop(selectedLocation);
        navigation.goBack();
        return;
      }

      setDestination(selectedLocation);

      const effectiveOrigin = origin ?? (await getCurrentLocationMarker());

      if (effectiveOrigin) {
        if (!origin) {
          setOrigin(effectiveOrigin);
        }

        const points = await getRoutePolyline(effectiveOrigin.position, selectedLocation.position);
        setRoutePoints(points);
        setRequest({
          origin: effectiveOrigin,
          destination: selectedLocation,
          routePoints: points,
          paymentMethod,
          comment: comment.trim() || undefined,
        });
        navigation.replace('SolicitudTaxi');
        return;
      }

      setRoutePoints([]);
      navigation.goBack();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackAppBar title={saveFavorite ? 'Agregar favorita' : target === 'origin' ? 'Elegir origen' : target === 'extra-stop' ? 'Elegir parada' : 'Elegir destino'} />

      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          onRegionChange={() => {
            animatePin(-16);
          }}
          onRegionChangeComplete={(region) => {
            setSelectedRegion(region);
            animatePin(0);
            void resolveAddress(region);
          }}
          showsUserLocation
          showsMyLocationButton={false}
        />

        <View pointerEvents="none" style={styles.pinCenterWrap}>
          <Animated.View style={[styles.pinMarkerWrap, { transform: [{ translateY: pinLift }] }]}>
            <View style={styles.pinHead} />
            <View style={styles.pinStem} />
          </Animated.View>
          <View style={styles.pinShadowDot} />
        </View>

        <View style={styles.addressCard}>
          <View style={styles.addressIconWrap}>
            <Ionicons name="location" size={16} color={Colors.primary} />
          </View>
          <View style={styles.addressTextWrap}>
            <Text style={styles.addressLabel}>Ubicacion seleccionada</Text>
            <Text style={styles.addressValue} numberOfLines={2}>
              {selectedAddress}
            </Text>
          </View>
          {isResolving ? <ActivityIndicator size="small" color={Colors.primary} /> : null}
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={() => void confirmSelection()} activeOpacity={0.88} disabled={isConfirming}>
          <Text style={styles.confirmButtonText}>{isConfirming ? 'Confirmando...' : 'Confirmar direccion'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  mapWrap: {
    flex: 1,
  },
  pinCenterWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -18,
    marginTop: -55,
    alignItems: 'center',
  },
  pinMarkerWrap: {
    alignItems: 'center',
  },
  pinHead: {
    backgroundColor: Colors.white,
    width: 36,
    height: 36,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 12,
    borderColor: Colors.primary,
  },
  pinStem: {
    width: 4,
    height: 20,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  pinShadowDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: Colors.black,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.38,
    shadowRadius: 0,
    elevation: 1,
  },
  addressCard: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: 108,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadow.md,
  },
  addressIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eaf2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  addressTextWrap: {
    flex: 1,
  },
  addressLabel: {
    color: '#64748b',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    marginBottom: 2,
  },
  addressValue: {
    color: '#1f2937',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  confirmButton: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: Spacing.lg,
    backgroundColor: '#1d5fa8',
    borderRadius: BorderRadius.full,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  confirmButtonText: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
});
