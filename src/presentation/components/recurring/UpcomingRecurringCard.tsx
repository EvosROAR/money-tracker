import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import { RecurringTransaction } from '@/domain/entities/RecurringTransaction';
import { formatTransactionDate } from '@/lib/utils/date';
import { getDaysUntilDue } from '@/lib/utils/recurring';
import { useCurrencyFormat } from '@/presentation/hooks/useCurrencyFormat';
import { useCategoryDisplayName } from '@/presentation/hooks/useCategoryDisplayName';
import { useSettingsStore } from '@/store/settingsStore';
import { useTheme } from '@/presentation/hooks/useTheme';
import { Text } from '@/presentation/components/ui/Text';
import { CategoryIcon } from '@/presentation/components/category/CategoryIcon';
import { MainTabParamList } from '@/presentation/navigation/types';

interface UpcomingRecurringCardProps {
  items: RecurringTransaction[];
}

type NavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

export const UpcomingRecurringCard = ({ items }: UpcomingRecurringCardProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { language } = useSettingsStore();
  const { format: formatMoney } = useCurrencyFormat();
  const { resolveName } = useCategoryDisplayName();
  const navigation = useNavigation<NavigationProp>();

  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text variant="h3" weight="semiBold">
          {t('dashboard.upcomingRecurring')}
        </Text>
        <Pressable
          onPress={() =>
            navigation.navigate('Transactions', { screen: 'RecurringList' })
          }
        >
          <Text variant="label" color="income" weight="semiBold">
            {t('common.seeAll')}
          </Text>
        </Pressable>
      </View>

      {items.map((item) => {
        const daysLeft = getDaysUntilDue(item.nextDueDate);
        const dueLabel =
          daysLeft === 0
            ? t('dashboard.dueToday')
            : t('dashboard.dueInDays', { count: daysLeft });
        const isIncome = item.type === 'income';

        return (
          <Pressable
            key={item.id}
            onPress={() =>
              navigation.navigate('Transactions', {
                screen: 'RecurringForm',
                params: { recurringId: item.id },
              })
            }
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
                {formatTransactionDate(item.nextDueDate, language)} · {dueLabel}
                {item.note ? ` · ${item.note}` : ''}
              </Text>
            </View>
            <Text variant="body" weight="semiBold" color={isIncome ? 'income' : 'expense'}>
              {isIncome ? '+' : '−'} {formatMoney(item.amount)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
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
