export const colors = {
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#4A42DB',
  secondary: '#FF6584',
  success: '#4CAF50',
  warning: '#FFC107',
  danger: '#F44336',
  info: '#2196F3',

  background: '#F8F9FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E0E0E0',
  divider: '#EEEEEE',

  textPrimary: '#212121',
  textSecondary: '#757575',
  textMuted: '#9E9E9E',
  textInverse: '#FFFFFF',

  owed: '#4CAF50',
  owe: '#F44336',
  settled: '#9E9E9E',

  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

type Colors = Record<keyof typeof colors, string>;

export const darkColors: Colors = {
  primary: '#8B85FF',
  primaryLight: '#A9A5FF',
  primaryDark: '#6C63FF',
  secondary: '#FF6584',
  success: '#66BB6A',
  warning: '#FFD54F',
  danger: '#EF5350',
  info: '#42A5F5',

  background: '#121212',
  surface: '#1E1E1E',
  card: '#2C2C2C',
  border: '#333333',
  divider: '#2C2C2C',

  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#757575',
  textInverse: '#212121',

  owed: '#66BB6A',
  owe: '#EF5350',
  settled: '#616161',

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
