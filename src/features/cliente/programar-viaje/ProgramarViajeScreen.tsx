import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
import type { ScheduledTrip } from './types';
import {
  AppButton,
  AppCard,
  AppHeader,
  AppListRow,
  AppScreen,
  AppSectionTitle,
} from '@shared/components/ui';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Spacing, Shadow } from '@theme/spacing';

const shortName = (placeName?: string) => placeName?.split(',')[0]?.trim() ?? '';

/** "Av. Arequipa → Calle 4 · Confort · S/ 35.00" */
function tripSummary(trip: ScheduledTrip): string {
  const route = trip.destination
    ? `${shortName(trip.origin?.placeName) || 'Tu ubicación'} → ${shortName(trip.destination.placeName)}`
    : trip.notes || 'Sin destino';
  const service = trip.service
    ? ` · ${trip.service.name} · ${trip.service.currency} ${trip.service.price.toFixed(2)}`
    : '';
  return route + service;
}

function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} · ${hours}:${minutes}`;
}

export function ProgramarViajeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<ClienteStackParamList, 'ProgramarViaje'>>();
  const trips = useScheduledTripsStore((s) => s.trips);
  const cancelTrip = useScheduledTripsStore((s) => s.cancelTrip);
  const setEntryMode = useRideDraftStore((s) => s.setEntryMode);
  const clearExtraStops = useRideDraftStore((s) => s.clearExtraStops);

  // Se programa igual que desde la tarjeta "Programar" del inicio: destino, servicio y fecha.
  const startScheduling = () => {
    Haptics.selectionAsync();
    setEntryMode('schedule');
    clearExtraStops();
    navigation.navigate('SearchAddress', { target: 'destination' });
  };

  const confirmCancel = (trip: ScheduledTrip) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Cancelar viaje',
      '¿Deseas cancelar este viaje programado?',
      [
        { text: 'No, mantener', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => {
            Haptics.selectionAsync();
            cancelTrip(trip.id);
          },
        },
      ]
    );
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
            <AppCard key={trip.id} padded={false} style={styles.tripCard}>
              <AppListRow
                title={formatDateTime(trip.scheduledFor)}
                subtitle={tripSummary(trip)}
                left={
                  <View
                    style={[
                      styles.tripIconWrap,
                      { backgroundColor: Colors.onlineSoft },
                    ]}
                  >
                    <Ionicons name="alarm-outline" size={20} color={Colors.origin} />
                  </View>
                }
                right={
                  <TouchableOpacity
                    onPress={() => confirmCancel(trip)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Cancelar este viaje programado"
                    style={styles.cancelBtn}
                  >
                    <Ionicons name="close-circle-outline" size={22} color={Colors.danger} />
                  </TouchableOpacity>
                }
                style={styles.tripRow}
              />
            </AppCard>
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
  tripCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  tripRow: {
    paddingHorizontal: Spacing.md,
    minHeight: 64,
  },
  tripIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    padding: 6,
  },
});
