import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { Category } from '@/domain/entities/Category';
import { RecurringFrequency } from '@/domain/entities/RecurringTransaction';
import { recurringSchema, RecurringFormData } from '@/lib/schemas/recurring.schema';
import { formatDateInput, parseDateInput } from '@/lib/utils/date';
import { confirmAction, showToast } from '@/lib/utils/confirm';
import { useCurrencyFormat } from '@/presentation/hooks/useCurrencyFormat';
import { ScreenContainer } from '@/presentation/components/layout/ScreenContainer';
import { ScreenHeader } from '@/presentation/components/layout/ScreenHeader';
import { CategoryPicker } from '@/presentation/components/category/CategoryPicker';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { Text } from '@/presentation/components/ui/Text';
import { SegmentedControl } from '@/presentation/components/ui/SegmentedControl';
import { useCategories } from '@/presentation/hooks/useCategories';
import {
  useRecurringTransaction,
  useRecurringTransactions,
} from '@/presentation/hooks/useRecurringTransactions';
import { useTheme } from '@/presentation/hooks/useTheme';
import { TransactionsStackParamList } from '@/presentation/navigation/types';

type RouteProps = RouteProp<TransactionsStackParamList, 'RecurringForm'>;

const FREQUENCIES: RecurringFrequency[] = ['daily', 'weekly', 'monthly', 'yearly'];

export const RecurringFormScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { recurringId, type: initialType } = route.params ?? {};
  const isEdit = !!recurringId;

  const { data: existing, isLoading: loadingExisting } = useRecurringTransaction(recurringId);
  const {
    createRecurring,
    updateRecurring,
    deleteRecurring,
    isCreating,
    isUpdating,
    isDeleting,
  } = useRecurringTransactions();
  const { currency, toDisplayAmount, toBaseAmount, parseInput, formatInput } = useCurrencyFormat();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RecurringFormData>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      type: initialType ?? 'expense',
      amount: '',
      categoryId: '',
      frequency: 'monthly',
      startDate: formatDateInput(new Date()),
      endDate: '',
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
        frequency: existing.frequency,
        startDate: formatDateInput(existing.startDate),
        endDate: existing.endDate ? formatDateInput(existing.endDate) : '',
        note: existing.note ?? '',
      });
    }
  }, [existing, reset, formatInput, toDisplayAmount]);

  useEffect(() => {
    if (!isEdit) {
      setValue('categoryId', '');
    }
  }, [selectedType, isEdit, setValue]);

  const frequencyOptions = useMemo(
    () =>
      FREQUENCIES.map((value) => ({
        value,
        label: t(`recurring.frequency.${value}`),
      })),
    [t],
  );

  const handleCategorySelect = (category: Category) => {
    setValue('categoryId', category.id, { shouldValidate: true });
  };

  const onSubmit = async (data: RecurringFormData) => {
    try {
      setFormError(null);
      const payload = {
        type: data.type,
        amount: toBaseAmount(parseInput(data.amount)),
        categoryId: data.categoryId,
        frequency: data.frequency,
        startDate: parseDateInput(data.startDate),
        endDate: data.endDate ? parseDateInput(data.endDate) : undefined,
        note: data.note?.trim() || undefined,
      };

      if (isEdit && recurringId) {
        await updateRecurring({ id: recurringId, ...payload });
      } else {
        await createRecurring(payload);
      }
      showToast(t('recurring.saved'), { type: 'success' });
      navigation.goBack();
    } catch {
      setFormError(t('common.error'));
    }
  };

  const handleDelete = () => {
    if (!recurringId) return;

    confirmAction(
      t('common.confirm'),
      t('recurring.deleteConfirm'),
      async () => {
        try {
          setFormError(null);
          await deleteRecurring(recurringId);
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

  if (loadingExisting && isEdit) {
    return (
      <ScreenContainer>
        <ScreenHeader title={t('recurring.edit')} showBack />
        <Text variant="body" color="secondary">
          {t('common.loading')}
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <ScreenHeader title={isEdit ? t('recurring.edit') : t('recurring.add')} showBack />

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

      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('transactions.amountInCurrency', { currency })}
            value={value}
            onChangeText={(text) => onChange(formatInput(parseInput(text)))}
            onBlur={onBlur}
            error={errors.amount?.message}
            keyboardType="numeric"
            placeholder="0"
          />
        )}
      />

      <Controller
        control={control}
        name="categoryId"
        render={() => (
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
            {errors.categoryId ? (
              <Text variant="caption" color="error" style={styles.fieldError}>
                {errors.categoryId.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      <Text variant="label" weight="medium" style={styles.sectionLabel}>
        {t('recurring.frequencyLabel')}
      </Text>
      <View style={styles.frequencyRow}>
        {frequencyOptions.map((option) => {
          const selected = watch('frequency') === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setValue('frequency', option.value)}
              style={[
                styles.frequencyChip,
                {
                  backgroundColor: selected ? theme.colors.primary : theme.colors.inputBackground,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Text
                variant="caption"
                weight="semiBold"
                style={{ color: selected ? theme.colors.textInverse : theme.colors.textSecondary }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Controller
        control={control}
        name="startDate"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('recurring.startDate')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.startDate?.message}
            {...(Platform.OS === 'web' ? { type: 'date' as const } : { placeholder: 'YYYY-MM-DD' })}
          />
        )}
      />

      <Controller
        control={control}
        name="endDate"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('recurring.endDate')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.endDate?.message}
            placeholder={t('recurring.endDateOptional')}
            {...(Platform.OS === 'web' ? { type: 'date' as const } : {})}
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
            error={errors.note?.message}
            multiline
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
  sectionLabel: {
    marginTop: 8,
    marginBottom: 8,
  },
  frequencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  frequencyChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
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
  },
});
