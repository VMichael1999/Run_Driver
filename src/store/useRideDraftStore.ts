import { create } from 'zustand';
import type { Coordinates, LocationMarker, PaymentMethod } from '@shared/types';

type HomeTab = 'ride' | 'rental' | 'outstation';

/**
 * Cómo se llegó a pedir el viaje desde el inicio:
 * - choose: desde "¿A dónde vas?" o un favorito; se elige el servicio de la lista.
 * - ride: tarjeta "Viaje"; va directo con Confort.
 * - auction: tarjeta "Subasta"; va directo a proponer el precio.
 * - schedule: tarjeta "Programar"; se elige servicio y fecha, y el viaje queda guardado.
 */
export type RequestEntryMode = 'choose' | 'ride' | 'auction' | 'schedule';

interface RideDraftState {
  origin: LocationMarker | null;
  destination: LocationMarker | null;
  extraStops: LocationMarker[];
  paymentMethod: PaymentMethod;
  comment: string;
  selectedHomeTab: HomeTab;
  routePoints: Coordinates[];
  entryMode: RequestEntryMode;
  setOrigin: (origin: LocationMarker | null) => void;
  setDestination: (destination: LocationMarker | null) => void;
  addExtraStop: (stop: LocationMarker) => void;
  removeExtraStop: (index: number) => void;
  clearExtraStops: () => void;
  setPaymentMethod: (paymentMethod: PaymentMethod) => void;
  setComment: (comment: string) => void;
  setSelectedHomeTab: (selectedHomeTab: HomeTab) => void;
  setRoutePoints: (routePoints: Coordinates[]) => void;
  setEntryMode: (entryMode: RequestEntryMode) => void;
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
  entryMode: 'choose',
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  addExtraStop: (stop) => set((state) => ({ extraStops: [...state.extraStops, stop] })),
  removeExtraStop: (index) => set((state) => ({ extraStops: state.extraStops.filter((_, i) => i !== index) })),
  clearExtraStops: () => set({ extraStops: [] }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setComment: (comment) => set({ comment }),
  setSelectedHomeTab: (selectedHomeTab) => set({ selectedHomeTab }),
  setRoutePoints: (routePoints) => set({ routePoints }),
  setEntryMode: (entryMode) => set({ entryMode }),
  resetDraft: () => set({
    destination: null,
    extraStops: [],
    comment: '',
    routePoints: [],
  }),
}));
