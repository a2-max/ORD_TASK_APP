# 02 — Project Setup (from zero)

Follow these steps in order. Each step lists the exact file contents.

## 1. Create the app

Always start from the **latest stable React Native**. Yarn is the only package manager; never run `npm` or commit a `package-lock.json`.

```bash
corepack enable                      # ships with Node; provides yarn
yarn dlx @react-native-community/cli@latest init <AppName> --version latest --pm yarn
cd <AppName>
yarn react-native --version          # confirm the RN version installed
```

- `--version latest` pins the newest stable RN release and the matching React version.
- `--pm yarn` makes the template install with yarn and generate `yarn.lock`.
- If a `package-lock.json` appears, delete it and run `yarn install`.
- The template's `.yarnrc.yml` sets `nodeLinker: node-modules`. Keep it: React Native does not support Plug'n'Play.

Set the Android package / iOS bundle id to `<bundle.id>` (Android: `namespace` + `applicationId` in `android/app/build.gradle` and the Kotlin package folder; iOS: Xcode → target → Signing & Capabilities).

## 2. Install dependencies

```bash
yarn add @react-navigation/native @react-navigation/native-stack \
  react-native-screens react-native-safe-area-context react-native-gesture-handler \
  @reduxjs/toolkit react-redux redux-persist @react-native-async-storage/async-storage \
  axios react-native-svg \
  @whoisrijan/react-native-layer react-native-reanimated react-native-worklets

yarn add -D babel-plugin-module-resolver react-native-dotenv react-native-svg-transformer

cd ios && bundle install && bundle exec pod install && cd ..
```

## 3. Native changes

### Android — required for `react-native-screens`

`android/app/src/main/java/<bundle/id/path>/MainActivity.kt`:

```kotlin
package <bundle.id>

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  // react-native-screens: passing null prevents a crash when Android restores
  // the activity after process death (fragments cannot be restored).
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }

  override fun getMainComponentName(): String = "<AppName>"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
```

The `package` line must match the folder path and `namespace` in `build.gradle`. A mismatch builds fine but crashes on launch.

### iOS — dark mode

In `ios/<AppName>/Info.plist`, do **not** set `UIUserInterfaceStyle` to `Light`. That would lock the app in light mode and break theme switching (see [04-theme.md](04-theme.md)).

### iOS / Android — tablets & orientation

- iPad: `UISupportedInterfaceOrientations~ipad` must list all four orientations so split view / Slide Over work. In Xcode → General, keep "iPad" under Supported Destinations.
- Phones: portrait in `UISupportedInterfaceOrientations` unless the app is designed for landscape.
- Android: don't set `android:screenOrientation` on `MainActivity`, so large screens and foldables can rotate and resize freely.
- Details: [05-styling-and-responsive.md](05-styling-and-responsive.md#orientation--multitasking-setup).

## 4. Config files

### `babel.config.js`

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@components': './src/components',
          '@screens': './src/screens',
          '@utils': './src/utils',
          '@constants': './src/constants',
          '@store': './src/store',
          '@slices': './src/slices',
          '@assets': './src/assets',
          '@api': './src/api',
          '@hooks': './src/hooks',
          '@config': './src/config',
          '@interfaces': './src/interfaces',
          '@context': './src/context',
          '@routes': './src/routes',
        },
      },
    ],
    ['module:react-native-dotenv'],
    // Must stay the LAST plugin (Reanimated 4 / react-native-layer).
    'react-native-worklets/plugin',
  ],
};
```

### `tsconfig.json`

Keep the aliases in sync with `babel.config.js`. Folders that have an `index.ts` barrel get both a bare alias and a `/*` alias.

```json
{
  "extends": "@react-native/typescript-config",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@utils": ["src/utils/index.ts"],
      "@utils/*": ["src/utils/*"],
      "@constants/*": ["src/constants/*"],
      "@store": ["src/store/index.ts"],
      "@store/*": ["src/store/*"],
      "@slices/*": ["src/slices/*"],
      "@assets/*": ["src/assets/*"],
      "@api": ["src/api/index.ts"],
      "@api/*": ["src/api/*"],
      "@hooks/*": ["src/hooks/*"],
      "@config/*": ["src/config/*"],
      "@interfaces/*": ["src/interfaces/*"],
      "@context/*": ["src/context/*"],
      "@routes/*": ["src/routes/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["**/node_modules", "**/Pods"]
}
```

### `metro.config.js` (SVG as components)

```js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
```

### `.prettierrc.js`

```js
module.exports = {
  arrowParens: 'avoid',
  singleQuote: true,
  trailingComma: 'all',
};
```

### `.eslintrc.js`

```js
module.exports = {
  root: true,
  extends: '@react-native',
};
```

Run ESLint through `yarn lint` so the project's local ESLint version is used. A globally installed ESLint 9+ ignores `.eslintrc.js`.

### `jest.config.js`

```js
module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|@whoisrijan|react-redux|redux-persist|react-native-.*)/)',
  ],
};
```

### `jest.setup.js`

```js
// Check the mock path in the installed async-storage README if this fails.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Reanimated 4 test helpers (check the Reanimated testing docs for your version).
require('react-native-reanimated').setUpTests();
require('react-native-gesture-handler/jestSetup');
```

### `package.json` scripts

```json
"scripts": {
  "android": "react-native run-android",
  "ios": "react-native run-ios",
  "start": "react-native start",
  "start:clean": "react-native start --reset-cache",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "jest"
}
```

### `.env` / `.env.example`

```env
API_BASE_URL=https://api.example.com/
```

Commit `.env.example`; keep `.env` in `.gitignore`. `react-native-dotenv` inlines values at bundle time, so after editing `.env` run `yarn start:clean`.

## 5. Entry files

### `index.js`

```js
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

### `App.tsx`

Provider order matters:

1. Gesture root outermost.
2. Redux, then `PersistGate`, so the theme mode is rehydrated before first paint.
3. `ThemedNavigation` resolves light/dark and renders `NavigationContainer`.
4. Safe area.
5. `ToastProvider` from `@whoisrijan/react-native-layer`. It needs `SafeAreaProvider` above it. It sits inside `NavigationContainer` so screens calling `useAppToast()` (which reads the theme) are always below both.

```tsx
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastProvider } from '@whoisrijan/react-native-layer';
import { useResolvedTheme } from '@hooks/useResolvedTheme';
import RootNavigator from '@routes/rootNavigator';
import { persistor, store } from '@store';

const ThemedNavigation = () => {
  const theme = useResolvedTheme();

  return (
    <NavigationContainer theme={theme}>
      <SafeAreaProvider>
        <ToastProvider>
          <RootNavigator />
        </ToastProvider>
      </SafeAreaProvider>
    </NavigationContainer>
  );
};

const BootLoader = () => (
  <View style={styles.boot}>
    <ActivityIndicator />
  </View>
);

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <PersistGate loading={<BootLoader />} persistor={persistor}>
          <ThemedNavigation />
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default App;
```

Do not render a `StatusBar` in `App.tsx`. `AppLayout` owns it (see [06-core-components.md](06-core-components.md)).

## 6. Create `src/`

Create the tree from [03-folder-structure.md](03-folder-structure.md), then the files from docs 04–10 in this order:

1. `interfaces/theme/*`, `constants/apptheme.ts`
2. `utils/*`, `constants/responsive-fonts.ts`
3. `slices/appSlice.ts`, `store/*`, `hooks/useResolvedTheme.ts`, `hooks/useThemedStyles.ts`
4. `components/*`
5. Overlay wrappers: `components/ConfirmModal`, `components/AlertBox`, `components/BottomSheet`, `hooks/useAppToast.ts` (see [10-overlays-and-context.md](10-overlays-and-context.md))
6. `config/*`, `constants/endpoints.ts`, `api/*`
7. `interfaces/navigation/*`, `routes/rootNavigator`, `screens/*`

## 7. Verify

```bash
yarn typecheck && yarn lint && yarn test
yarn ios
yarn android
```

Then toggle the OS appearance (light/dark) while the app is open. Every screen must switch colors, including the status bar icons.
