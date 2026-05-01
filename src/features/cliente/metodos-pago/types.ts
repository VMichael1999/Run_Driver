import type { PaymentMode } from '@shared/types';

export type SavedPaymentMode = PaymentMode | 'Tarjeta';

export interface SavedPaymentMethod {
  id: string;
  mode: SavedPaymentMode;
  alias: string;
  last4?: string;
  isDefault: boolean;
  createdAt: number;
}

export interface NewPaymentMethodInput {
  mode: SavedPaymentMode;
  alias: string;
  last4?: string;
}
