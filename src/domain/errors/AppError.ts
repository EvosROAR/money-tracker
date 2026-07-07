export type AppErrorCode =
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_EMAIL_IN_USE'
  | 'AUTH_WEAK_PASSWORD'
  | 'AUTH_USER_NOT_FOUND'
  | 'AUTH_OPERATION_NOT_ALLOWED'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'UNKNOWN';

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const mapFirebaseError = (error: unknown): AppError => {
  if (error instanceof AppError) return error;

  const code = (error as { code?: string })?.code ?? '';
  const message = (error as { message?: string })?.message ?? '';

  const errorMap: Record<string, { code: AppErrorCode; message: string }> = {
    'auth/invalid-credential': {
      code: 'AUTH_INVALID_CREDENTIALS',
      message: 'Invalid email or password',
    },
    'auth/invalid-credentials': {
      code: 'AUTH_INVALID_CREDENTIALS',
      message: 'Invalid email or password',
    },
    'auth/wrong-password': {
      code: 'AUTH_INVALID_CREDENTIALS',
      message: 'Invalid email or password',
    },
    'auth/email-already-in-use': {
      code: 'AUTH_EMAIL_IN_USE',
      message: 'Email is already registered',
    },
    'auth/weak-password': {
      code: 'AUTH_WEAK_PASSWORD',
      message: 'Password is too weak',
    },
    'auth/user-not-found': {
      code: 'AUTH_USER_NOT_FOUND',
      message: 'User not found',
    },
    'auth/operation-not-allowed': {
      code: 'AUTH_OPERATION_NOT_ALLOWED',
      message: 'Email/Password sign-in is not enabled',
    },
    'auth/api-key-not-valid': {
      code: 'PERMISSION_DENIED',
      message: 'Invalid Firebase API key. Check Google Cloud API key settings.',
    },
    'permission-denied': {
      code: 'PERMISSION_DENIED',
      message: 'Permission denied. Check Firestore security rules.',
    },
  };

  const mapped = errorMap[code];
  if (mapped) {
    return new AppError(mapped.code, mapped.message, error);
  }

  if (message) {
    return new AppError('UNKNOWN', message, error);
  }

  return new AppError('UNKNOWN', 'An unexpected error occurred', error);
};

/** @deprecated Use mapFirebaseError instead */
export const mapFirebaseAuthError = (code: string): AppError => mapFirebaseError({ code });
