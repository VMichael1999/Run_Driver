export const PAYMENT_METHOD_IDS = ['efectivo', 'yape', 'plin'] as const;

export type PaymentMethodId = (typeof PAYMENT_METHOD_IDS)[number];

export interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
  description: string;
  image: ReturnType<typeof require>;
}

export const PAYMENT_METHODS: readonly PaymentMethodOption[] = [
  {
    id: 'efectivo',
    label: 'Efectivo',
    description: 'Paga directamente al conductor.',
    image: require('../../../assets/payment/Efectivo.png'),
  },
  {
    id: 'yape',
    label: 'Yape',
    description: 'Transferencia con tu numero o QR.',
    image: require('../../../assets/payment/Yape.png'),
  },
  {
    id: 'plin',
    label: 'Plin',
    description: 'Pago con Plin via numero o QR.',
    image: require('../../../assets/payment/Plin.png'),
  },
];

export const DEFAULT_PAYMENT_METHOD_ID: PaymentMethodId = 'efectivo';

export function getPaymentMethodById(id: PaymentMethodId): PaymentMethodOption {
  const found = PAYMENT_METHODS.find((m) => m.id === id);
  return found ?? PAYMENT_METHODS[0];
}
