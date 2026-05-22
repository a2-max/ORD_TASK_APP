import { StyleSheet, TextStyle } from 'react-native';

type TextStyleConstants = Partial<Pick<TextStyle, 'fontSize' | 'color'>>;

export const textStyling = (constants: TextStyleConstants = {}) => {
  const { fontSize = 14, color = '#000' } = constants;

  return StyleSheet.create({
    bold: {
      fontSize,
      color,
      fontWeight: '700',
    },
    semiBold: {
      fontSize,
      color,
      fontWeight: '600',
    },
    medium: {
      fontSize,
      color,
      fontWeight: '500',
    },
    regular: {
      fontSize,
      color,
      fontWeight: '400',
    },
    light: {
      fontSize,
      color,
      fontWeight: '300',
    },
  });
};
