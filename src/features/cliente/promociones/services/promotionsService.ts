import type { CouponValidationResult, Promotion } from '../types';

const SIMULATED_DELAY_MS = 250;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const STATIC_PROMOTIONS: Promotion[] = [
  {
    id: 'p-001',
    title: 'Primer viaje al 50%',
    description: 'Aplica para nuevos clientes en su primera carrera.',
    discountPercent: 50,
    validUntil: '2026-12-31',
  },
  {
    id: 'p-002',
    title: 'Fines de semana 15% off',
    description: 'Sabados y domingos en viajes dentro de Lima.',
    discountPercent: 15,
    validUntil: '2026-09-30',
  },
];

const KNOWN_COUPONS: Record<string, { discountPercent: number; description: string }> = {
  RUN10: { discountPercent: 10, description: 'Descuento RUN10' },
  RUN25: { discountPercent: 25, description: 'Descuento RUN25' },
};

export interface PromotionsService {
  listActivePromotions: () => Promise<Promotion[]>;
  validateCoupon: (code: string) => Promise<CouponValidationResult>;
}

export const createPromotionsService = (): PromotionsService => ({
  listActivePromotions: async () => {
    await wait(SIMULATED_DELAY_MS);
    return STATIC_PROMOTIONS;
  },
  validateCoupon: async (code) => {
    await wait(SIMULATED_DELAY_MS);
    const normalized = code.trim().toUpperCase();
    const match = KNOWN_COUPONS[normalized];
    if (!match) {
      return { ok: false, coupon: null, error: 'invalid_code' };
    }
    return {
      ok: true,
      coupon: {
        code: normalized,
        discountPercent: match.discountPercent,
        description: match.description,
        appliedAt: Date.now(),
      },
      error: null,
    };
  },
});

export const promotionsService = createPromotionsService();
