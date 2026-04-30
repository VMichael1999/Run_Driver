import { useState, useCallback, useRef, useEffect } from 'react';
import type { DriverAlert } from '@shared/types';

export interface AuctionOffer {
  id: string;
  driver: DriverAlert;
  startTime: Date;
  totalDuration: number;
}

export type AuctionStatus = 'idle' | 'searching' | 'drivers_arriving' | 'completed';

interface AuctionSimulationState {
  status: AuctionStatus;
  offers: AuctionOffer[];
  startTime: Date | null;
}

interface AuctionSimulationActions {
  startSimulation: (basePrice: number) => void;
  stopSimulation: () => void;
  acceptOffer: (offerId: string) => void;
  rejectOffer: (offerId: string) => void;
  reset: () => void;
}

const SIMULATED_DRIVERS = [
  {
    driverName: 'Carlos M.',
    phone: '+51 949 568 228',
    rating: 4.9,
    vehiclePlate: 'ABC-1234',
    vehicleModel: 'Toyota Corolla',
    vehicleColor: 'Plata',
    imageUrl: 'https://i.pravatar.cc/100?img=11',
    etaMinutes: 3,
    distanceKm: 0.8,
  },
  {
    driverName: 'Maria L.',
    phone: '+51 987 654 321',
    rating: 4.8,
    vehiclePlate: 'XYZ-5678',
    vehicleModel: 'Honda Civic',
    vehicleColor: 'Blanco',
    imageUrl: 'https://i.pravatar.cc/100?img=5',
    etaMinutes: 4,
    distanceKm: 1.2,
  },
  {
    driverName: 'Jorge R.',
    phone: '+51 912 345 678',
    rating: 5.0,
    vehiclePlate: 'DEF-9012',
    vehicleModel: 'Kia Forte',
    vehicleColor: 'Negro',
    imageUrl: 'https://i.pravatar.cc/100?img=33',
    etaMinutes: 5,
    distanceKm: 1.5,
  },
  {
    driverName: 'Ana G.',
    phone: '+51 956 789 123',
    rating: 4.7,
    vehiclePlate: 'GHI-3456',
    vehicleModel: 'Nissan Sentra',
    vehicleColor: 'Azul',
    imageUrl: 'https://i.pravatar.cc/100?img=9',
    etaMinutes: 6,
    distanceKm: 1.8,
  },
  {
    driverName: 'Luis K.',
    phone: '+51 934 567 890',
    rating: 4.6,
    vehiclePlate: 'JKL-7890',
    vehicleModel: 'Hyundai Elantra',
    vehicleColor: 'Gris',
    imageUrl: 'https://i.pravatar.cc/100?img=53',
    etaMinutes: 7,
    distanceKm: 2.1,
  },
];

const DELAY_ARRIVALS = [2000, 4000, 6000, 8000, 10000];
const OFFER_DURATION_SECONDS = 10;

function generateOfferId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function generatePriceVariation(basePrice: number, index: number): number {
  const increments = [0, 3, 5, 8, 10];
  const increment = increments[index % increments.length];
  return Number((Math.max(0, basePrice) + increment).toFixed(2));
}

export function useAuctionSimulation(): AuctionSimulationState & AuctionSimulationActions {
  const [status, setStatus] = useState<AuctionStatus>('idle');
  const [offers, setOffers] = useState<AuctionOffer[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const reset = useCallback(() => {
    clearAllTimers();
    setStatus('idle');
    setOffers([]);
    setStartTime(null);
  }, [clearAllTimers]);

  const stopSimulation = useCallback(() => {
    clearAllTimers();
    setStatus('completed');
  }, [clearAllTimers]);

  const addOffer = useCallback(
    (driverData: (typeof SIMULATED_DRIVERS)[number], basePrice: number, index: number) => {
      const offer: AuctionOffer = {
        id: generateOfferId(),
        driver: {
          ...driverData,
          price: generatePriceVariation(basePrice, index),
          currency: 'S/',
        },
        startTime: new Date(),
        totalDuration: OFFER_DURATION_SECONDS,
      };

      setOffers((prev) => [...prev, offer]);
      setStatus('drivers_arriving');
    },
    [],
  );

  const startSimulation = useCallback(
    (basePrice: number) => {
      reset();

      setStatus('searching');
      setStartTime(new Date());

      SIMULATED_DRIVERS.forEach((driver, index) => {
        const delay = DELAY_ARRIVALS[index];
        const timer = setTimeout(() => {
          addOffer(driver, basePrice, index);
        }, delay);

        timersRef.current.push(timer);
      });

      const completionTimer = setTimeout(() => {
        setStatus('completed');
      }, DELAY_ARRIVALS[SIMULATED_DRIVERS.length - 1] + 2000);

      timersRef.current.push(completionTimer);
    },
    [reset, addOffer],
  );

  const acceptOffer = useCallback((offerId: string) => {
    clearAllTimers();
    setStatus('completed');
  }, [clearAllTimers]);

  const rejectOffer = useCallback((offerId: string) => {
    setOffers((prev) => prev.filter((offer) => offer.id !== offerId));
    if (offers.length === 1) {
      setStatus('completed');
    }
  }, [offers.length]);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  return {
    status,
    offers,
    startTime,
    startSimulation,
    stopSimulation,
    acceptOffer,
    rejectOffer,
    reset,
  };
}
