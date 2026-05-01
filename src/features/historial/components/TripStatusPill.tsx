import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TripStatus } from '../types';
import { Colors } from '@theme/colors';
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

const STATUS_COLOR: Record<TripStatus, string> = {
  completed: '#1a2f4e',
  cancelled: '#7f1d1d',
  in_progress: '#0f766e',
};

export function TripStatusPill({ status }: Props) {
  return (
    <View style={[styles.pill, { backgroundColor: STATUS_COLOR[status] }]}>
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
