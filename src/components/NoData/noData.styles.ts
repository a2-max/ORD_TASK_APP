import { IColors } from '@interfaces/theme';
import { responsiveFonts } from '@constants/responsive-fonts';
import { textStyling } from '@utils/text';
import { StyleSheet } from 'react-native';

export const noDataStyles = (colors: IColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    headerText: {
      ...textStyling({
        fontSize: responsiveFonts.fontxviii,
        color: colors.text,
      }).semiBold,
      textAlign: 'center',
      marginBottom: 8,
    },
    text: {
      ...textStyling({ fontSize: responsiveFonts.fontxiv, color: colors.grey })
        .regular,
      textAlign: 'center',
    },
  });
