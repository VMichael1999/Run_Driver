import type { UpdateProfileInput, UserProfile } from '../types';

const SIMULATED_DELAY_MS = 300;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface PerfilService {
  getProfile: () => Promise<UserProfile>;
  updateProfile: (input: UpdateProfileInput) => Promise<UserProfile>;
}

let cachedProfile: UserProfile = {
  fullName: 'Jose Phillips',
  phone: '000 000 000',
  countryCode: '+51',
  email: '',
  avatarUrl: null,
};

export const createPerfilService = (): PerfilService => ({
  getProfile: async () => {
    await wait(SIMULATED_DELAY_MS);
    return cachedProfile;
  },
  updateProfile: async (input) => {
    await wait(SIMULATED_DELAY_MS);
    cachedProfile = { ...cachedProfile, ...input };
    return cachedProfile;
  },
});

export const perfilService = createPerfilService();
