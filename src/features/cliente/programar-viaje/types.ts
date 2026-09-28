import type { Coordinates, LocationMarker, PaymentMode } from '@shared/types';

/** Servicio elegido al programar; a la hora del viaje se busca conductor con él. */
export interface ScheduledTripService {
  id: string;
  name: string;
  price: number;
  currency: string;
}

export interface ScheduledTrip {
  id: string;
  origin: LocationMarker | null;
  destination: LocationMarker | null;
  stops?: LocationMarker[];
  /** Ruta trazada por las paradas; se borra al cambiarlas y el detalle la vuelve a calcular. */
  routePoints?: Coordinates[];
  service?: ScheduledTripService;
  paymentMode?: PaymentMode;
  scheduledFor: number;
  notes?: string;
  createdAt: number;
}

export type NewScheduledTripInput = Omit<ScheduledTrip, 'id' | 'createdAt'>;
