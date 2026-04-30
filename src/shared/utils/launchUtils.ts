import { Linking } from 'react-native';
import type { Coordinates } from '@shared/types';

export const launchUtils = {
  async goLocation(coords: Coordinates): Promise<boolean> {
    const { latitude, longitude } = coords;
    const query = `${latitude},${longitude}`;

    const urls = [
      `geo:${query}?q=${query}`,
      `https://waze.com/ul?ll=${query}&navigate=yes`,
      `google.navigation:q=${query}`,
    ];

    for (const url of urls) {
      const canOpen = await Linking.canOpenURL(url).catch(() => false);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
    }
    return false;
  },

  async callNumber(phone: string): Promise<void> {
    const url = `tel:${phone}`;
    const canOpen = await Linking.canOpenURL(url).catch(() => false);
    if (canOpen) {
      await Linking.openURL(url);
    }
  },
};
