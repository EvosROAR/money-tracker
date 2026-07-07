import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ScreenContainer } from '@/presentation/components/layout/ScreenContainer';
import { ScreenHeader } from '@/presentation/components/layout/ScreenHeader';
import { RecurringItem } from '@/presentation/components/recurring/RecurringItem';
import { SkeletonCard } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/feedback/EmptyState';
import { Text } from '@/presentation/components/ui/Text';
import { useRecurringTransactions } from '@/presentation/hooks/useRecurringTransactions';
import { useTheme } from '@/presentation/hooks/useTheme';
import { TransactionsStackParamList } from '@/presentation/navigation/types';

type NavigationProp = NativeStackNavigationProp<TransactionsStackParamList, 'RecurringList'>;

export const RecurringListScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const {
    recurringTransactions,
    isLoading,
    isRefreshing,
    refetch,
  } = useRecurringTransactions();

  return (
    <ScreenContainer padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }}>
        <ScreenHeader
          title={t('recurring.title')}
          showBack
          rightAction={
            <Pressable
              onPress={() => navigation.navigate('RecurringForm', { type: 'expense' })}
              style={styles.addBtn}
            >
              <Ionicons name="add" size={26} color={theme.colors.primary} />
            </Pressable>
          }
        />
        <Text variant="bodySmall" color="secondary" style={styles.hint}>
          {t('recurring.hint')}
        </Text>
      </View>

      {isLoading ? (
        <View style={{ padding: theme.spacing.lg }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={recurringTransactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            flexGrow: 1,
          }}
          refreshing={isRefreshing}
          onRefresh={() => void refetch()}
          renderItem={({ item }) => (
            <RecurringItem
              item={item}
              onPress={() => navigation.navigate('RecurringForm', { recurringId: item.id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="repeat-outline"
              title={t('recurring.empty')}
              actionLabel={t('recurring.add')}
              onAction={() => navigation.navigate('RecurringForm', { type: 'expense' })}
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
  hint: {
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 20,
  },
});
