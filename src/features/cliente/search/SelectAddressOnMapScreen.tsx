import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ClienteStackParamList } from '@navigation/types';
import { BackAppBar } from '@shared/components/appbar/BackAppBar';
import { buildTaxiRequest } from '@features/cliente/solicitud-taxi/utils/routeRequest';
import { useRideDraftStore } from '@store/useRideDraftStore';
import { useFavoriteAddressesStore } from '@store/useFavoriteAddressesStore';
import { useTaxiStore } from '@store/useTaxiStore';
import { useScheduledTripsStore } from '@store/useScheduledTripsStore';
import { getCurrentLocationMarker, getPlaceNameFromCoordinates } from '@shared/utils/locationUtils';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';
import { AppButton } from '@shared/components/ui/AppButton';
import { useThemeStore } from '@store/useThemeStore';
import { getMapStyle } from '@theme/mapStyles';

type Props = NativeStackScreenProps<ClienteStackParamList, 'SelectAddressOnMap'>;

const LIMA_REGION: Region = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export function SelectAddressOnMapScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const isDark = useThemeStore((s) => s.isDark);
  const target = route.params.target;
  const saveFavorite = route.params.saveFavorite === true;
  const editing = route.params.editing === true;
  const scheduledTripId = route.params.scheduledTripId;
  const addScheduledStop = useScheduledTripsStore((s) => s.addStop);

  const origin = useRideDraftStore((s) => s.origin);
  const extraStops = useRideDraftStore((s) => s.extraStops);
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
  const [selectedAddress, setSelectedAddress] = React.useState('Buscando dirección...');
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
      setSelectedAddress('Ubicación seleccionada');
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

    // Vuelve a la pantalla que abrió la búsqueda: si se llegó desde "Buscar dirección", también la cierra.
    const routes = navigation.getState().routes;
    const cameFromSearch = routes[routes.length - 2]?.name === 'SearchAddress';
    const returnToOpener = () => navigation.pop(cameFromSearch ? 2 : 1);

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
        // Desde la solicitud se vuelve directo a ella (se salta la búsqueda de dirección).
        if (editing) returnToOpener();
        else navigation.goBack();
        return;
      }

      if (target === 'extra-stop') {
        if (scheduledTripId) addScheduledStop(scheduledTripId, selectedLocation);
        else addExtraStop(selectedLocation);
        // Desde "Tu viaje" se vuelve a esa misma búsqueda, que sigue con el destino.
        if (editing || scheduledTripId) returnToOpener();
        else navigation.goBack();
        return;
      }

      setDestination(selectedLocation);
      if (editing) {
        returnToOpener();
        return;
      }

      const effectiveOrigin = origin ?? (await getCurrentLocationMarker());

      if (effectiveOrigin) {
        if (!origin) {
          setOrigin(effectiveOrigin);
        }

        const request = await buildTaxiRequest({
          origin: effectiveOrigin,
          destination: selectedLocation,
          stops: extraStops,
          paymentMethod,
          comment,
        });
        setRoutePoints(request.routePoints);
        setRequest(request);
        // Se cierran el mapa y la búsqueda de dirección: al volver desde los servicios se llega al inicio.
        navigation.dispatch((state) => {
          const kept = state.routes.slice(0, cameFromSearch ? -2 : -1);
          return CommonActions.reset({
            ...state,
            routes: [...kept, { key: `SolicitudTaxi-${Date.now()}`, name: 'SolicitudTaxi' }],
            index: kept.length,
          });
        });
        return;
      }

      setRoutePoints([]);
      navigation.goBack();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackAppBar
        title={
          saveFavorite
            ? 'Agregar favorita'
            : target === 'origin'
            ? 'Elegir origen'
            : target === 'extra-stop'
            ? 'Elegir parada'
            : 'Elegir en el mapa'
        }
      />

      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_GOOGLE}
          customMapStyle={getMapStyle(isDark)}
          userInterfaceStyle={isDark ? 'dark' : 'light'}
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

        {/* Pin central con animación de elevación */}
        <View pointerEvents="none" style={styles.pinCenterWrap}>
          <Animated.View style={[styles.pinMarkerWrap, { transform: [{ translateY: pinLift }] }]}>
            <View style={[styles.pinHead, { backgroundColor: theme.primary, borderColor: theme.surface }]}>
              <View style={[styles.pinDot, { backgroundColor: isDark ? theme.onPrimary : theme.sig }]} />
            </View>
            <View style={[styles.pinStem, { backgroundColor: theme.primary }]} />
          </Animated.View>
          <View style={styles.pinShadowDot} />
        </View>

        {/* Tarjeta de dirección seleccionada */}
        <View style={styles.bottomCardWrap}>
          <View style={[styles.addressCard, { backgroundColor: theme.surface, borderColor: theme.line }, Shadow.raise]}>
            <View style={[styles.addressIconWrap, { backgroundColor: theme.surfaceMuted }]}>
              <Ionicons name="location" size={18} color={theme.text} />
            </View>
            <View style={styles.addressTextWrap}>
              <Text style={[styles.addressLabel, { color: theme.textMuted }]}>Ubicación seleccionada</Text>
              <Text style={[styles.addressValue, { color: theme.text }]} numberOfLines={2}>
                {selectedAddress}
              </Text>
            </View>
            {isResolving ? <ActivityIndicator size="small" color={theme.primary} /> : null}
          </View>

          <AppButton
            label={isConfirming ? 'Confirmando...' : 'Confirmar dirección'}
            onPress={() => void confirmSelection()}
            disabled={isConfirming || isResolving}
            loading={isConfirming}
            variant="primary"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    justifyContent: 'center',
  },
  pinMarkerWrap: {
    alignItems: 'center',
  },
  pinHead: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pinStem: {
    width: 3,
    height: 14,
    marginTop: -1,
    borderRadius: 1.5,
  },
  pinShadowDot: {
    width: 12,
    height: 4,
    borderRadius: 6,
    backgroundColor: Colors.scrimSoft,
    marginTop: 2,
  },
  bottomCardWrap: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
  },
  addressIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressTextWrap: {
    flex: 1,
    gap: 2,
  },
  addressLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize['2xs'],
  },
  addressValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    lineHeight: 20,
  },
});
