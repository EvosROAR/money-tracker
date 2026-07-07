import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { User } from '@/domain/entities/User';
import { AsyncStorageService } from '@/infrastructure/storage/AsyncStorageService';
import { STORAGE_KEYS } from '@/lib/constants';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberMe: boolean;
  rememberedEmail: string;
  isFreshSession: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setRememberMe: (rememberMe: boolean, email?: string) => void;
  setFreshSession: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      rememberMe: false,
      rememberedEmail: '',
      isFreshSession: false,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      setRememberMe: (rememberMe, email) =>
        set({
          rememberMe,
          rememberedEmail: rememberMe && email ? email : '',
        }),
      setFreshSession: (isFreshSession) => set({ isFreshSession }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: STORAGE_KEYS.REMEMBER_ME,
      storage: createJSONStorage(() => AsyncStorageService),
      partialize: (state) => ({
        rememberMe: state.rememberMe,
        rememberedEmail: state.rememberedEmail,
      }),
    },
  ),
);
