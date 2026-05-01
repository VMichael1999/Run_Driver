import { act, renderHook, waitFor } from '@testing-library/react-native';
import { usePerfil } from '../usePerfil';
import type { PerfilService } from '../../services/perfilService';
import type { UpdateProfileInput, UserProfile } from '../../types';

const baseProfile: UserProfile = {
  fullName: 'Jose Phillips',
  phone: '999 999 999',
  countryCode: '+51',
  email: 'jose@example.com',
  avatarUrl: null,
};

function buildService(overrides: Partial<PerfilService> = {}): PerfilService {
  let current = { ...baseProfile };
  return {
    getProfile: jest.fn().mockResolvedValue(current),
    updateProfile: jest.fn(async (input: UpdateProfileInput) => {
      current = { ...current, ...input };
      return current;
    }),
    ...overrides,
  };
}

describe('usePerfil', () => {
  it('carga el perfil al montar', async () => {
    const service = buildService();
    const { result } = renderHook(() => usePerfil({ service }));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile).toEqual(baseProfile);
    expect(result.current.error).toBeNull();
    expect(service.getProfile).toHaveBeenCalledTimes(1);
  });

  it('actualiza el perfil exitosamente', async () => {
    const service = buildService();
    const { result } = renderHook(() => usePerfil({ service }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.update({ fullName: 'Jose Updated' });
    });

    expect(result.current.profile?.fullName).toBe('Jose Updated');
    expect(service.updateProfile).toHaveBeenCalledWith({ fullName: 'Jose Updated' });
    expect(result.current.error).toBeNull();
  });

  it('expone el error al fallar la carga', async () => {
    const service = buildService({
      getProfile: jest.fn().mockRejectedValue(new Error('boom')),
    });

    const { result } = renderHook(() => usePerfil({ service }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBe('boom');
  });

  it('propaga el error al fallar la actualizacion', async () => {
    const service = buildService({
      updateProfile: jest.fn().mockRejectedValue(new Error('save failed')),
    });
    const { result } = renderHook(() => usePerfil({ service }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let caught: Error | null = null;
    await act(async () => {
      try {
        await result.current.update({ email: 'nuevo@correo.com' });
      } catch (e) {
        caught = e as Error;
      }
    });

    expect(caught).not.toBeNull();
    expect((caught as unknown as Error).message).toBe('save failed');
    expect(result.current.error).toBe('save failed');
  });
});
