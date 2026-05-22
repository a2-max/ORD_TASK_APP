import { Theme } from '@react-navigation/native';

export interface ExtendedTheme extends Theme {
  colors: Theme['colors'] & {
    primary: string;
    primary50: string;
    primary100: string;
    primary500: string;

    black: string;
    black400: string;
    black500: string;

    white: string;
    white600: string;
    white700: string;

    grey: string;
    grey50: string;
    grey100: string;
    grey200: string;
    grey300: string;
    grey400: string;
    grey500: string;

    red: string;
    red50: string;
    red400: string;
    red500: string;

    green: string;
    green50: string;
    green500: string;

    orange: string;
    orange50: string;
    orange400: string;
  };
}

export type IColors = ExtendedTheme['colors'];
