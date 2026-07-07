import { View, ViewProps, StyleSheet } from 'react-native';

import { useTheme } from '@/presentation/hooks/useTheme';

interface CardProps extends ViewProps {
  elevated?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = ({
  elevated = true,
  padding = 'lg',
  style,
  children,
  ...props
}: CardProps) => {
  const { theme } = useTheme();

  const paddingMap = {
    none: 0,
    sm: theme.spacing.sm,
    md: theme.spacing.md,
    lg: theme.spacing.lg,
  };

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: paddingMap[padding],
          borderWidth: elevated ? 0 : 1,
          borderColor: theme.colors.border,
        },
        elevated && theme.shadows.md,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
