import { IColors } from '@interfaces/theme';
import { StyleSheet } from 'react-native';

export const svgIconStyles = (width: number, height: number, bgColor: string, colors: IColors) =>
  StyleSheet.create({
    container: {
      width: width,
      height: height,
      borderRadius: width,
      backgroundColor: bgColor ?? colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
