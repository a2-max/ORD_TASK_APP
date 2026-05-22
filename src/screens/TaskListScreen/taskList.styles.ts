import { IColors } from '@interfaces/theme';
import { responsiveFonts } from '@constants/responsive-fonts';
import { textStyling } from '@utils/text';
import { wp } from '@utils';
import { StyleSheet } from 'react-native';

export const taskListStyles = (colors: IColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: wp(4),
      paddingVertical: 12,
    },
    headerTitle: {
      ...textStyling({ fontSize: responsiveFonts.fontxx, color: colors.text })
        .bold,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    addButtonText: {
      ...textStyling({ fontSize: responsiveFonts.fontxiv, color: colors.white })
        .semiBold,
    },
    listContent: {
      paddingHorizontal: wp(4),
      paddingBottom: 24,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorText: {
      ...textStyling({ fontSize: responsiveFonts.fontxvi, color: colors.red })
        .medium,
      textAlign: 'center',
      marginBottom: 16,
    },
    retryText: {
      ...textStyling({
        fontSize: responsiveFonts.fontxiv,
        color: colors.primary,
      }).medium,
    },
    loadingText: {
      ...textStyling({
        fontSize: responsiveFonts.fontxiv,
        color: colors.grey,
      }).regular,
      marginTop: 12,
    },
  });
