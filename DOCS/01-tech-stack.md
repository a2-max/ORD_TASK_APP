# 01 — Tech Stack

## Runtime dependencies

| Package | Purpose | Notes |
|---|---|---|
| `react-native` | Framework (CLI template, New Architecture on) | **Always the latest stable release** (`init --version latest`) |
| `react` | UI library | Exactly the version the RN template pins. Never upgrade it on its own. |
| `@react-navigation/native` | Navigation core, `NavigationContainer`, `useTheme` | v7 |
| `@react-navigation/native-stack` | **Native** stack navigator | The only stack navigator allowed |
| `react-native-screens` | Native screen containers used by native-stack | Requires the Android `onCreate(null)` fix (see setup) |
| `react-native-safe-area-context` | `SafeAreaProvider`, `useSafeAreaInsets` | `AppLayout` pads by insets |
| `react-native-gesture-handler` | `GestureHandlerRootView` at the app root | Needed by swipeables, bottom sheets, etc. |
| `@reduxjs/toolkit` | Store, slices, RTK Query | v2 |
| `react-redux` | React bindings | v9 |
| `redux-persist` | Persist selected slice keys | Paired with AsyncStorage |
| `@react-native-async-storage/async-storage` | Storage engine for redux-persist | |
| `axios` | HTTP client behind the RTK Query base query | One instance in `src/api/manager` |
| `react-native-svg` | SVG rendering | Icons go through `SvgIcon`; also a peer of react-native-layer |
| `@whoisrijan/react-native-layer` | Overlays: BottomSheet, ConfirmModal, Alert, Toast, Layer, keyboard utils | Used through themed wrappers; see [10-overlays-and-context.md](10-overlays-and-context.md) |
| `react-native-reanimated` (>= 4) | UI-thread animations (peer of react-native-layer) | Needs New Architecture |
| `react-native-worklets` (>= 0.5) | Worklet runtime for Reanimated 4 | Babel plugin `react-native-worklets/plugin` must be last |

## Dev dependencies

| Package | Purpose |
|---|---|
| `typescript`, `@react-native/typescript-config` | Strict TS |
| `babel-plugin-module-resolver` | Runtime path aliases (`@components`, …) |
| `react-native-dotenv` | `.env` values via `import { X } from '@env'` |
| `react-native-svg-transformer` | Import `.svg` files as React components |
| `@react-native/eslint-config`, `eslint`, `prettier` | Linting and formatting |
| `jest`, `@react-native/jest-preset`, `react-test-renderer` | Tests (add `@testing-library/react-native` for component tests) |

## Explicitly NOT used

| Do not add | Why | Use instead |
|---|---|---|
| `@react-navigation/stack` | JS-driven transitions and gestures. They drop frames or freeze when the JS thread is busy. | `@react-navigation/native-stack` |
| Styled-components, NativeWind, UI kits | Bypass the centralized theme and styles factory pattern | `*.styles.ts` + theme |
| Raw `fetch` in components | No caching, no shared error handling | RTK Query services |
| `Context` for server data | Re-render storms, no cache | RTK Query |
| RN `Modal`, `Alert.alert`, custom toast, other bottom-sheet libs (`@gorhom/bottom-sheet`, …) | Duplicate overlay systems, inconsistent theming and animation | `@whoisrijan/react-native-layer` via wrappers |
| Persisting the RTK Query reducer | Stale data, big storage, version issues | Let RTK Query refetch |

## Package manager: yarn

| Do | Don't |
|---|---|
| `yarn add <pkg>` / `yarn add -D <pkg>` | `npm install`, `npm i` |
| `yarn remove <pkg>` | `npm uninstall` |
| `yarn <script>` (e.g. `yarn ios`, `yarn lint`) | `npm run <script>` |
| `yarn dlx <tool>` for one-off CLIs | `npx <tool>` |
| Commit `yarn.lock` | Commit `package-lock.json` |

Enable yarn once per machine with `corepack enable`. Pin the version per project: `corepack use yarn@stable` writes `packageManager` into `package.json`.

## Versions policy

- **React Native: always the latest stable release** at project creation (`--version latest`), with the React version it pins.
- Install other libraries at the latest version compatible with that RN version (`yarn add <pkg>` with no version). Check each library's README compatibility table, especially `react-native-screens`, `react-native-gesture-handler`, `react-native-safe-area-context`, and `react-native-svg`.
- Upgrade an existing app with the [React Native Upgrade Helper](https://react-native-community.github.io/upgrade-helper/) diff. Don't just bump the version in `package.json`.
- Node `>= 22`. iOS uses Xcode + CocoaPods; Android uses Android Studio with JDK 17+.
- After adding any native library: `cd ios && bundle exec pod install`, then rebuild both platforms. Metro reload alone is not enough.
