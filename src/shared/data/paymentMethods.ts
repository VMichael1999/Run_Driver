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
    description: 'Le pagas al conductor al llegar',
    image: require('../../../assets/payment/Efectivo.png'),
  },
  {
    id: 'yape',
    label: 'Yape',
    description: 'Pago desde tu celular',
    image: require('../../../assets/payment/Yape.png'),
  },
  {
    id: 'plin',
    label: 'Plin',
    description: 'Pago desde tu celular',
    image: require('../../../assets/payment/Plin.png'),
  },
];

export const DEFAULT_PAYMENT_METHOD_ID: PaymentMethodId = 'efectivo';

export function getPaymentMethodById(id: PaymentMethodId): PaymentMethodOption {
  const found = PAYMENT_METHODS.find((m) => m.id === id);
  return found ?? PAYMENT_METHODS[0];
}
