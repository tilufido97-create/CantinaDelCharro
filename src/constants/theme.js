// Sistema de diseño - La Cantina del Charro

export const COLORS = {
  // Backgrounds
  background: {
    primary: '#0A0A0A',
    secondary: '#1C1C1E',
    tertiary: '#2C2C2E',
  },
  bg: {
    primary: '#0A0A0A',
    secondary: '#1C1C1E',
    tertiary: '#2C2C2E',
  },
  bgPrimary: '#0A0A0A',
  bgSecondary: '#1C1C1E',
  bgTertiary: '#2C2C2E',
  // Acentos
  accent: {
    gold: '#FFB800',
    goldLight: '#FFC933',
    amber: '#FF9500',
  },
  accentGold: '#FFB800',
  // Textos
  text: {
    primary: '#FFFFFF',
    secondary: '#E5E5EA',
    tertiary: '#8E8E93',
    disabled: '#3A3A3C',
  },
  textPrimary: '#FFFFFF',
  textSecondary: '#E5E5EA',
  textTertiary: '#8E8E93',
  // Semánticos
  semantic: {
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
  },
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const SIZES = {
  buttonHeight: 56,
  inputHeight: 48,
  tabBarHeight: 80,
  headerHeight: 60,
  icon: {
    sm: 20,
    md: 24,
    lg: 32,
  },
};
