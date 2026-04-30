import { create } from 'zustand';
import type { Coordinates, LocationMarker, PaymentMethod } from '@shared/types';
import { allRoutes, lugaresDummy } from '@data/rutasDummy';

type HomeTab = 'ride' | 'rental' | 'outstation';

interface RideDraftState {
  origin: LocationMarker | null;
  destination: LocationMarker | null;
  extraStops: LocationMarker[];
  paymentMethod: PaymentMethod;
  comment: string;
  selectedHomeTab: HomeTab;
  routePoints: Coordinates[];
  setOrigin: (origin: LocationMarker | null) => void;
  setDestination: (destination: LocationMarker | null) => void;
  addExtraStop: (stop: LocationMarker) => void;
  removeExtraStop: (index: number) => void;
  clearExtraStops: () => void;
  setPaymentMethod: (paymentMethod: PaymentMethod) => void;
  setComment: (comment: string) => void;
  setSelectedHomeTab: (selectedHomeTab: HomeTab) => void;
  setRoutePoints: (routePoints: Coordinates[]) => void;
}

const defaultOrigin: LocationMarker = {
  position: lugaresDummy.origenes[1].coords,
  placeName: 'Fairfax Drive Newark, NJ 07...',
};

const defaultDestination: LocationMarker = {
  position: lugaresDummy.destinos[0].coords,
  placeName: '3963 Mattson Street Portland...',
};

export const useRideDraftStore = create<RideDraftState>((set) => ({
  origin: defaultOrigin,
  destination: defaultDestination,
  extraStops: [],
  paymentMethod: { amount: 25.5, currency: 'S/', mode: 'Efectivo' },
  comment: 'Pickup near the main entrance',
  selectedHomeTab: 'ride',
  routePoints: allRoutes[0],
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  addExtraStop: (stop) => set((state) => ({ extraStops: [...state.extraStops, stop] })),
  removeExtraStop: (index) => set((state) => ({ extraStops: state.extraStops.filter((_, i) => i !== index) })),
  clearExtraStops: () => set({ extraStops: [] }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setComment: (comment) => set({ comment }),
  setSelectedHomeTab: (selectedHomeTab) => set({ selectedHomeTab }),
  setRoutePoints: (routePoints) => set({ routePoints }),
}));
