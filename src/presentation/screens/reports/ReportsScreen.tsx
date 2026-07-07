import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { addMonths, subMonths } from 'date-fns';

import { formatMonthYear } from '@/lib/utils/date';
import { formatBackupDate } from '@/lib/utils/backupSerialize';
import { useCurrencyFormat } from '@/presentation/hooks/useCurrencyFormat';
import { useCategoryDisplayName } from '@/presentation/hooks/useCategoryDisplayName';
import {
  computeMonthReport,
  computeSpendingByCategory,
  formatMonthKey,
} from '@/lib/utils/reports';
import { ScreenContainer } from '@/presentation/components/layout/ScreenContainer';
import { ScreenHeader } from '@/presentation/components/layout/ScreenHeader';
import { MonthNavigator } from '@/presentation/components/layout/MonthNavigator';
import { BarChartItem } from '@/presentation/components/reports/BarChartItem';
import { Card } from '@/presentation/components/ui/Card';
import { Text } from '@/presentation/components/ui/Text';
import { Button } from '@/presentation/components/ui/Button';
import { SkeletonCard } from '@/presentation/components/ui/Skeleton';
import { useAllTransactions } from '@/presentation/hooks/useTransactions';
import { useTheme } from '@/presentation/hooks/useTheme';
import { useSettingsStore } from '@/store/settingsStore';

export const ReportsScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const language = useSettingsStore((s) => s.language);
  const { format: formatMoney, currency } = useCurrencyFormat();
  const { resolveName } = useCategoryDisplayName();
  const [month, setMonth] = useState(() => new Date());

  const { data: transactions = [], isLoading, isRefetching, refetch } = useAllTransactions();

  const report = useMemo(() => computeMonthReport(transactions, month), [transactions, month]);
  const spending = useMemo(
    () => computeSpendingByCategory(transactions, month),
    [transactions, month],
  );
  const maxSpending = spending[0]?.amount ?? 0;

  const handleExport = () => {
    const monthLabel = formatMonthYear(month, language);
    const payload = {
      exportedAt: formatBackupDate(new Date()),
      month: formatMonthKey(month),
      monthLabel,
      currency,
      summary: report,
      spendingByCategory: spending,
    };

    if (Platform.OS === 'web') {
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `pocketledger-report-${formatMonthKey(month)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <ScreenContainer scrollable refreshing={isRefetching} onRefresh={() => void refetch()}>
        <ScreenHeader title={t('reports.title')} />

        <MonthNavigator
          month={month}
          language={language}
          onPrev={() => setMonth((m) => subMonths(m, 1))}
          onNext={() => setMonth((m) => addMonths(m, 1))}
        />

      {isLoading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        <>
          <Text variant="h3" weight="semiBold" style={styles.sectionTitle}>
            {t('reports.incomeVsExpense')}
          </Text>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text variant="caption" color="secondary">
                  {t('dashboard.totalIncome')}
                </Text>
                <Text variant="h3" weight="bold" color="income">
                  {formatMoney(report.income)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="caption" color="secondary">
                  {t('dashboard.totalExpense')}
                </Text>
                <Text variant="h3" weight="bold" color="expense">
                  {formatMoney(report.expense)}
                </Text>
              </View>
            </View>
            <View style={[styles.balanceRow, { borderTopColor: theme.colors.border }]}>
              <Text variant="body" color="secondary">
                {t('dashboard.totalBalance')}
              </Text>
              <Text
                variant="body"
                weight="semiBold"
                color={report.balance >= 0 ? 'income' : 'expense'}
              >
                {formatMoney(report.balance)}
              </Text>
            </View>

            <View style={styles.compareBars}>
              <View style={styles.compareItem}>
                <View
                  style={[
                    styles.compareBar,
                    {
                      height: Math.max(24, (report.income / Math.max(report.income, report.expense, 1)) * 80),
                      backgroundColor: theme.colors.income,
                    },
                  ]}
                />
                <Text variant="caption" color="secondary">
                  {t('transactions.income')}
                </Text>
              </View>
              <View style={styles.compareItem}>
                <View
                  style={[
                    styles.compareBar,
                    {
                      height: Math.max(24, (report.expense / Math.max(report.income, report.expense, 1)) * 80),
                      backgroundColor: theme.colors.expense,
                    },
                  ]}
                />
                <Text variant="caption" color="secondary">
                  {t('transactions.expense')}
                </Text>
              </View>
            </View>
          </Card>

          <Text variant="h3" weight="semiBold" style={styles.sectionTitle}>
            {t('reports.spendingByCategory')}
          </Text>
          <Card>
            {spending.length === 0 ? (
              <Text color="secondary">{t('transactions.empty')}</Text>
            ) : (
              spending.map((item) => (
                <BarChartItem
                  key={item.categoryId}
                  label={resolveName(item.categoryId, item.categoryName)}
                  value={item.amount}
                  maxValue={maxSpending}
                  color={item.categoryColor}
                  valueLabel={formatMoney(item.amount)}
                />
              ))
            )}
          </Card>

          {Platform.OS === 'web' && (
            <Button
              title={t('reports.exportJson')}
              variant="outline"
              onPress={handleExport}
              fullWidth
              style={styles.exportBtn}
            />
          )}
        </>
      )}
      </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: 12,
    marginTop: 8,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    gap: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    marginBottom: 16,
  },
  compareBars: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 32,
    minHeight: 100,
  },
  compareItem: {
    alignItems: 'center',
    gap: 8,
  },
  compareBar: {
    width: 48,
    borderRadius: 8,
  },
  exportBtn: {
    marginTop: 16,
    marginBottom: 16,
  },
});
