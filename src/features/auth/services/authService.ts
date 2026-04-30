import type { UserRole } from '@shared/types';

interface SendOtpResponse {
  success: boolean;
}

interface VerifyOtpResponse {
  token: string;
  role: UserRole;
}

// Datos en duro — igual que el proyecto legacy Flutter
// Código OTP fijo: 1234
// Roles: números impares → conductor, pares → cliente
function simulateDelay(ms = 800) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export const authService = {
  async sendOtp(_phone: string, _countryCode: string): Promise<SendOtpResponse> {
    await simulateDelay();
    return { success: true };
  },

  async verifyOtp(_phone: string, _countryCode: string, code: string): Promise<VerifyOtpResponse> {
    await simulateDelay();
    if (code.length !== 4) throw new Error('Ingresa el código de 4 dígitos');
    // Alterna rol según preferencia de prueba — cambiar aquí para probar cada flujo
    const role: UserRole = 'cliente';
    return { token: 'dummy_token_123', role };
  },
};
