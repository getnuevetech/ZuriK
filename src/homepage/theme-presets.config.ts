import { ThemeKey } from './entities/theme-settings.entity';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  lightBg: string;
  text: string;
  textLight: string;
  buttonText: string;
  success: string;
  warning: string;
  error: string;
}

export interface ThemePreset {
  name: string;
  key: ThemeKey;
  colors: ThemeColors;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Bold & Vibrant African',
    key: ThemeKey.BOLD_VIBRANT,
    colors: {
      primary: '#D4A017',
      secondary: '#C84B31',
      accent: '#2D6A4F',
      dark: '#1A1A2E',
      lightBg: '#FFF8F0',
      text: '#2D2D2D',
      textLight: '#6B6B6B',
      buttonText: '#FFFFFF',
      success: '#2D6A4F',
      warning: '#D4A017',
      error: '#C84B31',
    },
  },
  {
    name: 'Warm & Earthy Luxe',
    key: ThemeKey.WARM_EARTHY,
    colors: {
      primary: '#E07A2F',
      secondary: '#800020',
      accent: '#FFB800',
      dark: '#2C1810',
      lightBg: '#FAF3E8',
      text: '#3D2B1F',
      textLight: '#7A6A5E',
      buttonText: '#FFFFFF',
      success: '#2D6A4F',
      warning: '#FFB800',
      error: '#800020',
    },
  },
  {
    name: 'Modern & Punchy',
    key: ThemeKey.MODERN_PUNCHY,
    colors: {
      primary: '#1B4965',
      secondary: '#FF6B35',
      accent: '#FFC233',
      dark: '#0D1B2A',
      lightBg: '#FEFCF8',
      text: '#1E1E1E',
      textLight: '#6B7280',
      buttonText: '#FFFFFF',
      success: '#2D6A4F',
      warning: '#FFC233',
      error: '#FF6B35',
    },
  },
];
