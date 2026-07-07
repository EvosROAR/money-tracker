import { useEffect } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import { useTheme } from '@/presentation/hooks/useTheme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonProps) => {
  const { theme } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.4, 1]),
  }));

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.skeleton,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

export const SkeletonCard = () => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
        },
        theme.shadows.sm,
      ]}
    >
      <Skeleton width="60%" height={20} />
      <Skeleton width="40%" height={32} style={{ marginTop: 12 }} />
      <Skeleton width="100%" height={12} style={{ marginTop: 16 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  base: {},
  card: {
    marginBottom: 12,
  },
});
