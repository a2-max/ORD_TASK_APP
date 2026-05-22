import { Task, LocalTask } from '@interfaces/task.interface';

export type RootStackParamList = {
  TaskListScreen: undefined;
  TaskDetailScreen: { task: Task | LocalTask };
  CreateTaskScreen: { editTask?: LocalTask } | undefined;
};
