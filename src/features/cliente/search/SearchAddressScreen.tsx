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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ClienteStackParamList } from '@navigation/types';
import {
  autocompletePlaces,
  createPlacesSessionToken,
  getPlaceDetails,
  type PlaceSuggestion,
} from '@shared/services/googleMapsService';
import { getRoutePolyline } from '@shared/services/googleMapsService';
import { AppIcon } from '@shared/components/ui/AppIcon';
import { formatDistance } from '@shared/utils/mapUtils';
import { useRideDraftStore } from '@store/useRideDraftStore';
import { useFavoriteAddressesStore } from '@store/useFavoriteAddressesStore';
import { useTaxiStore } from '@store/useTaxiStore';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius } from '@theme/spacing';

type Props = NativeStackScreenProps<ClienteStackParamList, 'SearchAddress'>;

// Subraya en lima la parte del resultado que coincide con lo escrito.
function HighlightedTitle({ title, query, color, highlight }: { title: string; query: string; color: string; highlight: string }) {
  const needle = query.trim().toLowerCase();
  const start = needle ? title.toLowerCase().indexOf(needle) : -1;
  if (start < 0) {
    return (
      <Text style={[styles.resultTitle, { color }]} numberOfLines={1}>
        {title}
      </Text>
    );
  }
  const end = start + needle.length;
  return (
    <Text style={[styles.resultTitle, { color }]} numberOfLines={1}>
      {title.slice(0, start)}
      <Text style={[styles.match, { textDecorationColor: highlight }]}>{title.slice(start, end)}</Text>
      {title.slice(end)}
    </Text>
  );
}

export function SearchAddressScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
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
        const result = await autocompletePlaces(value.trim(), sessionTokenRef.current, biasLocation, origin?.position);
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
  const title = saveFavorite
    ? 'Agregar favorita'
    : target === 'origin'
    ? 'Punto de partida'
    : target === 'extra-stop'
    ? 'Agregar parada'
    : 'Tu viaje';
  const placeholder = saveFavorite
    ? 'Escribe la dirección'
    : target === 'origin'
    ? '¿Desde dónde sales?'
    : target === 'extra-stop'
    ? '¿Dónde será la parada?'
    : '¿A dónde vas?';

  const activeInput = (
    <View style={[styles.inp, styles.inpActive, { backgroundColor: theme.surface, borderColor: theme.text }]}>
      <TextInput
        value={query}
        onChangeText={onQueryChanged}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { color: theme.text }]}
        autoFocus
        selectionColor={theme.text}
        accessibilityLabel={placeholder}
      />
      {loading ? <ActivityIndicator size="small" color={theme.text} /> : null}
      {!loading && query.length > 0 ? (
        <TouchableOpacity
          onPress={() => onQueryChanged('')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Borrar texto"
        >
          <AppIcon name="close" size="s" color={theme.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );

  const staticField = (label: string, value: string, onPress?: () => void, onRemove?: () => void) => (
    <TouchableOpacity
      style={[styles.inp, { backgroundColor: theme.background }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${value}`}
    >
      <Text style={[styles.inpLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.inpValue, { color: theme.text }]} numberOfLines={1}>
        {value}
      </Text>
      {onRemove ? (
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={`Quitar ${label.toLowerCase()}`}
        >
          <AppIcon name="close" size="s" color={theme.textMuted} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );

  const header = (
    <View style={styles.pad}>
      <View style={styles.hdr}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.line }]}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <AppIcon name="back" color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.hdrTitle, { color: theme.text }]}>{title}</Text>
      </View>

      {saveFavorite ? (
        activeInput
      ) : (
        <View style={styles.addr}>
          <View style={styles.rail}>
            <View style={styles.railRing}>
              <View style={[styles.railDot, { backgroundColor: Colors.pinOrigin }]} />
            </View>
            <View style={[styles.railLine, { backgroundColor: theme.line }]} />
            <View style={styles.railRing}>
              <View style={[styles.railDot, { backgroundColor: Colors.pinDestination }]} />
            </View>
          </View>
          <View style={styles.fields}>
            {target === 'origin'
              ? activeInput
              : staticField('Desde', originName, () => navigation.push('SearchAddress', { target: 'origin' }))}
            {extraStops.map((stop, idx) =>
              staticField(`Parada ${idx + 1}`, stop.placeName, undefined, () => removeExtraStop(idx)),
            )}
            {target === 'origin'
              ? destination
                ? staticField('Hacia', destination.placeName)
                : null
              : activeInput}
          </View>
        </View>
      )}

      {!saveFavorite && target !== 'extra-stop' && extraStops.length < 2 ? (
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => navigation.push('SearchAddress', { target: 'extra-stop' })}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Agregar parada"
        >
          <AppIcon name="plus" color={theme.text} />
          <Text style={[styles.linkText, { color: theme.text }]}>Agregar parada</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.placeId}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingBottom: insets.bottom + 22 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.res, { borderBottomColor: theme.line }]}
            onPress={() => void onSelectItem(item)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}, ${item.subtitle}`}
          >
            <View style={[styles.resIcon, { backgroundColor: theme.background }]}>
              <AppIcon name="pin" color={theme.textMuted} />
            </View>
            <View style={styles.resText}>
              <HighlightedTitle title={item.title} query={query} color={theme.text} highlight={theme.sig} />
              {item.subtitle ? (
                <Text style={[styles.resSubtitle, { color: theme.textMuted }]} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              ) : null}
            </View>
            {item.distanceMeters !== undefined ? (
              <Text style={[styles.km, { color: theme.textMuted }]}>{formatDistance(item.distanceMeters / 1000)}</Text>
            ) : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.trim().length >= 3 && !loading ? (
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              No encontramos esa dirección. Prueba eligiéndola en el mapa.
            </Text>
          ) : null
        }
        ListFooterComponent={
          <TouchableOpacity
            style={[styles.linkRow, items.length > 0 && styles.mapLink]}
            onPress={() => navigation.navigate('SelectAddressOnMap', { target, saveFavorite })}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Elegir en el mapa"
          >
            <AppIcon name="map" color={theme.text} />
            <Text style={[styles.linkText, { color: theme.text }]}>Elegir en el mapa</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pad: {
    paddingTop: 10,
    paddingBottom: 16,
    gap: 16,
  },
  hdr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hdrTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    letterSpacing: -0.48,
  },
  addr: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
  },
  rail: {
    width: 16,
    alignItems: 'center',
    paddingTop: 16,
  },
  // Punto de 10 px con aro de 3 px, como los pines del mapa
  railRing: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.pinRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  railLine: {
    width: 2,
    flex: 1,
    minHeight: 24,
    marginVertical: 6,
  },
  fields: {
    flex: 1,
    gap: 8,
  },
  inp: {
    height: 48,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  inpActive: {
    borderWidth: 1.5,
    marginHorizontal: 0,
  },
  inpLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
  },
  inpValue: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.body,
    padding: 0,
    margin: 0,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  mapLink: {
    marginTop: 16,
  },
  linkText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  res: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    marginHorizontal: 18,
    borderBottomWidth: 1,
  },
  resIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resText: {
    flex: 1,
  },
  resultTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.body,
  },
  match: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
  resSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
  },
  km: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.meta,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
});
