import {
  Pressable,
  PressableProps,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/presentation/hooks/useTheme';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) => {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const variantStyles = getVariantStyles(variant, theme.colors, isDisabled);
  const sizeStyles = getSizeStyles(size, theme.spacing);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles.container,
        sizeStyles,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        style as ViewStyle,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.textColor} size="small" />
      ) : (
        <Text
          variant="label"
          weight="semiBold"
          style={{ color: variantStyles.textColor }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const getVariantStyles = (
  variant: ButtonVariant,
  colors: ReturnType<typeof import('@/theme').createTheme>['colors'],
  disabled?: boolean | null,
) => {
  const opacity = disabled ? 0.5 : 1;

  const map: Record<ButtonVariant, { container: ViewStyle; textColor: string }> = {
    primary: {
      container: { backgroundColor: colors.primary, opacity },
      textColor: colors.textInverse,
    },
    secondary: {
      container: { backgroundColor: colors.surfaceElevated, opacity },
      textColor: colors.text,
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.border,
        opacity,
      },
      textColor: colors.text,
    },
    ghost: {
      container: { backgroundColor: 'transparent', opacity },
      textColor: colors.primary,
    },
    danger: {
      container: { backgroundColor: colors.error, opacity },
      textColor: colors.textInverse,
    },
  };

  return map[variant];
};

const getSizeStyles = (
  size: ButtonSize,
  spacing: ReturnType<typeof import('@/theme').createTheme>['spacing'],
): ViewStyle => {
  const map: Record<ButtonSize, ViewStyle> = {
    sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
    md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
    lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing['2xl'] },
  };
  return map[size];
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
