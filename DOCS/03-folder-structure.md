# 03 — Folder Structure

The architecture is **layer-based**: each top-level folder under `src/` holds one kind of code (components, screens, slices, api, …). Do not reorganize into feature folders.

## Root

```text
<AppName>/
├── App.tsx                 Provider tree + ThemedNavigation
├── index.js                AppRegistry entry
├── app.json                { name, displayName }
├── babel.config.js         module-resolver aliases + dotenv
├── metro.config.js         svg transformer
├── tsconfig.json           strict + path aliases (mirror babel)
├── jest.config.js / jest.setup.js
├── .eslintrc.js / .prettierrc.js
├── .env (ignored) / .env.example
├── package.json / yarn.lock    yarn only (no package-lock.json)
├── __tests__/
├── DOCS/                   this knowledge base
├── android/  ios/
└── src/
```

## `src/`

```text
src/
├── api/
│   ├── index.ts                    barrel: re-exports hooks from services
│   ├── manager/
│   │   └── index.ts                axios instance, axiosBaseQuery, baseApi
│   └── services/
│       └── itemsApi.ts             baseApi.injectEndpoints({...}) per resource
│
├── assets/
│   ├── images/                     png/jpg (require()'d)
│   └── svg/
│       ├── chevronLeft.svg
│       └── svg.list.ts             iconMap: { name: ImportedSvg }
│
├── components/                     shared, app-wide UI only
│   ├── Button/
│   │   ├── index.tsx               default export Btn
│   │   └── button.styles.ts
│   ├── AlertBox/                   themed wrapper of react-native-layer Alert
│   │   ├── index.tsx
│   │   └── alertBox.styles.ts
│   ├── BottomSheet/                themed wrapper of react-native-layer BottomSheet
│   │   ├── index.tsx
│   │   └── bottomSheet.styles.ts
│   ├── ConfirmModal/               themed wrapper of react-native-layer ConfirmModal
│   │   ├── index.tsx
│   │   └── confirmModal.styles.ts
│   ├── CustomText/
│   │   └── index.tsx               default export Txt
│   ├── NoData/
│   │   ├── index.tsx
│   │   └── noData.styles.ts
│   ├── SvgIcon/
│   │   ├── index.tsx
│   │   ├── svgIcon.styles.ts
│   │   └── svg.d.ts                declare module '*.svg'
│   ├── headers/
│   │   ├── SubScreenHeader.tsx
│   │   └── header.styles.ts
│   ├── layout/
│   │   ├── index.tsx               default export AppLayout
│   │   └── layout.styles.ts
│   └── spacer/
│       └── SpacerColumn.tsx        named export SpacerColumn
│
├── config/
│   ├── env.config.ts               typed `config` object from @env
│   └── env.d.ts                    declare module '@env'
│
├── constants/
│   ├── apptheme.ts                 LightTheme, DarkTheme (ONLY place with hex colors)
│   ├── endpoints.ts                URL builders per resource
│   ├── fonts.ts                    AppFonts (custom font family names)
│   └── responsive-fonts.ts         responsiveFonts scale
│
├── context/                        other global providers (overlays/toast come from react-native-layer)
│
├── hooks/
│   ├── useAppToast.ts              themed showToast (wraps react-native-layer useToast)
│   ├── useResolvedTheme.ts         themeMode + system scheme -> theme
│   ├── useResponsive.ts            size class, columns, isTablet, isLandscape (live)
│   ├── useThemedStyles.ts          memoized styles factory
│   └── useItems.ts                 domain hooks (compose queries + selectors)
│
├── interfaces/
│   ├── item.interface.ts           domain types
│   ├── navigation/
│   │   ├── index.ts                barrel
│   │   └── navigation.ts           RootStackParamList + global nav typing
│   └── theme/
│       ├── index.ts                barrel
│       ├── theme.interface.ts      ExtendedTheme, IColors
│       └── theme.d.ts              augments useTheme() return type
│
├── routes/
│   └── rootNavigator/
│       └── index.tsx               createNativeStackNavigator
│
├── screens/
│   ├── ItemListScreen/
│   │   ├── index.tsx
│   │   ├── itemList.styles.ts
│   │   └── components/             components used only by this screen
│   │       ├── ItemCard.tsx
│   │       └── itemCard.styles.ts
│   ├── ItemDetailScreen/
│   │   ├── index.tsx
│   │   └── itemDetail.styles.ts
│   └── ItemFormScreen/
│       ├── index.tsx
│       └── itemForm.styles.ts
│
├── slices/
│   ├── appSlice.ts                 app-wide UI prefs (themeMode, …)
│   ├── authSlice.ts                token / session (only if the app has auth)
│   └── itemSlice.ts                client-side domain state
│
├── store/
│   ├── index.ts                    barrel: typed hooks + store + persistor
│   └── store.ts                    configureStore, persist configs
│
└── utils/
    ├── index.ts                    barrel
    ├── responsiveScreen.utils.ts   ms, fs, scale, wp, hp, screenPadding, breakpoints
    └── text/
        ├── index.ts
        └── text-style.utils.ts     textStyling()
```

## What goes where

| Question | Folder |
|---|---|
| Used by 2+ screens? | `components/` |
| Used by one screen only? | `screens/<Screen>/components/` |
| Talks to the network? | `api/services/` |
| URL strings? | `constants/endpoints.ts` |
| Client-only state (filters, drafts, prefs, offline items)? | `slices/` |
| Combines store + API for a screen? | `hooks/` |
| Overlay (dialog, alert, sheet, toast)? | `@whoisrijan/react-native-layer` via `components/` wrappers |
| Other global provider (session events, analytics, sockets)? | `context/` |
| TypeScript types/interfaces? | `interfaces/` |
| Pure helpers (formatters, math, validation)? | `utils/` |
| Colors? | `constants/apptheme.ts`, nowhere else |

## Naming rules

| Item | Rule | Example |
|---|---|---|
| Single-component folder | PascalCase folder + `index.tsx` | `components/Button/index.tsx` |
| Grouping folder (holds several related components) | lowercase | `components/headers/`, `components/layout/`, `components/spacer/` |
| Screen folder | `PascalCase` + `Screen` suffix | `ItemListScreen/` |
| Route name | Same as the screen folder | `'ItemListScreen'` |
| Styles file | `<camelName>.styles.ts`, exports `<camelName>Styles` | `itemCard.styles.ts` → `itemCardStyles` |
| Slice | `<name>Slice.ts`, default export reducer | `itemSlice.ts` |
| RTK Query service | `<resource>Api.ts` | `itemsApi.ts` |
| Hook | `use<Name>.ts` | `useItems.ts` |
| Interface file | `<name>.interface.ts` | `item.interface.ts` |
| Utils file | `<name>.utils.ts` | `responsiveScreen.utils.ts` |
| Component default exports | Short names used app-wide | `Txt`, `Btn`, `AppLayout` |

## Path aliases

| Alias | Path | Has barrel (`import { x } from '@alias'`) |
|---|---|---|
| `@api` | `src/api` | yes |
| `@assets` | `src/assets` | no |
| `@components` | `src/components` | no — `@components/Button` |
| `@config` | `src/config` | no |
| `@constants` | `src/constants` | no |
| `@context` | `src/context` | no |
| `@hooks` | `src/hooks` | no — `@hooks/useItems` |
| `@interfaces` | `src/interfaces` | per subfolder (`@interfaces/theme`) |
| `@routes` | `src/routes` | no |
| `@screens` | `src/screens` | no |
| `@slices` | `src/slices` | no |
| `@store` | `src/store` | yes |
| `@utils` | `src/utils` | yes |

Adding an alias means editing **both** `babel.config.js` and `tsconfig.json`, then `yarn start:clean`.

## Import order (inside a file)

1. `react`, `react-native`
2. Third-party (`@react-navigation/*`, `@reduxjs/*`, …)
3. Aliased app imports (`@components`, `@hooks`, …)
4. Relative imports (`./itemCard.styles`, `./components/ItemCard`)
