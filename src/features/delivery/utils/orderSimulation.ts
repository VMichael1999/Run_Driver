/**
 * Simulación del pedido, acelerada como en el video:
 * confirmado 2 s → buscando repartidor 3 s → preparando 5 s → recogido 3 s → en camino 10 s → entregado.
 */
export type OrderPhase = 'confirmado' | 'buscando' | 'preparando' | 'recogido' | 'en-camino' | 'entregado';

/** Pasos de la barra de 5 y de la línea de tiempo. "Buscando" es parte de "Confirmado". */
export const ORDER_STEPS = ['Confirmado', 'Preparando', 'Recogido', 'En camino', 'Entregado'] as const;

export const PHASES: { id: Exclude<OrderPhase, 'entregado'>; ms: number; step: number }[] = [
  { id: 'confirmado', ms: 2000, step: 0 },
  { id: 'buscando', ms: 3000, step: 0 },
  { id: 'preparando', ms: 5000, step: 1 },
  { id: 'recogido', ms: 3000, step: 2 },
  { id: 'en-camino', ms: 10000, step: 3 },
];

export const SIMULATION_TOTAL_MS = PHASES.reduce((total, phase) => total + phase.ms, 0);

/** Minutos que faltan al empezar cada fase (el aviso del inicio dice 17 preparando y 11 en camino). */
const MINUTES_AT_START: Record<OrderPhase, number> = {
  confirmado: 20,
  buscando: 19,
  preparando: 17,
  recogido: 13,
  'en-camino': 11,
  entregado: 0,
};

export interface SimulationState {
  phase: OrderPhase;
  /** Paso de 0 (Confirmado) a 4 (Entregado). */
  step: number;
  /** Avance del paso actual de 0 a 1 (llena su segmento de la barra). */
  stepProgress: number;
  /** Tiempo en el paso actual (el cronómetro "En vivo" y el de la línea de tiempo). */
  stepElapsedMs: number;
  /** Avance de la fase actual de 0 a 1 (el auto usa el de "en camino"). */
  phaseProgress: number;
  /** Momento, desde el inicio, en que empezó cada paso; null si aún no empieza. */
  stepStartedAtMs: (number | null)[];
  minutesLeft: number;
}

/** Estado de la simulación a los `elapsedMs` de confirmado el pedido. */
export function simulationAt(elapsedMs: number): SimulationState {
  const elapsed = Math.max(0, elapsedMs);
  const stepStartedAtMs: (number | null)[] = [null, null, null, null, null];
  let start = 0;
  for (const phase of PHASES) {
    if (stepStartedAtMs[phase.step] === null && elapsed >= start) stepStartedAtMs[phase.step] = start;
    if (elapsed < start + phase.ms) {
      const phaseElapsed = elapsed - start;
      const phaseProgress = phaseElapsed / phase.ms;
      const stepPhases = PHASES.filter((item) => item.step === phase.step);
      const stepStart = stepStartedAtMs[phase.step] ?? start;
      const stepMs = stepPhases.reduce((total, item) => total + item.ms, 0);
      const next = PHASES[PHASES.indexOf(phase) + 1]?.id ?? 'entregado';
      const minutesLeft = MINUTES_AT_START[phase.id] - (MINUTES_AT_START[phase.id] - MINUTES_AT_START[next]) * phaseProgress;
      return {
        phase: phase.id,
        step: phase.step,
        stepProgress: (elapsed - stepStart) / stepMs,
        stepElapsedMs: elapsed - stepStart,
        phaseProgress,
        stepStartedAtMs,
        minutesLeft: Math.max(1, Math.ceil(minutesLeft)),
      };
    }
    start += phase.ms;
  }
  stepStartedAtMs[4] = SIMULATION_TOTAL_MS;
  return {
    phase: 'entregado',
    step: 4,
    stepProgress: 1,
    stepElapsedMs: elapsed - SIMULATION_TOTAL_MS,
    phaseProgress: 1,
    stepStartedAtMs,
    minutesLeft: 0,
  };
}

/** "0:02", "1:05". */
export function formatStopwatch(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** "20:36". */
export function formatClock(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
