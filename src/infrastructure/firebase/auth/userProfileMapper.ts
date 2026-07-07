import { Timestamp } from 'firebase/firestore';

import { User } from '@/domain/entities/User';

export interface UserProfileDoc {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  currency: string;
  theme: 'light' | 'dark' | 'system';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const mapProfileToUser = (profile: UserProfileDoc): User => ({
  id: profile.id,
  email: profile.email,
  displayName: profile.displayName,
  photoURL: profile.photoURL,
  currency: profile.currency,
  theme: profile.theme,
  createdAt: profile.createdAt?.toDate?.() ?? new Date(),
  updatedAt: profile.updatedAt?.toDate?.() ?? new Date(),
});
