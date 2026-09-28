import { act, renderHook } from '@testing-library/react-native';
import { useTripById, useTripHistory } from '../useTripHistory';
import { useTripHistoryStore } from '@store/useTripHistoryStore';
import { MOCK_TRIP_HISTORY } from '../../data/mockHistory';
import type { TaxiTrip } from '@shared/types';

const TRIP: TaxiTrip = {
  request: {
    origin: { position: { latitude: -12.0782, longitude: -77.0521 }, placeName: 'Av. Brasil 2450' },
    destination: { position: { latitude: -12.1291, longitude: -77.0305 }, placeName: 'Av. José Larco 1150' },
    routePoints: [],
    paymentMethod: { amount: 0, currency: 'S/', mode: 'Yape' },
  },
  driver: {
    driverName: 'Carlos', phone: '987654321', rating: 4.8,
    vehiclePlate: 'BXR-482', vehicleModel: 'Toyota Yaris', vehicleColor: 'Plata',
    imageUrl: '', price: 24, currency: 'S/', etaMinutes: 3, distanceKm: 0.8,
  },
};

describe('useTripHistory', () => {
  beforeEach(() => useTripHistoryStore.setState({ trips: [] }));

  it('pone los viajes de la sesión antes que los de ejemplo', () => {
    act(() => useTripHistoryStore.getState().addCompletedTrip(TRIP));
    const { result } = renderHook(() => useTripHistory());
    expect(result.current).toHaveLength(MOCK_TRIP_HISTORY.length + 1);
    expect(result.current[0].vehicle?.plate).toBe('BXR-482');
    expect(result.current[0].paymentMode).toBe('Yape');
  });

  it('encuentra un viaje por id y devuelve null si no existe', () => {
    const { result: found } = renderHook(() => useTripById('t-002'));
    expect(found.current?.driver.name).toBe('Rosa Quispe');
    const { result: missing } = renderHook(() => useTripById('no-existe'));
    expect(missing.current).toBeNull();
  });
});
