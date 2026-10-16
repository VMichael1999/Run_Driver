import { PRODUCT_DETAILS, PRODUCTS } from '../data/mock';
import { defaultSelections, optionsLabel, unitPrice } from '../utils/productPrice';

const crispy = PRODUCTS['crispy-pollo'];
const { groups } = PRODUCT_DETAILS['crispy-pollo'];

describe('precio del producto', () => {
  it('abre con Regular elegido y sin opcionales', () => {
    const selections = defaultSelections(groups);
    expect(selections.tamano).toEqual(['regular']);
    expect(unitPrice(crispy.price, groups, selections)).toBe(15.9);
  });

  it('con 1 unidad y solo queso cuesta S/ 18.90', () => {
    const selections = { ...defaultSelections(groups), adicionales: ['queso'] };
    expect(unitPrice(crispy.price, groups, selections)).toBe(18.9);
  });

  it('Regular + Queso + BBQ + Ensalada de col + Limonada = S/ 31.90 (× 3 = S/ 95.70)', () => {
    const selections = {
      ...defaultSelections(groups),
      adicionales: ['queso'],
      salsas: ['bbq'],
      acompanamientos: ['col'],
      bebidas: ['limonada'],
    };
    const price = unitPrice(crispy.price, groups, selections);
    expect(price).toBe(31.9);
    expect(Math.round(price * 3 * 100) / 100).toBe(95.7);
    expect(optionsLabel(groups, selections)).toBe('Regular · Queso extra · BBQ · Ensalada de col · Limonada');
  });

  it('el tamaño reemplaza al precio base', () => {
    const selections = { ...defaultSelections(groups), tamano: ['combo'] };
    expect(unitPrice(crispy.price, groups, selections)).toBe(27.9);
  });
});
