import { IColors } from '@interfaces/theme';
import { responsiveFonts } from '@constants/responsive-fonts';
import { textStyling } from '@utils/text';
import { StyleSheet } from 'react-native';
import { wp } from '@utils';

export const subHeaderStyles = (colors: IColors) =>
  StyleSheet.create({
    subHeaderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: wp(4),
      paddingBottom: 8,
    },
    leftRightContainer: {
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTextContainer: {
      flex: 1,
      alignItems: 'center',
    },
    subHeaderText: {
      ...textStyling({
        fontSize: responsiveFonts.fontxviii,
        color: colors.text,
      }).semiBold,
    },
  });
