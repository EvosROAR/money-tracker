import { Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useTheme } from '@/presentation/hooks/useTheme';
import { Text } from './Text';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
}

export const Checkbox = ({ checked, onToggle, label }: CheckboxProps) => {
  const { theme } = useTheme();

  return (
    <Pressable accessibilityRole="checkbox" onPress={onToggle} style={styles.row}>
      <Ionicons
        name={checked ? 'checkbox' : 'square-outline'}
        size={22}
        color={checked ? theme.colors.primary : theme.colors.textSecondary}
      />
      <Text variant="bodySmall" style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    flex: 1,
  },
});
