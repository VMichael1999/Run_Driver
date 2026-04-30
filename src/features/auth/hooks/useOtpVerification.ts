import { useState } from 'react';
import { useAuthStore } from '@store/useAuthStore';
import { authService } from '../services/authService';

interface UseOtpVerificationReturn {
  code: string;
  isLoading: boolean;
  error: string | null;
  setCode: (value: string) => void;
  submitCode: () => Promise<void>;
}

export function useOtpVerification(): UseOtpVerificationReturn {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { phone, countryCode, setAuthenticated } = useAuthStore();

  const submitCode = async (): Promise<void> => {
    if (code.length !== 4) {
      setError('Ingresa el código de 4 dígitos');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const { token, role } = await authService.verifyOtp(phone, countryCode, code);
      setAuthenticated(token, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código incorrecto');
    } finally {
      setIsLoading(false);
    }
  };

  return { code, isLoading, error, setCode, submitCode };
}
