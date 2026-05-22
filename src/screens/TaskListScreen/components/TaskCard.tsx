import Txt from '@components/CustomText';
import { SpacerColumn } from '@components/spacer/SpacerColumn';
import { useTheme } from '@react-navigation/native';
import { AnyTask, LocalTask } from '@interfaces/task.interface';
import { useTasks } from '@hooks/useTasks';
import { toggleLocalTaskStatus } from '@slices/taskSlice';
import { useAppDispatch } from '@store';
import { useToast } from '@context/ToastContext';
import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { taskCardStyles } from './taskCard.styles';

interface TaskCardProps {
  task: AnyTask;
  onPress: (task: AnyTask) => void;
  onEdit?: (task: LocalTask) => void;
  onDelete?: (task: LocalTask) => void;
}

const TaskCard = ({ task, onPress, onEdit, onDelete }: TaskCardProps) => {
  const { colors } = useTheme();
  const { getTaskStatus, getTaskTitle, getTaskId, isLocal } = useTasks();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const status = getTaskStatus(task);
  const isCompleted = status === 'completed';
  const styles = useMemo(
    () => taskCardStyles(colors, isCompleted),
    [colors, isCompleted],
  );

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
  }, [task, isLocal, dispatch, showToast, colors]);

  const handlePress = useCallback(() => onPress(task), [onPress, task]);
  const handleEdit = useCallback(
    () => onEdit?.(task as LocalTask),
    [onEdit, task],
  );
  const handleDelete = useCallback(
    () => onDelete?.(task as LocalTask),
    [onDelete, task],
  );

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      <View style={styles.row}>
        <Txt style={styles.title} numberOfLines={2}>
          {getTaskTitle(task)}
        </Txt>
        <View style={styles.badge}>
          <Txt style={styles.badgeText}>{status}</Txt>
        </View>
      </View>
      <SpacerColumn size={1} mv={4} />
      <Txt style={styles.idText}>ID: {getTaskId(task)}</Txt>

      {isLocal(task) && (
        <>
          <View style={styles.divider} />
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.toggleBtn]}
              onPress={handleToggle}
              hitSlop={4}
            >
              <Txt style={styles.toggleBtnText}>
                Mark as {isCompleted ? 'Pending' : 'Done'}
              </Txt>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.editBtn]}
              onPress={handleEdit}
              hitSlop={4}
            >
              <Txt style={styles.editBtnText}>Edit</Txt>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={handleDelete}
              hitSlop={4}
            >
              <Txt style={styles.deleteBtnText}>Delete</Txt>
            </TouchableOpacity>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

export default React.memo(TaskCard);
