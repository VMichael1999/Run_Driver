import { applyDiscount, getBestDiscount, isPromotionActiveOn } from '../descuentos';
import type { AppliedCoupon, Promotion } from '../../types';

const WEEKEND: Promotion = {
  id: 'p-002',
  title: 'Fines de semana 15 % menos',
  description: '',
  discountPercent: 15,
  validUntil: '2026-09-30',
  rule: 'weekend',
};

const FIRST_TRIP: Promotion = {
  id: 'p-001',
  title: 'Primer viaje al 50 %',
  description: '',
  discountPercent: 50,
  validUntil: '2026-12-31',
  rule: 'first_trip',
};

const coupon = (code: string, discountPercent: number): AppliedCoupon => ({
  code,
  discountPercent,
  description: '',
  appliedAt: 0,
});

// Fechas locales: new Date(año, mes 0-11, día).
const SATURDAY = new Date(2026, 8, 26);
const MONDAY = new Date(2026, 8, 28);
const SATURDAY_AFTER_EXPIRY = new Date(2026, 9, 3);

describe('isPromotionActiveOn', () => {
  it('la de fin de semana aplica sábado y no lunes', () => {
    expect(isPromotionActiveOn(WEEKEND, SATURDAY)).toBe(true);
    expect(isPromotionActiveOn(WEEKEND, MONDAY)).toBe(false);
  });

  it('deja de aplicar después de validUntil', () => {
    expect(isPromotionActiveOn(WEEKEND, SATURDAY_AFTER_EXPIRY)).toBe(false);
  });

  it('la de primer viaje nunca se aplica sola', () => {
    expect(isPromotionActiveOn(FIRST_TRIP, SATURDAY)).toBe(false);
  });
});

describe('getBestDiscount', () => {
  it('sin cupón ni promoción vigente no hay descuento', () => {
    expect(getBestDiscount(null, [WEEKEND, FIRST_TRIP], MONDAY)).toBeNull();
  });

  it('usa el cupón cuando no hay promoción vigente', () => {
    expect(getBestDiscount(coupon('RUN10', 10), [WEEKEND], MONDAY)).toEqual({
      source: 'coupon',
      label: 'RUN10',
      percent: 10,
    });
  });

  it('no acumula: el fin de semana (15 %) gana a RUN10', () => {
    expect(getBestDiscount(coupon('RUN10', 10), [WEEKEND], SATURDAY)).toEqual({
      source: 'promotion',
      label: 'Fines de semana 15 % menos',
      percent: 15,
    });
  });

  it('no acumula: RUN25 gana al fin de semana', () => {
    expect(getBestDiscount(coupon('RUN25', 25), [WEEKEND], SATURDAY)?.label).toBe('RUN25');
  });

  it('con el mismo porcentaje gana el cupón', () => {
    expect(getBestDiscount(coupon('RUN15', 15), [WEEKEND], SATURDAY)?.source).toBe('coupon');
  });
});

describe('applyDiscount', () => {
  it('descuenta el porcentaje y redondea a céntimos', () => {
    expect(applyDiscount(20, { source: 'coupon', label: 'RUN10', percent: 10 })).toBe(18);
    expect(applyDiscount(35, { source: 'coupon', label: 'RUN10', percent: 10 })).toBe(31.5);
    expect(applyDiscount(58.3, { source: 'promotion', label: 'x', percent: 15 })).toBe(49.56);
  });

  it('sin descuento devuelve el precio igual', () => {
    expect(applyDiscount(25.5, null)).toBe(25.5);
    expect(applyDiscount(25.5, undefined)).toBe(25.5);
  });
});
