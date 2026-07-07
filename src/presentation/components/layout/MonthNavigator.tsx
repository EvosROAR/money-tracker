import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { SupportedLanguage } from '@/lib/constants';
import { formatMonthYear } from '@/lib/utils/date';
import { useTheme } from '@/presentation/hooks/useTheme';
import { Text } from '@/presentation/components/ui/Text';

interface MonthNavigatorProps {
  month: Date;
  language: SupportedLanguage;
  onPrev: () => void;
  onNext: () => void;
}

export const MonthNavigator = ({ month, language, onPrev, onNext }: MonthNavigatorProps) => {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      <Pressable onPress={onPrev} hitSlop={8} style={styles.arrow}>
        <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
      </Pressable>
      <Text variant="label" weight="semiBold" style={styles.label}>
        {formatMonthYear(month, language)}
      </Text>
      <Pressable onPress={onNext} hitSlop={8} style={styles.arrow}>
        <Ionicons name="chevron-forward" size={22} color={theme.colors.text} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 12,
  },
  arrow: {
    width: 32,
    alignItems: 'center',
  },
  label: {
    flex: 1,
    textAlign: 'center',
  },
});
