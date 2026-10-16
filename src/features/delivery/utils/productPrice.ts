import type { OptionGroup } from '../data/mock';

/** Opciones elegidas por grupo: id del grupo → ids de opciones. */
export type Selections = Record<string, string[]>;

/** Al abrir el producto: la primera opción de cada grupo "Elige 1" y nada en los opcionales. */
export function defaultSelections(groups: OptionGroup[]): Selections {
  return Object.fromEntries(groups.map((group) => [group.id, group.type === 'single' ? [group.options[0].id] : []]));
}

/** Precio de una unidad: el tamaño reemplaza al precio base y los opcionales suman. */
export function unitPrice(basePrice: number, groups: OptionGroup[], selections: Selections) {
  let price = basePrice;
  for (const group of groups) {
    const chosen = group.options.filter((option) => selections[group.id]?.includes(option.id));
    if (group.type === 'single') {
      if (chosen[0]) price = chosen[0].price;
    } else {
      price += chosen.reduce((total, option) => total + option.price, 0);
    }
  }
  return Math.round(price * 100) / 100;
}

/** Línea de opciones para el carrito: "Regular · Queso extra · BBQ · …". */
export function optionsLabel(groups: OptionGroup[], selections: Selections) {
  return groups
    .flatMap((group) => group.options.filter((option) => selections[group.id]?.includes(option.id)))
    .map((option) => option.label)
    .join(' · ');
}
