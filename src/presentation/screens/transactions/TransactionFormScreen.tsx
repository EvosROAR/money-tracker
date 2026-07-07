import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { Category } from '@/domain/entities/Category';
import { transactionSchema, TransactionFormData } from '@/lib/schemas/transaction.schema';
import { formatDateInput, parseDateInput } from '@/lib/utils/date';
import { confirmAction } from '@/lib/utils/confirm';
import { useCurrencyFormat } from '@/presentation/hooks/useCurrencyFormat';
import { ScreenContainer } from '@/presentation/components/layout/ScreenContainer';
import { ScreenHeader } from '@/presentation/components/layout/ScreenHeader';
import { CategoryPicker } from '@/presentation/components/category/CategoryPicker';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { Text } from '@/presentation/components/ui/Text';
import { SegmentedControl } from '@/presentation/components/ui/SegmentedControl';
import { useCategories } from '@/presentation/hooks/useCategories';
import { useTransaction, useTransactions } from '@/presentation/hooks/useTransactions';
import { TransactionsStackParamList } from '@/presentation/navigation/types';

type RouteProps = RouteProp<TransactionsStackParamList, 'TransactionForm'>;

export const TransactionFormScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { transactionId, type: initialType } = route.params ?? {};
  const isEdit = !!transactionId;

  const { data: existing, isLoading: loadingTransaction } = useTransaction(transactionId);
  const {
    createTransaction,
    updateTransaction,
    deleteTransaction,
    isCreating,
    isUpdating,
    isDeleting,
  } = useTransactions();
  const { currency, toDisplayAmount, toBaseAmount, parseInput, formatInput } = useCurrencyFormat();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: initialType ?? 'expense',
      amount: '',
      categoryId: '',
      date: formatDateInput(new Date()),
      note: '',
    },
  });

  const selectedType = watch('type');
  const { categories } = useCategories(selectedType);

  useEffect(() => {
    if (existing) {
      reset({
        type: existing.type,
        amount: formatInput(toDisplayAmount(existing.amount)),
        categoryId: existing.categoryId,
        date: formatDateInput(existing.date),
        note: existing.note ?? '',
      });
    }
  }, [existing, reset, formatInput, toDisplayAmount]);

  useEffect(() => {
    if (!isEdit) {
      setValue('categoryId', '');
    }
  }, [selectedType, isEdit, setValue]);

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setFormError(null);
      const payload = {
        type: data.type,
        amount: toBaseAmount(parseInput(data.amount)),
        categoryId: data.categoryId,
        date: parseDateInput(data.date),
        note: data.note?.trim() || undefined,
      };

      if (isEdit && transactionId) {
        await updateTransaction({ id: transactionId, ...payload });
      } else {
        await createTransaction(payload);
      }
      navigation.goBack();
    } catch {
      setFormError(t('common.error'));
    }
  };

  const handleDelete = () => {
    if (!transactionId) return;

    confirmAction(
      t('common.confirm'),
      t('transactions.deleteConfirm'),
      async () => {
        try {
          setFormError(null);
          await deleteTransaction(transactionId);
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

  if (isEdit && loadingTransaction) {
    return (
      <ScreenContainer>
        <ScreenHeader title={t('transactions.edit')} showBack />
        <Text color="secondary">{t('common.loading')}</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <ScreenHeader title={isEdit ? t('transactions.edit') : t('transactions.add')} showBack />

      <View style={styles.section}>
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <SegmentedControl
              value={value}
              onChange={onChange}
              incomeLabel={t('transactions.income')}
              expenseLabel={t('transactions.expense')}
            />
          )}
        />
      </View>

      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('transactions.amountInCurrency', { currency })}
            value={value}
            onChangeText={(text) => onChange(formatInput(parseInput(text)))}
            onBlur={onBlur}
            keyboardType="numeric"
            error={errors.amount?.message}
            placeholder="0"
          />
        )}
      />

      <View style={styles.section}>
        <Text variant="label" weight="medium" style={styles.label}>
          {t('transactions.category')}
        </Text>
        <CategoryPicker
          categories={categories}
          selectedId={watch('categoryId')}
          type={selectedType}
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
        name="date"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('transactions.date')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.date?.message}
            {...(Platform.OS === 'web' ? { type: 'date' as const } : { placeholder: 'YYYY-MM-DD' })}
          />
        )}
      />

      <Controller
        control={control}
        name="note"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('transactions.note')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            style={styles.noteInput}
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
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
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
