import { create } from 'zustand';
import type { CartItem } from '@store/useCartStore';
import type { Charges } from '../utils/cobro';
import type { CheckoutAddress, Fulfillment } from './useCheckoutStore';

/** Pedido ya confirmado: una copia de lo que se pagó, para que cambiar el carrito no lo altere. */
export interface ActiveOrder {
  id: string;
  restaurantId: string;
  items: CartItem[];
  charges: Charges;
  paymentLabel: string;
  address: CheckoutAddress;
  fulfillment: Fulfillment;
  /** Momento de la confirmación; la simulación avanza desde aquí. */
  startedAt: number;
}

interface ActiveOrderState {
  order: ActiveOrder | null;
  rating: number;
  placeOrder: (order: Omit<ActiveOrder, 'id' | 'startedAt'>) => ActiveOrder;
  rate: (stars: number) => void;
  clear: () => void;
}

/** Número del pedido del mockup. */
const ORDER_ID = '2318';

export const useActiveOrderStore = create<ActiveOrderState>((set) => ({
  order: null,
  rating: 0,
  placeOrder: (input) => {
    const order = { ...input, id: ORDER_ID, startedAt: Date.now() };
    set({ order, rating: 0 });
    return order;
  },
  rate: (stars) => set({ rating: stars }),
  clear: () => set({ order: null, rating: 0 }),
}));
