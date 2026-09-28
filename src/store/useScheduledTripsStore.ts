import { create } from 'zustand';
import type { LocationMarker } from '@shared/types';
import type {
  NewScheduledTripInput,
  ScheduledTrip,
} from '@features/cliente/programar-viaje/types';

type ScheduledTripPatch = Partial<Omit<ScheduledTrip, 'id' | 'createdAt'>>;

interface ScheduledTripsState {
  trips: ScheduledTrip[];
  scheduleTrip: (input: NewScheduledTripInput) => ScheduledTrip;
  cancelTrip: (id: string) => void;
  updateTrip: (id: string, patch: ScheduledTripPatch) => void;
  /** Agrega una parada al final; la ruta guardada se descarta para recalcularla. */
  addStop: (id: string, stop: LocationMarker) => void;
  removeStop: (id: string, index: number) => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useScheduledTripsStore = create<ScheduledTripsState>((set) => ({
  trips: [],
  scheduleTrip: (input) => {
    const next: ScheduledTrip = {
      ...input,
      id: generateId(),
      notes: input.notes?.trim() || undefined,
      createdAt: Date.now(),
    };
    set((state) => ({
      trips: [...state.trips, next].sort((a, b) => a.scheduledFor - b.scheduledFor),
    }));
    return next;
  },
  cancelTrip: (id) =>
    set((state) => ({
      trips: state.trips.filter((trip) => trip.id !== id),
    })),
  updateTrip: (id, patch) =>
    set((state) => ({
      trips: state.trips.map((trip) => (trip.id === id ? { ...trip, ...patch } : trip)),
    })),
  addStop: (id, stop) =>
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === id ? { ...trip, stops: [...(trip.stops ?? []), stop], routePoints: undefined } : trip,
      ),
    })),
  removeStop: (id, index) =>
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === id
          ? { ...trip, stops: (trip.stops ?? []).filter((_, i) => i !== index), routePoints: undefined }
          : trip,
      ),
    })),
}));
