import { create } from 'zustand';
import type { UserRole } from '@shared/types';

interface AuthState {
  phone: string;
  countryCode: string;
  role: UserRole | null;
  isAuthenticated: boolean;
  token: string | null;
  setPhone: (phone: string, countryCode: string) => void;
  setAuthenticated: (token: string, role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  phone: '',
  countryCode: '+51',
  role: null,
  isAuthenticated: false,
  token: null,
  setPhone: (phone, countryCode) => set({ phone, countryCode }),
  setAuthenticated: (token, role) => set({ token, role, isAuthenticated: true }),
  logout: () => set({ token: null, role: null, isAuthenticated: false, phone: '', countryCode: '+51' }),
}));
