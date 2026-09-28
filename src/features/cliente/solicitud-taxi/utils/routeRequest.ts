import type { Coordinates, LocationMarker, PaymentMethod, TaxiRequest } from '@shared/types';
import { getRoutePolyline } from '@shared/services/googleMapsService';
import { calculateDistance } from '@shared/utils/mapUtils';

/** Máximo de paradas intermedias por viaje. */
export const MAX_EXTRA_STOPS = 2;

interface BuildTaxiRequestInput {
  origin: LocationMarker;
  destination: LocationMarker;
  stops?: LocationMarker[];
  paymentMethod: PaymentMethod;
  comment?: string;
}

/**
 * Arma la solicitud con la ruta que pasa por las paradas. Si Google no responde, la ruta
 * queda como líneas rectas entre los puntos para que el viaje se pueda pedir igual.
 */
export async function buildTaxiRequest({
  origin,
  destination,
  stops = [],
  paymentMethod,
  comment,
}: BuildTaxiRequestInput): Promise<TaxiRequest> {
  let routePoints: Coordinates[];
  try {
    routePoints = await getRoutePolyline(
      origin.position,
      destination.position,
      stops.map((stop) => stop.position),
    );
  } catch {
    routePoints = [origin.position, ...stops.map((stop) => stop.position), destination.position];
  }
  return {
    origin,
    destination,
    stops: stops.length ? stops : undefined,
    routePoints,
    paymentMethod,
    comment: comment?.trim() || undefined,
  };
}

/** Distancia en línea recta pasando por las paradas, en km. */
export function tripDistanceKm(origin: LocationMarker, destination: LocationMarker, stops: LocationMarker[] = []) {
  const points = [origin, ...stops, destination].map((p) => p.position);
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += calculateDistance(points[i - 1], points[i]);
  return total;
}

/** Identifica el recorrido; sirve para saber si la solicitud quedó desactualizada. */
export function routeKey(origin?: LocationMarker | null, destination?: LocationMarker | null, stops: LocationMarker[] = []) {
  const key = (p?: LocationMarker | null) => (p ? `${p.position.latitude.toFixed(6)},${p.position.longitude.toFixed(6)}` : '-');
  return [origin, ...stops, destination].map(key).join('|');
}
