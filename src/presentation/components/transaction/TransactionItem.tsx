import { Pressable, StyleSheet, View } from 'react-native';

import { Transaction } from '@/domain/entities/Transaction';
import { useCurrencyFormat } from '@/presentation/hooks/useCurrencyFormat';
import { useCategoryDisplayName } from '@/presentation/hooks/useCategoryDisplayName';
import { formatTransactionDate } from '@/lib/utils/date';
import { useTheme } from '@/presentation/hooks/useTheme';
import { useSettingsStore } from '@/store/settingsStore';
import { Text } from '@/presentation/components/ui/Text';
import { CategoryIcon } from '@/presentation/components/category/CategoryIcon';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionItem = ({ transaction, onPress }: TransactionItemProps) => {
  const { theme } = useTheme();
  const { format: formatMoney } = useCurrencyFormat();
  const { resolveName } = useCategoryDisplayName();
  const language = useSettingsStore((s) => s.language);
  const isIncome = transaction.type === 'income';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.85 : 1,
        },
        theme.shadows.sm,
      ]}
    >
      <CategoryIcon
        icon={transaction.categoryIcon}
        color={transaction.categoryColor}
        size={22}
      />
      <View style={styles.content}>
        <Text variant="body" weight="medium" numberOfLines={1}>
          {resolveName(transaction.categoryId, transaction.categoryName)}
        </Text>
        <Text variant="caption" color="secondary" numberOfLines={1}>
          {formatTransactionDate(transaction.date, language)}
          {transaction.note ? ` · ${transaction.note}` : ''}
        </Text>
      </View>
      <Text variant="body" weight="semiBold" color={isIncome ? 'income' : 'expense'}>
        {isIncome ? '+' : '−'} {formatMoney(transaction.amount)}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
    gap: 12,
  },
  content: {
    flex: 1,
    gap: 2,
  },
});
