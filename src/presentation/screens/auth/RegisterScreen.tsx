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
import { PasswordInput } from '@/presentation/components/ui/PasswordInput';
import { Text } from '@/presentation/components/ui/Text';
import { useAuth } from '@/presentation/hooks/useAuth';
import { AuthStackParamList } from '@/presentation/navigation/types';
import { registerSchema, RegisterFormData } from '@/lib/schemas/auth.schema';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export const RegisterScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { register, getErrorMessage } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setFormError(null);
      await register({
        displayName: data.displayName,
        email: data.email,
        password: data.password,
      });
      setSuccess(true);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  return (
    <AuthLayout
      title={t('auth.register')}
      subtitle={t('auth.registerSubtitle')}
      footer={
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text variant="bodySmall" color="secondary">
            {t('auth.hasAccount')}{' '}
            <Text variant="bodySmall" color="income" weight="semiBold">
              {t('auth.login')}
            </Text>
          </Text>
        </Pressable>
      }
    >
      <Controller
        control={control}
        name="displayName"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t('auth.displayName')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="words"
            error={errors.displayName?.message}
          />
        )}
      />

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

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <PasswordInput
            label={t('auth.password')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <PasswordInput
            label={t('auth.confirmPassword')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.confirmPassword?.message}
          />
        )}
      />

      {formError && (
        <Text variant="bodySmall" color="error" style={styles.formError}>
          {formError}
        </Text>
      )}

      {success && (
        <Text variant="bodySmall" color="income" style={styles.formError}>
          {t('auth.registerSuccess')}
        </Text>
      )}

      <Button
        title={t('auth.register')}
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        fullWidth
        size="lg"
      />

      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text variant="bodySmall" color="secondary">
          ← {t('common.back')}
        </Text>
      </Pressable>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  formError: {
    textAlign: 'center',
  },
  back: {
    alignSelf: 'center',
    marginTop: 8,
  },
});
