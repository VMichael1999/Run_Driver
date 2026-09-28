import { create } from 'zustand';
import type { TaxiRequest, TaxiTrip, DriverAlert, TripDiscount } from '@shared/types';

type TaxiFlow = 'idle' | 'searching' | 'offer_received' | 'in_trip';

interface TaxiState {
  flow: TaxiFlow;
  request: TaxiRequest | null;
  activeTrip: TaxiTrip | null;
  pendingOffers: DriverAlert[];
  setRequest: (request: TaxiRequest) => void;
  setFlow: (flow: TaxiFlow) => void;
  setPendingOffers: (offers: DriverAlert[]) => void;
  /** `discount` queda fijo para el viaje aunque luego cambien el cupón o el día. */
  acceptOffer: (driver: DriverAlert, discount?: TripDiscount | null) => void;
  endTrip: () => void;
  clearRequest: () => void;
}

export const useTaxiStore = create<TaxiState>((set, get) => ({
  flow: 'idle',
  request: null,
  activeTrip: null,
  pendingOffers: [],
  setRequest: (request) => set({ request, flow: 'searching' }),
  setFlow: (flow) => set({ flow }),
  setPendingOffers: (pendingOffers) => set({ pendingOffers }),
  acceptOffer: (driver, discount = null) => {
    const { request } = get();
    if (!request) return;
    set({ activeTrip: { request, driver, discount }, flow: 'in_trip', pendingOffers: [] });
  },
  endTrip: () => set({ activeTrip: null, request: null, flow: 'idle' }),
  clearRequest: () => set({ request: null, pendingOffers: [], flow: 'idle' }),
}));
