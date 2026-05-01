import { act, renderHook, waitFor } from '@testing-library/react-native';
import { usePromociones } from '../usePromociones';
import { usePromotionsStore } from '@store/usePromotionsStore';
import type { PromotionsService } from '../../services/promotionsService';

function buildService(overrides: Partial<PromotionsService> = {}): PromotionsService {
  return {
    listActivePromotions: jest.fn().mockResolvedValue([
      {
        id: 'p1',
        title: 'Test',
        description: 'desc',
        discountPercent: 10,
        validUntil: '2030-01-01',
      },
    ]),
    validateCoupon: jest.fn().mockResolvedValue({
      ok: true,
      coupon: { code: 'OK10', discountPercent: 10, description: 'desc', appliedAt: 0 },
      error: null,
    }),
    ...overrides,
  };
}

describe('usePromociones', () => {
  beforeEach(() => {
    act(() => {
      usePromotionsStore.setState({ appliedCoupon: null });
    });
  });

  it('carga las promociones activas al montar', async () => {
    const service = buildService();
    const { result } = renderHook(() => usePromociones({ service }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.promotions).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('aplica un cupon valido y lo guarda en el store', async () => {
    const service = buildService();
    const { result } = renderHook(() => usePromociones({ service }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let outcome: { ok: boolean } | null = null;
    await act(async () => {
      outcome = await result.current.applyCoupon('OK10');
    });

    expect(outcome?.ok).toBe(true);
    expect(result.current.appliedCoupon?.code).toBe('OK10');
  });

  it('reporta error al aplicar un cupon invalido', async () => {
    const service = buildService({
      validateCoupon: jest.fn().mockResolvedValue({
        ok: false,
        coupon: null,
        error: 'invalid_code',
      }),
    });
    const { result } = renderHook(() => usePromociones({ service }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.applyCoupon('NOPE');
    });

    expect(result.current.appliedCoupon).toBeNull();
    expect(result.current.error).toBe('El codigo no es valido.');
  });

  it('limpia el cupon aplicado con removeCoupon', async () => {
    const service = buildService();
    const { result } = renderHook(() => usePromociones({ service }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.applyCoupon('OK10');
    });

    act(() => {
      result.current.removeCoupon();
    });

    expect(result.current.appliedCoupon).toBeNull();
  });
});
