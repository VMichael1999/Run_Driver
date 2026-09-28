import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TripStatus } from '../types';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius } from '@theme/spacing';

interface Props {
  status: TripStatus;
}

const STATUS_LABEL: Record<TripStatus, string> = {
  completed: 'Completado',
  cancelled: 'Cancelado',
  in_progress: 'En curso',
};

export function TripStatusPill({ status }: Props) {
  const theme = useAppTheme();
  const backgroundColor = { completed: theme.drawer, cancelled: theme.danger, in_progress: theme.onTrip }[status];

  return (
    <View style={[styles.pill, { backgroundColor }]}>
      <Text style={styles.text}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  text: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
});
