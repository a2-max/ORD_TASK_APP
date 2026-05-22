export type TaskStatus = 'completed' | 'pending';
export type TaskFilter = 'all' | 'completed' | 'pending';

export interface Task {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

export interface LocalTask {
  id: string;
  title: string;
  status: TaskStatus;
  isLocal: true;
  createdAt: string;
}

export type AnyTask = Task | LocalTask;
