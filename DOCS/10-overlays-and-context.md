# 10 — Overlays (`@whoisrijan/react-native-layer`) & Context

All overlays (bottom sheets, confirm dialogs, alerts, toasts, custom slide-up layers) come from **[`@whoisrijan/react-native-layer`](https://www.npmjs.com/package/@whoisrijan/react-native-layer)**. It animates on the UI thread with Reanimated, drags with Gesture Handler, handles safe areas, and handles the Android back button automatically.

The library takes raw color props, so screens never import it directly for themed components. Each component gets a **thin themed wrapper** in `src/components/` that injects theme colors and typography and removes the color props from its type. This keeps the "no hex outside `apptheme.ts`" rule enforced by TypeScript.

| Need | Use | Import from |
|---|---|---|
| Confirm an action (delete, logout, discard) | `ConfirmModal` wrapper | `@components/ConfirmModal` |
| Irreversible action that needs typed confirmation | `ConfirmModal` with `showInput` + `validationText` | `@components/ConfirmModal` |
| Inform the user and wait for "OK" (success, error, warning, question) | `AlertBox` wrapper | `@components/AlertBox` |
| Short feedback that disappears on its own | `useAppToast()` | `@hooks/useAppToast` |
| Action menu, picker, filters, small form, details peek | `BottomSheet` wrapper | `@components/BottomSheet` |
| Fully custom overlay (own layout, own gestures) | `Layer` (direct) | `@whoisrijan/react-native-layer` |
| Dismiss keyboard safely / read keyboard state | `useKeyboard`, `closeKeyboard` | `@whoisrijan/react-native-layer` |
| Multi-step flow with its own back navigation | Native-stack screen with `presentation: 'modal'` or `'formSheet'` | [07-navigation.md](07-navigation.md) |

**Never** use React Native's `Modal`, `Alert.alert`, or a hand-rolled toast, and never add another bottom-sheet library.

## Install & setup

```bash
yarn add @whoisrijan/react-native-layer react-native-reanimated react-native-worklets
# already installed by the base setup:
# react-native-gesture-handler react-native-safe-area-context react-native-svg
cd ios && bundle exec pod install && cd ..
```

Peer requirements: `react-native-reanimated >= 4`, `react-native-worklets >= 0.5`, `react-native-gesture-handler >= 2`, `react-native-safe-area-context >= 4`, `react-native-svg >= 13`. Reanimated 4 needs the New Architecture, which is the default in current RN.

1. Add `'react-native-worklets/plugin'` as the **last** Babel plugin (see [02-project-setup.md](02-project-setup.md)).
2. The root needs `GestureHandlerRootView` → `SafeAreaProvider` → `ToastProvider` (from the library). `App.tsx` in doc 02 already does this.
3. Rebuild both platforms and run `yarn start:clean`. A Metro reload is not enough after adding Reanimated/Worklets.

## Theme tokens used by overlays

These keys must exist in `ExtendedTheme['colors']` (already defined in [04-theme.md](04-theme.md)):

| Token | Used for |
|---|---|
| `overlay` | Dialog / alert backdrop |
| `black` | Bottom sheet / layer backdrop base (opacity applied by the library) |
| `card` | Sheet, dialog, and alert backgrounds |
| `text`, `grey` | Titles, messages |
| `grey100`, `grey300` | Cancel button background, sheet drag handle |
| `primary`, `red500`, `green500`, `orange400`, `white` | Buttons and semantic accents |
| `toastBackground`, `toastText` | Default toast |

---

## ConfirmModal — `src/components/ConfirmModal/index.tsx`

```tsx
import React from 'react';
import { useTheme } from '@react-navigation/native';
import {
  ConfirmModal as LayerConfirmModal,
  type ConfirmModalProps as LayerConfirmModalProps,
} from '@whoisrijan/react-native-layer';
import { useThemedStyles } from '@hooks/useThemedStyles';
import { confirmModalStyles } from './confirmModal.styles';

// Color props come from the theme; callers cannot pass hex values.
type ThemedColorProps =
  | 'backdropColor'
  | 'cardBackgroundColor'
  | 'titleColor'
  | 'messageColor'
  | 'positiveButtonColor'
  | 'positiveTextColor'
  | 'negativeButtonColor'
  | 'negativeTextColor';

export type ConfirmModalProps = Omit<LayerConfirmModalProps, ThemedColorProps> & {
  destructive?: boolean;
};

const ConfirmModal = ({ destructive = false, ...props }: ConfirmModalProps) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(confirmModalStyles);

  return (
    <LayerConfirmModal
      backdropColor={colors.overlay}
      cardBackgroundColor={colors.card}
      titleColor={colors.text}
      messageColor={colors.grey}
      positiveButtonColor={destructive ? colors.red500 : colors.primary}
      positiveTextColor={colors.white}
      negativeButtonColor={colors.grey100}
      negativeTextColor={colors.text}
      cardStyle={styles.card}
      titleStyle={styles.title}
      messageStyle={styles.message}
      labelStyle={styles.label}
      inputStyle={styles.input}
      positiveStyle={styles.buttonText}
      negativeStyle={styles.buttonText}
      {...props}
    />
  );
};

export default ConfirmModal;
```

```ts
// src/components/ConfirmModal/confirmModal.styles.ts
import { StyleSheet } from 'react-native';
import { responsiveFonts } from '@constants/responsive-fonts';
import { IColors } from '@interfaces/theme';
import { ms } from '@utils';
import { textStyling } from '@utils/text';

export const confirmModalStyles = (colors: IColors) =>
  StyleSheet.create({
    card: {
      borderRadius: ms(16),
    },
    title: {
      ...textStyling({ fontSize: responsiveFonts.fontxviii, color: colors.text })
        .bold,
    },
    message: {
      ...textStyling({ fontSize: responsiveFonts.fontxiv, color: colors.grey })
        .regular,
      lineHeight: 20,
    },
    label: {
      ...textStyling({ fontSize: responsiveFonts.fontxiv, color: colors.grey })
        .medium,
    },
    input: {
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    buttonText: {
      ...textStyling({ fontSize: responsiveFonts.fontxv, color: colors.text })
        .semiBold,
    },
  });
```

The library sets button text colors through `positiveTextColor` / `negativeTextColor`. Keep the `buttonText` style limited to size and weight if a color conflict shows up.

Usage (the screen owns the state):

```tsx
const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);

<ConfirmModal
  visible={deleteTarget !== null}
  title="Delete Item"
  message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
  positiveText="Delete"
  destructive
  onCancel={() => setDeleteTarget(null)}
  onConfirm={handleConfirmDelete}
/>

// Guarded: confirm stays disabled until the user types the exact text.
// `message` is ignored when showInput is true; put guidance in inputLabel.
<ConfirmModal
  visible={visible}
  title="Delete Account"
  showInput
  inputLabel='Type "DELETE" to confirm'
  inputPlaceholder="DELETE"
  validationText="DELETE"
  positiveText="Delete Forever"
  destructive
  onCancel={close}
  onConfirm={handleDeleteAccount}
/>
```

---

## AlertBox — `src/components/AlertBox/index.tsx`

Named `AlertBox` so it never gets confused with React Native's `Alert` API. `type` picks both the library icon and the theme accent for the button.

```tsx
import React from 'react';
import { useTheme } from '@react-navigation/native';
import {
  Alert as LayerAlert,
  type AlertProps as LayerAlertProps,
  type AlertType,
} from '@whoisrijan/react-native-layer';
import { useThemedStyles } from '@hooks/useThemedStyles';
import { IColors } from '@interfaces/theme';
import { alertBoxStyles } from './alertBox.styles';

type ThemedColorProps =
  | 'backdropColor'
  | 'backgroundColor'
  | 'titleColor'
  | 'messageColor'
  | 'buttonColor'
  | 'buttonTextColor';

export type AlertBoxProps = Omit<LayerAlertProps, ThemedColorProps>;

const accentFor = (colors: IColors, type?: AlertType) => {
  switch (type) {
    case 'success':
      return colors.green500;
    case 'error':
      return colors.red500;
    case 'warning':
      return colors.orange400;
    default:
      return colors.primary; // 'question' and no type
  }
};

const AlertBox = (props: AlertBoxProps) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(alertBoxStyles);

  return (
    <LayerAlert
      backdropColor={colors.overlay}
      backgroundColor={colors.card}
      titleColor={colors.text}
      messageColor={colors.grey}
      buttonColor={accentFor(colors, props.type)}
      buttonTextColor={colors.white}
      {...props}
    />
  );
};

export default AlertBox;
```

If the installed library version exposes `titleStyle` / `messageStyle` on `Alert`, pass `styles.title` / `styles.message` from `alertBox.styles.ts` (same shape as `confirmModalStyles`). Otherwise the color props above are enough, and the styles file can be left out.

Usage:

```tsx
<AlertBox
  visible={successVisible}
  type="success"
  title="Payment Successful"
  message="Your order is confirmed."
  onClose={() => setSuccessVisible(false)}
/>

<AlertBox
  visible={offline}
  type="error"
  position="bottom"
  title="You're offline"
  message="Check your connection."
  buttonText="Dismiss"
  onClose={() => setOffline(false)}
/>
```

---

## Toast — `src/hooks/useAppToast.ts`

`ToastProvider` from the library is mounted once in `App.tsx`. Screens call `useAppToast()`, never the library's `useToast`, so toast colors always come from the theme.

```ts
import { useCallback } from 'react';
import { useTheme } from '@react-navigation/native';
import { type ToastConfig, useToast } from '@whoisrijan/react-native-layer';

export type AppToastType = 'default' | 'success' | 'error' | 'warning';

export type AppToastOptions = Omit<ToastConfig, 'backgroundColor' | 'textColor'> & {
  type?: AppToastType;
};

export const useAppToast = () => {
  const { showToast: showLayerToast } = useToast();
  const { colors } = useTheme();

  const showToast = useCallback(
    ({ type = 'default', ...config }: AppToastOptions) => {
      const backgroundColor = {
        default: colors.toastBackground,
        success: colors.green500,
        error: colors.red500,
        warning: colors.orange400,
      }[type];

      showLayerToast({
        ...config,
        backgroundColor,
        textColor: type === 'default' ? colors.toastText : colors.white,
      });
    },
    [showLayerToast, colors],
  );

  return { showToast };
};
```

Usage:

```tsx
const { showToast } = useAppToast();

showToast({ message: 'Item created', type: 'success', position: 'top' });
showToast({ message: error.message, type: 'error' });             // bottom (default)
showToast({ message: 'Copied', position: 'center', duration: 1500 });
```

Toasts render above everything, including an open `BottomSheet`, `ConfirmModal`, `AlertBox`, or `Layer`. Messages are capped at 2 lines. Defaults: `position: 'bottom'`, `duration: 3000`.

---

## BottomSheet — `src/components/BottomSheet/index.tsx`

```tsx
import React from 'react';
import { useTheme } from '@react-navigation/native';
import {
  BottomSheet as LayerBottomSheet,
  type BottomSheetProps as LayerBottomSheetProps,
} from '@whoisrijan/react-native-layer';
import { useThemedStyles } from '@hooks/useThemedStyles';
import { bottomSheetStyles } from './bottomSheet.styles';

type ThemedColorProps = 'backgroundColor' | 'handleColor' | 'backdropColor';

export type BottomSheetProps = Omit<LayerBottomSheetProps, ThemedColorProps>;

const BottomSheet = ({ contentContainerStyle, ...props }: BottomSheetProps) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(bottomSheetStyles);

  return (
    <LayerBottomSheet
      backgroundColor={colors.card}
      handleColor={colors.grey300}
      backdropColor={colors.black}
      contentContainerStyle={{ ...styles.content, ...contentContainerStyle }}
      {...props}
    />
  );
};

export default BottomSheet;
```

```ts
// src/components/BottomSheet/bottomSheet.styles.ts
import { StyleSheet } from 'react-native';
import { IColors } from '@interfaces/theme';
import { ms, screenPadding } from '@utils';

export const bottomSheetStyles = (_colors: IColors) =>
  StyleSheet.create({
    content: {
      paddingHorizontal: screenPadding(),
      paddingBottom: ms(16),
      gap: ms(8),
    },
  });
```

Behavior to know:
- The sheet **fits its content height** and follows it when content changes. Children with `flex: 1` do not stretch. For long content, use a `ScrollView` / `FlatList` with a `maxHeight` (e.g. `hp(60)`). On tablets, constrain sheet width with `style={{ maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%' }}` so it doesn't span a 1300pt-wide screen.
- Drag down past `dismissThreshold` (120 px) to close. Drag up to full screen only when `enableUpwardDrag` is set.
- Safe-area insets are applied automatically.
- Lifecycle: `onOpen`, `onDrag(direction, fraction)`, `onDragEnd('content' | 'fullscreen' | 'dismissed')`, `onFullScreen`.
- Use `disableBackdropClose` + `draggable={false}` for sheets that must be completed (e.g. a required choice).

### Example: action sheet for a list row

```tsx
// excerpt — ItemListScreen
const [menuItem, setMenuItem] = useState<Item | null>(null);

<BottomSheet visible={menuItem !== null} onClose={() => setMenuItem(null)}>
  <Txt style={styles.sheetTitle} numberOfLines={1}>{menuItem?.title}</Txt>
  <Btn
    title="Edit"
    outlined
    onPress={() => {
      setMenuItem(null);
      navigation.navigate('ItemFormScreen', { itemId: menuItem!.id });
    }}
  />
  <Btn
    title="Delete"
    onPress={() => {
      setDeleteTarget(menuItem);
      setMenuItem(null);
    }}
  />
</BottomSheet>
```

### Example: form inside a sheet

```tsx
// excerpt
const { isOpen, close } = useKeyboard(); // from '@whoisrijan/react-native-layer'

<BottomSheet visible={visible} onClose={onClose} enableUpwardDrag>
  <TextInput style={styles.input} placeholderTextColor={colors.grey300} ... />
  <Btn title="Save" onPress={() => { if (isOpen) close(); onSave(); }} />
</BottomSheet>
```

### iOS stacking rule

iOS cannot show two sibling modals at once. To open a `ConfirmModal` or `AlertBox` **on top of** an open `BottomSheet`, render it **inside the sheet's children**:

```tsx
<BottomSheet visible={sheetVisible} onClose={closeSheet}>
  ...
  <ConfirmModal visible={confirmVisible} ... />
</BottomSheet>
```

Alternatively, close the sheet first and open the dialog in its `onClose` flow (as in the action-sheet example). Toasts are exempt; they always render on top.

---

## Layer (custom overlays)

`Layer` is the low-level slide-up primitive: modal, backdrop, slide animation, back button. Content and layout are yours. Gesture Handler gestures work inside it without an extra `GestureHandlerRootView`.

```tsx
import { Layer } from '@whoisrijan/react-native-layer';

const { colors } = useTheme();

<Layer visible={visible} onClose={onClose} backdropColor={colors.black} backdropOpacity={0.6}>
  <View style={styles.fullPanel /* backgroundColor: colors.background, flex: 1 */}>
    ...
  </View>
</Layer>
```

If a custom layer is reused by 2+ screens, wrap it in `src/components/<Name>/` like the other overlays.

---

## Keyboard utilities

```ts
import { closeKeyboard, isKeyboardOpen, useKeyboard } from '@whoisrijan/react-native-layer';

const { isOpen, close } = useKeyboard(); // in components
if (isKeyboardOpen()) closeKeyboard();   // outside components
```

Prefer these over `Keyboard.dismiss()`. They only dismiss when the keyboard is actually open, which avoids an open-then-close flash. All library overlays already call `closeKeyboard()` when they open.

---

## Context (`src/context/`)

The library covers overlays, so `src/context/` stays for **other** global, imperative app services, for example a session/auth event bus, an analytics wrapper, or a socket connection provider.

| Use Context | Don't use Context |
|---|---|
| Global imperative services with their own lifecycle | Server data (RTK Query) |
| Things many screens trigger, rendered once at the root | Shared app state (slice) |
| | Theme (React Navigation theme) |
| | Toast / modals / sheets (the library) |

Pattern: `src/context/<Name>Context.tsx` exports `<Name>Provider` and `use<Name>()`. Providers that read the theme mount inside `NavigationContainer` in `App.tsx`.
