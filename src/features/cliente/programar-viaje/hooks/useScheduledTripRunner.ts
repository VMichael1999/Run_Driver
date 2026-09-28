import { useEffect, useRef } from 'react';
import { useScheduledTripsStore } from '@store/useScheduledTripsStore';
import type { ScheduledTrip } from '../types';

/** Cada cuánto se revisa si llegó la hora de algún viaje programado. */
const CHECK_INTERVAL_MS = 15 * 1000;

/**
 * Cuando llega la hora de un viaje programado lo quita de la lista y llama a `onDue`, que
 * lanza la búsqueda. Sin backend, solo funciona mientras la app está abierta.
 */
export function useScheduledTripRunner(onDue: (trip: ScheduledTrip) => void) {
  const trips = useScheduledTripsStore((s) => s.trips);
  const cancelTrip = useScheduledTripsStore((s) => s.cancelTrip);
  const onDueRef = useRef(onDue);
  onDueRef.current = onDue;

  useEffect(() => {
    const check = () => {
      const due = trips.find(
        (trip) => trip.scheduledFor <= Date.now() && trip.origin && trip.destination && trip.service,
      );
      if (!due) return;
      cancelTrip(due.id);
      onDueRef.current(due);
    };
    check();
    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [trips, cancelTrip]);
}
