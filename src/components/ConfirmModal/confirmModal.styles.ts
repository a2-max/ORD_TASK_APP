import { IColors } from '@interfaces/theme';
import { StyleSheet } from 'react-native';

export const confirmModalStyles = (colors: IColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.black + '80',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 24,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
    },
    message: {
      fontSize: 14,
      fontWeight: '400',
      color: colors.grey,
      lineHeight: 20,
      marginBottom: 24,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
    },
    btn: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: 10,
      alignItems: 'center',
    },
    cancelBtn: {
      backgroundColor: colors.grey,
    },
    confirmBtn: {
      backgroundColor: colors.primary,
    },
    cancelText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    confirmText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.background,
    },
  });
