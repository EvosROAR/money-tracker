import type { ReactNode } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useTheme } from '@/presentation/hooks/useTheme';
import { Text } from '@/presentation/components/ui/Text';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: ReactNode;
}

export const ScreenHeader = ({ title, showBack = false, rightAction }: ScreenHeaderProps) => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={styles.row}>
      {showBack ? (
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
      ) : (
        <View style={styles.back} />
      )}
      <Text variant="h3" weight="bold" style={styles.title}>
        {title}
      </Text>
      <View style={styles.right}>{rightAction ?? <View style={styles.back} />}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
  },
});
