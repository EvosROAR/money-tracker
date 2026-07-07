import { ReactNode, createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useSettingsStore } from '@/store/settingsStore';
import { Theme, ThemeMode, createTheme } from '@/theme';

interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode | 'system';
  isDark: boolean;
  setThemeMode: (mode: ThemeMode | 'system') => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const systemScheme = useColorScheme();
  const { themeMode, setThemeMode } = useSettingsStore();

  const resolvedMode: ThemeMode =
    themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode;

  const theme = useMemo(() => createTheme(resolvedMode), [resolvedMode]);

  const toggleTheme = () => {
    setThemeMode(resolvedMode === 'dark' ? 'light' : 'dark');
  };

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      isDark: resolvedMode === 'dark',
      setThemeMode,
      toggleTheme,
    }),
    [theme, themeMode, resolvedMode, setThemeMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};
