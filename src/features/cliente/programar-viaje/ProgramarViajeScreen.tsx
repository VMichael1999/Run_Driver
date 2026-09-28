import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ClienteStackParamList } from '@navigation/types';
import * as Haptics from 'expo-haptics';
import { useScheduledTripsStore } from '@store/useScheduledTripsStore';
import { useRideDraftStore } from '@store/useRideDraftStore';
import { ScheduledTripCard } from './components/ScheduledTripCard';
import {
  AppButton,
  AppCard,
  AppHeader,
  AppScreen,
  AppSectionTitle,
} from '@shared/components/ui';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Spacing, Shadow } from '@theme/spacing';

export function ProgramarViajeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<ClienteStackParamList, 'ProgramarViaje'>>();
  const trips = useScheduledTripsStore((s) => s.trips);
  const setEntryMode = useRideDraftStore((s) => s.setEntryMode);
  const clearExtraStops = useRideDraftStore((s) => s.clearExtraStops);

  // Se programa igual que desde la tarjeta "Programar" del inicio: destino, servicio y fecha.
  const startScheduling = () => {
    Haptics.selectionAsync();
    setEntryMode('schedule');
    clearExtraStops();
    navigation.navigate('SearchAddress', { target: 'destination' });
  };

  return (
    <AppScreen>
      <AppHeader title="Programar viaje" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + Spacing['2xl'] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppCard style={styles.formCard}>
          <Text style={[styles.formTitle, { color: theme.text }]}>
            ¿Necesitas un viaje más tarde?
          </Text>
          <Text style={[styles.formText, { color: theme.textMuted }]}>
            Elige el destino, el servicio y la hora. A esa hora buscaremos tu conductor.
          </Text>
          <AppButton
            label="Programar un viaje"
            variant="sig"
            size="md"
            onPress={startScheduling}
            style={styles.saveButton}
          />
        </AppCard>

        <AppSectionTitle>Próximos viajes</AppSectionTitle>

        {trips.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="calendar-clear-outline" size={36} color={theme.textDisabled} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              No tienes viajes programados.
            </Text>
          </View>
        ) : (
          trips.map((trip) => (
            <ScheduledTripCard
              key={trip.id}
              trip={trip}
              onPress={(t) => navigation.navigate('DetalleViajeProgramado', { tripId: t.id })}
            />
          ))
        )}
      </ScrollView>

    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  formCard: {
    gap: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  formTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
  },
  formText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  saveButton: {
    marginTop: Spacing.xs,
  },
  emptyCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
});
