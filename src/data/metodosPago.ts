export const metodoPagos = [
  'Efectivo',
  'Pagar con Yape',
  'Pagar con Plin',
  'Pagar con Tunki',
] as const;

export const metodoResumenPagos = [
  'Efectivo',
  'Yape',
  'Plin',
  'Tunki',
] as const;

export type MetodoPagoNombre = typeof metodoResumenPagos[number];
