import * as Location from 'expo-location';
import type { LocationMarker } from '@shared/types';

export async function getPlaceNameFromCoordinates(latitude: number, longitude: number): Promise<string> {
  const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
  const first = reverse[0];

  if (!first) {
    return 'Ubicacion seleccionada';
  }

  const parts = [first.street, first.streetNumber, first.district, first.city].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Ubicacion seleccionada';
}

export async function getCurrentLocationMarker(): Promise<LocationMarker | null> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  let placeName = 'Mi ubicacion actual';

  try {
    placeName = await getPlaceNameFromCoordinates(position.coords.latitude, position.coords.longitude);
  } catch {
    // Keep fallback label when reverse geocoding fails.
  }

  return {
    placeName,
    position: {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    },
  };
}
