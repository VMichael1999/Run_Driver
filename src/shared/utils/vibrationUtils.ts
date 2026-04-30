import * as Haptics from 'expo-haptics';

export const vibrationUtils = {
  async vibrate(): Promise<void> {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignorar si haptics no disponible
    }
  },

  async notificacion(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignorar
    }
  },
};
