import React from 'react';
import { Polyline, type LatLng } from 'react-native-maps';
import { useAppTheme } from '@theme/useAppTheme';

interface RoutePolylineProps {
  coordinates: LatLng[];
}

/**
 * Ruta del diseño: línea del color del tema (negra de día, lima de noche) con borde.
 * Se pasa strokeColors además de strokeColor porque en iOS con Google Maps solo
 * strokeColors pinta la línea; sin él sale el azul por defecto.
 */
export function RoutePolyline({ coordinates }: RoutePolylineProps) {
  const theme = useAppTheme();
  if (coordinates.length < 2) return null;
  return (
    <>
      <Polyline
        coordinates={coordinates}
        strokeWidth={10}
        strokeColor={theme.routeCase}
        strokeColors={[theme.routeCase]}
        lineCap="round"
        lineJoin="round"
      />
      <Polyline
        coordinates={coordinates}
        strokeWidth={5}
        strokeColor={theme.route}
        strokeColors={[theme.route]}
        lineCap="round"
        lineJoin="round"
      />
    </>
  );
}
