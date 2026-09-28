import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';
import { AppButton } from '@shared/components/ui/AppButton';

interface TripScheduleModalProps {
  visible: boolean;
  initialDate?: Date;
  /** Fecha más temprana que se puede elegir; por defecto, ahora. */
  minimumDate?: Date;
  onConfirm: (date: Date) => void;
  onClose: () => void;
}

export function TripScheduleModal({
  visible,
  initialDate,
  minimumDate,
  onConfirm,
  onClose,
}: TripScheduleModalProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [date, setDate] = useState<Date>(initialDate ?? new Date(Date.now() + 30 * 60 * 1000));
  const [mode, setMode] = useState<'date' | 'time'>('date');

  const onChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleConfirm = () => {
    onConfirm(date);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar">
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, paddingBottom: Math.max(insets.bottom, Spacing.lg) },
            Shadow.sheet,
          ]}
          accessible={false}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.line }]} />
          <Text style={[styles.title, { color: theme.text }]}>Programar viaje</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Elige la fecha y hora de recogida
          </Text>

          <View style={styles.pickerWrap}>
            <DateTimePicker
              value={date}
              mode={mode}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChange}
              minimumDate={minimumDate ?? new Date()}
            />
          </View>

          {Platform.OS === 'ios' ? (
            <View style={styles.toggleRow}>
              <AppButton
                label={mode === 'date' ? 'Cambiar a hora' : 'Cambiar a fecha'}
                variant="ghost"
                size="sm"
                onPress={() => setMode(mode === 'date' ? 'time' : 'date')}
              />
            </View>
          ) : null}

          <View style={styles.actions}>
            <AppButton
              label={`Confirmar para ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              variant="primary"
              onPress={handleConfirm}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.scrim,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: -8,
  },
  pickerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  toggleRow: {
    alignItems: 'center',
  },
  actions: {
    marginTop: Spacing.xs,
  },
});
