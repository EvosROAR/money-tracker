import { Timestamp, doc, getDoc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';

import { User } from '@/domain/entities/User';
import {
  IAuthRepository,
  LoginCredentials,
  RegisterData,
} from '@/domain/repositories/IAuthRepository';
import { AppError, mapFirebaseError } from '@/domain/errors/AppError';
import { getFirebaseAuth, getFirestoreDb } from '@/infrastructure/firebase/config';
import { DEFAULT_CURRENCY } from '@/lib/constants';
import { DEFAULT_CATEGORIES } from '@/lib/constants/defaultCategories';
import { mapProfileToUser, UserProfileDoc } from '@/infrastructure/firebase/auth/userProfileMapper';

const fetchUserProfile = async (uid: string): Promise<User | null> => {
  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return mapProfileToUser(snap.data() as UserProfileDoc);
};

const seedDefaultCategories = async (userId: string, language: 'id' | 'en' = 'id') => {
  const db = getFirestoreDb();
  const batch = writeBatch(db);
  const now = serverTimestamp();

  DEFAULT_CATEGORIES.forEach((category, index) => {
    const categoryRef = doc(db, 'users', userId, 'categories', `default_${index}`);
    batch.set(categoryRef, {
      id: categoryRef.id,
      name: language === 'id' ? category.nameId : category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      isDefault: true,
      sortOrder: category.sortOrder,
      createdAt: now,
      updatedAt: now,
    });
  });

  await batch.commit();
};

const createUserProfile = async (
  firebaseUser: FirebaseUser,
  displayName: string,
  language: 'id' | 'en' = 'id',
): Promise<User> => {
  const db = getFirestoreDb();
  const now = serverTimestamp();

  const profile: Record<string, unknown> = {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName,
    currency: DEFAULT_CURRENCY,
    theme: 'system',
    createdAt: now,
    updatedAt: now,
  };

  if (firebaseUser.photoURL) {
    profile.photoURL = firebaseUser.photoURL;
  }

  await setDoc(doc(db, 'users', firebaseUser.uid), profile);
  await seedDefaultCategories(firebaseUser.uid, language);

  const created = await fetchUserProfile(firebaseUser.uid);
  if (!created) {
    throw new AppError('UNKNOWN', 'Failed to create user profile');
  }
  return created;
};

export class FirebaseAuthRepository implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const auth = getFirebaseAuth();
      const result = await signInWithEmailAndPassword(
        auth,
        credentials.email.trim(),
        credentials.password,
      );

      const profile = await fetchUserProfile(result.user.uid);
      if (!profile) {
        throw new AppError('NOT_FOUND', 'User profile not found');
      }
      return profile;
    } catch (error) {
      throw mapFirebaseError(error);
    }
  }

  async register(data: RegisterData): Promise<User> {
    const auth = getFirebaseAuth();
    let firebaseUser: FirebaseUser | null = null;

    try {
      const language = data.language ?? 'id';
      const result = await createUserWithEmailAndPassword(
        auth,
        data.email.trim(),
        data.password,
      );
      firebaseUser = result.user;

      await updateProfile(result.user, { displayName: data.displayName.trim() });
      return await createUserProfile(result.user, data.displayName.trim(), language);
    } catch (error) {
      if (firebaseUser) {
        try {
          await deleteUser(firebaseUser);
        } catch {
          // Cleanup best-effort if profile creation failed
        }
      }
      throw mapFirebaseError(error);
    }
  }

  async logout(): Promise<void> {
    await signOut(getFirebaseAuth());
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
    } catch (error) {
      throw mapFirebaseError(error);
    }
  }

  async reauthenticate(password: string): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      const firebaseUser = auth.currentUser;
      const email = firebaseUser?.email;

      if (!firebaseUser || !email) {
        throw new AppError('UNAUTHORIZED', 'User not authenticated');
      }

      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(firebaseUser, credential);
    } catch (error) {
      throw mapFirebaseError(error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const auth = getFirebaseAuth();
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    return fetchUserProfile(firebaseUser.uid);
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }
      try {
        const profile = await fetchUserProfile(firebaseUser.uid);
        callback(profile);
      } catch {
        callback(null);
      }
    });
  }
}

export const authRepository = new FirebaseAuthRepository();
