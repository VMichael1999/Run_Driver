export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  validUntil: string;
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
