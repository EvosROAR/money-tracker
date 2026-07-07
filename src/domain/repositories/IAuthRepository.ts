import { SupportedLanguage } from '@/lib/constants';

import { User } from '../entities/User';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  language?: SupportedLanguage;
}

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<User>;
  register(data: RegisterData): Promise<User>;
  logout(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  reauthenticate(password: string): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
