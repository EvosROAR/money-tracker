import { ReactNode } from 'react';
import { Platform } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';

import { useTheme } from '@/presentation/hooks/useTheme';

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const { isDark } = useTheme();

  return (
    <NavigationContainer
      theme={isDark ? DarkTheme : DefaultTheme}
      onStateChange={() => {
        if (Platform.OS === 'web') {
          (document.activeElement as HTMLElement | null)?.blur?.();
        }
      }}
    >
      {children}
    </NavigationContainer>
  );
};
