import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { profileSchema, ProfileFormData } from '@/lib/schemas/profile.schema';
import { showToast } from '@/lib/utils/confirm';
import { ScreenContainer } from '@/presentation/components/layout/ScreenContainer';
import { ScreenHeader } from '@/presentation/components/layout/ScreenHeader';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { Text } from '@/presentation/components/ui/Text';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useProfile } from '@/presentation/hooks/useProfile';

export const ProfileScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { updateProfile, isUpdating } = useProfile();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName ?? '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setFormError(null);
      await updateProfile({ displayName: data.displayName });
      showToast(t('settings.profileSaved'), { type: 'success' });
      navigation.goBack();
    } catch {
      setFormError(t('common.error'));
    }
  };

  return (
    <ScreenContainer scrollable>
      <ScreenHeader title={t('settings.profile')} showBack />

      <Text variant="label" color="secondary" style={styles.label}>
        {t('auth.email')}
      </Text>
      <Text variant="body" style={styles.email}>
        {user?.email}
      </Text>

      <Controller
        control={control}
        name="displayName"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('auth.displayName')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.displayName?.message}
            autoCapitalize="words"
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
        loading={isUpdating}
        fullWidth
        size="lg"
        style={styles.save}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: 4,
  },
  email: {
    marginBottom: 20,
  },
  error: {
    textAlign: 'center',
    marginTop: 8,
  },
  save: {
    marginTop: 24,
  },
});
