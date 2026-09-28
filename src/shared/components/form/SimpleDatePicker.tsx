import React from 'react';
import { Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PressableField } from './PressableField';
import { useThemeStore } from '@store/useThemeStore';

interface Props {
  labelText: string;
  text?: string;
  currentTime?: Date | null;
  minTime?: Date;
  maxTime?: Date;
  onConfirm: (date: Date) => void;
}

export function SimpleDatePicker({ labelText, text, currentTime, minTime, maxTime, onConfirm }: Props) {
  const [open, setOpen] = React.useState(false);
  const isDark = useThemeStore((s) => s.isDark);

  if (Platform.OS === 'web') {
    return (
      <PressableField
        label={labelText}
        value={text}
        placeholder="Seleccionar fecha"
        onPress={() => Alert.alert('No disponible', 'El selector nativo de fecha no está disponible en web.')}
      />
    );
  }

  return (
    <>
      <PressableField label={labelText} value={text} placeholder="Seleccionar fecha" onPress={() => setOpen(true)} />
      {open ? (
        <DateTimePicker
          value={currentTime || new Date()}
          mode="date"
          themeVariant={isDark ? 'dark' : 'light'}
          minimumDate={minTime}
          maximumDate={maxTime}
          onChange={(_, selectedDate) => {
            setOpen(false);
            if (selectedDate) onConfirm(selectedDate);
          }}
        />
      ) : null}
    </>
  );
}
