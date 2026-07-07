import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';

import { useTheme } from '@/presentation/hooks/useTheme';

type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'income' | 'expense' | 'inverse' | 'error';
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
}

export const Text = ({
  variant = 'body',
  color = 'primary',
  weight,
  style,
  ...props
}: TextProps) => {
  const { theme } = useTheme();

  const colorMap = {
    primary: theme.colors.text,
    secondary: theme.colors.textSecondary,
    income: theme.colors.income,
    expense: theme.colors.expense,
    inverse: theme.colors.textInverse,
    error: theme.colors.error,
  };

  return (
    <RNText
      style={[
        styles.base,
        {
          fontSize: theme.typography.fontSize[getFontSizeKey(variant)],
          fontWeight: weight
            ? theme.typography.fontWeight[weight]
            : getDefaultWeight(variant),
          color: colorMap[color],
          lineHeight:
            theme.typography.fontSize[getFontSizeKey(variant)] *
            theme.typography.lineHeight.normal,
        },
        style,
      ]}
      {...props}
    />
  );
};

const getFontSizeKey = (
  variant: TextVariant,
): keyof typeof import('@/theme').typography.fontSize => {
  const map: Record<TextVariant, keyof typeof import('@/theme').typography.fontSize> = {
    h1: '3xl',
    h2: '2xl',
    h3: 'xl',
    body: 'md',
    bodySmall: 'sm',
    caption: 'xs',
    label: 'sm',
  };
  return map[variant];
};

const getDefaultWeight = (variant: TextVariant) => {
  if (variant === 'h1' || variant === 'h2') return '700';
  if (variant === 'h3' || variant === 'label') return '600';
  return '400';
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
  },
});
