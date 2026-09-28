import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TripStop } from '../types';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing } from '@theme/spacing';

interface Props {
  pickup: TripStop;
  dropoff: TripStop | null;
  extraStop: TripStop | null;
  onAddStop?: () => void;
}

type Marker = 'filled' | 'small' | 'ring';

export function TripTimeline({ pickup, dropoff, extraStop, onAddStop }: Props) {
  const theme = useAppTheme();

  // Cada fila lleva su punto; el tramo de abajo llega hasta el punto de la fila siguiente.
  const row = (key: string, marker: Marker, isFirst: boolean, isLast: boolean, content: React.ReactNode) => (
    <View key={key} style={styles.row}>
      <View style={styles.dotsColumn}>
        <View style={[styles.topSegment, { backgroundColor: isFirst ? 'transparent' : theme.accent }]} />
        {marker === 'filled' ? (
          <View style={[styles.dotFilled, { backgroundColor: theme.accent }]} />
        ) : marker === 'small' ? (
          // Mismo alto que los otros puntos, con la línea pasando por detrás del punto chico.
          <View style={styles.dotSmallBox}>
            <View style={[styles.dotSmallLine, { backgroundColor: theme.accent }]} />
            <View style={[styles.dotSmall, { backgroundColor: theme.accent }]} />
          </View>
        ) : (
          <View style={[styles.dotRing, { borderColor: theme.accent, backgroundColor: theme.surface }]} />
        )}
        {isLast ? null : <View style={[styles.connector, { backgroundColor: theme.accent }]} />}
      </View>
      <View style={[styles.content, !isLast && styles.contentSpacing]}>{content}</View>
    </View>
  );

  const rows: { key: string; marker: Marker; content: React.ReactNode }[] = [
    {
      key: 'pickup',
      marker: 'filled',
      content: (
        <>
          <Text style={[styles.label, { color: theme.textMuted }]}>{pickup.label}</Text>
          {pickup.address ? <Text style={[styles.address, { color: theme.text }]}>{pickup.address}</Text> : null}
        </>
      ),
    },
  ];

  if (extraStop) {
    rows.push({
      key: 'stop',
      marker: 'small',
      content: (
        <>
          <TouchableOpacity onPress={onAddStop} activeOpacity={0.85} disabled={!onAddStop} accessibilityRole="button">
            <Text style={[styles.addStop, { color: theme.accent }]}>{extraStop.label}</Text>
          </TouchableOpacity>
          {extraStop.address ? <Text style={[styles.address, { color: theme.text }]}>{extraStop.address}</Text> : null}
        </>
      ),
    });
  }

  rows.push(
    dropoff
      ? {
          key: 'dropoff',
          marker: 'ring',
          content: (
            <>
              <Text style={[styles.label, { color: theme.textMuted }]}>{dropoff.label}</Text>
              {dropoff.address ? <Text style={[styles.address, { color: theme.text }]}>{dropoff.address}</Text> : null}
            </>
          ),
        }
      : {
          key: 'add',
          marker: 'ring',
          content: (
            <TouchableOpacity onPress={onAddStop} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Agregar parada">
              <View style={styles.addStopRow}>
                <Ionicons name="add" size={14} color={theme.accent} />
                <Text style={[styles.addStop, { color: theme.accent }]}>Agregar parada</Text>
              </View>
            </TouchableOpacity>
          ),
        },
  );

  return (
    <View style={styles.container}>
      {rows.map((r, index) => row(r.key, r.marker, index === 0, index === rows.length - 1, r.content))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: Spacing.sm },
  row: { flexDirection: 'row' },
  dotsColumn: {
    width: 18,
    alignItems: 'center',
  },
  // Alinea el punto con la primera línea de texto y une con la fila anterior.
  topSegment: {
    width: 2,
    height: 3,
  },
  dotFilled: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.destination,
  },
  dotSmallBox: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotSmallLine: {
    ...StyleSheet.absoluteFillObject,
    left: 6,
    width: 2,
  },
  dotSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.destination,
  },
  dotRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: Colors.destination,
    backgroundColor: Colors.white,
  },
  connector: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.destination,
  },
  content: { flex: 1, marginLeft: Spacing.md, gap: 2 },
  contentSpacing: { paddingBottom: Spacing.md },
  label: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  address: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  addStop: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.destination,
  },
  addStopRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
