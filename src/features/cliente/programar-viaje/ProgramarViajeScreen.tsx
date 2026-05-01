import React from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useScheduledTripsStore } from '@store/useScheduledTripsStore';
import type { ScheduledTrip } from './types';
import { AppButton, AppCard, AppHeader, AppListRow, AppScreen, AppSectionTitle, AppTextInput } from '@shared/components/ui';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';

function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
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
      Alert.alert('Hora invalida', 'Debes programar el viaje con al menos 15 minutos de anticipacion.');
      return;
    }
    scheduleTrip({
      origin: null,
      destination: null,
      scheduledFor: scheduledFor.getTime(),
      notes,
    });
    setNotes('');
    Alert.alert('Viaje programado', 'Te avisaremos cuando se acerque la hora.');
  };

  const confirmCancel = (trip: ScheduledTrip) => {
    Alert.alert('Cancelar viaje', 'Quieres cancelar este viaje programado?', [
      { text: 'No', style: 'cancel' },
      { text: 'Si, cancelar', style: 'destructive', onPress: () => cancelTrip(trip.id) },
    ]);
  };

  return (
    <AppScreen>
      <AppHeader title="Programar viaje" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
        keyboardShouldPersistTaps="handled"
      >
        <AppCard style={styles.formCard}>
          <Text style={[styles.formTitle, { color: theme.text }]}>Cuando lo necesitas?</Text>

          <View style={styles.pickerRow}>
            <TouchableOpacity style={[styles.pickerButton, { backgroundColor: theme.surfaceMuted }]} onPress={() => showPicker('date')} activeOpacity={0.85}>
              <Ionicons name="calendar-outline" size={18} color={theme.accent} />
              <Text style={[styles.pickerLabel, { color: theme.text }]}>
                {scheduledFor.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pickerButton, { backgroundColor: theme.surfaceMuted }]} onPress={() => showPicker('time')} activeOpacity={0.85}>
              <Ionicons name="time-outline" size={18} color={theme.accent} />
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
            placeholder="Detalles adicionales para el conductor"
            multiline
            inputStyle={styles.notesInput}
          />

          <AppButton label="Programar" onPress={handleSchedule} style={styles.saveButton} />
        </AppCard>

        <AppSectionTitle>Proximos viajes</AppSectionTitle>

        {trips.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No tienes viajes programados.</Text>
        ) : (
          trips.map((trip) => (
            <AppCard key={trip.id} padded={false}>
              <AppListRow
                title={formatDateTime(trip.scheduledFor)}
                subtitle={trip.notes || undefined}
                left={(
                  <View style={[styles.tripIconWrap, { backgroundColor: theme.surfaceSoft }]}>
                    <Ionicons name="alarm-outline" size={22} color={theme.accent} />
                  </View>
                )}
                right={(
                  <TouchableOpacity onPress={() => confirmCancel(trip)} activeOpacity={0.85}>
                    <Ionicons name="close-circle-outline" size={24} color={Colors.error} />
                  </TouchableOpacity>
                )}
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
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  formCard: {
    gap: Spacing.md,
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
    borderRadius: BorderRadius.md,
  },
  pickerLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  formLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  notesInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: Spacing.xs,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  tripRow: {
    paddingHorizontal: Spacing.md,
  },
  tripIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
