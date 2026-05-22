import Txt from '@components/CustomText';
import { SpacerColumn } from '@components/spacer/SpacerColumn';
import { useTheme } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { noDataStyles } from './noData.styles';

interface NoDataProps {
  headerText: string;
  descriptionText: string;
}

const NoData = ({ headerText, descriptionText }: NoDataProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => noDataStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Txt style={styles.headerText}>{headerText}</Txt>
      <SpacerColumn size={1} mv={8} />
      <Txt style={styles.text}>{descriptionText}</Txt>
    </View>
  );
};

export default React.memo(NoData);
