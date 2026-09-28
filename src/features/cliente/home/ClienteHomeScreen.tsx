import React from 'react';
import {
  ActivityIndicator,
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ClienteStackParamList } from '@navigation/types';
import { useFocusEffect } from '@react-navigation/native';
import { useClienteHome } from './hooks/useClienteHome';
import { SwipeableFavoriteItem } from './components/SwipeableFavoriteItem';
import { AppDrawer } from '@shared/components/drawer/AppDrawer';
import { useAuthStore } from '@store/useAuthStore';
import { useFavoriteAddressesStore } from '@store/useFavoriteAddressesStore';
import { getCurrentLocationMarker, getQuickCurrentLocationMarker } from '@shared/utils/locationUtils';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';
import { StatusPill } from '@shared/components/ui/StatusPill';

type Nav = NativeStackNavigationProp<ClienteStackParamList, 'ClienteHome'>;

const LIMA_REGION: Region = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

interface HomeServiceAction {
  id: 'ride' | 'rental' | 'outstation';
  label: string;
  subtitle: string;
  image: ReturnType<typeof require>;
  isAuction?: boolean;
}

const homeServiceActions: HomeServiceAction[] = [
  {
    id: 'ride',
    label: 'Viaje',
    subtitle: 'Precio fijo',
    image: require('../../../../assets/servicios/Confort.png'),
  },
  {
    id: 'rental',
    label: 'Subasta',
    subtitle: 'Tú propones',
    image: require('../../../../assets/servicios/Subasta.png'),
    isAuction: true,
  },
  {
    id: 'outstation',
    label: 'Programar',
    subtitle: 'Para más tarde',
    image: require('../../../../assets/servicios/Espera y Ahorra.png'),
  },
];

export function ClienteHomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const mapRef = React.useRef<MapView | null>(null);
  const [homeScrollEnabled, setHomeScrollEnabled] = React.useState(true);
  const [isCenteringMap, setIsCenteringMap] = React.useState(false);
  const [selectedFavoriteId, setSelectedFavoriteId] = React.useState<string | null>(null);

  const {
    origin,
    selectedHomeTab,
    setSelectedHomeTab,
    requestTaxi,
    isRouting,
    recalculateRoute,
    setOrigin,
    setDestination,
  } = useClienteHome();

  const favorites = useFavoriteAddressesStore((s) => s.favorites);
  const removeFavorite = useFavoriteAddressesStore((s) => s.removeFavorite);
  const logout = useAuthStore((s) => s.logout);
  const phone = useAuthStore((s) => s.phone);
  const countryCode = useAuthStore((s) => s.countryCode);
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const drawerProgress = React.useRef(new Animated.Value(0)).current;

  const phoneLabel = phone ? `${countryCode} ${phone}` : '+51 999 999 999';
  const drawerSceneOffset = Math.round(width * 0.54);

  React.useEffect(() => {
    Animated.timing(drawerProgress, {
      toValue: drawerOpen ? 1 : 0,
      duration: drawerOpen ? 280 : 220,
      useNativeDriver: false,
    }).start();
  }, [drawerOpen, drawerProgress]);

  const animatedSceneStyle = {
    borderRadius: drawerProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 24],
    }),
    transform: [
      { perspective: 900 },
      {
        translateX: drawerProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, drawerSceneOffset],
        }),
      },
      {
        scale: drawerProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.86],
        }),
      },
      {
        rotateY: drawerProgress.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '-9deg'],
        }),
      },
    ],
  };

  React.useEffect(() => {
    let active = true;
    void (async () => {
      const currentLocation = await getCurrentLocationMarker();
      if (active && currentLocation) {
        setOrigin(currentLocation);
      }
    })();
    return () => {
      active = false;
    };
  }, [setOrigin]);

  React.useEffect(() => {
    if (!origin) return;
    const nextRegion: Region = {
      latitude: origin.position.latitude,
      longitude: origin.position.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    };
    mapRef.current?.animateToRegion(nextRegion, 420);
  }, [origin]);

  useFocusEffect(
    React.useCallback(() => {
      void recalculateRoute();
      if (!origin) {
        void (async () => {
          const currentLocation = await getCurrentLocationMarker();
          if (currentLocation) setOrigin(currentLocation);
        })();
      }
    }, [origin, recalculateRoute, setOrigin]),
  );

  const handleSearchPress = () => {
    navigation.navigate('SearchAddress', { target: 'destination' });
  };

  const handleServiceCardPress = (action: HomeServiceAction) => {
    setSelectedHomeTab(action.id);
    if (action.id === 'outstation') {
      navigation.navigate('ProgramarViaje');
    } else {
      navigation.navigate('SearchAddress', { target: 'destination' });
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.drawer }]}>
      <Animated.View style={[styles.scene, { backgroundColor: theme.background }, animatedSceneStyle]}>
        <ScrollView
          style={[styles.container, { backgroundColor: theme.background }]}
          contentContainerStyle={{
            paddingTop: insets.top + Spacing.sm,
            paddingBottom: insets.bottom + Spacing['2xl'],
          }}
          scrollEnabled={homeScrollEnabled}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar: Drawer trigger & Status/Promo Pill */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={[styles.menuButton, { backgroundColor: theme.surface }, Shadow.raise]}
              activeOpacity={0.8}
              onPress={() => setDrawerOpen(true)}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Abrir menú lateral"
            >
              <Ionicons name="menu" size={22} color={theme.text} />
            </TouchableOpacity>

            <StatusPill
              label="Hoy 15% menos"
              status="online"
              onPress={() => navigation.navigate('Promociones')}
            />

            <TouchableOpacity
              style={[styles.menuButton, { backgroundColor: theme.surface }, Shadow.raise]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Perfil')}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Ver mi perfil"
            >
              <Ionicons name="person-outline" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Map Preview Card */}
          <View style={[styles.mapCard, { backgroundColor: theme.surface }, Shadow.raise]}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              initialRegion={LIMA_REGION}
              scrollEnabled
              zoomEnabled
              rotateEnabled={false}
              pitchEnabled={false}
              showsUserLocation
              showsMyLocationButton={false}
              onTouchStart={() => setHomeScrollEnabled(false)}
              onTouchEnd={() => setHomeScrollEnabled(true)}
              onTouchCancel={() => setHomeScrollEnabled(true)}
            >
              {origin ? (
                <Marker coordinate={origin.position} anchor={{ x: 0.5, y: 0.5 }}>
                  <View style={styles.originMarker}>
                    <View style={styles.originMarkerDot} />
                  </View>
                </Marker>
              ) : null}
            </MapView>

            <TouchableOpacity
              style={[styles.mapFab, { backgroundColor: theme.surface }, Shadow.raise]}
              onPress={async () => {
                if (isCenteringMap) return;
                setIsCenteringMap(true);
                try {
                  const current = await getQuickCurrentLocationMarker();
                  if (!current) return;
                  mapRef.current?.animateToRegion(
                    {
                      latitude: current.position.latitude,
                      longitude: current.position.longitude,
                      latitudeDelta: 0.02,
                      longitudeDelta: 0.02,
                    },
                    260,
                  );
                } finally {
                  setIsCenteringMap(false);
                }
              }}
              activeOpacity={0.85}
              disabled={isCenteringMap}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Centrar mapa en mi ubicación actual"
            >
              {isCenteringMap ? (
                <ActivityIndicator size="small" color={theme.text} />
              ) : (
                <Ionicons name="navigate" size={18} color={theme.text} />
              )}
            </TouchableOpacity>
          </View>

          {/* Floating Search Sheet — "¿A dónde vas?" */}
          <View style={[styles.searchPanel, { backgroundColor: theme.surface }, Shadow.raise]}>
            <TouchableOpacity
              style={[styles.searchTrigger, { backgroundColor: theme.surfaceMuted, borderColor: theme.line }]}
              onPress={handleSearchPress}
              activeOpacity={0.85}
              accessible
              accessibilityRole="button"
              accessibilityLabel="¿A dónde vas? Toca para buscar dirección de destino"
            >
              <View style={styles.searchPrompt}>
                <Ionicons name="search" size={20} color={theme.text} />
                <Text style={[styles.searchPromptText, { color: theme.text }]}>¿A dónde vas?</Text>
              </View>

              <View style={[styles.nowPill, { backgroundColor: theme.surface, borderColor: theme.line }]}>
                <Ionicons name="time-outline" size={14} color={theme.textMuted} />
                <Text style={[styles.nowPillText, { color: theme.text }]}>Ahora</Text>
              </View>
            </TouchableOpacity>

            {/* Favoritos / Destinos frecuentes */}
            <View style={styles.favoritesSection}>
              <View style={styles.favoritesHeader}>
                <Text style={[styles.favoritesTitle, { color: theme.textMuted }]}>Destinos frecuentes</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('SearchAddress', { target: 'destination', saveFavorite: true })}
                  activeOpacity={0.7}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Agregar nueva dirección favorita"
                >
                  <Text style={[styles.addFavoriteLink, { color: theme.text }]}>+ Agregar</Text>
                </TouchableOpacity>
              </View>

              {favorites.length > 0 ? (
                <View style={styles.favoriteList}>
                  {favorites.slice(0, 3).map((favorite) => (
                    <SwipeableFavoriteItem
                      key={favorite.id}
                      id={favorite.id}
                      placeName={favorite.placeName}
                      loading={selectedFavoriteId === favorite.id}
                      disabled={selectedFavoriteId !== null || isRouting}
                      onPress={async () => {
                        if (selectedFavoriteId) return;
                        setSelectedFavoriteId(favorite.id);
                        try {
                          const selectedOrigin = origin ?? (await getQuickCurrentLocationMarker());
                          if (!selectedOrigin) return;
                          setOrigin(selectedOrigin);
                          setDestination(favorite);
                          const didCreate = await requestTaxi(favorite, selectedOrigin);
                          if (didCreate) {
                            navigation.navigate('SolicitudTaxi');
                          }
                        } finally {
                          setSelectedFavoriteId(null);
                        }
                      }}
                      onDelete={removeFavorite}
                    />
                  ))}
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.emptyFavoriteRow, { backgroundColor: theme.surfaceMuted }]}
                  onPress={() => navigation.navigate('SearchAddress', { target: 'destination', saveFavorite: true })}
                  activeOpacity={0.8}
                >
                  <Ionicons name="bookmark-outline" size={18} color={theme.textMuted} />
                  <Text style={[styles.emptyFavoriteText, { color: theme.textMuted }]}>
                    Guarda Casa o Trabajo para viajar en un solo toque
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Las 3 tarjetas de servicio diferenciadas (Resuelve #4 y #11) */}
            <View style={styles.servicesGrid}>
              {homeServiceActions.map((action) => {
                const isSelected = selectedHomeTab === action.id;
                return (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.serviceTile,
                      {
                        backgroundColor: isSelected ? theme.surfaceMuted : theme.surface,
                        borderColor: action.isAuction ? theme.sig : theme.line,
                        borderWidth: action.isAuction ? 2 : 1,
                      },
                    ]}
                    onPress={() => handleServiceCardPress(action)}
                    activeOpacity={0.85}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`Servicio ${action.label}: ${action.subtitle}`}
                  >
                    {action.isAuction ? (
                      <View style={[styles.auctionBadge, { backgroundColor: theme.sig }]}>
                        <Text style={[styles.auctionBadgeText, { color: theme.onSig }]}>Popular</Text>
                      </View>
                    ) : null}
                    <Image source={action.image} style={styles.serviceImage} resizeMode="contain" />
                    <Text style={[styles.serviceLabel, { color: theme.text }]}>{action.label}</Text>
                    <Text style={[styles.serviceSubtitle, { color: theme.textMuted }]}>{action.subtitle}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      <AppDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={(route) => navigation.navigate(route as never)}
        onLogout={logout}
        phoneLabel={phoneLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scene: {
    flex: 1,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xs,
    marginBottom: Spacing.md,
  },
  map: {
    height: 240,
    borderRadius: BorderRadius.xl,
  },
  mapFab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  originMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(21, 122, 69, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  originMarkerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.online,
  },
  searchPanel: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  searchTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  searchPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  searchPromptText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    letterSpacing: -0.3,
  },
  nowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  nowPillText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  favoritesSection: {
    gap: Spacing.sm,
  },
  favoritesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  favoritesTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  addFavoriteLink: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  favoriteList: {
    marginTop: Spacing.xs,
  },
  emptyFavoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  emptyFavoriteText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    flex: 1,
  },
  servicesGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  serviceTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.xl,
    position: 'relative',
    minHeight: 110,
    justifyContent: 'center',
  },
  auctionBadge: {
    position: 'absolute',
    top: -8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  auctionBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  serviceImage: {
    width: 60,
    height: 38,
    marginBottom: 6,
  },
  serviceLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  serviceSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    marginTop: 1,
  },
});
