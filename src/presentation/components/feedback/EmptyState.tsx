import type { ComponentProps } from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useTheme } from '@/presentation/hooks/useTheme';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  icon?: ComponentProps<typeof Ionicons>['name'];
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon = 'file-tray-outline',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconWrapper,
          { backgroundColor: theme.colors.borderLight },
        ]}
      >
        <Ionicons name={icon} size={40} color={theme.colors.textSecondary} />
      </View>
      <Text variant="h3" weight="semiBold" style={styles.title}>
        {title}
      </Text>
      {description && (
        <Text variant="bodySmall" color="secondary" style={styles.description}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} style={styles.button} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginTop: 8,
    minWidth: 160,
  },
});
