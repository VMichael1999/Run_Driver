import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type AppMode = 'viajes' | 'delivery';

interface AppModeState {
  mode: AppMode;
  hasHydrated: boolean;
  loadMode: () => Promise<void>;
  setMode: (mode: AppMode) => void;
}

const MODE_STORAGE_KEY = 'runrider.appMode';

function parseMode(value: string | null): AppMode {
  return value === 'delivery' ? 'delivery' : 'viajes';
}

function readModeFromWeb(): AppMode {
  if (typeof globalThis.localStorage === 'undefined') return 'viajes';
  return parseMode(globalThis.localStorage.getItem(MODE_STORAGE_KEY));
}

async function persistMode(mode: AppMode) {
  if (Platform.OS === 'web') {
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.setItem(MODE_STORAGE_KEY, mode);
    }
    return;
  }
  await SecureStore.setItemAsync(MODE_STORAGE_KEY, mode);
}

export const useAppModeStore = create<AppModeState>((set) => ({
  mode: Platform.OS === 'web' ? readModeFromWeb() : 'viajes',
  hasHydrated: Platform.OS === 'web',
  loadMode: async () => {
    if (Platform.OS === 'web') {
      set({ mode: readModeFromWeb(), hasHydrated: true });
      return;
    }

    try {
      const value = await SecureStore.getItemAsync(MODE_STORAGE_KEY);
      set({ mode: parseMode(value), hasHydrated: true });
    } catch {
      set({ hasHydrated: true });
    }
  },
  setMode: (mode) => {
    set({ mode });
    void persistMode(mode);
  },
}));
