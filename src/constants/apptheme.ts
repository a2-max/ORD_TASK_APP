import { DefaultTheme } from '@react-navigation/native';

export const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6366F1',
    primary50: '#EEF2FF',
    primary100: '#E0E7FF',
    primary500: '#6366F1',

    black: '#000000',
    black400: '#333333',
    black500: '#000000',

    white: '#FFFFFF',
    white600: '#E8E8E8',
    white700: '#B5B5B5',

    grey: '#7D8385',
    grey50: '#F9F9F9',
    grey100: '#D7D9D9',
    grey200: '#C3C6C7',
    grey300: '#A8ACAD',
    grey400: '#979C9D',
    grey500: '#7D8385',

    red: '#EF4444',
    red50: '#FEE2E2',
    red400: '#EF4444',
    red500: '#DC2626',

    green: '#22C55E',
    green50: '#F0FDF4',
    green500: '#22C55E',

    orange: '#F59E0B',
    orange50: '#FFF7E6',
    orange400: '#FFB31A',
  },
};

export const DarkTheme = {
  ...LightTheme,
  dark: true,
  colors: {
    ...LightTheme.colors,
    background: '#111827',
    card: '#1F2937',
    text: '#F9FAFB',
    border: '#374151',
    grey50: '#1F2937',
    white: '#F9FAFB',
    black500: '#F9FAFB',
  },
};
