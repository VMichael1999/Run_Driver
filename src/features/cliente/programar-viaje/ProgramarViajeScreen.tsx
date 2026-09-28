import React from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { useScheduledTripsStore } from '@store/useScheduledTripsStore';
import type { ScheduledTrip } from './types';
import {
  AppButton,
  AppCard,
  AppHeader,
  AppListRow,
  AppScreen,
  AppSectionTitle,
  AppTextInput,
} from '@shared/components/ui';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Spacing, Shadow } from '@theme/spacing';

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
  const trips = useScheduledTripsStore((s) => s.trips);
  const scheduleTrip = useScheduledTripsStore((s) => s.scheduleTrip);
  const cancelTrip = useScheduledTripsStore((s) => s.cancelTrip);

  const minDate = React.useMemo(() => new Date(Date.now() + 15 * 60 * 1000), []);

  const [scheduledFor, setScheduledFor] = React.useState<Date>(minDate);
  const [notes, setNotes] = React.useState<string>('');
  const [pickerVisible, setPickerVisible] = React.useState<boolean>(false);
  const [pickerMode, setPickerMode] = React.useState<'date' | 'time'>('date');

  const showPicker = (mode: 'date' | 'time') => {
    Haptics.selectionAsync();
    setPickerMode(mode);
    setPickerVisible(true);
  };

  const handlePickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setPickerVisible(false);
    }
    if (event.type === 'dismissed' || !selected) return;
    setScheduledFor(selected);
  };

  const handleSchedule = () => {
    if (scheduledFor.getTime() < minDate.getTime()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Hora inválida',
        'Debes programar el viaje con al menos 15 minutos de anticipación.'
      );
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    scheduleTrip({
      origin: null,
      destination: null,
      scheduledFor: scheduledFor.getTime(),
      notes,
    });
    setNotes('');
    Alert.alert('Viaje programado', 'Te avisaremos cuando se acerque la hora de tu viaje.');
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
            ¿Cuándo lo necesitas?
          </Text>

          <View style={styles.pickerRow}>
            <TouchableOpacity
              style={[styles.pickerButton, { backgroundColor: theme.surfaceMuted }]}
              onPress={() => showPicker('date')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Elegir fecha del viaje"
            >
              <Ionicons name="calendar-outline" size={18} color={theme.text} />
              <Text style={[styles.pickerLabel, { color: theme.text }]}>
                {scheduledFor.toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pickerButton, { backgroundColor: theme.surfaceMuted }]}
              onPress={() => showPicker('time')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Elegir hora del viaje"
            >
              <Ionicons name="time-outline" size={18} color={theme.text} />
              <Text style={[styles.pickerLabel, { color: theme.text }]}>
                {scheduledFor.getHours().toString().padStart(2, '0')}:
                {scheduledFor.getMinutes().toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.formLabel, { color: theme.text }]}>Notas (opcional)</Text>
          <AppTextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Ej. Llevaré maleta grande o mascota"
            multiline
            inputStyle={styles.notesInput}
          />

          <AppButton
            label="Programar viaje"
            variant="sig"
            size="md"
            onPress={handleSchedule}
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
                subtitle={trip.notes || 'Sin notas adicionales'}
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

      {pickerVisible ? (
        <DateTimePicker
          value={scheduledFor}
          mode={pickerMode}
          minimumDate={pickerMode === 'date' ? minDate : undefined}
          is24Hour
          onChange={handlePickerChange}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        />
      ) : null}
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
  pickerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
  },
  pickerLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  formLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  notesInput: {
    minHeight: 64,
    textAlignVertical: 'top',
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
