import { act } from '@testing-library/react-native';
import { cartCount, INITIAL_CART, useCartStore } from '../useCartStore';

const crispy = {
  productId: 'crispy-pollo',
  restaurantId: 'burgerRuta',
  name: 'Crispy de pollo',
  options: 'Regular · Queso extra · BBQ · Ensalada de col · Limonada',
  unitPrice: 31.9,
  quantity: 3,
};

describe('useCartStore', () => {
  beforeEach(() => {
    act(() => {
      useCartStore.setState({ items: INITIAL_CART });
    });
  });

  it('empieza con los 5 productos de la simulación', () => {
    expect(cartCount(useCartStore.getState().items)).toBe(5);
  });

  it('al agregar 3 Crispy de pollo el contador pasa de 5 a 8', () => {
    act(() => {
      useCartStore.getState().addItem(crispy);
    });

    expect(cartCount(useCartStore.getState().items)).toBe(8);
    expect(useCartStore.getState().items).toHaveLength(4);
  });

  it('el mismo producto con las mismas opciones suma cantidad en la misma fila', () => {
    act(() => {
      useCartStore.getState().addItem(crispy);
      useCartStore.getState().addItem({ ...crispy, quantity: 1 });
    });

    const lines = useCartStore.getState().items.filter((item) => item.productId === 'crispy-pollo');
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(4);
  });

  it('con otras opciones crea otra fila', () => {
    act(() => {
      useCartStore.getState().addItem(crispy);
      useCartStore.getState().addItem({ ...crispy, options: 'Grande', quantity: 1 });
    });

    expect(useCartStore.getState().items.filter((item) => item.productId === 'crispy-pollo')).toHaveLength(2);
  });

  it('cambiar la cantidad a 0 borra la fila', () => {
    act(() => {
      useCartStore.getState().setQuantity('alitas-bbq', 0);
    });

    expect(useCartStore.getState().items.map((item) => item.id)).not.toContain('alitas-bbq');
  });

  it('elige y quita productos para pagar', () => {
    act(() => {
      useCartStore.getState().toggleSelected('torta-tres-leches');
    });
    expect(useCartStore.getState().items.find((item) => item.id === 'torta-tres-leches')?.selected).toBe(false);

    act(() => {
      useCartStore.getState().setAllSelected(true);
    });
    expect(useCartStore.getState().items.every((item) => item.selected)).toBe(true);
  });

  it('borra una fila', () => {
    act(() => {
      useCartStore.getState().removeItem('combo-ruta');
    });

    expect(cartCount(useCartStore.getState().items)).toBe(3);
  });
});
