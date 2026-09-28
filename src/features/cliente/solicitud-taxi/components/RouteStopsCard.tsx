import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { Coordinates, LocationMarker } from '@shared/types';
import {
  autocompletePlaces,
  createPlacesSessionToken,
  getPlaceDetails,
  type PlaceSuggestion,
} from '@shared/services/googleMapsService';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Shadow } from '@theme/spacing';
import { AppIcon } from '@shared/components/ui/AppIcon';

interface RouteStopsCardProps {
  origin?: LocationMarker | null;
  destination?: LocationMarker | null;
  stops: LocationMarker[];
  durationMin?: number;
  onEditOrigin: () => void;
  onEditDestination: () => void;
  /** Si se pueden agregar más paradas; sin él no se muestra el botón "+". */
  canAddStop: boolean;
  /** Parada elegida en el buscador de la propia tarjeta. */
  onAddStop: (stop: LocationMarker) => void;
  /** "Elegir en el mapa" desde el buscador de parada. */
  onPickStopOnMap: () => void;
  onRemoveStop: (index: number) => void;
  /** Cerca de dónde buscar las paradas (normalmente el destino). */
  searchBias?: Coordinates;
  /** 'floating': tarjeta sobre el mapa. 'inline': dentro de una pantalla, con borde. */
  variant?: 'floating' | 'inline';
  style?: StyleProp<ViewStyle>;
}

const MAX_RESULTS = 4;
const shortName = (placeName?: string) => placeName?.split(',')[0]?.trim() ?? '';

/**
 * Origen, paradas y destino unidos por una línea. Tocar un punto lo cambia; "+" abre, dentro de
 * la misma tarjeta, un buscador para la nueva parada (o la opción de elegirla en el mapa).
 */
export function RouteStopsCard({
  origin,
  destination,
  stops,
  durationMin,
  onEditOrigin,
  onEditDestination,
  canAddStop,
  onAddStop,
  onPickStopOnMap,
  onRemoveStop,
  searchBias,
  variant = 'floating',
  style,
}: RouteStopsCardProps) {
  const theme = useAppTheme();
  const [adding, setAdding] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const sessionTokenRef = React.useRef(createPlacesSessionToken());
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const closeSearch = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAdding(false);
    setQuery('');
    setResults([]);
    setLoading(false);
  };

  const onQueryChanged = (value: string) => {
    setQuery(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (value.trim().length < 3) {
      setResults([]);
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const found = await autocompletePlaces(value.trim(), sessionTokenRef.current, searchBias);
        setResults(found.slice(0, MAX_RESULTS));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);
  };

  const selectResult = async (item: PlaceSuggestion) => {
    setLoading(true);
    try {
      const place = await getPlaceDetails(item.placeId, sessionTokenRef.current);
      sessionTokenRef.current = createPlacesSessionToken();
      onAddStop(place);
      closeSearch();
    } catch {
      setLoading(false);
    }
  };

  // Punto de la línea: el tramo de arriba y el de abajo unen cada punto con el siguiente.
  const railDot = (color: string, isFirst: boolean, isLast: boolean) => (
    <View style={styles.railColumn}>
      <View style={[styles.segment, { backgroundColor: isFirst ? 'transparent' : theme.line }]} />
      <View style={styles.ring}>
        <View style={[styles.dot, { backgroundColor: color }]} />
      </View>
      <View style={[styles.segment, { backgroundColor: isLast ? 'transparent' : theme.line }]} />
    </View>
  );

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface },
        variant === 'floating' ? Shadow.raise : { borderWidth: 1.5, borderColor: theme.line },
        style,
      ]}
    >
      <View style={styles.row}>
        {railDot(Colors.pinOrigin, true, false)}
        <TouchableOpacity
          style={styles.place}
          onPress={onEditOrigin}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Punto de partida: ${origin?.placeName ?? 'tu ubicación'}. Cambiar`}
        >
          <Text style={[styles.placeText, { color: theme.text }]} numberOfLines={1}>
            {shortName(origin?.placeName) || 'Tu ubicación'}
          </Text>
        </TouchableOpacity>
      </View>

      {stops.map((stop, index) => (
        <View key={`${stop.placeName}-${index}`} style={styles.row}>
          {railDot(theme.textMuted, false, false)}
          <View style={styles.place}>
            <Text style={[styles.placeText, { color: theme.text }]} numberOfLines={1}>
              {shortName(stop.placeName)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.action}
            onPress={() => onRemoveStop(index)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Quitar parada ${index + 1}: ${stop.placeName}`}
          >
            <AppIcon name="close" size="s" color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      ))}

      {adding ? (
        <View style={styles.row}>
          {railDot(theme.textMuted, false, false)}
          <TextInput
            style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
            value={query}
            onChangeText={onQueryChanged}
            placeholder="Busca la parada"
            placeholderTextColor={theme.textMuted}
            autoFocus
            returnKeyType="search"
            accessibilityLabel="Buscar dirección de la parada"
          />
          <TouchableOpacity
            style={styles.action}
            onPress={closeSearch}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Cancelar parada"
          >
            <AppIcon name="close" size="s" color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.row}>
        {railDot(Colors.pinDestination, false, true)}
        <TouchableOpacity
          style={styles.place}
          onPress={onEditDestination}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Destino: ${destination?.placeName ?? 'sin elegir'}. Cambiar`}
        >
          <Text style={[styles.placeText, { color: theme.text }]} numberOfLines={1}>
            {shortName(destination?.placeName) || '¿A dónde vas?'}
            {durationMin ? <Text style={{ color: theme.textMuted }}>  ~{durationMin} min</Text> : null}
          </Text>
        </TouchableOpacity>
        {canAddStop && !adding ? (
          <TouchableOpacity
            style={[styles.action, styles.add, { backgroundColor: theme.background }]}
            onPress={() => setAdding(true)}
            accessibilityRole="button"
            accessibilityLabel="Agregar parada"
          >
            <AppIcon name="plus" size="s" color={theme.text} />
          </TouchableOpacity>
        ) : null}
      </View>

      {adding ? (
        <View style={[styles.results, { borderTopColor: theme.line }]}>
          {loading ? <ActivityIndicator style={styles.loading} color={theme.textMuted} /> : null}
          {results.map((item) => (
            <TouchableOpacity
              key={item.placeId}
              style={styles.result}
              onPress={() => void selectResult(item)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}, ${item.subtitle}`}
            >
              <AppIcon name="pin" size="s" color={theme.textMuted} />
              <View style={styles.resultText}>
                <Text style={[styles.resultTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.subtitle ? (
                  <Text style={[styles.resultSubtitle, { color: theme.textMuted }]} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.result}
            onPress={() => {
              closeSearch();
              onPickStopOnMap();
            }}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Elegir la parada en el mapa"
          >
            <AppIcon name="map" size="s" color={theme.text} />
            <Text style={[styles.resultTitle, { color: theme.text }]}>Elegir en el mapa</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const ROW_HEIGHT = 38;

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    paddingVertical: 4,
    paddingLeft: 14,
    paddingRight: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: ROW_HEIGHT,
  },
  railColumn: {
    width: 16,
    height: ROW_HEIGHT,
    alignItems: 'center',
  },
  segment: {
    width: 2,
    flex: 1,
  },
  ring: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.pinRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  place: {
    flex: 1,
    height: ROW_HEIGHT,
    justifyContent: 'center',
  },
  placeText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.body,
  },
  input: {
    flex: 1,
    height: 32,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.body,
  },
  action: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: {
    borderRadius: 16,
  },
  results: {
    marginTop: 4,
    paddingTop: 4,
    paddingBottom: 2,
    borderTopWidth: 1,
  },
  loading: {
    paddingVertical: 6,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  resultSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
  },
});
