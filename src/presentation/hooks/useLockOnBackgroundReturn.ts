import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/** Lock only after app was in background longer than this (ms). */
export const APP_LOCK_GRACE_PERIOD_MS = 60_000;

export const useLockOnBackgroundReturn = (enabled: boolean, onShouldLock: () => void) => {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const backgroundedAt = useRef<number | null>(null);
  const onShouldLockRef = useRef(onShouldLock);

  onShouldLockRef.current = onShouldLock;

  useEffect(() => {
    if (!enabled) {
      backgroundedAt.current = null;
      return;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      const prev = appState.current;

      if (prev === 'active' && (nextState === 'background' || nextState === 'inactive')) {
        backgroundedAt.current = Date.now();
      }

      if (
        (prev === 'background' || prev === 'inactive') &&
        nextState === 'active' &&
        backgroundedAt.current !== null
      ) {
        const elapsed = Date.now() - backgroundedAt.current;

        if (elapsed >= APP_LOCK_GRACE_PERIOD_MS) {
          onShouldLockRef.current();
        }

        backgroundedAt.current = null;
      }

      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [enabled]);
};
