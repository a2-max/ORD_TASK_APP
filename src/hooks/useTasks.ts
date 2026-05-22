import { useMemo } from 'react';
import { useGetTodosQuery } from '@api';
import { useAppSelector } from '@store';
import { AnyTask, LocalTask, Task } from '@interfaces/task.interface';

const isLocal = (task: AnyTask): task is LocalTask =>
  (task as LocalTask).isLocal === true;

export const useTasks = () => {
  const {
    data: apiTasks = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetTodosQuery();
  const localTasks = useAppSelector(s => s.tasks.localTasks);
  const activeFilter = useAppSelector(s => s.tasks.activeFilter);

  const allTasks: AnyTask[] = useMemo(
    () => [...localTasks, ...apiTasks],
    [localTasks, apiTasks],
  );

  const filteredTasks = useMemo(() => {
    if (activeFilter === 'all') return allTasks;
    if (activeFilter === 'completed') {
      return allTasks.filter(t =>
        isLocal(t) ? t.status === 'completed' : t.completed,
      );
    }
    // pending
    return allTasks.filter(t =>
      isLocal(t) ? t.status === 'pending' : !t.completed,
    );
  }, [allTasks, activeFilter]);

  const getTaskStatus = (task: AnyTask): 'completed' | 'pending' =>
    isLocal(task) ? task.status : task.completed ? 'completed' : 'pending';

  const getTaskTitle = (task: AnyTask): string =>
    isLocal(task) ? task.title : task.title;

  const getTaskId = (task: AnyTask): string =>
    isLocal(task) ? task.id : String((task as Task).id);

  return {
    filteredTasks,
    allTasks,
    isLoading,
    isFetching,
    isError,
    refetch,
    activeFilter,
    getTaskStatus,
    getTaskTitle,
    getTaskId,
    isLocal,
  };
};
