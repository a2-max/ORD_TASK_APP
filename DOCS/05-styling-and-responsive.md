# 05 — Styling & Responsive Sizing

## The styles factory pattern

Every component or screen that needs styles has a sibling `<camelName>.styles.ts` exporting a **factory** that takes theme colors (plus any variant flags) and returns `StyleSheet.create(...)`.

```ts
// src/screens/ItemListScreen/components/itemCard.styles.ts
import { StyleSheet } from 'react-native';
import { responsiveFonts } from '@constants/responsive-fonts';
import { IColors } from '@interfaces/theme';
import { ms, screenPadding } from '@utils';
import { textStyling } from '@utils/text';

export const itemCardStyles = (colors: IColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: ms(12),
      padding: ms(16),
      marginBottom: ms(12),
    },
    title: {
      ...textStyling({ fontSize: responsiveFonts.fontxv, color: colors.text })
        .medium,
      flex: 1,
      marginRight: ms(8),
    },
    action: {
      minWidth: ms(72),
      paddingHorizontal: ms(12),
      backgroundColor: colors.primary50,
    },
    list: {
      paddingHorizontal: screenPadding(),
    },
  });
```

### Consuming it — always memoized

Every styles factory goes through `useThemedStyles`. It memoizes the StyleSheet and rebuilds it when:
- the theme changes (light/dark), or
- the window size changes (rotation, iPad split view / Slide Over, foldable unfolding, Android multi-window).

Extra factory arguments (variant flags) are passed after the factory.

```ts
// src/hooks/useThemedStyles.ts
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { IColors } from '@interfaces/theme';

export const useThemedStyles = <T, A extends unknown[]>(
  factory: (colors: IColors, ...args: A) => T,
  ...args: A
): T => {
  const { colors } = useTheme();
  // Subscribing here re-runs factories when the window resizes. The sizing
  // helpers (wp, hp, ms, fs, responsiveFonts) read the live window at call time.
  const { width, height } = useWindowDimensions();

  return useMemo(
    () => factory(colors, ...args),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colors, factory, width, height, ...args],
  );
};
```

```tsx
const styles = useThemedStyles(itemListStyles);                  // (colors)
const styles = useThemedStyles(itemCardStyles, isCompleted);     // (colors, isCompleted)
```

**Never** call `const styles = xStyles(colors)` bare in render, and never build styles in a `useMemo` that skips window size. Either one leaves stale or wasted styles.

### Rules

- Define factories at module level, never inside a component. `useThemedStyles` relies on a stable function reference.
- Always pass the same number of extra args to a given factory (they are memo deps).
- Inline style objects are only for truly dynamic values (animated values, measured sizes). Everything else goes in the styles file.
- Combine conditionally with arrays: `style={[styles.chip, active && styles.chipActive]}`.
- Small static styles in `App.tsx` or other non-themed spots may use a local `StyleSheet.create` at module bottom.

## Responsive system (phones, tablets, foldables, landscape)

### Why not plain percentages

Scaling everything by screen width (`fontSize: wp(3.5)`) breaks on large screens. A 1024pt-wide iPad would get 36pt body text and huge paddings. Values cached at app load also go stale on rotation or split view. This system:

1. **Scales from the short side** of the window against a 375pt phone baseline, so rotating a device doesn't change sizes.
2. **Damps scaling with a factor** (`moderateScale`): tablets get slightly larger UI, not proportionally giant UI.
3. **Clamps** the scale range so tiny phones and huge tablets stay sane.
4. **Reads the live window** on every call and re-renders through `useWindowDimensions`.
5. **Adapts layout with breakpoints** (columns, max content width, side-by-side panes) instead of only stretching.

### Breakpoints (window size classes)

Breakpoints use the **current window width**, not the device type, because an iPad in split view can be phone-width.

| Size class | Window width | Typical device | Layout |
|---|---|---|---|
| `compact` | `< 600` | Phones (portrait), tablet split view, folded foldables | 1 column, full width |
| `medium` | `600–839` | Phones landscape, small tablets portrait, unfolded foldables | 2 columns, content max width |
| `expanded` | `>= 840` | Tablets landscape, large tablets | 2–3 columns, list-detail side by side, content max width |

### `src/utils/responsiveScreen.utils.ts`

```ts
import { Dimensions, PixelRatio } from 'react-native';

// Design baseline: the phone the designs are drawn for.
const GUIDELINE_SHORT = 375;
const GUIDELINE_LONG = 812;

// Keeps scaling sane on very small phones and very large tablets.
const MIN_SCALE = 0.85;
const MAX_SCALE = 1.6;

export const BREAKPOINTS = {
  medium: 600,
  expanded: 840,
} as const;

export const MAX_CONTENT_WIDTH = 720; // readable column on tablets
export const TABLET_MIN_SHORT_SIDE = 600;

export type SizeClass = 'compact' | 'medium' | 'expanded';

const round = (value: number) => PixelRatio.roundToNearestPixel(value);
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// Always the live window: correct after rotation, split view, foldables.
export const getWindow = () => Dimensions.get('window');

const shortSide = () => {
  const { width, height } = getWindow();
  return Math.min(width, height);
};

const longSide = () => {
  const { width, height } = getWindow();
  return Math.max(width, height);
};

/** Linear scale from the short side (orientation-independent). */
export const scale = (size: number) =>
  round(size * clamp(shortSide() / GUIDELINE_SHORT, MIN_SCALE, MAX_SCALE));

/** Linear scale from the long side. Use sparingly (vertical rhythm on hero areas). */
export const verticalScale = (size: number) =>
  round(size * clamp(longSide() / GUIDELINE_LONG, MIN_SCALE, MAX_SCALE));

/**
 * Damped scale: size + (scale(size) - size) * factor.
 * factor 0 = fixed, 1 = fully proportional. Default 0.5 for spacing/radii/icons.
 */
export const moderateScale = (size: number, factor = 0.5) =>
  round(size + (scale(size) - size) * factor);

/** Font scale: damped more strongly so tablets get readable, not giant, text. */
export const fontScale = (size: number) => moderateScale(size, 0.3);

/** Percent of the CURRENT window width/height. Layout only, never fonts. */
export const wp = (percent: number) => round((getWindow().width * percent) / 100);
export const hp = (percent: number) => round((getWindow().height * percent) / 100);

export const getSizeClass = (width = getWindow().width): SizeClass => {
  if (width >= BREAKPOINTS.expanded) {
    return 'expanded';
  }
  if (width >= BREAKPOINTS.medium) {
    return 'medium';
  }
  return 'compact';
};

/** Device-level check (short side), independent of split view. */
export const isTablet = () => shortSide() >= TABLET_MIN_SHORT_SIDE;

/** Pick a value per size class, falling back to the next smaller class. */
export const responsiveValue = <T>(values: {
  compact: T;
  medium?: T;
  expanded?: T;
}): T => {
  const sizeClass = getSizeClass();
  if (sizeClass === 'expanded') {
    return values.expanded ?? values.medium ?? values.compact;
  }
  if (sizeClass === 'medium') {
    return values.medium ?? values.compact;
  }
  return values.compact;
};

/** Horizontal screen padding that grows with the size class. */
export const screenPadding = () =>
  responsiveValue({ compact: moderateScale(16), medium: 24, expanded: 32 });

export { moderateScale as ms, fontScale as fs };
```

```ts
// src/utils/index.ts
export * from './responsiveScreen.utils';
```

### Which helper for what

| Helper | Use for | Example |
|---|---|---|
| `fs(n)` / `responsiveFonts.*` | Font sizes, line heights | `lineHeight: fs(20)` |
| `ms(n)` | Paddings, margins, gaps, radii, icon sizes, fixed button heights | `padding: ms(16)`, `borderRadius: ms(12)` |
| `screenPadding()` | Horizontal padding of screen content | `paddingHorizontal: screenPadding()` |
| `wp(n)` / `hp(n)` | Layout fractions of the current window (hero image height, side panel width). Never fonts. | `height: hp(30)` |
| `scale(n)` | Rare: elements that must track width exactly (illustrations) | |
| `responsiveValue({...})` | Different values per size class | `numColumns: responsiveValue({ compact: 1, medium: 2, expanded: 3 })` |
| Raw numbers | Hairlines and borders (1–2), tiny offsets | `borderWidth: 1` |

### `src/hooks/useResponsive.ts`

Components that change **structure** (not just sizes) by screen size use this hook. It re-renders on window changes.

```ts
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  getSizeClass,
  isTablet,
  MAX_CONTENT_WIDTH,
  SizeClass,
} from '@utils';

export interface ResponsiveInfo {
  width: number;
  height: number;
  sizeClass: SizeClass;
  isCompact: boolean;
  isMedium: boolean;
  isExpanded: boolean;
  isTablet: boolean;
  isLandscape: boolean;
  columns: number;
  contentMaxWidth: number | undefined;
}

export const useResponsive = (): ResponsiveInfo => {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const sizeClass = getSizeClass(width);
    return {
      width,
      height,
      sizeClass,
      isCompact: sizeClass === 'compact',
      isMedium: sizeClass === 'medium',
      isExpanded: sizeClass === 'expanded',
      isTablet: isTablet(),
      isLandscape: width > height,
      columns: sizeClass === 'expanded' ? 3 : sizeClass === 'medium' ? 2 : 1,
      contentMaxWidth: sizeClass === 'compact' ? undefined : MAX_CONTENT_WIDTH,
    };
  }, [width, height]);
};
```

Usage patterns:

```tsx
// Grid that adapts: 1 / 2 / 3 columns. `key` forces a remount when the
// column count changes (FlatList cannot change numColumns on the fly).
const { columns } = useResponsive();

<FlatList
  key={`grid-${columns}`}
  numColumns={columns}
  columnWrapperStyle={columns > 1 ? styles.columnGap : undefined}
  ...
/>

// List-detail side by side on expanded screens, push navigation on phones.
const { isExpanded } = useResponsive();
return isExpanded ? (
  <View style={styles.split}>
    <ItemList onSelect={setSelectedId} style={styles.listPane} />
    <ItemDetailPane itemId={selectedId} style={styles.detailPane} />
  </View>
) : (
  <ItemList onSelect={id => navigation.navigate('ItemDetailScreen', { itemId: id })} />
);
```

Content width: `AppLayout` centers the body at `MAX_CONTENT_WIDTH` on medium/expanded windows (see [06-core-components.md](06-core-components.md)). Screens that need the full width (grids, maps, media, split panes) pass `fullWidth`.

### Orientation & multitasking setup

| Platform | Setting | Recommended |
|---|---|---|
| iOS phone | `UISupportedInterfaceOrientations` in `Info.plist` | Portrait (add landscape only if designed for it) |
| iOS iPad | `UISupportedInterfaceOrientations~ipad` | **All four.** iPad multitasking (split view) requires all orientations unless `UIRequiresFullScreen` is set. |
| Android | `android:screenOrientation` on `MainActivity` | Leave unset (Android 16+ ignores orientation locks on large screens). `android:resizeableActivity="true"` (default) for multi-window. |
| Per screen | native-stack `orientation` option | Lock specific screens (e.g. video player `'landscape'`) |

Test matrix before release: small phone (iPhone SE / 360dp Android), large phone, phone landscape, iPad portrait + landscape + split view (1/3 and 1/2), Android tablet, foldable (folded/unfolded) or a resizable emulator.

## Font scale — `src/constants/responsive-fonts.ts`

Names use Roman numerals for the size on the 375pt baseline phone. Getters compute the value at access time, so styles rebuilt by `useThemedStyles` after a resize get fresh sizes, with no call-site change (`responsiveFonts.fontxv`).

```ts
import { fs } from '@utils';

export const responsiveFonts = {
  get fontxxx() { return fs(30); }, //  display
  get fontxx() { return fs(22); }, //   screen title
  get fontxviii() { return fs(18); }, // header / section title
  get fontxvi() { return fs(16); }, //  button / emphasized body
  get fontxv() { return fs(15); }, //   body
  get fontxiv() { return fs(14); }, //  secondary body, labels
  get fontxii() { return fs(12); }, //  small actions, captions
  get fontx() { return fs(10); }, //    badges, meta
};
```

On a 375pt phone these equal their names. On a 768pt-short-side iPad they come out about 30% larger (e.g. 15 → ~19.5), not 2x.

Never write a raw `fontSize: 14`. Always use `responsiveFonts.*` (or `fs(n)` for one-off sizes such as line heights).

## Text styles — `src/utils/text/text-style.utils.ts`

`textStyling` returns weight variants for a given size and color. Spread the variant you need.

```ts
import { StyleSheet, TextStyle } from 'react-native';
import AppFonts from '@constants/fonts';

interface TextStyleConstants {
  fontSize?: TextStyle['fontSize'];
  color: string;
}

export const textStyling = ({ fontSize = 14, color }: TextStyleConstants) =>
  StyleSheet.create({
    bold: { fontSize, color, fontWeight: '700', fontFamily: AppFonts.bold },
    semiBold: {
      fontSize,
      color,
      fontWeight: '600',
      fontFamily: AppFonts.semiBold,
    },
    medium: { fontSize, color, fontWeight: '500', fontFamily: AppFonts.medium },
    regular: {
      fontSize,
      color,
      fontWeight: '400',
      fontFamily: AppFonts.regular,
    },
    light: { fontSize, color, fontWeight: '300', fontFamily: AppFonts.light },
  });
```

```ts
// src/utils/text/index.ts
export { textStyling } from './text-style.utils';
```

`color` is required, which forces a theme color. Usage inside a styles factory:

```ts
title: {
  ...textStyling({ fontSize: responsiveFonts.fontxviii, color: colors.text })
    .semiBold,
  textAlign: 'center',
},
```

## Custom fonts — `src/constants/fonts.ts`

```ts
// Leave undefined to use the system font. With custom fonts, put files in
// src/assets/fonts, link them (react-native.config.js + `yarn dlx react-native-asset`),
// and set the PostScript names here.
const AppFonts: Record<
  'light' | 'regular' | 'medium' | 'semiBold' | 'bold',
  string | undefined
> = {
  light: undefined,
  regular: undefined,
  medium: undefined,
  semiBold: undefined,
  bold: undefined,
};

export default AppFonts;
```

With custom fonts, Android ignores `fontWeight` for most families, so each weight needs its own `fontFamily`. That is why `textStyling` sets both.
