import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { getCurrentLocationMarker, getPlaceNameFromCoordinates } from '@shared/utils/locationUtils';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';

type Props = NativeStackScreenProps<ConductorStackParamList, 'ConfirmarPuntoPartida'>;

const LIMA_REGION: Region = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export function ConfirmarPuntoPartidaScreen({ route, navigation }: Props) {
  const routePoints = route.params?.routePoints ?? [];
  const mapRef = React.useRef<MapView | null>(null);
  const insets = useSafeAreaInsets();

  const [selectedRegion, setSelectedRegion] = React.useState<Region>(LIMA_REGION);
  const [isResolving, setIsResolving] = React.useState(false);
  const [isConfirming, setIsConfirming] = React.useState(false);
  const pinLift = React.useRef(new Animated.Value(0)).current;

  const animatePin = React.useCallback(
    (toValue: number) => {
      Animated.timing(pinLift, {
        toValue,
        duration: 180,
        useNativeDriver: true,
      }).start();
    },
    [pinLift],
  );

  React.useEffect(() => {
    let active = true;
    void (async () => {
      const current = await getCurrentLocationMarker();
      if (!active || !current) return;
      const next: Region = {
        latitude: current.position.latitude,
        longitude: current.position.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setSelectedRegion(next);
      mapRef.current?.animateToRegion(next, 250);
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleRegionChangeComplete = async (region: Region) => {
    setSelectedRegion(region);
    animatePin(0);
    setIsResolving(true);
    try {
      await getPlaceNameFromCoordinates(region.latitude, region.longitude);
    } finally {
      setIsResolving(false);
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      navigation.goBack();
    } finally {
      setIsConfirming(false);
    }
  };

  const handleRecenter = async () => {
    const current = await getCurrentLocationMarker();
    if (!current) return;
    const next: Region = {
      latitude: current.position.latitude,
      longitude: current.position.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
    setSelectedRegion(next);
    mapRef.current?.animateToRegion(next, 400);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_GOOGLE}
          initialRegion={LIMA_REGION}
          onRegionChange={() => animatePin(-16)}
          onRegionChangeComplete={(r) => void handleRegionChangeComplete(r)}
          showsMyLocationButton={false}
        >
          {routePoints.length >= 2 && (
            <Polyline
              coordinates={routePoints}
              strokeColor={Colors.primary}
              strokeWidth={4}
            />
          )}
        </MapView>

        <View pointerEvents="none" style={styles.pinCenterWrap}>
          <Animated.View style={[styles.pinMarkerWrap, { transform: [{ translateY: pinLift }] }]}>
            <View style={styles.pinHead} />
            <View style={styles.pinStem} />
          </Animated.View>
          <View style={styles.pinShadowDot} />
        </View>

        <View style={[styles.fabColumn, { top: insets.top + Spacing.md }]}>
          <TouchableOpacity style={styles.fabButton} onPress={() => void handleRecenter()}>
            <Ionicons name="refresh" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.fabButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {isResolving && (
          <ActivityIndicator
            style={styles.resolvingIndicator}
            size="small"
            color={Colors.primary}
          />
        )}
      </View>

      <View style={[styles.panel, { paddingBottom: insets.bottom + Spacing.md }]}>
        <View style={styles.panelTopRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.gpsButton} onPress={() => void handleRecenter()}>
            <Ionicons name="locate-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Confirmar punto de origen</Text>
        <Text style={styles.subtitle}>
          Desplaza el mapa para establecer tu punto de origen.
        </Text>

        <TouchableOpacity
          style={[styles.confirmButton, isConfirming && styles.confirmButtonDisabled]}
          onPress={() => void handleConfirm()}
          activeOpacity={0.88}
          disabled={isConfirming}
        >
          <Text style={styles.confirmButtonText}>
            {isConfirming ? 'CONFIRMANDO...' : 'CONFIRMAR'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
  fabColumn: {
    position: 'absolute',
    right: Spacing.md,
    gap: Spacing.sm,
  },
  fabButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  resolvingIndicator: {
    position: 'absolute',
    top: Spacing.lg,
    alignSelf: 'center',
  },
  panel: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    ...Shadow.lg,
  },
  panelTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  confirmButton: {
    backgroundColor: '#1d5fa8',
    borderRadius: BorderRadius.full,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    letterSpacing: 0.5,
  },
});
