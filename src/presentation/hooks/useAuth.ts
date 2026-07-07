import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ForgotPasswordUseCase,
  LoginUseCase,
  LogoutUseCase,
  ReauthenticateUseCase,
  RegisterUseCase,
} from '@/application/auth/AuthUseCases';
import { AppError } from '@/domain/errors/AppError';
import { LoginCredentials, RegisterData } from '@/domain/repositories/IAuthRepository';
import { authRepository } from '@/infrastructure/firebase/auth/FirebaseAuthRepository';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';

const loginUseCase = new LoginUseCase(authRepository);
const registerUseCase = new RegisterUseCase(authRepository);
const forgotPasswordUseCase = new ForgotPasswordUseCase(authRepository);
const logoutUseCase = new LogoutUseCase(authRepository);
const reauthenticateUseCase = new ReauthenticateUseCase(authRepository);

export const useAuth = () => {
  const { t } = useTranslation();
  const { language } = useSettingsStore();
  const {
    user,
    isAuthenticated,
    isLoading,
    rememberMe,
    rememberedEmail,
    setUser,
    setRememberMe,
    setFreshSession,
    logout: clearAuth,
  } = useAuthStore();

  const getErrorMessage = useCallback(
    (error: unknown): string => {
      if (error instanceof AppError) {
        const key = `auth.errors.${error.code}`;
        const translated = t(key);
        return translated !== key ? translated : error.message;
      }
      return t('common.error');
    },
    [t],
  );

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const userResult = await loginUseCase.execute(credentials);
      setRememberMe(credentials.rememberMe ?? false, credentials.email);
      setFreshSession(true);
      setUser(userResult);
      return userResult;
    },
    [setFreshSession, setRememberMe, setUser],
  );

  const register = useCallback(
    async (data: Omit<RegisterData, 'language'>) => {
      const userResult = await registerUseCase.execute({ ...data, language });
      setFreshSession(true);
      setUser(userResult);
      return userResult;
    },
    [language, setFreshSession, setUser],
  );

  const forgotPassword = useCallback(async (email: string) => {
    await forgotPasswordUseCase.execute(email);
  }, []);

  const logout = useCallback(async () => {
    await logoutUseCase.execute();
    clearAuth();
  }, [clearAuth]);

  const reauthenticate = useCallback(async (password: string) => {
    await reauthenticateUseCase.execute(password);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    rememberMe,
    rememberedEmail,
    login,
    register,
    forgotPassword,
    logout,
    reauthenticate,
    getErrorMessage,
  };
};
