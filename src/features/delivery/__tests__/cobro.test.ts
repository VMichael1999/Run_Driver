import { INITIAL_CART, type CartItem } from '@store/useCartStore';
import { computeCharges, lineTotal } from '../utils/cobro';

const crispy: CartItem = {
  id: 'crispy',
  productId: 'crispy-pollo',
  restaurantId: 'burgerRuta',
  name: 'Crispy de pollo',
  options: 'Regular · Queso extra · BBQ · Ensalada de col · Limonada',
  unitPrice: 31.9,
  quantity: 3,
  selected: true,
};
const cart = [...INITIAL_CART, crispy];

describe('computeCharges', () => {
  it('carrito de 8 productos: S/ 182.20 con ENVIOGRATIS', () => {
    const charges = computeCharges({ items: cart, deliveryFee: 5, freeDelivery: true });
    expect(charges).toMatchObject({ count: 8, subtotal: 182.2, delivery: 0, discount: 0, total: 182.2 });
  });

  it('checkout sin las Alitas y con 15 %: subtotal 157.30, cupón −23.60, total 133.70', () => {
    const items = cart.filter((item) => item.id !== 'alitas-bbq');
    const charges = computeCharges({ items, deliveryFee: 5, freeDelivery: true, couponPercent: 15 });
    expect(charges).toMatchObject({ subtotal: 157.3, delivery: 0, discount: 23.6, total: 133.7 });
  });

  it('solo cuenta los productos marcados', () => {
    const items = cart.map((item) => (item.id === 'crispy' ? { ...item, selected: false } : item));
    expect(computeCharges({ items, deliveryFee: 5, freeDelivery: true })).toMatchObject({ count: 5, subtotal: 86.5 });
  });

  it('sin ENVIOGRATIS cobra el envío, salvo en recojo', () => {
    expect(computeCharges({ items: cart, deliveryFee: 5, freeDelivery: false }).total).toBe(187.2);
    expect(computeCharges({ items: cart, deliveryFee: 5, freeDelivery: false, pickup: true }).delivery).toBe(0);
  });

  it('precio de la fila', () => {
    expect(lineTotal(crispy)).toBe(95.7);
  });
});
