import { useEffect, useRef, useState } from 'react';

import { authRepository } from '@/infrastructure/firebase/auth/FirebaseAuthRepository';
import { getFirebaseAuth } from '@/infrastructure/firebase/config';
import { SUPPORTED_CURRENCIES, SupportedCurrency } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';

const isSupportedCurrency = (value: string): value is SupportedCurrency =>
  SUPPORTED_CURRENCIES.includes(value as SupportedCurrency);

export const AuthBootstrap = () => {
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated());
  const hasCheckedRememberMe = useRef(false);
  const { setUser, setLoading, rememberMe } = useAuthStore();

  useEffect(() => {
    if (hydrated) return;
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    const unsubscribe = authRepository.onAuthStateChanged(async (user) => {
      const firebaseUser = getFirebaseAuth().currentUser;

      if (!hasCheckedRememberMe.current) {
        hasCheckedRememberMe.current = true;

        if (user && !rememberMe) {
          await authRepository.logout();
          setUser(null);
          setLoading(false);
          return;
        }
      }

      if (user) {
        setUser(user);
        if (isSupportedCurrency(user.currency)) {
          useSettingsStore.getState().setCurrency(user.currency);
        }
        if (user.theme) {
          useSettingsStore.getState().setThemeMode(user.theme);
        }
      } else if (!firebaseUser) {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [hydrated, rememberMe, setLoading, setUser]);

  return null;
};
