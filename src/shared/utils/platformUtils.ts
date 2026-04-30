import { useColorScheme } from 'react-native';
import { useThemeStore } from '@store/useThemeStore';

export function useIsDarkMode(): boolean {
  const systemScheme = useColorScheme();
  const isDark = useThemeStore((s) => s.isDark);
  return isDark ?? systemScheme === 'dark';
}
