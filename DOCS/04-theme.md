# 04 — Theme (centralized, light + dark)

## Concepts

- **One source of truth**: `src/constants/apptheme.ts` exports `LightTheme` and `DarkTheme`. It is the only file allowed to contain hex colors.
- **The theme is a React Navigation theme.** We extend it with extra color keys and pass it to `NavigationContainer`. Any component reads it with `useTheme()`, with no extra provider. Native headers, the screen background, and transitions also pick it up.
- **Typed augmentation.** `theme.d.ts` changes the return type of `useTheme()` to `ExtendedTheme`, so `colors.primary50` autocompletes everywhere.
- **Both themes are complete objects typed as `IColors`.** Dark is not a partial override of light. Forgetting a key in dark mode is a compile error.
- **Theme mode** (`'system' | 'light' | 'dark'`) is stored in `appSlice` and persisted. `useResolvedTheme()` turns mode + OS scheme into the active theme.

## Color key rules

| Key group | Meaning | Changes between light and dark? |
|---|---|---|
| `background`, `card`, `text`, `border`, `notification` | React Navigation base roles: screen bg, surface, main text, dividers | Yes |
| `primary`, `primary500` | Brand accent (buttons, active chips, links) | Usually same; adjust for contrast if needed |
| `*50`, `*100` (e.g. `primary50`, `red50`, `green50`) | **Tint backgrounds** behind colored text (badges, soft buttons) | Yes. Light: pale tint. Dark: deep, desaturated tint. |
| `*400`, `*500` (e.g. `red500`, `green500`) | **Foreground accents**: colored text, icons, solid badges | Usually same |
| `grey` … `grey500` | Secondary text, placeholders, muted borders | Yes |
| `white`, `black` | **Absolute.** `white` = text on solid colored buttons; `black` = shadows/overlays | No. Never use them for screen surfaces. |

Use `background`/`card`/`text` for anything that should flip. Use `white`/`black` only when the color must stay fixed, for example white text on a solid primary button.

## `src/interfaces/theme/theme.interface.ts`

```ts
import { Theme } from '@react-navigation/native';

export interface ExtendedTheme extends Theme {
  colors: Theme['colors'] & {
    primary50: string;
    primary100: string;
    primary500: string;

    black: string;
    white: string;

    grey: string;
    grey50: string;
    grey100: string;
    grey200: string;
    grey300: string;
    grey400: string;
    grey500: string;

    red: string;
    red50: string;
    red500: string;

    green: string;
    green50: string;
    green500: string;

    orange: string;
    orange50: string;
    orange400: string;

    overlay: string;
    toastBackground: string;
    toastText: string;
  };
}

export type IColors = ExtendedTheme['colors'];
```

## `src/interfaces/theme/theme.d.ts`

```ts
import '@react-navigation/native';
import { ExtendedTheme } from './theme.interface';

declare module '@react-navigation/native' {
  export function useTheme(): ExtendedTheme;
}
```

## `src/interfaces/theme/index.ts`

```ts
export type { ExtendedTheme, IColors } from './theme.interface';
```

## `src/constants/apptheme.ts`

```ts
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
} from '@react-navigation/native';
import { ExtendedTheme, IColors } from '@interfaces/theme';

// Brand constants shared by both themes. Change these per project.
const brand = {
  primary: '#6366F1',
  primary500: '#6366F1',
  white: '#FFFFFF',
  black: '#000000',
  red500: '#DC2626',
  green500: '#22C55E',
  orange400: '#F59E0B',
};

const lightColors: IColors = {
  ...brand,
  background: '#FFFFFF',
  card: '#F9FAFB',
  text: '#111827',
  border: '#E5E7EB',
  notification: brand.red500,

  primary50: '#EEF2FF',
  primary100: '#E0E7FF',

  grey: '#6B7280',
  grey50: '#F9FAFB',
  grey100: '#F3F4F6',
  grey200: '#E5E7EB',
  grey300: '#D1D5DB',
  grey400: '#9CA3AF',
  grey500: '#6B7280',

  red: '#EF4444',
  red50: '#FEE2E2',
  green: '#22C55E',
  green50: '#F0FDF4',
  orange: '#F59E0B',
  orange50: '#FFF7E6',

  overlay: 'rgba(0,0,0,0.5)',
  toastBackground: '#1F2937',
  toastText: '#FFFFFF',
};

const darkColors: IColors = {
  ...brand,
  primary: '#818CF8',
  primary500: '#818CF8',
  background: '#111827',
  card: '#1F2937',
  text: '#F9FAFB',
  border: '#374151',
  notification: '#F87171',

  primary50: '#1E1B4B',
  primary100: '#312E81',

  grey: '#9CA3AF',
  grey50: '#1F2937',
  grey100: '#374151',
  grey200: '#4B5563',
  grey300: '#6B7280',
  grey400: '#9CA3AF',
  grey500: '#D1D5DB',

  red: '#F87171',
  red50: '#3B1414',
  green: '#4ADE80',
  green50: '#052E16',
  orange: '#FBBF24',
  orange50: '#3A2A06',

  overlay: 'rgba(0,0,0,0.7)',
  toastBackground: '#F9FAFB',
  toastText: '#111827',
};

export const LightTheme: ExtendedTheme = {
  ...NavLightTheme,
  dark: false,
  colors: lightColors,
};

export const DarkTheme: ExtendedTheme = {
  ...NavDarkTheme,
  dark: true,
  colors: darkColors,
};
```

The base themes are spread so React Navigation's `fonts` and other fields stay intact. Dark extends `NavDarkTheme`, not `LightTheme`.

## Theme mode state — `src/slices/appSlice.ts`

```ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'system' | 'light' | 'dark';

interface AppState {
  themeMode: ThemeMode;
}

const initialState: AppState = {
  themeMode: 'system',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
    },
  },
});

export const { setThemeMode } = appSlice.actions;

export default appSlice.reducer;
```

Persist it (whitelist `themeMode`) in `store.ts`; see [08-state-management.md](08-state-management.md).

## `src/hooks/useResolvedTheme.ts`

```ts
import { useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { DarkTheme, LightTheme } from '@constants/apptheme';
import { ExtendedTheme } from '@interfaces/theme';
import { useAppSelector } from '@store';

export const useResolvedTheme = (): ExtendedTheme => {
  const themeMode = useAppSelector(s => s.app.themeMode);
  const systemScheme = useColorScheme();

  // Sync native UI (keyboard, alerts, pickers) with the chosen mode.
  // 'unspecified' hands control back to the OS. On RN versions before this
  // value existed, pass null instead.
  useEffect(() => {
    Appearance.setColorScheme(themeMode === 'system' ? 'unspecified' : themeMode);
  }, [themeMode]);

  const isDark =
    themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

  return isDark ? DarkTheme : LightTheme;
};
```

## Consuming the theme

```tsx
import { useTheme } from '@react-navigation/native';

const { colors, dark } = useTheme(); // typed as ExtendedTheme
```

- In styles: pass `colors` into the `*.styles.ts` factory (see [05-styling-and-responsive.md](05-styling-and-responsive.md)).
- In props that need a raw color (`ActivityIndicator color`, `placeholderTextColor`, `RefreshControl tintColor`, SVG `color`), read `colors.*` directly.
- `dark` decides status bar style. Only `AppLayout` does that.

## Switching theme — `src/screens/SettingsScreen/`

Every project ships this screen, so theme switching can be tested from day one.

```tsx
// src/screens/SettingsScreen/index.tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Txt from '@components/CustomText';
import AppLayout from '@components/layout';
import { useThemedStyles } from '@hooks/useThemedStyles';
import { setThemeMode, ThemeMode } from '@slices/appSlice';
import { useAppDispatch, useAppSelector } from '@store';
import { settingsStyles } from './settings.styles';

const MODES: ThemeMode[] = ['system', 'light', 'dark'];

const SettingsScreen = () => {
  const styles = useThemedStyles(settingsStyles);
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(s => s.app.themeMode);

  const body = (
    <View style={styles.container}>
      <Txt style={styles.label}>Appearance</Txt>
      <View style={styles.row}>
        {MODES.map(mode => {
          const active = themeMode === mode;
          return (
            <TouchableOpacity
              key={mode}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => dispatch(setThemeMode(mode))}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Txt style={active ? styles.chipTextActive : styles.chipText}>
                {mode}
              </Txt>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return <AppLayout title="Settings" body={body} />;
};

export default SettingsScreen;
```

```ts
// src/screens/SettingsScreen/settings.styles.ts
import { StyleSheet } from 'react-native';
import { responsiveFonts } from '@constants/responsive-fonts';
import { IColors } from '@interfaces/theme';
import { ms, screenPadding } from '@utils';
import { textStyling } from '@utils/text';

export const settingsStyles = (colors: IColors) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: screenPadding(),
      paddingTop: ms(16),
      gap: ms(12),
    },
    label: {
      ...textStyling({ fontSize: responsiveFonts.fontxiv, color: colors.grey })
        .medium,
    },
    row: {
      flexDirection: 'row',
      gap: ms(8),
    },
    chip: {
      flex: 1,
      paddingVertical: ms(12),
      borderRadius: ms(10),
      borderWidth: 1.5,
      borderColor: colors.grey200,
      backgroundColor: colors.card,
      alignItems: 'center',
    },
    chipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary50,
    },
    chipText: {
      ...textStyling({ fontSize: responsiveFonts.fontxiv, color: colors.grey })
        .medium,
      textTransform: 'capitalize',
    },
    chipTextActive: {
      ...textStyling({ fontSize: responsiveFonts.fontxiv, color: colors.primary })
        .semiBold,
      textTransform: 'capitalize',
    },
  });
```

The change is instant: `useResolvedTheme` re-renders `NavigationContainer` with the new theme, and every `useTheme()` consumer and memoized style updates.

## Adding a new color

1. Add the key to `ExtendedTheme['colors']` in `theme.interface.ts`.
2. Add a value in **both** `lightColors` and `darkColors`. TypeScript errors until you do.
3. Use it as `colors.newKey`.

## Rules

- No hex, `rgb()`, or named colors outside `apptheme.ts`. The only exception is `'transparent'`.
- No `useColorScheme()` in components. Use `useTheme().dark`.
- Never compute colors by string concat (`colors.black + '80'`). Add a token (`overlay`) instead.
- Components that need a color variant take a theme key or derive it inside, rather than receiving hardcoded hex defaults.
