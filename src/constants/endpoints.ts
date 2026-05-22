export const endpoints = {
  todos: {
    list: 'todos',
    detail: (id: number) => `todos/${id}`,
  },
};
