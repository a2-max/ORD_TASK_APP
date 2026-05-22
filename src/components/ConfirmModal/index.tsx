import React from 'react';
import { Modal, Pressable, TouchableOpacity, View } from 'react-native';
import Txt from '@components/CustomText';
import { confirmModalStyles } from './confirmModal.styles';
import { useTheme } from '@react-navigation/native';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  positiveText?: string;
  positiveButtonColor?: string;
  negativeText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  visible,
  title,
  message,
  positiveText = 'Confirm',
  positiveButtonColor = '#6366F1',
  negativeText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const { colors } = useTheme();
  const styles = confirmModalStyles(colors);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Txt style={styles.title}>{title}</Txt>
          <Txt style={styles.message}>{message}</Txt>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn]}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Txt style={styles.cancelText}>{negativeText}</Txt>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.confirmBtn,
                { backgroundColor: positiveButtonColor },
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Txt style={styles.confirmText}>{positiveText}</Txt>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ConfirmModal;
