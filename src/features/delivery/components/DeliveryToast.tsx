import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Reanimated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { FontFamily } from '@theme/fonts';
import { DeliveryColors } from '@theme/colors';
import { useDeliveryColors } from '../theme';

export interface ToastMessage {
  id: number;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

/** Tiempo que el aviso queda en pantalla antes de irse solo. */
export const TOAST_DURATION_MS = 2500;

/** Muestra un aviso y lo esconde solo a los 2.5 s. */
export function useToast() {
  const [toast, setToast] = React.useState<ToastMessage | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const show = React.useCallback((message: Omit<ToastMessage, 'id'>) => {
    setToast({ ...message, id: Date.now() });
  }, []);

  return { toast, show };
}

interface DeliveryToastProps {
  toast: ToastMessage | null;
  bottom: number;
}

/** Aviso oscuro (.toast) que entra desde abajo. */
export function DeliveryToast({ toast, bottom }: DeliveryToastProps) {
  const colors = useDeliveryColors();
  if (!toast) return null;

  return (
    <Reanimated.View
      key={toast.id}
      entering={FadeInDown.duration(220)}
      exiting={FadeOutDown.duration(200)}
      style={[styles.toast, { backgroundColor: colors.ink, bottom }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={[styles.icon, { backgroundColor: colors.lime }]}>
        <Ionicons name={toast.icon} size={18} color={colors.ink} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.onDark }]}>{toast.title}</Text>
        {toast.subtitle ? <Text style={[styles.subtitle, { color: colors.onDark }]}>{toast.subtitle}</Text> : null}
      </View>
    </Reanimated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 9,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    // 0 10px 24px rgba(17,21,25,.3)
    shadowColor: DeliveryColors.light.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    lineHeight: 18.9,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 11.5,
    lineHeight: 15.5,
    opacity: 0.7,
  },
});
