import { act, renderHook } from '@testing-library/react-native';
import { formatStopwatch, simulationAt, SIMULATION_TOTAL_MS } from '../utils/orderSimulation';
import { useOrderSimulation } from '../hooks/useOrderSimulation';

describe('simulationAt', () => {
  it('sigue los tiempos: 2 s, 3 s, 5 s, 3 s y 10 s', () => {
    expect(simulationAt(0).phase).toBe('confirmado');
    expect(simulationAt(2000).phase).toBe('buscando');
    expect(simulationAt(5000).phase).toBe('preparando');
    expect(simulationAt(10000).phase).toBe('recogido');
    expect(simulationAt(13000).phase).toBe('en-camino');
    expect(simulationAt(SIMULATION_TOTAL_MS).phase).toBe('entregado');
    expect(SIMULATION_TOTAL_MS).toBe(23000);
  });

  it('"buscando repartidor" sigue en el paso Confirmado y llena su segmento de forma continua', () => {
    const state = simulationAt(3500);
    expect(state.step).toBe(0);
    expect(state.stepProgress).toBeCloseTo(0.7);
    expect(state.stepElapsedMs).toBe(3500);
  });

  it('guarda cuándo empezó cada paso', () => {
    expect(simulationAt(14000).stepStartedAtMs).toEqual([0, 5000, 10000, 13000, null]);
  });

  it('los minutos bajan: 20 al confirmar, 17 preparando, 11 en camino y 0 entregado', () => {
    expect(simulationAt(0).minutesLeft).toBe(20);
    expect(simulationAt(5000).minutesLeft).toBe(17);
    expect(simulationAt(13000).minutesLeft).toBe(11);
    expect(simulationAt(30000).minutesLeft).toBe(0);
  });

  it('formatea el cronómetro', () => {
    expect(formatStopwatch(2400)).toBe('0:02');
    expect(formatStopwatch(65000)).toBe('1:05');
  });
});

describe('useOrderSimulation', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('sin pedido devuelve null', () => {
    const { result } = renderHook(() => useOrderSimulation(null));
    expect(result.current).toBeNull();
  });

  it('avanza con el tiempo hasta entregar', () => {
    const startedAt = Date.now();
    const { result } = renderHook(() => useOrderSimulation(startedAt));
    expect(result.current?.phase).toBe('confirmado');

    act(() => {
      jest.advanceTimersByTime(6000);
    });
    expect(result.current?.phase).toBe('preparando');

    act(() => {
      jest.advanceTimersByTime(20000);
    });
    expect(result.current?.phase).toBe('entregado');
  });
});
