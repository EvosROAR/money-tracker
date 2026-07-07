import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { AuthLayout } from '@/presentation/components/layout/AuthLayout';
import { Button } from '@/presentation/components/ui/Button';
import { Checkbox } from '@/presentation/components/ui/Checkbox';
import { Input } from '@/presentation/components/ui/Input';
import { PasswordInput } from '@/presentation/components/ui/PasswordInput';
import { Text } from '@/presentation/components/ui/Text';
import { useAuth } from '@/presentation/hooks/useAuth';
import { AuthStackParamList } from '@/presentation/navigation/types';
import { loginSchema, LoginFormData } from '@/lib/schemas/auth.schema';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { login, getErrorMessage, rememberedEmail, rememberMe } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: rememberedEmail || '',
      password: '',
      rememberMe: rememberMe,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setFormError(null);
      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  return (
    <AuthLayout
      title={t('common.appName')}
      subtitle={t('auth.loginSubtitle')}
      footer={
        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text variant="bodySmall" color="secondary">
            {t('auth.noAccount')}{' '}
            <Text variant="bodySmall" color="income" weight="semiBold">
              {t('auth.register')}
            </Text>
          </Text>
        </Pressable>
      }
    >
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

      <View style={styles.row}>
        <Controller
          control={control}
          name="rememberMe"
          render={({ field: { onChange, value } }) => (
            <Checkbox
              checked={value}
              onToggle={() => onChange(!value)}
              label={t('auth.rememberMe')}
            />
          )}
        />

        <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
          <Text variant="bodySmall" color="income" weight="medium">
            {t('auth.forgotPassword')}
          </Text>
        </Pressable>
      </View>

      {formError && (
        <Text variant="bodySmall" color="error" style={styles.formError}>
          {formError}
        </Text>
      )}

      <Button
        title={t('auth.login')}
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        fullWidth
        size="lg"
      />
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  formError: {
    textAlign: 'center',
  },
});
