import { act } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { useAppModeStore } from '../useAppModeStore';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(() => Promise.resolve()),
}));

const getItemAsync = SecureStore.getItemAsync as jest.Mock;
const setItemAsync = SecureStore.setItemAsync as jest.Mock;

describe('useAppModeStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useAppModeStore.setState({ mode: 'viajes', hasHydrated: false });
    });
  });

  it('empieza en viajes', () => {
    expect(useAppModeStore.getState().mode).toBe('viajes');
  });

  it('cambia a delivery y lo guarda', () => {
    act(() => {
      useAppModeStore.getState().setMode('delivery');
    });

    expect(useAppModeStore.getState().mode).toBe('delivery');
    expect(setItemAsync).toHaveBeenCalledWith('runrider.appMode', 'delivery');
  });

  it('recupera el modo guardado al cargar', async () => {
    getItemAsync.mockResolvedValueOnce('delivery');

    await act(async () => {
      await useAppModeStore.getState().loadMode();
    });

    expect(useAppModeStore.getState()).toMatchObject({ mode: 'delivery', hasHydrated: true });
  });

  it('usa viajes si lo guardado no es un modo válido', async () => {
    getItemAsync.mockResolvedValueOnce('otro');

    await act(async () => {
      await useAppModeStore.getState().loadMode();
    });

    expect(useAppModeStore.getState().mode).toBe('viajes');
  });

  it('termina de cargar aunque falle el almacenamiento', async () => {
    getItemAsync.mockRejectedValueOnce(new Error('sin acceso'));

    await act(async () => {
      await useAppModeStore.getState().loadMode();
    });

    expect(useAppModeStore.getState()).toMatchObject({ mode: 'viajes', hasHydrated: true });
  });
});
