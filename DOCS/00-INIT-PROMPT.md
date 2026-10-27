# Project Init Prompt

How to use:
1. Create an empty folder for the new app and copy this `DOCS/` folder into it.
2. Fill in the **Project brief** below (replace every `<...>`).
3. Open Claude Code in that folder and paste everything from `--- PROMPT START ---` to `--- PROMPT END ---`, or say: *"Read DOCS/00-INIT-PROMPT.md and execute the prompt in it."*

---

--- PROMPT START ---

You are initializing a new React Native app in the current directory. It currently contains only the `DOCS/` folder. `DOCS/` is the single source of truth for architecture, conventions, and code. Follow it exactly; don't introduce other patterns or libraries.

## Project brief

| Field | Value |
|---|---|
| App name (PascalCase, used by RN init / `app.json`) | `<AppName>` |
| Display name (home screen label) | `<Display Name>` |
| Android package / iOS bundle id | `<com.company.appname>` |
| API base URL (for `.env` / `.env.example`) | `<https://api.example.com/>` |
| Main domain entity (replaces `Item` in DOCS samples) | `<Entity>` (plural: `<entities>`) |
| Entity fields (domain type) | `<id: string, title: string, ...>` |
| Screens to create (in addition to `SettingsScreen`) | `<EntityListScreen, EntityDetailScreen, EntityFormScreen, ...>` |
| Auth needed? | `<yes / no>` (yes = `authSlice`, token getter, conditional auth stack, `LoginScreen`) |
| Brand primary color (light / dark) | `<#6366F1 / #818CF8>` |
| Phone orientation | `<portrait / all>` (iPad and Android large screens always allow all) |

If a field is left as `<...>`, use the DOCS sample values (`Item`, `items`, list/detail/form screens, no auth) and say so at the end.

## Steps

1. **Read every file in `DOCS/` first**, in the order given in `DOCS/README.md`. Don't write code until you have read all of them.

2. **Create the app with the latest stable React Native, using yarn only** (never `npm` / `npx`):
   - `corepack enable`
   - The current directory is not empty (it has `DOCS/`), so generate into a temporary sibling folder:
     `yarn dlx @react-native-community/cli@latest init <AppName> --version latest --pm yarn --directory ../<AppName>-tmp`
   - Move **everything** from `../<AppName>-tmp` (including dotfiles: `.gitignore`, `.prettierrc.js`, `.eslintrc.js`, `.watchmanconfig`, `.bundle`, `.yarnrc.yml`, `.yarn/`) into the current directory, then delete the temp folder. Do not overwrite or move `DOCS/`.
   - Confirm `yarn.lock` exists and there is no `package-lock.json`.
   - Report the React Native version that was installed.

3. **Set identifiers:** Android `namespace` + `applicationId` + Kotlin package folder/`package` lines → `<com.company.appname>`; iOS bundle identifier; display name in `app.json`, `strings.xml`, and `Info.plist`.

4. **Install dependencies** exactly as in `DOCS/02-project-setup.md` §2 (includes `@whoisrijan/react-native-layer`, `react-native-reanimated`, `react-native-worklets`), then `cd ios && bundle install && bundle exec pod install`.

5. **Native changes** from `DOCS/02-project-setup.md` §3: the `MainActivity.onCreate(null)` fix, no forced `UIUserInterfaceStyle`, iPad all orientations, no Android `screenOrientation` lock, phone orientation per the brief.

6. **Config files** from `DOCS/02-project-setup.md` §4, verbatim: `babel.config.js` (worklets plugin last), `tsconfig.json`, `metro.config.js`, `.prettierrc.js`, `.eslintrc.js`, `jest.config.js`, `jest.setup.js`, `package.json` scripts, `.env` + `.env.example` (add `.env` to `.gitignore`).

7. **Create `src/`** in the order of `DOCS/02-project-setup.md` §6, using the file contents from docs 04–11:
   - Theme (04), with the brand colors from the brief
   - Responsive system + styling utilities (05)
   - Store, `appSlice`, (`authSlice` if auth), typed hooks, `useResolvedTheme`, `useThemedStyles`, `useResponsive` (04, 05, 08)
   - Core components (06) and overlay wrappers `ConfirmModal`, `AlertBox`, `BottomSheet`, `useAppToast` (10)
   - Env config, endpoints, `api/manager`, the entity service, `api/index.ts` (09)
   - Navigation param list + global typing, `rootNavigator` with native stack only (07)
   - Screens from the brief plus `SettingsScreen` (04, 11), each with its own `*.styles.ts`, and domain hooks `use<Entities>` / `use<Entity>Actions` (11)
   - `App.tsx` and `index.js` (02 §5)
   - An `assets/svg/chevronLeft.svg` using `currentColor`, registered in `svg.list.ts`
   - Rename `Item`/`items` everywhere to the brief's entity names. Where DOCS gives a pattern but not a full file (some `*.styles.ts`), write it following that pattern.

8. **Hard rules** (from `DOCS/README.md` and `DOCS/12-conventions-and-checklists.md`). Check every file against them:
   - Navigation is `@react-navigation/native-stack` only. `@react-navigation/stack` must not be installed.
   - Every screen returns `<AppLayout header|title body footer />`, never with children.
   - All text through `Txt`. No hex/rgb colors outside `src/constants/apptheme.ts`.
   - Styles only via `useThemedStyles(factory, ...args)`. Fonts via `responsiveFonts`/`fs`, spacing via `ms`/`screenPadding`.
   - Overlays only via the react-native-layer wrappers. No RN `Modal`, `Alert.alert`, or custom toast.
   - Path aliases for all cross-folder imports. Server data in RTK Query only. Navigation params are ids only.

9. **Tests:** keep the App smoke test; add the slice test pattern from doc 12 for each slice and a mapper test for the entity service.

10. **Verify, and fix until all pass:**
    - `yarn typecheck`
    - `yarn lint`
    - `yarn test`
    - The doc-12 "before every commit" greps (hex colors, raw `Text`, JS stack)
    - `yarn ios` and `yarn android` build and launch (if a simulator/emulator is available)

11. **Finish with a short report:**
    - React Native version installed
    - Files created, grouped by folder
    - Any place where DOCS conflicted with the installed library APIs and how you resolved it (check especially: `Appearance.setColorScheme('unspecified')`, react-native-layer `Alert` style props, the Reanimated jest setup, the async-storage jest mock path)
    - Checks that passed or failed, with the failing output
    - Brief fields that fell back to defaults

Don't commit, and don't create a git remote unless asked.

--- PROMPT END ---

---

## Follow-up prompts (after init)

- **New screen:** *"Add `<Name>Screen` following DOCS/11 and the 'new screen' checklist in DOCS/12. Params: `<...>`. It shows `<...>`."*
- **New API resource:** *"Add the `<resource>` API following DOCS/09 and the 'new API resource' checklist. Endpoints: `<GET /x, POST /x, ...>`. DTO: `<...>`."*
- **New shared component:** *"Create `<Name>` in components/ following DOCS/06 and the 'new shared component' checklist."*
- **New theme color:** *"Add theme token `<name>` (light `<hex>`, dark `<hex>`) following DOCS/04."*
- **Audit:** *"Audit the project against DOCS/12 anti-patterns and checklists; list violations as file:line, then fix them."*
