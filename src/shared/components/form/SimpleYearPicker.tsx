import React from 'react';
import { Alert } from 'react-native';
import { PressableField } from './PressableField';

interface Props {
  labelText: string;
  text?: string;
  currentDate?: Date | null;
  minDate?: Date;
  maxDate?: Date;
  onConfirm: (date: Date) => void;
}

export function SimpleYearPicker({ labelText, text, currentDate, minDate, maxDate, onConfirm }: Props) {
  const handlePress = () => {
    const minYear = minDate?.getFullYear() ?? 1990;
    const maxYear = maxDate?.getFullYear() ?? new Date().getFullYear();
    const fallbackYear = currentDate?.getFullYear() ?? maxYear;
    Alert.alert(
      'Anio de fabricacion',
      `Rango disponible: ${minYear} - ${maxYear}. Se seleccionara ${fallbackYear} como valor demo.`,
      [{ text: 'Aceptar', onPress: () => onConfirm(new Date(fallbackYear, 0, 1)) }],
    );
  };

  return <PressableField label={labelText} value={text} placeholder="Seleccionar anio" onPress={handlePress} />;
}
