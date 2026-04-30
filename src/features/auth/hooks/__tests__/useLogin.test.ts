import { renderHook, act } from '@testing-library/react-native';
import { useLogin } from '../useLogin';
import { authService } from '../../services/authService';

jest.mock('../../services/authService', () => ({
  authService: {
    sendOtp: jest.fn(),
  },
}));

const mockSendOtp = authService.sendOtp as jest.MockedFunction<typeof authService.sendOtp>;

describe('useLogin', () => {
  beforeEach(() => jest.clearAllMocks());

  it('inicializa con valores vacíos', () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.phone).toBe('');
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('setPhone actualiza el estado', () => {
    const { result } = renderHook(() => useLogin());
    act(() => result.current.setPhone('987654321'));
    expect(result.current.phone).toBe('987654321');
  });

  it('retorna error si el teléfono es muy corto', async () => {
    const { result } = renderHook(() => useLogin());
    act(() => result.current.setPhone('123'));
    await act(async () => { await result.current.submitPhone(); });
    expect(result.current.error).toBe('Ingresa un número válido');
  });

  it('llama a authService.sendOtp con número válido', async () => {
    mockSendOtp.mockResolvedValueOnce({ success: true });
    const { result } = renderHook(() => useLogin());
    act(() => result.current.setPhone('987654321'));
    let success: boolean = false;
    await act(async () => { success = await result.current.submitPhone(); });
    expect(mockSendOtp).toHaveBeenCalledWith('987654321', '+51');
    expect(success).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('setea error si la API falla', async () => {
    mockSendOtp.mockRejectedValueOnce(new Error('Error al enviar el código'));
    const { result } = renderHook(() => useLogin());
    act(() => result.current.setPhone('987654321'));
    await act(async () => { await result.current.submitPhone(); });
    expect(result.current.error).toBe('Error al enviar el código');
  });
});
