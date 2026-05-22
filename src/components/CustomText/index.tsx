import React, { FC } from 'react';
import { Text, TextProps as RNTextProps } from 'react-native';

interface TxtProps extends RNTextProps {}

const Txt: FC<TxtProps> = ({
  style,
  allowFontScaling = false,
  children,
  ...restProps
}) => (
  <Text allowFontScaling={allowFontScaling} style={style} {...restProps}>
    {children}
  </Text>
);

export default Txt;
