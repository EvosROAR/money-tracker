import { ReactNode } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { I18nProvider } from './I18nProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider, useThemeContext } from './ThemeProvider';
import { UiFeedbackHost } from '@/presentation/components/feedback/UiFeedback';

interface AppProvidersProps {
  children: ReactNode;
}

const StatusBarThemed = () => {
  const { isDark } = useThemeContext();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <GestureHandlerRootView style={{ flex: 1, width: '100%', height: '100%' }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, width: '100%' }}>
        <QueryProvider>
          <I18nProvider>
            <ThemeProvider>
              <StatusBarThemed />
              {children}
              <UiFeedbackHost />
            </ThemeProvider>
          </I18nProvider>
        </QueryProvider>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
