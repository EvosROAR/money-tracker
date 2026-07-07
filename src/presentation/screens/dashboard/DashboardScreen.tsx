import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '@/presentation/components/layout/ScreenContainer';
import { Card } from '@/presentation/components/ui/Card';
import { Text } from '@/presentation/components/ui/Text';
import { Button } from '@/presentation/components/ui/Button';
import { SkeletonCard } from '@/presentation/components/ui/Skeleton';
import { TransactionItem } from '@/presentation/components/transaction/TransactionItem';
import { UpcomingRecurringCard } from '@/presentation/components/recurring/UpcomingRecurringCard';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useTheme } from '@/presentation/hooks/useTheme';
import { useAllTransactions } from '@/presentation/hooks/useTransactions';
import { useCurrencyFormat } from '@/presentation/hooks/useCurrencyFormat';
import { useRecurringTransactions } from '@/presentation/hooks/useRecurringTransactions';
import { useSettingsStore } from '@/store/settingsStore';
import { getUpcomingRecurring } from '@/lib/utils/recurring';
import {
  computeMonthExpense,
  computeTransactionSummary,
  getMonthRange,
  getTimeOfDayKey,
} from '@/lib/utils/date';
import { MainTabParamList } from '@/presentation/navigation/types';

type NavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

export const DashboardScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { language } = useSettingsStore();
  const { format: formatMoney } = useCurrencyFormat();

  const { data: transactions = [], isLoading, isRefetching, refetch } = useAllTransactions();
  const { recurringTransactions, isLoading: isRecurringLoading } = useRecurringTransactions();
  const monthRange = useMemo(() => getMonthRange(new Date()), []);

  const monthTransactions = useMemo(
    () =>
      transactions.filter(
        (tx) =>
          tx.date.getTime() >= monthRange.startDate.getTime() &&
          tx.date.getTime() <= monthRange.endDate.getTime(),
      ),
    [transactions, monthRange],
  );

  const summary = useMemo(() => computeTransactionSummary(monthTransactions), [monthTransactions]);
  const monthExpense = useMemo(
    () => computeMonthExpense(transactions, new Date()),
    [transactions],
  );
  const recentTransactions = transactions.slice(0, 5);
  const upcomingRecurring = useMemo(
    () => getUpcomingRecurring(recurringTransactions),
    [recurringTransactions],
  );

  const timeOfDayKey = getTimeOfDayKey(new Date(), language);
  const greeting = t(`dashboard.${timeOfDayKey}`);

  const openTransactionForm = (type: 'income' | 'expense' = 'expense') => {
    navigation.navigate('Transactions', {
      screen: 'TransactionForm',
      params: { type },
    });
  };

  return (
    <ScreenContainer
        scrollable
        refreshing={isRefetching}
        onRefresh={() => void refetch()}
      >
      <View style={styles.header}>
        <Text variant="h2" weight="bold">
          {t('dashboard.greeting', {
            timeOfDay: greeting,
            name: user?.displayName ?? '',
          })}
        </Text>
      </View>

      {isLoading || isRecurringLoading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        <>
          <Card style={styles.balanceCard}>
            <Text variant="label" color="secondary">
              {t('dashboard.totalBalance')}
            </Text>
            <Text
              variant="h1"
              weight="bold"
              color={summary.balance >= 0 ? 'income' : 'expense'}
              style={styles.balance}
            >
              {formatMoney(summary.balance)}
            </Text>
            <View style={styles.row}>
              <View style={styles.stat}>
                <Text variant="caption" color="secondary">
                  {t('dashboard.totalIncome')}
                </Text>
                <Text variant="body" weight="semiBold" color="income">
                  {formatMoney(summary.income)}
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.stat}>
                <Text variant="caption" color="secondary">
                  {t('dashboard.totalExpense')}
                </Text>
                <Text variant="body" weight="semiBold" color="expense">
                  {formatMoney(summary.expense)}
                </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.monthCard}>
            <Text variant="label" color="secondary">
              {t('dashboard.spendingThisMonth')}
            </Text>
            <Text variant="h2" weight="bold" color="expense" style={styles.monthExpense}>
              {formatMoney(monthExpense)}
            </Text>
          </Card>

          <UpcomingRecurringCard items={upcomingRecurring} />

          <View style={styles.sectionHeader}>
            <Text variant="h3" weight="semiBold">
              {t('dashboard.recentTransactions')}
            </Text>
            <Pressable
              onPress={() => navigation.navigate('Transactions', { screen: 'TransactionList' })}
            >
              <Text variant="label" color="income" weight="semiBold">
                {t('common.seeAll')}
              </Text>
            </Pressable>
          </View>

          {recentTransactions.length === 0 ? (
            <Card>
              <Text color="secondary">{t('transactions.empty')}</Text>
            </Card>
          ) : (
            recentTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onPress={() =>
                  navigation.navigate('Transactions', {
                    screen: 'TransactionForm',
                    params: { transactionId: transaction.id },
                  })
                }
              />
            ))
          )}
        </>
      )}

      <Button
        title={t('dashboard.quickAdd')}
        onPress={() => openTransactionForm('expense')}
        fullWidth
        size="lg"
        style={styles.quickAdd}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  balanceCard: {
    marginBottom: 16,
  },
  balance: {
    marginTop: 4,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 36,
    marginHorizontal: 16,
  },
  monthCard: {
    marginBottom: 20,
  },
  monthExpense: {
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickAdd: {
    marginTop: 24,
    marginBottom: 16,
  },
});
