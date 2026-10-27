# 08 — State Management (Redux Toolkit + redux-persist)

## Which state goes where

| Kind of state | Where | Example |
|---|---|---|
| Server data (fetched, cached, refetched) | RTK Query (`src/api/services`) | item list, item detail, profile |
| Client state shared across screens | Slice (`src/slices`) | active filter, favorites, theme mode, auth token, offline drafts |
| State used by one screen only | `useState` in the screen | modal visibility, input focus, form fields |
| Global UI services | Context (`src/context`) | toast |

Never copy RTK Query data into a slice. Derive from the cache with hooks and selectors.

## Store — `src/store/store.ts`

```ts
import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import { baseApi, registerAuthTokenGetter } from '@api/manager';
import appReducer from '@slices/appSlice';
import authReducer from '@slices/authSlice';
import itemReducer from '@slices/itemSlice';

// One persist config per slice. Whitelist the exact keys to keep.
// Bump `version` and add `migrate` when a persisted shape changes.
const appPersistConfig = {
  key: 'app',
  storage: AsyncStorage,
  version: 1,
  whitelist: ['themeMode'],
};

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  version: 1,
  whitelist: ['token'],
};

const itemPersistConfig = {
  key: 'items',
  storage: AsyncStorage,
  version: 1,
  whitelist: ['favoriteIds'],
};

export const store = configureStore({
  reducer: {
    app: persistReducer(appPersistConfig, appReducer),
    auth: persistReducer(authPersistConfig, authReducer),
    items: persistReducer(itemPersistConfig, itemReducer),
    [baseApi.reducerPath]: baseApi.reducer, // never persisted
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);

// Lets the axios interceptor read the token without importing the store
// (avoids a store <-> api circular import).
registerAuthTokenGetter(() => store.getState().auth.token);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

Leave out `authSlice` if the app has no auth.

## Typed hooks + barrel — `src/store/index.ts`

```ts
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export { store, persistor } from './store';
export type { RootState, AppDispatch } from './store';
```

Components always use `useAppDispatch` / `useAppSelector`, never the untyped `useDispatch` / `useSelector`.

## Slice template — `src/slices/itemSlice.ts`

```ts
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@store';
import { ItemFilter } from '@interfaces/item.interface';

interface ItemState {
  activeFilter: ItemFilter;
  favoriteIds: string[];
}

const initialState: ItemState = {
  activeFilter: 'all',
  favoriteIds: [],
};

const itemSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<ItemFilter>) => {
      state.activeFilter = action.payload;
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.favoriteIds = state.favoriteIds.includes(id)
        ? state.favoriteIds.filter(f => f !== id)
        : [...state.favoriteIds, id];
    },
  },
});

export const { setFilter, toggleFavorite } = itemSlice.actions;

// Selectors live next to the slice.
export const selectActiveFilter = (s: RootState) => s.items.activeFilter;
export const selectFavoriteIds = (s: RootState) => s.items.favoriteIds;
export const selectIsFavorite = (s: RootState, id: string) =>
  s.items.favoriteIds.includes(id);
export const selectFavoriteCount = createSelector(
  selectFavoriteIds,
  ids => ids.length,
);

export default itemSlice.reducer;
```

## Slice with locally created entities

When the app creates records on the device (offline drafts, local-only items), generate ids in `prepare` so the reducer stays pure:

```ts
// excerpt
import { nanoid } from '@reduxjs/toolkit';

addLocalItem: {
  reducer: (state, action: PayloadAction<Item>) => {
    state.localItems.unshift(action.payload);
  },
  prepare: (payload: Pick<Item, 'title' | 'status'>) => ({
    payload: {
      ...payload,
      id: `local-${nanoid()}`,
      createdAt: new Date().toISOString(),
    },
  }),
},
```

Local and server records share the **same** domain type (`Item`). Server DTOs are mapped to it in the API service (see [09-api-layer.md](09-api-layer.md)). If the UI must know the origin, add a `source: 'api' | 'local'` field. Don't keep two different shapes.

## Auth slice (when needed) — `src/slices/authSlice.ts`

```ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
}

const initialState: AuthState = { token: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    logout: () => initialState,
  },
});

export const { setToken, logout } = authSlice.actions;

export default authSlice.reducer;
```

On logout, also clear cached server data: `dispatch(baseApi.util.resetApiState())`.

## Rules

- Reducers are pure: no `Date.now()`, `Math.random()`, or API calls. Use `prepare` or thunks.
- Inline selectors in components must return primitives or existing references. A selector that builds a new array or object goes through `createSelector`.
- Only whitelisted keys are persisted. Transient state (filters that should reset, loading flags) stays out.
- Changing the shape of a persisted key requires bumping `version` and adding `migrate` (`createMigrate` from redux-persist).
- `PersistGate` in `App.tsx` blocks rendering until rehydration, so theme mode and token are ready on first paint.
