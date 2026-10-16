import { create } from 'zustand';
import { DELIVERY_ADDRESS, MAP_POINTS } from '../data/mock';

export interface CheckoutAddress {
  label: string;
  detail: string;
  coordinate: { latitude: number; longitude: number };
}

const HOME_ADDRESS: CheckoutAddress = {
  label: DELIVERY_ADDRESS.label,
  detail: DELIVERY_ADDRESS.detail,
  coordinate: MAP_POINTS.home,
};

export type Fulfillment = 'delivery' | 'pickup';

interface CheckoutState {
  fulfillment: Fulfillment;
  /** Cupón del local elegido en "Mis cupones" (porcentaje sobre el subtotal). */
  couponId: string | null;
  address: CheckoutAddress;
  setAddress: (address: CheckoutAddress) => void;
  setFulfillment: (fulfillment: Fulfillment) => void;
  setCoupon: (couponId: string | null) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  fulfillment: 'delivery',
  couponId: null,
  address: HOME_ADDRESS,
  setAddress: (address) => set({ address }),
  setFulfillment: (fulfillment) => set({ fulfillment }),
  setCoupon: (couponId) => set({ couponId }),
  reset: () => set({ fulfillment: 'delivery', couponId: null, address: HOME_ADDRESS }),
}));
