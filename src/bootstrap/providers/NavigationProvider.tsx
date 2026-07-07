import { ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';

import { useTheme } from '@/presentation/hooks/useTheme';

const APP_TITLE = 'PocketLedger';

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const { isDark } = useTheme();

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = APP_TITLE;
    }
  }, []);

  return (
    <NavigationContainer
      theme={isDark ? DarkTheme : DefaultTheme}
      onStateChange={() => {
        if (Platform.OS === 'web') {
          document.title = APP_TITLE;
          (document.activeElement as HTMLElement | null)?.blur?.();
        }
      }}
    >
      {children}
    </NavigationContainer>
  );
};
