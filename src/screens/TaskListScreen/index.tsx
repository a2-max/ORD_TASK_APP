import AppLayout from '@components/layout';
import NoData from '@components/NoData';
import Txt from '@components/CustomText';
import { useTheme } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@interfaces/navigation';
import { AnyTask, LocalTask } from '@interfaces/task.interface';
import { removeLocalTask } from '@slices/taskSlice';
import { useAppDispatch } from '@store';
import { useTasks } from '@hooks/useTasks';
import ConfirmModal from '@components/ConfirmModal';
import { useToast } from '@context/ToastContext';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import FilterBar from './components/FilterBar';
import TaskCard from './components/TaskCard';
import { taskListStyles } from './taskList.styles';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TaskListScreen'>;
};

const TaskListScreen = ({ navigation }: Props) => {
  const { colors } = useTheme();
  const styles = useMemo(() => taskListStyles(colors), [colors]);
  const { filteredTasks, isLoading, isFetching, isError, refetch } = useTasks();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [deleteTarget, setDeleteTarget] = useState<LocalTask | null>(null);

  const handleTaskPress = useCallback(
    (task: AnyTask) => navigation.navigate('TaskDetailScreen', { task }),
    [navigation],
  );

  const handleEdit = useCallback(
    (task: LocalTask) =>
      navigation.navigate('CreateTaskScreen', { editTask: task }),
    [navigation],
  );

  const handleDeleteTarget = useCallback(
    (task: LocalTask) => setDeleteTarget(task),
    [],
  );

  const handleCancelDelete = useCallback(() => setDeleteTarget(null), []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) {
      return;
    }
    dispatch(removeLocalTask(deleteTarget.id));
    showToast({
      message: 'Task deleted.',
      position: 'top',
      backgroundColor: colors.red500,
    });
    setDeleteTarget(null);
  }, [deleteTarget, dispatch, showToast, colors]);

  const renderItem = useCallback(
    ({ item }: { item: AnyTask }) => (
      <TaskCard
        task={item}
        onPress={handleTaskPress}
        onEdit={handleEdit}
        onDelete={handleDeleteTarget}
      />
    ),
    [handleTaskPress, handleEdit, handleDeleteTarget],
  );

  const ListEmptyComponent = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Txt style={styles.loadingText}>Loading tasks...</Txt>
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.centered}>
          <Txt style={styles.errorText}>
            Failed to load tasks.{'\n'}Check your connection.
          </Txt>
          <TouchableOpacity onPress={refetch}>
            <Txt style={styles.retryText}>Tap to retry</Txt>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <NoData
        headerText="No tasks found"
        descriptionText="There are no tasks matching the selected filter."
      />
    );
  }, [isLoading, isError, colors, refetch, styles]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isFetching && !isLoading}
        onRefresh={refetch}
        tintColor={colors.primary}
        colors={[colors.primary]}
      />
    ),
    [isFetching, isLoading, refetch, colors],
  );

  const keyExtractor = useCallback(
    (item: AnyTask) => (item as { id: string | number }).id.toString(),
    [],
  );

  return (
    <AppLayout showHeader={false}>
      <View style={styles.headerRow}>
        <Txt style={styles.headerTitle}>ORD TASKS</Txt>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateTaskScreen')}
        >
          <Txt style={styles.addButtonText}>+ Add Task</Txt>
        </TouchableOpacity>
      </View>
      <FilterBar />
      <FlatList
        data={filteredTasks}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={refreshControl}
      />

      <ConfirmModal
        visible={deleteTarget !== null}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        positiveText="Delete"
        positiveButtonColor={colors.red500}
        negativeText="Cancel"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </AppLayout>
  );
};

export default TaskListScreen;
