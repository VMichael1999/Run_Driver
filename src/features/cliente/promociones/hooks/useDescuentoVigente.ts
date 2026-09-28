import { useEffect, useMemo, useState } from 'react';
import type { TripDiscount } from '@shared/types';
import { usePromotionsStore } from '@store/usePromotionsStore';
import type { PromotionsService } from '../services/promotionsService';
import { promotionsService as defaultService } from '../services/promotionsService';
import type { Promotion } from '../types';
import { getBestDiscount } from '../utils/descuentos';

interface UseDescuentoVigenteOptions {
  service?: PromotionsService;
  /** Fecha con la que se evalúan las promociones; por defecto, hoy. */
  date?: Date;
}

/**
 * El descuento que se aplicaría a un viaje pedido ahora: el mayor entre el cupón guardado y las
 * promociones vigentes. Si las promociones no cargan, se usa solo el cupón.
 */
export function useDescuentoVigente(options: UseDescuentoVigenteOptions = {}): TripDiscount | null {
  const service = options.service ?? defaultService;
  const appliedCoupon = usePromotionsStore((s) => s.appliedCoupon);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const dateKey = options.date?.getTime();

  useEffect(() => {
    let cancelled = false;
    service
      .listActivePromotions()
      .then((next) => {
        if (!cancelled) setPromotions(next);
      })
      .catch(() => {
        if (!cancelled) setPromotions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [service]);

  return useMemo(
    () => getBestDiscount(appliedCoupon, promotions, dateKey === undefined ? new Date() : new Date(dateKey)),
    [appliedCoupon, promotions, dateKey],
  );
}
