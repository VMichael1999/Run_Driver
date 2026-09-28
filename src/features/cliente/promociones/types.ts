/**
 * Cuándo se aplica una promoción sin que el pasajero haga nada.
 * - `weekend`: sábados y domingos, hasta `validUntil`.
 * - `first_trip`: solo informativa; la app todavía no sabe si es el primer viaje.
 */
export type PromotionRule = 'weekend' | 'first_trip';

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  validUntil: string;
  rule: PromotionRule;
}

export interface AppliedCoupon {
  code: string;
  discountPercent: number;
  description: string;
  appliedAt: number;
}

export type CouponValidationError = 'invalid_code' | 'expired' | 'already_used';

export interface CouponValidationResult {
  ok: boolean;
  coupon: AppliedCoupon | null;
  error: CouponValidationError | null;
}
