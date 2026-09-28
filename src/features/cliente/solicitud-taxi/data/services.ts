import type { VehicleServiceOption } from '../components/ServiceSelectionSheet';

/** Servicios que se ofrecen al pedir un viaje, en el orden en que se muestran. */
export const VEHICLE_SERVICES: VehicleServiceOption[] = [
  {
    id: 'subasta',
    name: 'Subasta',
    subtitle: 'Tú propones el precio',
    price: 0,
    currency: 'S/',
    etaMinutes: 4,
    seats: 4,
    image: require('../../../../../assets/servicios/recorte/subasta.png'),
    isAuction: true,
  },
  {
    id: 'xlcab_go',
    name: 'XLCAB GO',
    subtitle: 'Rápido y económico',
    price: 25.5,
    currency: 'S/',
    etaMinutes: 4,
    seats: 4,
    image: require('../../../../../assets/servicios/recorte/xlcab-go.png'),
  },
  {
    id: 'confort',
    name: 'Confort',
    subtitle: 'Autos nuevos con aire acondicionado',
    price: 35.0,
    currency: 'S/',
    etaMinutes: 5,
    seats: 4,
    image: require('../../../../../assets/servicios/recorte/confort.png'),
  },
  {
    id: 'premium',
    name: 'Premium',
    subtitle: 'Sedanes ejecutivos de alta gama',
    price: 54.0,
    currency: 'S/',
    etaMinutes: 8,
    seats: 4,
    image: require('../../../../../assets/servicios/recorte/premium.png'),
  },
  {
    id: 'xl',
    name: 'XL',
    subtitle: 'Camionetas y vans familiares',
    price: 64.0,
    currency: 'S/',
    etaMinutes: 10,
    seats: 6,
    image: require('../../../../../assets/servicios/recorte/xl.png'),
  },
  {
    id: 'pet',
    name: 'Pet',
    subtitle: 'Viaja seguro con tu mascota',
    price: 48.0,
    currency: 'S/',
    etaMinutes: 7,
    seats: 4,
    image: require('../../../../../assets/servicios/recorte/pet.png'),
  },
  {
    id: 'espera_ahorra',
    name: 'Espera y Ahorra',
    subtitle: 'Tarifa reducida esperando unos minutos más',
    price: 42.0,
    currency: 'S/',
    etaMinutes: 6,
    seats: 4,
    image: require('../../../../../assets/servicios/recorte/espera-ahorra.png'),
  },
];

/** Imagen del servicio por id; la tarjeta de un viaje programado la usa. */
export const serviceImage = (id: string) => VEHICLE_SERVICES.find((s) => s.id === id)?.image;
