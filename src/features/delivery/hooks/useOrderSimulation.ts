import React from 'react';
import { simulationAt, SIMULATION_TOTAL_MS, type SimulationState } from '../utils/orderSimulation';

const TICK_MS = 250;

/** Estado de la simulación del pedido que empezó en `startedAt`; se actualiza cada 250 ms hasta entregarse. */
export function useOrderSimulation(startedAt: number | null): SimulationState | null {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (startedAt === null) return;
    setNow(Date.now());
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      // Al entregar ya no cambia nada; se sigue solo para el cronómetro, que ya no se muestra.
      if (current - startedAt > SIMULATION_TOTAL_MS + TICK_MS) clearInterval(timer);
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [startedAt]);

  return startedAt === null ? null : simulationAt(now - startedAt);
}
