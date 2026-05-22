import '@react-navigation/native';
import { ExtendedTheme } from './theme.interface';

declare module '@react-navigation/native' {
  export function useTheme(): ExtendedTheme;
}
