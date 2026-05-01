import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { ClienteStackParamList } from '@navigation/types';
import { useScheduledTripsStore } from '@store/useScheduledTripsStore';
import type { ScheduledTrip } from './types';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Nav = NativeStackNavigationProp<ClienteStackParamList, 'ProgramarViaje'>;

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
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.85}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Programar viaje</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Cuando lo necesitas?</Text>

          <View style={styles.pickerRow}>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => showPicker('date')}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
              <Text style={styles.pickerLabel}>
                {scheduledFor.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => showPicker('time')}
              activeOpacity={0.85}
            >
              <Ionicons name="time-outline" size={18} color={Colors.primary} />
              <Text style={styles.pickerLabel}>
                {scheduledFor.getHours().toString().padStart(2, '0')}:
                {scheduledFor.getMinutes().toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.formLabel}>Notas (opcional)</Text>
          <TextInput
            style={styles.input}
            value={notes}
            onChangeText={setNotes}
            placeholder="Detalles adicionales para el conductor"
            placeholderTextColor={Colors.textDisabled}
            multiline
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSchedule} activeOpacity={0.85}>
            <Text style={styles.saveButtonText}>Programar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Proximos viajes</Text>

        {trips.length === 0 ? (
          <Text style={styles.emptyText}>No tienes viajes programados.</Text>
        ) : (
          trips.map((trip) => (
            <View key={trip.id} style={styles.tripCard}>
              <View style={styles.tripIconWrap}>
                <Ionicons name="alarm-outline" size={22} color={Colors.primary} />
              </View>
              <View style={styles.tripInfo}>
                <Text style={styles.tripDate}>{formatDateTime(trip.scheduledFor)}</Text>
                {trip.notes ? <Text style={styles.tripNotes}>{trip.notes}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => confirmCancel(trip)} activeOpacity={0.85}>
                <Ionicons name="close-circle-outline" size={24} color={Colors.error} />
              </TouchableOpacity>
            </View>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7fb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.primary,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  headerTitle: { color: Colors.white, fontFamily: FontFamily.bold, fontSize: FontSize.lg },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.md },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  formTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  pickerRow: { flexDirection: 'row', gap: Spacing.sm },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#eef2f7',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  pickerLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.textPrimary },
  formLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: '#eef2f7',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  saveButtonText: { color: Colors.white, fontFamily: FontFamily.bold, fontSize: FontSize.md },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  tripIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eaf2ff',
  },
  tripInfo: { flex: 1 },
  tripDate: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.textPrimary },
  tripNotes: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary },
});
