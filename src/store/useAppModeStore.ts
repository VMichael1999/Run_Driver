import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { ClienteStackParamList } from '@navigation/types';

export type AppMode = 'viajes' | 'delivery';

type ClienteRoute = keyof ClienteStackParamList;

interface AppModeState {
  mode: AppMode;
  hasHydrated: boolean;
  /** Pantalla de viajes que se abre al volver desde delivery (se eligió en el menú lateral). */
  pendingRoute: ClienteRoute | null;
  loadMode: () => Promise<void>;
  setMode: (mode: AppMode) => void;
  /** Sale de delivery y abre esa pantalla de viajes. */
  exitToRoute: (route: ClienteRoute) => void;
  consumePendingRoute: () => ClienteRoute | null;
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

export const useAppModeStore = create<AppModeState>((set, get) => ({
  mode: Platform.OS === 'web' ? readModeFromWeb() : 'viajes',
  hasHydrated: Platform.OS === 'web',
  pendingRoute: null,
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
  exitToRoute: (route) => {
    set({ mode: 'viajes', pendingRoute: route === 'ClienteHome' ? null : route });
    void persistMode('viajes');
  },
  consumePendingRoute: () => {
    const route = get().pendingRoute;
    if (route) set({ pendingRoute: null });
    return route;
  },
}));
