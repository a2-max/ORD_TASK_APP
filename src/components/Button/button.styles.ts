import { IColors } from '@interfaces/theme';
import { responsiveFonts } from '@constants/responsive-fonts';
import { textStyling } from '@utils/text';
import { StyleSheet } from 'react-native';

export const buttonStyles = (colors: IColors) =>
  StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      ...textStyling({ fontSize: responsiveFonts.fontxvi, color: colors.white })
        .semiBold,
    },
    disabled: {
      opacity: 0.5,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    outlinedText: {
      ...textStyling({
        fontSize: responsiveFonts.fontxvi,
        color: colors.primary,
      }).semiBold,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
  });
