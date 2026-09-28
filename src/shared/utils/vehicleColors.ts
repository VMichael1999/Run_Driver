/** Tres tonos por color para pintar el auto con acabado metalizado: brillo, base y sombra. */
export interface VehiclePaint {
  light: string;
  base: string;
  dark: string;
}

const PAINTS: Record<string, VehiclePaint> = {
  plata: { light: '#EEF1F4', base: '#A9B1B9', dark: '#5E666E' },
  blanco: { light: '#FFFFFF', base: '#E3E7EB', dark: '#A2AAB2' },
  negro: { light: '#5E6771', base: '#2A3037', dark: '#111417' },
  gris: { light: '#B4BBC1', base: '#6F777E', dark: '#3C4146' },
  azul: { light: '#8DB0EA', base: '#2456A8', dark: '#0E2A5C' },
  rojo: { light: '#F2868C', base: '#B3202A', dark: '#5E0C12' },
  verde: { light: '#7CC7A1', base: '#1F6B4A', dark: '#0C3322' },
  dorado: { light: '#F1DFB6', base: '#B8995F', dark: '#6E5630' },
};

// Nombres con que suelen venir los colores y el tono que les corresponde.
const ALIASES: Record<string, keyof typeof PAINTS> = {
  plateado: 'plata',
  gris: 'gris',
  plomo: 'gris',
  grafito: 'gris',
  blanco: 'blanco',
  perla: 'blanco',
  negro: 'negro',
  azul: 'azul',
  celeste: 'azul',
  rojo: 'rojo',
  granate: 'rojo',
  guinda: 'rojo',
  verde: 'verde',
  dorado: 'dorado',
  champagne: 'dorado',
  beige: 'dorado',
  plata: 'plata',
};

const FALLBACK_ORDER = Object.keys(PAINTS);

const normalize = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/**
 * Pintura del auto según su color real ("Plata", "Azul metálico", "gris plomo"…), porque el
 * pasajero lo usa para encontrarlo en la calle. Si el color no se reconoce, se elige uno a
 * partir de la placa: el mismo auto siempre sale del mismo color.
 */
export function getVehiclePaint(colorName: string, plate = ''): VehiclePaint {
  const words = normalize(colorName).split(/[^a-z]+/).filter(Boolean);
  for (const word of words) {
    const key = ALIASES[word];
    if (key) return PAINTS[key];
  }
  let hash = 0;
  for (const char of normalize(plate)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PAINTS[FALLBACK_ORDER[hash % FALLBACK_ORDER.length]];
}
