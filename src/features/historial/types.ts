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

export interface TripHistoryItem {
  id: string;
  date: Date;
  driver: TripDriver;
  pickup: TripStop;
  dropoff: TripStop | null;
  extraStop: TripStop | null;
  price: number;
  currency: string;
  status: TripStatus;
}
