import { useCallback, useEffect, useState } from 'react';
import type { PerfilService } from '../services/perfilService';
import { perfilService as defaultService } from '../services/perfilService';
import type { UpdateProfileInput, UserProfile } from '../types';

interface UsePerfilOptions {
  service?: PerfilService;
}

interface UsePerfilResult {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  update: (input: UpdateProfileInput) => Promise<void>;
}

export function usePerfil(options: UsePerfilOptions = {}): UsePerfilResult {
  const service = options.service ?? defaultService;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await service.getProfile();
      setProfile(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const update = useCallback(
    async (input: UpdateProfileInput) => {
      setError(null);
      try {
        const next = await service.updateProfile(input);
        setProfile(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo actualizar el perfil');
        throw e;
      }
    },
    [service],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return { profile, isLoading, error, refresh: load, update };
}
