# 07 — Navigation (native stack only)

## Why native stack

| | `@react-navigation/native-stack` ✅ | `@react-navigation/stack` ❌ |
|---|---|---|
| Rendering | Real platform screens via `react-native-screens`: `UINavigationController` (iOS), Fragments (Android) | Plain `View`s animated by JS / Reanimated |
| Transitions & swipe-back | Run on the native UI thread | Driven from JS. They freeze or stutter when JS is busy (list rendering, API parsing, heavy re-renders). |
| Memory | Off-screen screens are native-detached | All screens stay mounted as views |
| Feel | Platform-default gestures and animations | Approximation |

**Rule:** only `createNativeStackNavigator`. Never add `@react-navigation/stack`. If a library pulls it in as a peer, do not use its navigator.

For tabs, prefer a native tab bar when your React Navigation version provides one (native bottom tabs in newer React Navigation, or `react-native-bottom-tabs` + `@bottom-tabs/react-navigation`). Otherwise use `@react-navigation/bottom-tabs`; its tab bar is JS, but each tab's content still renders inside native screens. Put a native stack inside each tab.

## Param list + global typing

```ts
// src/interfaces/navigation/navigation.ts
export type RootStackParamList = {
  ItemListScreen: undefined;
  ItemDetailScreen: { itemId: string };
  ItemFormScreen: { itemId?: string } | undefined; // no id = create, id = edit
  SettingsScreen: undefined;
};

// Makes useNavigation() / useRoute() / <Link> typed everywhere without generics.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

```ts
// src/interfaces/navigation/index.ts
export type { RootStackParamList } from './navigation';
```

**Params carry ids and primitives only.** Never pass full entity objects:
- The object goes stale when the store or cache updates.
- Params must be serializable (state persistence, deep links).
- Detail screens select live data: `useAppSelector(s => selectItemById(s, itemId))` or `useGetItemByIdQuery(itemId)`.

## Root navigator

```tsx
// src/routes/rootNavigator/index.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@interfaces/navigation';
import ItemDetailScreen from '@screens/ItemDetailScreen';
import ItemFormScreen from '@screens/ItemFormScreen';
import ItemListScreen from '@screens/ItemListScreen';
import SettingsScreen from '@screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => (
  <Stack.Navigator
    initialRouteName="ItemListScreen"
    screenOptions={{
      headerShown: false, // AppLayout draws the header
      animation: 'slide_from_right',
      gestureEnabled: true,
    }}
  >
    <Stack.Screen name="ItemListScreen" component={ItemListScreen} />
    <Stack.Screen name="ItemDetailScreen" component={ItemDetailScreen} />
    <Stack.Screen
      name="ItemFormScreen"
      component={ItemFormScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
  </Stack.Navigator>
);

export default RootNavigator;
```

Useful native-stack options (all native):

| Option | Use |
|---|---|
| `animation` | `'slide_from_right'`, `'slide_from_bottom'`, `'fade'`, `'none'`, `'default'` |
| `presentation` | `'card'` (default), `'modal'`, `'transparentModal'`, `'formSheet'` (bottom sheet-like on iOS and newer Android) |
| `gestureEnabled` | Swipe back (iOS) |
| `fullScreenGestureEnabled` | Swipe from anywhere on iOS |
| `orientation` | Lock per screen |
| `contentStyle` | Screen background (the theme's `background` is applied automatically) |

## Screen props typing

```tsx
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@interfaces/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ItemDetailScreen'>;

const ItemDetailScreen = ({ route, navigation }: Props) => {
  const { itemId } = route.params;
  ...
};
```

Inside nested components, use hooks instead of prop-drilling `navigation`:

```tsx
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation(); // typed via global RootParamList
navigation.navigate('ItemDetailScreen', { itemId });
```

## Common patterns

### Navigate / back / replace

```ts
navigation.navigate('ItemFormScreen');                     // create
navigation.navigate('ItemFormScreen', { itemId });         // edit
navigation.goBack();
navigation.replace('ItemListScreen');                      // swap current screen
navigation.popToTop();
```

### Auth flow (conditional screens, no manual reset)

```tsx
const isLoggedIn = useAppSelector(s => !!s.auth.token);

<Stack.Navigator screenOptions={{ headerShown: false }}>
  {isLoggedIn ? (
    <>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      ...
    </>
  ) : (
    <>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      ...
    </>
  )}
</Stack.Navigator>
```

When the token changes, React Navigation swaps stacks with the correct animation. Don't call `navigation.reset` for login/logout.

### Run code when a screen gains focus

```ts
import { useFocusEffect } from '@react-navigation/native';

useFocusEffect(
  useCallback(() => {
    refetch();
  }, [refetch]),
);
```

### Android hardware back

Native stack handles it. For a custom intercept (unsaved form), use `navigation.addListener('beforeRemove', e => { e.preventDefault(); ... })`.

## Rules

- `headerShown: false` globally. Headers come from `AppLayout`.
- Route names equal screen folder names (`ItemListScreen`).
- Every route is listed in `RootStackParamList`. `undefined` means no params.
- Don't keep navigation state in Redux.
- Heavy work on mount (big lists, parsing) should wait for the transition: `InteractionManager.runAfterInteractions` or render a skeleton first.
