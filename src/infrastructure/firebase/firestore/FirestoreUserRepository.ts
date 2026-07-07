import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile as updateAuthProfile } from 'firebase/auth';

import { User } from '@/domain/entities/User';
import { AppError } from '@/domain/errors/AppError';
import {
  IUserRepository,
  UpdateProfileDTO,
} from '@/domain/repositories/IUserRepository';
import { getFirebaseAuth, getFirestoreDb } from '@/infrastructure/firebase/config';
import { UserProfileDoc, mapProfileToUser } from '@/infrastructure/firebase/auth/userProfileMapper';

const getUserId = (): string => {
  const uid = getFirebaseAuth().currentUser?.uid;
  if (!uid) {
    throw new AppError('AUTH_INVALID_CREDENTIALS', 'Not authenticated');
  }
  return uid;
};

export class FirestoreUserRepository implements IUserRepository {
  async getProfile(): Promise<User | null> {
    const uid = getFirebaseAuth().currentUser?.uid;
    if (!uid) return null;

    const snap = await getDoc(doc(getFirestoreDb(), 'users', uid));
    if (!snap.exists()) return null;
    return mapProfileToUser(snap.data() as UserProfileDoc);
  }

  async updateProfile(data: UpdateProfileDTO): Promise<User> {
    const userId = getUserId();
    const auth = getFirebaseAuth();
    const ref = doc(getFirestoreDb(), 'users', userId);

    const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };

    if (data.displayName !== undefined) {
      updates.displayName = data.displayName.trim();
      if (auth.currentUser) {
        await updateAuthProfile(auth.currentUser, { displayName: data.displayName.trim() });
      }
    }

    if (data.currency !== undefined) updates.currency = data.currency;
    if (data.theme !== undefined) updates.theme = data.theme;

    await updateDoc(ref, updates);

    const updated = await getDoc(ref);
    if (!updated.exists()) {
      throw new AppError('NOT_FOUND', 'User profile not found');
    }

    return mapProfileToUser(updated.data() as UserProfileDoc);
  }
}

export const userRepository = new FirestoreUserRepository();
