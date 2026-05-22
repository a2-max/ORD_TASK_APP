import SubScreenHeader, {
  SubScreenHeaderProps,
} from '@components/headers/SubScreenHeader';
import { useNavigation, useTheme } from '@react-navigation/native';
import React from 'react';
import {
  RefreshControl,
  ScrollView,
  ScrollViewProps,
  StatusBar,
  StatusBarStyle,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { layoutStyles } from './layout.styles';

interface LayoutProps
  extends Pick<SubScreenHeaderProps, 'title' | 'subHeaderChildren'> {
  children: React.ReactNode;
  showHeader?: boolean;
  statusBarStyle?: StatusBarStyle;
  onPressLeft?: () => void;
  showBackBtn?: boolean;
  withScroll?: boolean;
  scrollProps?: Omit<ScrollViewProps, 'children' | 'refreshControl'>;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const AppLayout = ({
  title = '',
  children,
  showHeader = true,
  onPressLeft,
  statusBarStyle,
  showBackBtn = true,
  withScroll = false,
  scrollProps,
  onRefresh,
  refreshing = false,
  subHeaderChildren,
}: LayoutProps) => {
  const insets = useSafeAreaInsets();
  const { colors, dark } = useTheme();
  const styles = layoutStyles(colors, insets);
  const navigation = useNavigation();

  const onBackPress = () => {
    onPressLeft ? onPressLeft() : navigation.goBack();
  };

  const renderHeader = () => {
    if (!showHeader) return null;
    return (
      <SubScreenHeader
        title={title}
        subOnPressLeft={onBackPress}
        showBackBtn={showBackBtn}
        subHeaderChildren={subHeaderChildren}
      />
    );
  };

  const renderContent = () => {
    if (withScroll) {
      return (
        <ScrollView
          {...scrollProps}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            ) : undefined
          }
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      );
    }
    return <View style={styles.content}>{children}</View>;
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={statusBarStyle ?? (dark ? 'light-content' : 'dark-content')}
        backgroundColor={colors.background}
      />
      {renderHeader()}
      {renderContent()}
    </View>
  );
};

export default AppLayout;
