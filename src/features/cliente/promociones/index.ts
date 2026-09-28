export { PromocionesScreen } from './PromocionesScreen';
export { usePromociones } from './hooks/usePromociones';
export { useDescuentoVigente } from './hooks/useDescuentoVigente';
export { applyDiscount, getBestDiscount, isPromotionActiveOn } from './utils/descuentos';
export { promotionsService, createPromotionsService } from './services/promotionsService';
export type {
  Promotion,
  PromotionRule,
  AppliedCoupon,
  CouponValidationError,
  CouponValidationResult,
} from './types';
export type { PromotionsService } from './services/promotionsService';
