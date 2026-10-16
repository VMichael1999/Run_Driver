import type { ImageSourcePropType } from 'react-native';

/**
 * Datos simulados del modo delivery (sección 5 del prompt). Todos cuadran entre sí; no cambiarlos.
 * Las ilustraciones son Fluent Emoji de Microsoft (licencia MIT), igual que en el mockup.
 */

export const FOOD_IMAGES = {
  moto: require('../../../../assets/delivery/moto.png'),
  plato: require('../../../../assets/delivery/plato.png'),
  hamburguesa: require('../../../../assets/delivery/hamburguesa.png'),
  pizza: require('../../../../assets/delivery/pizza.png'),
  sushi: require('../../../../assets/delivery/sushi.png'),
  pollo: require('../../../../assets/delivery/pollo.png'),
  camion: require('../../../../assets/delivery/camion.png'),
  cafe: require('../../../../assets/delivery/cafe.png'),
  papas: require('../../../../assets/delivery/papas.png'),
  torta: require('../../../../assets/delivery/torta.png'),
  carne: require('../../../../assets/delivery/carne.png'),
} satisfies Record<string, ImageSourcePropType>;

export const DELIVERY_ADDRESS = {
  label: 'Casa',
  street: 'Av. Arequipa 2450, Lince',
  detail: 'Av. Arequipa 2450, dpto. 702, Lince',
};

export interface Category {
  id: string;
  label: string;
  image: ImageSourcePropType;
}

export const CATEGORIES: Category[] = [
  { id: 'todo', label: 'Todo', image: FOOD_IMAGES.plato },
  { id: 'burgers', label: 'Burgers', image: FOOD_IMAGES.hamburguesa },
  { id: 'pizza', label: 'Pizza', image: FOOD_IMAGES.pizza },
  { id: 'sushi', label: 'Sushi', image: FOOD_IMAGES.sushi },
  { id: 'pollo', label: 'Pollo', image: FOOD_IMAGES.pollo },
];

export interface Deal {
  id: string;
  eyebrow: string;
  title: string;
  code: string;
  image: ImageSourcePropType;
}

export const DEALS: Deal[] = [
  { id: 'run30', eyebrow: 'TODO TU PEDIDO', title: '30% DSCTO', code: 'RUN30', image: FOOD_IMAGES.pizza },
  { id: 'enviogratis', eyebrow: 'COSTO DE ENVÍO', title: 'GRATIS', code: 'ENVIOGRATIS', image: FOOD_IMAGES.camion },
];

export interface Restaurant {
  id: string;
  name: string;
  /** Iniciales del logo y sus colores fijos (son parte de la marca ficticia del local). */
  logo: { initials: string; background: string; color: string };
  /** Color suave detrás de la foto (TINT en el mockup). */
  tint: string;
  image: ImageSourcePropType;
  discountPercent: number;
  rating: number;
  minutes: number;
  distanceKm: number;
}

export const RESTAURANTS: Record<string, Restaurant> = {
  cafeMalecon: {
    id: 'cafeMalecon',
    name: 'Café Malecón – Barranco',
    logo: { initials: 'CM', background: '#3B2A20', color: '#F7E7C9' },
    tint: '#EFE4D8',
    image: FOOD_IMAGES.cafe,
    discountPercent: 5,
    rating: 4.6,
    minutes: 10,
    distanceKm: 0.6,
  },
  donaRosa: {
    id: 'donaRosa',
    name: 'Pollos Doña Rosa – Lince',
    logo: { initials: 'DR', background: '#C8261B', color: '#FFFFFF' },
    tint: '#F6E6D3',
    image: FOOD_IMAGES.pollo,
    discountPercent: 20,
    rating: 4.5,
    minutes: 15,
    distanceKm: 0.9,
  },
  burgerRuta: {
    id: 'burgerRuta',
    name: 'Burger Ruta – Lince',
    logo: { initials: 'BR', background: '#111519', color: '#D4E838' },
    tint: '#F4E3CF',
    image: FOOD_IMAGES.hamburguesa,
    discountPercent: 15,
    rating: 4.6,
    minutes: 20,
    distanceKm: 1.2,
  },
  napoli: {
    id: 'napoli',
    name: 'Pizzería Napoli – San Isidro',
    logo: { initials: 'NP', background: '#1F6B3A', color: '#FFFFFF' },
    tint: '#F6DDD3',
    image: FOOD_IMAGES.pizza,
    discountPercent: 25,
    rating: 4.6,
    minutes: 25,
    distanceKm: 2.1,
  },
};

/** Secciones de locales del inicio, en el orden del mockup. */
export const HOME_SECTIONS: { id: string; title: string; restaurantIds: string[] }[] = [
  { id: 'rapida', title: 'Entrega rápida · 20 min o menos', restaurantIds: ['cafeMalecon', 'donaRosa'] },
  { id: 'cerca', title: 'Locales cerca de ti', restaurantIds: ['burgerRuta', 'napoli'] },
];

export const COURIER = {
  name: 'Luis Quispe',
  firstName: 'Luis',
  initials: 'LQ',
  rating: 4.92,
  trips: 1208,
  vehicle: 'Toyota Yaris · Gris',
  plate: 'BKL-482',
};

export type ActiveOrderStatus = 'preparando' | 'en-camino';

/** Pedido en curso que muestra el aviso flotante del inicio. */
export const ACTIVE_ORDER = {
  id: '2318',
  restaurantId: 'burgerRuta',
  status: 'preparando' as ActiveOrderStatus,
  arrivesAt: '20:36',
  minutesLeft: { preparando: 17, 'en-camino': 11 },
};
