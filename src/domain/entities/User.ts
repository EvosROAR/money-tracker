export type ThemePreference = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  currency: string;
  theme: ThemePreference;
  createdAt: Date;
  updatedAt: Date;
}
