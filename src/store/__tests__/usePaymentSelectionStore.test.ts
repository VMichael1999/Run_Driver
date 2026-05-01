import { act, renderHook } from '@testing-library/react-native';
import { usePaymentSelectionStore } from '../usePaymentSelectionStore';
import { DEFAULT_PAYMENT_METHOD_ID } from '@shared/data/paymentMethods';

describe('usePaymentSelectionStore', () => {
  beforeEach(() => {
    act(() => {
      usePaymentSelectionStore.setState({ selectedId: DEFAULT_PAYMENT_METHOD_ID });
    });
  });

  it('inicializa con el metodo predeterminado', () => {
    const { result } = renderHook(() => usePaymentSelectionStore());
    expect(result.current.selectedId).toBe(DEFAULT_PAYMENT_METHOD_ID);
  });

  it('cambia la seleccion con setSelected', () => {
    const { result } = renderHook(() => usePaymentSelectionStore());

    act(() => {
      result.current.setSelected('yape');
    });

    expect(result.current.selectedId).toBe('yape');

    act(() => {
      result.current.setSelected('plin');
    });

    expect(result.current.selectedId).toBe('plin');
  });
});
