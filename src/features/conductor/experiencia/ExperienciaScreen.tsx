import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { UserRating } from '@shared/types';
import { RatingCard } from '@shared/components/card/RatingCard';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing } from '@theme/spacing';

const DUMMY_RATINGS: UserRating[] = [
  { id: '1', imageUrl: 'https://i.pravatar.cc/100?img=5', name: 'Ana Torres', tripCount: 12, role: 'cliente', score: 5 },
  { id: '2', imageUrl: 'https://i.pravatar.cc/100?img=8', name: 'Luis García', tripCount: 3, role: 'cliente', score: 4 },
];

export function ExperienciaScreen() {
  const insets = useSafeAreaInsets();

  const average = DUMMY_RATINGS.reduce((acc, r) => acc + r.score, 0) / (DUMMY_RATINGS.length || 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.summary}>
        <Text style={styles.scoreLabel}>Calificación promedio</Text>
        <Text style={styles.score}>⭐ {average.toFixed(1)}</Text>
        <Text style={styles.total}>{DUMMY_RATINGS.length} calificaciones</Text>
      </View>

      <FlatList
        data={DUMMY_RATINGS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <RatingCard user={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  summary: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  scoreLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: Colors.textSecondary },
  score: { fontSize: FontSize['4xl'], fontFamily: FontFamily.bold, color: Colors.primary, marginVertical: Spacing.sm },
  total: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: Colors.textSecondary },
  list: { padding: Spacing.lg, gap: Spacing.sm },
});
