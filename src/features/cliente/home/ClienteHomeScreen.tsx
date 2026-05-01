import React from 'react';
import { ActivityIndicator, Animated, View, Text, StyleSheet, TouchableOpacity, Image, Platform, ScrollView, useWindowDimensions } from 'react-native';
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

type Nav = NativeStackNavigationProp<ClienteStackParamList, 'ClienteHome'>;

const LIMA_REGION = {
  latitude: -11.9897,
  longitude: -77.0666,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const homeActions: Array<{ id: 'ride' | 'rental' | 'outstation'; label: string; image: any; subtitle?: string; badge?: string }> = [
  { id: 'ride', label: 'Viaje', image: require('../../../../assets/legacy/images/car.png'), badge: '10% DCTO' },
  { id: 'rental', label: 'Alquiler', image: require('../../../../assets/legacy/images/car.png'), subtitle: '15% DCTO' },
  { id: 'outstation', label: 'Fuera de ciudad', image: require('../../../../assets/legacy/images/car.png'), subtitle: '25% DCTO' },
];

export function ClienteHomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const mapRef = React.useRef<MapView | null>(null);
  const [homeScrollEnabled, setHomeScrollEnabled] = React.useState(true);
  const [isOriginSearched, setIsOriginSearched] = React.useState(false);
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

  const phoneLabel = phone ? `${countryCode} ${phone}` : '+51 000 000 000';
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
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    };

    mapRef.current?.animateToRegion(nextRegion, 420);
  }, [origin]);

  useFocusEffect(
    React.useCallback(() => {
      void recalculateRoute();

      if (!origin) {
        setIsOriginSearched(false);
        void (async () => {
          const currentLocation = await getCurrentLocationMarker();
          if (currentLocation) setOrigin(currentLocation);
        })();
      }
    }, [origin, recalculateRoute, setOrigin]),
  );

  const handleNowPress = React.useCallback(() => {
    setIsOriginSearched(true);
    navigation.navigate('SearchAddress', { target: 'origin' });
  }, [navigation]);

  return (
    <View style={[styles.root, { backgroundColor: theme.drawer }]}>
      <Animated.View style={[styles.scene, { backgroundColor: theme.background }, animatedSceneStyle]}>
        <ScrollView
          style={[styles.container, { backgroundColor: theme.background }]}
          contentContainerStyle={{ paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing['2xl'] }}
          scrollEnabled={homeScrollEnabled}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.headerIcon, { backgroundColor: theme.iconButton }]}
              activeOpacity={0.8}
              onPress={() => setDrawerOpen(true)}
            >
              <Ionicons name="menu" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.mapCard, { backgroundColor: theme.surface }]}>
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
              {isOriginSearched && origin ? (
                <Marker coordinate={origin.position} anchor={{ x: 0.5, y: 0.5 }}>
                  <View style={styles.searchedOriginMarker}>
                    <View style={styles.searchedOriginDot} />
                  </View>
                </Marker>
              ) : null}
            </MapView>
            <TouchableOpacity
              style={[styles.mapFab, { backgroundColor: theme.surface }]}
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
            >
              {isCenteringMap ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Ionicons name="navigate" size={18} color={theme.primary} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <TouchableOpacity style={[styles.searchBox, { backgroundColor: theme.surfaceMuted }]} onPress={() => navigation.navigate('SearchAddress', { target: 'destination' })} activeOpacity={0.85}>
              <Text style={[styles.searchPlaceholder, { color: theme.textMuted }]}>
                Buscar ruta
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.nowPill, { backgroundColor: theme.accent }]} onPress={handleNowPress} activeOpacity={0.85}>
              <Ionicons name="person-outline" size={14} color={Colors.white} />
              <Text style={styles.nowText}>{isRouting ? '...' : 'Ahora'}</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <View style={[styles.addressList, { backgroundColor: theme.surface }]}>
            <View style={styles.favoriteHeader}>
              <View style={styles.favoriteNotice}>
                <View style={[styles.favoriteNoticeIcon, { backgroundColor: theme.surfaceSoft }]}>
              <Ionicons name="bookmark-outline" size={18} color={theme.accent} />
                </View>
                <View style={styles.favoriteNoticeTextWrap}>
                  <Text style={[styles.favoriteNoticeTitle, { color: theme.text }]}>Direcciones favoritas</Text>
                  <Text style={[styles.favoriteNoticeText, { color: theme.textMuted }]}>
                    {favorites.length > 0 ? 'Toca una direccion para usarla en tu ruta.' : 'Agrega tus direcciones mas usadas.'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.addFavoriteButton, { backgroundColor: theme.accent }]}
                onPress={() => navigation.navigate('SearchAddress', { target: 'destination', saveFavorite: true })}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {favorites.length > 0 ? (
              <View style={styles.favoriteItems}>
                {favorites.map((favorite) => (
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
                        const selectedOrigin = origin ?? await getQuickCurrentLocationMarker();
                        if (!selectedOrigin) return;

                        setOrigin(selectedOrigin);
                        setDestination(favorite);
                        const didCreateRequest = await requestTaxi(favorite, selectedOrigin);
                        if (!didCreateRequest) return;

                        navigation.navigate('SolicitudTaxi');
                      } finally {
                        setSelectedFavoriteId(null);
                      }
                    }}
                    onDelete={removeFavorite}
                  />
                ))}
              </View>
            ) : null}
          </View>

          <View style={[styles.actionRow, { backgroundColor: theme.surface }]}>
            {homeActions.map((action) => {
              const active = selectedHomeTab === action.id;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.actionCard, active && { backgroundColor: theme.accent }]}
                  onPress={() => setSelectedHomeTab(action.id)}
                  activeOpacity={0.85}
                >
                  {action.badge ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{action.badge}</Text>
                    </View>
                  ) : null}
                  <Image source={action.image} style={styles.actionImage} resizeMode="contain" />
                  <Text style={[styles.actionTitle, { color: theme.text }, active && styles.actionTitleActive]}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={[styles.banner, { backgroundColor: theme.surface }]} activeOpacity={0.9}>
            <View style={styles.bannerTextWrap}>
              <Text style={[styles.bannerTitle, { color: theme.text }]}>Invierte hoy y asegura un mejor manana para ti cada dia.</Text>
              <Text style={[styles.bannerLink, { color: theme.accent }]}>Invierte ahora</Text>
            </View>
            <Image source={require('../../../../app-icons/ic_launcher-web.png')} style={styles.bannerImage} resizeMode="contain" />
          </TouchableOpacity>
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
    backgroundColor: '#1a2f4e',
  },
  scene: {
    flex: 1,
    backgroundColor: '#f4f7fb',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: -10, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    justifyContent: 'flex-start',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  mapCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing.sm,
    ...Shadow.md,
  },
  map: {
    height: 280,
    borderRadius: 18,
  },
  mapFab: {
    position: 'absolute',
    right: 22,
    bottom: 22,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  searchRow: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchBox: {
    flex: 1,
    backgroundColor: '#e9eef7',
    borderRadius: 14,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  searchPlaceholder: {
    color: '#8ea0b8',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  nowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7f93b3',
    borderRadius: 14,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  nowText: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  addressList: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Shadow.sm,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  addressIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  addressText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: '#334155',
  },
  favoriteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  favoriteNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    flex: 1,
  },
  favoriteNoticeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eaf2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  favoriteNoticeTextWrap: {
    flex: 1,
  },
  favoriteNoticeTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: '#25324a',
    marginBottom: 2,
  },
  favoriteNoticeText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#64748b',
  },
  addFavoriteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1d5fa8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteItems: {
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: '#edf2f7',
  },
  actionRow: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.sm,
    ...Shadow.sm,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    position: 'relative',
  },
  actionCardActive: {
    backgroundColor: '#1d5fa8',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ffb400',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
  },
  badgeText: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: 10,
  },
  actionImage: {
    width: 72,
    height: 34,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: '#25324a',
    textAlign: 'center',
    width: '100%',
    lineHeight: 22,
  },
  actionTitleActive: {
    color: Colors.white,
  },
  banner: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadow.sm,
  },
  bannerTextWrap: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  bannerTitle: {
    color: '#1f2937',
    fontFamily: FontFamily.regular,
    fontSize: 28 / 2,
    lineHeight: 21,
    marginBottom: Spacing.md,
  },
  bannerLink: {
    color: '#2563eb',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  bannerImage: {
    width: 100,
    height: 100,
  },
  searchedOriginMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#111111',
    borderWidth: 2.5,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  searchedOriginDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
});
