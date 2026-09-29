import { renderHook, act } from '@testing-library/react-native';
import { useCarRouteAnimation } from '../useCarRouteAnimation';

describe('useCarRouteAnimation', () => {
  const sampleRoute = [
    { latitude: -12.0464, longitude: -77.0428 },
    { latitude: -12.0500, longitude: -77.0428 },
    { latitude: -12.0500, longitude: -77.0380 },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debe inicializarse con la primera coordenada de la ruta', () => {
    const { result } = renderHook(() =>
      useCarRouteAnimation({
        route: sampleRoute,
        isActive: false,
      }),
    );

    expect(result.current.currentPosition).toEqual(sampleRoute[0]);
    expect(result.current.progress).toBe(0);
    expect(result.current.isCompleted).toBe(false);
  });

  it('no debe avanzar si isActive es false', () => {
    const { result } = renderHook(() =>
      useCarRouteAnimation({
        route: sampleRoute,
        isActive: false,
      }),
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.progress).toBe(0);
    expect(result.current.currentPosition).toEqual(sampleRoute[0]);
  });

  it('debe inicializar la opacidad en 1 y resetear correctamente', () => {
    const { result } = renderHook(() =>
      useCarRouteAnimation({
        route: sampleRoute,
        isActive: false,
      }),
    );

    expect(result.current.opacity).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.progress).toBe(0);
    expect(result.current.opacity).toBe(1);
    expect(result.current.currentPosition).toEqual(sampleRoute[0]);
  });

  it('debe avanzar monótonamente en el tiempo sin retrocesos ni coordenadas (0,0)', () => {
    const { result } = renderHook(() =>
      useCarRouteAnimation({
        route: sampleRoute,
        isActive: true,
        durationMs: 10000,
        loop: false,
      }),
    );

    let lastProgress = result.current.progress;

    for (let i = 0; i < 5; i += 1) {
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      expect(result.current.progress).toBeGreaterThanOrEqual(lastProgress);
      expect(result.current.currentPosition).not.toBeNull();
      expect(result.current.currentPosition?.latitude).not.toBe(0);
      expect(result.current.currentPosition?.longitude).not.toBe(0);
      lastProgress = result.current.progress;
    }
  });
});

