import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@api/manager';
import { Task } from '@interfaces/task.interface';
import { endpoints } from '@constants/endpoints';

const { todos } = endpoints;

type CreateTodoPayload = Pick<Task, 'title' | 'completed' | 'userId'>;
type UpdateTodoPayload = Pick<Task, 'id'> & Partial<Omit<Task, 'id'>>;

export const todosApi = createApi({
  reducerPath: 'todosApi',
  baseQuery: axiosBaseQuery(),
  keepUnusedDataFor: 60,
  tagTypes: ['Todos'],
  endpoints: builder => ({
    // fetch all tasks from API
    getTodos: builder.query<Task[], void>({
      query: () => ({ url: todos.list, method: 'GET' }),
      providesTags: result =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Todos' as const, id })),
              { type: 'Todos', id: 'LIST' },
            ]
          : [{ type: 'Todos', id: 'LIST' }],
    }),

    // fetch task detail by ID
    getTodoById: builder.query<Task, number>({
      query: id => ({ url: todos.detail(id), method: 'GET' }),
      providesTags: (_result, _error, id) => [{ type: 'Todos', id }],
    }),

    addTodo: builder.mutation<Task, CreateTodoPayload>({
      query: body => ({ url: todos.list, method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Todos', id: 'LIST' }],
    }),

    updateTodo: builder.mutation<Task, UpdateTodoPayload>({
      query: ({ id, ...body }) => ({
        url: todos.detail(id),
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Todos', id },
        { type: 'Todos', id: 'LIST' },
      ],
    }),

    deleteTodo: builder.mutation<{ success?: boolean }, number>({
      query: id => ({ url: todos.detail(id), method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Todos', id },
        { type: 'Todos', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTodosQuery,
  useGetTodoByIdQuery,
  useAddTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} = todosApi;
