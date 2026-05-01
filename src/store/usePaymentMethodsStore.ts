import { create } from 'zustand';
import type {
  NewPaymentMethodInput,
  SavedPaymentMethod,
} from '@features/cliente/metodos-pago/types';

interface PaymentMethodsState {
  methods: SavedPaymentMethod[];
  addMethod: (input: NewPaymentMethodInput) => SavedPaymentMethod;
  removeMethod: (id: string) => void;
  setDefault: (id: string) => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const usePaymentMethodsStore = create<PaymentMethodsState>((set, get) => ({
  methods: [],
  addMethod: (input) => {
    const isFirst = get().methods.length === 0;
    const next: SavedPaymentMethod = {
      id: generateId(),
      mode: input.mode,
      alias: input.alias.trim(),
      last4: input.last4,
      isDefault: isFirst,
      createdAt: Date.now(),
    };
    set((state) => ({ methods: [next, ...state.methods] }));
    return next;
  },
  removeMethod: (id) =>
    set((state) => {
      const remaining = state.methods.filter((m) => m.id !== id);
      const removedDefault = state.methods.find((m) => m.id === id)?.isDefault ?? false;
      if (removedDefault && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isDefault: true };
      }
      return { methods: remaining };
    }),
  setDefault: (id) =>
    set((state) => ({
      methods: state.methods.map((m) => ({ ...m, isDefault: m.id === id })),
    })),
}));
