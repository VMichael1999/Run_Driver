import { renderHook, act } from '@testing-library/react-native';
import { useOtpVerification } from '../useOtpVerification';
import { authService } from '../../services/authService';

jest.mock('../../services/authService', () => ({
  authService: {
    verifyOtp: jest.fn(),
  },
}));

jest.mock('@store/useAuthStore', () => ({
  useAuthStore: () => ({
    phone: '987654321',
    countryCode: '+51',
    setAuthenticated: jest.fn(),
  }),
}));

const mockVerifyOtp = authService.verifyOtp as jest.MockedFunction<typeof authService.verifyOtp>;

describe('useOtpVerification', () => {
  beforeEach(() => jest.clearAllMocks());

  it('inicializa con código vacío y sin error', () => {
    const { result } = renderHook(() => useOtpVerification());
    expect(result.current.code).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('valida que el código tenga 4 dígitos', async () => {
    const { result } = renderHook(() => useOtpVerification());
    act(() => result.current.setCode('123'));
    await act(async () => { await result.current.submitCode(); });
    expect(result.current.error).toBe('Ingresa el código de 4 dígitos');
  });

  it('llama a verifyOtp con el código correcto', async () => {
    mockVerifyOtp.mockResolvedValueOnce({ token: 'tok_123', role: 'cliente' });
    const { result } = renderHook(() => useOtpVerification());
    act(() => result.current.setCode('1234'));
    await act(async () => { await result.current.submitCode(); });
    expect(mockVerifyOtp).toHaveBeenCalledWith('987654321', '+51', '1234');
  });

  it('setea error si el código es incorrecto', async () => {
    mockVerifyOtp.mockRejectedValueOnce(new Error('Código incorrecto'));
    const { result } = renderHook(() => useOtpVerification());
    act(() => result.current.setCode('0000'));
    await act(async () => { await result.current.submitCode(); });
    expect(result.current.error).toBe('Código incorrecto');
  });
});
