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

const ACCENT = '#1d5fa8';

export function TripTimeline({ pickup, dropoff, extraStop, onAddStop }: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.dotsColumn}>
        <View style={[styles.dotFilled, { backgroundColor: theme.accent }]} />
        <View style={[styles.connector, { backgroundColor: theme.accent }]} />
        {extraStop ? (
          <>
            <View style={[styles.dotSmall, { backgroundColor: theme.accent }]} />
            <View style={[styles.connector, { backgroundColor: theme.accent }]} />
          </>
        ) : null}
        <View style={[styles.dotRing, { borderColor: theme.accent, backgroundColor: theme.surface }]} />
      </View>

      <View style={styles.contentColumn}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.textMuted }]}>{pickup.label}</Text>
          {pickup.address ? <Text style={[styles.address, { color: theme.text }]}>{pickup.address}</Text> : null}
        </View>

        {extraStop ? (
          <View style={styles.row}>
            <TouchableOpacity onPress={onAddStop} activeOpacity={0.85} disabled={!onAddStop}>
              <Text style={[styles.addStop, { color: theme.accent }]}>{extraStop.label}</Text>
            </TouchableOpacity>
            {extraStop.address ? <Text style={[styles.address, { color: theme.text }]}>{extraStop.address}</Text> : null}
          </View>
        ) : null}

        {dropoff ? (
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.textMuted }]}>{dropoff.label}</Text>
            {dropoff.address ? <Text style={[styles.address, { color: theme.text }]}>{dropoff.address}</Text> : null}
          </View>
        ) : (
          <View style={styles.row}>
            <TouchableOpacity onPress={onAddStop} activeOpacity={0.85}>
              <View style={styles.addStopRow}>
                <Ionicons name="add" size={14} color={theme.accent} />
                <Text style={[styles.addStop, { color: theme.accent }]}>Agregar parada</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingVertical: Spacing.sm },
  dotsColumn: {
    width: 18,
    alignItems: 'center',
    paddingTop: 4,
  },
  dotFilled: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: ACCENT,
  },
  dotSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACCENT,
  },
  dotRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: ACCENT,
    backgroundColor: Colors.white,
  },
  connector: {
    flex: 1,
    width: 2,
    backgroundColor: ACCENT,
    marginVertical: 4,
    minHeight: 24,
  },
  contentColumn: { flex: 1, marginLeft: Spacing.md, gap: Spacing.md },
  row: { gap: 2 },
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
    color: ACCENT,
  },
  addStopRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
