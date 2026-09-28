import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useDescuentoVigente } from '../useDescuentoVigente';
import { usePromotionsStore } from '@store/usePromotionsStore';
import type { PromotionsService } from '../../services/promotionsService';

const SATURDAY = new Date(2026, 8, 26);
const MONDAY = new Date(2026, 8, 28);

function buildService(listActivePromotions: PromotionsService['listActivePromotions']): PromotionsService {
  return { listActivePromotions, validateCoupon: jest.fn() };
}

const weekendService = () =>
  buildService(
    jest.fn().mockResolvedValue([
      {
        id: 'p-002',
        title: 'Fines de semana 15 % menos',
        description: '',
        discountPercent: 15,
        validUntil: '2026-09-30',
        rule: 'weekend',
      },
    ]),
  );

describe('useDescuentoVigente', () => {
  beforeEach(() => {
    act(() => {
      usePromotionsStore.setState({ appliedCoupon: null });
    });
  });

  it('aplica la promoción de fin de semana un sábado', async () => {
    const { result } = renderHook(() => useDescuentoVigente({ service: weekendService(), date: SATURDAY }));
    await waitFor(() => expect(result.current?.percent).toBe(15));
  });

  it('un lunes sin cupón no hay descuento', async () => {
    const service = weekendService();
    const { result } = renderHook(() => useDescuentoVigente({ service, date: MONDAY }));
    await waitFor(() => expect(service.listActivePromotions).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });

  it('usa el cupón guardado aunque las promociones fallen', async () => {
    act(() => {
      usePromotionsStore.setState({
        appliedCoupon: { code: 'RUN10', discountPercent: 10, description: '', appliedAt: 0 },
      });
    });
    const service = buildService(jest.fn().mockRejectedValue(new Error('sin red')));
    const { result } = renderHook(() => useDescuentoVigente({ service, date: MONDAY }));
    await waitFor(() => expect(service.listActivePromotions).toHaveBeenCalled());
    expect(result.current).toEqual({ source: 'coupon', label: 'RUN10', percent: 10 });
  });
});
