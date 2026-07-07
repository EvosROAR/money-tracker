import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { RecurringTransaction } from '@/domain/entities/RecurringTransaction';
import { formatTransactionDate } from '@/lib/utils/date';
import { useCurrencyFormat } from '@/presentation/hooks/useCurrencyFormat';
import { useCategoryDisplayName } from '@/presentation/hooks/useCategoryDisplayName';
import { useSettingsStore } from '@/store/settingsStore';
import { useTheme } from '@/presentation/hooks/useTheme';
import { Text } from '@/presentation/components/ui/Text';
import { CategoryIcon } from '@/presentation/components/category/CategoryIcon';

interface RecurringItemProps {
  item: RecurringTransaction;
  onPress?: () => void;
}

export const RecurringItem = ({ item, onPress }: RecurringItemProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { language } = useSettingsStore();
  const { format: formatMoney } = useCurrencyFormat();
  const { resolveName } = useCategoryDisplayName();
  const isIncome = item.type === 'income';

  const startLabel = formatTransactionDate(item.startDate, language);
  const endLabel = item.endDate
    ? formatTransactionDate(item.endDate, language)
    : t('recurring.noEndDate');

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
      <CategoryIcon icon={item.categoryIcon} color={item.categoryColor} size={22} />

      <View style={styles.content}>
        <Text variant="body" weight="medium" numberOfLines={1}>
          {resolveName(item.categoryId, item.categoryName)}
        </Text>
        <Text variant="caption" color="secondary" numberOfLines={1}>
          {t(`recurring.frequency.${item.frequency}`)}
        </Text>
        <Text variant="caption" color="secondary" numberOfLines={2}>
          {t('recurring.dateRange', { start: startLabel, end: endLabel })}
        </Text>
        {item.note ? (
          <Text variant="caption" color="secondary" numberOfLines={1}>
            {item.note}
          </Text>
        ) : null}
      </View>

      <Text variant="body" weight="semiBold" color={isIncome ? 'income' : 'expense'}>
        {formatMoney(item.amount)}
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
