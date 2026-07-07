import { useRef } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useTheme } from '@/presentation/hooks/useTheme';
import { Text } from '@/presentation/components/ui/Text';

interface PinDigitsInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  label?: string;
  error?: string;
  autoFocus?: boolean;
  onComplete?: (value: string) => void;
}

export const PinDigitsInput = ({
  value,
  onChange,
  length = 6,
  label,
  error,
  autoFocus = false,
  onComplete,
}: PinDigitsInputProps) => {
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const visibleLength = Math.max(4, Math.min(length, value.length + 1));
  const activeIndex = Math.min(value.length, visibleLength - 1);

  const handleChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, length);
    onChange(cleaned);

    if (cleaned.length === length) {
      onComplete?.(cleaned);
    }
  };

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text variant="label" weight="medium" style={styles.label}>
          {label}
        </Text>
      ) : null}

      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={styles.boxRow}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {Array.from({ length: visibleLength }, (_, index) => {
          const filled = index < value.length;
          const isActive = index === activeIndex && value.length < length;

          return (
            <View
              key={index}
              style={[
                styles.box,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: error
                    ? theme.colors.error
                    : isActive
                      ? theme.colors.primary
                      : filled
                        ? `${theme.colors.primary}66`
                        : theme.colors.border,
                  borderRadius: theme.borderRadius.md,
                },
                filled && styles.boxFilled,
                isActive && styles.boxActive,
              ]}
            >
              {filled ? (
                <View style={[styles.dot, { backgroundColor: theme.colors.text }]} />
              ) : null}
            </View>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        caretHidden
        style={styles.hiddenInput}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        {...(Platform.OS === 'web'
          ? { type: 'tel' as const, autoComplete: 'one-time-code' as const }
          : { secureTextEntry: false })}
      />

      {error ? (
        <Text variant="caption" color="error" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    marginBottom: 10,
    textAlign: 'center',
  },
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  box: {
    flex: 1,
    maxWidth: 52,
    aspectRatio: 1,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    transform: [{ scale: 1.02 }],
  },
  boxActive: {
    borderWidth: 2.5,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    ...(Platform.OS === 'web'
      ? ({
          left: -9999,
          top: 0,
        } as object)
      : null),
  },
  error: {
    marginTop: 8,
    textAlign: 'center',
  },
});
