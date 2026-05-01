import { create } from 'zustand';
import type { TaxiTrip } from '@shared/types';
import type { TripHistoryItem } from '@features/historial/types';

interface TripHistoryState {
  trips: TripHistoryItem[];
  addCompletedTrip: (trip: TaxiTrip) => void;
}

function buildCompletedTrip(trip: TaxiTrip): TripHistoryItem {
  const { request, driver } = trip;

  return {
    id: `trip-${Date.now()}`,
    date: new Date(),
    driver: {
      id: driver.phone || driver.vehiclePlate,
      name: driver.driverName,
      avatarUrl: driver.imageUrl,
      yearsAtCompany: 1,
      rideCount: 1000,
    },
    pickup: {
      label: 'Recogida',
      address: request.origin.placeName,
    },
    dropoff: {
      label: 'Destino',
      address: request.destination.placeName,
    },
    extraStop: null,
    price: driver.price,
    currency: driver.currency,
    status: 'completed',
  };
}

export const useTripHistoryStore = create<TripHistoryState>((set) => ({
  trips: [],
  addCompletedTrip: (trip) => {
    const historyItem = buildCompletedTrip(trip);
    set((state) => ({ trips: [historyItem, ...state.trips] }));
  },
}));
