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

export interface Product {
  id: string;
  restaurantId: string;
  name: string;
  price: number;
  description: string;
  kcal: number;
  minutes: number;
  image: ImageSourcePropType;
  tint: string;
}

/** Carta de Burger Ruta. */
export const PRODUCTS: Record<string, Product> = {
  'ruta-clasica': {
    id: 'ruta-clasica',
    restaurantId: 'burgerRuta',
    name: 'Ruta Clásica',
    price: 18.9,
    description: 'Dos carnes, salsa de la casa, lechuga, queso, pepinillos y cebolla en pan de tres pisos.',
    kcal: 650,
    minutes: 12,
    image: FOOD_IMAGES.hamburguesa,
    tint: '#F4E3CF',
  },
  'crispy-pollo': {
    id: 'crispy-pollo',
    restaurantId: 'burgerRuta',
    name: 'Crispy de pollo',
    price: 15.9,
    description: 'Pollo apanado crocante con lechuga y mayonesa cremosa en pan tostado.',
    kcal: 420,
    minutes: 12,
    image: FOOD_IMAGES.pollo,
    tint: '#F6E6D3',
  },
  'papas-fritas': {
    id: 'papas-fritas',
    restaurantId: 'burgerRuta',
    name: 'Papas fritas',
    price: 9.9,
    description: '',
    kcal: 340,
    minutes: 8,
    image: FOOD_IMAGES.papas,
    tint: '#F6E6D3',
  },
  'alitas-bbq': {
    id: 'alitas-bbq',
    restaurantId: 'burgerRuta',
    name: 'Alitas BBQ',
    price: 24.9,
    description: '',
    kcal: 520,
    minutes: 15,
    image: FOOD_IMAGES.carne,
    tint: '#F1DFDA',
  },
};

export interface Voucher {
  id: string;
  title: string;
  lines: string[];
  /** Cupones disponibles (el contador xN). */
  available: number;
  /** Logo del local, o el boleto de Run si es un cupón de la app. */
  issuer: { type: 'store'; restaurantId: string } | { type: 'run' };
  /** Solo los cupones del local tienen "Reclamar" en el mockup. */
  claimable: boolean;
  code?: string;
}

/** Detalle del local (del-05). Solo Burger Ruta tiene carta en el mockup. */
export const RESTAURANT_DETAILS: Record<
  string,
  {
    reviews: string;
    cuisine: string;
    deliveryLabel: string;
    fromMinutes: number;
    heroGradient: [string, string, string];
    groupDiscount: string;
    vouchers: Voucher[];
    forYou: string[];
    sections: { title: string; countLabel: string; productIds: string[] }[];
  }
> = {
  burgerRuta: {
    reviews: '12.4 mil',
    cuisine: 'Hamburguesas',
    deliveryLabel: 'Envío gratis',
    fromMinutes: 20,
    heroGradient: ['#F6D7B5', '#C98446', '#7A4521'],
    groupDiscount: '15% dscto',
    vouchers: [
      {
        id: 'br15',
        title: '15% dscto',
        lines: ['Mín. S/ 60.00', 'Solo este local'],
        available: 4,
        issuer: { type: 'store', restaurantId: 'burgerRuta' },
        claimable: true,
      },
      {
        id: 'enviogratis',
        title: 'Envío gratis',
        lines: ['Código ENVIOGRATIS'],
        available: 3,
        issuer: { type: 'run' },
        claimable: false,
        code: 'ENVIOGRATIS',
      },
    ],
    forYou: ['ruta-clasica', 'crispy-pollo', 'papas-fritas', 'alitas-bbq'],
    sections: [{ title: 'Hamburguesas', countLabel: '4 productos', productIds: ['ruta-clasica', 'crispy-pollo'] }],
  },
};
