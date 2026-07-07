import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { addMonths, subMonths } from 'date-fns';

import { TransactionType } from '@/domain/entities/Transaction';
import { getMonthRange, formatMonthYear } from '@/lib/utils/date';
import { ScreenContainer } from '@/presentation/components/layout/ScreenContainer';
import { ScreenHeader } from '@/presentation/components/layout/ScreenHeader';
import { MonthNavigator } from '@/presentation/components/layout/MonthNavigator';
import { TransactionItem } from '@/presentation/components/transaction/TransactionItem';
import { SkeletonCard } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/feedback/EmptyState';
import { Text } from '@/presentation/components/ui/Text';
import { Button } from '@/presentation/components/ui/Button';
import { useTransactions } from '@/presentation/hooks/useTransactions';
import { useCategories } from '@/presentation/hooks/useCategories';
import { useCategoryDisplayName } from '@/presentation/hooks/useCategoryDisplayName';
import { useTheme } from '@/presentation/hooks/useTheme';
import { useSettingsStore } from '@/store/settingsStore';
import { TransactionsStackParamList } from '@/presentation/navigation/types';

type NavigationProp = NativeStackNavigationProp<TransactionsStackParamList, 'TransactionList'>;
type TypeFilter = 'all' | TransactionType;
type CategoryFilter = 'all' | string;

const PREVIEW_LIMIT = 5;

export const TransactionListScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const language = useSettingsStore((s) => s.language);
  const navigation = useNavigation<NavigationProp>();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [month, setMonth] = useState(() => new Date());
  const [showAll, setShowAll] = useState(false);

  const { categories: allCategories } = useCategories();
  const { resolveCategory } = useCategoryDisplayName();
  const categoryOptions = useMemo(() => {
    if (typeFilter === 'all') return allCategories;
    return allCategories.filter((category) => category.type === typeFilter);
  }, [allCategories, typeFilter]);

  const { startDate, endDate } = getMonthRange(month);
  const filters = useMemo(
    () => ({
      type: typeFilter === 'all' ? undefined : typeFilter,
      categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
      startDate,
      endDate,
      search: search || undefined,
    }),
    [typeFilter, categoryFilter, startDate, endDate, search],
  );

  const { transactions, isLoading, isRefreshing, refetch } = useTransactions(filters);

  useEffect(() => {
    setShowAll(false);
  }, [month, typeFilter, categoryFilter, search]);

  useEffect(() => {
    setCategoryFilter('all');
  }, [typeFilter]);

  const displayedTransactions = showAll
    ? transactions
    : transactions.slice(0, PREVIEW_LIMIT);
  const hasMore = transactions.length > PREVIEW_LIMIT;

  const typeOptions: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: t('transactions.all') },
    { value: 'expense', label: t('transactions.expense') },
    { value: 'income', label: t('transactions.income') },
  ];

  return (
    <ScreenContainer padded={false}>
        <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }}>
          <ScreenHeader
            title={t('transactions.title')}
            rightAction={
              <View style={styles.headerActions}>
                <Pressable
                  onPress={() => navigation.navigate('RecurringList')}
                  style={styles.headerBtn}
                >
                  <Ionicons name="repeat-outline" size={22} color={theme.colors.primary} />
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate('TransactionForm', { type: 'expense' })}
                  style={styles.headerBtn}
                >
                  <Ionicons name="add" size={26} color={theme.colors.primary} />
                </Pressable>
              </View>
            }
          />

          <View
            style={[
              styles.searchBox,
              { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border },
            ]}
          >
            <Ionicons name="search-outline" size={18} color={theme.colors.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t('transactions.searchPlaceholder')}
              placeholderTextColor={theme.colors.textSecondary}
              style={[styles.searchInput, { color: theme.colors.text }]}
            />
          </View>

          <MonthNavigator
            month={month}
            language={language}
            onPrev={() => setMonth((m) => subMonths(m, 1))}
            onNext={() => setMonth((m) => addMonths(m, 1))}
          />

          <View style={styles.filterRow}>
            {typeOptions.map((option) => {
              const selected = typeFilter === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setTypeFilter(option.value)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: selected ? theme.colors.primary : theme.colors.inputBackground,
                      borderColor: selected ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    variant="caption"
                    weight="semiBold"
                    style={{
                      color: selected ? theme.colors.textInverse : theme.colors.textSecondary,
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {categoryOptions.length > 0 && (
            <>
              <Text variant="caption" color="secondary" style={styles.categoryLabel}>
                {t('transactions.filterByCategory')}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                <Pressable
                  onPress={() => setCategoryFilter('all')}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor:
                        categoryFilter === 'all' ? theme.colors.primary : theme.colors.inputBackground,
                      borderColor:
                        categoryFilter === 'all' ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    variant="caption"
                    weight="semiBold"
                    style={{
                      color:
                        categoryFilter === 'all'
                          ? theme.colors.textInverse
                          : theme.colors.textSecondary,
                    }}
                  >
                    {t('transactions.all')}
                  </Text>
                </Pressable>
                {categoryOptions.map((category) => {
                  const selected = categoryFilter === category.id;
                  return (
                    <Pressable
                      key={category.id}
                      onPress={() => setCategoryFilter(category.id)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: selected
                            ? theme.colors.primary
                            : theme.colors.inputBackground,
                          borderColor: selected ? theme.colors.primary : theme.colors.border,
                        },
                      ]}
                    >
                      <Text
                        variant="caption"
                        weight="semiBold"
                        style={{
                          color: selected ? theme.colors.textInverse : theme.colors.textSecondary,
                        }}
                        numberOfLines={1}
                      >
                        {resolveCategory(category)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          )}
        </View>

        {isLoading ? (
          <View style={{ padding: theme.spacing.lg }}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <FlatList
            data={displayedTransactions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              padding: theme.spacing.lg,
              paddingTop: theme.spacing.md,
              flexGrow: 1,
            }}
            refreshing={isRefreshing}
            onRefresh={() => void refetch()}
            renderItem={({ item }) => (
              <TransactionItem
                transaction={item}
                onPress={() => navigation.navigate('TransactionForm', { transactionId: item.id })}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="receipt-outline"
                title={t('transactions.empty')}
                actionLabel={t('transactions.add')}
                onAction={() => navigation.navigate('TransactionForm', { type: 'expense' })}
              />
            }
            ListFooterComponent={
              hasMore ? (
                <Button
                  title={
                    showAll
                      ? t('common.showLess')
                      : `${t('common.seeAll')} (${transactions.length})`
                  }
                  variant="outline"
                  onPress={() => setShowAll((v) => !v)}
                  fullWidth
                  style={styles.footerBtn}
                />
              ) : null
            }
          />
        )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryLabel: {
    marginTop: 8,
    marginBottom: 6,
  },
  categoryRow: {
    gap: 8,
    paddingBottom: 8,
  },
  footerBtn: {
    marginTop: 4,
  },
});
