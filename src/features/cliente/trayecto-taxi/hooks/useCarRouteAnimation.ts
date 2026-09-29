import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { Coordinates } from '@shared/types';
import { calculateBearing } from '@shared/utils/mapUtils';
import {
  buildRouteProfile,
  interpolateRoutePosition,
  interpolateShortestAngle,
  sanitizeRoutePoints,
} from '../utils/routeInterpolation';
import { useTripProgressStore } from '../components/DestinationBanner';

export interface UseCarRouteAnimationOptions {
  route: Coordinates[];
  isActive: boolean;
  /** Duración total en milisegundos para recorrer la ruta completa. Default: 80,000 ms */
  durationMs?: number;
  /** Si se repite al terminar el ciclo. Default: false */
  loop?: boolean;
  /** Factor de suavizado para la rotación (0 a 1). Default: 0.45 (~80-120ms de arco vehicular en giros) */
  rotationSmoothing?: number;
  /** Pausa en milisegundos estacionado al llegar a destino si loop=true. Default: 1,200 ms */
  pauseAtEndMs?: number;
  /** Pausa mientras el auto está oculto antes de reaparecer en origen si loop=true. Default: 500 ms */
  hiddenPauseMs?: number;
  /** Pausa estacionado en el punto de partida antes de iniciar marcha si loop=true. Default: 500 ms */
  pauseAtStartMs?: number;
  /** Referencia opcional al componente Marker (mantenida para compatibilidad de tipos) */
  markerRef?: React.RefObject<any>;
  /** Callback opcional de progreso (0 a 1) */
  onProgress?: (progress: number) => void;
}

export interface CarRouteAnimationState {
  initialPosition: Coordinates | null;
  initialBearing: number;
  currentPosition: Coordinates | null;
  currentBearing: number;
  isVisible: boolean;
  opacity: number;
  remainingRoute: Coordinates[];
  progress: number;
  isCompleted: boolean;
  reset: () => void;
}

interface AnimState {
  position: Coordinates | null;
  bearing: number;
  isVisible: boolean;
  progress: number;
  isCompleted: boolean;
}

function getMonotonicTime(): number {
  return Date.now();
}

export function useCarRouteAnimation({
  route,
  isActive,
  durationMs = 80000,
  loop = false,
  rotationSmoothing = 0.45,
  pauseAtEndMs = 1200,
  hiddenPauseMs = 500,
  pauseAtStartMs = 500,
  onProgress,
}: UseCarRouteAnimationOptions): CarRouteAnimationState {
  // Clave estable de la ruta para evitar reconstrucciones innecesarias
  const routeKey = useMemo(() => {
    if (!route || route.length === 0) return '';
    const first = route[0];
    const last = route[route.length - 1];
    return `${route.length}_${first.latitude.toFixed(6)}_${first.longitude.toFixed(6)}_${last.latitude.toFixed(6)}_${last.longitude.toFixed(6)}`;
  }, [route]);

  const cleanRoute = useMemo(() => sanitizeRoutePoints(route), [routeKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const profile = useMemo(() => buildRouteProfile(cleanRoute), [cleanRoute]);

  const initialBearing = useMemo(() => {
    if (cleanRoute.length >= 2) {
      return calculateBearing(cleanRoute[0], cleanRoute[1]);
    }
    return 0;
  }, [cleanRoute]);

  const initialPosition = useMemo(() => {
    return cleanRoute.length > 0 ? cleanRoute[0] : null;
  }, [cleanRoute]);

  const [animState, setAnimState] = useState<AnimState>(() => ({
    position: initialPosition,
    bearing: initialBearing,
    isVisible: true,
    progress: 0,
    isCompleted: false,
  }));

  const accumulatedDistRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef<number>(0);
  const currentBearingRef = useRef<number>(initialBearing);
  const animFrameIdRef = useRef<number | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastReportedProgressRef = useRef<number>(0);

  const clearAllTimers = useCallback(() => {
    if (animFrameIdRef.current !== null) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (pauseTimerRef.current !== null) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearAllTimers();
    accumulatedDistRef.current = 0;
    lastTimeRef.current = null;
    lastRenderTimeRef.current = 0;
    currentBearingRef.current = initialBearing;
    lastReportedProgressRef.current = 0;
    useTripProgressStore.getState().resetProgress();
    setAnimState({
      position: initialPosition,
      bearing: initialBearing,
      isVisible: true,
      progress: 0,
      isCompleted: false,
    });
  }, [clearAllTimers, initialBearing, initialPosition]);

  // Si la ruta cambia y no está activa, sincronizamos posición inicial
  useEffect(() => {
    if (initialPosition && !isActive) {
      accumulatedDistRef.current = 0;
      lastTimeRef.current = null;
      lastRenderTimeRef.current = 0;
      currentBearingRef.current = initialBearing;
      lastReportedProgressRef.current = 0;
      setAnimState({
        position: initialPosition,
        bearing: initialBearing,
        isVisible: true,
        progress: 0,
        isCompleted: false,
      });
    }
  }, [initialPosition, initialBearing, isActive]);

  useEffect(() => {
    if (!isActive || cleanRoute.length < 2 || profile.totalDistance <= 0) {
      clearAllTimers();
      return undefined;
    }

    clearAllTimers();

    const speedKmPerSec = profile.totalDistance / Math.max(durationMs / 1000, 1);
    // Cadencia objetivo: ~40 FPS (25ms entre actualizaciones React).
    // Evita saturar el hilo JS en pantallas ProMotion (120 Hz) y previene pausas por cola de renders.
    const targetFrameIntervalMs = 25;

    const startTripMotion = () => {
      accumulatedDistRef.current = 0;
      lastTimeRef.current = getMonotonicTime();
      lastRenderTimeRef.current = 0;
      currentBearingRef.current = initialBearing;
      lastReportedProgressRef.current = 0;
      useTripProgressStore.getState().resetProgress();

      setAnimState({
        position: initialPosition,
        bearing: initialBearing,
        isVisible: true,
        progress: 0,
        isCompleted: false,
      });

      const step = () => {
        const now = getMonotonicTime();
        if (lastTimeRef.current === null) {
          lastTimeRef.current = now;
        }

        // Regulación de cadencia: si pasaron menos de 25ms, dejamos que el RAF respire
        const timeSinceLastRender = now - lastRenderTimeRef.current;
        if (timeSinceLastRender < targetFrameIntervalMs) {
          animFrameIdRef.current = requestAnimationFrame(step);
          return;
        }

        const rawDt = Math.max(0, (now - lastTimeRef.current) / 1000);
        lastTimeRef.current = now;
        lastRenderTimeRef.current = now;

        // CLAMPING ESTRICTO DEL DT A MÁXIMO 35ms (0.035s):
        // Elimina por completo el "salto largo" / aceleración brusca si el hilo experimenta
        // una pausa momentánea (por ejemplo por garbage collection o cambio de UI).
        const dt = Math.min(rawDt, 0.035);

        const nextDistance = Math.min(
          accumulatedDistRef.current + speedKmPerSec * dt,
          profile.totalDistance
        );
        accumulatedDistRef.current = nextDistance;

        const progress = profile.totalDistance > 0 ? nextDistance / profile.totalDistance : 0;

        if (nextDistance < profile.totalDistance && progress < 1) {
          const interpolated = interpolateRoutePosition(cleanRoute, profile, nextDistance);

          // Suavizado angular adaptativo: mientras viaja en el segmento k mantiene su bearing.
          // Al cruzar el vértice de la esquina y entrar al siguiente segmento, gira de manera
          // fluida y rápida (~80-120ms) hacia el nuevo rumbo.
          const smoothingFactor = Math.min(Math.max(rotationSmoothing, 0.1), 0.9);
          const smoothedBearing = interpolateShortestAngle(
            currentBearingRef.current,
            interpolated.segmentBearing,
            smoothingFactor,
          );
          currentBearingRef.current = smoothedBearing;

          setAnimState({
            position: interpolated.position,
            bearing: smoothedBearing,
            isVisible: true,
            progress,
            isCompleted: false,
          });

          // Notificar progreso a DestinationBanner con throttle
          if (progress - lastReportedProgressRef.current >= 0.015) {
            lastReportedProgressRef.current = progress;
            useTripProgressStore.getState().setProgress(progress);
            if (onProgress) {
              onProgress(progress);
            }
          }

          animFrameIdRef.current = requestAnimationFrame(step);
          return;
        }

        // --- DESTINO FINAL ALCANZADO (progress === 1) ---
        const lastPoint = cleanRoute[cleanRoute.length - 1];
        const finalBearing = cleanRoute.length >= 2
          ? calculateBearing(cleanRoute[cleanRoute.length - 2], lastPoint)
          : currentBearingRef.current;

        currentBearingRef.current = finalBearing;

        setAnimState({
          position: lastPoint,
          bearing: finalBearing,
          isVisible: true,
          progress: 1,
          isCompleted: true,
        });

        useTripProgressStore.getState().setProgress(1);
        if (onProgress) {
          onProgress(1);
        }

        // Al llegar a destino, el vehículo permanece estacionado en dicho punto final.
        if (!loop) {
          animFrameIdRef.current = null;
          return;
        }

        // Loop opcional (si loop=true)
        pauseTimerRef.current = setTimeout(() => {
          setAnimState((prev) => ({
            ...prev,
            isVisible: false,
            progress: 1,
            isCompleted: false,
          }));

          pauseTimerRef.current = setTimeout(() => {
            accumulatedDistRef.current = 0;
            lastTimeRef.current = null;
            lastRenderTimeRef.current = 0;
            currentBearingRef.current = initialBearing;
            lastReportedProgressRef.current = 0;

            setAnimState({
              position: cleanRoute[0],
              bearing: initialBearing,
              isVisible: true,
              progress: 0,
              isCompleted: false,
            });

            pauseTimerRef.current = setTimeout(() => {
              startTripMotion();
            }, pauseAtStartMs);
          }, hiddenPauseMs);
        }, pauseAtEndMs);
      };

      animFrameIdRef.current = requestAnimationFrame(step);
    };

    startTripMotion();

    return () => {
      clearAllTimers();
    };
  }, [
    isActive,
    cleanRoute,
    profile,
    initialBearing,
    initialPosition,
    durationMs,
    loop,
    rotationSmoothing,
    pauseAtEndMs,
    hiddenPauseMs,
    pauseAtStartMs,
    onProgress,
    clearAllTimers,
  ]);

  return {
    initialPosition,
    initialBearing,
    currentPosition: animState.position || initialPosition,
    currentBearing: animState.bearing,
    isVisible: animState.isVisible,
    opacity: animState.isVisible ? 1 : 0,
    remainingRoute: cleanRoute,
    progress: animState.progress,
    isCompleted: animState.isCompleted,
    reset,
  };
}
