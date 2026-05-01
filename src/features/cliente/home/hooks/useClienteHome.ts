import { useCallback, useState } from 'react';
import type { LocationMarker, PaymentMethod } from '@shared/types';
import { getRoutePolyline } from '@shared/services/googleMapsService';
import { useTaxiStore } from '@store/useTaxiStore';
import { useRideDraftStore } from '@store/useRideDraftStore';

interface UseClienteHomeReturn {
  origin: LocationMarker | null;
  destination: LocationMarker | null;
  paymentMethod: PaymentMethod;
  comment: string;
  selectedHomeTab: 'ride' | 'rental' | 'outstation';
  routePoints: { latitude: number; longitude: number }[];
  isRouting: boolean;
  setOrigin: (location: LocationMarker | null) => void;
  setDestination: (location: LocationMarker | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setComment: (text: string) => void;
  setSelectedHomeTab: (value: 'ride' | 'rental' | 'outstation') => void;
  requestTaxi: (nextDestination?: LocationMarker, nextOrigin?: LocationMarker) => Promise<boolean>;
  canRequest: boolean;
  recalculateRoute: () => Promise<void>;
}

export function useClienteHome(): UseClienteHomeReturn {
  const origin = useRideDraftStore((s) => s.origin);
  const destination = useRideDraftStore((s) => s.destination);
  const paymentMethod = useRideDraftStore((s) => s.paymentMethod);
  const comment = useRideDraftStore((s) => s.comment);
  const selectedHomeTab = useRideDraftStore((s) => s.selectedHomeTab);
  const routePoints = useRideDraftStore((s) => s.routePoints);
  const setOrigin = useRideDraftStore((s) => s.setOrigin);
  const setDestination = useRideDraftStore((s) => s.setDestination);
  const setPaymentMethod = useRideDraftStore((s) => s.setPaymentMethod);
  const setComment = useRideDraftStore((s) => s.setComment);
  const setSelectedHomeTab = useRideDraftStore((s) => s.setSelectedHomeTab);
  const setRoutePoints = useRideDraftStore((s) => s.setRoutePoints);
  const setRequest = useTaxiStore((s) => s.setRequest);
  const [isRouting, setIsRouting] = useState(false);

  const canRequest = origin !== null && destination !== null;

  const recalculateRoute = useCallback(async () => {
    if (!origin || !destination) return;
    setIsRouting(true);
    try {
      const points = await getRoutePolyline(origin.position, destination.position);
      setRoutePoints(points);
    } catch {
      setRoutePoints([]);
    } finally {
      setIsRouting(false);
    }
  }, [destination, origin, setRoutePoints]);

  const requestTaxi = useCallback(async (nextDestination?: LocationMarker, nextOrigin?: LocationMarker) => {
    const selectedOrigin = nextOrigin ?? origin;
    const selectedDestination = nextDestination ?? destination;
    if (!selectedOrigin || !selectedDestination) return false;

    const immediateRoute = [selectedOrigin.position, selectedDestination.position];
    setRoutePoints(immediateRoute);
    setRequest({
      origin: selectedOrigin,
      destination: selectedDestination,
      routePoints: immediateRoute,
      paymentMethod,
      comment: comment.trim() || undefined,
    });

    setIsRouting(true);
    void (async () => {
      try {
        const points = await getRoutePolyline(selectedOrigin.position, selectedDestination.position);
        setRoutePoints(points);
        setRequest({
          origin: selectedOrigin,
          destination: selectedDestination,
          routePoints: points,
          paymentMethod,
          comment: comment.trim() || undefined,
        });
      } finally {
        setIsRouting(false);
      }
    })();

    return true;
  }, [comment, destination, origin, paymentMethod, setRequest, setRoutePoints]);

  return {
    origin,
    destination,
    paymentMethod,
    comment,
    selectedHomeTab,
    routePoints,
    isRouting,
    setOrigin,
    setDestination,
    setPaymentMethod,
    setComment,
    setSelectedHomeTab,
    requestTaxi,
    canRequest,
    recalculateRoute,
  };
}
