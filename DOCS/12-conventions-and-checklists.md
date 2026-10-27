# 12 — Conventions, Anti-patterns & Checklists

## Code conventions

| Topic | Rule |
|---|---|
| Language | TypeScript `strict`. No `any`; use `unknown` and narrow. |
| Components | Function components with arrow functions. Props interface named `<Component>Props`. |
| Exports | Components, screens, reducers: `default`. Hooks, utils, actions, selectors, types: named. `SpacerColumn` is named (historical). |
| Formatting | Prettier: single quotes, trailing commas, `arrowParens: 'avoid'`. |
| Linting | `@react-native` ESLint config. `yarn lint` must pass. |
| Conditionals in JSX | `{!!value && <X />}` for strings/numbers (avoids rendering `0` or `''`). |
| Handlers | `handle<Event>` inside components, `on<Event>` for props. |
| Booleans | `is`/`has`/`show` prefixes: `isLoading`, `showHeader`. |
| Constants | `UPPER_SNAKE` at module level: `const FILTERS = [...]`. |
| Comments | Explain *why*, not *what*. Mark section blocks in long JSX with `{/* Section */}`. |
| Logging | `console.*` only behind `__DEV__`. |
| Text | Every string on screen goes through `Txt`. User-facing copy is sentence case. |

## Anti-patterns (reject these)

| ❌ Don't | ✅ Do |
|---|---|
| `import { createStackNavigator } from '@react-navigation/stack'` | `createNativeStackNavigator` |
| `<Text>` from react-native | `<Txt>` |
| `color: '#333'` in a component or styles file | `colors.text` (add a theme key if missing) |
| `colors.black + '80'` | `colors.overlay` theme token |
| `const styles = xStyles(colors)` in render | `useThemedStyles(xStyles)` / `useMemo` |
| `<SafeAreaView>` in a screen | `AppLayout` handles insets |
| `<StatusBar>` in a screen or `App.tsx` | `AppLayout` (`statusBarStyle` prop to override) |
| `useColorScheme()` in a component | `useTheme().dark` |
| `navigation.navigate('Detail', { item })` | `navigation.navigate('Detail', { itemId })` |
| `axios.get(...)` in a screen | RTK Query service hook |
| Copying query `data` into a slice | Read from the cache / `selectFromResult` |
| `const { data = [] } = useQuery()` feeding `useMemo` | `const items = data ?? EMPTY` (module constant) |
| Hook that subscribes to a whole query inside a list row | Pass data/callbacks as props |
| `ScrollView` + `.map()` for long lists | `FlatList` |
| Two shapes for the same entity (API vs local) | One domain type, DTO mapped in the service |
| `Date.now()` / `Math.random()` in reducers | `prepare` callback / `nanoid` |
| `fontSize: 14` or `fontSize: wp(3.5)` | `responsiveFonts.fontxiv` (or `fs(14)`) |
| `padding: wp(4)` for screen edges | `screenPadding()` |
| `Dimensions.get('window')` at module scope / cached sizes | Size helpers (they read the live window) + `useResponsive()` |
| `if (Platform.isPad)` / device-model checks for layout | `useResponsive()` size class (handles split view and foldables) |
| Styles built in `useMemo([colors])` without window size | `useThemedStyles(factory, ...args)` |
| `<AppLayout>...children...</AppLayout>` | `<AppLayout header={header} body={body} footer={footer} />` |
| Header row as the first element of `body` | `header` prop |
| Save button at the bottom of a scroll body | `footer` prop |
| `'../../../components/Button'` | `'@components/Button'` |
| Hex default props (`color = '#6366F1'`) | Theme-derived defaults or variant props (`destructive`) |
| RN `Modal`, `Alert.alert`, hand-rolled toast | `ConfirmModal` / `AlertBox` / `BottomSheet` wrappers, `useAppToast()` |
| Importing `ConfirmModal`/`Alert`/`BottomSheet`/`useToast` from `@whoisrijan/react-native-layer` in screens | Import the themed wrappers from `@components/*` and `@hooks/useAppToast` |
| Two sibling overlays on iOS (dialog next to an open sheet) | Render the dialog inside the sheet's children |

## Testing

| Layer | What to test | Tool |
|---|---|---|
| Slices | Reducers and selectors with plain objects | Jest |
| Utils | Pure functions | Jest |
| Services | DTO-to-domain mappers (`toItem`) | Jest |
| Hooks | `useItems` filtering with a test store | `@testing-library/react-native` `renderHook` |
| Components | `Txt`, `Btn` (disabled/loading), `ItemCard` callbacks | `@testing-library/react-native` |
| App smoke | `App` renders | `react-test-renderer` |

Test files live in `__tests__/` mirroring `src/` (`__tests__/slices/itemSlice.test.ts`). Wrap rendered components in a test provider that supplies the store, `NavigationContainer` with `LightTheme`, and `SafeAreaProvider` with `initialMetrics`.

```ts
// __tests__/slices/itemSlice.test.ts
import reducer, { setFilter, toggleFavorite } from '@slices/itemSlice';

describe('itemSlice', () => {
  const initial = reducer(undefined, { type: '@@INIT' });

  it('sets filter', () => {
    expect(reducer(initial, setFilter('completed')).activeFilter).toBe('completed');
  });

  it('toggles favorites', () => {
    const once = reducer(initial, toggleFavorite('1'));
    expect(once.favoriteIds).toEqual(['1']);
    expect(reducer(once, toggleFavorite('1')).favoriteIds).toEqual([]);
  });
});
```

---

## Checklist — new project

- [ ] `corepack enable`, then `yarn dlx @react-native-community/cli@latest init <AppName> --version latest --pm yarn`; set `<bundle.id>`
- [ ] Install deps from [01-tech-stack.md](01-tech-stack.md); `pod install`
- [ ] Android `MainActivity.onCreate(null)` fix; package line matches folder
- [ ] iOS `Info.plist` has no forced `UIUserInterfaceStyle`
- [ ] `babel.config.js`, `tsconfig.json`, `metro.config.js`, `.prettierrc.js`, `.eslintrc.js`, `jest.config.js`, `jest.setup.js`
- [ ] `.env` + `.env.example`; `.env` in `.gitignore`
- [ ] `package.json` scripts incl. `typecheck`, `start:clean`
- [ ] `src/` tree per [03-folder-structure.md](03-folder-structure.md)
- [ ] Theme: `interfaces/theme/*`, `constants/apptheme.ts`, `slices/appSlice.ts`, `hooks/useResolvedTheme.ts`, `hooks/useThemedStyles.ts`
- [ ] Responsive: `responsiveScreen.utils.ts`, `hooks/useResponsive.ts`, `constants/responsive-fonts.ts` (getters); `text-style.utils.ts`, `constants/fonts.ts`
- [ ] iPad: all orientations in `UISupportedInterfaceOrientations~ipad`; Android: no `screenOrientation` lock
- [ ] Store: `store/store.ts`, `store/index.ts`
- [ ] Components: `Txt`, `AppLayout`, `SubScreenHeader`, `Btn`, `SpacerColumn`, `NoData`, `SvgIcon` (+ `svg.d.ts`, `svg.list.ts`, `chevronLeft.svg`)
- [ ] `@whoisrijan/react-native-layer` + Reanimated + Worklets installed; `react-native-worklets/plugin` last in Babel; `ToastProvider` in `App.tsx`
- [ ] Overlay wrappers: `ConfirmModal`, `AlertBox`, `BottomSheet`, `hooks/useAppToast.ts`
- [ ] API: `config/env.*`, `constants/endpoints.ts`, `api/manager`, first service, `api/index.ts`
- [ ] Navigation: `interfaces/navigation/*`, `routes/rootNavigator`
- [ ] `App.tsx` provider order per [02-project-setup.md](02-project-setup.md)
- [ ] `yarn typecheck && yarn lint && yarn test` pass
- [ ] Runs on iOS + Android; OS dark/light toggle updates every screen and the status bar
- [ ] Rotating / resizing (iPad split view, foldable, resizable emulator) updates layout without restart

## Checklist — new screen

- [ ] Route added to `RootStackParamList` (ids/primitives only)
- [ ] `screens/<Name>Screen/index.tsx` + `<name>.styles.ts`
- [ ] Registered in `routes/rootNavigator`
- [ ] Returns `AppLayout` with `body` prop (+ `title` for the default header, or a custom `header` element, + `footer` for primary actions); no children
- [ ] Responsive: checked on a small phone, large phone, landscape, tablet portrait/landscape, and iPad split view; grids use `useResponsive().columns`
- [ ] All text via `Txt`, all colors via theme, fonts via `responsiveFonts`, spacing via `ms()` / `screenPadding()`
- [ ] Styles via `useThemedStyles(factory, ...args)` only
- [ ] Loading, error + retry, empty, and data states
- [ ] Screen-only subcomponents in `screens/<Name>Screen/components/`
- [ ] Checked in both light and dark mode

## Checklist — new API resource

- [ ] URL builders in `constants/endpoints.ts`
- [ ] DTO + domain types in `interfaces/<resource>.interface.ts`
- [ ] Tag added to `tagTypes` in `api/manager`
- [ ] `api/services/<resource>Api.ts` via `baseApi.injectEndpoints`, with mapper, `providesTags`/`invalidatesTags`
- [ ] Hooks re-exported from `api/index.ts`
- [ ] Mapper unit test

## Checklist — new shared component

- [ ] Used (or about to be used) by 2+ screens; otherwise keep it screen-local
- [ ] `components/<Name>/index.tsx` + `<name>.styles.ts`
- [ ] Props interface, sensible defaults, no hex defaults
- [ ] `accessibilityRole` / `accessibilityLabel` on touchables
- [ ] `React.memo` if rendered in lists

## Checklist — new color / theme token

- [ ] Key added to `ExtendedTheme['colors']`
- [ ] Value in both `lightColors` and `darkColors`
- [ ] Contrast checked in both modes (text ≥ 4.5:1 against its background)

## Checklist — before every commit

- [ ] `yarn typecheck`
- [ ] `yarn lint`
- [ ] `yarn test`
- [ ] No hex outside `apptheme.ts`: `grep -rnE "#[0-9A-Fa-f]{3,8}\b" src --include=*.ts --include=*.tsx | grep -v apptheme.ts`
- [ ] No raw `Text` import: `grep -rn "Text," src | grep "from 'react-native'"`, then confirm only `CustomText` imports it
- [ ] No JS stack navigator: `grep -rn "@react-navigation/stack" src package.json` returns nothing
