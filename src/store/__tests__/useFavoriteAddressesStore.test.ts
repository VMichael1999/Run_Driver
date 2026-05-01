import { act, renderHook } from '@testing-library/react-native';
import { useFavoriteAddressesStore } from '../useFavoriteAddressesStore';

const sample = (placeName: string) => ({
  placeName,
  position: { latitude: -12, longitude: -77 },
});

describe('useFavoriteAddressesStore', () => {
  beforeEach(() => {
    act(() => {
      useFavoriteAddressesStore.setState({ favorites: [] });
    });
  });

  it('agrega y elimina favoritos', () => {
    const { result } = renderHook(() => useFavoriteAddressesStore());

    act(() => {
      result.current.addFavorite(sample('Casa'));
    });

    expect(result.current.favorites).toHaveLength(1);
    const id = result.current.favorites[0].id;

    act(() => {
      result.current.removeFavorite(id);
    });

    expect(result.current.favorites).toHaveLength(0);
  });

  it('renombra un favorito existente', () => {
    const { result } = renderHook(() => useFavoriteAddressesStore());

    act(() => {
      result.current.addFavorite(sample('Casa'));
    });

    const id = result.current.favorites[0].id;

    act(() => {
      result.current.renameFavorite(id, 'Casa nueva');
    });

    expect(result.current.favorites[0].placeName).toBe('Casa nueva');
  });

  it('ignora renombrar con string vacio', () => {
    const { result } = renderHook(() => useFavoriteAddressesStore());

    act(() => {
      result.current.addFavorite(sample('Casa'));
    });

    const id = result.current.favorites[0].id;

    act(() => {
      result.current.renameFavorite(id, '   ');
    });

    expect(result.current.favorites[0].placeName).toBe('Casa');
  });

  it('mueve elementos arriba y abajo respetando los limites', () => {
    const { result } = renderHook(() => useFavoriteAddressesStore());

    act(() => {
      result.current.addFavorite(sample('A'));
      result.current.addFavorite(sample('B'));
      result.current.addFavorite(sample('C'));
    });

    const order = () => result.current.favorites.map((f) => f.placeName);
    const initial = order();
    const middleId = result.current.favorites[1].id;

    act(() => {
      result.current.moveFavorite(middleId, 'up');
    });

    expect(order()[0]).toBe(initial[1]);

    act(() => {
      result.current.moveFavorite(result.current.favorites[0].id, 'up');
    });

    expect(order()[0]).toBe(initial[1]);
  });
});
