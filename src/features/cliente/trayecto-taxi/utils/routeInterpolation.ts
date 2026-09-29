import type { Coordinates } from '@shared/types';
import { calculateBearing, calculateDistance } from '@shared/utils/mapUtils';

export interface RouteProfile {
  cumulativeDistances: number[];
  totalDistance: number;
}

/**
 * Elimina puntos duplicados o consecutivos a menos de 1 metro para evitar saltos o divisiones por cero.
 */
export function sanitizeRoutePoints(points: Coordinates[]): Coordinates[] {
  if (points.length <= 1) return points;
  const result: Coordinates[] = [points[0]];
  for (let i = 1; i < points.length; i += 1) {
    const prev = result[result.length - 1];
    const curr = points[i];
    const dist = calculateDistance(prev, curr);
    // Solo conservar puntos con al menos 1 metro de separación
    if (dist >= 0.001) {
      result.push(curr);
    }
  }
  // Asegurar que el último punto de destino se preserve
  const lastPoint = points[points.length - 1];
  if (result.length < 2 || calculateDistance(result[result.length - 1], lastPoint) >= 0.001) {
    result.push(lastPoint);
  }
  return result;
}

/**
 * Precalcula las distancias acumuladas en kilómetros a lo largo de los puntos de la ruta.
 */
export function buildRouteProfile(rawPoints: Coordinates[]): RouteProfile {
  const points = sanitizeRoutePoints(rawPoints);
  if (points.length < 2) {
    return { cumulativeDistances: [0], totalDistance: 0 };
  }

  const cumulativeDistances: number[] = [0];
  let totalDistance = 0;

  for (let i = 0; i < points.length - 1; i += 1) {
    const d = calculateDistance(points[i], points[i + 1]);
    totalDistance += d;
    cumulativeDistances.push(totalDistance);
  }

  return { cumulativeDistances, totalDistance };
}

export interface InterpolatedPoint {
  position: Coordinates;
  segmentIndex: number;
  segmentBearing: number;
  remainingPoints: Coordinates[];
}

/**
 * Encuentra el punto interpolado en la polilínea para una distancia dada (en km).
 * Utiliza lookahead (distancia de anticipación) para que el ángulo apunte suavemente a lo largo de la curva.
 */
export function interpolateRoutePosition(
  rawPoints: Coordinates[],
  profile: RouteProfile,
  distanceKm: number,
  lookaheadKm: number = 0.012,
): InterpolatedPoint {
  const { cumulativeDistances, totalDistance } = profile;
  const points =
    rawPoints.length === cumulativeDistances.length
      ? rawPoints
      : sanitizeRoutePoints(rawPoints);

  if (points.length === 0) {
    return {
      position: { latitude: 0, longitude: 0 },
      segmentIndex: 0,
      segmentBearing: 0,
      remainingPoints: [],
    };
  }

  if (points.length === 1 || totalDistance <= 0 || distanceKm <= 0) {
    const initialBearing = points.length >= 2 ? calculateBearing(points[0], points[1]) : 0;
    return {
      position: points[0],
      segmentIndex: 0,
      segmentBearing: initialBearing,
      remainingPoints: [...points],
    };
  }

  if (distanceKm >= totalDistance) {
    const lastIndex = points.length - 1;
    const finalBearing = calculateBearing(points[lastIndex - 1], points[lastIndex]);
    return {
      position: points[lastIndex],
      segmentIndex: lastIndex - 1,
      segmentBearing: finalBearing,
      remainingPoints: [points[lastIndex]],
    };
  }

  // Buscar el segmento [k, k+1] tal que cumulativeDistances[k] <= distanceKm <= cumulativeDistances[k+1]
  let k = 0;
  while (k < cumulativeDistances.length - 1 && cumulativeDistances[k + 1] < distanceKm) {
    k += 1;
  }

  const p0 = points[k];
  const p1 = points[k + 1] || p0;
  const segStart = cumulativeDistances[k];
  const segEnd = cumulativeDistances[k + 1] || segStart;
  const segLen = segEnd - segStart;

  const alpha = segLen > 0 ? Math.min(Math.max((distanceKm - segStart) / segLen, 0), 1) : 0;

  const position: Coordinates = {
    latitude: p0.latitude + alpha * (p1.latitude - p0.latitude),
    longitude: p0.longitude + alpha * (p1.longitude - p0.longitude),
  };

  // El bearing es EXACTAMENTE la dirección del segmento actual [p0, p1] en el que se desplaza el auto.
  // El auto sigue rigurosamente el rastro de la polilínea y solo gira al alcanzar el vértice de la esquina.
  let segmentBearing = calculateBearing(p0, p1);
  if (segmentBearing === 0 && p0.latitude === p1.latitude && p0.longitude === p1.longitude && k > 0) {
    segmentBearing = calculateBearing(points[k - 1], points[k]);
  }

  const remainingPoints = [position, ...points.slice(k + 1)];

  return {
    position,
    segmentIndex: k,
    segmentBearing,
    remainingPoints,
  };
}


/**
 * Interpola suavemente dos ángulos angulares en grados considerando el salto 360°/0°.
 */
export function interpolateShortestAngle(fromAngle: number, toAngle: number, factor: number): number {
  const diff = ((toAngle - fromAngle + 540) % 360) - 180;
  return ((fromAngle + diff * factor + 360) % 360);
}

