import { create } from 'zustand';
import type { TaxiTrip } from '@shared/types';
import type { TripHistoryItem } from '@features/historial/types';
import { applyDiscount } from '@features/cliente/promociones/utils/descuentos';

interface TripHistoryState {
  trips: TripHistoryItem[];
  addCompletedTrip: (trip: TaxiTrip) => void;
}

function buildCompletedTrip(trip: TaxiTrip): TripHistoryItem {
  const { request, driver, discount = null } = trip;

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
    price: applyDiscount(driver.price, discount),
    currency: driver.currency,
    status: 'completed',
    ...(discount ? { originalPrice: driver.price, discount } : {}),
    vehicle: { model: driver.vehicleModel, color: driver.vehicleColor, plate: driver.vehiclePlate },
    paymentMode: request.paymentMethod.mode,
    route: {
      origin: request.origin.position,
      destination: request.destination.position,
      points: request.routePoints ?? [],
    },
  };
}

export const useTripHistoryStore = create<TripHistoryState>((set) => ({
  trips: [],
  addCompletedTrip: (trip) => {
    const historyItem = buildCompletedTrip(trip);
    set((state) => ({ trips: [historyItem, ...state.trips] }));
  },
}));
