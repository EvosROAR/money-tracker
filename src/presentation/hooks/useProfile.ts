import { useMutation } from '@tanstack/react-query';

import { UpdateProfileDTO } from '@/domain/repositories/IUserRepository';
import { userRepository } from '@/infrastructure/firebase/firestore/FirestoreUserRepository';
import { SUPPORTED_CURRENCIES, SupportedCurrency } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';

const isSupportedCurrency = (value: string): value is SupportedCurrency =>
  SUPPORTED_CURRENCIES.includes(value as SupportedCurrency);

export const useProfile = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setCurrency = useSettingsStore((s) => s.setCurrency);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileDTO) => userRepository.updateProfile(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      if (isSupportedCurrency(updatedUser.currency)) {
        setCurrency(updatedUser.currency);
      }
    },
  });

  return {
    user,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};
