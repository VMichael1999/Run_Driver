export const FontFamily = {
  regular: 'GeneralSans-Regular',
  italic: 'GeneralSans-Italic',
  medium: 'GeneralSans-Medium',
  semibold: 'GeneralSans-Semibold',
  bold: 'GeneralSans-Bold',
  boldItalic: 'GeneralSans-BoldItalic',
} as const;

export const FontSize = {
  // Mínimo para etiquetas y badges; nada por debajo de 11 para que se lea en la calle
  '2xs': 11,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 44,
  '6xl': 46,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
