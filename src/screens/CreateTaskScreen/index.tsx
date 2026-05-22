import AppLayout from '@components/layout';
import Btn from '@components/Button';
import Txt from '@components/CustomText';
import { SpacerColumn } from '@components/spacer/SpacerColumn';
import { useTheme } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@interfaces/navigation';
import { TaskStatus } from '@interfaces/task.interface';
import { addLocalTask, updateLocalTask } from '@slices/taskSlice';
import { useAppDispatch } from '@store';
import { useToast } from '@context/ToastContext';
import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createTaskStyles } from './createTask.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateTaskScreen'>;

const STATUSES: TaskStatus[] = ['pending', 'completed'];

const CreateTaskScreen = ({ route, navigation }: Props) => {
  const editTask = route.params?.editTask;
  const isEditing = !!editTask;

  const { colors } = useTheme();
  const styles = createTaskStyles(colors);
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [title, setTitle] = useState(editTask?.title ?? '');
  const [status, setStatus] = useState<TaskStatus>(
    editTask?.status ?? 'pending',
  );
  const [titleFocused, setTitleFocused] = useState(false);
  const [error, setError] = useState('');

  const handleSave = useCallback(() => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Task title cannot be empty.');
      return;
    }
    if (trimmed.length < 3) {
      setError('Task title must be at least 3 characters.');
      return;
    }
    if (isEditing && editTask) {
      dispatch(updateLocalTask({ id: editTask.id, title: trimmed, status }));
      showToast({
        message: 'Task updated!',
        position: 'top',
        backgroundColor: colors.green500,
      });
    } else {
      dispatch(addLocalTask({ title: trimmed, status }));
      showToast({
        message: 'Task created!',
        position: 'top',
        backgroundColor: colors.green500,
      });
    }
    navigation.goBack();
  }, [
    title,
    status,
    isEditing,
    editTask,
    dispatch,
    showToast,
    colors,
    navigation,
  ]);

  const handleChangeText = useCallback(
    (text: string) => {
      setTitle(text);
      if (error) setError('');
    },
    [error],
  );

  const handleFocus = useCallback(() => setTitleFocused(true), []);
  const handleBlur = useCallback(() => setTitleFocused(false), []);

  return (
    <AppLayout
      title={isEditing ? 'Edit Task' : 'Create Task'}
      showBackBtn
      onPressLeft={() => navigation.goBack()}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <SpacerColumn size={1} mv={8} />

          <Txt style={styles.label}>Task Title</Txt>
          <TextInput
            style={[styles.input, titleFocused && styles.inputFocused]}
            placeholder="Enter task title..."
            placeholderTextColor={colors.grey300}
            value={title}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            multiline
            numberOfLines={3}
            maxLength={200}
            returnKeyType="done"
          />

          {!!error && <Txt style={styles.errorText}>{error}</Txt>}

          <Txt style={styles.label}>Status</Txt>
          <View style={styles.statusRow}>
            {STATUSES.map(s => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusChip,
                  status === s && styles.statusChipActive,
                ]}
                onPress={() => setStatus(s)}
                activeOpacity={0.8}
              >
                <Txt
                  style={
                    status === s
                      ? styles.statusChipTextActive
                      : styles.statusChipText
                  }
                >
                  {s}
                </Txt>
              </TouchableOpacity>
            ))}
          </View>

          <Btn
            title={isEditing ? 'Save Changes' : 'Save Task'}
            onPress={handleSave}
          />
        </View>
      </KeyboardAvoidingView>
    </AppLayout>
  );
};

export default CreateTaskScreen;
