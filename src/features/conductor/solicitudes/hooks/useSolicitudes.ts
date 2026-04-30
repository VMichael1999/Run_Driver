import { useState } from 'react';
import type { PassengerAlert } from '@shared/types';

// Replace with real WebSocket/polling
const DUMMY_SOLICITUDES: PassengerAlert[] = [
  {
    passengerName: 'Ana Torres',
    rating: 4.6,
    origin: { position: { latitude: -12.0464, longitude: -77.0428 }, placeName: 'Miraflores, Lima' },
    destination: { position: { latitude: -12.1219, longitude: -77.0282 }, placeName: 'San Borja, Lima' },
    paymentMethod: { amount: 15, currency: 'PEN', mode: 'Efectivo' },
    imageUrl: 'https://i.pravatar.cc/100?img=5',
    comment: 'Por favor ir por la Av. Javier Prado',
  },
];

interface UseSolicitudesReturn {
  solicitudes: PassengerAlert[];
  isLoading: boolean;
  selectedId: string | null;
  selectSolicitud: (id: string) => void;
}

export function useSolicitudes(): UseSolicitudesReturn {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return {
    solicitudes: DUMMY_SOLICITUDES,
    isLoading: false,
    selectedId,
    selectSolicitud: setSelectedId,
  };
}
