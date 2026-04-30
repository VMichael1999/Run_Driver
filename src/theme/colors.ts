export const Colors = {
  primary: '#001f3f',
  secondary: '#000289',
  tertiary: '#0003c7',

  backgroundLight: '#eeeeee',
  backgroundItemLight: '#fefefe',
  backgroundDark: '#000000',
  backgroundItemDark: '#2a2e32',

  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  textPrimary: '#1a1a1a',
  textSecondary: '#6b7280',
  textDisabled: '#9ca3af',

  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',

  divider: '#e5e7eb',
  shadow: 'rgba(0, 0, 0, 0.1)',
} as const;

export type ColorKey = keyof typeof Colors;
