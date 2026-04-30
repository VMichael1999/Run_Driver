export type UserRole = 'cliente' | 'conductor';

export type PaymentMode = 'Efectivo' | 'Yape' | 'Plin' | 'Tunki';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationMarker {
  position: Coordinates;
  placeName: string;
}

export type SearchTarget = 'origin' | 'destination' | 'extra-stop';

export interface PaymentMethod {
  amount: number;
  currency: string;
  mode: PaymentMode;
}

export interface Option {
  id: string;
  icon: string;
  value: string;
}

export interface CountryOption extends Option {
  code: string;
  assetName: string;
}

export interface VerificationOption extends Option {
  isCompleted: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  isSentByMe: boolean;
  isRead: boolean;
}

export interface RatingAspect {
  id: string;
  value: number;
}

export interface Rating {
  aspects: RatingAspect[];
  score: number;
}

export interface UserRating {
  id: string;
  imageUrl: string;
  name: string;
  tripCount: number;
  role: UserRole;
  score: number;
}

export interface DriverAlert {
  driverName: string;
  phone: string;
  rating: number;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleColor: string;
  imageUrl: string;
  price: number;
  currency: string;
  etaMinutes: number;
  distanceKm: number;
}

export interface PassengerAlert {
  passengerName: string;
  rating: number;
  origin: LocationMarker;
  destination: LocationMarker;
  paymentMethod: PaymentMethod;
  imageUrl: string;
  comment?: string;
}

export interface TaxiRequest {
  origin: LocationMarker;
  destination: LocationMarker;
  routePoints: Coordinates[];
  paymentMethod: PaymentMethod;
  comment?: string;
}

export interface TaxiTrip {
  request: TaxiRequest;
  driver: DriverAlert;
}
