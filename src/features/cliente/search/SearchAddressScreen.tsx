import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ClienteStackParamList } from '@navigation/types';
import { BackAppBar } from '@shared/components/appbar/BackAppBar';
import { autocompletePlaces, createPlacesSessionToken, getPlaceDetails, type PlaceSuggestion } from '@shared/services/googleMapsService';
import { getRoutePolyline } from '@shared/services/googleMapsService';
import { useRideDraftStore } from '@store/useRideDraftStore';
import { useFavoriteAddressesStore } from '@store/useFavoriteAddressesStore';
import { useTaxiStore } from '@store/useTaxiStore';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';

type Props = NativeStackScreenProps<ClienteStackParamList, 'SearchAddress'>;

export function SearchAddressScreen({ route, navigation }: Props) {
  const target = route.params.target;
  const saveFavorite = route.params.saveFavorite === true;
  const origin = useRideDraftStore((s) => s.origin);
  const destination = useRideDraftStore((s) => s.destination);
  const setOrigin = useRideDraftStore((s) => s.setOrigin);
  const setDestination = useRideDraftStore((s) => s.setDestination);
  const setRoutePoints = useRideDraftStore((s) => s.setRoutePoints);
  const addFavorite = useFavoriteAddressesStore((s) => s.addFavorite);
  const paymentMethod = useRideDraftStore((s) => s.paymentMethod);
  const comment = useRideDraftStore((s) => s.comment);
  const setRequest = useTaxiStore((s) => s.setRequest);

  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<PlaceSuggestion[]>([]);
  const sessionTokenRef = React.useRef(createPlacesSessionToken());
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const biasLocation = target === 'origin' ? origin?.position : destination?.position;

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const onQueryChanged = (value: string) => {
    setQuery(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (value.trim().length < 3) {
      setItems([]);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const result = await autocompletePlaces(value.trim(), sessionTokenRef.current, biasLocation);
        setItems(result);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const onSelectItem = async (item: PlaceSuggestion) => {
    try {
      setLoading(true);
      const place = await getPlaceDetails(item.placeId, sessionTokenRef.current);
      if (saveFavorite) {
        addFavorite(place);
        navigation.popToTop();
        return;
      }

      if (target === 'origin') {
        setOrigin(place);
        setRoutePoints([]);
        navigation.goBack();
      } else {
        setDestination(place);
        if (origin) {
          const points = await getRoutePolyline(origin.position, place.position);
          setRoutePoints(points);
          setRequest({
            origin,
            destination: place,
            routePoints: points,
            paymentMethod,
            comment: comment.trim() || undefined,
          });
          navigation.replace('SolicitudTaxi');
          return;
        }
        setRoutePoints([]);
        navigation.goBack();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackAppBar title={saveFavorite ? 'Agregar favorita' : target === 'origin' ? 'Buscar origen' : 'Buscar destino'} />
      <View style={styles.content}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#94a3b8" />
          <TextInput
            value={query}
            onChangeText={onQueryChanged}
            placeholder={saveFavorite ? 'Buscar direccion favorita' : target === 'origin' ? 'Ingresa origen' : 'Ingresa destino'}
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
            autoFocus
          />
          {loading ? <ActivityIndicator size="small" color={Colors.primary} /> : null}
        </View>

        <TouchableOpacity
          style={styles.mapAction}
          onPress={() => navigation.navigate('SelectAddressOnMap', { target, saveFavorite })}
          activeOpacity={0.85}
        >
          <View style={styles.mapActionIcon}>
            <Ionicons name="pin" size={16} color={Colors.primary} />
          </View>
          <Text style={styles.mapActionText}>Seleccionar en el mapa</Text>
        </TouchableOpacity>

        <FlatList
          data={items}
          keyExtractor={(item) => item.placeId}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultCard} onPress={() => void onSelectItem(item)} activeOpacity={0.85}>
              <View style={styles.resultIcon}>
                <Ionicons name="location-outline" size={18} color="#64748b" />
              </View>
              <View style={styles.resultTextWrap}>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            query.trim().length < 3 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Escribe al menos 3 letras para buscar direcciones.</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No encontramos resultados para esa direccion.</Text>
              </View>
            )
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    ...Shadow.sm,
  },
  searchInput: {
    flex: 1,
    color: '#1f2937',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
  },
  mapAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  mapActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eaf2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  mapActionText: {
    color: Colors.primary,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  list: {
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  resultIcon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  resultTextWrap: {
    flex: 1,
  },
  resultTitle: {
    color: '#1f2937',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    marginBottom: 2,
  },
  resultSubtitle: {
    color: '#64748b',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  emptyState: {
    paddingTop: Spacing['3xl'],
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
});
