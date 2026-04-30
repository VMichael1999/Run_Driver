import { Audio } from 'expo-av';

let sound: Audio.Sound | null = null;

export const audioUtils = {
  async playNotificacion(): Promise<void> {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        sound = null;
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('@assets/sounds/long_pop.wav'),
        { volume: 1.0, shouldPlay: true },
      );
      sound = newSound;
    } catch {
      // silencioso — el audio es decorativo
    }
  },

  async stop(): Promise<void> {
    try {
      if (sound) {
        await sound.stopAsync();
      }
    } catch {
      // ignorar
    }
  },
};
