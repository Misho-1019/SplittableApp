export const colors = {
  primary: '#FF6B6B',
  primaryLight: '#FF8E8E',
  primaryDark: '#E55555',
  secondary: '#4ECDC4',
  success: '#2ECC71',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',

  background: '#FFF5F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#F0D0D0',
  divider: '#F5E0E0',

  textPrimary: '#2D1A1A',
  textSecondary: '#8B6B6B',
  textMuted: '#C4A0A0',
  textInverse: '#FFFFFF',

  owed: '#2ECC71',
  owe: '#E74C3C',
  settled: '#C4A0A0',

  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

type Colors = Record<keyof typeof colors, string>;

export const darkColors: Colors = {
  primary: '#FF6B6B',
  primaryLight: '#FF8E8E',
  primaryDark: '#E55555',
  secondary: '#4ECDC4',
  success: '#2ECC71',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',

  background: '#1A1414',
  surface: '#2A1F1F',
  card: '#2A1F1F',
  border: '#3D2C2C',
  divider: '#352525',

  textPrimary: '#FFFFFF',
  textSecondary: '#C4A0A0',
  textMuted: '#8B6B6B',
  textInverse: '#1A1414',

  owed: '#2ECC71',
  owe: '#E74C3C',
  settled: '#8B6B6B',

  overlay: 'rgba(0, 0, 0, 0.7)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 34,
} as const;

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
] as const;

export type CurrencyCode = (typeof currencies)[number]['code'];
