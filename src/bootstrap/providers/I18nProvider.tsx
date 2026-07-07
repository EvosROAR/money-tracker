import { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { i18n } from '@/lib/i18n';
import { useSettingsStore } from '@/store/settingsStore';

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider = ({ children }: I18nProviderProps) => {
  const language = useSettingsStore((state) => state.language);
  const isHydrated = useSettingsStore((state) => state.isHydrated);

  useEffect(() => {
    if (isHydrated) {
      void i18n.changeLanguage(language);
    }
  }, [language, isHydrated]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
