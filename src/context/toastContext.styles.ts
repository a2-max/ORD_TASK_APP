import { IColors } from '@interfaces/theme';
import { StyleSheet } from 'react-native';

export const toastContextStyles = (colors: IColors) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      left: 16,
      right: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 10,
      zIndex: 9999,
      elevation: 10,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    bottom: {
      bottom: 48,
    },
    top: {
      top: 64,
    },
    text: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.white,
      textAlign: 'center',
    },
  });
