import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import type { LocationMarker } from '@shared/types';
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
  /** Sin él (o al llegar al máximo de paradas) no se muestra el botón "+". */
  onAddStop?: () => void;
  onRemoveStop: (index: number) => void;
  /** 'floating': tarjeta sobre el mapa. 'inline': dentro de una pantalla, con borde. */
  variant?: 'floating' | 'inline';
  style?: StyleProp<ViewStyle>;
}

const shortName = (placeName?: string) => placeName?.split(',')[0]?.trim() ?? '';

/** Origen, paradas y destino del viaje. Tocar un punto lo cambia; "+" agrega una parada. */
export function RouteStopsCard({
  origin,
  destination,
  stops,
  durationMin,
  onEditOrigin,
  onEditDestination,
  onAddStop,
  onRemoveStop,
  variant = 'floating',
  style,
}: RouteStopsCardProps) {
  const theme = useAppTheme();

  const dot = (color: string) => (
    <View style={styles.ring}>
      <View style={[styles.dot, { backgroundColor: color }]} />
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
        {dot(Colors.pinOrigin)}
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
          {dot(theme.textMuted)}
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

      <View style={styles.row}>
        {dot(Colors.pinDestination)}
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
        {onAddStop ? (
          <TouchableOpacity
            style={[styles.action, styles.add, { backgroundColor: theme.background }]}
            onPress={onAddStop}
            accessibilityRole="button"
            accessibilityLabel="Agregar parada"
          >
            <AppIcon name="plus" size="s" color={theme.text} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    paddingVertical: 6,
    paddingLeft: 14,
    paddingRight: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 40,
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
    justifyContent: 'center',
    minHeight: 40,
  },
  placeText: {
    fontFamily: FontFamily.semibold,
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
});
