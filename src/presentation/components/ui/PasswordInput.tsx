import { useState } from 'react';
import { Pressable, TextInput, TextInputProps, View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useTheme } from '@/presentation/hooks/useTheme';
import { Text } from './Text';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label?: string;
  error?: string;
}

export const PasswordInput = ({ label, error, style, ...props }: PasswordInputProps) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text variant="label" weight="medium" style={styles.label}>
          {label}
        </Text>
      )}
      <View style={styles.inputRow}>
        <TextInput
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={!visible}
          autoCapitalize="none"
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
        <Pressable
          accessibilityRole="button"
          onPress={() => setVisible((v) => !v)}
          style={styles.eyeButton}
        >
          <Ionicons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={theme.colors.textSecondary}
          />
        </Pressable>
      </View>
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
  inputRow: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingRight: 44,
    fontSize: 15,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  error: {
    marginTop: 4,
  },
});
