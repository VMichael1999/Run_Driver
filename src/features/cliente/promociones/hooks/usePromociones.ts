import { useCallback, useEffect, useState } from 'react';
import { usePromotionsStore } from '@store/usePromotionsStore';
import type { PromotionsService } from '../services/promotionsService';
import { promotionsService as defaultService } from '../services/promotionsService';
import type { AppliedCoupon, CouponValidationError, Promotion } from '../types';

interface UsePromocionesOptions {
  service?: PromotionsService;
}

interface UsePromocionesResult {
  promotions: Promotion[];
  isLoading: boolean;
  error: string | null;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<{ ok: boolean; error: CouponValidationError | null }>;
  removeCoupon: () => void;
  refresh: () => Promise<void>;
}

const COUPON_ERROR_MESSAGES: Record<CouponValidationError, string> = {
  invalid_code: 'El codigo no es valido.',
  expired: 'El codigo expiro.',
  already_used: 'Ya usaste este codigo.',
};

export function usePromociones(options: UsePromocionesOptions = {}): UsePromocionesResult {
  const service = options.service ?? defaultService;
  const appliedCoupon = usePromotionsStore((s) => s.appliedCoupon);
  const setAppliedCoupon = usePromotionsStore((s) => s.setAppliedCoupon);
  const clearCoupon = usePromotionsStore((s) => s.clearCoupon);

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await service.listActivePromotions();
      setPromotions(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las promociones');
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const applyCoupon = useCallback(
    async (code: string) => {
      const result = await service.validateCoupon(code);
      if (result.ok && result.coupon) {
        setAppliedCoupon(result.coupon);
        setError(null);
        return { ok: true, error: null };
      }
      const message = result.error ? COUPON_ERROR_MESSAGES[result.error] : 'No se pudo aplicar el codigo';
      setError(message);
      return { ok: false, error: result.error };
    },
    [service, setAppliedCoupon],
  );

  const removeCoupon = useCallback(() => {
    clearCoupon();
  }, [clearCoupon]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    promotions,
    isLoading,
    error,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    refresh: load,
  };
}
