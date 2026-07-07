import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { TransactionType } from '@/domain/entities/Transaction';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants/categoryOptions';
import { categorySchema, CategoryFormData } from '@/lib/schemas/category.schema';
import { confirmAction } from '@/lib/utils/confirm';
import { ScreenContainer } from '@/presentation/components/layout/ScreenContainer';
import { ScreenHeader } from '@/presentation/components/layout/ScreenHeader';
import { ColorPicker } from '@/presentation/components/category/ColorPicker';
import { IconPicker } from '@/presentation/components/category/IconPicker';
import { CategoryIcon } from '@/presentation/components/category/CategoryIcon';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { Text } from '@/presentation/components/ui/Text';
import { SegmentedControl } from '@/presentation/components/ui/SegmentedControl';
import { useCategories, useCategory } from '@/presentation/hooks/useCategories';
import { SettingsStackParamList } from '@/presentation/navigation/types';

type RouteProps = RouteProp<SettingsStackParamList, 'CategoryForm'>;

export const CategoryFormScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { categoryId, type: initialType } = route.params ?? {};
  const isEdit = !!categoryId;

  const { data: existing, isLoading: loadingCategory } = useCategory(categoryId);
  const { createCategory, updateCategory, deleteCategory, isCreating, isUpdating, isDeleting } =
    useCategories();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: initialType ?? 'expense',
      icon: CATEGORY_ICONS[0] ?? 'restaurant',
      color: CATEGORY_COLORS[0] ?? '#2ECC71',
    },
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        type: existing.type,
        icon: existing.icon,
        color: existing.color,
      });
    }
  }, [existing, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setFormError(null);
      if (isEdit && categoryId) {
        await updateCategory({ id: categoryId, ...data });
      } else {
        await createCategory(data);
      }
      navigation.goBack();
    } catch {
      setFormError(t('common.error'));
    }
  };

  const handleDelete = () => {
    if (!categoryId || !existing) return;

    confirmAction(
      t('common.confirm'),
      t('categories.deleteConfirm', { name: existing.name }),
      async () => {
        try {
          setFormError(null);
          await deleteCategory(categoryId);
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

  if (isEdit && loadingCategory) {
    return (
      <ScreenContainer>
        <ScreenHeader title={t('categories.edit')} showBack />
        <Text color="secondary">{t('common.loading')}</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <ScreenHeader title={isEdit ? t('categories.edit') : t('categories.add')} showBack />

      <View style={styles.preview}>
        <CategoryIcon icon={selectedIcon} color={selectedColor} size={28} />
      </View>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('categories.name')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name?.message}
          />
        )}
      />

      <View style={styles.section}>
        <Text variant="label" weight="medium" style={styles.label}>
          {t('categories.type')}
        </Text>
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

      <View style={styles.section}>
        <Text variant="label" weight="medium" style={styles.label}>
          {t('categories.icon')}
        </Text>
        <Controller
          control={control}
          name="icon"
          render={({ field: { onChange, value } }) => (
            <IconPicker value={value} color={selectedColor} onChange={onChange} />
          )}
        />
      </View>

      <View style={styles.section}>
        <Text variant="label" weight="medium" style={styles.label}>
          {t('categories.color')}
        </Text>
        <Controller
          control={control}
          name="color"
          render={({ field: { onChange, value } }) => (
            <ColorPicker value={value} onChange={onChange} />
          )}
        />
      </View>

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
  preview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  section: {
    marginTop: 16,
  },
  label: {
    marginBottom: 8,
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
