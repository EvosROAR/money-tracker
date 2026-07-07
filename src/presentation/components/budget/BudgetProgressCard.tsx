import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Budget } from '@/domain/entities/Budget';
import { getBudgetStatus } from '@/lib/utils/reports';
import { useCurrencyFormat } from '@/presentation/hooks/useCurrencyFormat';
import { useCategoryDisplayName } from '@/presentation/hooks/useCategoryDisplayName';
import { useTheme } from '@/presentation/hooks/useTheme';
import { Text } from '@/presentation/components/ui/Text';
import { Card } from '@/presentation/components/ui/Card';

interface BudgetProgressCardProps {
  budget: Budget;
  onPress?: () => void;
}

export const BudgetProgressCard = ({ budget, onPress }: BudgetProgressCardProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { format: formatMoney } = useCurrencyFormat();
  const { resolveName } = useCategoryDisplayName();
  const status = getBudgetStatus(budget);
  const progress = budget.limitAmount > 0 ? budget.spentAmount / budget.limitAmount : 0;
  const clampedProgress = Math.min(progress, 1);

  const barColor =
    status === 'exceeded'
      ? theme.colors.expense
      : status === 'warning'
        ? '#F39C12'
        : theme.colors.income;

  const statusLabel =
    status === 'exceeded'
      ? t('budget.exceeded')
      : status === 'warning'
        ? t('budget.almostFull')
        : null;

  const content = (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text variant="body" weight="semiBold">
          {resolveName(budget.categoryId, budget.categoryName)}
        </Text>
        {statusLabel && (
          <Text variant="caption" color={status === 'exceeded' ? 'expense' : 'secondary'}>
            {statusLabel}
          </Text>
        )}
      </View>

      <View style={[styles.track, { backgroundColor: theme.colors.inputBackground }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress * 100}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text variant="caption" color="secondary">
          {formatMoney(budget.spentAmount)} / {formatMoney(budget.limitAmount)}
        </Text>
        <Text variant="caption" color="secondary">
          {Math.round(progress * 100)}%
        </Text>
      </View>
    </Card>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
