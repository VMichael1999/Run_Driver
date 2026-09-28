import { useMemo } from 'react';
import { useTripHistoryStore } from '@store/useTripHistoryStore';
import { MOCK_TRIP_HISTORY } from '../data/mockHistory';
import type { TripHistoryItem } from '../types';

/** Viajes del historial: los de esta sesión primero y después los de ejemplo. */
export function useTripHistory(): TripHistoryItem[] {
  const trips = useTripHistoryStore((state) => state.trips);
  return useMemo(() => [...trips, ...MOCK_TRIP_HISTORY], [trips]);
}

/** Un viaje del historial por su id, o null si ya no existe. */
export function useTripById(tripId: string): TripHistoryItem | null {
  const trips = useTripHistory();
  return useMemo(() => trips.find((trip) => trip.id === tripId) ?? null, [trips, tripId]);
}
