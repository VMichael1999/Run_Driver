import { act, renderHook } from '@testing-library/react-native';
import { useScheduledTripsStore } from '../useScheduledTripsStore';

describe('useScheduledTripsStore', () => {
  beforeEach(() => {
    act(() => {
      useScheduledTripsStore.setState({ trips: [] });
    });
  });

  it('agrega un viaje programado y lo guarda ordenado por fecha', () => {
    const { result } = renderHook(() => useScheduledTripsStore());

    const farFuture = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const nearFuture = Date.now() + 60 * 60 * 1000;

    act(() => {
      result.current.scheduleTrip({ origin: null, destination: null, scheduledFor: farFuture });
      result.current.scheduleTrip({ origin: null, destination: null, scheduledFor: nearFuture });
    });

    expect(result.current.trips).toHaveLength(2);
    expect(result.current.trips[0].scheduledFor).toBeLessThan(result.current.trips[1].scheduledFor);
  });

  it('cancela un viaje por id', () => {
    const { result } = renderHook(() => useScheduledTripsStore());

    act(() => {
      result.current.scheduleTrip({ origin: null, destination: null, scheduledFor: Date.now() + 1000 });
    });

    const id = result.current.trips[0].id;

    act(() => {
      result.current.cancelTrip(id);
    });

    expect(result.current.trips).toHaveLength(0);
  });

  it('omite las notas vacias', () => {
    const { result } = renderHook(() => useScheduledTripsStore());

    act(() => {
      result.current.scheduleTrip({
        origin: null,
        destination: null,
        scheduledFor: Date.now() + 1000,
        notes: '   ',
      });
    });

    expect(result.current.trips[0].notes).toBeUndefined();
  });
});
