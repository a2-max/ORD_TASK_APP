import AppLayout from '@components/layout';
import Txt from '@components/CustomText';
import { SpacerColumn } from '@components/spacer/SpacerColumn';
import { useTheme } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@interfaces/navigation';
import { LocalTask, Task } from '@interfaces/task.interface';
import { removeLocalTask, toggleLocalTaskStatus } from '@slices/taskSlice';
import { useAppDispatch, useAppSelector } from '@store';
import ConfirmModal from '@components/ConfirmModal';
import { useToast } from '@context/ToastContext';
import React, { useCallback, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { taskDetailStyles } from './taskDetail.styles';
import { hp } from '@utils';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetailScreen'>;

const isLocal = (task: Task | LocalTask): task is LocalTask =>
  (task as LocalTask).isLocal === true;

const TaskDetailScreen = ({ route, navigation }: Props) => {
  const paramTask = route.params.task;
  const liveLocalTask = useAppSelector(state =>
    isLocal(paramTask)
      ? state.tasks.localTasks.find(t => t.id === paramTask.id)
      : undefined,
  );
  const task: Task | LocalTask = liveLocalTask ?? paramTask;
  const { colors } = useTheme();
  const styles = taskDetailStyles(colors);
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [deleteVisible, setDeleteVisible] = useState(false);

  const handleOpenDelete = useCallback(() => setDeleteVisible(true), []);
  const handleCancelDelete = useCallback(() => setDeleteVisible(false), []);

  const status = isLocal(task)
    ? task.status
    : task.completed
    ? 'completed'
    : 'pending';

  const isCompleted = status === 'completed';

  const handleToggle = useCallback(() => {
    if (!isLocal(task)) {
      return;
    }
    const next = task.status === 'completed' ? 'pending' : 'completed';
    dispatch(toggleLocalTaskStatus(task.id));
    showToast({
      message: `Marked as ${next}`,
      position: 'top',
      backgroundColor:
        next === 'completed' ? colors.green500 : colors.orange400,
    });
  }, [task, dispatch, showToast, colors]);

  const handleConfirmDelete = useCallback(() => {
    if (!isLocal(task)) {
      return;
    }
    dispatch(removeLocalTask(task.id));
    showToast({
      message: 'Task deleted.',
      position: 'top',
      backgroundColor: colors.red500,
    });
    setDeleteVisible(false);
    navigation.goBack();
  }, [task, dispatch, showToast, colors, navigation]);

  return (
    <AppLayout
      title="Task Detail"
      showBackBtn
      onPressLeft={() => navigation.goBack()}
      withScroll
    >
      <View style={styles.container}>
        <View style={styles.card}>
          {/* Title */}
          <Txt style={styles.title}>{task.title}</Txt>

          <SpacerColumn size={1} background={colors.grey} mv={hp(0.5)} />

          {/* Status badge */}
          <View style={styles.row}>
            <Txt style={styles.label}>Status</Txt>
            <View
              style={[
                styles.badge,
                isCompleted ? styles.badgeCompleted : styles.badgePending,
              ]}
            >
              <Txt style={styles.badgeText}>{status}</Txt>
            </View>
          </View>

          <SpacerColumn size={1} background={colors.grey} mv={hp(0.5)} />

          {/* ID */}
          <View style={styles.row}>
            <Txt style={styles.label}>ID</Txt>
            <Txt style={styles.value}>
              {isLocal(task) ? task.id : String(task.id)}
            </Txt>
          </View>

          {/* User ID — only for API tasks */}
          {!isLocal(task) && (
            <>
              <SpacerColumn size={1} background={colors.grey} mv={hp(0.5)} />
              <View style={styles.row}>
                <Txt style={styles.label}>User ID</Txt>
                <Txt style={styles.value}>{task.userId}</Txt>
              </View>
            </>
          )}

          {/* Created at — only for local tasks */}
          {isLocal(task) && (
            <>
              <SpacerColumn size={1} background={colors.grey} mv={hp(0.5)} />
              <View style={styles.row}>
                <Txt style={styles.label}>Created</Txt>
                <Txt style={styles.value}>
                  {new Date(task.createdAt).toLocaleString()}
                </Txt>
              </View>
            </>
          )}

          {/* Source badge */}
          <SpacerColumn size={1} background={colors.grey} mv={hp(0.5)} />
          <View style={styles.row}>
            <Txt style={styles.label}>Source</Txt>
            <Txt style={styles.value}>{isLocal(task) ? 'Local' : 'API'}</Txt>
          </View>
        </View>

        {/* Actions — local tasks only */}
        {isLocal(task) && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.toggleBtn]}
              onPress={handleToggle}
              activeOpacity={0.8}
            >
              <Txt style={styles.toggleBtnText}>
                {isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
              </Txt>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() =>
                navigation.navigate('CreateTaskScreen', {
                  editTask: task as LocalTask,
                })
              }
              activeOpacity={0.8}
            >
              <Txt style={styles.actionBtnText}>Edit Task</Txt>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={handleOpenDelete}
              activeOpacity={0.8}
            >
              <Txt style={styles.deleteBtnText}>Delete Task</Txt>
            </TouchableOpacity>
          </View>
        )}

        <SpacerColumn size={1} mv={16} />
      </View>

      {isLocal(task) && (
        <>
          <ConfirmModal
            visible={deleteVisible}
            title="Delete Task"
            message="Are you sure you want to delete this task? This cannot be undone."
            positiveText="Delete"
            positiveButtonColor={colors.red500}
            negativeText="Cancel"
            onCancel={handleCancelDelete}
            onConfirm={handleConfirmDelete}
          />
        </>
      )}
    </AppLayout>
  );
};

export default TaskDetailScreen;
