import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { AuthLayout } from '@/presentation/components/layout/AuthLayout';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Text } from '@/presentation/components/ui/Text';
import { useAuth } from '@/presentation/hooks/useAuth';
import { AuthStackParamList } from '@/presentation/navigation/types';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/schemas/auth.schema';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { forgotPassword, getErrorMessage } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setFormError(null);
      await forgotPassword(data.email);
      setSent(true);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  return (
    <AuthLayout title={t('auth.resetPassword')} subtitle={t('auth.resetPasswordDesc')}>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('auth.email')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email?.message}
          />
        )}
      />

      {formError && (
        <Text variant="bodySmall" color="error" style={styles.message}>
          {formError}
        </Text>
      )}

      {sent && (
        <Text variant="bodySmall" color="income" style={styles.message}>
          {t('auth.resetPasswordSuccess')}
        </Text>
      )}

      <Button
        title={t('auth.sendResetLink')}
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        fullWidth
        size="lg"
      />

      <Pressable onPress={() => navigation.navigate('Login')} style={styles.back}>
        <Text variant="bodySmall" color="secondary">
          ← {t('auth.backToLogin')}
        </Text>
      </Pressable>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  message: {
    textAlign: 'center',
  },
  back: {
    alignSelf: 'center',
    marginTop: 8,
  },
});
