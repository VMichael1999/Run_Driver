import type { TripDiscount } from '@shared/types';
import type { AppliedCoupon, Promotion } from '../types';

/** Fecha local en formato YYYY-MM-DD, comparable con `Promotion.validUntil`. */
function toLocalIsoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** La promoción se aplica sola en esa fecha (la de primer viaje nunca, es informativa). */
export function isPromotionActiveOn(promotion: Promotion, date: Date): boolean {
  if (toLocalIsoDate(date) > promotion.validUntil) return false;
  if (promotion.rule === 'weekend') {
    const weekday = date.getDay();
    return weekday === 0 || weekday === 6;
  }
  return false;
}

/** El mayor descuento entre el cupón y las promociones vigentes; no se acumulan. */
export function getBestDiscount(
  coupon: AppliedCoupon | null,
  promotions: Promotion[],
  date: Date,
): TripDiscount | null {
  const candidates: TripDiscount[] = promotions
    .filter((promotion) => isPromotionActiveOn(promotion, date))
    .map((promotion) => ({ source: 'promotion', label: promotion.title, percent: promotion.discountPercent }));
  if (coupon) {
    candidates.push({ source: 'coupon', label: coupon.code, percent: coupon.discountPercent });
  }
  // Con el mismo porcentaje gana el cupón: así se consume y no queda guardado para otro viaje.
  return candidates.reduce<TripDiscount | null>(
    (best, current) => (!best || current.percent >= best.percent ? current : best),
    null,
  );
}

/** Lo que paga el pasajero, redondeado a céntimos. */
export function applyDiscount(price: number, discount: TripDiscount | null | undefined): number {
  if (!discount || discount.percent <= 0) return price;
  const percent = Math.min(100, discount.percent);
  // price * (100 - percent) ya es el monto en céntimos; el 1e-6 evita que 49.555 quede en 49.55.
  return Math.round(price * (100 - percent) + 1e-6) / 100;
}
