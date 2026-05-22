import { IColors } from '@interfaces/theme';
import { responsiveFonts } from '@constants/responsive-fonts';
import { textStyling } from '@utils/text';
import { wp } from '@utils';
import { StyleSheet } from 'react-native';

export const filterBarStyles = (colors: IColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: wp(4),
      paddingBottom: 12,
      gap: 8,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.grey200,
      backgroundColor: colors.card,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      ...textStyling({ fontSize: responsiveFonts.fontxiv, color: colors.grey })
        .medium,
      textTransform: 'capitalize',
    },
    chipTextActive: {
      ...textStyling({
        fontSize: responsiveFonts.fontxiv,
        color: colors.white,
      }).medium,
      textTransform: 'capitalize',
    },
  });
