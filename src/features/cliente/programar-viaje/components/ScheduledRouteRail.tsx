import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { LocationMarker } from '@shared/types';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { AppIcon } from '@shared/components/ui/AppIcon';

interface ScheduledRouteRailProps {
  origin: LocationMarker | null;
  destination: LocationMarker | null;
  stops: LocationMarker[];
  /** Con él, cada parada muestra "×" para quitarla. */
  onRemoveStop?: (index: number) => void;
  /** Con él, se muestra "Agregar parada" al final. */
  onAddStop?: () => void;
}

/** Recorrido de un viaje programado: desde, paradas y hacia. */
export function ScheduledRouteRail({ origin, destination, stops, onRemoveStop, onAddStop }: ScheduledRouteRailProps) {
  const theme = useAppTheme();
  const places = [
    { label: 'Desde', place: origin, color: Colors.pinOrigin, stopIndex: -1 },
    ...stops.map((stop, index) => ({ label: `Parada ${index + 1}`, place: stop, color: theme.textMuted, stopIndex: index })),
    { label: 'Hacia', place: destination, color: Colors.pinDestination, stopIndex: -1 },
  ];

  return (
    <View style={styles.rail}>
      {places.map(({ label, place, color, stopIndex }, index) => (
        <View key={`${label}-${index}`} style={styles.row}>
          <View style={styles.dotColumn}>
            <View style={[styles.topSegment, { backgroundColor: index === 0 ? 'transparent' : theme.line }]} />
            <View style={styles.ring}>
              <View style={[styles.dot, { backgroundColor: color }]} />
            </View>
            {index < places.length - 1 ? <View style={[styles.line, { backgroundColor: theme.line }]} /> : null}
          </View>
          <View style={styles.text}>
            <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
            <Text style={[styles.value, { color: theme.text }]} numberOfLines={2}>
              {place?.placeName ?? 'Tu ubicación'}
            </Text>
          </View>
          {stopIndex >= 0 && onRemoveStop ? (
            <TouchableOpacity
              style={styles.remove}
              onPress={() => onRemoveStop(stopIndex)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Quitar parada ${stopIndex + 1}: ${place?.placeName ?? ''}`}
            >
              <AppIcon name="close" size="s" color={theme.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      ))}

      {onAddStop ? (
        <TouchableOpacity
          style={styles.addRow}
          onPress={onAddStop}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Agregar parada"
        >
          <AppIcon name="plus" size="s" color={theme.text} />
          <Text style={[styles.addText, { color: theme.text }]}>Agregar parada</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  dotColumn: {
    width: 16,
    alignItems: 'center',
  },
  // Alinea el punto con la etiqueta y une con la fila anterior.
  topSegment: {
    width: 2,
    height: 2,
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
  line: {
    width: 2,
    flex: 1,
  },
  text: {
    flex: 1,
    paddingBottom: 12,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
  },
  value: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.body,
  },
  remove: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 26,
    paddingVertical: 4,
  },
  addText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
});
