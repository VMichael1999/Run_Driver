import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TripHistoryCard } from './components/TripHistoryCard';
import { useTripHistory } from './hooks/useTripHistory';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing } from '@theme/spacing';

export function HistorialViajeScreen() {
  const insets = useSafeAreaInsets();
  // La pantalla vive en los stacks de cliente y conductor; ambos tienen DetalleViaje.
  const navigation = useNavigation<NativeStackNavigationProp<{ DetalleViaje: { tripId: string } }>>();
  const theme = useAppTheme();
  const historyItems = useTripHistory();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom, backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, backgroundColor: theme.background }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={[styles.backButton, { backgroundColor: theme.iconButton }]}
          activeOpacity={0.85}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Mis viajes</Text>
      </View>

      <FlatList
        data={historyItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TripHistoryCard trip={item} onPress={(trip) => navigation.navigate('DetalleViaje', { tripId: trip.id })} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No tienes viajes registrados</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  list: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  separator: { height: Spacing.md },
  empty: { alignItems: 'center', marginTop: Spacing['5xl'] },
  emptyText: { fontSize: FontSize.md, fontFamily: FontFamily.regular, color: Colors.textSecondary },
});
