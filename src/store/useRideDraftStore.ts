import { create } from 'zustand';
import type { Coordinates, LocationMarker, PaymentMethod } from '@shared/types';
import { allRoutes, lugaresDummy } from '@data/rutasDummy';

type HomeTab = 'ride' | 'rental' | 'outstation';

interface RideDraftState {
  origin: LocationMarker | null;
  destination: LocationMarker | null;
  paymentMethod: PaymentMethod;
  comment: string;
  selectedHomeTab: HomeTab;
  routePoints: Coordinates[];
  setOrigin: (origin: LocationMarker | null) => void;
  setDestination: (destination: LocationMarker | null) => void;
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
  paymentMethod: { amount: 25.5, currency: 'S/', mode: 'Efectivo' },
  comment: 'Pickup near the main entrance',
  selectedHomeTab: 'ride',
  routePoints: allRoutes[0],
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setComment: (comment) => set({ comment }),
  setSelectedHomeTab: (selectedHomeTab) => set({ selectedHomeTab }),
  setRoutePoints: (routePoints) => set({ routePoints }),
}));
