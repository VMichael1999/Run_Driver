import type { CartItem } from '@store/useCartStore';

/** Redondeo a céntimos. */
function round2(amount: number) {
  return Math.round(amount * 100) / 100;
}

export interface ChargeInput {
  items: CartItem[];
  /** Costo de envío sin cupón. Con ENVIOGRATIS aplicado queda en 0. */
  deliveryFee: number;
  freeDelivery: boolean;
  /** Recojo en local: sin costo de envío. */
  pickup?: boolean;
  /** Cupón de porcentaje sobre el subtotal (15 % de Burger Ruta). */
  couponPercent?: number;
}

export interface Charges {
  /** Unidades elegidas para pagar. */
  count: number;
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
}

/**
 * Montos del pedido en un solo lugar: el carrito, el checkout, el diálogo y el seguimiento leen de aquí.
 * Solo cuentan los productos marcados en el carrito.
 */
export function computeCharges({ items, deliveryFee, freeDelivery, pickup = false, couponPercent = 0 }: ChargeInput): Charges {
  const selected = items.filter((item) => item.selected);
  const subtotal = round2(selected.reduce((total, item) => total + item.unitPrice * item.quantity, 0));
  const delivery = pickup || freeDelivery ? 0 : deliveryFee;
  const discount = round2((subtotal * couponPercent) / 100);
  return {
    count: selected.reduce((total, item) => total + item.quantity, 0),
    subtotal,
    delivery,
    discount,
    total: round2(subtotal + delivery - discount),
  };
}

/** Precio de una fila del carrito (unidad × cantidad). */
export function lineTotal(item: Pick<CartItem, 'unitPrice' | 'quantity'>) {
  return round2(item.unitPrice * item.quantity);
}
