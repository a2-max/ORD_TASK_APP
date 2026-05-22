import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { svgIconStyles } from './styles';
import { SvgProps } from 'react-native-svg';
import { iconMap } from '@assets/svg/svg.list';

export type SvgIconKey = keyof typeof iconMap;

type IconProps = SvgProps & {
  source: SvgIconKey;
  width?: number;
  height?: number;
  color?: string;
  style?: any;
  addCircle?: boolean;
  bgColor?: string;
  containerStyle?: ViewStyle;
};

export default function SvgIcon({ source, addCircle, ...props }: IconProps) {
  const RenderIcon = iconMap[source] as React.ComponentType<SvgProps>;
  const { colors } = useTheme();
  const styles = svgIconStyles(
    props?.width ?? 20,
    props?.height ?? 20,
    props?.bgColor ?? colors.white,
    colors,
  );
  if (!RenderIcon) {
    return null;
  }
  if (addCircle) {
    return (
      <View style={[styles.container, props.containerStyle]}>
        <RenderIcon {...props} />
      </View>
    );
  }
  return <RenderIcon {...props} />;
}
