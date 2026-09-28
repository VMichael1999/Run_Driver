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
import {
  autocompletePlaces,
  createPlacesSessionToken,
  getPlaceDetails,
  type PlaceSuggestion,
} from '@shared/services/googleMapsService';
import { getRoutePolyline } from '@shared/services/googleMapsService';
import { useRideDraftStore } from '@store/useRideDraftStore';
import { useFavoriteAddressesStore } from '@store/useFavoriteAddressesStore';
import { useTaxiStore } from '@store/useTaxiStore';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Shadow, Spacing } from '@theme/spacing';

type Props = NativeStackScreenProps<ClienteStackParamList, 'SearchAddress'>;

export function SearchAddressScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const target = route.params.target;
  const saveFavorite = route.params.saveFavorite === true;

  const origin = useRideDraftStore((s) => s.origin);
  const destination = useRideDraftStore((s) => s.destination);
  const extraStops = useRideDraftStore((s) => s.extraStops);
  const setOrigin = useRideDraftStore((s) => s.setOrigin);
  const setDestination = useRideDraftStore((s) => s.setDestination);
  const addExtraStop = useRideDraftStore((s) => s.addExtraStop);
  const removeExtraStop = useRideDraftStore((s) => s.removeExtraStop);
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
    }, 280);
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
      } else if (target === 'extra-stop') {
        addExtraStop(place);
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

  const originName = origin?.placeName ?? 'Mi ubicación actual';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackAppBar
        title={
          saveFavorite
            ? 'Agregar favorita'
            : target === 'origin'
            ? 'Punto de partida'
            : target === 'extra-stop'
            ? 'Agregar parada'
            : 'Tu viaje'
        }
      />

      <View style={styles.content}>
        {/* Itinerario: Origen, Paradas y Destino */}
        {!saveFavorite ? (
          <View style={[styles.itineraryCard, { backgroundColor: theme.surface }, Shadow.raise]}>
            {/* Origen */}
            <TouchableOpacity
              style={styles.itineraryRow}
              onPress={() => {
                if (target !== 'origin') {
                  navigation.push('SearchAddress', { target: 'origin' });
                }
              }}
              activeOpacity={0.8}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Punto de partida: ${originName}`}
            >
              <View style={[styles.dotCircle, { backgroundColor: theme.origin }]} />
              <View style={styles.itineraryTextWrap}>
                <Text style={[styles.itineraryLabel, { color: theme.textMuted }]}>Desde</Text>
                <Text style={[styles.itineraryValue, { color: theme.text }]} numberOfLines={1}>
                  {originName}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Paradas extra */}
            {extraStops.map((stop, idx) => (
              <View key={`stop-${idx}`} style={styles.itineraryRow}>
                <View style={[styles.stopCircle, { borderColor: theme.textMuted }]} />
                <View style={styles.itineraryTextWrap}>
                  <Text style={[styles.itineraryLabel, { color: theme.textMuted }]}>Parada {idx + 1}</Text>
                  <Text style={[styles.itineraryValue, { color: theme.text }]} numberOfLines={1}>
                    {stop.placeName}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeExtraStop(idx)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel={`Eliminar parada ${idx + 1}`}
                >
                  <Ionicons name="close-circle-outline" size={18} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
            ))}

            <View style={[styles.railLine, { backgroundColor: theme.line }]} />

            {/* Destino con input de búsqueda */}
            <View style={styles.itineraryRow}>
              <View style={[styles.squarePoint, { backgroundColor: theme.destination }]} />
              <View style={styles.inputWrap}>
                <Text style={[styles.itineraryLabel, { color: theme.textMuted }]}>
                  {target === 'extra-stop' ? 'Nueva parada' : 'Hacia'}
                </Text>
                <TextInput
                  value={query}
                  onChangeText={onQueryChanged}
                  placeholder={
                    target === 'origin'
                      ? 'Escribe tu punto de partida'
                      : target === 'extra-stop'
                      ? '¿Dónde será la parada?'
                      : '¿A dónde quieres ir?'
                  }
                  placeholderTextColor={theme.textDisabled}
                  style={[styles.input, { color: theme.text }]}
                  autoFocus
                  accessible
                  accessibilityLabel="Campo para ingresar dirección de destino"
                />
              </View>

              {query.length > 0 ? (
                <TouchableOpacity
                  onPress={() => onQueryChanged('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Limpiar texto"
                >
                  <Ionicons name="close-circle" size={18} color={theme.textMuted} />
                </TouchableOpacity>
              ) : null}

              {loading ? <ActivityIndicator size="small" color={theme.primary} /> : null}
            </View>

            {/* Botón para agregar parada */}
            {target !== 'extra-stop' && extraStops.length < 2 ? (
              <TouchableOpacity
                style={styles.addStopLink}
                onPress={() => navigation.push('SearchAddress', { target: 'extra-stop' })}
                activeOpacity={0.75}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Agregar una parada intermedia"
              >
                <Ionicons name="add-circle-outline" size={16} color={theme.text} />
                <Text style={[styles.addStopText, { color: theme.text }]}>Agregar parada</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          /* Buscar favorita simple */
          <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.line }, Shadow.raise]}>
            <Ionicons name="search" size={18} color={theme.textMuted} />
            <TextInput
              value={query}
              onChangeText={onQueryChanged}
              placeholder="Escribe la dirección favorita"
              placeholderTextColor={theme.textDisabled}
              style={[styles.input, { color: theme.text }]}
              autoFocus
            />
            {loading ? <ActivityIndicator size="small" color={theme.primary} /> : null}
          </View>
        )}

        {/* Acción: Seleccionar en el mapa */}
        <TouchableOpacity
          style={[styles.mapAction, { backgroundColor: theme.surface, borderColor: theme.line }, Shadow.raise]}
          onPress={() => navigation.navigate('SelectAddressOnMap', { target, saveFavorite })}
          activeOpacity={0.85}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Elegir ubicación directamente en el mapa"
        >
          <View style={[styles.mapActionIcon, { backgroundColor: theme.surfaceMuted }]}>
            <Ionicons name="map-outline" size={18} color={theme.text} />
          </View>
          <Text style={[styles.mapActionText, { color: theme.text }]}>Elegir en el mapa</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
        </TouchableOpacity>

        {/* Resultados de búsqueda */}
        <FlatList
          data={items}
          keyExtractor={(item) => item.placeId}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.line }, Shadow.sm]}
              onPress={() => void onSelectItem(item)}
              activeOpacity={0.8}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Seleccionar ${item.title}, ${item.subtitle}`}
            >
              <View style={[styles.resultIconWrap, { backgroundColor: theme.surfaceMuted }]}>
                <Ionicons name="location-outline" size={18} color={theme.text} />
              </View>
              <View style={styles.resultTextWrap}>
                <Text style={[styles.resultTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.resultSubtitle, { color: theme.textMuted }]} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={14} color={theme.textMuted} style={{ alignSelf: 'center' }} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            query.trim().length < 3 ? (
              <View style={styles.emptyState}>
                <Ionicons name="compass-outline" size={32} color={theme.textMuted} style={{ marginBottom: 8 }} />
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  Escribe al menos 3 letras para ver sugerencias de direcciones en Lima.
                </Text>
              </View>
            ) : !loading ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={32} color={theme.textMuted} style={{ marginBottom: 8 }} />
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  No encontramos resultados para esa dirección. Prueba eligiendo en el mapa.
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  itineraryCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.md,
    gap: Spacing.md,
    position: 'relative',
    marginBottom: Spacing.md,
  },
  railLine: {
    position: 'absolute',
    left: 21,
    top: 32,
    bottom: 46,
    width: 2,
    zIndex: 1,
  },
  itineraryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    zIndex: 2,
  },
  dotCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stopCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  squarePoint: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  itineraryTextWrap: {
    flex: 1,
    gap: 2,
  },
  itineraryLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itineraryValue: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md - 1,
  },
  inputWrap: {
    flex: 1,
    gap: 2,
  },
  input: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    padding: 0,
    margin: 0,
  },
  addStopLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  addStopText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  mapAction: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  mapActionIcon: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapActionText: {
    flex: 1,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  list: {
    gap: Spacing.sm,
    paddingBottom: Spacing['3xl'],
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
  },
  resultIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTextWrap: {
    flex: 1,
    gap: 2,
  },
  resultTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  resultSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  emptyState: {
    paddingTop: Spacing['3xl'],
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
