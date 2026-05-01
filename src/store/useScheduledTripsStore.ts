import { create } from 'zustand';
import type {
  NewScheduledTripInput,
  ScheduledTrip,
} from '@features/cliente/programar-viaje/types';

interface ScheduledTripsState {
  trips: ScheduledTrip[];
  scheduleTrip: (input: NewScheduledTripInput) => ScheduledTrip;
  cancelTrip: (id: string) => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useScheduledTripsStore = create<ScheduledTripsState>((set) => ({
  trips: [],
  scheduleTrip: (input) => {
    const next: ScheduledTrip = {
      id: generateId(),
      origin: input.origin,
      destination: input.destination,
      scheduledFor: input.scheduledFor,
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
}));
