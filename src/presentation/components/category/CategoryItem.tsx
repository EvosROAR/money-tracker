import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Category } from '@/domain/entities/Category';
import { useTheme } from '@/presentation/hooks/useTheme';
import { useCategoryDisplayName } from '@/presentation/hooks/useCategoryDisplayName';
import { Text } from '@/presentation/components/ui/Text';
import { CategoryIcon } from './CategoryIcon';

interface CategoryItemProps {
  category: Category;
  onPress?: () => void;
  onLongPress?: () => void;
  onDelete?: () => void;
}

export const CategoryItem = ({ category, onPress, onLongPress, onDelete }: CategoryItemProps) => {
  const { theme } = useTheme();
  const { resolveCategory } = useCategoryDisplayName();

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        theme.shadows.sm,
      ]}
    >
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [styles.content, { opacity: pressed ? 0.85 : 1 }]}
      >
        <CategoryIcon icon={category.icon} color={category.color} />
        <Text variant="body" weight="medium" style={styles.name}>
          {resolveCategory(category)}
        </Text>
        <Text variant="caption" color="secondary">
          {category.type === 'income' ? '+' : '−'}
        </Text>
      </Pressable>
      {onDelete && (
        <Pressable onPress={onDelete} hitSlop={8} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  name: {
    flex: 1,
  },
  deleteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: 'center',
  },
});
