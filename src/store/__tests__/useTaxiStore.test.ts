import { act } from '@testing-library/react-native';
import { useTaxiStore } from '../useTaxiStore';
import type { TaxiRequest, DriverAlert } from '@shared/types';

const MOCK_REQUEST: TaxiRequest = {
  origin: { position: { latitude: -12.0464, longitude: -77.0428 }, placeName: 'Miraflores' },
  destination: { position: { latitude: -12.1007, longitude: -77.0003 }, placeName: 'San Borja' },
  routePoints: [],
  paymentMethod: { amount: 0, currency: 'PEN', mode: 'Efectivo' },
};

const MOCK_DRIVER: DriverAlert = {
  driverName: 'Carlos', phone: '987654321', rating: 4.8,
  vehiclePlate: 'ABC-123', vehicleModel: 'Toyota', vehicleColor: 'Blanco',
  imageUrl: '', price: 15, currency: 'PEN', etaMinutes: 3, distanceKm: 0.8,
};

describe('useTaxiStore', () => {
  beforeEach(() => useTaxiStore.setState({ flow: 'idle', request: null, activeTrip: null, pendingOffers: [] }));

  it('inicia en idle sin request activo', () => {
    const { flow, request } = useTaxiStore.getState();
    expect(flow).toBe('idle');
    expect(request).toBeNull();
  });

  it('setRequest cambia el flujo a searching', () => {
    act(() => useTaxiStore.getState().setRequest(MOCK_REQUEST));
    const { flow, request } = useTaxiStore.getState();
    expect(flow).toBe('searching');
    expect(request).toEqual(MOCK_REQUEST);
  });

  it('acceptOffer crea el viaje activo', () => {
    act(() => {
      useTaxiStore.getState().setRequest(MOCK_REQUEST);
      useTaxiStore.getState().acceptOffer(MOCK_DRIVER);
    });
    const { flow, activeTrip } = useTaxiStore.getState();
    expect(flow).toBe('in_trip');
    expect(activeTrip?.driver).toEqual(MOCK_DRIVER);
  });

  it('endTrip reinicia el estado', () => {
    act(() => {
      useTaxiStore.getState().setRequest(MOCK_REQUEST);
      useTaxiStore.getState().acceptOffer(MOCK_DRIVER);
      useTaxiStore.getState().endTrip();
    });
    const { flow, activeTrip, request } = useTaxiStore.getState();
    expect(flow).toBe('idle');
    expect(activeTrip).toBeNull();
    expect(request).toBeNull();
  });
});
