import Txt from '@components/CustomText';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  TextStyle,
  Vibration,
  ViewStyle,
} from 'react-native';
import { buttonStyles } from './button.styles';

interface ButtonProps {
  title: string;
  onPress: () => void;
  styleMain?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  vibrate?: boolean;
  outlined?: boolean;
}

const Btn = ({
  title,
  onPress,
  styleMain,
  textStyle,
  disabled = false,
  loading = false,
  vibrate = false,
  outlined = false,
}: ButtonProps) => {
  const { colors } = useTheme();
  const styles = buttonStyles(colors);

  const handlePress = () => {
    if (vibrate) Vibration.vibrate(50);
    onPress();
  };

  return (
    <Pressable
      style={[
        styles.container,
        outlined && styles.outlined,
        disabled && styles.disabled,
        styleMain,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={outlined ? colors.primary : colors.white}
        />
      ) : (
        <Txt style={[outlined ? styles.outlinedText : styles.text, textStyle]}>
          {title}
        </Txt>
      )}
    </Pressable>
  );
};

export default Btn;
