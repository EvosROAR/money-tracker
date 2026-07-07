import { SupportedCurrency } from '@/lib/constants';

import { User, ThemePreference } from '../entities/User';

export interface UpdateProfileDTO {
  displayName?: string;
  currency?: SupportedCurrency;
  theme?: ThemePreference;
}

export interface IUserRepository {
  getProfile(): Promise<User | null>;
  updateProfile(data: UpdateProfileDTO): Promise<User>;
}
