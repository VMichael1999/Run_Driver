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
import { buildTaxiRequest, MAX_EXTRA_STOPS } from '@features/cliente/solicitud-taxi/utils/routeRequest';
import { AppIcon } from '@shared/components/ui/AppIcon';
import { formatDistance } from '@shared/utils/mapUtils';
import { useRideDraftStore } from '@store/useRideDraftStore';
import { useFavoriteAddressesStore } from '@store/useFavoriteAddressesStore';
import { useTaxiStore } from '@store/useTaxiStore';
import { useScheduledTripsStore } from '@store/useScheduledTripsStore';
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
  const editing = route.params.editing === true;
  const scheduledTripId = route.params.scheduledTripId;
  const addScheduledStop = useScheduledTripsStore((s) => s.addStop);

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
  // "Agregar parada" abre el buscador en la misma pantalla, en el lugar de la nueva parada.
  const [addingStop, setAddingStop] = React.useState(false);
  const activeTarget = addingStop ? 'extra-stop' : target;
  const [items, setItems] = React.useState<PlaceSuggestion[]>([]);
  const sessionTokenRef = React.useRef(createPlacesSessionToken());
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const biasLocation = target === 'origin' ? origin?.position : destination?.position;

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const clearSearch = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setQuery('');
    setItems([]);
  };

  const toggleAddingStop = (value: boolean) => {
    clearSearch();
    setAddingStop(value);
  };

  // Al volver del mapa con la parada ya elegida, el buscador regresa al destino.
  React.useEffect(() => {
    setAddingStop(false);
  }, [extraStops.length]);

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

      if (addingStop) {
        addExtraStop(place);
        clearSearch();
        return;
      }

      if (target === 'origin') {
        setOrigin(place);
        setRoutePoints([]);
        navigation.goBack();
      } else if (target === 'extra-stop') {
        if (scheduledTripId) addScheduledStop(scheduledTripId, place);
        else addExtraStop(place);
        navigation.goBack();
      } else {
        setDestination(place);
        // Desde la solicitud solo se cambia el punto; ella recalcula la ruta.
        if (editing) {
          navigation.goBack();
          return;
        }
        if (origin) {
          const request = await buildTaxiRequest({ origin, destination: place, stops: extraStops, paymentMethod, comment });
          setRoutePoints(request.routePoints);
          setRequest(request);
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
    : activeTarget === 'origin'
    ? '¿Desde dónde sales?'
    : activeTarget === 'extra-stop'
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

  // Cada fila lleva su punto; los tramos de arriba y abajo unen los puntos sin cortes.
  const addressRow = (key: string, color: string, isFirst: boolean, isLast: boolean, field: React.ReactNode) => (
    <View key={key} style={styles.addrRow}>
      <View style={styles.rail}>
        <View style={[styles.railSegment, { backgroundColor: isFirst ? 'transparent' : theme.line }]} />
        <View style={styles.railRing}>
          <View style={[styles.railDot, { backgroundColor: color }]} />
        </View>
        <View style={[styles.railSegment, { backgroundColor: isLast ? 'transparent' : theme.line }]} />
      </View>
      <View style={styles.field}>{field}</View>
    </View>
  );

  // Desde, paradas, la parada que se está escribiendo y hacia.
  const addressRows: { key: string; color: string; field: React.ReactNode }[] = [
    {
      key: 'origin',
      color: Colors.pinOrigin,
      field:
        target === 'origin'
          ? activeInput
          : staticField('Desde', originName, () => navigation.push('SearchAddress', { target: 'origin' })),
    },
    ...extraStops.map((stop, idx) => ({
      key: `stop-${stop.placeName}-${idx}`,
      color: theme.textMuted,
      field: staticField(`Parada ${idx + 1}`, stop.placeName, undefined, () => removeExtraStop(idx)),
    })),
    ...(addingStop
      ? [
          {
            key: 'new-stop',
            color: theme.textMuted,
            field: (
              <View style={styles.stopInputRow}>
                <View style={styles.flex}>{activeInput}</View>
                <TouchableOpacity
                  onPress={() => toggleAddingStop(false)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessibilityRole="button"
                  accessibilityLabel="Cancelar parada"
                >
                  <Text style={[styles.linkText, { color: theme.textMuted }]}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            ),
          },
        ]
      : []),
    ...(target === 'origin' && !destination
      ? []
      : [
          {
            key: 'destination',
            color: Colors.pinDestination,
            field:
              target === 'origin' || addingStop
                ? staticField('Hacia', destination?.placeName ?? '¿A dónde vas?', addingStop ? () => toggleAddingStop(false) : undefined)
                : activeInput,
          },
        ]),
  ];

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

      {/* Para un favorito o una parada de un viaje programado basta con el buscador. */}
      {saveFavorite || scheduledTripId ? (
        activeInput
      ) : (
        <View style={styles.addr}>
          {addressRows.map((row, index) =>
            addressRow(row.key, row.color, index === 0, index === addressRows.length - 1, row.field),
          )}
        </View>
      )}

      {!saveFavorite && !editing && !addingStop && target !== 'extra-stop' && extraStops.length < MAX_EXTRA_STOPS ? (
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => toggleAddingStop(true)}
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
            onPress={() => navigation.navigate('SelectAddressOnMap', { target: activeTarget, saveFavorite, editing, scheduledTripId })}
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
    paddingHorizontal: 18,
  },
  // Campo de 48 + 8 de separación; el punto queda centrado y los tramos cubren la separación.
  addrRow: {
    flexDirection: 'row',
    gap: 10,
    height: 56,
  },
  rail: {
    width: 16,
    alignItems: 'center',
  },
  railSegment: {
    width: 2,
    flex: 1,
  },
  field: {
    flex: 1,
    justifyContent: 'center',
  },
  stopInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flex: {
    flex: 1,
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
