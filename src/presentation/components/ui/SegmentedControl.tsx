import { View, Pressable, StyleSheet } from 'react-native';

import { TransactionType } from '@/domain/entities/Transaction';
import { useTheme } from '@/presentation/hooks/useTheme';
import { Text } from '@/presentation/components/ui/Text';

interface SegmentedControlProps {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
  incomeLabel: string;
  expenseLabel: string;
}

export const SegmentedControl = ({
  value,
  onChange,
  incomeLabel,
  expenseLabel,
}: SegmentedControlProps) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.inputBackground }]}>
      {(['expense', 'income'] as TransactionType[]).map((type) => {
        const selected = value === type;
        const label = type === 'income' ? incomeLabel : expenseLabel;
        const activeColor = type === 'income' ? theme.colors.income : theme.colors.expense;

        return (
          <Pressable
            key={type}
            onPress={() => onChange(type)}
            style={[
              styles.segment,
              selected && { backgroundColor: theme.colors.surface },
              selected && theme.shadows.sm,
            ]}
          >
            <Text
              variant="label"
              weight="semiBold"
              style={{ color: selected ? activeColor : theme.colors.textSecondary }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
});
