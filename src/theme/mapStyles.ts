import type { MapStyleElement } from 'react-native-maps';

const mapStyleNight: MapStyleElement[] = require('../../assets/legacy/maps/map_style_night.json');

/**
 * Estilo único del mapa para toda la app (el mismo que usa "Viaje en curso"):
 * mapa estándar de Google en modo claro, con sus colores y lugares, y estilo nocturno en modo oscuro.
 */
export function getMapStyle(isDark: boolean): MapStyleElement[] | undefined {
  return isDark ? mapStyleNight : undefined;
}
