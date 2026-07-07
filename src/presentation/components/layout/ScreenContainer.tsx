import { ScrollView, View, ViewProps, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/presentation/hooks/useTheme';

interface ScreenContainerProps extends ViewProps {
  scrollable?: boolean;
  padded?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const ScreenContainer = ({
  scrollable = false,
  padded = true,
  refreshing = false,
  onRefresh,
  style,
  children,
  ...props
}: ScreenContainerProps) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const contentStyle = [
    padded && {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: insets.bottom + theme.spacing.lg,
    },
    style,
  ];

  if (scrollable) {
    return (
      <ScrollView
        style={[styles.flex, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          ) : undefined
        }
        {...props}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      style={[
        styles.flex,
        { backgroundColor: theme.colors.background },
        contentStyle,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    width: '100%',
  },
});
