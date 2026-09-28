import { act } from '@testing-library/react-native';
import { useTripHistoryStore } from '../useTripHistoryStore';
import type { DriverAlert, TaxiRequest } from '@shared/types';

const REQUEST: TaxiRequest = {
  origin: { position: { latitude: -12.0464, longitude: -77.0428 }, placeName: 'Miraflores' },
  destination: { position: { latitude: -12.1007, longitude: -77.0003 }, placeName: 'San Borja' },
  routePoints: [],
  paymentMethod: { amount: 0, currency: 'S/', mode: 'Efectivo' },
};

const DRIVER: DriverAlert = {
  driverName: 'Carlos', phone: '987654321', rating: 4.8,
  vehiclePlate: 'ABC-123', vehicleModel: 'Toyota', vehicleColor: 'Blanco',
  imageUrl: '', price: 20, currency: 'S/', etaMinutes: 3, distanceKm: 0.8,
};

describe('useTripHistoryStore', () => {
  beforeEach(() => useTripHistoryStore.setState({ trips: [] }));

  it('guarda lo que pagó el pasajero y la tarifa original si hubo descuento', () => {
    act(() =>
      useTripHistoryStore.getState().addCompletedTrip({
        request: REQUEST,
        driver: DRIVER,
        discount: { source: 'coupon', label: 'RUN10', percent: 10 },
      }),
    );
    const [trip] = useTripHistoryStore.getState().trips;
    expect(trip.price).toBe(18);
    expect(trip.originalPrice).toBe(20);
    expect(trip.discount?.label).toBe('RUN10');
  });

  it('sin descuento guarda el precio del conductor', () => {
    act(() => useTripHistoryStore.getState().addCompletedTrip({ request: REQUEST, driver: DRIVER }));
    const [trip] = useTripHistoryStore.getState().trips;
    expect(trip.price).toBe(20);
    expect(trip.originalPrice).toBeUndefined();
    expect(trip.discount).toBeUndefined();
  });
});
