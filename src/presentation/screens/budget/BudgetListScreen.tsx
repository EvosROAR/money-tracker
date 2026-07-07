import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { addMonths, subMonths } from 'date-fns';

import { formatMonthKey } from '@/lib/utils/reports';
import { ScreenContainer } from '@/presentation/components/layout/ScreenContainer';
import { ScreenHeader } from '@/presentation/components/layout/ScreenHeader';
import { MonthNavigator } from '@/presentation/components/layout/MonthNavigator';
import { BudgetProgressCard } from '@/presentation/components/budget/BudgetProgressCard';
import { SkeletonCard } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/feedback/EmptyState';
import { useBudgets } from '@/presentation/hooks/useBudgets';
import { useTheme } from '@/presentation/hooks/useTheme';
import { useSettingsStore } from '@/store/settingsStore';
import { BudgetStackParamList } from '@/presentation/navigation/types';

type NavigationProp = NativeStackNavigationProp<BudgetStackParamList, 'BudgetList'>;

export const BudgetListScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const language = useSettingsStore((s) => s.language);
  const navigation = useNavigation<NavigationProp>();
  const [month, setMonth] = useState(() => new Date());
  const monthKey = formatMonthKey(month);

  const { budgets, isLoading, isRefreshing, refetch } = useBudgets(monthKey);

  return (
    <ScreenContainer padded={false}>
        <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }}>
          <ScreenHeader
            title={t('budget.title')}
            rightAction={
              <Pressable
                onPress={() => navigation.navigate('BudgetForm', { month: monthKey })}
                style={styles.addBtn}
              >
                <Ionicons name="add" size={26} color={theme.colors.primary} />
              </Pressable>
            }
          />

          <MonthNavigator
            month={month}
            language={language}
            onPrev={() => setMonth((m) => subMonths(m, 1))}
            onNext={() => setMonth((m) => addMonths(m, 1))}
          />
        </View>

        {isLoading ? (
          <View style={{ padding: theme.spacing.lg }}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <FlatList
            data={budgets}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              padding: theme.spacing.lg,
              paddingTop: theme.spacing.md,
              flexGrow: 1,
            }}
            refreshing={isRefreshing}
            onRefresh={() => void refetch()}
            renderItem={({ item }) => (
              <BudgetProgressCard
                budget={item}
                onPress={() =>
                  navigation.navigate('BudgetForm', { budgetId: item.id, month: monthKey })
                }
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="wallet-outline"
                title={t('budget.empty')}
                actionLabel={t('budget.add')}
                onAction={() => navigation.navigate('BudgetForm', { month: monthKey })}
              />
            }
          />
        )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  addBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
