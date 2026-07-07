import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { Category } from '@/domain/entities/Category';
import { budgetSchema, BudgetFormData } from '@/lib/schemas/budget.schema';
import { confirmAction } from '@/lib/utils/confirm';
import { formatMonthKey } from '@/lib/utils/reports';
import { useCurrencyFormat } from '@/presentation/hooks/useCurrencyFormat';
import { ScreenContainer } from '@/presentation/components/layout/ScreenContainer';
import { ScreenHeader } from '@/presentation/components/layout/ScreenHeader';
import { CategoryPicker } from '@/presentation/components/category/CategoryPicker';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { Text } from '@/presentation/components/ui/Text';
import { useCategories } from '@/presentation/hooks/useCategories';
import { useBudget, useBudgets } from '@/presentation/hooks/useBudgets';
import { BudgetStackParamList } from '@/presentation/navigation/types';

type RouteProps = RouteProp<BudgetStackParamList, 'BudgetForm'>;

export const BudgetFormScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { budgetId, month: initialMonth } = route.params ?? {};
  const isEdit = !!budgetId;

  const { data: existing, isLoading: loadingBudget } = useBudget(budgetId);
  const monthKey = initialMonth ?? existing?.month ?? formatMonthKey(new Date());

  const { categories } = useCategories('expense');
  const { createBudget, updateBudget, deleteBudget, isCreating, isUpdating, isDeleting } =
    useBudgets(monthKey);
  const { currency, toDisplayAmount, toBaseAmount, parseInput, formatInput } = useCurrencyFormat();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      month: initialMonth ?? '',
      categoryId: '',
      limitAmount: '',
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        month: existing.month,
        categoryId: existing.categoryId,
        limitAmount: formatInput(toDisplayAmount(existing.limitAmount)),
      });
    } else if (initialMonth) {
      reset({
        month: initialMonth,
        categoryId: '',
        limitAmount: '',
      });
    }
  }, [existing, initialMonth, reset, formatInput, toDisplayAmount]);

  const onSubmit = async (data: BudgetFormData) => {
    try {
      setFormError(null);
      const payload = {
        month: data.month,
        categoryId: data.categoryId,
        limitAmount: toBaseAmount(parseInput(data.limitAmount)),
      };

      if (isEdit && budgetId) {
        await updateBudget({ id: budgetId, ...payload });
      } else {
        await createBudget(payload);
      }
      navigation.goBack();
    } catch {
      setFormError(t('common.error'));
    }
  };

  const handleDelete = () => {
    if (!budgetId) return;

    confirmAction(
      t('common.confirm'),
      t('budget.deleteConfirm'),
      async () => {
        try {
          setFormError(null);
          await deleteBudget(budgetId);
          navigation.goBack();
        } catch {
          setFormError(t('common.error'));
        }
      },
      {
        confirmText: t('common.delete'),
        cancelText: t('common.cancel'),
        destructive: true,
      },
    );
  };

  const handleCategorySelect = (category: Category) => {
    setValue('categoryId', category.id, { shouldValidate: true });
  };

  if (isEdit && loadingBudget) {
    return (
      <ScreenContainer>
        <ScreenHeader title={t('budget.edit')} showBack />
        <Text color="secondary">{t('common.loading')}</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <ScreenHeader title={isEdit ? t('budget.edit') : t('budget.add')} showBack />

      <View style={styles.section}>
        <Text variant="label" weight="medium" style={styles.label}>
          {t('transactions.category')}
        </Text>
        <CategoryPicker
          categories={categories}
          selectedId={watch('categoryId')}
          type="expense"
          onSelect={handleCategorySelect}
        />
        {errors.categoryId && (
          <Text variant="caption" color="error" style={styles.fieldError}>
            {errors.categoryId.message}
          </Text>
        )}
      </View>

      <Controller
        control={control}
        name="limitAmount"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('budget.limitInCurrency', { currency })}
            value={value}
            onChangeText={(text) => onChange(formatInput(parseInput(text)))}
            onBlur={onBlur}
            keyboardType="numeric"
            error={errors.limitAmount?.message}
            placeholder="0"
          />
        )}
      />

      {formError && (
        <Text variant="bodySmall" color="error" style={styles.error}>
          {formError}
        </Text>
      )}

      <Button
        title={t('common.save')}
        onPress={handleSubmit(onSubmit)}
        loading={isCreating || isUpdating}
        fullWidth
        size="lg"
        style={styles.save}
      />

      {isEdit && (
        <Button
          title={t('common.delete')}
          variant="danger"
          onPress={handleDelete}
          loading={isDeleting}
          fullWidth
          size="lg"
          style={styles.delete}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  fieldError: {
    marginTop: 6,
  },
  error: {
    textAlign: 'center',
    marginTop: 8,
  },
  save: {
    marginTop: 24,
  },
  delete: {
    marginTop: 12,
    marginBottom: 16,
  },
});
