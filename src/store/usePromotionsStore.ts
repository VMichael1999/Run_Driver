import { create } from 'zustand';
import type { AppliedCoupon } from '@features/cliente/promociones/types';

interface PromotionsState {
  appliedCoupon: AppliedCoupon | null;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  clearCoupon: () => void;
}

export const usePromotionsStore = create<PromotionsState>((set) => ({
  appliedCoupon: null,
  setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
  clearCoupon: () => set({ appliedCoupon: null }),
}));
