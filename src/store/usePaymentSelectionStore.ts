import { create } from 'zustand';
import {
  DEFAULT_PAYMENT_METHOD_ID,
  type PaymentMethodId,
} from '@shared/data/paymentMethods';

interface PaymentSelectionState {
  selectedId: PaymentMethodId;
  setSelected: (id: PaymentMethodId) => void;
}

export const usePaymentSelectionStore = create<PaymentSelectionState>((set) => ({
  selectedId: DEFAULT_PAYMENT_METHOD_ID,
  setSelected: (id) => set({ selectedId: id }),
}));
