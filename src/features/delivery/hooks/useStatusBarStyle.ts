import React from 'react';
import { setStatusBarStyle, type StatusBarStyle } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';

/** Fija el color de la barra de estado mientras la pantalla está enfocada (las pestañas siguen montadas). */
export function useStatusBarStyle(style: StatusBarStyle) {
  useFocusEffect(
    React.useCallback(() => {
      setStatusBarStyle(style, true);
    }, [style]),
  );
}
