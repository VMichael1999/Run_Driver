export const metodoPagos = [
  'Efectivo',
  'Pagar con Yape',
  'Pagar con Plin',
] as const;

export const metodoResumenPagos = [
  'Efectivo',
  'Yape',
  'Plin',
] as const;

export type MetodoPagoNombre = typeof metodoResumenPagos[number];
