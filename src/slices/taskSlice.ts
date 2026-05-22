import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LocalTask, TaskFilter, TaskStatus } from '@interfaces/task.interface';

interface TaskState {
  localTasks: LocalTask[];
  activeFilter: TaskFilter;
}

const initialState: TaskState = {
  localTasks: [],
  activeFilter: 'all',
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addLocalTask: (
      state,
      action: PayloadAction<{ title: string; status: TaskStatus }>,
    ) => {
      const newTask: LocalTask = {
        id: `TSK-${Date.now()}-${Math.random().toFixed(4).slice(2)}`,
        title: action.payload.title,
        status: action.payload.status,
        isLocal: true,
        createdAt: new Date().toISOString(),
      };
      state.localTasks.unshift(newTask); // prepending to show newest first
    },

    removeLocalTask: (state, action: PayloadAction<string>) => {
      state.localTasks = state.localTasks.filter(t => t.id !== action.payload);
    },

    toggleLocalTaskStatus: (state, action: PayloadAction<string>) => {
      const task = state.localTasks.find(t => t.id === action.payload);
      if (task) {
        task.status = task.status === 'completed' ? 'pending' : 'completed';
      }
    },

    updateLocalTask: (
      state,
      action: PayloadAction<{ id: string; title: string; status: TaskStatus }>,
    ) => {
      const task = state.localTasks.find(t => t.id === action.payload.id);
      if (task) {
        task.title = action.payload.title;
        task.status = action.payload.status;
      }
    },

    setFilter: (state, action: PayloadAction<TaskFilter>) => {
      state.activeFilter = action.payload;
    },
  },
});

export const {
  addLocalTask,
  removeLocalTask,
  toggleLocalTaskStatus,
  updateLocalTask,
  setFilter,
} = taskSlice.actions;

export default taskSlice.reducer;
