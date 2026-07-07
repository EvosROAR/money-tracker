import { TextInput, TextInputProps, View, StyleSheet } from 'react-native';

import { useTheme } from '@/presentation/hooks/useTheme';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, style, ...props }: InputProps) => {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text variant="label" weight="medium" style={styles.label}>
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor={theme.colors.textSecondary}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: error ? theme.colors.error : theme.colors.border,
            color: theme.colors.text,
            borderRadius: theme.borderRadius.md,
          },
          style,
        ]}
        {...props}
      />
      {error && (
        <Text variant="caption" color="error" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  error: {
    marginTop: 4,
  },
});
