import { create } from 'zustand';

export interface CartItem {
  id: string;
  productId: string;
  restaurantId: string;
  name: string;
  /** Opciones elegidas en una línea (tamaño, adicionales…). */
  options: string;
  /** Precio de una unidad con sus opciones, en soles. */
  unitPrice: number;
  quantity: number;
  /** Casilla del carrito: solo los elegidos se pagan. */
  selected: boolean;
}

export type NewCartItem = Omit<CartItem, 'id' | 'selected'>;

interface CartState {
  items: CartItem[];
  addItem: (item: NewCartItem) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  toggleSelected: (id: string) => void;
  setAllSelected: (selected: boolean) => void;
  clear: () => void;
}

/** Carrito con el que empieza la simulación: 5 productos (luego se suman 3 Crispy de pollo). */
export const INITIAL_CART: CartItem[] = [
  {
    id: 'combo-ruta',
    productId: 'combo-ruta',
    restaurantId: 'burgerRuta',
    name: 'Combo Ruta y papas',
    options: 'Regular',
    unitPrice: 22.9,
    quantity: 2,
    selected: true,
  },
  {
    id: 'alitas-bbq',
    productId: 'alitas-bbq',
    restaurantId: 'burgerRuta',
    name: 'Alitas BBQ',
    options: '6 piezas',
    unitPrice: 24.9,
    quantity: 1,
    selected: true,
  },
  {
    id: 'torta-tres-leches',
    productId: 'torta-tres-leches',
    restaurantId: 'burgerRuta',
    name: 'Torta tres leches',
    options: '1 porción',
    unitPrice: 7.9,
    quantity: 2,
    selected: true,
  },
];

/** Misma línea de opciones = mismo producto: se suma la cantidad en vez de duplicar la fila. */
function sameLine(a: Pick<CartItem, 'productId' | 'options'>, b: Pick<CartItem, 'productId' | 'options'>) {
  return a.productId === b.productId && a.options === b.options;
}

export const useCartStore = create<CartState>((set) => ({
  items: INITIAL_CART,
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((current) => sameLine(current, item));
      if (existing) {
        return {
          items: state.items.map((current) =>
            current.id === existing.id ? { ...current, quantity: current.quantity + item.quantity } : current,
          ),
        };
      }
      const id = `${item.productId}-${Date.now()}`;
      return { items: [...state.items, { ...item, id, selected: true }] };
    }),
  setQuantity: (id, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((item) => item.id !== id)
          : state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
    })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  toggleSelected: (id) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)),
    })),
  setAllSelected: (selected) => set((state) => ({ items: state.items.map((item) => ({ ...item, selected })) })),
  clear: () => set({ items: [] }),
}));

/** Unidades en el carrito (el contador del ícono y de la pestaña). */
export function cartCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}
