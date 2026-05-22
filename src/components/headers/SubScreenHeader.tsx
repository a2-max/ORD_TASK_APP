import Txt from '@components/CustomText';
import { SpacerColumn } from '@components/spacer/SpacerColumn';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { subHeaderStyles } from './header.styles';
import SvgIcon from '@components/SvgIcon';

export interface SubScreenHeaderProps {
  title?: string;
  subOnPressLeft?: () => void;
  subHeaderChildren?: React.ReactNode;
  showBackBtn?: boolean;
}

const SubScreenHeader = ({
  title,
  subOnPressLeft,
  subHeaderChildren,
  showBackBtn = true,
}: SubScreenHeaderProps) => {
  const { colors } = useTheme();
  const styles = subHeaderStyles(colors);

  return (
    <>
      <SpacerColumn size={1} mv={14} />
      <View style={styles.subHeaderContainer}>
        {showBackBtn && (
          <TouchableOpacity
            style={styles.leftRightContainer}
            hitSlop={10}
            onPress={subOnPressLeft}
          >
            <SvgIcon
              source="chevronLeft"
              color={colors.text}
              height={18}
              width={18}
            />
          </TouchableOpacity>
        )}
        <View
          style={[
            styles.headerTextContainer,
            !showBackBtn && { alignItems: 'flex-start' },
          ]}
        >
          <Txt style={styles.subHeaderText}>{title}</Txt>
        </View>
        <View style={styles.leftRightContainer}>{subHeaderChildren}</View>
      </View>
    </>
  );
};

export default SubScreenHeader;
