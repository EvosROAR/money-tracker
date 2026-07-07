import { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';

import { Category } from '@/domain/entities/Category';
import { TransactionType } from '@/domain/entities/Transaction';
import { useTheme } from '@/presentation/hooks/useTheme';
import { useCategoryDisplayName } from '@/presentation/hooks/useCategoryDisplayName';
import { Text } from '@/presentation/components/ui/Text';
import { CategoryIcon } from './CategoryIcon';

const GRID_GAP = 10;
const MIN_ITEM_WIDTH = 96;

interface CategoryPickerProps {
  categories: Category[];
  selectedId?: string;
  type: TransactionType;
  onSelect: (category: Category) => void;
}

export const CategoryPicker = ({
  categories,
  selectedId,
  type,
  onSelect,
}: CategoryPickerProps) => {
  const { theme } = useTheme();
  const { resolveCategory } = useCategoryDisplayName();
  const filtered = categories.filter((c) => c.type === type);
  const [containerWidth, setContainerWidth] = useState(0);

  const columns = Math.max(2, Math.floor((containerWidth + GRID_GAP) / (MIN_ITEM_WIDTH + GRID_GAP)));
  const itemWidth =
    containerWidth > 0
      ? (containerWidth - GRID_GAP * (columns - 1)) / columns
      : MIN_ITEM_WIDTH;

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.grid} onLayout={onLayout}>
      {filtered.map((category) => {
        const selected = category.id === selectedId;
        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category)}
            style={[
              styles.item,
              {
                width: itemWidth,
                backgroundColor: selected ? `${category.color}22` : theme.colors.surface,
                borderColor: selected ? category.color : theme.colors.border,
              },
            ]}
          >
            <CategoryIcon icon={category.icon} color={category.color} size={20} />
            <Text variant="caption" numberOfLines={2} style={styles.label}>
              {resolveCategory(category)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    width: '100%',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
    minHeight: 76,
  },
  label: {
    textAlign: 'center',
    width: '100%',
  },
});
