import { IColors } from '@interfaces/theme';
import { responsiveFonts } from '@constants/responsive-fonts';
import { textStyling } from '@utils/text';
import { wp } from '@utils';
import { StyleSheet } from 'react-native';

export const taskDetailStyles = (colors: IColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: 16,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      gap: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      ...textStyling({ fontSize: responsiveFonts.fontxiv, color: colors.grey })
        .regular,
    },
    value: {
      ...textStyling({ fontSize: responsiveFonts.fontxv, color: colors.text })
        .medium,
      flexShrink: 1,
      textAlign: 'right',
      maxWidth: '65%',
    },
    title: {
      ...textStyling({
        fontSize: responsiveFonts.fontxviii,
        color: colors.text,
      }).semiBold,
      lineHeight: 26,
    },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
    },
    badgeCompleted: {
      backgroundColor: colors.green500,
    },
    badgePending: {
      backgroundColor: colors.orange400,
    },
    badgeText: {
      ...textStyling({ fontSize: responsiveFonts.fontxiv, color: colors.white })
        .semiBold,
      textTransform: 'capitalize',
    },
    actionsContainer: {
      marginTop: 24,
      gap: 12,
    },
    actionBtn: {
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: colors.primary100,
    },
    actionBtnText: {
      ...textStyling({
        fontSize: responsiveFonts.fontxv,
        color: colors.primary,
      }).semiBold,
    },
    deleteBtn: {
      backgroundColor: colors.red50,
    },
    deleteBtnText: {
      ...textStyling({
        fontSize: responsiveFonts.fontxv,
        color: colors.red500,
      }).semiBold,
    },
    toggleBtn: {
      backgroundColor: colors.orange50,
    },
    toggleBtnText: {
      ...textStyling({
        fontSize: responsiveFonts.fontxv,
        color: colors.orange400,
      }).semiBold,
    },
  });
