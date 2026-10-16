import type { ViewStyle } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { DeliveryColors } from '@theme/colors';

/** Colores del modo delivery según el tema activo. */
export function useDeliveryColors() {
  return useAppTheme().delivery;
}

/** Sombras del mockup: tarjetas `0 1px 3px rgba(17,21,25,.06)`, flotantes `0 8px 24px rgba(17,21,25,.18)`. */
export const DeliveryShadow = {
  card: {
    shadowColor: DeliveryColors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  floating: {
    shadowColor: DeliveryColors.light.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
} satisfies Record<string, ViewStyle>;
