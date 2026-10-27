# 09 — API Layer (axios + RTK Query)

## Layers

```text
.env  ->  config/env.config.ts  ->  api/manager (axios instance, axiosBaseQuery, baseApi)
                                              |
constants/endpoints.ts  ->  api/services/<resource>Api.ts (baseApi.injectEndpoints)
                                              |
                              api/index.ts (barrel of hooks)  ->  hooks/ & screens/
```

- **Single `baseApi`** (one `createApi`). Each resource service calls `baseApi.injectEndpoints`. One reducer, one middleware, and tag invalidation works across services.
- **axios** does transport: base URL, timeout, auth header. RTK Query does caching, loading flags, refetching, and invalidation.
- **Services map DTOs to domain types** with `transformResponse`. Screens never see raw server shapes.

## Env — `src/config/env.d.ts` + `src/config/env.config.ts`

```ts
// src/config/env.d.ts
declare module '@env' {
  export const API_BASE_URL: string;
  export const API_TIMEOUT: string | undefined;
}
```

```ts
// src/config/env.config.ts
import { API_BASE_URL, API_TIMEOUT } from '@env';

if (__DEV__ && !API_BASE_URL) {
  console.warn('[config] API_BASE_URL is missing. Copy .env.example to .env.');
}

export const config = {
  apiBaseUrl: API_BASE_URL,
  apiTimeout: Number(API_TIMEOUT ?? 15000),
};
```

Code reads `config.*`, never `@env` directly.

## Endpoints — `src/constants/endpoints.ts`

```ts
export const endpoints = {
  items: {
    list: 'items',
    detail: (id: string) => `items/${id}`,
  },
  auth: {
    login: 'auth/login',
    me: 'auth/me',
  },
};
```

## Manager — `src/api/manager/index.ts`

```ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { createApi } from '@reduxjs/toolkit/query/react';
import { config } from '@config/env.config';

export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
  headers?: AxiosRequestConfig['headers'];
}

export interface ApiError {
  status?: number;
  message: string;
}

let getAuthToken: () => string | null | undefined = () => null;

// Called once from store.ts. Keeps this file free of store imports.
export const registerAuthTokenGetter = (getter: typeof getAuthToken) => {
  getAuthToken = getter;
};

const axiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeout,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(request => {
  const token = getAuthToken();
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

export const toApiError = (error: unknown): ApiError => {
  const err = error as AxiosError<{ message?: string }>;
  return {
    status: err.response?.status,
    message:
      err.response?.data?.message ?? err.message ?? 'Something went wrong.',
  };
};

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiError> =>
  async ({ url, method = 'GET', data, params, headers }) => {
    try {
      const result = await axiosInstance({ url, method, data, params, headers });
      return { data: result.data };
    } catch (error) {
      const apiError = toApiError(error);
      if (__DEV__) {
        console.warn(
          `[API] ${method} ${url} -> ${apiError.status ?? 'network'}: ${apiError.message}`,
        );
      }
      return { error: apiError };
    }
  };

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Item'], // add every resource tag here
  keepUnusedDataFor: 60,
  endpoints: () => ({}),
});

export default axiosInstance;
```

### Optional: global 401 handling

The base query receives `api` as its second argument:

```ts
// excerpt — inside axiosBaseQuery
async (args, api) => {
  ...
  if (apiError.status === 401) {
    api.dispatch(logout()); // from @slices/authSlice; RootNavigator swaps to the auth stack
  }
  return { error: apiError };
}
```

## Domain types — `src/interfaces/item.interface.ts`

```ts
export type ItemStatus = 'pending' | 'completed';
export type ItemFilter = 'all' | ItemStatus;

// Server shape (DTO). Only the API service touches this.
export interface ApiItem {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

// App shape. Everything outside api/services uses this.
export interface Item {
  id: string;
  title: string;
  status: ItemStatus;
  createdAt: string;
}

export type CreateItemPayload = Pick<Item, 'title' | 'status'>;
export type UpdateItemPayload = Pick<Item, 'id'> & Partial<CreateItemPayload>;
```

## Service — `src/api/services/itemsApi.ts`

```ts
import { baseApi } from '@api/manager';
import { endpoints } from '@constants/endpoints';
import {
  ApiItem,
  CreateItemPayload,
  Item,
  UpdateItemPayload,
} from '@interfaces/item.interface';

const { items } = endpoints;

const toItem = (dto: ApiItem): Item => ({
  id: String(dto.id),
  title: dto.title,
  status: dto.completed ? 'completed' : 'pending',
  createdAt: dto.created_at,
});

const toApiBody = (payload: Partial<CreateItemPayload>) => ({
  title: payload.title,
  completed:
    payload.status === undefined ? undefined : payload.status === 'completed',
});

export const itemsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getItems: builder.query<Item[], void>({
      query: () => ({ url: items.list }),
      transformResponse: (response: ApiItem[]) => response.map(toItem),
      providesTags: result =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Item' as const, id })),
              { type: 'Item', id: 'LIST' },
            ]
          : [{ type: 'Item', id: 'LIST' }],
    }),

    getItemById: builder.query<Item, string>({
      query: id => ({ url: items.detail(id) }),
      transformResponse: (response: ApiItem) => toItem(response),
      providesTags: (_result, _error, id) => [{ type: 'Item', id }],
    }),

    createItem: builder.mutation<Item, CreateItemPayload>({
      query: body => ({ url: items.list, method: 'POST', data: toApiBody(body) }),
      transformResponse: (response: ApiItem) => toItem(response),
      invalidatesTags: [{ type: 'Item', id: 'LIST' }],
    }),

    updateItem: builder.mutation<Item, UpdateItemPayload>({
      query: ({ id, ...patch }) => ({
        url: items.detail(id),
        method: 'PATCH',
        data: toApiBody(patch),
      }),
      transformResponse: (response: ApiItem) => toItem(response),
      // Optimistic update: the UI changes instantly and rolls back on failure.
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const listPatch = dispatch(
          itemsApi.util.updateQueryData('getItems', undefined, draft => {
            const item = draft.find(i => i.id === id);
            if (item) {
              Object.assign(item, patch);
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          listPatch.undo();
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Item', id }],
    }),

    deleteItem: builder.mutation<void, string>({
      query: id => ({ url: items.detail(id), method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Item', id },
        { type: 'Item', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetItemsQuery,
  useGetItemByIdQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} = itemsApi;
```

## Barrel — `src/api/index.ts`

```ts
export {
  itemsApi,
  useGetItemsQuery,
  useGetItemByIdQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} from './services/itemsApi';
```

## Using it in screens

```tsx
// Query
const { data: items = [], isLoading, isFetching, isError, error, refetch } =
  useGetItemsQuery();

// Detail (skip when there is no id)
const { data: item } = useGetItemByIdQuery(itemId, { skip: !itemId });

// Mutation
const [createItem, { isLoading: isSaving }] = useCreateItemMutation();

const handleSave = async () => {
  try {
    await createItem({ title, status }).unwrap();
    showToast({ message: 'Item created', type: 'success' });
    navigation.goBack();
  } catch (e) {
    showToast({ message: (e as ApiError).message, type: 'error' });
  }
};
```

| Flag | Meaning | UI |
|---|---|---|
| `isLoading` | First load, no data yet | Full-screen spinner / skeleton |
| `isFetching` | Any request in flight (including refetch) | Pull-to-refresh indicator: `isFetching && !isLoading` |
| `isError` + `error` | Last request failed | Error state with a retry (`refetch`) |

## Adding a new resource

1. Add URL builders to `constants/endpoints.ts`.
2. Add DTO + domain types to `interfaces/<resource>.interface.ts`.
3. Add the tag name to `tagTypes` in `api/manager/index.ts`.
4. Create `api/services/<resource>Api.ts` with `baseApi.injectEndpoints` and a `to<Resource>` mapper.
5. Re-export the hooks from `api/index.ts`.

## Rules

- No `axios` or `fetch` calls in components, hooks, or slices. Everything goes through a service.
- No URL strings outside `endpoints.ts`.
- Every query `providesTags`; every mutation `invalidatesTags` (or does an optimistic `updateQueryData`).
- `console.*` only behind `__DEV__`.
- Uploads: pass `FormData` as `data` and `headers: { 'Content-Type': 'multipart/form-data' }`.
