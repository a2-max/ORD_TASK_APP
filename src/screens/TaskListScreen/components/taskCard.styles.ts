import { IColors } from '@interfaces/theme';
import { responsiveFonts } from '@constants/responsive-fonts';
import { textStyling } from '@utils/text';
import { wp } from '@utils';
import { StyleSheet } from 'react-native';

export const taskCardStyles = (colors: IColors, isCompleted: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    title: {
      ...textStyling({ fontSize: responsiveFonts.fontxv, color: colors.text })
        .medium,
      flex: 1,
      marginRight: 8,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      backgroundColor: isCompleted ? colors.green50 : colors.orange50,
    },
    badgeText: {
      ...textStyling({
        fontSize: responsiveFonts.fontx,
        color: isCompleted ? colors.green500 : colors.orange400,
      }).semiBold,
      textTransform: 'capitalize',
    },
    idText: {
      ...textStyling({ fontSize: responsiveFonts.fontx, color: colors.grey })
        .regular,
      marginTop: 4,
    },
    localBadge: {
      marginTop: 6,
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      backgroundColor: colors.primary50,
    },
    localBadgeText: {
      ...textStyling({
        fontSize: responsiveFonts.fontx,
        color: colors.primary500,
      }).regular,
    },
    actionsRow: {
      flexDirection: 'row',
      marginTop: 12,
      gap: 8,
    },
    actionBtn: {
      paddingVertical: 7,
      borderRadius: 8,
      alignItems: 'center',
    },
    toggleBtn: {
      flex: 1,
      backgroundColor: isCompleted ? colors.orange50 : colors.green50,
    },
    toggleBtnText: {
      ...textStyling({
        fontSize: responsiveFonts.fontxii,
        color: isCompleted ? colors.orange400 : colors.green500,
      }).semiBold,
    },
    editBtn: {
      width: wp(20),
      backgroundColor: colors.primary50,
    },
    editBtnText: {
      ...textStyling({
        fontSize: responsiveFonts.fontxii,
        color: colors.primary,
      }).semiBold,
    },
    deleteBtn: {
      width: wp(20),
      backgroundColor: colors.red50,
    },
    deleteBtnText: {
      ...textStyling({
        fontSize: responsiveFonts.fontxii,
        color: colors.red500,
      }).semiBold,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginTop: 12,
    },
  });
