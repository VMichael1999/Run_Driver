import type { Coordinates, PaymentMode, TripDiscount } from '@shared/types';

export type TripStatus = 'completed' | 'cancelled' | 'in_progress';

export interface TripDriver {
  id: string;
  name: string;
  avatarUrl: string;
  yearsAtCompany: number;
  rideCount: number;
}

export interface TripStop {
  label: string;
  address: string;
}

export interface TripVehicle {
  model: string;
  color: string;
  plate: string;
}

export interface TripRoute {
  origin: Coordinates;
  destination: Coordinates;
  /** Puntos de la ruta trazada; vacío si no se guardó. */
  points: Coordinates[];
}

export interface TripHistoryItem {
  id: string;
  date: Date;
  driver: TripDriver;
  pickup: TripStop;
  dropoff: TripStop | null;
  extraStop: TripStop | null;
  /** Lo que pagó el pasajero, con el descuento ya aplicado. */
  price: number;
  currency: string;
  status: TripStatus;
  /** Tarifa del conductor antes del descuento; solo si hubo descuento. */
  originalPrice?: number;
  discount?: TripDiscount | null;
  /** Datos para el detalle; los viajes antiguos pueden no tenerlos. */
  vehicle?: TripVehicle;
  paymentMode?: PaymentMode;
  route?: TripRoute;
}
