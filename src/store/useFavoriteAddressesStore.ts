import { create } from 'zustand';
import type { LocationMarker } from '@shared/types';

export interface FavoriteAddress extends LocationMarker {
  id: string;
}

interface FavoriteAddressesState {
  favorites: FavoriteAddress[];
  addFavorite: (location: LocationMarker) => void;
  removeFavorite: (id: string) => void;
  renameFavorite: (id: string, placeName: string) => void;
  moveFavorite: (id: string, direction: 'up' | 'down') => void;
}

export const useFavoriteAddressesStore = create<FavoriteAddressesState>((set) => ({
  favorites: [],
  addFavorite: (location) =>
    set((state) => {
      const normalizedName = location.placeName.trim().toLowerCase();
      const alreadyExists = state.favorites.some(
        (item) => item.placeName.trim().toLowerCase() === normalizedName,
      );

      if (alreadyExists) return state;

      const nextFavorite: FavoriteAddress = {
        ...location,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };

      return {
        favorites: [nextFavorite, ...state.favorites].slice(0, 6),
      };
    }),
  removeFavorite: (id) =>
    set((state) => ({
      favorites: state.favorites.filter((item) => item.id !== id),
    })),
  renameFavorite: (id, placeName) =>
    set((state) => {
      const trimmed = placeName.trim();
      if (!trimmed) return state;
      return {
        favorites: state.favorites.map((item) =>
          item.id === id ? { ...item, placeName: trimmed } : item,
        ),
      };
    }),
  moveFavorite: (id, direction) =>
    set((state) => {
      const index = state.favorites.findIndex((item) => item.id === id);
      if (index === -1) return state;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= state.favorites.length) return state;
      const next = state.favorites.slice();
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return { favorites: next };
    }),
}));
