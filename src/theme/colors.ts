export const Colors = {
  // Brand & Action
  primary: '#111519',
  secondary: '#15191D',
  tertiary: '#262D34',
  accent: '#5A6900',
  accentLime: '#D4E838',
  onAccentLime: '#111519',

  // Surfaces & Backgrounds
  backgroundLight: '#EDF0F2',
  backgroundItemLight: '#FFFFFF',
  backgroundDark: '#0E1114',
  backgroundItemDark: '#171C21',

  // Monochromes
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  // Typography
  textPrimary: '#111519',
  textSecondary: '#555E66',
  textDisabled: '#A0A9B1',

  // Semantics & Status
  online: '#157A45',
  onlineSoft: '#DCEFE3',
  pickup: '#2458C6',
  pickupSoft: '#E1E9F9',
  danger: '#C8261B',
  dangerSoft: '#FBE3E0',
  cash: '#157A45',
  cashSoft: '#DCEFE3',

  // Colores semánticos del dominio (RunSubasta)
  origin: '#157A45',
  destination: '#2458C6',
  auction: '#D4E838',
  onAuction: '#111519',
  offer: '#D4E838',
  driverArriving: '#2458C6',
  onTrip: '#157A45',
  promo: '#D4E838',
  sos: '#C8261B',

  // Backward-compatibility aliases
  error: '#C8261B',
  success: '#157A45',
  warning: '#F59E0B',

  // Peripherals & UI Elements
  divider: '#D5DADF',
  shadow: 'rgba(17, 21, 25, 0.14)',
  star: '#F59E0B',
  plateBlue: '#1C4FA0',
} as const;

export type ColorKey = keyof typeof Colors;

export const ThemeColors = {
  light: {
    primary: Colors.primary,
    onPrimary: Colors.white,
    sig: Colors.accentLime,
    onSig: Colors.primary,
    accent: '#1C4FA0',
    background: '#EDF0F2',
    surface: Colors.white,
    surfaceMuted: '#F4F6F8',
    surfaceSoft: '#E1E9F9',
    drawer: '#111519',
    text: Colors.textPrimary,
    textMuted: Colors.textSecondary,
    textDisabled: Colors.textDisabled,
    divider: '#D5DADF',
    line: '#D5DADF',
    iconButton: Colors.white,
    shadow: Colors.shadow,
    statusBar: 'dark' as const,

    // Status
    online: Colors.online,
    onlineSoft: Colors.onlineSoft,
    pickup: Colors.pickup,
    pickupSoft: Colors.pickupSoft,
    danger: Colors.danger,
    dangerSoft: Colors.dangerSoft,
    cash: Colors.cash,
    cashSoft: Colors.cashSoft,

    // Colores semánticos del dominio
    origin: '#157A45',
    destination: '#2458C6',
    auction: '#D4E838',
    onAuction: '#111519',
    offer: '#D4E838',
    driverArriving: '#2458C6',
    onTrip: '#157A45',
    promo: '#D4E838',
    sos: '#C8261B',

    // Map & Route
    route: '#111519',
    routeCase: '#FFFFFF',
  },
  dark: {
    primary: Colors.accentLime,
    onPrimary: Colors.primary,
    sig: Colors.accentLime,
    onSig: Colors.primary,
    accent: Colors.accentLime,
    background: '#0E1114',
    surface: '#171C21',
    surfaceMuted: '#20262D',
    surfaceSoft: '#1A2640',
    drawer: '#101418',
    text: '#ECEFF1',
    textMuted: '#A0A9B1',
    textDisabled: 'rgba(236, 239, 241, 0.38)',
    divider: '#29313A',
    line: '#29313A',
    iconButton: '#171C21',
    shadow: 'rgba(0, 0, 0, 0.5)',
    statusBar: 'light' as const,

    // Status
    online: '#3DCB7E',
    onlineSoft: '#15301F',
    pickup: '#8DB1F5',
    pickupSoft: '#1A2640',
    danger: '#FF7A6E',
    dangerSoft: '#3A1916',
    cash: '#3DCB7E',
    cashSoft: '#15301F',

    // Colores semánticos del dominio
    origin: '#3DCB7E',
    destination: '#8DB1F5',
    auction: '#D4E838',
    onAuction: '#111519',
    offer: '#D4E838',
    driverArriving: '#8DB1F5',
    onTrip: '#3DCB7E',
    promo: '#D4E838',
    sos: '#FF7A6E',

    // Map & Route
    route: '#D4E838',
    routeCase: '#101519',
  },
} as const;

export type ThemeMode = keyof typeof ThemeColors;
export type AppTheme = (typeof ThemeColors)[ThemeMode];
