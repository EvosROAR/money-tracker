import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

import { TransactionType } from '@/domain/entities/Transaction';
import { ScreenContainer } from '@/presentation/components/layout/ScreenContainer';
import { ScreenHeader } from '@/presentation/components/layout/ScreenHeader';
import { CategoryItem } from '@/presentation/components/category/CategoryItem';
import { SegmentedControl } from '@/presentation/components/ui/SegmentedControl';
import { SkeletonCard } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/feedback/EmptyState';
import { useCategories } from '@/presentation/hooks/useCategories';
import { confirmAction } from '@/lib/utils/confirm';
import { useTheme } from '@/presentation/hooks/useTheme';
import { SettingsStackParamList } from '@/presentation/navigation/types';

type NavigationProp = NativeStackNavigationProp<SettingsStackParamList, 'CategoryList'>;

export const CategoryListScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [filterType, setFilterType] = useState<TransactionType>('expense');
  const { categories, isLoading, isRefreshing, refetch, deleteCategory } = useCategories();

  const filtered = categories.filter((c) => c.type === filterType);

  const handleDelete = (id: string, name: string) => {
    confirmAction(
      t('common.confirm'),
      t('categories.deleteConfirm', { name }),
      () => void deleteCategory(id),
      {
        confirmText: t('common.delete'),
        cancelText: t('common.cancel'),
        destructive: true,
      },
    );
  };

  return (
    <ScreenContainer padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }}>
        <ScreenHeader
          title={t('categories.title')}
          showBack
          rightAction={
            <Pressable
              onPress={() => navigation.navigate('CategoryForm', { type: filterType })}
              style={styles.addBtn}
            >
              <Ionicons name="add" size={26} color={theme.colors.primary} />
            </Pressable>
          }
        />

        <SegmentedControl
          value={filterType}
          onChange={setFilterType}
          incomeLabel={t('transactions.income')}
          expenseLabel={t('transactions.expense')}
        />
      </View>

      {isLoading ? (
        <View style={{ padding: theme.spacing.lg }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            flexGrow: 1,
          }}
          refreshing={isRefreshing}
          onRefresh={() => void refetch()}
          renderItem={({ item }) => (
            <CategoryItem
              category={item}
              onPress={() => navigation.navigate('CategoryForm', { categoryId: item.id })}
              onLongPress={() => handleDelete(item.id, item.name)}
              onDelete={() => handleDelete(item.id, item.name)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="grid-outline"
              title={t('categories.empty')}
              actionLabel={t('categories.add')}
              onAction={() => navigation.navigate('CategoryForm', { type: filterType })}
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
