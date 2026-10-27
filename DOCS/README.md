# React Native App Architecture — Knowledge Base

This folder is a reusable blueprint for bootstrapping React Native (CLI, TypeScript) apps with one fixed architecture. It is written so an AI assistant (Claude) or a developer can set up a new project from zero and produce the same structure, conventions, and core components every time.

Everything here is project-agnostic. Replace placeholders:

| Placeholder | Meaning | Example |
|---|---|---|
| `<AppName>` | PascalCase app name used by `react-native init` and `app.json` | `ShopApp` |
| `<bundle.id>` | Android package / iOS bundle identifier | `com.company.shopapp` |
| `Item` / `items` | Example domain entity used in code samples | `Product`, `Order` |

## Start here

To create a new project, fill in and run [00-INIT-PROMPT.md](00-INIT-PROMPT.md).

## Read order

| # | File | What it covers |
|---|---|---|
| 1 | [01-tech-stack.md](01-tech-stack.md) | Libraries, why each one exists, versions policy |
| 2 | [02-project-setup.md](02-project-setup.md) | Step-by-step bootstrap, every config file, native changes |
| 3 | [03-folder-structure.md](03-folder-structure.md) | Full `src/` tree, naming rules, path aliases |
| 4 | [04-theme.md](04-theme.md) | Centralized light/dark theme, theme mode switching |
| 5 | [05-styling-and-responsive.md](05-styling-and-responsive.md) | `*.styles.ts` factories, responsive system (phone/tablet/foldable breakpoints, `ms`, `fs`, `useResponsive`), `responsiveFonts`, `textStyling` |
| 6 | [06-core-components.md](06-core-components.md) | `Txt`, `AppLayout`, `SubScreenHeader`, `Btn`, `SpacerColumn`, `NoData`, `SvgIcon` |
| 7 | [07-navigation.md](07-navigation.md) | Native stack navigation (never JS stack), typing, patterns |
| 8 | [08-state-management.md](08-state-management.md) | Redux Toolkit store, slices, redux-persist, typed hooks |
| 9 | [09-api-layer.md](09-api-layer.md) | Axios manager, RTK Query base API, services, endpoints, env |
| 10 | [10-overlays-and-context.md](10-overlays-and-context.md) | `@whoisrijan/react-native-layer`: themed `ConfirmModal`, `AlertBox`, `BottomSheet`, `useAppToast`, `Layer`, keyboard utils; when to use Context |
| 11 | [11-screens-and-hooks.md](11-screens-and-hooks.md) | Screen templates (list, detail, form), custom hooks |
| 12 | [12-conventions-and-checklists.md](12-conventions-and-checklists.md) | Code rules, anti-patterns, testing, checklists |

## Golden rules (non-negotiable)

1. **React Native CLI, latest stable version, + TypeScript `strict: true`.** No Expo-managed workflow. **Yarn only**: never `npm` or `npx`, and commit `yarn.lock`.
2. **Navigation uses `@react-navigation/native-stack` only.** It renders real native screens (`UINavigationController` on iOS, Fragments on Android) via `react-native-screens`. Never install `@react-navigation/stack`: it animates in JS and stutters when the JS thread is busy.
3. **One theme source.** Every color comes from `src/constants/apptheme.ts` through `useTheme()`. No hex literals anywhere else. Light and dark themes define every color key.
4. **Every screen returns `<AppLayout header={...} body={...} footer={...} />`.** Header and body are passed as props, never as children. `AppLayout` owns safe-area insets, the `StatusBar`, background, the default header, scroll/refresh, keyboard avoidance, and the tablet max-width column.
5. **Every piece of text uses `Txt`**, never `Text` from `react-native`.
6. **Styles live in a sibling `<name>.styles.ts`** that exports a factory `(colors) => StyleSheet.create({...})`. Components consume it through `useThemedStyles(factory)` or `useMemo`, never by calling it bare in render.
7. **Server state in RTK Query, client state in slices.** Persist only whitelisted slice keys. Never persist the RTK Query cache.
8. **Imports use path aliases** (`@components/...`, `@utils`, `@store`), never long `../../..` chains.
9. **Responsive for phones, tablets, foldables, and landscape.** Fonts come from `responsiveFonts` / `fs()`, spacing and radii from `ms()`, screen padding from `screenPadding()`, and layout changes from `useResponsive()` breakpoints (compact < 600, medium 600–839, expanded >= 840). Never scale fonts by width percentage, and never cache `Dimensions` at module load.
10. **Navigate with ids, not objects.** Screens read the latest entity from the store or the query cache.
11. **All overlays come from `@whoisrijan/react-native-layer`** through themed wrappers (`ConfirmModal`, `AlertBox`, `BottomSheet`, `useAppToast`). Never use RN `Modal`, `Alert.alert`, or a custom toast.

## How Claude should use this folder

- When asked to "set up a new project with this architecture", follow [02-project-setup.md](02-project-setup.md) top to bottom, then create files exactly as shown in docs 04–10.
- When adding a feature to an existing project, follow the checklists in [12-conventions-and-checklists.md](12-conventions-and-checklists.md).
- Code blocks in these docs are complete files unless marked `// excerpt`. Copy them as-is, then rename the example entity.
- If an instruction here conflicts with a library's current API, keep the architecture and adapt the call to the installed version's docs.
