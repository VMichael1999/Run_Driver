import { create } from 'zustand';
import type { Coordinates, LocationMarker, PaymentMethod } from '@shared/types';

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
  resetDraft: () => void;
}

export const useRideDraftStore = create<RideDraftState>((set) => ({
  origin: null,
  destination: null,
  extraStops: [],
  paymentMethod: { amount: 25.5, currency: 'S/', mode: 'Efectivo' },
  comment: '',
  selectedHomeTab: 'ride',
  routePoints: [],
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  addExtraStop: (stop) => set((state) => ({ extraStops: [...state.extraStops, stop] })),
  removeExtraStop: (index) => set((state) => ({ extraStops: state.extraStops.filter((_, i) => i !== index) })),
  clearExtraStops: () => set({ extraStops: [] }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setComment: (comment) => set({ comment }),
  setSelectedHomeTab: (selectedHomeTab) => set({ selectedHomeTab }),
  setRoutePoints: (routePoints) => set({ routePoints }),
  resetDraft: () => set({
    destination: null,
    extraStops: [],
    comment: '',
    routePoints: [],
  }),
}));
