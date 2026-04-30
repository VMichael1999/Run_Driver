import axios from 'axios';
import { GOOGLE_MAPS_API_KEY } from '@config/maps';
import type { Coordinates, LocationMarker } from '@shared/types';
import { decodePolyline } from '@shared/utils/mapUtils';

const PLACES_AUTOCOMPLETE_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json';

export interface PlaceSuggestion {
  placeId: string;
  title: string;
  subtitle: string;
}

function normalizePlaceName(title: string, subtitle: string): string {
  return subtitle ? `${title} ${subtitle}` : title;
}

export function createPlacesSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function autocompletePlaces(
  query: string,
  sessionToken: string,
  location?: Coordinates,
): Promise<PlaceSuggestion[]> {
  const response = await axios.get(PLACES_AUTOCOMPLETE_URL, {
    params: {
      input: query,
      key: GOOGLE_MAPS_API_KEY,
      sessiontoken: sessionToken,
      language: 'es',
      components: 'country:pe',
      ...(location
        ? {
            location: `${location.latitude},${location.longitude}`,
            radius: 10000,
          }
        : {}),
    },
  });

  if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
    throw new Error(response.data.error_message || 'No se pudo buscar direcciones');
  }

  return (response.data.predictions || []).map((prediction: any) => ({
    placeId: prediction.place_id,
    title: prediction.structured_formatting?.main_text || prediction.description,
    subtitle: prediction.structured_formatting?.secondary_text || '',
  }));
}

export async function getPlaceDetails(placeId: string, sessionToken: string): Promise<LocationMarker> {
  const response = await axios.get(PLACE_DETAILS_URL, {
    params: {
      place_id: placeId,
      key: GOOGLE_MAPS_API_KEY,
      sessiontoken: sessionToken,
      language: 'es',
      fields: 'name,formatted_address,geometry',
    },
  });

  if (response.data.status !== 'OK') {
    throw new Error(response.data.error_message || 'No se pudo obtener el detalle del lugar');
  }

  const result = response.data.result;
  const name = result.name || result.formatted_address || 'Ubicacion seleccionada';
  const formatted = result.formatted_address || '';

  return {
    placeName: normalizePlaceName(name, formatted.replace(name, '').replace(/^,\s*/, '')),
    position: {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
    },
  };
}

export async function getRoutePolyline(origin: Coordinates, destination: Coordinates): Promise<Coordinates[]> {
  const response = await axios.get(DIRECTIONS_URL, {
    params: {
      origin: `${origin.latitude},${origin.longitude}`,
      destination: `${destination.latitude},${destination.longitude}`,
      key: GOOGLE_MAPS_API_KEY,
      language: 'es',
      mode: 'driving',
    },
  });

  if (response.data.status !== 'OK') {
    throw new Error(response.data.error_message || 'No se pudo calcular la ruta');
  }

  const route = response.data.routes?.[0];
  const encoded = route?.overview_polyline?.points;
  return decodePolyline(encoded || '');
}
