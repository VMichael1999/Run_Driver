import { useState } from 'react';
import { useAuthStore } from '@store/useAuthStore';
import { authService } from '../services/authService';

interface UseLoginReturn {
  phone: string;
  countryCode: string;
  isLoading: boolean;
  error: string | null;
  setPhone: (value: string) => void;
  setCountryCode: (value: string) => void;
  submitPhone: () => Promise<boolean>;
}

export function useLogin(): UseLoginReturn {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+51');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storeSetPhone = useAuthStore((s) => s.setPhone);

  const submitPhone = async (): Promise<boolean> => {
    if (phone.length < 7) {
      setError('Ingresa un número válido');
      return false;
    }
    setError(null);
    setIsLoading(true);
    try {
      await authService.sendOtp(phone, countryCode);
      storeSetPhone(phone, countryCode);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { phone, countryCode, isLoading, error, setPhone, setCountryCode, submitPhone };
}
