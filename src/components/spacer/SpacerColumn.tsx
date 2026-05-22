import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface SpacerProps {
  size: number;
  containerWidth?: number | `${number}%`;
  background?: string;
  mv?: number;
  mh?: number;
  styleContainer?: ViewStyle;
}

export const SpacerColumn: React.FC<SpacerProps> = ({
  size,
  containerWidth,
  background,
  mv = 0,
  mh = 0,
  styleContainer,
}) => (
  <View
    style={[
      {
        height: StyleSheet.hairlineWidth * size,
        width: (containerWidth ?? '100%') as ViewStyle['width'],
        backgroundColor: background,
        marginVertical: mv,
        marginHorizontal: mh,
        alignSelf: 'center',
      },
      styleContainer,
    ]}
  />
);
