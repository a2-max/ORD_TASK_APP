# 06 — Core Components

These shared components exist in every project. Create them exactly as below. Screens are built only from these, from screen-local components, and from React Native primitives (`View`, `FlatList`, `TextInput`, `Pressable`, …).

| Component | Path | Export | Role |
|---|---|---|---|
| `Txt` | `components/CustomText/index.tsx` | default | The only text component |
| `AppLayout` | `components/layout/index.tsx` | default | Screen shell. Takes `header`, `body`, `footer` as props; handles safe area, status bar, scroll/refresh, keyboard, tablet max width |
| `SubScreenHeader` | `components/headers/SubScreenHeader.tsx` | default | Back button + title + right slot |
| `Btn` | `components/Button/index.tsx` | default | Primary / outlined button with loading |
| `SpacerColumn` | `components/spacer/SpacerColumn.tsx` | named | Vertical spacing and hairline dividers |
| `NoData` | `components/NoData/index.tsx` | default | Empty state |
| `ConfirmModal`, `AlertBox`, `BottomSheet` | `components/<Name>/index.tsx` | default | Themed wrappers of `@whoisrijan/react-native-layer`; see [10-overlays-and-context.md](10-overlays-and-context.md) |
| `SvgIcon` | `components/SvgIcon/index.tsx` | default | Typed SVG icon by name |

---

## Txt

Wraps `Text`. Applies the theme text color as a default, so un-styled text is readable in dark mode. Disables OS font scaling by default, because sizes already scale with screen width through `responsiveFonts`. Pass `allowFontScaling` per instance where accessibility matters most (long body text).

```tsx
// src/components/CustomText/index.tsx
import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '@react-navigation/native';

const Txt = ({ style, allowFontScaling = false, ...rest }: TextProps) => {
  const { colors } = useTheme();

  return (
    <Text
      allowFontScaling={allowFontScaling}
      style={[{ color: colors.text }, style]}
      {...rest}
    />
  );
};

export default Txt;
```

Usage: `<Txt style={styles.title} numberOfLines={2}>{item.title}</Txt>`

---

## AppLayout

Every screen's root element. A screen passes its **header and body as props**; `AppLayout` arranges them. Screens never render `AppLayout` with children.

```text
┌──────────────────────────────┐
│ StatusBar  (owned here)      │  ← safe-area top inset
├──────────────────────────────┤
│ header                       │  `header` prop, or default SubScreenHeader from `title`
├──────────────────────────────┤
│                              │
│ body                         │  `body` prop (View, or ScrollView when `withScroll`)
│ (centered, max 720pt wide    │   on medium/expanded windows unless `fullWidth`)
│                              │
├──────────────────────────────┤
│ footer                       │  optional sticky `footer` (primary action)
└──────────────────────────────┘  ← safe-area bottom inset
```

Responsibilities:
- Fills the screen with `colors.background` and pads by safe-area insets. Screens never use `SafeAreaView`.
- Renders the **only** `StatusBar` in the app, styled from `theme.dark`.
- Header: renders the `header` element you pass. If none is passed, it builds the default `SubScreenHeader` from `title` / `showBackBtn` / `onPressLeft` / `subHeaderChildren`. `showHeader={false}` hides the header entirely.
- Body: renders `body` in a flex `View`, or in a `ScrollView` (with optional pull-to-refresh) when `withScroll`.
- Footer: optional sticky area under the body. It stays above the keyboard when `keyboardAvoiding`.
- Large screens: centers header, body, and footer in a `MAX_CONTENT_WIDTH` column on medium/expanded windows. `fullWidth` opts out (grids, split panes, media).

Native-stack headers are disabled globally (`headerShown: false`), so `AppLayout` draws the header. That keeps headers themed and identical on both platforms.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `body` | `ReactNode` | — | **Required.** Screen content. Overlays (`ConfirmModal`, `BottomSheet`, `AlertBox`) go at the end of the body fragment. |
| `header` | `ReactNode` | — | Custom header element. Overrides the default header. |
| `showHeader` | `boolean` | `true` | `false` = no header at all |
| `title` | `string` | `''` | Default header only |
| `showBackBtn` | `boolean` | `true` | Default header only |
| `onPressLeft` | `() => void` | `navigation.goBack()` | Default header only |
| `subHeaderChildren` | `ReactNode` | — | Default header right slot |
| `footer` | `ReactNode` | — | Sticky bottom area (e.g. Save button) |
| `withScroll` | `boolean` | `false` | Wrap body in `ScrollView`. Never use with a body that is a `FlatList`. |
| `scrollProps` | `ScrollViewProps` | — | Extra props for the ScrollView |
| `onRefresh` / `refreshing` | | — | Pull-to-refresh when `withScroll` |
| `keyboardAvoiding` | `boolean` | `false` | Wrap body + footer in `KeyboardAvoidingView` (forms) |
| `fullWidth` | `boolean` | `false` | Skip the tablet max-width column |
| `statusBarStyle` | `StatusBarStyle` | from theme | Override only for screens with dark/light hero images |

```tsx
// src/components/layout/index.tsx
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  ScrollViewProps,
  StatusBar,
  StatusBarStyle,
  View,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SubScreenHeader, {
  SubScreenHeaderProps,
} from '@components/headers/SubScreenHeader';
import { useResponsive } from '@hooks/useResponsive';
import { useThemedStyles } from '@hooks/useThemedStyles';
import { layoutStyles } from './layout.styles';

interface LayoutProps
  extends Pick<
    SubScreenHeaderProps,
    'title' | 'subHeaderChildren' | 'showBackBtn'
  > {
  body: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  showHeader?: boolean;
  onPressLeft?: () => void;
  withScroll?: boolean;
  scrollProps?: Omit<ScrollViewProps, 'children' | 'refreshControl'>;
  onRefresh?: () => void;
  refreshing?: boolean;
  keyboardAvoiding?: boolean;
  fullWidth?: boolean;
  statusBarStyle?: StatusBarStyle;
}

const AppLayout = ({
  body,
  header,
  footer,
  showHeader = true,
  title = '',
  showBackBtn = true,
  subHeaderChildren,
  onPressLeft,
  withScroll = false,
  scrollProps,
  onRefresh,
  refreshing = false,
  keyboardAvoiding = false,
  fullWidth = false,
  statusBarStyle,
}: LayoutProps) => {
  const insets = useSafeAreaInsets();
  const { colors, dark } = useTheme();
  const { contentMaxWidth } = useResponsive();
  const navigation = useNavigation();
  const styles = useThemedStyles(layoutStyles, insets.top, insets.bottom);

  // Same centered column for header, body and footer so edges line up on tablets.
  const columnStyle = [
    styles.column,
    !fullWidth && contentMaxWidth ? { maxWidth: contentMaxWidth } : null,
  ];

  const onBackPress = () => {
    if (onPressLeft) {
      onPressLeft();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const renderHeader = () => {
    if (!showHeader) {
      return null;
    }
    if (header !== undefined) {
      return <View style={columnStyle}>{header}</View>;
    }
    return (
      <View style={columnStyle}>
        <SubScreenHeader
          title={title}
          subOnPressLeft={onBackPress}
          showBackBtn={showBackBtn}
          subHeaderChildren={subHeaderChildren}
        />
      </View>
    );
  };

  const renderBody = () => {
    if (!withScroll) {
      return <View style={[styles.flex, columnStyle]}>{body}</View>;
    }
    return (
      <ScrollView
        style={styles.flex}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...scrollProps}
        contentContainerStyle={[
          styles.scrollContent,
          columnStyle,
          scrollProps?.contentContainerStyle,
        ]}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
      >
        {body}
      </ScrollView>
    );
  };

  const renderFooter = () =>
    footer ? <View style={[styles.footer, columnStyle]}>{footer}</View> : null;

  const content = (
    <>
      {renderBody()}
      {renderFooter()}
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={statusBarStyle ?? (dark ? 'light-content' : 'dark-content')}
        backgroundColor={colors.background}
      />
      {renderHeader()}
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </View>
  );
};

export default AppLayout;
```

```ts
// src/components/layout/layout.styles.ts
import { StyleSheet } from 'react-native';
import { IColors } from '@interfaces/theme';
import { ms, screenPadding } from '@utils';

export const layoutStyles = (
  colors: IColors,
  insetTop: number,
  insetBottom: number,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: insetTop,
      paddingBottom: insetBottom,
    },
    flex: {
      flex: 1,
    },
    column: {
      width: '100%',
      alignSelf: 'center',
    },
    scrollContent: {
      flexGrow: 1,
    },
    footer: {
      paddingHorizontal: screenPadding(),
      paddingTop: ms(12),
      paddingBottom: ms(8),
      backgroundColor: colors.background,
    },
  });
```

Android edge-to-edge (default in recent RN versions) ignores `StatusBar backgroundColor`. Because the container paints `colors.background` under the inset, the result looks the same either way.

### Usage patterns

Build header and body as named elements above `return`. That keeps the JSX readable.

```tsx
// 1. Root list screen: custom header, FlatList body (FlatList scrolls itself)
const header = (
  <View style={styles.headerRow}>
    <Txt style={styles.headerTitle}>Items</Txt>
    <Btn title="+ Add" onPress={openCreate} styleMain={styles.addButton} />
  </View>
);

const body = (
  <>
    <FilterBar />
    <FlatList ... />
    <ConfirmModal ... />
  </>
);

return <AppLayout header={header} body={body} />;

// 2. Sub screen: default header from title, scrollable body with refresh
return (
  <AppLayout
    title="Item Detail"
    withScroll
    onRefresh={refetch}
    refreshing={isFetching}
    body={<ItemDetailContent item={item} />}
  />
);

// 3. Form screen: keyboard avoiding + sticky footer action
return (
  <AppLayout
    title="Create Item"
    keyboardAvoiding
    withScroll
    body={formFields}
    footer={<Btn title="Save" onPress={handleSave} loading={isSaving} />}
  />
);

// 4. Full-bleed tablet grid / split view
return <AppLayout title="Gallery" fullWidth body={grid} />;

// 5. No header (splash-like / onboarding)
return <AppLayout showHeader={false} body={onboarding} />;
```

Rules:
- `body` is required. Do not pass children.
- Custom headers go in `header`. Don't render a header row as the first element of `body`.
- Primary actions that must stay visible (Save, Checkout) go in `footer`, not at the end of a scroll body.
- Overlays go at the end of `body`.

---

## SubScreenHeader

Three columns: a fixed 40pt left slot (back chevron), a flexible centered title, and a fixed 40pt right slot. When there is no back button, the title aligns left.

```tsx
// src/components/headers/SubScreenHeader.tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Txt from '@components/CustomText';
import SvgIcon from '@components/SvgIcon';
import { SpacerColumn } from '@components/spacer/SpacerColumn';
import { useThemedStyles } from '@hooks/useThemedStyles';
import { ms } from '@utils';
import { subHeaderStyles } from './header.styles';

export interface SubScreenHeaderProps {
  title?: string;
  subOnPressLeft?: () => void;
  subHeaderChildren?: React.ReactNode;
  showBackBtn?: boolean;
}

const SubScreenHeader = ({
  title,
  subOnPressLeft,
  subHeaderChildren,
  showBackBtn = true,
}: SubScreenHeaderProps) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(subHeaderStyles);

  return (
    <>
      <SpacerColumn size={1} mv={ms(14)} />
      <View style={styles.subHeaderContainer}>
        {showBackBtn && (
          <TouchableOpacity
            style={styles.leftRightContainer}
            hitSlop={10}
            onPress={subOnPressLeft}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <SvgIcon
              source="chevronLeft"
              color={colors.text}
              height={ms(18)}
              width={ms(18)}
            />
          </TouchableOpacity>
        )}
        <View
          style={[
            styles.headerTextContainer,
            !showBackBtn && styles.headerTextLeft,
          ]}
        >
          <Txt style={styles.subHeaderText} numberOfLines={1}>
            {title}
          </Txt>
        </View>
        <View style={styles.leftRightContainer}>{subHeaderChildren}</View>
      </View>
    </>
  );
};

export default SubScreenHeader;
```

```ts
// src/components/headers/header.styles.ts
import { StyleSheet } from 'react-native';
import { responsiveFonts } from '@constants/responsive-fonts';
import { IColors } from '@interfaces/theme';
import { ms, screenPadding } from '@utils';
import { textStyling } from '@utils/text';

export const subHeaderStyles = (colors: IColors) =>
  StyleSheet.create({
    subHeaderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: screenPadding(),
      paddingBottom: ms(8),
    },
    leftRightContainer: {
      width: ms(40),
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTextContainer: {
      flex: 1,
      alignItems: 'center',
    },
    headerTextLeft: {
      alignItems: 'flex-start',
    },
    subHeaderText: {
      ...textStyling({
        fontSize: responsiveFonts.fontxviii,
        color: colors.text,
      }).semiBold,
    },
  });
```

---

## Btn

```tsx
// src/components/Button/index.tsx
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  TextStyle,
  Vibration,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Txt from '@components/CustomText';
import { useThemedStyles } from '@hooks/useThemedStyles';
import { buttonStyles } from './button.styles';

interface ButtonProps {
  title: string;
  onPress: () => void;
  styleMain?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  vibrate?: boolean;
  outlined?: boolean;
}

const Btn = ({
  title,
  onPress,
  styleMain,
  textStyle,
  disabled = false,
  loading = false,
  vibrate = false,
  outlined = false,
}: ButtonProps) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(buttonStyles);

  const handlePress = () => {
    if (vibrate) {
      Vibration.vibrate(50);
    }
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        outlined && styles.outlined,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        styleMain,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={outlined ? colors.primary : colors.white}
        />
      ) : (
        <Txt style={[outlined ? styles.outlinedText : styles.text, textStyle]}>
          {title}
        </Txt>
      )}
    </Pressable>
  );
};

export default Btn;
```

```ts
// src/components/Button/button.styles.ts
import { StyleSheet } from 'react-native';
import { responsiveFonts } from '@constants/responsive-fonts';
import { IColors } from '@interfaces/theme';
import { ms } from '@utils';
import { textStyling } from '@utils/text';

export const buttonStyles = (colors: IColors) =>
  StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: colors.primary,
      paddingVertical: ms(14),
      borderRadius: ms(10),
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      ...textStyling({ fontSize: responsiveFonts.fontxvi, color: colors.white })
        .semiBold,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    outlinedText: {
      ...textStyling({
        fontSize: responsiveFonts.fontxvi,
        color: colors.primary,
      }).semiBold,
    },
    disabled: {
      opacity: 0.5,
    },
    pressed: {
      opacity: 0.85,
    },
  });
```

---

## SpacerColumn

A full-width horizontal element: an invisible spacer or a hairline divider. Height = `hairlineWidth * size`, plus vertical margin `mv`.

```tsx
// src/components/spacer/SpacerColumn.tsx
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface SpacerProps {
  size: number;
  containerWidth?: number | `${number}%`;
  background?: string;
  mv?: number;
  mh?: number;
  styleContainer?: ViewStyle;
}

export const SpacerColumn = ({
  size,
  containerWidth = '100%',
  background,
  mv = 0,
  mh = 0,
  styleContainer,
}: SpacerProps) => (
  <View
    style={[
      {
        height: StyleSheet.hairlineWidth * size,
        width: containerWidth,
        backgroundColor: background,
        marginVertical: mv,
        marginHorizontal: mh,
        alignSelf: 'center',
      },
      styleContainer,
    ]}
  />
);
```

Usage:
- Gap: `<SpacerColumn size={1} mv={8} />`
- Divider: `<SpacerColumn size={1} background={colors.border} mv={ms(4)} />`

---

## NoData

```tsx
// src/components/NoData/index.tsx
import React from 'react';
import { View } from 'react-native';
import Txt from '@components/CustomText';
import { SpacerColumn } from '@components/spacer/SpacerColumn';
import { useThemedStyles } from '@hooks/useThemedStyles';
import { noDataStyles } from './noData.styles';

interface NoDataProps {
  headerText: string;
  descriptionText?: string;
  children?: React.ReactNode; // optional CTA (e.g. a Btn)
}

const NoData = ({ headerText, descriptionText, children }: NoDataProps) => {
  const styles = useThemedStyles(noDataStyles);

  return (
    <View style={styles.container}>
      <Txt style={styles.headerText}>{headerText}</Txt>
      {!!descriptionText && (
        <>
          <SpacerColumn size={1} mv={4} />
          <Txt style={styles.text}>{descriptionText}</Txt>
        </>
      )}
      {children}
    </View>
  );
};

export default React.memo(NoData);
```

```ts
// src/components/NoData/noData.styles.ts
import { StyleSheet } from 'react-native';
import { responsiveFonts } from '@constants/responsive-fonts';
import { IColors } from '@interfaces/theme';
import { ms } from '@utils';
import { textStyling } from '@utils/text';

export const noDataStyles = (colors: IColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: ms(24),
      gap: ms(12),
    },
    headerText: {
      ...textStyling({
        fontSize: responsiveFonts.fontxviii,
        color: colors.text,
      }).semiBold,
      textAlign: 'center',
    },
    text: {
      ...textStyling({ fontSize: responsiveFonts.fontxiv, color: colors.grey })
        .regular,
      textAlign: 'center',
    },
  });
```

---

## SvgIcon

SVG files are imported as components (thanks to `react-native-svg-transformer`) and registered in one map. `SvgIcon` takes a typed `source` key, so a typo is a compile error.

```ts
// src/components/SvgIcon/svg.d.ts
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
```

```ts
// src/assets/svg/svg.list.ts
import chevronLeft from './chevronLeft.svg';

export const iconMap = {
  chevronLeft,
};
```

```tsx
// src/components/SvgIcon/index.tsx
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { useTheme } from '@react-navigation/native';
import { iconMap } from '@assets/svg/svg.list';
import { svgIconStyles } from './svgIcon.styles';

export type SvgIconKey = keyof typeof iconMap;

type IconProps = SvgProps & {
  source: SvgIconKey;
  width?: number;
  height?: number;
  color?: string;
  addCircle?: boolean;
  circleSize?: number;
  bgColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

const SvgIcon = ({
  source,
  width = 20,
  height = 20,
  color,
  addCircle = false,
  circleSize,
  bgColor,
  containerStyle,
  ...rest
}: IconProps) => {
  const { colors } = useTheme();
  const Icon = iconMap[source];
  const styles = React.useMemo(
    () => svgIconStyles(circleSize ?? width * 2, bgColor ?? colors.primary50),
    [circleSize, width, bgColor, colors.primary50],
  );

  const icon = (
    <Icon width={width} height={height} color={color ?? colors.text} {...rest} />
  );

  return addCircle ? (
    <View style={[styles.circle, containerStyle]}>{icon}</View>
  ) : (
    icon
  );
};

export default SvgIcon;
```

```ts
// src/components/SvgIcon/svgIcon.styles.ts
import { StyleSheet } from 'react-native';

export const svgIconStyles = (size: number, bgColor: string) =>
  StyleSheet.create({
    circle: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: bgColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
```

### SVG file rules

- Replace hardcoded fills/strokes in the `.svg` with `currentColor` so the `color` prop themes it: `stroke="currentColor"`.
- Keep the `viewBox`; remove fixed `width`/`height` attributes.
- Add a new icon in two steps: drop the file into `assets/svg/`, then add one line to `iconMap`.

Example `chevronLeft.svg`:

```xml
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```
