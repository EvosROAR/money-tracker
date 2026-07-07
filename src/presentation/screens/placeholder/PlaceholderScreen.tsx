import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '@/presentation/components/layout/ScreenContainer';
import { Text } from '@/presentation/components/ui/Text';

interface PlaceholderScreenProps {
  titleKey: string;
  phase?: string;
}

export const PlaceholderScreen = ({ titleKey, phase }: PlaceholderScreenProps) => {
  const { t } = useTranslation();

  return (
    <ScreenContainer>
      <Text variant="h2" weight="bold">
        {t(titleKey)}
      </Text>
      <Text variant="body" color="secondary" style={{ marginTop: 8 }}>
        {phase ?? t('common.comingSoon')}
      </Text>
    </ScreenContainer>
  );
};
