import { IColors } from '@interfaces/theme';
import { responsiveFonts } from '@constants/responsive-fonts';
import { textStyling } from '@utils/text';
import { wp } from '@utils';
import { StyleSheet } from 'react-native';

export const createTaskStyles = (colors: IColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: 8,
    },
    label: {
      ...textStyling({ fontSize: responsiveFonts.fontxiv, color: colors.grey })
        .medium,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      ...textStyling({ fontSize: responsiveFonts.fontxv, color: colors.text })
        .regular,
      marginBottom: 20,
    },
    inputFocused: {
      borderColor: colors.primary,
    },
    statusRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    statusChip: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.grey200,
      backgroundColor: colors.card,
    },
    statusChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary50,
    },
    statusChipText: {
      ...textStyling({ fontSize: responsiveFonts.fontxiv, color: colors.grey })
        .medium,
      textTransform: 'capitalize',
    },
    statusChipTextActive: {
      ...textStyling({
        fontSize: responsiveFonts.fontxiv,
        color: colors.primary,
      }).semiBold,
      textTransform: 'capitalize',
    },
    errorText: {
      ...textStyling({ fontSize: responsiveFonts.fontxiv, color: colors.red })
        .regular,
      marginBottom: 12,
    },
    keyboardAvoiding: {
      flex: 1,
    },
  });
