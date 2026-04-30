import { create } from 'zustand';
import type { LocationMarker } from '@shared/types';

interface FavoriteAddress extends LocationMarker {
  id: string;
}

interface FavoriteAddressesState {
  favorites: FavoriteAddress[];
  addFavorite: (location: LocationMarker) => void;
  removeFavorite: (id: string) => void;
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
}));
